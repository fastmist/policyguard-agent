# PolicyGuard Agent - Hedera Hello Future Apex Hackathon 2026

> **赛道**: AI & Agents  
> **Bounty**: Hashgraph Online / OpenClaw  
> **核心理念**: 让AI Agent拥有"道德暂停按钮"——任何交易都需要人类显式授权

---

## 🎯 项目介绍

**一句话**: 一个由PolicyGuard保护的人类监督型Hedera AI Agent，所有交易提案需经人类显式授权后上链执行，并永久记录HCS审计日志。

**解决的痛点**:
- AI Agent的"黑盒"问题 - 用户不知道Agent要做什么
- 完全自主Agent的安全风险
- 机构用户的合规需求

**核心创新**:
1. **PolicyGuard拦截** - 所有交易必须经过审批
2. **风险分级** - 自动评估LOW/MEDIUM/HIGH/CRITICAL
3. **HCS审计** - 永久不可篡改的审批记录
4. **凭证NFT** - 链上可验证的授权证明

---

## 🔄 系统流程

```
┌──────────┐    1.提案     ┌──────────┐    2.拦截    ┌──────────┐
│  AI Agent │ ────────────>│PolicyGuard│ ───────────>│ 人类审批  │
└──────────┘               └──────────┘              └──────────┘
     │                                                    │
     │    5.执行 <──────────── 4.批准/拒绝 <───────────┘
     ↓                         3.记录HCS
┌──────────┐
│ Hedera   │
│ Network  │
└──────────┘
```

**实时演示**:
```
用户: "帮我把100 HBAR转给alice"
Agent: "⏸️ 等待PolicyGuard审批 (Challenge: 106a5842fc5fce6f)"
[用户点击批准]
Agent: "✅ 交易已执行 - TX ID: 0.0.xxx - HCS记录: topic/0.0.xxx"
```

---

## 🚀 快速开始

```bash
cd hedera-apex-hackathon-2026
cp .env.example .env
# 编辑 .env 填入你的Hedera账户

npm install
npm run dev
```

访问 http://localhost:3000 查看审批界面。

详细指南: [docs/QUICKSTART.md](./docs/QUICKSTART.md)

---

## 📂 项目文档

| 文档 | 内容 |
|------|------|
| [PROJECT_IDEA_POLICYGUARD.md](./docs/PROJECT_IDEA_POLICYGUARD.md) | **完整项目方案** - 核心概念、用户流程、评审对应 |
| [INTEGRATION_CODE.md](./docs/INTEGRATION_CODE.md) | **核心代码** - PolicyGuard拦截器、Agent类、API、前端 |
| [QUICKSTART.md](./docs/QUICKSTART.md) | **5分钟快速开始** - 开发环境搭建、测试脚本 |
| [hackathon-rules.md](./docs/hackathon-rules.md) | 黑客松评审规则详解 |
| [bounty-analysis.md](./docs/bounty-analysis.md) | Bounty分析与策略建议 |
| [SUBMISSION.md](./SUBMISSION.md) | 提交清单 |

---

## 📦 项目结构

```
hedera-apex-hackathon-2026/
├── docs/                    # 项目文档
│   ├── PROJECT_IDEA_POLICYGUARD.md   # 项目方案
│   ├── INTEGRATION_CODE.md           # 核心代码
│   ├── QUICKSTART.md                 # 快速开始
│   ├── hackathon-rules.md            # 评审规则
│   ├── bounty-analysis.md            # Bounty分析
│   ├── project-plan.md               # 项目计划书
│   ├── tech-stack.md                 # 技术栈选型
│   └── DEVELOPMENT.md                # 开发指南
├── repos/                   # 参考代码仓库
│   ├── hedera-agent-kit-js/          # 官方Agent Kit
│   ├── plugin-hedera-agent-kit/      # ElizaOS插件
│   ├── standards-agent-kit/          # HCS-10标准
│   └── conversational-agent/         # 参考实现
├── src/                     # 项目源代码 (待开发)
├── resources/               # 资源文件
│   ├── pitch-deck/          # 路演PPT
│   └── demo-video/          # Demo视频
├── README.md                # 本文件
├── SUBMISSION.md            # 提交清单
└── OVERVIEW.md              # 总览索引
```

---

## 🏆 奖项策略

**主赛道**: AI & Agents  
**Bounty**: Hashgraph Online ($8,000 + 100K HOL Points)

**为何这个组合最优**:
1. ✅ 完美契合 "AI & Agents" 赛道主题
2. ✅ standards-agent-kit 原生支持 HCS-10/OpenConvAI
3. ✅ PolicyGuard 是 OpenClaw 生态的一部分，可申请 OpenClaw Bounty
4. ✅ 解决真实痛点，有明确的机构用户群体

---

## ⏰ 关键时间

- **提交截止**: 2026年3月23日 11:59 PM ET
- **北京时间**: 2026年3月24日 11:59 AM
- **评审期**: 3月24日 - 4月10日
- **结果公布**: 4月27日

---

## 🔗 重要链接

- **黑客松页面**: https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026
- **官网**: https://hellofuturehackathon.dev/
- **文档**: https://docs.hedera.com/
- **Discord**: https://go.hellofuturehackathon.dev/apex-discord

---

**开始构建你的 PolicyGuard Agent!** 🛡️🤖
