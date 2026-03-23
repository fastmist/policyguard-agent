// src/hedera/hcs-client.ts

import { Client, TopicMessageSubmitTransaction, TopicMessageQuery } from '@hashgraph/sdk';
import { AuditLogEntry } from '../agent/types';

export class HCSClient {
  private client: Client;

  constructor(accountId: string, privateKey: string) {
    this.client = Client.forTestnet();
    this.client.setOperator(accountId, privateKey);
  }

  async submitMessage(topicId: string, message: any): Promise<string> {
    const messageBytes = new TextEncoder().encode(JSON.stringify(message));
    
    const transaction = new TopicMessageSubmitTransaction({
      topicId,
      message: messageBytes
    });

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    return `${topicId}@${response.transactionId}`;
  }

  async createAuditTopic(): Promise<string> {
    const { TopicCreateTransaction } = await import('@hashgraph/sdk');
    
    const transaction = new TopicCreateTransaction({
      memo: 'PolicyGuard Agent Audit Log'
    });

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    return receipt.topicId!.toString();
  }

  async getAuditLogs(topicId: string, limit: number = 100): Promise<AuditLogEntry[]> {
    return new Promise((resolve, reject) => {
      const logs: AuditLogEntry[] = [];
      
      new TopicMessageQuery()
        .setTopicId(topicId)
        .setLimit(limit)
        .subscribe(
          this.client,
          (message) => {
            try {
              const decoded = new TextDecoder().decode(message.contents);
              logs.push(JSON.parse(decoded));
            } catch (e) {
              console.error('Failed to decode message:', e);
            }
          },
          (error) => {
            reject(error);
          }
        );

      // Return collected logs after short delay
      setTimeout(() => resolve(logs.reverse()), 2000);
    });
  }
}
