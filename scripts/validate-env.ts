#!/usr/bin/env ts-node
/**
 * Quick Environment Validation
 * Tests Hedera connection without HCS dependency
 */

import { Client, AccountBalanceQuery, TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;

if (!accountId || !privateKey) {
  console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
  process.exit(1);
}

async function validateEnvironment() {
  console.log('🔧 Hedera Environment Validation\n');
  console.log('=' .repeat(60));
  console.log(`Account ID: ${accountId}`);
  console.log('=' .repeat(60) + '\n');

  // Create client
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  try {
    // Test 1: Get balance
    console.log('📊 Test 1: Checking account balance...');
    const query = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await query.execute(client);
    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100_000_000;
    
    console.log(`✅ Balance: ${hbarBalance} HBAR`);
    console.log(`🔗 https://hashscan.io/testnet/account/${accountId}\n`);

    if (hbarBalance < 1) {
      console.error('⚠️  Warning: Low balance. Faucet should provide 10,000 HBAR.');
      console.error('   Check if account was properly funded.\n');
    }

    // Test 2: Verify operator key works (create but don't execute a transaction)
    console.log('📋 Test 2: Verifying operator key...');
    const testTx = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(accountId), Hbar.fromTinybars(-1))
      .addHbarTransfer(AccountId.fromString(accountId), Hbar.fromTinybars(1));
    
    testTx.freezeWith(client);
    console.log('✅ Transaction creation successful (not submitted)\n');

    // Test 3: HCS Topic check
    console.log('📋 Test 3: Checking HCS Topic configuration...');
    const topicId = process.env.AUDIT_TOPIC_ID;
    if (!topicId || topicId === '0.0.xxxxx') {
      console.log('⚠️  AUDIT_TOPIC_ID not configured');
      console.log('   Run: npm run setup:hcs\n');
    } else {
      console.log(`✅ Topic configured: ${topicId}`);
      console.log(`🔗 https://hashscan.io/testnet/topic/${topicId}\n`);
    }

    console.log('=' .repeat(60));
    console.log('✨ Environment validation complete!');
    console.log('\n🎯 Next steps:');
    if (!topicId || topicId === '0.0.xxxxx') {
      console.log('   1. Run: npm run setup:hcs');
      console.log('   2. Copy Topic ID to .env');
    }
    console.log(`   ${topicId && topicId !== '0.0.xxxxx' ? '1' : '3'}. Run: npx ts-node scripts/test-transfer.ts`);
    console.log('=' .repeat(60));

  } catch (error: any) {
    console.error('\n❌ Validation failed:');
    console.error(`   ${error.message}`);
    
    if (error.message?.includes('INSUFFICIENT_TX_FEE')) {
      console.error('\n💡 Tip: Account may not be funded yet.');
      console.error('   Wait a few minutes after faucet claim.');
    }
    if (error.message?.includes('INVALID_SIGNATURE')) {
      console.error('\n💡 Tip: Private key format may be incorrect.');
      console.error('   Ensure it starts with 302e020100300506032b6570...');
    }
    
    process.exit(1);
  } finally {
    client.close();
  }
}

validateEnvironment();
