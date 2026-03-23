# 🚀 真实测试环境配置指南

## 当前状态
- ✅ Account ID: `0.0.8339596`
- ✅ Private Key: 已配置到 `.env`
- ⏳ HCS Topic: 待创建
- ⏳ 真实交易测试: 待执行

---

## 步骤 1: 安装依赖

```bash
cd hedera-apex-hackathon-2026
npm install
```

---

## 步骤 2: 创建 HCS 审计 Topic

```bash
npm run setup:hcs
```

输出示例：
```
🔧 Creating HCS Topic for PolicyGuard Audit Logs...

✅ HCS Topic Created!
📍 Topic ID: 0.0.1234567

👉 Add this to your .env file:
AUDIT_TOPIC_ID=0.0.1234567
```

**复制输出的 Topic ID 到 .env 文件**

---

## 步骤 3: 验证连接

```bash
npm run test:connection
```

期望输出：
```
🧪 Hedera Testnet Validation
==================================================
Account ID: 0.0.8339596
==================================================

📊 Test 1: Checking Balance...
✅ Balance: 10,000 HBAR
🔗 View: https://hashscan.io/testnet/account/0.0.8339596

📝 Test 2: Testing HCS Audit Log...
✅ Audit log sent: 0.0.1234567@0.0.8339596-...
🔗 View: https://hashscan.io/testnet/transaction/...

✨ All tests completed!
```

---

## 步骤 4: 测试 PolicyGuard 转账

```bash
# 启动 API 服务器
npm run dev

# 在另一个终端
npm run cli -- transfer 0.0.xxxxx 0.1
```

或者使用测试脚本：

```bash
npx ts-node scripts/test-transfer.ts
```

---

## 步骤 5: 查看交易记录

| 查看类型 | URL |
|---------|-----|
| 账户详情 | https://hashscan.io/testnet/account/0.0.8339596 |
| 交易记录 | https://hashscan.io/testnet/account/0.0.8339596?type=activity |
| HCS Topic | https://hashscan.io/testnet/topic/0.0.{YOUR_TOPIC_ID} |

---

## 常见问题

### Q: faucet 没收到币？
- 等待 1-2 分钟，网络可能有延迟
- 刷新 https://hashscan.io/testnet/account/0.0.8339596

### Q: "Insufficient tx fee" 错误？
- 需要 1-2 HBAR 支付交易费用
- faucet 应该给了 10,000 HBAR，足够使用

### Q: 如何查看真实交易？
- 所有交易都在 HashScan 上公开可查
- 交易 ID 会在 CLI 输出中显示

---

## 下一步

1. ✅ 运行 `npm run test:connection` 确认配置
2. ✅ 测试 PolicyGuard 转账流程
3. 🎬 录制 Demo 视频
4. 📊 准备 Pitch Deck
5. 📝 提交 Hackathon
