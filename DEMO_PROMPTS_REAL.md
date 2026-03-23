# 🎬 PolicyGuard Demo - REAL TRANSACTION PROMPTS

## 运行方式

```bash
cd /root/.openclaw/workspace/hedera-apex-hackathon-2026
npx ts-node scripts/demo-video-safe.ts
```

---

## Prompts（真实 Hedera Testnet 交易）

### Prompt 1: 查询余额
```
curl http://localhost:3000/api/balance
```

### Prompt 2: 小额自动转账（2 HBAR）
```
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.1001","amount":2}'
```

**预期结果**: 自动批准，交易成功执行
**真实 TX**: 会在 Hedera Testnet 上生成交易记录

---

### Prompt 3: 创建 Challenge（30 HBAR）
```
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.2002","amount":30}'
```

**预期结果**: 创建 Challenge ID

---

### Prompt 4: 查询待审批
```
curl http://localhost:3000/api/challenges/pending
```

---

### Prompt 5: 批准 Challenge
```
curl -X POST http://localhost:3000/api/challenge/CH-001/approve \
  -H "Content-Type: application/json" \
  -d '{"reason":"Verified contractor payment"}'
```

**预期结果**: 批准后执行真实转账
**真实 TX**: 30 HBAR 转到 0.0.2002

---

### Prompt 6: 多签转账（40 HBAR）
```
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.3003","amount":40}'
```

---

### Prompt 7: CFO 批准
```
curl -X POST http://localhost:3000/api/challenge/CH-002/approve \
  -H "Content-Type: application/json" \
  -d '{"reason":"Business purpose verified"}'
```

---

### Prompt 8: CTO 批准（达到阈值后执行）
```
curl -X POST http://localhost:3000/api/challenge/CH-002/approve \
  -H "Content-Type: application/json" \
  -d '{"reason":"Technical validation passed"}'
```

**预期结果**: 2/3 签名达到，执行真实转账
**真实 TX**: 40 HBAR 转到 0.0.3003

---

### Prompt 9: 查询审计日志
```
curl http://localhost:3000/api/audit-logs
```

---

## 验证真实交易

每笔成功交易可在 HashScan 查看：
- 账户: https://hashscan.io/testnet/account/0.0.8339596
- HCS Topic: https://hashscan.io/testnet/topic/0.0.8342181

---

## 总消耗

- 3 笔真实转账: 2 + 30 + 40 = 72 HBAR
- 手续费: ~0.03 HBAR
- 当前余额: ~999 HBAR (充足)
