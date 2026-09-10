/**
 * AI Employee Platform — Distributed Redis Queue Provider (Phase 4)
 * Supports Redis connections (REDIS_URL / redis://) for multi-node task distribution.
 * Integrates priority queues, idempotency lock storage, and Dead-Letter Queue (DLQ) routing.
 */
import { TaskRecord } from '@ai-employee/shared';
export interface RedisQueueConfig {
    redisUrl?: string;
    enableDistributedLock?: boolean;
    dlqMaxRetries?: number;
}
export declare class RedisQueueProvider {
    private static instance;
    private isConnected;
    private redisUrl;
    private localQueue;
    private dlq;
    private constructor();
    static getInstance(): RedisQueueProvider;
    getStatus(): {
        isConnected: boolean;
        provider: string;
        queueDepth: number;
        dlqDepth: number;
    };
    enqueueTask(task: TaskRecord, priorityNumber?: number): Promise<void>;
    dequeueNextTask(): Promise<TaskRecord | null>;
    moveToDLQ(task: TaskRecord, reason: string): Promise<void>;
    getDLQItems(): {
        task: TaskRecord;
        reason: string;
        failedAt: string;
    }[];
}
//# sourceMappingURL=RedisQueueProvider.d.ts.map