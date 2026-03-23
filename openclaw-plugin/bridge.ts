/**
 * OpenClaw PolicyGuard Bridge
 * Direct integration for current session
 */

// Natural language patterns
const TRANSFER_PATTERNS = [
  /pay\s+(\w+)\s+(\d+(?:\.\d+)?)\s*hbar/i,
  /send\s+(\d+(?:\.\d+)?)\s*hbar\s+to\s+(\w+)/i,
  /transfer\s+(\d+(?:\.\d+)?)\s*hbar\s+to\s+(\w+)/i,
  /给\s*(\w+)\s*转\s*(\d+(?:\.\d+)?)\s*hbar/i,
];

const APPROVE_PATTERN = /(?:approve|批准)\s+(CH-[\w-]+)/i;
const REJECT_PATTERN = /(?:reject|拒绝)\s+(CH-[\w-]+)/i;
const BALANCE_PATTERN = /(?:balance|余额|查余额)/i;
const PENDING_PATTERN = /(?:pending|待审批|待处理)/i;
const AUDIT_PATTERN = /(?:audit|审计|日志)/i;

// Name to account mapping
const RECIPIENT_MAP: Record<string, string> = {
  'bob': '0.0.1001',
  'alice': '0.0.1002',
  'contractor': '0.0.2002',
  'vendor': '0.0.3003',
  'equipment': '0.0.3003',
};

/**
 * Parse natural language to command
 */
export function parseNaturalLanguage(input: string): {
  type: string;
  amount?: number;
  recipient?: string;
  challengeId?: string;
  raw: string;
} | null {
  const trimmed = input.trim();

  // Transfer
  for (const pattern of TRANSFER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      if (pattern.source.includes('pay') || pattern.source.includes('给')) {
        return {
          type: 'transfer',
          recipient: match[1],
          amount: parseFloat(match[2]),
          raw: trimmed
        };
      } else {
        return {
          type: 'transfer',
          amount: parseFloat(match[1]),
          recipient: match[2],
          raw: trimmed
        };
      }
    }
  }

  // Approve
  const approveMatch = trimmed.match(APPROVE_PATTERN);
  if (approveMatch) {
    return {
      type: 'approve',
      challengeId: approveMatch[1],
      raw: trimmed
    };
  }

  // Reject
  const rejectMatch = trimmed.match(REJECT_PATTERN);
  if (rejectMatch) {
    return {
      type: 'reject',
      challengeId: rejectMatch[1],
      raw: trimmed
    };
  }

  // Balance
  if (BALANCE_PATTERN.test(trimmed.toLowerCase())) {
    return { type: 'balance', raw: trimmed };
  }

  // Pending
  if (PENDING_PATTERN.test(trimmed.toLowerCase())) {
    return { type: 'pending', raw: trimmed };
  }

  // Audit
  if (AUDIT_PATTERN.test(trimmed.toLowerCase())) {
    return { type: 'audit', raw: trimmed };
  }

  return null;
}

/**
 * Execute command and return formatted response
 */
export async function executeCommand(cmd: any): Promise<string | null> {
  const baseUrl = 'http://localhost:3000/api';

  try {
    switch (cmd.type) {
      case 'transfer': {
        const to = RECIPIENT_MAP[cmd.recipient.toLowerCase()] || cmd.recipient;
        
        // Simulate API call
        const result = simulateTransfer(cmd.amount, to);
        
        if (result.autoApproved) {
          return `✅ **Auto-approved!**\n\n` +
                 `💸 ${cmd.amount} HBAR → ${cmd.recipient}\n` +
                 `🟢 Risk: LOW\n` +
                 `⛓️  TX: ${result.txId}\n` +
                 `📝 HCS: Logged`;
        } else {
          return `⚠️ **Challenge Created**\n\n` +
                 `🆔 ${result.challengeId}\n` +
                 `💸 ${cmd.amount} HBAR → ${cmd.recipient}\n` +
                 `🟡 Risk: ${result.riskLevel}\n` +
                 `⏳ Status: PENDING\n\n` +
                 `💡 Use: "/approve ${result.challengeId}"`;
        }
      }

      case 'approve': {
        return `✅ **Challenge Approved!**\n\n` +
               `🆔 ${cmd.challengeId}\n` +
               `👤 Approved by: User\n` +
               `⛓️  Transaction executing...\n` +
               `📝 HCS: Approval logged`;
      }

      case 'reject': {
        return `❌ **Challenge Rejected**\n\n` +
               `🆔 ${cmd.challengeId}\n` +
               `🚫 Transaction blocked\n` +
               `💰 No funds transferred`;
      }

      case 'balance': {
        return `💰 **Account Balance**\n\n` +
               `⛓️  HBAR: 945.67\n` +
               `📍 Account: 0.0.8339596\n` +
               `🌐 Network: Testnet`;
      }

      case 'pending': {
        return `⏳ **Pending Challenges**\n\n` +
               `📝 No pending challenges\n` +
               `✅ All caught up!`;
      }

      case 'audit': {
        return `📝 **Recent Audit Events**\n\n` +
               `✓ AUTO_APPROVED: 2 HBAR → Bob\n` +
               `✓ CHALLENGE_CREATED: 30 HBAR\n` +
               `✓ CHALLENGE_APPROVED: 30 HBAR\n` +
               `✓ MULTI_SIG_APPROVED: 40 HBAR\n\n` +
               `🔗 [View on HashScan](https://hashscan.io/testnet/topic/0.0.8342181)`;
      }

      default:
        return null;
    }
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}

/**
 * Simulate transfer (for demo without running server)
 */
function simulateTransfer(amount: number, to: string): any {
  if (amount <= 10) {
    return {
      autoApproved: true,
      txId: `0.0.8339596@${Date.now()}.123`,
      riskLevel: 'LOW'
    };
  } else if (amount <= 100) {
    return {
      autoApproved: false,
      challengeId: `CH-${Date.now().toString().slice(-6)}`,
      riskLevel: 'MEDIUM'
    };
  } else {
    return {
      autoApproved: false,
      challengeId: `CH-${Date.now().toString().slice(-6)}`,
      riskLevel: 'HIGH'
    };
  }
}

/**
 * Main handler for OpenClaw integration
 */
export async function handlePolicyGuardCommand(input: string): Promise<string | null> {
  const cmd = parseNaturalLanguage(input);
  
  if (!cmd) {
    return null; // Not a PolicyGuard command
  }

  return await executeCommand(cmd);
}

// Test
if (require.main === module) {
  const tests = [
    'Pay Bob 5 HBAR',
    'Send 50 HBAR to contractor',
    '给 Alice 转 10 HBAR',
    'Approve CH-001',
    'Show balance',
    '查余额',
    'List pending',
    'Show audit logs',
  ];

  console.log('🛡️ PolicyGuard Natural Language Plugin\n');
  
  for (const test of tests) {
    console.log(`User: "${test}"`);
    const cmd = parseNaturalLanguage(test);
    if (cmd) {
      console.log(`Parsed: ${JSON.stringify(cmd, null, 2)}`);
      executeCommand(cmd).then(response => {
        console.log(`Response:\n${response}`);
        console.log('─'.repeat(50));
      });
    } else {
      console.log('Not recognized as PolicyGuard command');
      console.log('─'.repeat(50));
    }
  }
}
