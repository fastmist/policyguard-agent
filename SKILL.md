# PolicyGuard Agent Skill

An OpenClaw skill for Hedera PolicyGuard - Human-in-the-loop AI agent protection with multi-signature approval workflows.

## Overview

PolicyGuard Agent intercepts AI-initiated transactions and requires human approval based on risk levels. All decisions are logged immutably to Hedera Consensus Service (HCS).

**Core Principle**: The LLM (AI assistant) MUST NEVER approve challenges. Only human users can approve.

## Risk Levels

| Level | Amount | Requirement |
|-------|--------|-------------|
| LOW | ≤20 HBAR | Auto-approve (if enabled) |
| MEDIUM | 21-100 HBAR | 1 approval |
| HIGH | 101-1000 HBAR | 2 of 3 approvals |
| CRITICAL | >1000 HBAR | 3 of 4 approvals + timelock |

## Installation

```bash
# Clone the repository
git clone https://github.com/fastmist/policyguard-agent.git

# Install dependencies
cd policyguard-agent
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Hedera credentials

# Start the server
npm run dev
```

## OpenClaw Integration

This skill enables natural language interaction with PolicyGuard through OpenClaw.

### Supported Commands

#### Transfer Commands
- `Send [amount] HBAR to [recipient]`
- `Pay [recipient] [amount] HBAR`
- `Transfer [amount] HBAR to [account]`

Examples:
```
Send 20 HBAR to contractor
Pay Bob 50 HBAR
Transfer 100 HBAR to 0.0.1234
```

#### Approval Commands
- `Approve [challenge-id]` - Approve pending challenge
- `Approve [challenge-id] "[reason]"` - Approve with reason
- `Reject [challenge-id] "[reason]"` - Reject challenge

Examples:
```
Approve pg_1774273650782_ssstaa5bz
Approve pg_xxxx "Verified invoice #1234"
Reject pg_xxxx "Amount incorrect"
```

#### Query Commands
- `Show balance` - Check account balance
- `List pending` - Show pending challenges
- `Show audit logs` - View HCS audit trail
- `Challenge status [id]` - Get challenge details

#### Policy Configuration (Natural Language)
- `Change auto-approve threshold to [amount] HBAR`
- `Set low risk threshold to [amount]`
- `Enable auto-approve`
- `Disable auto-approve`

Examples:
```
Change auto-approve threshold to 50 HBAR
Set low risk max to 100
Disable auto-approval
```

## Critical Safety Rules

### 1. LLM MUST NOT Auto-Approve
**WRONG**: Assistant calls `/challenge/:id/approve` automatically  
**CORRECT**: Assistant creates challenge, shows status, **waits for explicit user approval command**

### 2. User Must Explicitly Approve
The assistant should respond with:
```
⏳ Challenge Created - Awaiting Your Approval
Challenge ID: pg_xxxx
Amount: 102 HBAR
Risk: HIGH
Required: 2 approvals

I will NOT approve this. Waiting for your command.
To approve: "Approve pg_xxxx"
```

### 3. Multi-Sig Requires Multiple Humans
For HIGH/CRITICAL risk:
- First approval: Records CFO/CTO/Security Lead signature
- Second approval (different user): Records second signature
- Threshold met: Transaction executes

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/balance | Account balance |
| POST | /api/proposal/transfer | Create transfer |
| POST | /api/challenge/:id/approve | Approve challenge |
| POST | /api/challenge/:id/reject | Reject challenge |
| GET | /api/challenge/:id/status | Challenge status |
| GET | /api/challenges/pending | List pending |
| GET | /api/audit-logs | HCS audit logs |

## Configuration

Environment variables in `.env`:

```env
# Hedera
HEDERA_ACCOUNT_ID=0.0.xxxxxx
HEDERA_PRIVATE_KEY=3030...
HEDERA_NETWORK=testnet

# PolicyGuard
AUDIT_TOPIC_ID=0.0.xxxxxx
AUTO_APPROVE_LOW_RISK=true
LOW_RISK_THRESHOLD=20

# Server
PORT=3000
```

## Architecture

```
User Request → OpenClaw → PolicyGuard API → Challenge Created
                                              ↓
User Approval Command → OpenClaw → PolicyGuard API → Record Approval
                                              ↓
                              Threshold Met? → Execute on Hedera
                                              ↓
                                       Log to HCS
```

## Files

- `src/agent/policy-guard-interceptor.ts` - Core approval logic
- `src/utils/challenge-storage.ts` - File-based challenge persistence
- `src/utils/risk-assessor.ts` - Risk level calculation
- `src/api/routes.ts` - REST API endpoints
- `openclaw-plugin/` - OpenClaw integration

## Safety Checklist

- [ ] LLM never calls approve endpoint automatically
- [ ] User must explicitly say "Approve [id]"
- [ ] Multi-sig requires 2+ different users for HIGH risk
- [ ] All approvals logged to HCS
- [ ] Challenge storage persists across restarts

## License

MIT
