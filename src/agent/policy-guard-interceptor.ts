// src/agent/policy-guard-interceptor.ts

import { TransactionProposal, PolicyGuardDecision, AgentConfig } from './types';
import { HCSClient } from '../hedera/hcs-client';
import { HTSClient } from '../hedera/hts-client';
import { assessRisk, shouldAutoApprove } from '../utils/risk-assessor';
import { ChallengeStorage } from '../utils/challenge-storage';

/**
 * PolicyGuard Interceptor - Simulates the PolicyGuard challenge/approval flow
 * In production, this would call the actual PolicyGuard API
 */
export class PolicyGuardInterceptor {
  private hcs: HCSClient;
  private hts: HTSClient;
  private auditTopicId: string;
  private autoApproveLowRisk: boolean;
  private pendingChallenges: Map<string, { resolve: Function; reject: Function }> = new Map();

  constructor(config: AgentConfig) {
    this.hcs = new HCSClient(config.hederaAccountId, config.hederaPrivateKey);
    this.hts = new HTSClient(config.hederaAccountId, config.hederaPrivateKey);
    this.auditTopicId = config.auditTopicId;
    this.autoApproveLowRisk = config.autoApproveLowRisk || false;
  }

  async intercept(proposalInput: Omit<TransactionProposal, 'riskLevel' | 'timestamp'>): Promise<PolicyGuardDecision> {
    // 1. Complete proposal with risk assessment
    const proposal: TransactionProposal = {
      ...proposalInput,
      riskLevel: assessRisk(proposalInput),
      timestamp: Date.now()
    };

    // 2. Log proposal creation
    await this.logToHCS({
      type: 'PROPOSAL_CREATED',
      proposal,
      timestamp: Date.now()
    });

    // 3. Check auto-approve
    if (shouldAutoApprove(proposal.riskLevel, this.autoApproveLowRisk)) {
      console.log(`✅ Auto-approved LOW risk transaction: ${proposal.id}`);
      return {
        approved: true,
        autoApproved: true,
        reason: 'Auto-approved: LOW risk'
      };
    }

    // 4. Create PolicyGuard challenge (simulated)
    const challengeId = `pg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save to file storage for CLI persistence
    ChallengeStorage.create(challengeId, proposal);
    
    console.log(`🛡️ PolicyGuard Challenge created: ${challengeId}`);
    console.log(`   Proposal: ${proposal.type} | Amount: ${proposal.amount} | Risk: ${proposal.riskLevel}`);
    console.log(`   Use: /approve ${challengeId} "reason" to approve`);
    console.log(`   Or:  /reject ${challengeId} "reason" to reject`);

    // 5. Wait for manual decision (simulated via method call)
    const decision = await this.waitForDecision(challengeId, proposal);

    // 6. Log decision
    await this.logToHCS({
      type: 'PROPOSAL_DECIDED',
      proposal,
      challengeId,
      decision: decision.approved ? 'APPROVED' : 'REJECTED',
      timestamp: Date.now()
    });

    if (decision.approved) {
      // 7. Mint approval NFT
      try {
        const approvalToken = await this.hts.mintApprovalToken(
          process.env.APPROVAL_TOKEN_ID || '0.0.12345',
          {
            proposalId: proposal.id,
            challengeId,
            approvedAt: Date.now(),
            expiresAt: Date.now() + 3600000,
            riskLevel: proposal.riskLevel
          }
        );
        
        decision.approvalToken = `${approvalToken.tokenId}@${approvalToken.serialNumber}`;
      } catch (e) {
        console.warn('Failed to mint approval token:', e);
      }
    }

    return decision;
  }

  /**
   * External method to approve a challenge (called from API/cli)
   */
  async approveChallenge(challengeId: string, reason?: string): Promise<boolean> {
    // First try in-memory
    const pending = this.pendingChallenges.get(challengeId);
    if (pending) {
      pending.resolve({
        approved: true,
        challengeId,
        reason: reason || 'Approved by user'
      });
      this.pendingChallenges.delete(challengeId);
      return true;
    }
    
    // Fallback to file storage (for CLI persistence)
    return ChallengeStorage.approve(challengeId, reason || 'Approved by user');
  }

  /**
   * External method to reject a challenge
   */
  async rejectChallenge(challengeId: string, reason?: string): Promise<boolean> {
    // First try in-memory
    const pending = this.pendingChallenges.get(challengeId);
    if (pending) {
      pending.resolve({
        approved: false,
        challengeId,
        reason: reason || 'Rejected by user'
      });
      this.pendingChallenges.delete(challengeId);
      return true;
    }
    
    // Fallback to file storage (for CLI persistence)
    return ChallengeStorage.reject(challengeId, reason || 'Rejected by user');
  }

  private async waitForDecision(
    challengeId: string, 
    proposal: TransactionProposal,
    timeoutMs: number = 300000
  ): Promise<PolicyGuardDecision> {
    return new Promise((resolve, reject) => {
      // Store resolver for external approval
      this.pendingChallenges.set(challengeId, { resolve, reject });

      // Poll file storage for CLI decisions
      const checkInterval = setInterval(() => {
        const stored = ChallengeStorage.get(challengeId);
        if (stored && stored.status !== 'PENDING') {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          this.pendingChallenges.delete(challengeId);
          resolve({
            approved: stored.status === 'APPROVED',
            challengeId,
            reason: stored.decision?.reason || `Decision from file storage: ${stored.status}`
          });
        }
      }, 500);

      // Timeout handling
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (this.pendingChallenges.has(challengeId)) {
          this.pendingChallenges.delete(challengeId);
          resolve({
            approved: false,
            challengeId,
            reason: 'Timeout: No decision received'
          });
        }
      }, timeoutMs);
    });
  }

  private async logToHCS(message: any): Promise<void> {
    try {
      const seq = await this.hcs.submitMessage(this.auditTopicId, message);
      console.log(`📝 Audit log: ${seq}`);
    } catch (e) {
      console.error('Failed to log to HCS:', e);
    }
  }

  getPendingChallenges(): Array<{ challengeId: string; proposal: TransactionProposal }> {
    // Return list from file storage for CLI persistence
    return ChallengeStorage.listPending();
  }
}
