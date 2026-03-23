// src/hedera/hts-client.ts

import { 
  Client, 
  TokenCreateTransaction, 
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey
} from '@hashgraph/sdk';

export interface ApprovalTokenMetadata {
  proposalId: string;
  challengeId: string;
  approvedAt: number;
  expiresAt: number;
  riskLevel: string;
}

export class HTSClient {
  private client: Client;
  private accountId: string;

  constructor(accountId: string, privateKey: string) {
    this.client = Client.forTestnet();
    this.client.setOperator(accountId, privateKey);
    this.accountId = accountId;
  }

  async createApprovalTokenCollection(): Promise<string> {
    const transaction = new TokenCreateTransaction()
      .setTokenName('PolicyGuard Approval')
      .setTokenSymbol('PGA')
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(10000)
      .setTreasuryAccountId(this.accountId)
      .setSupplyKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!));

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    return receipt.tokenId!.toString();
  }

  async mintApprovalToken(
    tokenId: string, 
    metadata: ApprovalTokenMetadata
  ): Promise<{ tokenId: string; serialNumber: number }> {
    const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
    
    const transaction = new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(metadataBytes);

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    return {
      tokenId,
      serialNumber: receipt.serials![0].toNumber()
    };
  }
}
