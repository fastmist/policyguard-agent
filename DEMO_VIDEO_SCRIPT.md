# Demo Video Script - PolicyGuard Agent
# Hedera Hello Future Apex Hackathon 2026
# Duration: 3 minutes

## 🎬 视频结构 (3分钟)

---

## 开场 (0:00 - 0:30) - 30秒

**[镜头：终端全屏，黑底绿字风格]**

```bash
# 输入命令
npm run demo
```

**旁白**：
> "AI Agent 可以自主执行交易，但如果它出错呢？
> 如果它被攻击呢？如果它做了你不希望的事呢？
> 这就是 PolicyGuard Agent 要解决的核心问题。"

**[屏幕展示 Demo 启动画面]**

---

## 问题展示 (0:30 - 1:00) - 30秒

**[镜头：展示代码架构图 或 简单示意图]**

```
┌─────────────┐         ┌─────────────┐
│  AI Agent   │ ──────> │  Transaction │
└─────────────┘         └─────────────┘
       ❌ 没有监督
       ❌ 没有审计
       ❌ 没有撤销
```

**旁白**：
> "当前的 AI Agent 是'黑盒'——你给了它权限，
> 却不知道它会做什么。一旦开始，无法停止。
> 我们需要一个'暂停按钮'。"

---

## 解决方案演示 (1:00 - 2:00) - 60秒

**[镜头：终端，展示完整流程]**

### Step 1: 查看余额
```bash
npm run demo
```
**输出**：
```
Account: 0.0.8339596
Balance: 999.88 HBAR
```

### Step 2: 发起转账（被拦截）
```
发起转账 50 HBAR 到 0.0.12345
```
**输出**：
```
⚠️  [MEDIUM RISK] Transaction requires approval
Challenge ID: pg_xxxxxx
Status: PENDING
```

**旁白**：
> "当 Agent 想要转账时，PolicyGuard 拦截了它。
> 不是自动执行，而是生成一个审批挑战。"

### Step 3: 查看待审批
```
⏳ Pending Challenges: 1
  - Transfer 50 HBAR → 0.0.12345
  - Risk Level: MEDIUM
  - Challenge: pg_xxxxxx
```

### Step 4: 人类批准
```bash
# 模拟批准
approve pg_xxxxxx
```
**输出**：
```
✅ Challenge approved
✅ Transaction executed
✅ Audit log recorded on HCS
```

**旁白**：
> "人类检查、人类决定、人类批准。
> 只有通过后，交易才会上链执行。"

---

## 技术亮点 (2:00 - 2:30) - 30秒

**[镜头：代码片段 + HashScan 链接]**

展示：
1. **HCS 审计日志** - https://hashscan.io/testnet/topic/0.0.8342181
2. **GitHub 代码** - 展示核心拦截器代码

```typescript
// PolicyGuard 拦截器
async intercept(proposal: TransactionProposal) {
  const risk = assessRisk(proposal);
  if (risk !== 'LOW') {
    return await createChallenge(proposal);
  }
  return await execute(proposal);
}
```

**旁白**：
> "所有决策都记录在 Hedera Consensus Service 上，
> 不可篡改、永久可查。
> 风险分级系统确保小额交易可以快速处理，
> 大额交易必须人工审批。"

---

## 结尾 (2:30 - 3:00) - 30秒

**[镜头：回到终端，展示最终状态]**

```
✅ Demo Complete

PolicyGuard Agent
- Human-in-the-loop security
- Immutable audit trail
- Risk-based approval

GitHub: github.com/yourusername/policyguard-agent
```

**旁白**：
> "PolicyGuard Agent——让 AI 有监督，让交易有记录，让安全有保障。
> 谢谢观看。"

---

## 📝 录制提示

### 环境准备
```bash
cd hedera-apex-hackathon-2026
npm run demo
```

### 屏幕设置
- 终端全屏，字体调大 (建议 18pt+)
- 使用深色主题 (推荐 Dracula 或 Monokai)
- 确保输出清晰可见

### 配音建议
- 语速适中，每段之间留 2-3 秒停顿
- 重点强调 "Human-in-the-loop"、"PolicyGuard"、"HCS"
- 可以后期加字幕

### 背景音乐 (可选)
- 科技感/电子音乐
- 音量调低，不要覆盖人声

---

## 🎯 提交要求

**视频要求**：
- 长度：不超过 3 分钟 ✅
- 格式：MP4 或 YouTube 链接
- 必须展示可运行的 Demo

**我们的视频将展示**：
1. ✅ 真实 Hedera 测试网账户 (0.0.8339596)
2. ✅ 真实 HCS Topic (0.0.8342181)
3. ✅ 完整的 Human-in-the-loop 流程
4. ✅ 审计日志上链验证

---

**录制完成后上传到 YouTube，获取链接填入提交表单**
