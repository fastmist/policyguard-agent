#!/usr/bin/env ts-node
/**
 * 🎬 Demo Video - Simulation Mode (No Real Transactions)
 * Pure UI demonstration with mock data
 */

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
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
  black: '\x1b[30m',
};

function clear() { console.clear(); }
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated transaction store
const transactions: any[] = [];
const challenges: any[] = [];

async function showPrompt(prompt: string, user: string = "User") {
  console.log(`\n${C.cyan}┌─ ${user}${C.reset}`);
  console.log(`${C.cyan}│${C.reset}  ${C.bold}${prompt}${C.reset}`);
  console.log(`${C.cyan}└─${C.reset}`);
  await wait(800);
}

async function showSystemResponse(lines: string[]) {
  console.log(`\n${C.green}┌─ PolicyGuard Agent${C.reset}`);
  for (const line of lines) {
    console.log(`${C.green}│${C.reset}  ${line}`);
  }
  console.log(`${C.green}└─${C.reset}`);
  await wait(1200);
}

async function showCard(title: string, content: string[]) {
  const width = 50;
  console.log(`\n${C.dim}┌${'─'.repeat(width)}┐${C.reset}`);
  console.log(`${C.dim}│${C.reset} ${C.bold}${title.padEnd(width-1)}${C.dim}│${C.reset}`);
  console.log(`${C.dim}├${'─'.repeat(width)}┤${C.reset}`);
  for (const line of content) {
    console.log(`${C.dim}│${C.reset} ${line.padEnd(width-1)}${C.dim}│${C.reset}`);
  }
  console.log(`${C.dim}└${'─'.repeat(width)}┘${C.reset}`);
  await wait(1000);
}

