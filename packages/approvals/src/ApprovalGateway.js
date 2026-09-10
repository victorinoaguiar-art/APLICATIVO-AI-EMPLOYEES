"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalGateway = void 0;
const shared_1 = require("@ai-employee/shared");
const policies_1 = require("@ai-employee/policies");
class ApprovalGateway {
    static pendingApprovals = new Map();
    static createPendingApproval(intent, riskLevel, impact, reason) {
        const snapshotHash = policies_1.SnapshotHasher.hashIntent(intent);
        const approvalId = `app_${(0, shared_1.safeUUID)()}`;
        const record = {
            approvalId,
            organizationId: intent.organizationId,
            taskId: intent.taskId,
            employeeId: intent.employeeId,
            requestedAction: `${intent.toolKey}:${intent.operation}`,
            toolKey: intent.toolKey,
            operation: intent.operation,
            riskLevel,
            impact,
            reason,
            evidence: { intent },
            snapshotReference: `snap_${intent.intentId}`,
            snapshotHash,
            requestedBy: intent.employeeId,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            version: 1
        };
        this.pendingApprovals.set(approvalId, record);
        return record;
    }
    static decideApproval(approvalId, decision, decidedBy) {
        const record = this.pendingApprovals.get(approvalId);
        if (!record) {
            throw new Error(`Approval record not found: ${approvalId}`);
        }
        if (record.status !== 'PENDING') {
            throw new Error(`Approval ${approvalId} is not in PENDING state (current: ${record.status})`);
        }
        record.status = decision;
        record.decidedBy = decidedBy;
        record.decidedAt = new Date().toISOString();
        record.version += 1;
        this.pendingApprovals.set(approvalId, record);
        return record;
    }
    static validateExecutionSnapshot(approvalId, currentIntent) {
        const record = this.pendingApprovals.get(approvalId);
        if (!record) {
            throw new Error(`Approval record not found: ${approvalId}`);
        }
        if (record.status !== 'APPROVED') {
            throw new Error(`Approval gateway blocked execution: status is ${record.status}, expected APPROVED`);
        }
        const isValidHash = policies_1.SnapshotHasher.verifySnapshot(currentIntent, record.snapshotHash);
        if (!isValidHash) {
            throw new Error(`APPROVED_SNAPSHOT_MISMATCH: The pending action payload changed after human approval. Execution strictly blocked.`);
        }
    }
    static getApproval(approvalId) {
        return this.pendingApprovals.get(approvalId);
    }
    static listPending(organizationId) {
        const all = Array.from(this.pendingApprovals.values()).filter(a => a.status === 'PENDING');
        if (!organizationId)
            return all;
        return all.filter(a => a.organizationId === organizationId);
    }
}
exports.ApprovalGateway = ApprovalGateway;
//# sourceMappingURL=ApprovalGateway.js.map