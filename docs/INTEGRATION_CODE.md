# PolicyGuard + Hedera 集成代码示例

> 核心集成逻辑，可直接用于项目开发

---

## 1. PolicyGuard 拦截器

```typescript
// src/agent/policy-guard-interceptor.ts
import { PolicyGuardClient } from '@openclaw/policyguard';
import { HCS10Client } from '@hashgraphonline/standards-agent-kit';

interface TransactionProposal {
  id: string;
  type: 'TRANSFER' | 'MINT' | 'BURN' | 'CALL_CONTRACT';
  amount?: number;
  tokenId?: string;
  to?: string;
  data?: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class PolicyGuardInterceptor {
  private policyGuard: PolicyGuardClient;
  private hcsClient: HCS10Client;
  private auditTopicId: string;

  constructor(config: {
    policyGuardEndpoint: string;
    hederaAccountId: string;
    hederaPrivateKey: string;
    auditTopicId: string;
  }) {
    this.policyGuard = new PolicyGuardClient(config.policyGuardEndpoint);
    this.hcsClient = new HCS10Client({
      network: 'testnet',
      accountId: config.hederaAccountId,
      privateKey: config.hederaPrivateKey
    });
    this.auditTopicId = config.auditTopicId;
  }

  /**
   * 拦截交易提案，等待PolicyGuard审批
   */
  async intercept(proposal: TransactionProposal): Promise<{
    approved: boolean;
    challengeId?: string;
    approvalToken?: string;
  }> {
    // 1. 评估风险等级
    const riskLevel = this.assessRisk(proposal);
    proposal.riskLevel = riskLevel;

    // 2. 创建PolicyGuard挑战
    const challenge = await this.policyGuard.createChallenge({
      command: `/policy ${JSON.stringify(proposal)}`,
      metadata: {
        proposalId: proposal.id,
        riskLevel,
        requiresHumanApproval: riskLevel !== 'LOW'
      }
    });

    console.log(`🛡️ PolicyGuard Challenge created: ${challenge.id}`);

    // 3. 发送到HCS审计日志 (提案阶段)
    await this.logToHCS({
      type: 'PROPOSAL_CREATED',
      proposal,
      challengeId: challenge.id,
      timestamp: Date.now()
    });

    // 4. 等待审批 (轮询或Webhook)
    const decision = await this.waitForDecision(challenge.id);

    // 5. 记录审批结果到HCS
    await this.logToHCS({
      type: 'PROPOSAL_DECIDED',
      proposal,
      challengeId: challenge.id,
      decision: decision.approved ? 'APPROVED' : 'REJECTED',
      timestamp: Date.now()
    });

    if (decision.approved) {
      // 6. 铸造审批凭证NFT
      const approvalToken = await this.mintApprovalToken(proposal, challenge.id);
      
      return {
        approved: true,
        challengeId: challenge.id,
        approvalToken
      };
    }

    return { approved: false, challengeId: challenge.id };
  }

  /**
   * 风险评估逻辑
   */
  private assessRisk(proposal: TransactionProposal): string {
    const amount = proposal.amount || 0;
    
    if (proposal.type === 'BURN') return 'CRITICAL';
    if (amount > 1000) return 'CRITICAL';
    if (amount > 100) return 'HIGH';
    if (amount > 10) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * 等待PolicyGuard决策
   */
  private async waitForDecision(challengeId: string, timeoutMs = 300000): Promise<{
    approved: boolean;
  }> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const status = await this.policyGuard.getStatus(challengeId);
      
      if (status.decision === 'APPROVED') {
        return { approved: true };
      }
      if (status.decision === 'REJECTED') {
        return { approved: false };
      }
      
      // 每5秒轮询一次
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('PolicyGuard审批超时');
  }

  /**
   * 记录到HCS审计日志
   */
  private async logToHCS(message: any): Promise<void> {
    const messageBytes = new TextEncoder().encode(JSON.stringify(message));
    await this.hcsClient.submitMessage(this.auditTopicId, messageBytes);
    console.log(`📝 已记录到HCS: ${message.type}`);
  }

  /**
   * 铸造审批凭证NFT
   */
  private async mintApprovalToken(proposal: any, challengeId: string): Promise<string> {
    // 使用HTS创建NFT作为审批凭证
    const { tokenId } = await this.hcsClient.createNFT({
      name: `PolicyGuard Approval - ${proposal.id}`,
      symbol: 'PGA',
      metadata: JSON.stringify({
        proposalId: proposal.id,
        challengeId,
        approvedAt: Date.now(),
        expiresAt: Date.now() + 3600000, // 1小时有效期
        riskLevel: proposal.riskLevel
      })
    });
    
    console.log(`🎫 审批凭证NFT铸造: ${tokenId}`);
    return tokenId;
  }
}

export { PolicyGuardInterceptor };
```

---

## 2. Agent 核心

