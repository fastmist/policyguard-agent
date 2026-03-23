# 🚨 20小时冲刺检查清单

> 当前时间: 3月23日 15:20 | 截止: 3月24日 11:59 AM (约20小时)

---

## ✅ 阶段1: 立即完成 (今晚，2小时内)

### 1.1 获取Hedera测试网账户 (15分钟)
- [ ] 访问 https://portal.hedera.com/faucet
- [ ] 输入MetaMask地址或创建新账户
- [ ] 记录 **Account ID** (如 0.0.12345) 和 **Private Key**

### 1.2 配置项目 (10分钟)
```bash
cd hedera-apex-hackathon-2026
cp .env.example .env
# 编辑 .env 填入账户信息
```

### 1.3 创建HCS审计Topic (5分钟)
```bash
npm install
npm run setup
# 按提示创建Topic，记录Topic ID
```

### 1.4 测试基础功能 (30分钟)
```bash
npm run dev
# 另一个终端:
curl http://localhost:3000/api/health
npm run cli -- balance
npm run cli -- transfer 0.0.54321 5
npm run cli -- approve pg_xxx
```

---

## ✅ 阶段2: 今晚完成 (睡前，3-4小时)

### 2.1 简化前端 (可选但推荐)
创建一个极简审批页面 `frontend/index.html`:
```html
<!DOCTYPE html>
<html>
<head><title>PolicyGuard</title></head>
<body>
  <h1>🛡️ PolicyGuard Agent</h1>
  <div id="pending"></div>
  <script>
    // 每5秒获取待审批列表
    setInterval(async () => {
      const res = await fetch('/api/challenges/pending');
      const data = await res.json();
      document.getElementById('pending').innerHTML = 
        data.map(c => `
          <div>
            ${c.challengeId}
            <button onclick="approve('${c.challengeId}')">批准</button>
          </div>
        `).join('');
    }, 5000);
    
    async function approve(id) {
      await fetch(`/api/challenge/${id}/approve`, {method: 'POST'});
    }
  </script>
</body>
</html>
```

### 2.2 创建GitHub仓库并推送
```bash
# 在GitHub创建新仓库 (public)
git remote add origin https://github.com/YOUR_USERNAME/policyguard-agent.git
git branch -M main
git push -u origin main
```

### 2.3 更新README
确保README包含:
- [ ] 项目描述
- [ ] 快速开始
- [ ] 截图/流程图
- [ ] Demo视频链接 (可先占位)

---

## ✅ 阶段3: 明早完成 (提交前，2-3小时)

### 3.1 录制Demo视频 (60分钟)
使用Loom/OBS/QuickTime录制:
1. 开场 (30s): "AI Agent完全自主，你敢用吗？"
2. 演示 (90s): 
   - 发起转账 → 被拦截
   - 显示审批界面 → 点击批准
   - 交易执行 → 显示HCS记录
3. 技术 (30s): 展示代码中的PolicyGuard集成
4. 结尾 (30s): GitHub链接

上传到YouTube，设置为公开/不公开链接。

### 3.2 准备Pitch Deck (30分钟)
使用Google Slides/Canva创建5页:
1. 封面: PolicyGuard Agent + 团队名
2. 问题: AI Agent的安全痛点
3. 解决方案: Human-in-the-loop流程图
4. 技术: Hedera HCS/HTS集成
5. Demo: 嵌入YouTube视频链接

导出为PDF。

### 3.3 最终检查 (30分钟)
- [ ] GitHub仓库公开
- [ ] README完整
- [ ] Demo视频可访问
- [ ] Pitch Deck PDF准备好
- [ ] 项目能运行

---

## ✅ 阶段4: 提交 (明早10:00-10:30)

### 4.1 访问提交页面
https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026

### 4.2 准备填写
- **GitHub链接**: https://github.com/YOUR_USERNAME/policyguard-agent
- **项目描述**: (100字以内)
  
  "PolicyGuard Agent将OpenClaw的PolicyGuard安全层与Hedera AI Agent集成，实现Human-in-the-loop交易审批。Agent生成交易提案后，PolicyGuard拦截并等待人工批准，批准后执行链上交易并铸造HTS凭证NFT，同时通过HCS-10记录完整审计日志，解决AI Agent的'黑盒'安全问题。"

- **赛道**: AI & Agents
- **技术栈**: TypeScript, Node.js, Hedera (HCS/HTS), Express, PolicyGuard

### 4.3 提交并确认
- [ ] 填写所有字段
- [ ] 上传Pitch Deck
- [ ] 填入Demo视频链接
- [ ] 完成强制问卷
- [ ] 收到确认邮件

---

## 🆘 紧急备案

如果今晚无法跑通代码，准备**Plan B**:

### 最小可行演示
1. 使用 Mock 数据演示流程
2. 展示 PolicyGuard challenge/approve 机制
3. 展示 HCS 审计日志设计
4. 强调架构设计的创新性

---

## 📞 求助资源

- **Hedera Discord**: https://go.hellofuturehackathon.dev/apex-discord
- **Hashgraph Online**: https://hashgraphonline.com/docs/
- **本文档**: `docs/` 目录下有完整说明

---

**加油！20小时足够完成一个优秀的黑客松项目！** 🚀
