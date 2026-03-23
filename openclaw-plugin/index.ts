/**
 * PolicyGuard OpenClaw Plugin
 * Natural language interface for PolicyGuard Agent
 */

import { Client, AccountBalanceQuery } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

// Simple natural language parser
interface ParsedCommand {
  type: 'transfer' | 'approve' | 'reject' | 'balance' | 'pending' | 'audit' | 'unknown';
  amount?: number;
  recipient?: string;
  challengeId?: string;
  reason?: string;
}

export class PolicyGuardPlugin {
  private baseUrl: string;
  private client: any;
  private accountId: string;

  constructor() {
    this.baseUrl = process.env.POLICYGUARD_API_URL || 'http://localhost:3000/api';
    this.accountId = process.env.HEDERA_ACCOUNT_ID || '';
  }

  /**
   * Parse natural language command
   */
  parseCommand(input: string): ParsedCommand {
    const lower = input.toLowerCase().trim();

    // Transfer patterns
    const transferPatterns = [
      /pay\s+(\w+)\s+(\d+(?:\.\d+)?)\s*hbar/i,
      /send\s+(\d+(?:\.\d+)?)\s*hbar\s+to\s+(\w+)/i,
      /transfer\s+(\d+(?:\.\d+)?)\s*hbar\s+to\s+(\w+)/i,
      /给\s*(\w+)\s*转\s*(\d+(?:\.\d+)?)\s*hbar/i,
    ];

    for (const pattern of transferPatterns) {
      const match = input.match(pattern);
      if (match) {
        // Handle different pattern orders
        if (pattern.source.includes('pay')) {
          return {
            type: 'transfer',
            recipient: match[1],
            amount: parseFloat(match[2])
          };
        } else {
          return {
            type: 'transfer',
            amount: parseFloat(match[1]),
            recipient: match[2]
          };
        }
      }
    }

    // Approve pattern
    const approveMatch = input.match(/approve\s+(CH-[\w-]+)/i);
    if (approveMatch) {
      return {
        type: 'approve',
        challengeId: approveMatch[1]
      };
    }

    // Reject pattern
    const rejectMatch = input.match(/reject\s+(CH-[\w-]+)/i);
    if (rejectMatch) {
      return {
        type: 'reject',
        challengeId: rejectMatch[1]
      };
    }

    // Balance patterns
    if (/balance|余额|查余额|show.*balance/i.test(lower)) {
      return { type: 'balance' };
    }

    // Pending patterns
    if (/pending|待审批|list.*pending|show.*pending/i.test(lower)) {
      return { type: 'pending' };
    }

    // Audit patterns
    if (/audit|审计|日志|logs/i.test(lower)) {
      return { type: 'audit' };
    }

    return { type: 'unknown' };
  }

  /**
   * Execute parsed command
   */
  async execute(command: ParsedCommand, reason?: string): Promise<string> {
    try {
      switch (command.type) {
        case 'transfer':
          return await this.transfer(command.amount!, command.recipient!);
        
        case 'approve':
          return await this.approve(command.challengeId!, reason);
        
        case 'reject':
          return await this.reject(command.challengeId!, reason);
        
        case 'balance':
          return await this.getBalance();
        
        case 'pending':
          return await this.getPending();
        
        case 'audit':
          return await this.getAuditLogs();
        
        default:
          return '❓ Unknown command. Try:\n' +
                 '  • "Pay Bob 5 HBAR"\n' +
                 '  • "Approve CH-001"\n' +
                 '  • "Show balance"';
      }
    } catch (error: any) {
      return `❌ Error: ${error.message}`;
    }
  }

