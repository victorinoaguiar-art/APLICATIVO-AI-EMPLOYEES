import { ToolCallIntent, ApprovalRecord, RiskLevel, safeUUID } from '@ai-employee/shared';
import { SnapshotHasher } from '@ai-employee/policies';

export class ApprovalGateway {
  private static pendingApprovals: Map<string, ApprovalRecord> = new Map();

  public static createPendingApproval(
    intent: ToolCallIntent,
    riskLevel: RiskLevel,
    impact: string,
    reason: string
  ): ApprovalRecord {
    const snapshotHash = SnapshotHasher.hashIntent(intent);
    const approvalId = `app_${safeUUID()}`;

    const record: ApprovalRecord = {
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

  public static decideApproval(
    approvalId: string,
    decision: 'APPROVED' | 'REJECTED' | 'CANCELLED',
    decidedBy: string
  ): ApprovalRecord {
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

  public static validateExecutionSnapshot(approvalId: string, currentIntent: ToolCallIntent): void {
    const record = this.pendingApprovals.get(approvalId);
    if (!record) {
      throw new Error(`Approval record not found: ${approvalId}`);
    }

    if (record.status !== 'APPROVED') {
      throw new Error(`Approval gateway blocked execution: status is ${record.status}, expected APPROVED`);
    }

    const isValidHash = SnapshotHasher.verifySnapshot(currentIntent, record.snapshotHash);
    if (!isValidHash) {
      throw new Error(`APPROVED_SNAPSHOT_MISMATCH: The pending action payload changed after human approval. Execution strictly blocked.`);
    }
  }

  public static getApproval(approvalId: string): ApprovalRecord | undefined {
    return this.pendingApprovals.get(approvalId);
  }

  public static listPending(organizationId?: string): ApprovalRecord[] {
    const all = Array.from(this.pendingApprovals.values()).filter(a => a.status === 'PENDING');
    if (!organizationId) return all;
    return all.filter(a => a.organizationId === organizationId);
  }
}
