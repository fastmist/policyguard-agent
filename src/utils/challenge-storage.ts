import * as fs from 'fs';
import * as path from 'path';

export interface Approver {
  role: string;
  approvedAt: number;
  reason: string;
}

export interface MultiSigChallenge {
  proposal: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approvers: Approver[];
  requiredApprovals: number;
  createdAt: number;
  approvedAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

interface ChallengeStore {
  [challengeId: string]: MultiSigChallenge;
}

const STORE_FILE = path.join(process.cwd(), '.policyguard-challenges.json');

// Multi-sig configuration based on risk level
export const MULTISIG_CONFIG = {
  LOW: { required: 1, roles: ['any'] },
  MEDIUM: { required: 1, roles: ['CFO', 'CTO', 'Security Lead', 'Admin'] },
  HIGH: { required: 2, roles: ['CFO', 'CTO', 'Security Lead'] },
  CRITICAL: { required: 3, roles: ['CFO', 'CTO', 'Security Lead', 'CEO'] }
};

export class ChallengeStorage {
  private static load(): ChallengeStore {
    try {
      if (fs.existsSync(STORE_FILE)) {
        return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load challenge store:', e);
    }
    return {};
  }

  private static save(store: ChallengeStore): void {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    } catch (e) {
      console.error('Failed to save challenge store:', e);
    }
  }

  static create(challengeId: string, proposal: any, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'): void {
    const store = this.load();
    const config = MULTISIG_CONFIG[riskLevel];
    
    store[challengeId] = {
      proposal,
      status: 'PENDING',
      riskLevel,
      approvers: [],
      requiredApprovals: config.required,
      createdAt: Date.now()
    };
    this.save(store);
    
    console.log(`🛡️ Challenge ${challengeId} created`);
    console.log(`   Risk: ${riskLevel} | Required: ${config.required} of ${config.roles.length} approvers`);
  }

  static get(challengeId: string): MultiSigChallenge | null {
    const store = this.load();
    return store[challengeId] || null;
  }

  static addApproval(challengeId: string, role: string, reason: string): { success: boolean; thresholdMet: boolean; message: string } {
    const store = this.load();
    const challenge = store[challengeId];
    
    if (!challenge) {
      return { success: false, thresholdMet: false, message: 'Challenge not found' };
    }
    
    if (challenge.status === 'REJECTED') {
      return { success: false, thresholdMet: false, message: 'Challenge already rejected' };
    }
    
    if (challenge.status === 'APPROVED') {
      return { success: false, thresholdMet: false, message: 'Challenge already approved' };
    }

    // Check if this role already approved
    if (challenge.approvers.some(a => a.role === role)) {
      return { success: false, thresholdMet: false, message: `${role} already approved` };
    }

    // Add approver
    challenge.approvers.push({
      role,
      approvedAt: Date.now(),
      reason
    });

    console.log(`✅ ${role} approved challenge ${challengeId}`);
    console.log(`   Approvals: ${challenge.approvers.length} of ${challenge.requiredApprovals}`);

    // Check if threshold met
    if (challenge.approvers.length >= challenge.requiredApprovals) {
      challenge.status = 'APPROVED';
      challenge.approvedAt = Date.now();
      this.save(store);
      return { 
        success: true, 
        thresholdMet: true, 
        message: `Threshold met! ${challenge.approvers.length} approvals received. Executing transaction...` 
      };
    }

    this.save(store);
    return { 
      success: true, 
      thresholdMet: false, 
      message: `Approval recorded. Need ${challenge.requiredApprovals - challenge.approvers.length} more approval(s).` 
    };
  }

  static reject(challengeId: string, reason: string): boolean {
    const store = this.load();
    const challenge = store[challengeId];
    
    if (challenge && challenge.status === 'PENDING') {
      challenge.status = 'REJECTED';
      challenge.rejectedAt = Date.now();
      challenge.rejectionReason = reason;
      this.save(store);
      return true;
    }
    return false;
  }

  static listPending(): Array<{ challengeId: string; proposal: any; approvers: string[]; required: number }> {
    const store = this.load();
    return Object.entries(store)
      .filter(([_, data]) => data.status === 'PENDING')
      .map(([id, data]) => ({ 
        challengeId: id, 
        proposal: data.proposal,
        approvers: data.approvers.map(a => a.role),
        required: data.requiredApprovals
      }));
  }

  static getStatus(challengeId: string): { status: string; approvers: string[]; required: number; progress: string } | null {
    const challenge = this.get(challengeId);
    if (!challenge) return null;
    
    return {
      status: challenge.status,
      approvers: challenge.approvers.map(a => a.role),
      required: challenge.requiredApprovals,
      progress: `${challenge.approvers.length}/${challenge.requiredApprovals}`
    };
  }

  static cleanup(): void {
    const store = this.load();
    const now = Date.now();
    const ONE_HOUR = 3600000;
    
    Object.keys(store).forEach(id => {
      if (now - store[id].createdAt > ONE_HOUR) {
        delete store[id];
      }
    });
    
    this.save(store);
  }
}