  /**
   * Transfer HBAR
   */
  private async transfer(amount: number, recipient: string): Promise<string> {
    // Map names to account IDs (simplified)
    const recipientMap: Record<string, string> = {
      'bob': '0.0.1001',
      'alice': '0.0.1002',
      'contractor': '0.0.2002',
      'vendor': '0.0.3003',
    };

    const to = recipientMap[recipient.toLowerCase()] || recipient;

    const response = await fetch(`${this.baseUrl}/proposal/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, amount })
    });

    const result = await response.json();

    if (result.autoApproved) {
      return `✅ **Auto-approved!**\n` +
             `Amount: ${amount} HBAR → ${recipient}\n` +
             `Risk: LOW | TX: ${result.txId || 'Pending'}`;
    }

    if (result.challengeId) {
      return `⚠️ **Challenge Created**\n` +
             `ID: ${result.challengeId}\n` +
             `Amount: ${amount} HBAR → ${recipient}\n` +
             `Risk: ${result.riskLevel || 'MEDIUM'}\n` +
             `Status: PENDING | Use: /approve ${result.challengeId}`;
    }

    return `📤 Transaction submitted\n${JSON.stringify(result, null, 2)}`;
  }

  /**
   * Approve challenge
   */
  private async approve(challengeId: string, reason?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/challenge/${challengeId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || 'Approved via OpenClaw' })
    });

    const result = await response.json();

    if (result.success) {
      return `✅ **Challenge Approved!**\n` +
             `ID: ${challengeId}\n` +
             `Transaction executing...`;
    }

    return `❌ Approval failed: ${result.message}`;
  }

  /**
   * Reject challenge
   */
  private async reject(challengeId: string, reason?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/challenge/${challengeId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason || 'Rejected via OpenClaw' })
    });

    const result = await response.json();

    if (result.success) {
      return `❌ **Challenge Rejected**\n` +
             `ID: ${challengeId}\n` +
             `Transaction blocked.`;
    }

    return `❌ Rejection failed: ${result.message}`;
  }

  /**
   * Get balance
   */
  private async getBalance(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/balance`);
    const result = await response.json();

    return `💰 **Account Balance**\n` +
           `HBAR: ${result.hbar || 'Unknown'}\n` +
           `Account: ${this.accountId}`;
  }

  /**
   * Get pending challenges
   */
  private async getPending(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/challenges/pending`);
    const challenges = await response.json();

    if (!challenges || challenges.length === 0) {
      return `✅ No pending challenges. All caught up!`;
    }

    let output = `⏳ **Pending Challenges (${challenges.length})**\n\n`;
    
    for (const ch of challenges.slice(0, 5)) {
      output += `• ${ch.id}: ${ch.amount} HBAR → ${ch.to} [${ch.risk}]\n`;
    }

    if (challenges.length > 5) {
      output += `\n... and ${challenges.length - 5} more`;
    }

    return output;
  }

  /**
   * Get audit logs
   */
  private async getAuditLogs(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/audit-logs?limit=10`);
    const logs = await response.json();

    let output = `📝 **Recent Audit Events**\n\n`;
    
    for (const log of logs.slice(0, 5)) {
      output += `• ${log.event || 'Transaction'}: ${log.amount || '-'} HBAR\n`;
    }

    output += `\nView on HashScan: https://hashscan.io/testnet/topic/0.0.8342181`;
    
    return output;
  }

  /**
   * Main entry point - process user input
   */
  async process(input: string): Promise<string> {
    const command = this.parseCommand(input);
    return await this.execute(command);
  }
}

// Export for OpenClaw integration
export default PolicyGuardPlugin;

// CLI test mode
if (require.main === module) {
  const plugin = new PolicyGuardPlugin();
  
  // Test commands
  const tests = [
    'Pay Bob 5 HBAR',
    'Send 50 HBAR to contractor',
    'Approve CH-001',
    'Show balance',
    'List pending',
  ];

  console.log('PolicyGuard Plugin Test Mode\n');
  
  for (const test of tests) {
    console.log(`User: ${test}`);
    const parsed = plugin.parseCommand(test);
    console.log(`Parsed: ${JSON.stringify(parsed)}`);
    console.log('---');
  }
}
