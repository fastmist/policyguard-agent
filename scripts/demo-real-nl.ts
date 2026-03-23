#!/usr/bin/env ts-node
/**
 * 🎬 REAL TRANSACTION DEMO - Natural Language Mode
 * Executes REAL Hedera Testnet transactions
 * 
 * Prompts used:
 * 1. "Pay Bob 2 HBAR" → Auto-approve
 * 2. "Send 30 HBAR to contractor" → Challenge → Approve
 * 3. "Request 40 HBAR payment to vendor" → Multi-sig → Approve x2
 */

import { Client, PrivateKey, TransferTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan: '\x1b[36m', white: '\x1b[37m',
  bgBlue: '\x1b[44m', bgGreen: '\x1b[42m', bgYellow: '\x1b[43m', bgRed: '\x1b[41m',
  black: '\x1b[30m'
};

let challengeCounter = 1;
const approvals: Record<string, string[]> = {};

function clear() { console.clear(); }
function wait(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function printUser(name: string, text: string) {
  console.log(`\n${C.cyan}┌─ 👤 ${name}${C.reset}`);
  console.log(`${C.cyan}│${C.reset}  ${C.bold}"${text}"${C.reset}`);
  console.log(`${C.cyan}└─${C.reset}`);
}
function printAgent(lines: string[]) {
  console.log(`\n${C.green}┌─ 🤖 PolicyGuard Agent${C.reset}`);
  lines.forEach(l => console.log(`${C.green}│${C.reset}  ${l}`));
  console.log(`${C.green}└─${C.reset}`);
}
function printCard(title: string, lines: string[]) {
  const w = 48;
  console.log(`\n${C.dim}┌${'─'.repeat(w)}┐${C.reset}`);
  console.log(`${C.dim}│${C.reset} ${C.bold}${title.padEnd(w-1)}${C.dim}│${C.reset}`);
  console.log(`${C.dim}├${'─'.repeat(w)}┤${C.reset}`);
  lines.forEach(l => console.log(`${C.dim}│${C.reset} ${l.padEnd(w-1)}${C.dim}│${C.reset}`));
  console.log(`${C.dim}└${'─'.repeat(w)}┘${C.reset}`);
}

async function logToHCS(client: Client, message: string) {
  try {
    await new TopicMessageSubmitTransaction()
      .setTopicId('0.0.8342181')
      .setMessage(message)
      .execute(client);
  } catch (e) {}
}

async function executeTransfer(
  client: Client, 
  amount: number, 
  to: string, 
  recipientName: string
): Promise<string> {
  const tx = await new TransferTransaction()
    .addHbarTransfer(process.env.HEDERA_ACCOUNT_ID!, -amount)
    .addHbarTransfer(to, amount)
    .execute(client);
  const receipt = await tx.getReceipt(client);
  return tx.transactionId.toString();
}

async function runRealDemo() {
  const accountId = process.env.HEDERA_ACCOUNT_ID!;
  const privateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  console.log(`${C.bold}${C.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🎬 REAL TRANSACTION DEMO - Natural Language            ║');
  console.log('║                                                            ║');
  console.log('║     Executes REAL transactions on Hedera Testnet           ║');
  console.log('║     Total: 72 HBAR + fees (~0.03 HBAR)                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${C.reset}\n`);

  console.log(`${C.yellow}⚠️  This will execute REAL transactions${C.reset}`);
  console.log(`   Account: ${accountId}`);
  console.log(`   Starting in 3 seconds...\n`);
  await wait(3000);

  // ═════════════════════════════════════════════════════════════
  // PROMPT 1: "Pay Bob 2 HBAR"
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgGreen}${C.white}${C.bold} PROMPT 1: NATURAL LANGUAGE INPUT ${C.reset}\n`);
  
  printUser('Alice', 'Pay Bob 2 HBAR');
  await wait(1000);

  printAgent([
    'Processing natural language...',
    `${C.dim}→ Intent: TRANSFER${C.reset}`,
    `${C.dim}→ Recipient: Bob (0.0.1001)${C.reset}`,
    `${C.dim}→ Amount: 2 HBAR${C.reset}`,
    '',
    `${C.dim}Risk Assessment:${C.reset}`,
    `${C.dim}→ Amount ≤ 10 HBAR = LOW risk${C.reset}`,
    '',
    `${C.green}✓ AUTO-APPROVED${C.reset}`
  ]);
  await wait(1500);

  printCard('Executing Transaction', [
    `${C.yellow}⏳ Submitting to Hedera Testnet...${C.reset}`
  ]);

  const tx1 = await executeTransfer(client, 2, '0.0.1001', 'Bob');
  await logToHCS(client, `AUTO_APPROVED: 2 HBAR to Bob`);

  printCard('Transaction Success', [
    `${C.green}✓ CONFIRMED${C.reset}`,
    ``,
    `Amount: 2 HBAR → Bob`,
    `Type: Auto-approved`,
    `Risk: LOW`,
    ``,
    `TX ID: ${C.dim}${tx1}${C.reset}`,
    ``,
    `${C.blue}🔗 hashscan.io/testnet/tx/${tx1}${C.reset}`
  ]);
  await wait(3000);

  // ═════════════════════════════════════════════════════════════
  // PROMPT 2: "Send 30 HBAR to contractor"
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgYellow}${C.black}${C.bold} PROMPT 2: NATURAL LANGUAGE INPUT ${C.reset}\n`);

  printUser('Alice', 'Send 30 HBAR to contractor');
  await wait(1000);

  printAgent([
    'Processing natural language...',
    `${C.dim}→ Intent: TRANSFER${C.reset}`,
    `${C.dim}→ Recipient: contractor (0.0.2002)${C.reset}`,
    `${C.dim}→ Amount: 30 HBAR${C.reset}`,
    '',
    `${C.dim}Risk Assessment:${C.reset}`,
    `${C.dim}→ Amount > 10 HBAR = MEDIUM risk${C.reset}`,
    '',
    `${C.yellow}⚠️ CHALLENGE REQUIRED${C.reset}`
  ]);
  await wait(1500);

  const chId = `CH-${String(challengeCounter++).padStart(3, '0')}`;
  printCard('Challenge Created', [
    `${C.yellow}🆔 ${chId}${C.reset}`,
    ``,
    `Amount: 30 HBAR`,
    `To: contractor (0.0.2002)`,
    `Risk: MEDIUM`,
    `Status: PENDING`,
    ``,
    `Required: Human approval`
  ]);
  await wait(2000);

  // Approval prompt
  printUser('Alice', `Approve ${chId} "Verified contractor payment"`);
  await wait(1000);

  printAgent([
    `${C.green}✓ Challenge Approved${C.reset}`,
    `${C.dim}→ Approver: Alice${C.reset}`,
    `${C.dim}→ Reason: Verified contractor payment${C.reset}`,
    '',
    `${C.yellow}⏳ Executing transaction...${C.reset}`
  ]);

  const tx2 = await executeTransfer(client, 30, '0.0.2002', 'contractor');
  await logToHCS(client, `CHALLENGE_APPROVED: ${chId} - 30 HBAR to contractor`);

  printCard('Transaction Success', [
    `${C.green}✓ CONFIRMED${C.reset}`,
    ``,
    `Amount: 30 HBAR → contractor`,
    `Challenge: ${chId}`,
    `Approved by: Alice`,
    ``,
    `TX ID: ${C.dim}${tx2}${C.reset}`
  ]);
  await wait(3000);

  // ═════════════════════════════════════════════════════════════
  // PROMPT 3: "Request 40 HBAR payment to vendor"
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgRed}${C.white}${C.bold} PROMPT 3: NATURAL LANGUAGE INPUT ${C.reset}\n`);

  printUser('Employee', 'Request 40 HBAR payment to vendor for equipment');
  await wait(1000);

  printAgent([
    'Processing natural language...',
    `${C.dim}→ Intent: TRANSFER${C.reset}`,
    `${C.dim}→ Recipient: vendor (0.0.3003)${C.reset}`,
    `${C.dim}→ Amount: 40 HBAR${C.reset}`,
    '',
    `${C.dim}Risk Assessment:${C.reset}`,
    `${C.dim}→ Amount > 30 HBAR = HIGH risk${C.reset}`,
    '',
    `${C.red}⚠️ MULTI-SIGNATURE REQUIRED${C.reset}`
  ]);
  await wait(1500);

  const chId2 = `CH-${String(challengeCounter++).padStart(3, '0')}`;
  approvals[chId2] = [];

  printCard('Multi-Sig Challenge Created', [
    `${C.red}🆔 ${chId2}${C.reset}`,
    ``,
    `Amount: 40 HBAR`,
    `To: vendor (0.0.3003)`,
    `Risk: HIGH`,
    ``,
    `Required: 2 of 3 approvers`,
    `• CFO (Finance)`,
    `• CTO (Technical)`,
    `• Security Lead`
  ]);
  await wait(2000);

  // First approval
  printUser('CFO', `Approve ${chId2} "Business purpose verified - equipment purchase"`);
  await wait(1000);

  approvals[chId2].push('CFO');
  printAgent([
    `${C.green}✓ CFO Approval Recorded${C.reset}`,
    `${C.dim}→ Signatures: 1 of 3${C.reset}`,
    '',
    `${C.yellow}⏳ Waiting for second signature...${C.reset}`
  ]);
  await wait(2000);

  // Second approval
  printUser('CTO', `Approve ${chId2} "Technical validation passed - legitimate vendor"`);
  await wait(1000);

  approvals[chId2].push('CTO');
  printAgent([
    `${C.green}✓ CTO Approval Recorded${C.reset}`,
    `${C.green}✓ Signatures: 2 of 3 - THRESHOLD MET${C.reset}`,
    '',
    `${C.yellow}⏳ Executing transaction...${C.reset}`
  ]);

  const tx3 = await executeTransfer(client, 40, '0.0.3003', 'vendor');
  await logToHCS(client, `MULTI_SIG_APPROVED: ${chId2} by CFO,CTO - 40 HBAR to vendor`);

  printCard('Transaction Success', [
    `${C.green}✓ CONFIRMED${C.reset}`,
    ``,
    `Amount: 40 HBAR → vendor`,
    `Challenge: ${chId2}`,
    `Approved by: CFO, CTO`,
    `Type: Multi-signature (2/3)`,
    ``,
    `TX ID: ${C.dim}${tx3}${C.reset}`
  ]);
  await wait(3000);

  // ═════════════════════════════════════════════════════════════
  // SUMMARY
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgBlue}${C.white}${C.bold} ALL PROMPTS EXECUTED ${C.reset}\n`);

  console.log(`${C.green}${C.bold}`);
  console.log('           🛡️  POLICYGUARD AGENT');
  console.log('');
  console.log('        Natural Language Interface');
  console.log(`${C.reset}\n`);

  printCard('Natural Language Prompts Used', [
    `1. "Pay Bob 2 HBAR"`,
    `   → Auto-approved`,
    ``,
    `2. "Send 30 HBAR to contractor"`,
    `   → Challenge → "Approve CH-001 ..."`,
    ``,
    `3. "Request 40 HBAR payment to vendor"`,
    `   → Multi-sig → CFO + CTO approve`,
  ]);

  printCard('Real Transactions Executed', [
    `${C.green}✓${C.reset} TX 1: 2 HBAR → Bob (Auto)`,
    `${C.green}✓${C.reset} TX 2: 30 HBAR → contractor`,
    `${C.green}✓${C.reset} TX 3: 40 HBAR → vendor`,
    ``,
    `Total: 72 HBAR + fees`,
    `Network: Hedera Testnet`,
    ``,
    `${C.blue}🔗 hashscan.io/testnet/account/${accountId}${C.reset}`
  ]);

  console.log(`\n${C.bold}${C.cyan}Demo complete! 🎉${C.reset}\n`);
  
  client.close();
}

runRealDemo().catch(err => {
  console.error(`${C.red}Error:${C.reset}`, err.message);
  process.exit(1);
});
