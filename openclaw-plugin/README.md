# PolicyGuard OpenClaw Plugin

自然语言触发 PolicyGuard Agent 的 OpenClaw 插件。

## 功能

- 自然语言发起转账（自动检测风险等级）
- 查询余额和待审批列表
- 批准/拒绝 Challenge
- 查看审计日志

## 命令

| 自然语言 | 功能 |
|----------|------|
| "Pay [recipient] [amount] HBAR" | 发起转账 |
| "Send [amount] HBAR to [recipient]" | 发起转账 |
| "Transfer [amount] HBAR to [recipient]" | 发起转账 |
| "Approve [challenge-id]" | 批准 Challenge |
| "Reject [challenge-id]" | 拒绝 Challenge |
| "Show balance" / "余额" | 查询余额 |
| "List pending" / "待审批" | 查看待审批列表 |
| "Show audit logs" / "审计日志" | 查看审计记录 |

## 示例

```
User: Pay Bob 5 HBAR
Agent: ✅ Auto-approved! Transaction executed.
       TX ID: 0.0.8339596@...

User: Send 50 HBAR to contractor
Agent: ⚠️ Challenge created: CH-001
       Risk: MEDIUM | Status: PENDING
       Required: Human approval

User: Approve CH-001
Agent: ✅ Challenge approved! Executing transaction...

User: 余额
Agent: 💰 Balance: 945.67 HBAR
```
