"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStateMachine = void 0;
const shared_1 = require("@ai-employee/shared");
class TaskStateMachine {
    static ALLOWED_TRANSITIONS = {
        CREATED: ['QUEUED', 'CANCELLED'],
        QUEUED: ['RESOLVING_ROLE', 'CANCELLED', 'PAUSED_GLOBAL'],
        RESOLVING_ROLE: ['LOADING_CONTEXT', 'FAILED'],
        LOADING_CONTEXT: ['AUTHORIZING', 'FAILED'],
        AUTHORIZING: ['ROUTING_MODEL', 'BLOCKED', 'FAILED'],
        ROUTING_MODEL: ['PLANNING', 'FAILED'],
        PLANNING: ['WAITING_TOOL', 'WAITING_APPROVAL', 'EXECUTING_TOOLS', 'FAILED'],
        WAITING_TOOL: ['EXECUTING_TOOLS', 'FAILED'],
        WAITING_DATA: ['PLANNING', 'FAILED'],
        WAITING_APPROVAL: ['EXECUTING_TOOLS', 'BLOCKED', 'CANCELLED', 'FAILED'],
        EXECUTING_TOOLS: ['FINALIZING', 'WAITING_APPROVAL', 'FAILED'],
        FINALIZING: ['COMPLETED', 'FAILED'],
        COMPLETED: [],
        FAILED: [],
        BLOCKED: ['AUTHORIZING', 'CANCELLED'],
        CANCELLED: [],
        PAUSED_GLOBAL: ['QUEUED', 'CANCELLED']
    };
    static transition(task, newStatus) {
        const current = task.status;
        const allowed = this.ALLOWED_TRANSITIONS[current] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid TaskState transition: ${current} -> ${newStatus}`);
        }
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        task.version += 1;
        if (newStatus === 'COMPLETED' || newStatus === 'FAILED' || newStatus === 'CANCELLED') {
            task.completedAt = task.updatedAt;
        }
        else if (newStatus === 'QUEUED' && !task.startedAt) {
            task.startedAt = task.updatedAt;
        }
        return task;
    }
    static createTask(orgId, employeeId, roleKey, title, instruction) {
        const now = new Date().toISOString();
        return {
            id: `task_${(0, shared_1.safeUUID)()}`,
            organizationId: orgId,
            employeeId,
            rolepackVersion: '2.0.0',
            promptVersion: '1.0.0',
            workflowVersion: '1.0.0',
            policyVersion: '1.0.0',
            title,
            instruction,
            priority: 'NORMAL',
            riskLevel: 'R2',
            autonomyLevel: 'L3',
            status: 'CREATED',
            requestedBy: 'user_system',
            estimatedCost: 0.05,
            actualCost: 0,
            configurationFingerprint: `fp_${roleKey}_v2`,
            createdAt: now,
            updatedAt: now,
            version: 1
        };
    }
}
exports.TaskStateMachine = TaskStateMachine;
//# sourceMappingURL=TaskStateMachine.js.map