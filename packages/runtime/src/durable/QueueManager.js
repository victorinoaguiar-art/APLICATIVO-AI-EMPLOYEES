"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const AuditStream_js_1 = require("./AuditStream.js");
class QueueManager {
    static mainQueue = [];
    static dlq = [];
    static enqueue(task, intent, priority = 'NORMAL', maxAttempts = 3) {
        const now = new Date().toISOString();
        const item = {
            id: `q_${task.id}_${Date.now()}`,
            task,
            intent,
            priority,
            attempts: 0,
            maxAttempts,
            nextAttemptAt: now,
            enqueuedAt: now
        };
        this.mainQueue.push(item);
        // Sort by priority (HIGH first, then NORMAL, then LOW)
        this.sortQueue();
        AuditStream_js_1.AuditStream.emit(task.organizationId, task.id, task.employeeId, intent.roleKey || 'default', 'TASK_CREATED', 'INFO', { queueId: item.id, priority, maxAttempts });
        return item;
    }
    static pollNext() {
        const now = new Date();
        const index = this.mainQueue.findIndex(item => new Date(item.nextAttemptAt) <= now);
        if (index === -1)
            return undefined;
        const [item] = this.mainQueue.splice(index, 1);
        item.attempts += 1;
        return item;
    }
    static handleFailure(item, error) {
        item.lastError = error.message;
        if (item.attempts >= item.maxAttempts) {
            // Route to Dead-Letter Queue (DLQ)
            const dlqItem = {
                id: `dlq_${item.id}`,
                queueItem: item,
                failedAt: new Date().toISOString(),
                reason: error.message,
                requeuedCount: 0
            };
            this.dlq.push(dlqItem);
            AuditStream_js_1.AuditStream.emit(item.task.organizationId, item.task.id, item.task.employeeId, item.intent.roleKey || 'default', 'DLQ_ROUTED', 'ERROR', { dlqId: dlqItem.id, attempts: item.attempts, reason: error.message });
        }
        else {
            // Exponential Backoff calculation: 100ms * (2 ^ (attempts - 1))
            const backoffMs = 100 * Math.pow(2, item.attempts - 1);
            item.nextAttemptAt = new Date(Date.now() + backoffMs).toISOString();
            this.mainQueue.push(item);
            this.sortQueue();
            AuditStream_js_1.AuditStream.emit(item.task.organizationId, item.task.id, item.task.employeeId, item.intent.roleKey || 'default', 'RETRY_ATTEMPTED', 'WARNING', { attempts: item.attempts, nextAttemptAt: item.nextAttemptAt, error: error.message });
        }
    }
    static requeueFromDLQ(dlqId) {
        const index = this.dlq.findIndex(d => d.id === dlqId);
        if (index === -1) {
            throw new Error(`DLQ Item not found for id: ${dlqId}`);
        }
        const [dlqItem] = this.dlq.splice(index, 1);
        const item = dlqItem.queueItem;
        item.attempts = 0; // Reset attempts
        item.nextAttemptAt = new Date().toISOString();
        this.mainQueue.push(item);
        this.sortQueue();
        AuditStream_js_1.AuditStream.emit(item.task.organizationId, item.task.id, item.task.employeeId, item.intent.roleKey || 'default', 'TASK_CREATED', 'INFO', { requeuedFromDLQ: dlqId });
        return item;
    }
    static getQueueStats() {
        return {
            mainQueueCount: this.mainQueue.length,
            dlqCount: this.dlq.length
        };
    }
    static getDLQItems() {
        return [...this.dlq];
    }
    static clear() {
        this.mainQueue = [];
        this.dlq = [];
    }
    static sortQueue() {
        const priorityOrder = { HIGH: 0, NORMAL: 1, LOW: 2 };
        this.mainQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
}
exports.QueueManager = QueueManager;
//# sourceMappingURL=QueueManager.js.map