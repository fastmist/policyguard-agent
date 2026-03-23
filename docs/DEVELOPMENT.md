# 开发指南

> 快速启动开发环境的步骤指南

---

## 🚀 快速开始

### 步骤1: 环境准备

```bash
# 检查Node.js版本 (需要18+)
node --version

# 检查npm
npm --version

# 安装Hedera CLI (可选但推荐)
npm install -g @hashgraph/sdk
```

### 步骤2: 获取Hedera测试网账户

1. 访问 [Hedera Portal](https://portal.hedera.com/)
2. 注册/登录账户
3. 创建新的测试网账户
4. 记录:
   - Account ID (格式: 0.0.xxxxx)
   - Private Key (格式: 0x... 或 ED25519格式)

### 步骤3: 创建项目

```bash
# 进入项目目录
cd /root/.openclaw/workspace/hedera-apex-hackathon-2026

# 创建src目录
mkdir -p src/{agent,contracts,frontend,utils}

# 初始化项目
cd src
npm init -y

# 安装核心依赖
npm install @hashgraph/sdk dotenv

# 安装Agent Kit (选择其一)
# 选项A: standards-agent-kit
npm install @hashgraphonline/standards-agent-kit

# 选项B: hedera-agent-kit
npm install hedera-agent-kit

# 安装AI相关
npm install langchain @langchain/openai openai

# 安装开发依赖
npm install --save-dev typescript @types/node ts-node vitest
```

### 步骤4: 配置环境变量

```bash
# 创建.env文件
cat > .env << 'EOF'
# Hedera
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=0x...
HEDERA_NETWORK=testnet

# AI Model (选择其一)
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# 可选: Hashgraph Online
HOL_API_KEY=
EOF

# 添加到.gitignore
echo ".env" >> .gitignore
```

---

## 📁 推荐项目结构

```
src/
├── agent/                  # Agent核心逻辑
│   ├── index.ts           # Agent入口
│   ├── actions.ts         # Agent可执行动作
│   ├── memory.ts          # Agent记忆/状态
│   └── types.ts           # 类型定义
├── contracts/             # 智能合约 (如需要)
│   ├── HelloWorld.sol
│   └── compile.js
├── frontend/              # 前端应用
│   ├── app/
│   ├── components/
│   └── lib/
├── utils/                 # 工具函数
│   ├── hedera.ts          # Hedera工具
│   ├── ai.ts              # AI模型工具
│   └── helpers.ts         # 通用工具
├── tests/                 # 测试文件
│   └── agent.test.ts
├── .env                   # 环境变量 (不提交)
├── .env.example           # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧪 测试Agent

### 创建基础测试文件

```typescript
// tests/agent.test.ts
import { describe, it, expect } from 'vitest';
import { HederaAgentKit } from 'hedera-agent-kit';

describe('Agent Tests', () => {
  it('should initialize agent', async () => {
    const agent = new HederaAgentKit({
      accountId: process.env.HEDERA_ACCOUNT_ID!,
      privateKey: process.env.HEDERA_PRIVATE_KEY!,
      network: 'testnet'
    });
    
    expect(agent).toBeDefined();
  });
});
```

### 运行测试

```bash
npm test
```

---

## 📦 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建
npm run build

# 测试
npm test

# 测试Hedera连接
npx ts-node scripts/test-connection.ts

# 查看Hedera账户余额
npx ts-node scripts/check-balance.ts
```

---

## 🔧 调试技巧

### 1. Hedera交易调试

```typescript
// 启用详细日志
import { Client } from '@hashgraph/sdk';

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

// 查看交易详情
const receipt = await tx.execute(client);
console.log('Transaction ID:', receipt.transactionId);
console.log('Status:', receipt.status);
```

### 2. AI模型调试

```typescript
// 查看AI响应
const response = await model.invoke(messages, {
  callbacks: [{
    handleLLMEnd: (output) => {
      console.log('Token usage:', output.llmOutput?.tokenUsage);
    }
  }]
});
```

### 3. 本地测试网

```bash
# 如果需要本地Hedera网络
# 参考: https://github.com/hashgraph/hedera-local-node
git clone https://github.com/hashgraph/hedera-local-node.git
cd hedera-local-node
docker-compose up
```

---

## 📚 参考仓库快速浏览

```bash
# 查看各个仓库的示例代码
cd /root/.openclaw/workspace/hedera-apex-hackathon-2026/repos

# 1. hedera-agent-kit-js 示例
ls hedera-agent-kit-js/examples/

# 2. standards-agent-kit 文档
cat standards-agent-kit/README.md

# 3. conversational-agent 结构
tree conversational-agent -L 2
```

---

## ⚡ 加速开发技巧

### 1. 使用代码模板

```bash
# 创建新Agent动作的模板
cat > templates/action.ts << 'EOF'
import { Action } from '../agent/types';

export const {{ACTION_NAME}}: Action = {
  name: '{{action_name}}',
  description: '{{description}}',
  handler: async (params, context) => {
    // 实现逻辑
    return { success: true, data: {} };
  }
};
EOF
```

### 2. 预设提示词

```typescript
// prompts/system.ts
export const SYSTEM_PROMPT = `你是一个Hedera区块链上的AI Agent。
你可以执行以下操作：
- 查询账户余额
- 发送HBAR转账
- 创建和管理代币
- 发送HCS消息

在执行任何交易前，请确认用户意图。`;
```

### 3. 快速验证脚本

```bash
# scripts/quick-test.sh
#!/bin/bash
npx ts-node -e "
import { Client } from '@hashgraph/sdk';
const client = Client.forTestnet();
console.log('✅ Hedera client initialized');
"
```

---

## 🆘 常见问题

### 问题1: "INSUFFICIENT_PAYER_BALANCE"
**解决**: 测试网HBAR不足，访问 faucet.hedera.com 获取

### 问题2: "INVALID_SIGNATURE"
**解决**: 检查私钥格式，确保正确导入

### 问题3: AI响应超时
**解决**: 添加超时配置或流式响应

---

*最后更新: 2026-03-23*
