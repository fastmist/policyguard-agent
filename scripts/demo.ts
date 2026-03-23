// scripts/demo.ts - Quick demo without real Hedera account

import { DemoPolicyGuardedAgent } from '../src/agent/demo-agent';

async function demo() {
  console.log(`
🎬 PolicyGuard Agent - DEMO MODE
═══════════════════════════════════
无需 Hedera 账户，完整演示 Human-in-the-loop 流程
`);

  const agent = new DemoPolicyGuardedAgent();

  // 1. Check balance
  console.log('1️⃣ 查看余额');
  const balance = await agent.getBalance();
  console.log(`   Account: ${balance.accountId}`);
  console.log(`   Balance: ${balance.hbar} HBAR\n`);

  // 2. Create transfer
  console.log('2️⃣ 发起转账 (10 HBAR 到 0.0.54321)');
  const result = await agent.transfer({ to: '0.0.54321', amount: 10 });
  console.log(`   ${result.message}\n`);

  if (result.pending && result.challengeId) {
    // 3. Show pending
    console.log('3️⃣ 查看待审批列表');
    const pending = agent.getPendingChallenges();
    console.log(`   待审批: ${pending.length} 个`);
    console.log(`   Challenge ID: ${result.challengeId}\n`);

    // 4. Approve
    console.log('4️⃣ 批准交易');
    await agent.approveChallenge(result.challengeId, 'Demo approval');
    console.log('   ✅ 已批准并执行\n');

    // 5. Check balance again
    console.log('5️⃣ 查看更新后余额');
    const newBalance = await agent.getBalance();
    console.log(`   Balance: ${newBalance.hbar} HBAR\n`);

    // 6. View audit logs
    console.log('6️⃣ 查看审计日志');
    const logs = await agent.getAuditLogs(5);
    console.log(`   最近 ${logs.length} 条记录:`);
    logs.forEach((log, i) => {
      console.log(`   [${i+1}] ${log.message.type} at ${new Date(log.timestamp).toLocaleTimeString()}`);
    });
  }

  console.log(`
═══════════════════════════════════
Demo 完成！

要连接真实 Hedera 网络:
1. 获取测试网账户: https://portal.hedera.com/faucet
2. 创建 .env 文件
3. 运行: npm run dev
`);
}

demo().catch(console.error);
