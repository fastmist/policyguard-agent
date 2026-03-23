// src/utils/risk-assessor.ts

import { TransactionProposal } from '../agent/types';

export const RISK_THRESHOLDS = {
  LOW: { maxAmount: 10, autoApprove: true },
  MEDIUM: { maxAmount: 100, autoApprove: false },
  HIGH: { maxAmount: 1000, autoApprove: false },
  CRITICAL: { maxAmount: Infinity, autoApprove: false, timeLock: 24 * 60 * 60 * 1000 }
};

export function assessRisk(proposal: Partial<TransactionProposal> & { amount?: number; type: string }): TransactionProposal['riskLevel'] {
  const amount = proposal.amount || 0;
  
  // Critical operations
  if (proposal.type === 'BURN') return 'CRITICAL';
  if (proposal.type === 'APPROVE' && amount > 1000) return 'CRITICAL';
  
  // Amount-based risk
  if (amount > 1000) return 'CRITICAL';
  if (amount > 100) return 'HIGH';
  if (amount > 10) return 'MEDIUM';
  
  return 'LOW';
}

export function shouldAutoApprove(riskLevel: TransactionProposal['riskLevel'], configEnabled: boolean): boolean {
  if (!configEnabled) return false;
  return riskLevel === 'LOW' && RISK_THRESHOLDS.LOW.autoApprove;
}

export function getRiskColor(riskLevel: TransactionProposal['riskLevel']): string {
  const colors = {
    LOW: '🟢',
    MEDIUM: '🟡',
    HIGH: '🟠',
    CRITICAL: '🔴'
  };
  return colors[riskLevel];
}
