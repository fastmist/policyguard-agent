import axios from 'axios';

const API_BASE = process.env.POLICYGUARD_API || 'http://localhost:3000';

/**
 * PolicyGuard OpenClaw Plugin - Human-in-the-loop AI protection
 * 
 * CRITICAL SAFETY RULE: This plugin NEVER auto-approves challenges.
 * It creates challenges and waits for explicit user approval commands.
 */

// Pattern matchers for natural language
const PATTERNS = {
  // Transfer patterns
  transfer: [
    /^(?:send|pay|transfer)\s+(\d+(?:\.\d+)?)\s+hbar\s+(?:to\s+)?(.+)$/i,
    /^(?:send|pay|transfer)\s+(?:to\s+)?(.+?)\s+(\d+(?:\.\d+)?)\s+hbar$/i,
    /^(?:给|转账)\s+(.+?)\s+(\d+(?:\.\d+)?)\s+hbar$/i
  ],
  
  // Approval patterns
  approve: /^approve\s+(pg_[a-z0-9_]+)(?:\s+"([^"]+)")?$/i,
  reject: /^reject\s+(pg_[a-z0-9_]+)(?:\s+"([^"]+)")?$/i,
  
  // Query patterns
  balance: /^(?:show\s+)?balance|查余额|余额$/i,
  pending: /^(?:list\s+)?pending|待审批|待处理$/i,
  audit: /^(?:show\s+)?audit\s*logs|审计日志$/i,
  status: /^(?:challenge\s+)?status\s+(pg_[a-z0-9_]+)$/i,
  
  // Policy configuration patterns (NEW)
  setThreshold: /^(?:set|change)\s+(?:auto-?approve\s+)?threshold\s+(?:to\s+)?(\d+)\s*hbar?$/i,
  setLowRiskMax: /^(?:set|change)\s+low\s+risk\s+(?:threshold|max)\s+(?:to\s+)?(\d+)$/i,
  enableAutoApprove: /^(?:enable|turn\s+on)\s+auto-?approve$/i,
  disableAutoApprove: /^(?:disable|turn\s+off)\s+auto-?approve$/i
};