```typescript
// src/agent/index.ts
import { HederaAgentKit } from '@hashgraphonline/standards-agent-kit';
import { PolicyGuardInterceptor } from './policy-guard-interceptor';

class PolicyGuardedAgent {
  private hederaKit: HederaAgentKit;
  private interceptor: PolicyGuardInterceptor;

  constructor(config: {
    hederaAccountId: string;
    hederaPrivateKey: string;
    policyGuardEndpoint: string;
    auditTopicId: string;
  }) {
    this.hederaKit = new HederaAgentKit({
      accountId: config.hederaAccountId,
      privateKey: config.hederaPrivateKey,
      network: 'testnet'
    });

    this.interceptor = new PolicyGuardInterceptor({
      policyGuardEndpoint: config.policyGuardEndpoint,
      hederaAccountId: config.hederaAccountId,
      hederaPrivateKey: config.hederaPrivateKey,
      auditTopicId: config.auditTopicId
    });
  }

  /**
   * 转账 (受PolicyGuard保护)
   */
  async transfer(params: {
    to: string;
    amount: number;
    tokenId?: string; // undefined = HBAR
  }): Promise<{
    success: boolean;
    txId?: string;
    message: string;
  }> {
    // 1. 创建交易提案
    const proposal = {
      id: `tx_${Date.now()}`,
      type: 'TRANSFER' as const,
      to: params.to,
      amount: params.amount,
      tokenId: params.tokenId,
      data: { from: this.hederaKit.accountId }
    };

    // 2. 通过PolicyGuard拦截
    const decision = await this.interceptor.intercept(proposal);

    if (!decision.approved) {
      return {
        success: false,
        message: `❌ 交易被PolicyGuard拒绝 (Challenge: ${decision.challengeId})`
      };
    }

    // 3. 执行交易
    try {
      let txId: string;
      
      if (params.tokenId) {
        // HTS代币转账
        txId = await this.hederaKit.transferToken({
          tokenId: params.tokenId,
          to: params.to,
          amount: params.amount
        });
      } else {
        // HBAR转账
        txId = await this.hederaKit.transferHBAR({
          to: params.to,
          amount: params.amount
        });
      }

      return {
        success: true,
        txId,
        message: `✅ 交易已执行\n- TX ID: ${txId}\n- PolicyGuard: ${decision.challengeId}\n- Approval NFT: ${decision.approvalToken}`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ 交易执行失败: ${error.message}`
      };
    }
  }

  /**
   * 查询余额
   */
  async getBalance(): Promise<{
    hbar: number;
    tokens: Array<{ tokenId: string; balance: number }>;
  }> {
    return this.hederaKit.getBalance();
  }
}

export { PolicyGuardedAgent };
```

---

## 3. API 路由

```typescript
// src/api/routes.ts
import express from 'express';
import { PolicyGuardedAgent } from '../agent';

const router = express.Router();
const agent = new PolicyGuardedAgent({
  hederaAccountId: process.env.HEDERA_ACCOUNT_ID!,
  hederaPrivateKey: process.env.HEDERA_PRIVATE_KEY!,
  policyGuardEndpoint: process.env.POLICYGUARD_ENDPOINT!,
  auditTopicId: process.env.AUDIT_TOPIC_ID!
});

// 创建转账提案
router.post('/proposal/transfer', async (req, res) => {
  const { to, amount, tokenId } = req.body;
  
  const result = await agent.transfer({ to, amount, tokenId });
  
  res.json(result);
});

// 查询余额
router.get('/balance', async (req, res) => {
  const balance = await agent.getBalance();
  res.json(balance);
});

// 查询审计日志 (从HCS读取)
router.get('/audit-log', async (req, res) => {
  const messages = await agent.getAuditLog();
  res.json(messages);
});

export default router;
```

---

## 4. 前端审批界面

```tsx
// frontend/components/ApprovalCard.tsx
import React from 'react';

interface ApprovalCardProps {
  proposal: {
    id: string;
    type: string;
    amount: number;
    to: string;
    riskLevel: string;
    challengeId: string;
  };
  onApprove: (challengeId: string) => void;
  onReject: (challengeId: string) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  proposal,
  onApprove,
  onReject
}) => {
  const riskColors = {
    LOW: '🟢',
    MEDIUM: '🟡',
    HIGH: '🟠',
    CRITICAL: '🔴'
  };

  return (
    <div className="approval-card" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      background: proposal.riskLevel === 'CRITICAL' ? '#fff5f5' : '#fff'
    }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>交易 #{proposal.id}</span>
        <span>{riskColors[proposal.riskLevel]} {proposal.riskLevel}</span>
      </div>
      
      <div className="details" style={{ margin: '12px 0' }}>
        <p><strong>类型:</strong> {proposal.type}</p>
        <p><strong>金额:</strong> {proposal.amount} HBAR</p>
        <p><strong>目标:</strong> {proposal.to}</p>
        <p><strong>Challenge ID:</strong> {proposal.challengeId}</p>
      </div>
      
      <div className="actions" style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => onApprove(proposal.challengeId)}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ✅ 批准
        </button>
        
        <button 
          onClick={() => onReject(proposal.challengeId)}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ❌ 拒绝
        </button>
      </div>
    </div>
  );
};
```

---

## 5. 使用示例

```typescript
// 示例: 使用PolicyGuardedAgent
import { PolicyGuardedAgent } from './agent';

async function main() {
  const agent = new PolicyGuardedAgent({
    hederaAccountId: '0.0.12345',
    hederaPrivateKey: '0x...',
    policyGuardEndpoint: 'https://policyguard.openclaw.ai',
    auditTopicId: '0.0.67890'
  });

  // 用户请求转账
  console.log('用户: 帮我把100 HBAR转给alice');
  
  const result = await agent.transfer({
    to: '0.0.54321',
    amount: 100
  });

  console.log(result.message);
  // 输出:
  // ✅ 交易已执行
  // - TX ID: 0.0.12345@timestamp
  // - PolicyGuard: 106a5842fc5fce6f
  // - Approval NFT: 0.0.99999
}

main();
```

---

*代码可直接用于项目开发*
