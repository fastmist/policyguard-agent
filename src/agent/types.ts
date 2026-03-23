// src/agent/types.ts

export interface TransactionProposal {
  id: string;
  type: 'TRANSFER' | 'MINT' | 'BURN' | 'CALL_CONTRACT' | 'APPROVE';
  amount?: number;
  tokenId?: string;
  to?: string;
  from?: string;
  data?: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  description: string;
}

export interface PolicyGuardDecision {
  approved: boolean;
  challengeId?: string;
  approvalToken?: string;
  reason?: string;
  autoApproved?: boolean;
}

export interface AuditLogEntry {
  type: 'PROPOSAL_CREATED' | 'PROPOSAL_DECIDED' | 'TRANSACTION_EXECUTED' | 'ERROR';
  proposal?: TransactionProposal;
  challengeId?: string;
  decision?: 'APPROVED' | 'REJECTED';
  txId?: string;
  error?: string;
  timestamp: number;
}

export interface AgentConfig {
  hederaAccountId: string;
  hederaPrivateKey: string;
  policyGuardEndpoint: string;
  auditTopicId: string;
  autoApproveLowRisk?: boolean;
}

export interface TransferParams {
  to: string;
  amount: number;
  tokenId?: string;
}

export interface TransferResult {
  success: boolean;
  txId?: string;
  message: string;
  challengeId?: string;
  approvalToken?: string;
}
