// src/api/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PolicyGuardedAgent } from '../agent';
import { createRoutes } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Validate environment
const requiredEnv = ['HEDERA_ACCOUNT_ID', 'HEDERA_PRIVATE_KEY', 'AUDIT_TOPIC_ID'];
const missing = requiredEnv.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('Please copy .env.example to .env and fill in your values');
  process.exit(1);
}

// Initialize Agent
const agent = new PolicyGuardedAgent({
  hederaAccountId: process.env.HEDERA_ACCOUNT_ID!,
  hederaPrivateKey: process.env.HEDERA_PRIVATE_KEY!,
  policyGuardEndpoint: process.env.POLICYGUARD_ENDPOINT || 'https://policyguard.openclaw.ai',
  auditTopicId: process.env.AUDIT_TOPIC_ID!,
  autoApproveLowRisk: process.env.AUTO_APPROVE_LOW_RISK === 'true'
});

// Routes
app.use('/api', createRoutes(agent));

// Root endpoint with info
app.get('/', (req, res) => {
  res.json({
    name: 'PolicyGuard Agent',
    description: 'Human-in-the-loop AI Agent with PolicyGuard protection on Hedera',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      balance: 'GET /api/balance',
      transfer: 'POST /api/proposal/transfer',
      approve: 'POST /api/challenge/:id/approve',
      reject: 'POST /api/challenge/:id/reject',
      pending: 'GET /api/challenges/pending',
      audit: 'GET /api/audit-logs'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🛡️  PolicyGuard Agent Server
═══════════════════════════════
Server running on http://localhost:${PORT}

Environment:
  Account: ${process.env.HEDERA_ACCOUNT_ID}
  Network: testnet
  Audit Topic: ${process.env.AUDIT_TOPIC_ID}

Available endpoints:
  GET  /api/health           - Health check
  GET  /api/balance          - Get account balance
  POST /api/proposal/transfer - Create transfer proposal
  POST /api/challenge/:id/approve - Approve a challenge
  POST /api/challenge/:id/reject  - Reject a challenge
  GET  /api/challenges/pending - List pending challenges
  GET  /api/audit-logs       - Get audit logs from HCS

Quick test:
  curl http://localhost:${PORT}/api/health
  `);
});

export default app;
