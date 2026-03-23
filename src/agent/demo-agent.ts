// src/agent/demo-agent.ts - Demo mode agent (no real Hedera account needed)

import { TransactionProposal, PolicyGuardDecision, AgentConfig } from './types';
import { MockHederaClient, MockHCSClient, MockHTSClient } from '../hedera/mock-client';
import { assessRisk, shouldAutoApprove } from '../utils/risk-assessor';

export class DemoPolicyGuardedAgent {
  private mockClient: MockHederaClient;
  private mockHCS: MockHCSClient;
  private mockHTS: MockHTSClient;
  private autoApproveLowRisk: boolean;
  private pendingChallenges: Map<string, any> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    this.mockClient = new MockHederaClient();
    this.mockHCS = new MockHCSClient();
    this.mockHTS = new MockHTSClient();
    this.autoApproveLowRisk = config?.autoApproveLowRisk || false;
  }

  async getBalance() {
    return this.mockClient.getBalance();
  }

  async transfer(params: { to: string; amount: number; tokenId?: string }) {
    const proposalData = {
      id: `prop_${Date.now()}`,
      type: 'TRANSFER' as const,
      from: '0.0.12345 (DEMO)',
      to: params.to,
      amount: params.amount,
      tokenId: params.tokenId || 'HBAR',
      timestamp: Date.now(),
      description: `Transfer ${params.amount} ${params.tokenId || 'HBAR'} to ${params.to}`
    };
    
    const proposal: TransactionProposal = {
      ...proposalData,
      riskLevel: assessRisk(proposalData)
    };

    // Log to mock HCS
    await this.mockHCS.submitMessage({
      type: 'PROPOSAL_CREATED',
      proposal,
      timestamp: Date.now()
    });

    // Check auto-approve
    if (shouldAutoApprove(proposal.riskLevel, this.autoApproveLowRisk)) {
      const result = await this.executeTransaction(proposal);
      return {
        success: true,
        proposalId: proposal.id,
        ...result,
        message: `[DEMO] Auto-approved and executed: ${result.txId}`
      };
    }

    // Create challenge
    const challengeId = `pg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    this.pendingChallenges.set(challengeId, {
      proposal,
      status: 'PENDING'
    });

    return {
      success: false,
      pending: true,
      challengeId,
      proposalId: proposal.id,
      riskLevel: proposal.riskLevel,
      message: `[DEMO] Transaction ${proposal.id} requires PolicyGuard approval. Challenge: ${challengeId}`
    };
  }

  async approveChallenge(challengeId: string, reason?: string): Promise<boolean> {
    const challenge = this.pendingChallenges.get(challengeId);
    if (!challenge || challenge.status !== 'PENDING') return false;

    challenge.status = 'APPROVED';
    
    // Log approval
    await this.mockHCS.submitMessage({
      type: 'CHALLENGE_APPROVED',
      challengeId,
      reason,
      timestamp: Date.now()
    });

    // Execute transaction
    await this.executeTransaction(challenge.proposal);

    // Mint approval NFT
    await this.mockHTS.mintApprovalNFT({
      proposalId: challenge.proposal.id,
      challengeId,
      approvedAt: Date.now()
    });

    this.pendingChallenges.delete(challengeId);
    return true;
  }

  async rejectChallenge(challengeId: string, reason?: string): Promise<boolean> {
    const challenge = this.pendingChallenges.get(challengeId);
    if (!challenge || challenge.status !== 'PENDING') return false;

    challenge.status = 'REJECTED';
    
    await this.mockHCS.submitMessage({
      type: 'CHALLENGE_REJECTED',
      challengeId,
      reason,
      timestamp: Date.now()
    });

    this.pendingChallenges.delete(challengeId);
    return true;
  }

  getPendingChallenges() {
    return Array.from(this.pendingChallenges.entries()).map(([id, data]) => ({
      challengeId: id,
      ...data.proposal,
      status: data.status
    }));
  }

  async getAuditLogs(limit?: number) {
    return this.mockHCS.queryMessages(limit);
  }

  private async executeTransaction(proposal: TransactionProposal) {
    const result = await this.mockClient.submitTransaction(proposal);
    
    await this.mockHCS.submitMessage({
      type: 'TRANSACTION_EXECUTED',
      proposal,
      result,
      timestamp: Date.now()
    });

    return result;
  }
}
