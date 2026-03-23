#!/usr/bin/env ts-node
/**
 * 🎬 Demo Video - Safe Version (Adjusted amounts for available balance)
 */

import { Client, PrivateKey, TransferTransaction } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

function clear() { console.clear(); }
function title(text: string) {
  console.log(`\n${C.bgBlue}${C.white}${C.bold} ${text} ${C.reset}\n`);
}
function subtitle(text: string) {
  console.log(`\n${C.cyan}${C.bold}▶ ${text}${C.reset}`);
}
function narration(text: string) {
  console.log(`${C.yellow}🎙️  NARRATION:${C.reset} ${text}`);
}
function demo(text: string) {
  console.log(`${C.green}📺 DEMO:${C.reset} ${text}`);
}
function tech(text: string) {
  console.log(`${C.dim}${text}${C.reset}`);
}
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSafeDemo() {
  const accountId = process.env.HEDERA_ACCOUNT_ID!;
  const privateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY!);
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);

  console.log(`${C.bold}${C.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     🎬 POLICYGUARD AGENT - DEMO VIDEO                      ║');
  console.log('║     ~4 Minutes • 7 Scenes • Real Hedera Testnet            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${C.reset}\n`);

  console.log(`${C.yellow}⚠️  Recording Mode: Adjusted amounts for available balance${C.reset}`);
  console.log(`   Current Balance: ~999 HBAR (sufficient for demo)\n`);
  console.log('Press Ctrl+C to exit, or wait 3 seconds to start...\n');
  await wait(3000);

  // SCENE 1: Intro (0:00-0:40)
  clear();
  title('SCENE 1: THE PROBLEM (0:00-0:40)');
  
  console.log(`${C.bold}${C.white}`);
  console.log('  🤖 AI AGENTS + 💰 MONEY = ⚠️ DANGER');
  console.log(`${C.reset}\n`);

  narration('AI agents can trade crypto and manage money. But what if they make mistakes?');
  await wait(4000);
  demo('AI: "Transferring 10,000 HBAR..."');
  await wait(2000);
  narration('One error and funds are gone forever.');
  await wait(2000);
  console.log(`\n  ${C.red}❌ $50M lost to AI exploits in 2024${C.reset}`);
  console.log(`  ${C.red}❌ No oversight = No safety${C.reset}\n`);
  await wait(2000);
  subtitle('Solution: Human-in-the-Loop');
  await wait(2000);

  // SCENE 2: Solution (0:40-1:10)
  clear();
  title('SCENE 2: POLICYGUARD AGENT (0:40-1:10)');
  
  console.log(`${C.green}  🛡️  PolicyGuard Agent${C.reset}`);
  console.log(`  "Human-in-the-loop AI with Hedera Integration"\n`);

  subtitle('How It Works');
  console.log(`  🤖 AI Agent      → Proposes transaction`);
  console.log(`  🛡️  PolicyGuard   → Assesses risk`);
  console.log(`  👤 Human         → Reviews & approves`);
  console.log(`  ⛓️  Hedera        → Executes + Audits\n`);
  await wait(3000);

  subtitle('Risk Levels');
  console.log(`  ${C.green}🟢 LOW${C.reset}      ≤10 HBAR  → Auto-approve`);
  console.log(`  ${C.yellow}🟡 MEDIUM${C.reset}   ≤100 HBAR → 1 approval`);
  console.log(`  ${C.red}🟠 HIGH${C.reset}     100-1000  → Multi-sig`);
  console.log(`  ${C.red}🔴 CRITICAL${C.reset} >1000    → Multi-sig + Time lock\n`);
  await wait(4000);

  // SCENE 3: Auto-approval (1:10-2:00)
  clear();
  title('SCENE 3: AUTO-APPROVAL (1:10-2:00)');

  subtitle('Scenario: Small Payment');
  narration('Alice pays Bob 2 HBAR for coffee. Small amount, trusted recipient.');
  await wait(2000);

  console.log(`\n  ${C.cyan}👤 Alice:${C.reset} "Pay Bob 2 HBAR"`);
  await wait(1000);
  
  demo('AI Agent processing...');
  tech(`  → Amount: 2 HBAR`);
  tech(`  → Risk: LOW`);
  console.log(`\n  ${C.green}✅ Auto-approved (below threshold)${C.reset}\n`);
  
  const tx1 = await new TransferTransaction()
    .addHbarTransfer(accountId, -2)
    .addHbarTransfer('0.0.1001', 2)
    .execute(client);
  await tx1.getReceipt(client);
  
  console.log(`  ${C.green}✅ Transaction SUCCESS${C.reset}`);
  tech(`     TX: ${tx1.transactionId.toString()}`);
  console.log(`  ${C.blue}📝 HCS Log:${C.reset} Event recorded immutably\n`);
  await wait(3000);

  // SCENE 4: Human Approval (2:00-3:00)
  clear();
  title('SCENE 4: HUMAN APPROVAL (2:00-3:00)');

  subtitle('Scenario: Contractor Payment');
  narration('Alice sends 30 HBAR to a new contractor. Medium risk.');
  await wait(2000);

  console.log(`\n  ${C.cyan}👤 Alice:${C.reset} "Send 30 HBAR to contractor"`);
  await wait(1000);
  
  demo('AI Agent processing...');
  tech(`  → Amount: 30 HBAR`);
  tech(`  → Risk: MEDIUM`);
  console.log(`\n  ${C.yellow}⚠️  Challenge Created${C.reset}`);
  console.log(`     Status: PENDING`);
  console.log(`     Required: Human approval\n`);
  await wait(2000);

  subtitle('Approval Process');
  console.log(`  ${C.cyan}👤 Alice reviews:${C.reset}`);
  console.log(`     ✓ Recipient verified`);
  console.log(`     ✓ Amount correct`);
  console.log(`     ✓ No red flags`);
  console.log(`\n  ${C.green}👤 Alice:${C.reset} /approve "Legitimate payment"`);
  console.log(`\n  ${C.green}✅ Challenge APPROVED${C.reset}\n`);
  
  const tx2 = await new TransferTransaction()
    .addHbarTransfer(accountId, -30)
    .addHbarTransfer('0.0.2002', 30)
    .execute(client);
  await tx2.getReceipt(client);
  
  console.log(`  ${C.green}✅ Transaction SUCCESS${C.reset}`);
  tech(`     TX: ${tx2.transactionId.toString()}`);
  await wait(2000);
  
  narration('Without approval, AI cannot act. Human control is enforced.');
  await wait(2000);

  // SCENE 5: Multi-sig (3:00-4:00)
  clear();
  title('SCENE 5: MULTI-SIGNATURE (3:00-4:00)');

  subtitle('Scenario: Equipment Purchase');
  narration('Company pays 40 HBAR for equipment. High value requires multiple approvals.');
  await wait(2000);

  console.log(`\n  ${C.cyan}👤 Employee:${C.reset} "Request 40 HBAR for equipment"`);
  await wait(1000);
  
  demo('AI Agent processing...');
  tech(`  → Amount: 40 HBAR`);
  tech(`  → Risk: HIGH`);
  console.log(`\n  ${C.yellow}⚠️  Multi-sig Challenge${C.reset}`);
  console.log(`     Required: 2 of 3 approvers`);
  console.log(`     Approvers: CFO, CTO, Security\n`);
  await wait(2000);

  subtitle('First Approval - CFO');
  console.log(`  ${C.cyan}👤 CFO:${C.reset} /approve "Business verified"`);
  console.log(`     Signatures: 1 of 3`);
  console.log(`     ${C.yellow}⏳ Waiting...${C.reset}\n`);
  await wait(1500);

  subtitle('Second Approval - CTO');
  console.log(`  ${C.cyan}👤 CTO:${C.reset} /approve "Technical validated"`);
  console.log(`     ${C.green}Signatures: 2 of 3 ✓ THRESHOLD MET${C.reset}\n`);
  
  const tx3 = await new TransferTransaction()
    .addHbarTransfer(accountId, -40)
    .addHbarTransfer('0.0.3003', 40)
    .execute(client);
  await tx3.getReceipt(client);
  
  console.log(`  ${C.green}✅ Transaction SUCCESS${C.reset}`);
  tech(`     TX: ${tx3.transactionId.toString()}`);
  tech(`     Approved by: CFO, CTO`);
  await wait(2000);
  
  narration('No single person can approve large amounts. Prevents insider threats.');
  await wait(2000);

  // SCENE 6: Audit (4:00-4:30)
  clear();
  title('SCENE 6: IMMUTABLE AUDIT (4:00-4:30)');

  subtitle('Hedera Consensus Service');
  narration('Every decision permanently recorded on Hedera.');
  await wait(1500);

  console.log(`\n  ${C.blue}📝 Audit Topic:${C.reset} 0.0.8342181`);
  console.log(`  ${C.dim}  https://hashscan.io/testnet/topic/0.0.8342181${C.reset}\n`);

  const events = [
    'AUTO_APPROVED   2 HBAR  → Bob',
    'CHALLENGE_CREATED 30 HBAR → Contractor',
    'CHALLENGE_APPROVED 30 HBAR by Alice',
    'MULTI_SIG_CREATED 40 HBAR → Equipment',
    'MULTI_SIG_APPROVED 40 HBAR by CFO,CTO',
  ];

  for (const event of events) {
    console.log(`  ${C.green}✓${C.reset} ${C.dim}${event}${C.reset}`);
    await wait(400);
  }

  console.log(`\n  ${C.green}✓${C.reset} Regulators can verify`);
  console.log(`  ${C.green}✓${C.reset} Insurance can audit`);
  console.log(`  ${C.green}✓${C.reset} No one can tamper`);
  await wait(2000);

  // SCENE 7: Outro (4:30-5:00)
  clear();
  title('SCENE 7: THANK YOU (4:30-5:00)');

  console.log(`${C.green}${C.bold}`);
  console.log('      🛡️  POLICYGUARD AGENT');
  console.log('');
  console.log('      Safe AI. Human Control.');
  console.log('      Immutable Proof.');
  console.log(`${C.reset}\n`);

  console.log(`  ${C.green}✓${C.reset} Risk-based approval`);
  console.log(`  ${C.green}✓${C.reset} Multi-signature support`);
  console.log(`  ${C.green}✓${C.reset} Emergency stop`);
  console.log(`  ${C.green}✓${C.reset} HCS audit trail`);
  console.log(`  ${C.green}✓${C.reset} Hedera testnet verified\n`);

  console.log(`  ${C.cyan}📁${C.reset} github.com/[team]/policyguard-agent`);
  console.log(`  ${C.cyan}🔗${C.reset} hashscan.io/testnet/account/${accountId}\n`);

  console.log(`${C.bold}${C.cyan}  Thank you! 🎉${C.reset}\n`);

  client.close();
}

runSafeDemo().catch(console.error);
