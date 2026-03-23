// src/hedera/index.ts

import { Client, TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk';
import { HCSClient } from './hcs-client';
import { HTSClient } from './hts-client';

export class HederaService {
  public client: Client;
  public hcs: HCSClient;
  public hts: HTSClient;
  private accountId: string;

  constructor(accountId: string, privateKey: string) {
    this.accountId = accountId;
    this.client = Client.forTestnet();
    this.client.setOperator(accountId, privateKey);
    
    this.hcs = new HCSClient(accountId, privateKey);
    this.hts = new HTSClient(accountId, privateKey);
  }

  async transferHBAR(to: string, amount: number): Promise<string> {
    const transaction = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(this.accountId), Hbar.fromTinybars(-amount * 100_000_000))
      .addHbarTransfer(AccountId.fromString(to), Hbar.fromTinybars(amount * 100_000_000));

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    return response.transactionId.toString();
  }

  async getBalance(): Promise<{ hbar: number; accountId: string }> {
    const { AccountBalanceQuery } = await import('@hashgraph/sdk');
    
    const query = new AccountBalanceQuery().setAccountId(this.accountId);
    const balance = await query.execute(this.client);
    
    return {
      hbar: balance.hbars.toTinybars().toNumber() / 100_000_000,
      accountId: this.accountId
    };
  }
}

export { HCSClient, HTSClient };
