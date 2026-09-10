"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurableWorkerEngine = void 0;
const Orchestrator_js_1 = require("../orchestrator/Orchestrator.js");
const QueueManager_js_1 = require("./QueueManager.js");
const IdempotencyManager_js_1 = require("./IdempotencyManager.js");
const AuditStream_js_1 = require("./AuditStream.js");
class DurableWorkerEngine {
    isRunning = false;
    concurrency = 2;
    activeWorkers = 0;
    constructor(concurrency = 2) {
        this.concurrency = concurrency;
    }
    start() {
        this.isRunning = true;
    }
    stop() {
        this.isRunning = false;
    }
    async processNext(toolAdapter, amount) {
        const item = QueueManager_js_1.QueueManager.pollNext();
        if (!item)
            return null;
        const idempotencyKey = item.intent.idempotencyKey || `idemp_${item.task.id}`;
        const roleKey = item.intent.roleKey || 'ceo_assistant';
        // Acquire Idempotency Lock
        const locked = IdempotencyManager_js_1.IdempotencyManager.acquireLock(idempotencyKey, item.task.id);
        if (!locked) {
            const lock = IdempotencyManager_js_1.IdempotencyManager.getLock(idempotencyKey);
            if (lock && lock.status === 'COMPLETED') {
                AuditStream_js_1.AuditStream.emit(item.task.organizationId, item.task.id, item.task.employeeId, roleKey, 'TASK_COMPLETED', 'INFO', { note: 'Duplicate execution prevented by Idempotency Lock Manager' });
                return {
                    task: item.task,
                    success: true,
                    approvalRequired: false,
                    decisionTrace: {
                        traceId: `tr_idemp_${item.task.id}`,
                        taskId: item.task.id,
                        organizationId: item.task.organizationId,
                        employeeId: item.task.employeeId,
                        roleKey,
                        stepName: 'DUPLICATE_SKIPPED',
                        inputSnapshot: item.intent,
                        outputSnapshot: { status: 'COMPLETED_PRIOR' },
                        permissionCheckResult: true,
                        policyCheckResult: true,
                        executionTimeMs: 0,
                        timestamp: new Date().toISOString()
                    },
                    auditEvent: {
                        eventId: `aud_idemp_${item.task.id}`,
                        organizationId: item.task.organizationId,
                        actorId: item.task.employeeId,
                        actorType: 'AI_EMPLOYEE',
                        eventType: 'TASK_COMPLETED',
                        resourceId: item.task.id,
                        resourceType: 'TASK',
                        details: { skipped: true },
                        timestamp: new Date().toISOString()
                    }
                };
            }
        }
        try {
            this.activeWorkers++;
            const result = await Orchestrator_js_1.Orchestrator.executeTask({
                task: item.task,
                roleKey,
                toolIntent: item.intent,
                toolAdapter,
                amount
            });
            if (result.success) {
                IdempotencyManager_js_1.IdempotencyManager.completeLock(idempotencyKey, result);
                AuditStream_js_1.AuditStream.emit(item.task.organizationId, item.task.id, item.task.employeeId, roleKey, 'TASK_COMPLETED', 'INFO', { traceId: result.decisionTrace.traceId });
            }
            else {
                IdempotencyManager_js_1.IdempotencyManager.releaseLock(idempotencyKey);
                QueueManager_js_1.QueueManager.handleFailure(item, new Error('Task execution failed or requires approval'));
            }
            return result;
        }
        catch (err) {
            IdempotencyManager_js_1.IdempotencyManager.releaseLock(idempotencyKey);
            QueueManager_js_1.QueueManager.handleFailure(item, err);
            throw err;
        }
        finally {
            this.activeWorkers--;
        }
    }
    getActiveWorkerCount() {
        return this.activeWorkers;
    }
}
exports.DurableWorkerEngine = DurableWorkerEngine;
//# sourceMappingURL=DurableWorkerEngine.js.map