# PolicyGuard Agent

> **Track**: AI & Agents  
> **Bounty**: Hashgraph Online / OpenClaw  
> **Core Concept**: Give AI Agents a "moral pause button" — every transaction requires explicit human authorization

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00BC8F)](https://hashscan.io/testnet)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 Project Overview

**One-liner**: A PolicyGuard-protected, human-supervised Hedera AI Agent where all transaction proposals require explicit human approval before on-chain execution, with immutable HCS audit logs.

**Problem Solved**:
- AI Agent "black box" problem — users don't know what the Agent is doing
- Security risks of fully autonomous agents
- Compliance requirements for institutional users

**Key Innovations**:
1. **PolicyGuard Interceptor** — All transactions must be approved
2. **Risk Classification** — Automatic LOW/MEDIUM/HIGH/CRITICAL assessment
3. **HCS Audit Trail** — Permanent, tamper-proof approval records
4. **Multi-Signature Support** — HIGH/CRITICAL risk requires multiple approvers

---

## 🔄 System Flow

```
┌──────────┐    1.Proposal   ┌──────────┐    2.Intercept  ┌──────────┐
│  AI Agent │ ─────────────> │PolicyGuard│ ─────────────> │  Human   │
└──────────┘                └──────────┘                │ Approval │
     │                                                    │ Required │
     │    5.Execute <────────── 4.Approve/Reject <────────┘
     ↓                           3.Log to HCS
┌──────────┐
│ Hedera   │
│ Network  │
└──────────┘
```

**Live Demo**:
```
User: "Send 100 HBAR to alice"
Agent: "⏸️ Waiting for PolicyGuard approval (Challenge: pg_xxxx)"
[User: "Approve pg_xxxx"]
Agent: "✅ Transaction executed - TX: 0.0.xxx - HCS: topic/0.0.xxx"
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Hedera Testnet account ([get one free](https://portal.hedera.com/register))

### One-Line Setup
```bash
git clone https://github.com/fastmist/policyguard-agent.git && cd policyguard-agent && npm install && cp .env.example .env
```

### Step-by-Step Guide

**1. Configure your credentials:**
```bash
nano .env
# Add your Hedera Account ID and Private Key (DER format)
```

**2. Start the server:**
```bash
npm run dev
```

**3. Test the API:**
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/balance
```

**4. Create a transaction:**
```bash
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.1001","amount":10}'
```

📖 **[Detailed Quick Start Guide](./docs/QUICKSTART.md)** - Step-by-step with troubleshooting

---

## 📂 Project Structure

```
policyguard-agent/
├── src/                          # Core source code
│   ├── agent/                    # PolicyGuard Agent
│   │   ├── policy-guard-interceptor.ts    # Approval logic
│   │   ├── types.ts                       # TypeScript types
│   │   └── index.ts                       # Main agent class
│   ├── api/                      # REST API
│   │   ├── server.ts             # Express server
│   │   └── routes.ts             # API endpoints
│   ├── hedera/                   # Hedera integration
│   │   ├── index.ts              # Hedera service
│   │   ├── hcs-client.ts         # HCS audit logging
│   │   └── hts-client.ts         # NFT token minting
│   └── utils/                    # Utilities
│       ├── challenge-storage.ts  # File-based persistence
│       └── risk-assessor.ts      # Risk classification
├── openclaw-plugin/              # OpenClaw integration
│   ├── bridge.ts                 # NL command parser
│   └── index.ts                  # Plugin exports
├── scripts/                      # Demo & utility scripts
│   ├── demo-full.ts              # Full feature demo
│   └── transfer-between-accounts.ts
├── SKILL.md                      # OpenClaw skill documentation
├── README.md                     # This file
└── .env                          # Environment config
```

---

## 🔧 Configuration

### Environment Variables

```env
# Hedera
HEDERA_ACCOUNT_ID=0.0.xxxxxx
HEDERA_PRIVATE_KEY=3030...        # ECDSA DER format
HEDERA_NETWORK=testnet            # testnet or mainnet

# PolicyGuard
AUDIT_TOPIC_ID=0.0.xxxxxx         # HCS topic for audit logs
AUTO_APPROVE_LOW_RISK=true        # Auto-approve ≤20 HBAR
LOW_RISK_THRESHOLD=20             # LOW risk threshold

# Server
PORT=3000
```

### Risk Levels

| Level | Amount | Requirement |
|-------|--------|-------------|
| 🟢 LOW | ≤20 HBAR | Auto-approve (if enabled) |
| 🟡 MEDIUM | 21-100 HBAR | 1 approval |
| 🟠 HIGH | 101-1000 HBAR | 2 of 3 approvals |
| 🔴 CRITICAL | >1000 HBAR | 3 of 4 approvals + 1hr timelock |

**Approver Roles**: CFO, CTO, Security Lead

---

## 💬 Natural Language Commands

### Transfer Commands
```
Send [amount] HBAR to [recipient]
Pay [recipient] [amount] HBAR
Transfer [amount] HBAR to [account]
```

### Approval Commands
```
Approve [challenge-id]
Approve [challenge-id] "[reason]"
Reject [challenge-id] "[reason]"
```

### Query Commands
```
Show balance
List pending
Challenge status [challenge-id]
Show audit logs
```

### Policy Configuration
```
Change auto-approve threshold to [amount] HBAR
Set low risk max to [amount]
Enable auto-approve
Disable auto-approve
```

---

## 🔒 Safety Rules

### Critical: Human-in-the-Loop

**❌ NEVER ALLOW**: LLM auto-approving challenges  
**✅ REQUIRED**: User explicitly says "Approve [id]"

### Implementation

```typescript
// WRONG - LLM auto-approves
if (result.challengeId) {
  await approveChallenge(result.challengeId); // ❌ VIOLATION
}

// CORRECT - LLM waits for user
if (result.challengeId) {
  return "Challenge created. Say: 'Approve pg_xxxx' to approve"; // ✅
}
```

---

## 📊 Demo Scripts

### Full Feature Demo
```bash
npm run demo:full
```
Shows: Risk assessment, challenge creation, multi-sig approval, HCS audit.

### User Journey Demo
```bash
npm run demo:user
```
End-to-end user experience simulation.

### Simulation Mode
```bash
npm run demo:sim
```
Test without real Hedera transactions.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/balance` | Account balance |
| POST | `/api/proposal/transfer` | Create transfer proposal |
| POST | `/api/challenge/:id/approve` | Approve challenge |
| POST | `/api/challenge/:id/reject` | Reject challenge |
| GET | `/api/challenge/:id/status` | Challenge status |
| GET | `/api/challenges/pending` | List pending challenges |
| GET | `/api/audit-logs` | HCS audit logs |

---

## 🏆 Awards Strategy

**Main Track**: AI & Agents  
**Bounty**: Hashgraph Online ($8,000 + 100K HOL Points)

**Why This Combination**:
1. ✅ Perfect fit for "AI & Agents" track theme
2. ✅ Uses standards-agent-kit with HCS-10/OpenConvAI support
3. ✅ PolicyGuard is part of OpenClaw ecosystem
4. ✅ Solves real pain points for institutional users

---

## ⏰ Timeline

- **Submission Deadline**: March 23, 2026 11:59 PM ET
- **Beijing Time**: March 24, 2026 11:59 AM
- **Review Period**: March 24 - April 10
- **Results**: April 27

---

## 🔗 Important Links

- **Hackathon**: https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026
- **Website**: https://hellofuturehackathon.dev/
- **Docs**: https://docs.hedera.com/
- **Discord**: https://go.hellofuturehackathon.dev/apex-discord
- **HashScan (Testnet)**: https://hashscan.io/testnet/account/0.0.8339596
- **HCS Topic**: https://hashscan.io/testnet/topic/0.0.8342181

---

## 🛡️ Test Account

**Account ID**: `0.0.8339596`  
**Network**: Testnet  
**HCS Topic**: `0.0.8342181`

View transactions: https://hashscan.io/testnet/account/0.0.8339596

---

**Build your PolicyGuard Agent!** 🛡️🤖
