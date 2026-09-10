import { safeHash } from '@ai-employee/shared';

export interface IdempotencyLock {
  idempotencyKey: string;
  taskId: string;
  lockedAt: string;
  expiresAt: string;
  status: 'LOCKED' | 'COMPLETED' | 'RELEASED';
  resultHash?: string;
}

export class IdempotencyManager {
  private static locks: Map<string, IdempotencyLock> = new Map();
  private static defaultTTLSeconds: number = 300; // 5 minutes TTL

  public static acquireLock(idempotencyKey: string, taskId: string, ttlSeconds: number = this.defaultTTLSeconds): boolean {
    const now = new Date();
    const existing = this.locks.get(idempotencyKey);

    if (existing) {
      const expiresAt = new Date(existing.expiresAt);
      if (existing.status === 'LOCKED' && expiresAt > now) {
        return false; // Lock is currently active and unexpired
      }
      if (existing.status === 'COMPLETED') {
        return false; // Already executed and completed
      }
    }

    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();
    const lock: IdempotencyLock = {
      idempotencyKey,
      taskId,
      lockedAt: now.toISOString(),
      expiresAt,
      status: 'LOCKED'
    };

    this.locks.set(idempotencyKey, lock);
    return true;
  }

  public static completeLock(idempotencyKey: string, resultData: any): void {
    const lock = this.locks.get(idempotencyKey);
    if (lock) {
      lock.status = 'COMPLETED';
      lock.resultHash = safeHash(JSON.stringify(resultData));
      this.locks.set(idempotencyKey, lock);
    }
  }

  public static releaseLock(idempotencyKey: string): void {
    const lock = this.locks.get(idempotencyKey);
    if (lock) {
      lock.status = 'RELEASED';
      this.locks.set(idempotencyKey, lock);
    }
  }

  public static getLock(idempotencyKey: string): IdempotencyLock | undefined {
    return this.locks.get(idempotencyKey);
  }

  public static clearLocks(): void {
    this.locks.clear();
  }
}
