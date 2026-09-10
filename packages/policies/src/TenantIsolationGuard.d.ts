import { ToolCallIntent, TaskRecord } from '@ai-employee/shared';
export interface TenantCheckResult {
    allowed: boolean;
    reason?: string;
}
export declare class TenantIsolationGuard {
    static validateTaskAccess(requestingOrgId: string, task: TaskRecord): TenantCheckResult;
    static validateIntentAccess(requestingOrgId: string, intent: ToolCallIntent): TenantCheckResult;
    static enforceOrThrow(requestingOrgId: string, resourceOrgId: string): void;
}
//# sourceMappingURL=TenantIsolationGuard.d.ts.map