#!/usr/bin/env ts-node
/**
 * Test PolicyGuard Transfer Flow
 * Quick test for demo purposes
 */

import { PolicyGuardedAgent } from '../src/agent';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;
const auditTopicId = process.env.AUDIT_TOPIC_ID;

if (!accountId || !privateKey) {
  console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
  process.exit(1);
}

if (!auditTopicId || auditTopicId === '0.0.xxxxx') {
  console.error('❌ AUDIT_TOPIC_ID not configured. Run: npm run setup:hcs');
  console.error('   Then copy the Topic ID to your .env file');
  process.exit(1);
}

async function testTransfer() {
  console.log('🚀 Testing PolicyGuard Transfer Flow\n');
  console.log('=' .repeat(60));
  console.log(`Account: ${accountId}`);
  console.log(`Topic: ${auditTopicId}`);
  console.log('=' .repeat(60) + '\n');
  
  const agent = new PolicyGuardedAgent({
    hederaAccountId: accountId,
    hederaPrivateKey: privateKey,
    auditTopicId: auditTopicId,
    policyGuardEndpoint: process.env.POLICYGUARD_ENDPOINT || 'https://policyguard.openclaw.ai',
    autoApproveLowRisk: process.env.AUTO_APPROVE_LOW_RISK === 'true'
  });
  
  // Test 1: Check balance first
  console.log('📊 Checking balance...');
  const balance = await agent.getBalance();
  console.log(`✅ Balance: ${balance.hbar} HBAR\n`);
  
  // Test 2: Create a test transfer (0.001 HBAR to yourself - minimal amount)
  console.log('📝 Creating transfer proposal...');
  console.log('   (Sending to self for testing)\n');
  
  const result = await agent.transfer({
    to: accountId, // Send to self for testing
    amount: 0.001  // Minimal amount for testing
  });
  
  console.log('\n' + '=' .repeat(60));
  if (result.success) {
    console.log('✅ Transfer Result:');
    console.log(`   Transaction ID: ${result.txId}`);
    console.log(`   Challenge ID: ${result.challengeId || 'N/A'}`);
    console.log(`   Approval Token: ${result.approvalToken || 'N/A'}`);
    console.log(`\n🔗 View on HashScan:`);
    console.log(`   https://hashscan.io/testnet/transaction/${result.txId}`);
  } else {
    console.log('❌ Transfer Failed:');
    console.log(`   ${result.message}`);
    if (result.challengeId) {
      console.log(`   Challenge ID: ${result.challengeId}`);
    }
  }
  console.log('=' .repeat(60));
  
  agent.close?.();
}

testTransfer().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