export class PolicyGuardPlugin {
  private api: axios.AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      timeout: 30000
    });
  }

  /**
   * Parse and handle user input
   * SAFETY: This method NEVER approves challenges automatically
   */
  async handle(input: string, userId: string): Promise<string> {
    const normalized = input.trim().toLowerCase();
    
    // Check for policy configuration commands first
    const policyResult = await this.handlePolicyCommand(input);
    if (policyResult) return policyResult;
    
    // Check for transfer commands
    for (const pattern of PATTERNS.transfer) {
      const match = input.match(pattern);
      if (match) {
        const amount = parseFloat(match[1] || match[2]);
        const recipient = (match[2] || match[1]).trim();
        return this.handleTransfer(recipient, amount);
      }
    }
    
    // Check for approval commands
    const approveMatch = input.match(PATTERNS.approve);
    if (approveMatch) {
      return this.handleApprove(approveMatch[1], approveMatch[2], userId);
    }
    
    // Check for rejection commands
    const rejectMatch = input.match(PATTERNS.reject);
    if (rejectMatch) {
      return this.handleReject(rejectMatch[1], rejectMatch[2]);
    }
    
    // Check for query commands
    if (PATTERNS.balance.test(input)) {
      return this.handleBalance();
    }
    
    if (PATTERNS.pending.test(input)) {
      return this.handlePending();
    }
    
    if (PATTERNS.audit.test(input)) {
      return this.handleAudit();
    }
    
    const statusMatch = input.match(PATTERNS.status);
    if (statusMatch) {
      return this.handleStatus(statusMatch[1]);
    }
    
    return null; // Not a PolicyGuard command
  }

  /**
   * Handle policy configuration commands
   */
  private async handlePolicyCommand(input: string): Promise<string | null> {
    // Set threshold
    const thresholdMatch = input.match(PATTERNS.setThreshold);
    if (thresholdMatch) {
      const threshold = parseInt(thresholdMatch[1]);
      return this.updatePolicy({ lowRiskThreshold: threshold });
    }
    
    // Set low risk max
    const lowRiskMatch = input.match(PATTERNS.setLowRiskMax);
    if (lowRiskMatch) {
      const max = parseInt(lowRiskMatch[1]);
      return this.updatePolicy({ lowRiskThreshold: max });
    }
    
    // Enable auto-approve
    if (PATTERNS.enableAutoApprove.test(input)) {
      return this.updatePolicy({ autoApproveLowRisk: true });
    }
    
    // Disable auto-approve
    if (PATTERNS.disableAutoApprove.test(input)) {
      return this.updatePolicy({ autoApproveLowRisk: false });
    }
    
    return null;
  }

  /**
   * Handle transfer - SAFETY: Only creates challenge, NEVER approves
   */
  private async handleTransfer(recipient: string, amount: number): Promise<string> {
    try {
      // Resolve recipient name to account ID (simplified)
      const recipientMap: Record<string, string> = {
        'bob': '0.0.1001',
        'contractor': '0.0.2002',
        'alice': '0.0.3003'
      };
      const to = recipientMap[recipient.toLowerCase()] || recipient;
      
      const response = await this.api.post('/api/proposal/transfer', { to, amount });
      const result = response.data;
      
      if (result.success && result.txId) {
        // Auto-approved (LOW risk)
        return `✅ Auto-approved: ${amount} HBAR sent to ${recipient}\nTX: ${result.txId}`;
      }
      
      if (result.challengeId) {
        // Challenge created - waiting for approval
        const challengeRes = await this.api.get(`/api/challenge/${result.challengeId}/status`);
        const status = challengeRes.data;
        
        return `⏳ **Challenge Created - Awaiting Your Approval**

| Field | Value |
|-------|-------|
| **Challenge ID** | \`${result.challengeId}\` |
| **Amount** | ${amount} HBAR |
| **To** | ${recipient} (${to}) |
| **Risk** | ${status.status} |
| **Required** | ${status.required} approvals |
| **Progress** | ${status.progress} |

**⚠️ I will NOT approve this. Waiting for your command.**

**To approve:**
\`\`\`
Approve ${result.challengeId}
\`\`\``;
      }
      
      return `❌ Transfer failed: ${result.message}`;
    } catch (error: any) {
      return `❌ Error: ${error.response?.data?.error || error.message}`;
    }
  }

  /**
   * Handle approval - SAFETY: Only executed when user explicitly says "Approve"
   */
  private async handleApprove(challengeId: string, reason: string | undefined, userId: string): Promise<string> {
    try {
      // Get current status first
      const statusRes = await this.api.get(`/api/challenge/${challengeId}/status`);
      const beforeStatus = statusRes.data;
      
      if (!beforeStatus) {
        return `❌ Challenge ${challengeId} not found`;
      }
      
      if (beforeStatus.status !== 'PENDING') {
        return `⚠️ Challenge ${challengeId} is already ${beforeStatus.status}`;
      }
      
      // Assign role based on approver count
      const roles = ['CFO', 'CTO', 'Security Lead'];
      const role = roles[beforeStatus.approvers.length] || 'Admin';
      
      const response = await this.api.post(`/api/challenge/${challengeId}/approve`, {
        role,
        reason: reason || `Approved by ${userId}`
      });
      
      const result = response.data;
      
      if (result.thresholdMet) {
        return `✅ **Approval Recorded & Threshold Met**

| Field | Value |
|-------|-------|
| **Challenge** | ${challengeId} |
| **Your Role** | ${role} |
| **Progress** | ${beforeStatus.progress} → **Threshold Met** |
| **Action** | Transaction executing... |

**HashScan:** https://hashscan.io/testnet/account/0.0.8339596`;
      } else {
        const remaining = beforeStatus.required - beforeStatus.approvers.length - 1;
        return `✅ **Approval Recorded**

| Field | Value |
|-------|-------|
| **Challenge** | ${challengeId} |
| **Your Role** | ${role} |
| **Progress** | ${beforeStatus.progress} → ${beforeStatus.approvers.length + 1}/${beforeStatus.required} |
| **Status** | Need ${remaining} more approval(s) |`;
      }
    } catch (error: any) {
      return `❌ Approval failed: ${error.response?.data?.message || error.message}`;
    }
  }

  /**
   * Handle rejection
   */
  private async handleReject(challengeId: string, reason: string | undefined): Promise<string> {
    try {
      const response = await this.api.post(`/api/challenge/${challengeId}/reject`, {
        reason: reason || 'Rejected by user'
      });
      
      if (response.data.success) {
        return `❌ Challenge ${challengeId} rejected: ${reason || 'No reason provided'}`;
      }
      return `⚠️ Could not reject ${challengeId}`;
    } catch (error: any) {
      return `❌ Rejection failed: ${error.response?.data?.message || error.message}`;
    }
  }

  /**
   * Handle balance query
   */
  private async handleBalance(): Promise<string> {
    try {
      const response = await this.api.get('/api/balance');
      const { hbar, accountId } = response.data;
      return `**Account Balance**\n\n| Account | Balance |\n|---------|---------|\n| ${accountId} | ${hbar.toFixed(2)} HBAR |`;
    } catch (error: any) {
      return `❌ Failed to get balance: ${error.message}`;
    }
  }

  /**
   * Handle pending challenges query
   */
  private async handlePending(): Promise<string> {
    try {
      const response = await this.api.get('/api/challenges/pending');
      const challenges = response.data;
      
      if (challenges.length === 0) {
        return '✅ No pending challenges';
      }
      
      const rows = challenges.map((c: any) => 
        `| ${c.challengeId} | ${c.proposal.amount} HBAR | ${c.proposal.riskLevel} | ${c.progress}/${c.required} |`
      ).join('\n');
      
      return `**Pending Challenges**\n\n| Challenge | Amount | Risk | Progress |\n|-----------|--------|------|----------|\n${rows}`;
    } catch (error: any) {
      return `❌ Failed to get pending: ${error.message}`;
    }
  }

  /**
   * Handle audit logs query
   */
  private async handleAudit(): Promise<string> {
    return `📋 **Audit Logs**\n\nView on HashScan:\nhttps://hashscan.io/testnet/topic/0.0.8342181`;
  }

  /**
   * Handle challenge status query
   */
  private async handleStatus(challengeId: string): Promise<string> {
    try {
      const response = await this.api.get(`/api/challenge/${challengeId}/status`);
      const status = response.data;
      
      if (!status) {
        return `❌ Challenge ${challengeId} not found`;
      }
      
      return `**Challenge Status**\n\n| Field | Value |\n|-------|-------|\n| **ID** | ${challengeId} |\n| **Status** | ${status.status} |\n| **Progress** | ${status.progress} |\n| **Approvers** | ${status.approvers.join(', ') || 'None'} |`;
    } catch (error: any) {
      return `❌ Failed to get status: ${error.message}`;
    }
  }

  /**
   * Update policy configuration
   */
  private async updatePolicy(changes: { lowRiskThreshold?: number; autoApproveLowRisk?: boolean }): Promise<string> {
    // This would call a policy update endpoint
    // For now, return instructions
    if (changes.lowRiskThreshold !== undefined) {
      return `⚙️ **Policy Update Required**

To change auto-approve threshold to ${changes.lowRiskThreshold} HBAR:

1. Edit \`src/utils/risk-assessor.ts\`
2. Update \`RISK_THRESHOLDS.LOW.maxAmount\` to ${changes.lowRiskThreshold}
3. Restart the server

Or run:
\`\`\`bash
cd hedera-apex-hackathon-2026
npm run update-policy -- --threshold=${changes.lowRiskThreshold}
\`\`\``;
    }
    
    if (changes.autoApproveLowRisk !== undefined) {
      const status = changes.autoApproveLowRisk ? 'enabled' : 'disabled';
      return `⚙️ **Policy Update Required**

To ${status} auto-approve:

1. Edit \`.env\`
2. Set \`AUTO_APPROVE_LOW_RISK=${changes.autoApproveLowRisk}\`
3. Restart the server

Or run:
\`\`\`bash
cd hedera-apex-hackathon-2026
npm run update-policy -- --auto-approve=${changes.autoApproveLowRisk}
\`\`\``;
    }
    
    return '⚙️ Unknown policy change';
  }
}

// Export singleton instance
export const policyGuard = new PolicyGuardPlugin();
