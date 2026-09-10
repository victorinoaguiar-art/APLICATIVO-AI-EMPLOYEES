import { RolePack } from '@ai-employee/shared';
export interface PermissionCheckRequest {
    organizationId: string;
    employeeId: string;
    rolePack: RolePack;
    requiredPermission: string;
    toolKey?: string;
    operation?: string;
    contextAttributes?: Record<string, unknown>;
}
export interface PermissionCheckResult {
    allowed: boolean;
    reason: string;
    evaluatedPermissions: string[];
    principle: 'DENY_BY_DEFAULT';
}
export declare class PermissionEngine {
    static checkPermission(request: PermissionCheckRequest): PermissionCheckResult;
}
//# sourceMappingURL=PermissionEngine.d.ts.map