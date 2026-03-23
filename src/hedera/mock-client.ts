// src/hedera/mock-client.ts - 用于演示的模拟客户端
// 无需真实 Hedera 账户即可运行完整流程

import { TransactionProposal, PolicyGuardDecision } from '../agent/types';

export class MockHederaClient {
  private balance: number = 1000;
  private transactions: any[] = [];

  async getBalance() {
    return {
      accountId: '0.0.12345 (DEMO MODE)',
      hbar: this.balance,
      timestamp: new Date().toISOString()
    };
  }

  async submitTransaction(proposal: TransactionProposal): Promise<any> {
    // 模拟交易提交
    const txId = `0.0.${Date.now()}`;
    const amount = proposal.amount || 0;
    this.balance -= amount;
    
    this.transactions.push({
      txId,
      ...proposal,
      status: 'SUCCESS',
      timestamp: Date.now()
    });

    return {
      txId,
      status: 'SUCCESS',
      message: `[DEMO] Transaction ${proposal.id} executed successfully`,
      receipt: {
        status: 'SUCCESS',
        transactionId: txId
      }
    };
  }

  async queryAuditLogs(limit: number = 50): Promise<any[]> {
    return this.transactions.slice(-limit).map(tx => ({
      type: 'TRANSACTION_EXECUTED',
      transaction: tx,
      timestamp: tx.timestamp
    }));
  }
}

// Mock HCS Client
export class MockHCSClient {
  private logs: any[] = [];
  private topicId: string = '0.0.DEMO';

  async submitMessage(message: any): Promise<string> {
    const sequence = this.logs.length + 1;
    this.logs.push({
      sequence,
      message,
      timestamp: Date.now()
    });
    return `demo-seq-${sequence}`;
  }

  async queryMessages(limit: number = 50): Promise<any[]> {
    return this.logs.slice(-limit);
  }
}

// Mock HTS Client
export class MockHTSClient {
  async mintApprovalNFT(metadata: any): Promise<any> {
    return {
      tokenId: '0.0.DEMO',
      serialNumber: Date.now(),
      metadata,
      status: 'SUCCESS'
    };
  }
}
