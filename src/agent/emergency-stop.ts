// src/agent/emergency-stop.ts - Emergency pause functionality

export class EmergencyStop {
  private isPaused: boolean = false;
  private pausedAt: number | null = null;
  private reason: string | null = null;

  pause(reason: string): void {
    this.isPaused = true;
    this.pausedAt = Date.now();
    this.reason = reason;
    console.log(`🚨 EMERGENCY STOP ACTIVATED: ${reason}`);
  }

  resume(): void {
    this.isPaused = false;
    this.pausedAt = null;
    this.reason = null;
    console.log('✅ Emergency stop lifted');
  }

  isActive(): boolean {
    return this.isPaused;
  }

  getStatus() {
    return {
      isPaused: this.isPaused,
      pausedAt: this.pausedAt,
      reason: this.reason
    };
  }

  checkOrThrow(): void {
    if (this.isPaused) {
      throw new Error(`🚨 All transactions paused: ${this.reason}`);
    }
  }
}
