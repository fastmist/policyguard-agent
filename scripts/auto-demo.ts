#!/usr/bin/env ts-node
/**
 * Real Hedera Testnet Demo - Full Auto Mode
 * Shows complete flow with auto-approval for demo purposes
 */

import { Client, PrivateKey, TransferTransaction, AccountBalanceQuery } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

interface DemoLog {
  step: number;
  action: string;
  prompt: string;
  response: string;
  hashscanUrl?: string;
}

const logs: DemoLog[] = [];

function log(step: number, action: string, prompt: string, response: string, hashscanUrl?: string) {
  const entry = { step, action, prompt, response, hashscanUrl };
  logs.push(entry);
  
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`Step ${step}: ${action}`);
  console.log(`───────────────────────────────────────────────────────────`);
  console.log(`PROMPT: ${prompt}`);
  console.log(`RESPONSE: ${response}`);
  if (hashscanUrl) console.log(`HASHSCAN: ${hashscanUrl}`);
  console.log(`═══════════════════════════════════════════════════════════\n`);
}

async function runAutoDemo() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PolicyGuard Agent - Real Hedera Testnet Auto Demo        ║');
  console.log('║  Full Transaction Flow with Prompts & Responses           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const accountId = process.env.HEDERA_ACCOUNT_ID!;
  const privateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);
  const topicId = process.env.AUDIT_TOPIC_ID!;
  
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  // Step 1: Query Balance
  console.log('⏳ Step 1: Querying account balance...');
  const balanceBefore = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(client);
  
  const balanceHBAR = balanceBefore.hbars.toTinybars().toNumber() / 100000000;
  
  log(1, 'Account Balance Query', 
    `Query balance for account ${accountId}`,
    `Balance: ${balanceHBAR.toFixed(8)} HBAR`,
    `https://hashscan.io/testnet/account/${accountId}`
  );

  // Step 2: Create HCS Audit Log
  console.log('⏳ Step 2: Creating HCS audit log entry...');
  const { TopicMessageSubmitTransaction } = await import('@hashgraph/sdk');
  
  const auditMessage = JSON.stringify({
    event: 'DEMO_START',
    timestamp: new Date().toISOString(),
    account: accountId,
    initialBalance: balanceHBAR
  });
  
  const auditTx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(auditMessage)
    .execute(client);
  
  const auditReceipt = await auditTx.getReceipt(client);
  
  log(2, 'HCS Audit Log Entry',
    `Submit audit message to topic ${topicId}: ${auditMessage.substring(0, 80)}...`,
    `Message submitted successfully. Sequence: ${auditReceipt.topicSequenceNumber?.toString() || 'pending'}`,
    `https://hashscan.io/testnet/topic/${topicId}`
  );

  // Step 3: PolicyGuard Assessment
  const transferAmount = 0.01; // Small amount for demo
  const targetAccount = '0.0.1001';
  
  console.log('⏳ Step 3: PolicyGuard Risk Assessment...');
  
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (transferAmount > 1000) riskLevel = 'CRITICAL';
  else if (transferAmount > 100) riskLevel = 'HIGH';
  else if (transferAmount > 10) riskLevel = 'MEDIUM';
  
  const autoApprove = riskLevel === 'LOW';
  
  log(3, 'PolicyGuard Risk Assessment',
    `Assess risk for transfer of ${transferAmount} HBAR to ${targetAccount}`,
    `Risk Level: ${riskLevel}\nAuto-approve: ${autoApprove}\nChallenge Required: ${!autoApprove}`
  );

  // Step 4: Create Challenge (if not auto-approved)
  if (!autoApprove) {
    console.log('⏳ Step 4: Creating PolicyGuard Challenge...');
    const challengeId = `pg_${Date.now()}`;
    
    log(4, 'PolicyGuard Challenge',
      `Create approval challenge for ${transferAmount} HBAR transfer`,
      `Challenge ID: ${challengeId}\nStatus: PENDING\nRequired Action: Human approval needed`
    );
  }

  // Step 5: Execute Transfer (simulating approval)
  console.log('⏳ Step 5: Executing Hedera Transfer...');
  
  const transferTx = await new TransferTransaction()
    .addHbarTransfer(accountId, -transferAmount)
    .addHbarTransfer(targetAccount, transferAmount)
    .execute(client);
  
  const transferReceipt = await transferTx.getReceipt(client);
  
  log(5, 'Hedera Transfer Execution',
    `Transfer ${transferAmount} HBAR from ${accountId} to ${targetAccount}`,
    `Transaction Status: ${transferReceipt.status.toString()}\nTransaction ID: ${transferTx.transactionId.toString()}`,
    `https://hashscan.io/testnet/transaction/${transferTx.transactionId.toString().replace('@', '-')}`
  );

  // Step 6: Post-Execution Audit
  console.log('⏳ Step 6: Recording execution to HCS...');
  
  const execMessage = JSON.stringify({
    event: 'TRANSACTION_EXECUTED',
    timestamp: new Date().toISOString(),
    txId: transferTx.transactionId.toString(),
    from: accountId,
    to: targetAccount,
    amount: transferAmount
  });
  
  const execAuditTx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(execMessage)
    .execute(client);
  
  await execAuditTx.getReceipt(client);
  
  log(6, 'HCS Execution Log',
    `Submit execution audit to topic ${topicId}`,
    `Execution logged successfully`
  );

  // Step 7: Query Updated Balance
  console.log('⏳ Step 7: Querying updated balance...');
  const balanceAfter = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(client);
  
  const balanceAfterHBAR = balanceAfter.hbars.toTinybars().toNumber() / 100000000;
  
  log(7, 'Updated Balance Query',
    `Query updated balance for ${accountId}`,
    `New Balance: ${balanceAfterHBAR.toFixed(8)} HBAR\nChange: -${(balanceHBAR - balanceAfterHBAR).toFixed(8)} HBAR (transfer + fees)`
  );

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    DEMO SUMMARY                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  All Prompts & Responses:                               │');
  console.log('└─────────────────────────────────────────────────────────┘');
  
  logs.forEach(l => {
    console.log(`\n${l.step}. ${l.action}`);
    console.log(`   P: ${l.prompt.substring(0, 70)}${l.prompt.length > 70 ? '...' : ''}`);
    console.log(`   R: ${l.response.split('\n')[0].substring(0, 70)}${l.response.split('\n')[0].length > 70 ? '...' : ''}`);
  });
  
  console.log('\n┌─────────────────────────────────────────────────────────┐');
  console.log('│  Key Resources:                                         │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log(`• Account: https://hashscan.io/testnet/account/${accountId}`);
  console.log(`• HCS Topic: https://hashscan.io/testnet/topic/${topicId}`);
  console.log(`• Transaction: https://hashscan.io/testnet/transaction/${transferTx.transactionId.toString().replace('@', '-')}`);
  
  client.close();
}

runAutoDemo().catch(console.error);
