import * as fs from 'fs';
import * as path from 'path';

interface ChallengeStore {
  [challengeId: string]: {
    proposal: any;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decision?: any;
    createdAt: number;
  };
}

const STORE_FILE = path.join(process.cwd(), '.policyguard-challenges.json');

export class ChallengeStorage {
  private static load(): ChallengeStore {
    try {
      if (fs.existsSync(STORE_FILE)) {
        return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load challenge store:', e);
    }
    return {};
  }

  private static save(store: ChallengeStore): void {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    } catch (e) {
      console.error('Failed to save challenge store:', e);
    }
  }

  static create(challengeId: string, proposal: any): void {
    const store = this.load();
    store[challengeId] = {
      proposal,
      status: 'PENDING',
      createdAt: Date.now()
    };
    this.save(store);
  }

  static get(challengeId: string): any | null {
    const store = this.load();
    return store[challengeId] || null;
  }

  static approve(challengeId: string, reason: string): boolean {
    const store = this.load();
    if (store[challengeId] && store[challengeId].status === 'PENDING') {
      store[challengeId].status = 'APPROVED';
      store[challengeId].decision = { approved: true, reason };
      this.save(store);
      return true;
    }
    return false;
  }

  static reject(challengeId: string, reason: string): boolean {
    const store = this.load();
    if (store[challengeId] && store[challengeId].status === 'PENDING') {
      store[challengeId].status = 'REJECTED';
      store[challengeId].decision = { approved: false, reason };
      this.save(store);
      return true;
    }
    return false;
  }

  static listPending(): Array<{ challengeId: string; proposal: any }> {
    const store = this.load();
    return Object.entries(store)
      .filter(([_, data]) => data.status === 'PENDING')
      .map(([id, data]) => ({ challengeId: id, proposal: data.proposal }));
  }

  static cleanup(): void {
    const store = this.load();
    const now = Date.now();
    const ONE_HOUR = 3600000;
    
    Object.keys(store).forEach(id => {
      if (now - store[id].createdAt > ONE_HOUR) {
        delete store[id];
      }
    });
    
    this.save(store);
  }
}
