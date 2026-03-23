# 项目方案: PolicyGuard Agent - 人类监督的Hedera AI Agent

> **赛道**: AI & Agents  
> **Bounty**: Hashgraph Online / OpenClaw  
> **核心理念**: 让AI Agent拥有"道德暂停按钮"——任何交易都需要人类显式授权

---

## 🎯 一句话描述

一个由PolicyGuard保护的Hedera AI Agent，所有交易提案需经人类审批后上链执行，并永久记录审计日志。

---

## 💡 核心创新

### 解决的问题
1. **AI Agent的"黑盒"问题**: 用户不知道Agent要做什么就执行了
2. **资金安全**: 完全自主的Agent可能被攻击或出错
3. **合规需求**: 某些场景下AI交易需要人工审批

### 解决方案
```
┌──────────┐    1.提案     ┌──────────┐    2.拦截    ┌──────────┐
│  AI Agent │ ────────────>│PolicyGuard│ ───────────>│ 人类审批  │
└──────────┘               └──────────┘              └──────────┘
     │                                                    │
     │    5.执行 <──────────── 4.批准/拒绝 <───────────┘
     ↓                         3.记录HCS
┌──────────┐
│ Hedera   │
│ Network  │
└──────────┘
```

---

## 🏗️ 技术架构

### 系统组件

| 组件 | 技术 | 功能 |
|------|------|------|
| **Agent Runtime** | standards-agent-kit | AI Agent核心 |
| **PolicyGuard** | OpenClaw PolicyGuard | 交易拦截与审批 |
| **审计日志** | HCS-10 | 永久记录所有审批决策 |
| **凭证代币** | HTS | 审批凭证NFT |
| **前端** | Next.js | 审批界面 + Agent观察台 |

### Hedera服务使用

```typescript
// 1. HCS-10 审计日志
const auditMessage = {
  proposalId: "prop_001",
  action: "TRANSFER_HBAR",
  amount: 100,
  to: "0.0.12345",
  timestamp: Date.now(),
  policyGuardChallengeId: "106a5842fc5fce6f",
  decision: "APPROVED",
  approver: "user_001"
};
// → 发送到HCS Topic

// 2. HTS 审批凭证
const approvalToken = await createNFT({
  name: "PolicyGuard Approval #001",
  metadata: {
    proposalId: "prop_001",
    approvedAt: Date.now(),
    expiresAt: Date.now() + 3600000 // 1小时有效期
  }
});

// 3. 执行交易
const tx = await executeTransfer({
  amount: 100,
  to: "0.0.12345",
  // 必须持有有效的approvalToken
  approvalTokenId: approvalToken.id
});
```

---

## 📋 用户流程

### 场景1: 简单转账

```
用户: "帮我把100 HBAR转给alice"

Agent: "我计划执行以下交易：
        - 转出: 100 HBAR
        - 目标: alice (0.0.12345)
        - 当前余额: 500 HBAR
        
        [批准] [拒绝] [修改]"

PolicyGuard: Challenge created: 106a5842fc5fce6f

用户点击 [批准]

Agent: "✅ 交易已批准并执行
        - 交易ID: 0.0.xxx@timestamp
        - HCS审计记录: topic/0.0.xxx
        - 审批凭证NFT: 0.0.xxx"
```

### 场景2: 高风险操作

```
Agent: "检测到高风险交易：
        - 类型: 代币销毁 (BURN)
        - 数量: 1000 TOKEN
        - 风险等级: HIGH
        
        此操作不可逆，请确认：
        [我确认销毁] [取消]"

PolicyGuard: 需要二次确认 (二次挑战)
```

---

## 🎨 UI设计

### 审批界面 (Approver Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ PolicyGuard Agent 控制台                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  待审批交易 (3)                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ⚠️ 转账请求 #001                                     │    │
│  │ 类型: HBAR转账  |  金额: 100 HBAR  |  风险: LOW       │    │
│  │ [查看详情] [批准] [拒绝] [1小时后过期]                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  🔥 高风险交易 (1)                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔴 代币销毁 #002                                     │    │
│  │ 类型: TOKEN BURN  |  数量: 1000  |  风险: CRITICAL   │    │
│  │ [查看详情] [二次确认批准] [拒绝]                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  📊 审计日志                                                  │
│  - 今日审批: 12笔 (通过10，拒绝2)                            │
│  - 总交易量: 1,234 HBAR                                      │
│  [查看HCS记录]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agent观察台 (Observer Mode)

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Agent实时活动                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [实时流] Agent正在分析市场...                                │
│  [14:52:03] 检测到套利机会: HBAR/USDC 价差 0.5%              │
│  [14:52:04] 生成交易提案: 买入100 HBAR                      │
│  [14:52:04] ⏸️ 等待PolicyGuard审批...                        │
│                                                             │
│  最近决策：                                                  │
│  ✅ 14:45:12 - 转账50 HBAR给用户A (自动批准, 低风险)         │
│  ⏳ 14:52:04 - 买入100 HBAR (等待审批)                       │
│  ❌ 14:30:01 - 销毁代币 (用户拒绝)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 安全与信任机制

