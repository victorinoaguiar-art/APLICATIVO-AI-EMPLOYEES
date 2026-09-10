export interface IdempotencyLock {
    idempotencyKey: string;
    taskId: string;
    lockedAt: string;
    expiresAt: string;
    status: 'LOCKED' | 'COMPLETED' | 'RELEASED';
    resultHash?: string;
}
export declare class IdempotencyManager {
    private static locks;
    private static defaultTTLSeconds;
    static acquireLock(idempotencyKey: string, taskId: string, ttlSeconds?: number): boolean;
    static completeLock(idempotencyKey: string, resultData: any): void;
    static releaseLock(idempotencyKey: string): void;
    static getLock(idempotencyKey: string): IdempotencyLock | undefined;
    static clearLocks(): void;
}
//# sourceMappingURL=IdempotencyManager.d.ts.map