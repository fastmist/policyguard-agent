import { TransactionProposal, PolicyGuardDecision, AgentConfig } from './types';
import { HCSClient } from '../hedera/hcs-client';
import { HTSClient } from '../hedera/hts-client';
import { assessRisk, shouldAutoApprove } from '../utils/risk-assessor';
import { ChallengeStorage, MULTISIG_CONFIG } from '../utils/challenge-storage';

/**
 * PolicyGuard Interceptor with Multi-Signature Support
 * Handles risk-based approval workflows with configurable thresholds
 */
export class PolicyGuardInterceptor {
  private hcs: HCSClient;
  private hts: HTSClient;
  private auditTopicId: string;
  private autoApproveLowRisk: boolean;
  private pendingChallenges: Map<string, { resolve: Function; reject: Function; proposal: TransactionProposal }> = new Map();

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

    // 4. Create PolicyGuard challenge with multi-sig
    const challengeId = `pg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save to file storage with multi-sig config
    ChallengeStorage.create(challengeId, proposal, proposal.riskLevel);
    
    const config = MULTISIG_CONFIG[proposal.riskLevel];
    
    console.log(`🛡️ PolicyGuard Challenge created: ${challengeId}`);
    console.log(`   Proposal: ${proposal.type} | Amount: ${proposal.amount} HBAR | Risk: ${proposal.riskLevel}`);
    console.log(`   Multi-sig: ${config.required} of ${config.roles.length} approvers required`);
    console.log(`   Eligible roles: ${config.roles.join(', ')}`);
    console.log(`   Use: /approve ${challengeId} <role> "reason"`);
    console.log(`   Or:  /reject ${challengeId} "reason"`);

    // 5. Wait for multi-sig approval threshold
    const decision = await this.waitForMultiSigApproval(challengeId, proposal);

    // 6. Log decision
    await this.logToHCS({
      type: 'PROPOSAL_DECIDED',
      proposal,
      challengeId,
      decision: decision.approved ? 'APPROVED' : 'REJECTED',
      approvers: decision.approvers,
      timestamp: Date.now()
    });

    return decision;
  }

  /**
   * Add approval to a challenge (supports multi-sig)
   */
  async approveChallenge(challengeId: string, role: string, reason?: string): Promise<{ success: boolean; message: string; thresholdMet?: boolean }> {
    // Add approval to storage
    const result = ChallengeStorage.addApproval(challengeId, role, reason || 'Approved');
    
    if (result.thresholdMet) {
      // Resolve the pending promise if threshold met
      const pending = this.pendingChallenges.get(challengeId);
      if (pending) {
        const challenge = ChallengeStorage.get(challengeId);
        pending.resolve({
          approved: true,
          challengeId,
          reason: `Multi-sig threshold met: ${challenge?.approvers.length} approvals`,
          approvers: challenge?.approvers.map(a => a.role)
        });
        this.pendingChallenges.delete(challengeId);
      }
    }
    
    return result;
  }

  /**
   * Reject a challenge
   */
  async rejectChallenge(challengeId: string, reason?: string): Promise<boolean> {
    // First check in-memory
    const pending = this.pendingChallenges.get(challengeId);
    
    const rejected = ChallengeStorage.reject(challengeId, reason || 'Rejected by user');
    
    if (rejected && pending) {
      pending.resolve({
        approved: false,
        challengeId,
        reason: reason || 'Rejected by user'
      });
      this.pendingChallenges.delete(challengeId);
      return true;
    }
    
    return rejected;
  }

  /**
   * Get challenge status with multi-sig progress
   */
  getChallengeStatus(challengeId: string): { status: string; approvers: string[]; required: number; progress: string } | null {
    return ChallengeStorage.getStatus(challengeId);
  }

  private async waitForMultiSigApproval(
    challengeId: string, 
    proposal: TransactionProposal,
    timeoutMs: number = 300000
  ): Promise<PolicyGuardDecision> {
    return new Promise((resolve, reject) => {
      // Store resolver for external approval
      this.pendingChallenges.set(challengeId, { resolve, reject, proposal });

      // Poll file storage for approval updates
      const checkInterval = setInterval(() => {
        const stored = ChallengeStorage.get(challengeId);
        if (stored) {
          if (stored.status === 'APPROVED') {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            this.pendingChallenges.delete(challengeId);
            resolve({
              approved: true,
              challengeId,
              reason: `Multi-sig approved by: ${stored.approvers.map(a => a.role).join(', ')}`,
              approvers: stored.approvers.map(a => a.role)
            });
          } else if (stored.status === 'REJECTED') {
            clearInterval(checkInterval);
            clearTimeout(timeout);
            this.pendingChallenges.delete(challengeId);
            resolve({
              approved: false,
              challengeId,
              reason: stored.rejectionReason || 'Rejected'
            });
          }
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

  getPendingChallenges(): Array<{ challengeId: string; proposal: TransactionProposal; approvers: string[]; required: number }> {
    return ChallengeStorage.listPending() as any;
  }
}
