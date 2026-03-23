#!/usr/bin/env ts-node
/**
 * Quick Test Script for Hedera Testnet
 * Validates configuration and tests basic operations
 */

import { HederaService } from '../src/hedera';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;

if (!accountId || !privateKey) {
  console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
  process.exit(1);
}

async function runTests() {
  console.log('🧪 Hedera Testnet Validation\n');
  console.log('=' .repeat(50));
  console.log(`Account ID: ${accountId}`);
  console.log('=' .repeat(50));
  console.log();

  const hedera = new HederaService(accountId!, privateKey!);

  // Test 1: Get Balance
  console.log('📊 Test 1: Checking Balance...');
  try {
    const balance = await hedera.getBalance();
    console.log(`✅ Balance: ${balance.hbar} HBAR`);
    console.log(`🔗 View: https://hashscan.io/testnet/account/${accountId}\n`);
  } catch (e) {
    console.error('❌ Balance check failed:', e);
    return;
  }

  // Test 2: HCS Connection (if topic configured)
  const topicId = process.env.AUDIT_TOPIC_ID;
  if (topicId && topicId !== '0.0.xxxxx') {
    console.log('📝 Test 2: Testing HCS Audit Log...');
    try {
      const txId = await hedera.hcs.logEvent('TEST_CONNECTION', {
        timestamp: new Date().toISOString(),
        message: 'Connection test successful'
      });
      console.log(`✅ Audit log sent: ${txId}`);
      console.log(`🔗 View: https://hashscan.io/testnet/transaction/${txId}\n`);
    } catch (e) {
      console.error('❌ HCS test failed:', e);
    }
  } else {
    console.log('⏭️  Test 2: Skipped (AUDIT_TOPIC_ID not configured)');
    console.log('   Run: npx ts-node scripts/setup-hcs-topic.ts\n');
  }

  console.log('✨ All tests completed!');
  console.log('\n🎯 Next: Test a PolicyGuard transfer');
  console.log('   npx ts-node scripts/cli.ts transfer 0.0.xxx 0.1');

  hedera.client.close();
}

runTests().catch(console.error);