async function runSimulation() {
  console.log(`${C.bold}${C.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║     🎬 POLICYGUARD AGENT - DEMO (Simulation Mode)          ║');
  console.log('║                                                            ║');
  console.log('║     Pure UI Demo - No Real Transactions                    ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${C.reset}\n`);

  console.log(`${C.yellow}ℹ️  Simulation Mode: All transactions are mocked${C.reset}`);
  console.log(`   No HBAR will be transferred\n`);
  console.log('Press Ctrl+C to exit, or wait 2 seconds to start...\n');
  await wait(2000);

  // ═════════════════════════════════════════════════════════════
  // SCENE 1: INTRO
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgBlue}${C.white}${C.bold} SCENE 1: THE PROBLEM ${C.reset}\n`);
  
  console.log(`${C.white}${C.bold}  🤖 AI AGENTS + 💰 MONEY = ⚠️ DANGER${C.reset}\n`);
  
  console.log(`${C.yellow}🎙️  Narration:${C.reset} AI agents can trade crypto and manage money.`);
  await wait(2000);
  console.log(`${C.yellow}🎙️  Narration:${C.reset} But what if they hallucinate or get hacked?`);
  await wait(2000);
  
  console.log(`\n  ${C.red}❌ $50M lost to AI exploits in 2024${C.reset}`);
  console.log(`  ${C.red}❌ One mistake = Funds gone forever${C.reset}\n`);
  await wait(2000);

  // ═════════════════════════════════════════════════════════════
  // SCENE 2: SOLUTION
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgBlue}${C.white}${C.bold} SCENE 2: POLICYGUARD SOLUTION ${C.reset}\n`);
  
  console.log(`${C.green}  🛡️  PolicyGuard Agent${C.reset}`);
  console.log(`     "Human-in-the-loop AI with Immutable Audit Trail"\n`);

  await showCard('How It Works', [
    '🤖 AI Agent      → Proposes transaction',
    '🛡️  PolicyGuard   → Assesses risk level',
    '👤 Human         → Reviews & approves',
    '⛓️  Hedera        → Executes + Audits',
  ]);

  await showCard('Risk Levels', [
    `${C.green}🟢 LOW${C.reset}      ≤10 HBAR   → Auto-approve`,
    `${C.yellow}🟡 MEDIUM${C.reset}   ≤100 HBAR  → 1 approval`,
    `${C.red}🟠 HIGH${C.reset}     100-1000   → Multi-sig (2/3)`,
    `${C.red}🔴 CRITICAL${C.reset} >1000      → Multi-sig + Time lock`,
  ]);

  // ═════════════════════════════════════════════════════════════
  // SCENE 3: AUTO-APPROVAL DEMO
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgGreen}${C.white}${C.bold} SCENE 3: DEMO - AUTO-APPROVAL ${C.reset}\n`);

  // PROMPT 1
  await showPrompt('Pay Bob 2 HBAR for coffee', '👤 Alice');

  await showSystemResponse([
    'Processing transaction...',
    `${C.dim}→ Amount: 2 HBAR${C.reset}`,
    `${C.dim}→ Recipient: 0.0.1001 (Bob)${C.reset}`,
    `${C.dim}→ Risk Assessment: LOW${C.reset}`,
    '',
    `${C.green}✓ Auto-approved (below 10 HBAR threshold)${C.reset}`,
  ]);

  // Mock transaction
  const tx1 = {
    id: `TX-${Date.now()}`,
    amount: 2,
    to: '0.0.1001',
    status: 'EXECUTED',
    risk: 'LOW',
    autoApproved: true,
    timestamp: new Date().toISOString()
  };
  transactions.push(tx1);

  await showCard('Transaction Executed', [
    `Status: ${C.green}✓ SUCCESS${C.reset}`,
    `Amount: 2 HBAR → Bob`,
    `Type: Auto-approved`,
    `TX ID: ${tx1.id}`,
    '',
    `${C.blue}📝 HCS Audit:${C.reset} Event logged`,
  ]);

  // ═════════════════════════════════════════════════════════════
  // SCENE 4: HUMAN APPROVAL DEMO
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgYellow}${C.black}${C.bold} SCENE 4: DEMO - HUMAN APPROVAL ${C.reset}\n`);

  // PROMPT 2
  await showPrompt('Send 30 HBAR to contractor at 0.0.2002', '👤 Alice');

  await showSystemResponse([
    'Processing transaction...',
    `${C.dim}→ Amount: 30 HBAR${C.reset}`,
    `${C.dim}→ Recipient: 0.0.2002 (New)${C.reset}`,
    `${C.dim}→ Risk Assessment: MEDIUM${C.reset}`,
    '',
    `${C.yellow}⚠️  Challenge Created${C.reset}`,
  ]);

  const challenge1 = {
    id: 'CH-001',
    amount: 30,
    to: '0.0.2002',
    status: 'PENDING',
    risk: 'MEDIUM'
  };
  challenges.push(challenge1);

  await showCard('Challenge Created', [
    `ID: ${C.yellow}${challenge1.id}${C.reset}`,
    `Amount: 30 HBAR`,
    `To: 0.0.2002`,
    `Risk: MEDIUM`,
    `Status: ${C.yellow}⏳ PENDING${C.reset}`,
    '',
    'Required: Human approval',
  ]);

  // Show pending
  console.log(`\n${C.dim}Pending Challenges:${C.reset}`);
  console.log(`  • ${challenge1.id}: 30 HBAR to ${challenge1.to} [${challenge1.risk}]`);
  await wait(1500);

  // PROMPT 3
  await showPrompt('/approve CH-001 "Verified contractor payment"', '👤 Alice');

  challenge1.status = 'APPROVED';
  
  await showSystemResponse([
    `${C.green}✓ Challenge Approved${C.reset}`,
    `Approver: Alice`,
    `Reason: Verified contractor payment`,
    '',
    'Executing transaction...',
  ]);

  const tx2 = {
    id: `TX-${Date.now()}`,
    amount: 30,
    to: '0.0.2002',
    status: 'EXECUTED',
    risk: 'MEDIUM',
    challengeId: 'CH-001',
    approvedBy: ['Alice'],
    timestamp: new Date().toISOString()
  };
  transactions.push(tx2);

  await showCard('Transaction Executed', [
    `Status: ${C.green}✓ SUCCESS${C.reset}`,
    `Amount: 30 HBAR → Contractor`,
    `Type: Human-approved`,
    `TX ID: ${tx2.id}`,
  ]);

  // Key point
  console.log(`\n${C.cyan}💡 Key Point:${C.reset} Without approval, AI cannot act.`);
  console.log(`   Human control is enforced by PolicyGuard.\n`);
  await wait(2000);

  // ═════════════════════════════════════════════════════════════
  // SCENE 5: MULTI-SIG DEMO
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgRed}${C.white}${C.bold} SCENE 5: DEMO - MULTI-SIGNATURE ${C.reset}\n`);

  // PROMPT 4
  await showPrompt('Request 40 HBAR payment for equipment to 0.0.3003', '👤 Employee');

  await showSystemResponse([
    'Processing transaction...',
    `${C.dim}→ Amount: 40 HBAR${C.reset}`,
    `${C.dim}→ Recipient: 0.0.3003${C.reset}`,
    `${C.dim}→ Risk Assessment: HIGH${C.reset}`,
    '',
    `${C.red}⚠️  Multi-Sig Challenge Created${C.reset}`,
  ]);

  const challenge2 = {
    id: 'CH-002',
    amount: 40,
    to: '0.0.3003',
    status: 'PENDING',
    risk: 'HIGH',
    required: 2,
    approvers: ['CFO', 'CTO', 'Security Lead']
  };
  challenges.push(challenge2);

  await showCard('Multi-Sig Challenge', [
    `ID: ${C.red}${challenge2.id}${C.reset}`,
    `Amount: 40 HBAR`,
    `Required: ${C.yellow}2 of 3 approvers${C.reset}`,
    '',
    'Approvers:',
    '  • CFO (Finance)',
    '  • CTO (Technical)',
    '  • Security Lead',
  ]);

  // PROMPT 5
  await showPrompt('/approve CH-002 "Business purpose verified - equipment purchase"', '👤 CFO');

  await showSystemResponse([
    `${C.green}✓ CFO Approval Recorded${C.reset}`,
    'Signatures: 1 of 3',
    '',
    `${C.yellow}⏳ Waiting for second signature...${C.reset}`,
  ]);

  // PROMPT 6
  await showPrompt('/approve CH-002 "Technical validation passed - legitimate vendor"', '👤 CTO');

  challenge2.status = 'APPROVED';

  await showSystemResponse([
    `${C.green}✓ CTO Approval Recorded${C.reset}`,
    `${C.green}✓ Signatures: 2 of 3 - THRESHOLD MET${C.reset}`,
    '',
    'Executing transaction...',
  ]);

  const tx3 = {
    id: `TX-${Date.now()}`,
    amount: 40,
    to: '0.0.3003',
    status: 'EXECUTED',
    risk: 'HIGH',
    challengeId: 'CH-002',
    approvedBy: ['CFO', 'CTO'],
    timestamp: new Date().toISOString()
  };
  transactions.push(tx3);

  await showCard('Transaction Executed', [
    `Status: ${C.green}✓ SUCCESS${C.reset}`,
    `Amount: 40 HBAR → Equipment Vendor`,
    `Type: Multi-signature (2/3)`,
    `TX ID: ${tx3.id}`,
    '',
    'Approved by: CFO, CTO',
  ]);

  console.log(`\n${C.cyan}💡 Security Value:${C.reset} No single person can approve.`);
  console.log(`   Prevents both AI errors and insider threats.\n`);
  await wait(2000);

  // ═════════════════════════════════════════════════════════════
  // SCENE 6: AUDIT TRAIL
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgBlue}${C.white}${C.bold} SCENE 6: IMMUTABLE AUDIT TRAIL ${C.reset}\n`);

  await showCard('Hedera Consensus Service', [
    `${C.blue}📝 Audit Topic:${C.reset} 0.0.8342181`,
    '',
    'All events permanently recorded:',
  ]);

  console.log(`\n${C.dim}Recent Audit Events:${C.reset}`);
  console.log(`  ${C.green}✓${C.reset} AUTO_APPROVED   2 HBAR  → Bob`);
  console.log(`  ${C.green}✓${C.reset} CHALLENGE_CREATED   30 HBAR → Contractor`);
  console.log(`  ${C.green}✓${C.reset} CHALLENGE_APPROVED  30 HBAR by Alice`);
  console.log(`  ${C.green}✓${C.reset} MULTI_SIG_CREATED   40 HBAR → Equipment`);
  console.log(`  ${C.green}✓${C.reset} MULTI_SIG_APPROVED  40 HBAR by CFO,CTO`);

  await showCard('Benefits', [
    `${C.green}✓${C.reset} Regulators can verify compliance`,
    `${C.green}✓${C.reset} Insurance can audit policies`,
    `${C.green}✓${C.reset} No one can tamper with history`,
    `${C.green}✓${C.reset} Complete transparency`,
  ]);

  // ═════════════════════════════════════════════════════════════
  // SCENE 7: SUMMARY
  // ═════════════════════════════════════════════════════════════
  clear();
  console.log(`${C.bgGreen}${C.white}${C.bold} SCENE 7: SUMMARY ${C.reset}\n`);

  console.log(`${C.green}${C.bold}`);
  console.log('            🛡️  POLICYGUARD AGENT');
  console.log('');
  console.log('         Safe AI. Human Control.');
  console.log('         Immutable Proof.');
  console.log(`${C.reset}\n`);

  await showCard('Features Demonstrated', [
    `${C.green}✓${C.reset} Auto-approval for low risk`,
    `${C.green}✓${C.reset} Human approval for medium risk`,
    `${C.green}✓${C.reset} Multi-sig for high risk`,
    `${C.green}✓${C.reset} Immutable HCS audit trail`,
    `${C.green}✓${C.reset} Real-time transaction tracking`,
  ]);

  console.log(`\n${C.cyan}All Prompts Used in Demo:${C.reset}\n`);
  console.log('  1. "Pay Bob 2 HBAR for coffee"');
  console.log('  2. "Send 30 HBAR to contractor at 0.0.2002"');
  console.log('  3. /approve CH-001 "Verified contractor payment"');
  console.log('  4. "Request 40 HBAR payment for equipment to 0.0.3003"');
  console.log('  5. /approve CH-002 "Business purpose verified..."');
  console.log('  6. /approve CH-002 "Technical validation passed..."');

  console.log(`\n${C.bold}${C.cyan}Thank you! 🎉${C.reset}\n`);
}

runSimulation().catch(console.error);
