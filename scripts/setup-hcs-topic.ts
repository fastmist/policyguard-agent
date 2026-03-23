#!/usr/bin/env ts-node
/**
 * Setup HCS Topic for Audit Logging
 * Run this first to create the audit topic
 */

import { Client, TopicCreateTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID;
const privateKey = process.env.HEDERA_PRIVATE_KEY;

if (!accountId || !privateKey) {
  console.error('❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env');
  process.exit(1);
}

async function setupTopic() {
  const client = Client.forTestnet();
  client.setOperator(accountId!, privateKey!);

  console.log('🔧 Creating HCS Topic for PolicyGuard Audit Logs...\n');

  // Create topic
  const transaction = new TopicCreateTransaction()
    .setSubmitKey(client.operatorPublicKey!)
    .setTopicMemo('PolicyGuard Agent Audit Log - Hello Future Apex 2026');

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);
  const topicId = receipt.topicId!.toString();

  console.log('✅ HCS Topic Created!');
  console.log(`📍 Topic ID: ${topicId}`);
  console.log('\n👉 Add this to your .env file:');
  console.log(`AUDIT_TOPIC_ID=${topicId}`);
  console.log('\n🧪 Testing topic with a message...');

  // Test message
  const testMsg = JSON.stringify({
    event: 'TOPIC_CREATED',
    timestamp: new Date().toISOString(),
    source: 'PolicyGuard Setup Script'
  });

  await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(testMsg)
    .execute(client);

  console.log('✅ Test message sent successfully!');
  console.log('\n🔗 View on HashScan:');
  console.log(`https://hashscan.io/testnet/topic/${topicId}`);

  client.close();
}

setupTopic().catch(console.error);
