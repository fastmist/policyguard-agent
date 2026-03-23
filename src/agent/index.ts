// src/agent/index.ts

import { HederaService } from '../hedera';
import { PolicyGuardInterceptor } from './policy-guard-interceptor';
import { 
  AgentConfig, 
  TransferParams, 
  TransferResult, 
  TransactionProposal 
} from './types';

export class PolicyGuardedAgent {
  private hedera: HederaService;
  private interceptor: PolicyGuardInterceptor;

  constructor(config: AgentConfig) {
    this.hedera = new HederaService(
      config.hederaAccountId,
      config.hederaPrivateKey
    );
    this.interceptor = new PolicyGuardInterceptor(config);
  }

  /**
   * Transfer HBAR (protected by PolicyGuard)
   */
  async transfer(params: TransferParams): Promise<TransferResult> {
    // 1. Create transaction proposal
    const proposal: Omit<TransactionProposal, 'riskLevel' | 'timestamp'> = {
      id: `tx_${Date.now()}`,
      type: 'TRANSFER',
      to: params.to,
      amount: params.amount,
      tokenId: params.tokenId,
      from: this.hedera.client.operatorAccountId?.toString(),
      description: `Transfer ${params.amount} ${params.tokenId || 'HBAR'} to ${params.to}`
    };

    // 2. Intercept with PolicyGuard
    console.log(`\n🤖 Agent: Processing transfer request...`);
    const decision = await this.interceptor.intercept(proposal);

    if (!decision.approved) {
      return {
        success: false,
        message: `❌ Transaction rejected by PolicyGuard: ${decision.reason}`,
        challengeId: decision.challengeId
      };
    }

    // 3. Execute transaction on Hedera
    try {
      console.log(`\n⛓️  Executing on Hedera...`);
      
      const txId = await this.hedera.transferHBAR(params.to, params.amount);

      // 4. Log execution
      await this.hedera.hcs.submitMessage(this.interceptor['auditTopicId'], {
        type: 'TRANSACTION_EXECUTED',
        proposal,
        txId,
        timestamp: Date.now()
      });

      return {
        success: true,
        txId,
        challengeId: decision.challengeId,
        approvalToken: decision.approvalToken,
        message: `✅ Transaction executed successfully!\n` +
                 `   TX ID: ${txId}\n` +
                 `   PolicyGuard: ${decision.challengeId || 'auto-approved'}\n` +
                 `   Approval NFT: ${decision.approvalToken || 'N/A'}`
      };
    } catch (error: any) {
      // Log error
      await this.hedera.hcs.submitMessage(this.interceptor['auditTopicId'], {
        type: 'ERROR',
        proposal,
        error: error.message,
        timestamp: Date.now()
      });

      return {
        success: false,
        message: `❌ Transaction execution failed: ${error.message}`,
        challengeId: decision.challengeId
      };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ hbar: number; accountId: string }> {
    return this.hedera.getBalance();
  }

  /**
   * Get audit logs from HCS
   */
  async getAuditLogs(limit: number = 50): Promise<any[]> {
    return this.hedera.hcs.getAuditLogs(this.interceptor['auditTopicId'], limit);
  }

  /**
   * Approve a pending challenge (called from external API/cli)
   */
  async approveChallenge(challengeId: string, reason?: string): Promise<boolean> {
    return this.interceptor.approveChallenge(challengeId, reason);
  }

  /**
   * Reject a pending challenge
   */
  async rejectChallenge(challengeId: string, reason?: string): Promise<boolean> {
    return this.interceptor.rejectChallenge(challengeId, reason);
  }

  /**
   * Get pending challenges for UI
   */
  getPendingChallenges() {
    return this.interceptor.getPendingChallenges();
  }

  /**
   * Close connections and cleanup
   */
  close(): void {
    // Close Hedera client connection
    this.hedera.client.close();
  }
}

export * from './types';
export { PolicyGuardInterceptor };
