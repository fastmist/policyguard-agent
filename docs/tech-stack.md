# 技术栈选型指南

> AI & Agents 赛道技术选型建议

---

## 🔧 核心框架选择

### 选项1: hedera-agent-kit-js (官方推荐)

**特点**:
- 最官方的Agent Kit
- "1分钟内构建Hedera驱动的AI Agent"
- 支持账户管理、转账、HCS交互
- 轻量级，易于上手

**适用场景**:
- 快速原型开发
- 需要直接控制Hedera账户和转账
- 不依赖特定Agent框架

**GitHub**: https://github.com/hashgraph/hedera-agent-kit-js

**快速开始**:
```bash
npm install hedera-agent-kit
```

```typescript
import { HederaAgentKit } from 'hedera-agent-kit';

const agent = new HederaAgentKit({
  accountId: process.env.HEDERA_ACCOUNT_ID,
  privateKey: process.env.HEDERA_PRIVATE_KEY,
  network: 'testnet'
});
```

---

### 选项2: ElizaOS + plugin-hedera-agent-kit

**特点**:
- ElizaOS是流行的AI Agent操作系统
- 专为社交/角色扮演Agent设计
- 暴露HBAR、HTS、HCS和查询工具

**适用场景**:
- 社交型Agent
- 角色扮演Agent
- 需要与多个平台集成

**GitHub**: https://github.com/hedera-dev/plugin-hedera-agent-kit

**快速开始**:
```bash
# 在ElizaOS项目中安装插件
npm install @hedera/plugin-hedera-agent-kit
```

**优势**:
- 丰富的社交媒体集成
- 成熟的Agent生态系统
- 多平台发布能力

---

### 选项3: standards-agent-kit (HCS-10/OpenConvAI)

**特点**:
- 专注于链上自治Agent
- 支持Agent发现/通信
- 内置OpenConvAI插件支持
- 符合HCS-10标准

**适用场景**:
- 需要Agent间通信
- 需要Agent注册/发现
- 追求标准合规性

**GitHub**: https://github.com/hashgraph-online/standards-agent-kit

**快速开始**:
```bash
npm install @hashgraphonline/standards-agent-kit
```

```typescript
import { StandardsAgentKit } from '@hashgraphonline/standards-agent-kit';

const agent = new StandardsAgentKit({
  network: 'testnet',
  // 自动处理HCS-10注册
});
```

**优势**:
- 原生支持Hashgraph Online Bounty
- 标准化的Agent发现机制
- 链上注册表集成

---

### 选项4: conversational-agent (参考实现)

**特点**:
- 可运行的参考实现
- 不是SDK，是完整示例
- 展示Agent通信、注册管理、内容铭刻

**适用场景**:
- 学习完整实现模式
-  fork作为项目起点
- 理解Agent间交互

**GitHub**: https://github.com/hashgraph-online/conversational-agent

**用途**:
```bash
# 克隆作为参考
git clone https://github.com/hashgraph-online/conversational-agent.git
```

---

## 🎯 推荐组合

### 推荐方案A: standards-agent-kit (首选)

**选择理由**:
1. ✅ 完美契合Hashgraph Online Bounty
2. ✅ 原生HCS-10支持
3. ✅ Agent发现/通信开箱即用
4. ✅ 符合赛道主题"AI & Agents"

**技术栈**:
```
┌─────────────────────────────────────┐
│  Frontend (React/Next.js)           │
├─────────────────────────────────────┤
│  Agent Runtime (standards-agent-kit)│
├─────────────────────────────────────┤
│  Hedera Services (HCS/HTS)          │
├─────────────────────────────────────┤
│  AI Model (GPT-4/Claude)            │
└─────────────────────────────────────┘
```

---

### 推荐方案B: hedera-agent-kit-js

**选择理由**:
1. ✅ 最官方，文档最全
2. ✅ 快速上手
3. ✅ 灵活度高
4. ✅ 适合Bonzo Bounty

**技术栈**:
```
┌─────────────────────────────────────┐
│  Frontend (React/Next.js)           │
├─────────────────────────────────────┤
│  Agent Runtime (hedera-agent-kit)   │
├─────────────────────────────────────┤
│  Hedera Services (HTS/HCS/Contract) │
├─────────────────────────────────────┤
│  AI Model + Oracle/RAG              │
└─────────────────────────────────────┘
```

---

## 🛠️ 辅助工具

### AI模型选择

| 模型 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| **GPT-4** | 强大推理、多模态 | 较贵 | 复杂决策Agent |
| **Claude 3.5** | 代码能力强、长上下文 | API限制 | 开发辅助Agent |
| **GPT-4o-mini** | 性价比高、快速 | 能力较弱 | 简单任务Agent |
| **本地模型** | 隐私、离线 | 需要GPU | 数据敏感场景 |

### 开发工具

```bash
# Hedera工具
npm install -g @hashgraph/sdk

# AI框架
npm install langchain @langchain/openai

# 数据库 (可选)
npm install prisma  # 或 drizzle-orm

# 前端
npx create-next-app@latest my-agent-app

# 测试
npm install vitest @testing-library/react
```

---

## 🔐 环境变量模板

```bash
# Hedera
HEDERA_ACCOUNT_ID=0.0.xxxxxx
HEDERA_PRIVATE_KEY=0x...
HEDERA_NETWORK=testnet  # or mainnet

# AI Model
OPENAI_API_KEY=sk-...
# 或
ANTHROPIC_API_KEY=sk-ant-...

# 可选: Hashgraph Online
HOL_API_KEY=...
HOL_REGISTRY_TOPIC_ID=...

# 可选: Bonzo (如果选Bonzo Bounty)
BONZO_VAULT_ADDRESS=0x...
```

---

## 📚 学习资源

### 必读文档
1. [Hedera Documentation](https://docs.hedera.com/)
2. [HCS-10 Standard](https://github.com/hashgraph-online/standards-sdk)
3. [OpenConvAI](https://docs.openconvai.com/)

### 示例代码
1. [hedera-agent-kit-js examples](https://github.com/hashgraph/hedera-agent-kit-js/tree/main/examples)
2. [conversational-agent](https://github.com/hashgraph-online/conversational-agent)
3. [ElizaOS starter](https://github.com/ai16z/eliza/tree/main)

---

*最后更新: 2026-03-23*
