#!/usr/bin/env node
// scripts/cli.ts - Command line interface for testing

import { PolicyGuardedAgent } from '../src/agent';
import dotenv from 'dotenv';

dotenv.config();

const agent = new PolicyGuardedAgent({
  hederaAccountId: process.env.HEDERA_ACCOUNT_ID!,
  hederaPrivateKey: process.env.HEDERA_PRIVATE_KEY!,
  policyGuardEndpoint: process.env.POLICYGUARD_ENDPOINT || '',
  auditTopicId: process.env.AUDIT_TOPIC_ID!,
  autoApproveLowRisk: process.env.AUTO_APPROVE_LOW_RISK === 'true'
});

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'balance':
      const balance = await agent.getBalance();
      console.log(`Balance: ${balance.hbar} HBAR`);
      console.log(`Account: ${balance.accountId}`);
      break;
      
    case 'transfer':
      const to = process.argv[3];
      const amount = parseFloat(process.argv[4]);
      
      if (!to || !amount) {
        console.log('Usage: npm run cli -- transfer <to> <amount>');
        process.exit(1);
      }
      
      console.log(`Creating transfer proposal: ${amount} HBAR to ${to}`);
      const result = await agent.transfer({ to, amount });
      console.log(result.message);
      
      if (!result.success && result.challengeId) {
        console.log(`\nTo approve: npm run cli -- approve ${result.challengeId}`);
        console.log(`To reject:  npm run cli -- reject ${result.challengeId}`);
      }
      break;
      
    case 'approve':
      const approveId = process.argv[3];
      if (!approveId) {
        console.log('Usage: npm run cli -- approve <challengeId>');
        process.exit(1);
      }
      
      const approveSuccess = await agent.approveChallenge(approveId, 'Approved via CLI');
      console.log(approveSuccess ? '✅ Approved' : '❌ Challenge not found');
      break;
      
    case 'reject':
      const rejectId = process.argv[3];
      if (!rejectId) {
        console.log('Usage: npm run cli -- reject <challengeId>');
        process.exit(1);
      }
      
      const rejectSuccess = await agent.rejectChallenge(rejectId, 'Rejected via CLI');
      console.log(rejectSuccess ? '❌ Rejected' : '❌ Challenge not found');
      break;
      
    case 'logs':
      const logs = await agent.getAuditLogs(10);
      console.log(JSON.stringify(logs, null, 2));
      break;
      
    default:
      console.log(`
PolicyGuard Agent CLI

Commands:
  balance                    - Check account balance
  transfer <to> <amount>     - Create transfer proposal
  approve <challengeId>     - Approve a pending challenge
  reject <challengeId>      - Reject a pending challenge
  logs                       - View recent audit logs

Examples:
  npm run cli -- balance
  npm run cli -- transfer 0.0.54321 10
  npm run cli -- approve pg_123456789
      `);
  }
  
  process.exit(0);
}

main().catch(console.error);
