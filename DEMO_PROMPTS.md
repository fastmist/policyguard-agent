# 🎬 PolicyGuard Demo - All Prompts

## Scene 1: Problem Introduction (0:00-0:40)
**No user prompts** - Narration only

---

## Scene 2: Solution Overview (0:40-1:10)
**No user prompts** - System displays architecture

---

## Scene 3: Auto-Approval (1:10-2:00)

### User Prompt:
```
Pay Bob 2 HBAR
```

### System Response:
- Risk Assessment: LOW
- Auto-approved (below 10 HBAR threshold)
- Transaction executed on Hedera Testnet

---

## Scene 4: Human Approval (2:00-3:00)

### Step 1 - User Initiates:
```
Send 30 HBAR to contractor
```

### Step 2 - System Creates Challenge:
- Challenge ID: [auto-generated]
- Status: PENDING
- Required: Human approval

### Step 3 - User Reviews:
```
[Review transaction details]
✓ Recipient verified
✓ Amount correct
✓ No red flags
```

### Step 4 - User Approves:
```
/approve "Legitimate payment"
```

### System Response:
- Challenge APPROVED
- Transaction executed on Hedera Testnet

---

## Scene 5: Multi-Signature (3:00-4:00)

### Step 1 - User Initiates:
```
Request 40 HBAR for equipment
```

### Step 2 - System Creates Multi-sig Challenge:
- Required: 2 of 3 approvers
- Approvers: CFO, CTO, Security Lead

### Step 3 - First Approver (CFO):
```
/approve "Business verified"
```

### System Response:
- Signatures: 1 of 3
- Waiting for second signature...

### Step 4 - Second Approver (CTO):
```
/approve "Technical validated"
```

### System Response:
- Signatures: 2 of 3 ✓ THRESHOLD MET
- Transaction executed on Hedera Testnet

---

## Scene 6: Audit Trail (4:00-4:30)
**No user prompts** - System displays HCS logs

---

## Scene 7: Outro (4:30-5:00)
**No user prompts** - Summary screen

---

## Summary of All User Prompts

| Scene | Prompt | Purpose |
|-------|--------|---------|
| 3 | `Pay Bob 2 HBAR` | Low-risk transaction (auto-approved) |
| 4 | `Send 30 HBAR to contractor` | Medium-risk (creates challenge) |
| 4 | `/approve "Legitimate payment"` | Approve challenge |
| 5 | `Request 40 HBAR for equipment` | High-risk (creates multi-sig) |
| 5 | `/approve "Business verified"` | CFO approval |
| 5 | `/approve "Technical validated"` | CTO approval |

---

## CLI Commands (for terminal demo)

```bash
# Check balance
curl http://localhost:3000/api/balance

# Create transfer proposal
curl -X POST http://localhost:3000/api/proposal/transfer \
  -H "Content-Type: application/json" \
  -d '{"to":"0.0.1001","amount":2}'

# List pending challenges
curl http://localhost:3000/api/challenges/pending

# Approve challenge
curl -X POST http://localhost:3000/api/challenge/CH-001/approve \
  -H "Content-Type: application/json" \
  -d '{"reason":"Verified payment"}'

# Reject challenge
curl -X POST http://localhost:3000/api/challenge/CH-001/reject \
  -H "Content-Type: application/json" \
  -d '{"reason":"Suspicious activity"}'

# Get audit logs
curl http://localhost:3000/api/audit-logs
```
