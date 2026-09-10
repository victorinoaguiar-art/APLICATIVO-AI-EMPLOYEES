"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyManager = void 0;
const shared_1 = require("@ai-employee/shared");
class IdempotencyManager {
    static locks = new Map();
    static defaultTTLSeconds = 300; // 5 minutes TTL
    static acquireLock(idempotencyKey, taskId, ttlSeconds = this.defaultTTLSeconds) {
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
        const lock = {
            idempotencyKey,
            taskId,
            lockedAt: now.toISOString(),
            expiresAt,
            status: 'LOCKED'
        };
        this.locks.set(idempotencyKey, lock);
        return true;
    }
    static completeLock(idempotencyKey, resultData) {
        const lock = this.locks.get(idempotencyKey);
        if (lock) {
            lock.status = 'COMPLETED';
            lock.resultHash = (0, shared_1.safeHash)(JSON.stringify(resultData));
            this.locks.set(idempotencyKey, lock);
        }
    }
    static releaseLock(idempotencyKey) {
        const lock = this.locks.get(idempotencyKey);
        if (lock) {
            lock.status = 'RELEASED';
            this.locks.set(idempotencyKey, lock);
        }
    }
    static getLock(idempotencyKey) {
        return this.locks.get(idempotencyKey);
    }
    static clearLocks() {
        this.locks.clear();
    }
}
exports.IdempotencyManager = IdempotencyManager;
//# sourceMappingURL=IdempotencyManager.js.map