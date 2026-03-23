# Hedera 测试网账户设置指南

## 🚀 快速获取测试网账户 (3种方式)

### 方式1: Hedera Faucet (推荐，匿名，30秒)
**网址**: https://portal.hedera.com/faucet

**步骤**:
1. 打开 https://portal.hedera.com/faucet
2. 输入你的EVM钱包地址 (MetaMask地址，如 0x...)
3. 点击 "Get Testnet HBAR"
4. **自动创建** Hedera账户并获得 **100 HBAR**

**获取的信息**:
- Account ID: `0.0.xxxxx`
- Private Key: 需要导出

---

### 方式2: Hedera Developer Portal (1000 HBAR/天)
**网址**: https://portal.hedera.com/

**步骤**:
1. 用邮箱注册/登录
2. 点击 "Create Testnet Account"
3. 自动获得 **1000 HBAR**
4. 可复制 Account ID 和 Private Key

---

### 方式3: HashPack Wallet (100 HBAR)
**网址**: https://hashpack.app/

**步骤**:
1. 安装 HashPack 浏览器插件
2. 创建新钱包，选择 **Testnet**
3. 自动获得 **100 HBAR**
4. 在钱包中查看 Account ID

---

## ⚙️ 配置项目

### 1. 获取账户信息后，编辑 .env 文件

```bash
cd hedera-apex-hackathon-2026
cp .env.example .env
nano .env  # 或用你喜欢的编辑器
```

### 2. 填写以下信息

```env
# Hedera Configuration
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxxx      # ← 你的账户ID
HEDERA_PRIVATE_KEY=0x...         # ← 你的私钥

# 创建 HCS Topic (见下方说明)
AUDIT_TOPIC_ID=0.0.xxxxx

# PolicyGuard Configuration
POLICYGUARD_ENDPOINT=https://policyguard.openclaw.ai

# Server Configuration
PORT=3000

# 可选: 自动批准低风险交易
AUTO_APPROVE_LOW_RISK=false
```

---

## 📝 创建 HCS 审计 Topic

创建HCS Topic用于存储审计日志：

### 方法A: 使用代码创建
```bash
npm install
npm run cli -- create-topic
```

### 方法B: 使用 HashPack
1. 打开 HashPack 钱包
2. 选择 "Services" → "Consensus"
3. 点击 "Create Topic"
4. 记录返回的 Topic ID (格式: 0.0.xxxxx)

### 方法C: 使用代码片段
```typescript
import { Client, TopicCreateTransaction } from '@hashgraph/sdk';

const client = Client.forTestnet();
client.setOperator('0.0.YOUR_ACCOUNT', 'YOUR_PRIVATE_KEY');

const tx = new TopicCreateTransaction()
  .setMemo('PolicyGuard Agent Audit Log');

const response = await tx.execute(client);
const receipt = await response.getReceipt(client);
console.log('Topic ID:', receipt.topicId.toString());
```

---

## 🧪 测试步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务器
```bash
npm run dev
```

### 3. 测试健康检查
```bash
curl http://localhost:3000/api/health
```
应返回: `{"status":"ok"}`

### 4. 查看余额
```bash
npm run cli -- balance
```

### 5. 发起转账（会被拦截）
```bash
npm run cli -- transfer 0.0.54321 5
```

### 6. 批准转账
```bash
npm run cli -- approve pg_xxx
```

---

## ⚠️ 常见问题

### 问题: "INSUFFICIENT_PAYER_BALANCE"
**解决**: 去 https://portal.hedera.com/faucet 领取更多测试网 HBAR

### 问题: "INVALID_SIGNATURE"
**解决**: 检查私钥格式，确保是 `0x...` 开头的64位十六进制字符串

### 问题: "Topic ID not found"
**解决**: 确保已创建 HCS Topic 并正确填写到 .env 文件

---

## 🎯 下一步

配置完成后:
1. ✅ 测试转账功能
2. ✅ 录制 Demo 视频
3. ✅ 准备 Pitch Deck
4. ✅ 提交到 GitHub
5. ✅ 提交黑客松

---

*配置预计耗时: 5-10分钟*
