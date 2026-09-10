import { TaskRecord, ToolCallIntent, DecisionTrace, AuditEvent, ApprovalRecord } from '@ai-employee/shared';
import { ToolAdapter } from '@ai-employee/tool-sdk';
export interface ExecuteTaskOptions {
    task: TaskRecord;
    roleKey: string;
    toolIntent: ToolCallIntent;
    toolAdapter: ToolAdapter;
    amount?: number;
    externalRecipient?: boolean;
}
export interface OrchestrationResult {
    task: TaskRecord;
    success: boolean;
    approvalRequired: boolean;
    approvalRecord?: ApprovalRecord;
    toolResult?: unknown;
    decisionTrace: DecisionTrace;
    auditEvent: AuditEvent;
}
export declare class Orchestrator {
    static executeTask(options: ExecuteTaskOptions): Promise<OrchestrationResult>;
}
//# sourceMappingURL=Orchestrator.d.ts.map