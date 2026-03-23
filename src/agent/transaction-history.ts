// src/agent/transaction-history.ts - Transaction history tracking

export interface TransactionRecord {
  id: string;
  type: 'TRANSFER' | 'MINT' | 'BURN' | 'APPROVE';
  amount?: number;
  to?: string;
  from: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
  riskLevel: string;
  challengeId?: string;
  txId?: string;
  timestamp: number;
  approvedBy?: string[];
  rejectionReason?: string;
}

export class TransactionHistory {
  private transactions: TransactionRecord[] = [];

  add(record: TransactionRecord): void {
    this.transactions.push(record);
  }

  update(id: string, updates: Partial<TransactionRecord>): void {
    const tx = this.transactions.find(t => t.id === id);
    if (tx) {
      Object.assign(tx, updates);
    }
  }

  getAll(filters?: { status?: string; riskLevel?: string; limit?: number }): TransactionRecord[] {
    let results = [...this.transactions];
    
    if (filters?.status) {
      results = results.filter(t => t.status === filters.status);
    }
    if (filters?.riskLevel) {
      results = results.filter(t => t.riskLevel === filters.riskLevel);
    }
    if (filters?.limit) {
      results = results.slice(-filters.limit);
    }
    
    return results.reverse();
  }

  getById(id: string): TransactionRecord | undefined {
    return this.transactions.find(t => t.id === id);
  }

  getStats() {
    const total = this.transactions.length;
    const approved = this.transactions.filter(t => t.status === 'EXECUTED').length;
    const rejected = this.transactions.filter(t => t.status === 'REJECTED').length;
    const pending = this.transactions.filter(t => t.status === 'PENDING').length;
    
    return { total, approved, rejected, pending };
  }
}
