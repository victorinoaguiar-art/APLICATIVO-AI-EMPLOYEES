import { TaskRecord, ToolCallIntent } from '@ai-employee/shared';
export interface QueueItem {
    id: string;
    task: TaskRecord;
    intent: ToolCallIntent;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    attempts: number;
    maxAttempts: number;
    nextAttemptAt: string;
    lastError?: string;
    enqueuedAt: string;
}
export interface DLQItem {
    id: string;
    queueItem: QueueItem;
    failedAt: string;
    reason: string;
    requeuedCount: number;
}
export declare class QueueManager {
    private static mainQueue;
    private static dlq;
    static enqueue(task: TaskRecord, intent: ToolCallIntent, priority?: 'HIGH' | 'NORMAL' | 'LOW', maxAttempts?: number): QueueItem;
    static pollNext(): QueueItem | undefined;
    static handleFailure(item: QueueItem, error: Error): void;
    static requeueFromDLQ(dlqId: string): QueueItem;
    static getQueueStats(): {
        mainQueueCount: number;
        dlqCount: number;
    };
    static getDLQItems(): DLQItem[];
    static clear(): void;
    private static sortQueue;
}
//# sourceMappingURL=QueueManager.d.ts.map