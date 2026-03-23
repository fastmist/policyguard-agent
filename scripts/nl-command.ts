#!/usr/bin/env ts-node
/**
 * Natural Language Command Interface for PolicyGuard Agent
 * Example: "Pay Bob 2 HBAR"
 */

import { PolicyGuardedAgent } from '../src/agent';
import * as dotenv from 'dotenv';

dotenv.config();

// Simple address book for demo
const ADDRESS_BOOK: Record<string, string> = {
  'bob': '0.0.8339596',  // Self for demo
  'alice': '0.0.8339596', // Self for demo
  'charlie': '0.0.8339596', // Self for demo
  'me': process.env.HEDERA_ACCOUNT_ID || '0.0.8339596',
  'myself': process.env.HEDERA_ACCOUNT_ID || '0.0.8339596'
};

function parseCommand(input: string): { action: string; recipient: string; amount: number } | null {
  // Pattern: "Pay [name] [amount] HBAR"
  const pattern = /pay\s+(\w+)\s+(\d+\.?\d*)\s*hbar/i;
  const match = input.match(pattern);
  
  if (!match) return null;
  
  return {
    action: 'pay',
    recipient: match[1].toLowerCase(),
    amount: parseFloat(match[2])
  };
}

async function execute() {
  const input = process.argv.slice(2).join(' ') || 'Pay Bob 2 HBAR';
  
  console.log('🎯 Natural Language Command');
  console.log('='.repeat(50));
  console.log(`Input: "${input}"`);
  console.log('='.repeat(50) + '\n');
  
  const command = parseCommand(input);
  if (!command) {
    console.error('❌ Invalid command format');
    console.error('   Usage: npx ts-node scripts/nl-command.ts "Pay [name] [amount] HBAR"');
    process.exit(1);
  }
  
  // Lookup address
  const toAddress = ADDRESS_BOOK[command.recipient];
  if (!toAddress) {
    console.error(`❌ Unknown recipient: ${command.recipient}`);
    console.error('   Known recipients:', Object.keys(ADDRESS_BOOK).join(', '));
    process.exit(1);
  }
  
  console.log(`📋 Parsed:`);
  console.log(`   Action: ${command.action}`);
  console.log(`   Recipient: ${command.recipient} (${toAddress})`);
  console.log(`   Amount: ${command.amount} HBAR\n`);
  
  // Check environment
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const auditTopicId = process.env.AUDIT_TOPIC_ID;
  
  if (!accountId || !privateKey) {
    console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY');
    process.exit(1);
  }
  
  if (!auditTopicId || auditTopicId === '0.0.xxxxx') {
    console.error('❌ AUDIT_TOPIC_ID not configured');
    console.error('   Run: npm run setup:hcs');
    process.exit(1);
  }
  
  // Execute transfer
  const agent = new PolicyGuardedAgent({
    hederaAccountId: accountId,
    hederaPrivateKey: privateKey,
    auditTopicId: auditTopicId,
    policyGuardEndpoint: process.env.POLICYGUARD_ENDPOINT || '',
    autoApproveLowRisk: true  // Auto-approve for demo
  });
  
  console.log('🚀 Executing through PolicyGuard...\n');
  
  const result = await agent.transfer({
    to: toAddress,
    amount: command.amount
  });
  
  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('✅ Transaction Executed');
    console.log(`   TX ID: ${result.txId}`);
    console.log(`   Challenge: ${result.challengeId || 'auto-approved'}`);
    console.log(`\n🔗 HashScan: https://hashscan.io/testnet/transaction/${result.txId}`);
  } else {
    console.log('❌ Transaction Failed');
    console.log(`   ${result.message}`);
  }
  console.log('='.repeat(50));
  
  agent.close?.();
}

execute().catch(console.error);
