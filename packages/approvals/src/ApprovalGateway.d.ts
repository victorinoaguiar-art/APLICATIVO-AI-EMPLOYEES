import { ToolCallIntent, ApprovalRecord, RiskLevel } from '@ai-employee/shared';
export declare class ApprovalGateway {
    private static pendingApprovals;
    static createPendingApproval(intent: ToolCallIntent, riskLevel: RiskLevel, impact: string, reason: string): ApprovalRecord;
    static decideApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED' | 'CANCELLED', decidedBy: string): ApprovalRecord;
    static validateExecutionSnapshot(approvalId: string, currentIntent: ToolCallIntent): void;
    static getApproval(approvalId: string): ApprovalRecord | undefined;
    static listPending(organizationId?: string): ApprovalRecord[];
}
//# sourceMappingURL=ApprovalGateway.d.ts.map