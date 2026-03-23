# PolicyGuard + Hedera 快速启动指南

> 5分钟上手 PolicyGuard Agent 开发

---

## 🎯 项目核心概念

```
用户指令 → Agent生成提案 → PolicyGuard拦截 → 人类审批 → 链上执行 + HCS审计
```

这是一个**人类监督的AI Agent**——让AI有"道德暂停按钮"。

---

## 🚀 5分钟快速开始

### 步骤1: 复制代码框架

```bash
cd /root/.openclaw/workspace/hedera-apex-hackathon-2026
mkdir -p src/{agent,api,frontend}

# 核心文件已创建在 docs/INTEGRATION_CODE.md
# 按下面的说明拆分使用
```

### 步骤2: 安装依赖

```bash
npm init -y

# Hedera + Agent Kit
npm install @hashgraphonline/standards-agent-kit

# PolicyGuard (假设的包名，实际需要确认)
npm install @openclaw/policyguard

# API框架
npm install express
npm install --save-dev @types/express typescript
```

### 步骤3: 环境配置

```bash
cat > .env << 'EOF'
# Hedera测试网 (从 https://portal.hedera.com/ 获取)
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=0x...

# PolicyGuard
POLICYGUARD_ENDPOINT=https://policyguard.openclaw.ai

# HCS审计Topic (使用现有或创建新的)
AUDIT_TOPIC_ID=0.0.xxxxx

# 可选: OpenAI
OPENAI_API_KEY=sk-...
EOF
```

### 步骤4: 启动开发

```bash
# 初始化TypeScript
npx tsc --init

# 启动API服务
npx ts-node src/api/server.ts

# 前端 (在另一个终端)
cd frontend && npm run dev
```

---

## 📂 项目文件结构

```
src/
├── agent/
│   ├── index.ts                 # Agent主类
│   ├── policy-guard-interceptor.ts  # PolicyGuard拦截器
│   └── types.ts                 # 类型定义
├── api/
│   ├── server.ts                # Express服务器
│   └── routes.ts                # API路由
├── hedera/
│   ├── hcs-client.ts            # HCS操作封装
│   └── hts-client.ts            # HTS操作封装
└── utils/
    └── risk-assessor.ts         # 风险评估

frontend/
├── components/
│   ├── ApprovalCard.tsx         # 审批卡片
│   ├── AgentObserver.tsx        # Agent观察台
│   └── AuditLog.tsx             # 审计日志
└── pages/
    └── index.tsx                # 主页面
```

---

## 🎮 开发流程

### 1. 发起交易提案

```bash
curl -X POST http://localhost:3000/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0.0.54321",
    "amount": 100
  }'
```

**返回**:
```json
{
  "success": false,
  "message": "⏸️ 等待PolicyGuard审批 (Challenge: 106a5842fc5fce6f)"
}
```

### 2. 审批界面显示

前端会自动显示待审批卡片：
```
┌──────────────────────────────────────┐
│ 交易 #tx_123456789                   │
│ 🔴 HIGH 风险                         │
│ 类型: TRANSFER                       │
│ 金额: 100 HBAR                       │
│ 目标: 0.0.54321                      │
│ Challenge: 106a5842fc5fce6f          │
│                                      │
│ [✅ 批准]  [❌ 拒绝]                 │
└──────────────────────────────────────┘
```

### 3. 执行审批

```bash
# 手动审批 (实际应用中通过UI点击触发)
/openclaw/policyguard/approve 106a5842fc5fce6f "批准转账"
```

### 4. 交易执行

审批通过后，Agent自动执行：
```
✅ 交易已执行
- TX ID: 0.0.12345@1711180800.123
- PolicyGuard: 106a5842fc5fce6f
- Approval NFT: 0.0.99999
- HCS记录: topic/0.0.67890/seq/123
```

---

## 🔧 核心配置

### 风险分级阈值

```typescript
// src/utils/risk-assessor.ts
export const RISK_THRESHOLDS = {
  LOW: { maxAmount: 10, autoApprove: true },
  MEDIUM: { maxAmount: 100, autoApprove: false },
  HIGH: { maxAmount: 1000, autoApprove: false, requireConfirm: true },
  CRITICAL: { maxAmount: Infinity, autoApprove: false, timeLock: 24 * 60 * 60 * 1000 }
};
```

### 自动批准规则

```typescript
// 低风险交易可配置自动批准
if (riskLevel === 'LOW' && config.autoApproveLowRisk) {
  return { approved: true, auto: true };
}
```

---

## 🧪 测试脚本

```bash
# 测试1: 低风险转账 (可能自动批准)
curl -X POST http://localhost:3000/proposal/transfer \
  -d '{"to": "0.0.54321", "amount": 5}'

# 测试2: 高风险转账 (必须人工批准)
curl -X POST http://localhost:3000/proposal/transfer \
  -d '{"to": "0.0.54321", "amount": 500}'

# 测试3: 代币销毁 (CRITICAL级别)
curl -X POST http://localhost:3000/proposal/burn \
  -d '{"tokenId": "0.0.88888", "amount": 1000}'

# 查询审计日志
curl http://localhost:3000/audit-log

# 查询余额
curl http://localhost:3000/balance
```

---

## 📊 黑客松加分项

| 功能 | 技术亮点 | 评审维度 |
|-----|---------|---------|
| HCS审计日志 | 永久不可篡改的审批记录 | Integration(15%) |
| HTS审批凭证NFT | 链上可验证的授权证明 | Innovation(10%) |
| 风险分级系统 | 智能风险评估算法 | Execution(20%) |
| 多签支持 | 企业级安全方案 | Feasibility(10%) |
| 紧急暂停 | 安全兜底机制 | Success(20%) |

---

## 🆘 常见问题

### Q: PolicyGuard审批太慢？
**A**: 可以配置自动批准低风险的策略，只拦截高风险交易。

### Q: HCS消息费用？
**A**: Hedera HCS每条消息约$0.0001，1000条消息才$0.1。

### Q: 如何演示？
**A**: 准备3个场景：
1. 正常转账（展示基础流程）
2. 高风险交易（展示风险分级）
3. 查看审计日志（展示HCS集成）

---

## 📞 获取帮助

- **PolicyGuard**: 使用 `/policy help` 查看命令
- **Hedera文档**: https://docs.hedera.com/
- **Agent Kit**: 查看 `repos/standards-agent-kit/README.md`

---

**现在就开始构建吧！** 🚀
