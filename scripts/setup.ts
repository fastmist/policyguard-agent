#!/usr/bin/env node
// scripts/setup.ts - Setup helper

import { Client, TopicCreateTransaction, AccountBalanceQuery } from '@hashgraph/sdk';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function setup() {
  console.log(`
🛡️  PolicyGuard Agent - Setup Helper
═══════════════════════════════════════
`);

  // Check env
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKey) {
    console.log('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
    console.log('');
    console.log('Please:');
    console.log('1. Get testnet account from https://portal.hedera.com/faucet');
    console.log('2. Copy .env.example to .env');
    console.log('3. Fill in your account credentials');
    process.exit(1);
  }

  console.log(`✓ Account ID: ${accountId}`);

  // Create client
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  // Check balance
  try {
    const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await balanceQuery.execute(client);
    const hbar = balance.hbars.toTinybars().toNumber() / 100_000_000;
    console.log(`✓ Balance: ${hbar} HBAR`);

    if (hbar < 1) {
      console.log('⚠️  Low balance! Get more at https://portal.hedera.com/faucet');
    }
  } catch (e: any) {
    console.log('❌ Failed to check balance:', e.message);
    process.exit(1);
  }

  // Create HCS Topic
  console.log('');
  const createTopic = await question('Create HCS Audit Topic? (y/n): ');
  
  if (createTopic.toLowerCase() === 'y') {
    try {
      console.log('Creating HCS Topic...');
      const transaction = new TopicCreateTransaction()
        .setMemo('PolicyGuard Agent Audit Log')
        .setSubmitKey(client.operatorPublicKey!);

      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);
      const topicId = receipt.topicId!.toString();

      console.log('');
      console.log('✅ HCS Topic Created!');
      console.log(`   Topic ID: ${topicId}`);
      console.log('');
      console.log('Add this to your .env file:');
      console.log(`AUDIT_TOPIC_ID=${topicId}`);
      console.log('');
    } catch (e: any) {
      console.log('❌ Failed to create topic:', e.message);
    }
  }

  // Summary
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('Setup complete! Next steps:');
  console.log('');
  console.log('1. Ensure .env has AUDIT_TOPIC_ID');
  console.log('2. Run: npm run dev');
  console.log('3. Test: curl http://localhost:3000/api/health');
  console.log('');

  rl.close();
}

setup().catch(console.error);
