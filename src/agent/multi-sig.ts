// src/agent/multi-sig.ts - Multi-signature support for high-risk transactions

import { TransactionProposal } from './types';

export interface MultiSigConfig {
  threshold: number; // Number of approvals required
  approvers: string[]; // List of authorized approver IDs
}

export const MULTI_SIG_REQUIREMENTS: Record<string, MultiSigConfig> = {
  HIGH: {
    threshold: 2,
    approvers: ['admin1', 'admin2', 'admin3']
  },
  CRITICAL: {
    threshold: 3,
    approvers: ['admin1', 'admin2', 'admin3', 'admin4']
  }
};

export class MultiSigManager {
  private approvals: Map<string, Set<string>> = new Map();

  requiresMultiSig(riskLevel: string): boolean {
    return riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  }

  getConfig(riskLevel: string): MultiSigConfig | undefined {
    return MULTI_SIG_REQUIREMENTS[riskLevel];
  }

  addApproval(challengeId: string, approverId: string): boolean {
    if (!this.approvals.has(challengeId)) {
      this.approvals.set(challengeId, new Set());
    }
    this.approvals.get(challengeId)!.add(approverId);
    return this.isFullyApproved(challengeId);
  }

  isFullyApproved(challengeId: string): boolean {
    // This would check against the proposal's risk level
    // For demo, return after 2 approvals
    const count = this.approvals.get(challengeId)?.size || 0;
    return count >= 2;
  }

  getApprovalCount(challengeId: string): number {
    return this.approvals.get(challengeId)?.size || 0;
  }

  getApprovers(challengeId: string): string[] {
    return Array.from(this.approvals.get(challengeId) || []);
  }
}
