# 🚀 Quick Start - Real Hedera Testnet

## ⚡ 5-Minute Setup

### 1. 环境已预配置 ✅

你的 `.env` 文件已包含：
```bash
HEDERA_ACCOUNT_ID=0.0.8339596
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420d5740edf64535a805c4925d2e8fb0760ff36a8477db8906a85e235074fb8afed
```

### 2. 一键测试

```bash
cd hedera-apex-hackathon-2026
./test-setup.sh
```

这个脚本会：
1. ✅ 安装依赖
2. ✅ 验证账户余额
3. ✅ 创建 HCS 审计 Topic（真实交易）
4. ✅ 执行 PolicyGuard 转账测试（真实交易）

### 3. 如果看到以下输出，说明配置成功：

```
📊 Test 1: Checking account balance...
✅ Balance: 10000 HBAR
🔗 https://hashscan.io/testnet/account/0.0.8339596

📝 Step 3: Creating HCS Audit Topic...
✅ HCS Topic Created!
📍 Topic ID: 0.0.1234567
👉 Add this to your .env file:
AUDIT_TOPIC_ID=0.0.1234567
```

**复制 Topic ID 到 `.env` 文件，然后重新运行：**

```bash
./test-setup.sh
```

---

## 🎯 手动测试（如果一键脚本失败）

### 步骤 1: 验证环境

```bash
npm run validate
```

期望输出：
```
✅ Balance: 10000 HBAR
✅ Transaction creation successful
⚠️  AUDIT_TOPIC_ID not configured
```

### 步骤 2: 创建 HCS Topic

```bash
npm run setup:hcs
```

复制输出的 Topic ID，编辑 `.env`：
```bash
AUDIT_TOPIC_ID=0.0.xxxxx  # 替换为实际的 Topic ID
```

### 步骤 3: 测试转账

```bash
npm run test:transfer
```

---

## 📊 查看真实交易

所有交易都是真实的 Hedera testnet 交易，可在以下地址查看：

| 类型 | 链接 |
|------|------|
| 账户详情 | https://hashscan.io/testnet/account/0.0.8339596 |
| 交易历史 | https://hashscan.io/testnet/account/0.0.8339596?type=activity |
| HCS Topic | https://hashscan.io/testnet/topic/{YOUR_TOPIC_ID} |

---

## 🐛 故障排除

### "Insufficient tx fee" 错误
- faucet 需要几分钟才能到账
- 等待 2-3 分钟后重试
- 检查：https://hashscan.io/testnet/account/0.0.8339596

### "INVALID_SIGNATURE" 错误
- 检查私钥格式是否正确（应以 `302e020100300506032b6570` 开头）
- 确认 `.env` 文件中没有多余的空格或引号

### 端口占用错误
```bash
# 查找占用 3000 端口的进程
lsof -ti:3000 | xargs kill -9
```

---

## 🎬 Demo 准备

配置成功后，录制 Demo：

```bash
# 终端 1: 启动 API
npm run dev

# 终端 2: 执行转账
npm run cli -- transfer 0.0.xxx 0.1

# 终端 3: 批准交易
npm run cli -- approve pg_xxx
```

---

## ✅ 提交清单

- [ ] `./test-setup.sh` 运行成功
- [ ] HashScan 上能看到交易记录
- [ ] HCS Topic 创建成功
- [ ] GitHub 仓库已创建
- [ ] Demo 视频已录制
- [ ] Pitch Deck 已准备

**遇到问题随时问我！**
