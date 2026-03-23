// src/api/routes.ts

import { Router } from 'express';
import { PolicyGuardedAgent } from '../agent';

export function createRoutes(agent: PolicyGuardedAgent): Router {
  const router = Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get balance
  router.get('/balance', async (req, res) => {
    try {
      const balance = await agent.getBalance();
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create transfer proposal
  router.post('/proposal/transfer', async (req, res) => {
    try {
      const { to, amount, tokenId } = req.body;
      
      if (!to || !amount) {
        return res.status(400).json({ 
          error: 'Missing required fields: to, amount' 
        });
      }

      const result = await agent.transfer({ to, amount, tokenId });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Approve a challenge
  router.post('/challenge/:challengeId/approve', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { reason } = req.body;
      
      const success = await agent.approveChallenge(challengeId, reason);
      
      if (success) {
        res.json({ success: true, message: 'Challenge approved' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Challenge not found or already decided' 
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reject a challenge
  router.post('/challenge/:challengeId/reject', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const { reason } = req.body;
      
      const success = await agent.rejectChallenge(challengeId, reason);
      
      if (success) {
        res.json({ success: true, message: 'Challenge rejected' });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Challenge not found or already decided' 
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pending challenges
  router.get('/challenges/pending', (req, res) => {
    const challenges = agent.getPendingChallenges();
    res.json(challenges);
  });

  // Get audit logs
  router.get('/audit-logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await agent.getAuditLogs(limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
