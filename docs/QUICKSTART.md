# Quick Start Guide - PolicyGuard Agent

A step-by-step guide to get PolicyGuard Agent running.

---

## Prerequisites

- Node.js 18+ and npm
- Git
- A Hedera Testnet account (free)

---

## Step 1: Get a Hedera Testnet Account

### Option A: Hedera Portal (Recommended)
1. Go to https://portal.hedera.com/register
2. Create a free account
3. Verify your email
4. You'll receive:
   - **Account ID** (e.g., `0.0.1234567`)
   - **Private Key** (DER format, starts with `3030...`)

### Option B: Testnet Faucet
1. Go to https://portal.hedera.com/faucet
2. Enter your account ID
3. Receive 10,000 test HBAR

---

## Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/fastmist/policyguard-agent.git

# Enter directory
cd policyguard-agent

# Install dependencies
npm install
```

Expected output:
```
added 234 packages in 12s
```

---

## Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit the file
nano .env
```

Fill in your credentials:
```env
# Your Hedera Testnet Account
HEDERA_ACCOUNT_ID=0.0.1234567          # Replace with your account ID
HEDERA_PRIVATE_KEY=3030020100300706... # Replace with your private key (DER format)
HEDERA_NETWORK=testnet

# Audit Topic (will be auto-created if empty)
AUDIT_TOPIC_ID=

# Policy Settings
AUTO_APPROVE_LOW_RISK=true
LOW_RISK_THRESHOLD=20

# Server
PORT=3000
```

**Save and exit**: Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

---

## Step 4: Start the Server

```bash
npm run dev
```

Expected output:
```
🛡️  PolicyGuard Agent Server
═══════════════════════════════
Server running on http://localhost:3000

Environment:
  Account: 0.0.1234567
  Network: testnet
  Audit Topic: 0.0.xxxxxxx
```

**The server is now running!**

---

## Step 5: Test the API

Open a new terminal (keep the server running):

```bash
# Test health endpoint
curl http://localhost:3000/api/health
```

Expected:
```json
{"status":"ok","timestamp":"2026-03-23T..."}
```

```bash
# Check balance
curl http://localhost:3000/api/balance
```

Expected:
```json
{"hbar":10000.0,"accountId":"0.0.1234567"}
```

---

## Step 6: Create Your First Transaction

### Test 1: Auto-approved (LOW risk, ≤20 HBAR)

```bash
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.1001","amount":10}'
```

Expected:
```json
{
  "success": true,
  "txId": "0.0.1234567@1774270000.000000000",
  "message": "✅ Transaction executed successfully!"
}
```

### Test 2: Manual approval (MEDIUM risk, 21-100 HBAR)

```bash
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.1001","amount":50}'
```

Expected:
```json
{
  "challengeId": "pg_1774270000000_xxxxxxxx",
  "proposal": {
    "amount": 50,
    "riskLevel": "MEDIUM"
  }
}
```

**The challenge is now PENDING approval.**

---

## Step 7: Approve the Challenge

```bash
# Replace pg_xxxx with your actual challenge ID from Step 6
curl -X POST "http://localhost:3000/api/challenge/pg_1774270000000_xxxxxxxx/approve" \
  -H "Content-Type: application/json" \
  -d '{"role":"CFO","reason":"Test approval"}'
```

Expected:
```json
{
  "success": true,
  "message": "Threshold met! 1 approvals received. Executing transaction...",
  "thresholdMet": true
}
```

---

## Step 8: Verify on HashScan

1. Open https://hashscan.io/testnet
2. Search for your account ID (e.g., `0.0.1234567`)
3. See your transactions

Or directly:
```
https://hashscan.io/testnet/account/0.0.1234567
```

---

## Troubleshooting

### Error: "INVALID_SIGNATURE"
**Cause**: Using ED25519 key instead of ECDSA

**Fix**: In Hedera Portal, download the **ECDSA** key (starts with `3030...`)

### Error: "INSUFFICIENT_PAYER_BALANCE"
**Cause**: Account has no test HBAR

**Fix**: Get test HBAR from https://portal.hedera.com/faucet

### Error: "EADDRINUSE: address already in use :::3000"
**Cause**: Port 3000 is in use

**Fix**:
```bash
# Kill process on port 3000
fuser -k 3000/tcp

# Or use different port
PORT=3001 npm run dev
```

### Error: "Module not found"
**Cause**: Dependencies not installed

**Fix**:
```bash
rm -rf node_modules
npm install
```

---

## Next Steps

- Read [README.md](../README.md) for full documentation
- Try the [OpenClaw Plugin](../openclaw-plugin/) for natural language interface
- Explore the [Demo Scripts](../scripts/)

---

## One-Line Summary

```bash
git clone https://github.com/fastmist/policyguard-agent.git && cd policyguard-agent && npm install && cp .env.example .env && echo "Edit .env with your credentials" && npm run dev
```
