#!/usr/bin/env ts-node
/**
 * Test Hedera connection with real account
 * Validates account and private key match
 */

import { Client, AccountBalanceQuery, AccountInfoQuery } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;

if (!accountId || !privateKey) {
  console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
  process.exit(1);
}

async function testConnection() {
  console.log('🔍 Testing Hedera Connection\n');
  console.log('=' .repeat(50));
  console.log(`Account ID: ${accountId}`);
  console.log('=' .repeat(50));
  console.log();

  try {
    const client = Client.forTestnet();
    client.setOperator(accountId!, privateKey!);

    // Test 1: Get Balance (requires valid key)
    console.log('📊 Test 1: Querying Balance...');
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId!)
      .execute(client);
    
    console.log(`✅ Balance: ${balance.hbars.toString()}`);
    console.log(`🔗 View: https://hashscan.io/testnet/account/${accountId}\n`);

    // Test 2: Get Account Info
    console.log('📋 Test 2: Querying Account Info...');
    const info = await new AccountInfoQuery()
      .setAccountId(accountId!)
      .execute(client);
    
    console.log(`✅ Account Key: ${info.key.toString().substring(0, 50)}...\n`);

    console.log('✨ Connection test passed!');
    client.close();
    return true;
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('INVALID_SIGNATURE')) {
      console.error('\n⚠️  The private key does not match the account!');
      console.error('Please verify:');
      console.error('1. The private key corresponds to account ' + accountId);
      console.error('2. Check HashScan for the correct public key:');
      console.error(`   https://hashscan.io/testnet/account/${accountId}`);
    }
    
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