### 1. 风险分级系统

| 风险等级 | 阈值 | 处理方式 |
|---------|------|----------|
| LOW | < 10 HBAR | 可配置自动批准 |
| MEDIUM | 10-100 HBAR | 单次PolicyGuard审批 |
| HIGH | 100-1000 HBAR | 需二次确认 |
| CRITICAL | > 1000 HBAR 或 销毁操作 | 多重签名/延时执行 |

### 2. 时间锁 (Time Lock)

```typescript
// 高风险交易延时执行
if (riskLevel === 'CRITICAL') {
  // 24小时后执行
  const executeAt = Date.now() + 24 * 60 * 60 * 1000;
  scheduleDelayedExecution(tx, executeAt);
  
  // 期间可随时取消
  emitNotification(`交易将在24小时后执行，期间可取消`);
}
```

### 3. 紧急暂停

```typescript
// 紧急按钮 - 立即冻结Agent
const emergencyPause = async () => {
  await hcsPublish('EMERGENCY_PAUSE', { triggeredBy: userId });
  agent.freeze();
  // 需要多重签名才能解冻
};
```

---

## 🚀 扩展功能

### 1. 代理审批 (Delegation)
```
用户: "当交易金额<50 HBAR时，自动批准"
→ 设置智能规则，减少人工干预
```

### 2. 多签审批 (Multi-sig)
```
公司账户: 需要3/5个董事批准
→ 每个董事收到PolicyGuard通知
→ 达到阈值后自动执行
```

### 3. 审计报告生成
```
自动生成PDF审计报告：
- 时间范围选择
- 所有交易的审批记录
- HCS消息哈希验证
- 合规性检查
```

---

## 📊 评审标准对应

| 评审维度 | 本项目如何满足 |
|---------|--------------|
| **创新(10%)** | 首创"Human-in-the-loop" + PolicyGuard + Hedera的组合 |
| **可行性(10%)** | 所有组件已存在，只需集成；有清晰商业模式 |
| **执行(20%)** | 完整MVP：Agent + PolicyGuard + UI + HCS审计 |
| **集成(15%)** | 深度使用HCS(审计)、HTS(凭证)、Agent Kit |
| **成功(20%)** | 解决AI Agent安全痛点，可吸引机构用户 |
| **验证(15%)** | 可快速获得DeFi/机构用户反馈 |
| **Pitch(10%)** | 故事清晰："让AI Agent有道德暂停按钮" |

---

## 📝 Demo视频脚本 (3分钟)

```
0:00-0:30  开场 - 问题陈述
  "AI Agent能自动交易，但你敢让它完全自主吗？"
  展示一个完全自主Agent出错的新闻/案例
  
0:30-1:15  解决方案演示
  展示PolicyGuard Agent界面
  - Agent提出转账
  - PolicyGuard拦截
  - 用户查看详情
  - 用户批准
  - 交易执行
  - HCS日志记录
  
1:15-2:00  技术亮点
  - 展示代码：如何集成PolicyGuard
  - 展示HCS审计记录
  - 展示风险分级逻辑
  
2:00-2:30  高级功能
  - 多签审批演示
  - 紧急暂停演示
  
2:30-3:00  结尾
  "AI Agent的未来，是人类与AI共同决策的未来"
  GitHub链接 + 联系方式
```

---

## 🛠️ 开发路线图

### Day 1-2: 基础
- [ ] 搭建Agent基础 (standards-agent-kit)
- [ ] 集成PolicyGuard拦截机制
- [ ] 基础审批UI

### Day 3-4: Hedera集成
- [ ] HCS审计日志
- [ ] HTS审批凭证NFT
- [ ] 交易执行与验证

### Day 5-6: 高级功能
- [ ] 风险分级系统
- [ ] 多签支持
- [ ] 紧急暂停

### Day 7: 完善与提交
- [ ] UI优化
- [ ] Demo视频
- [ ] 文档完善
- [ ] 提交

---

*方案设计: 2026-03-23*  
*这是一个既有技术创新又有实际价值的项目！*
