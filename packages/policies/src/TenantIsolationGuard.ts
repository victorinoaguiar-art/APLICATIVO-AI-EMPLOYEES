import { ToolCallIntent, TaskRecord } from '@ai-employee/shared';

export interface TenantCheckResult {
  allowed: boolean;
  reason?: string;
}

export class TenantIsolationGuard {
  public static validateTaskAccess(requestingOrgId: string, task: TaskRecord): TenantCheckResult {
    if (!requestingOrgId || !task || !task.organizationId) {
      return { allowed: false, reason: 'TENANT_ISOLATION_VIOLATION: Missing organization identifier' };
    }

    if (requestingOrgId !== task.organizationId) {
      return {
        allowed: false,
        reason: `TENANT_ISOLATION_VIOLATION: Organization ${requestingOrgId} cannot access task belonging to ${task.organizationId}`
      };
    }

    return { allowed: true };
  }

  public static validateIntentAccess(requestingOrgId: string, intent: ToolCallIntent): TenantCheckResult {
    if (!requestingOrgId || !intent || !intent.organizationId) {
      return { allowed: false, reason: 'TENANT_ISOLATION_VIOLATION: Missing organization identifier in tool intent' };
    }

    if (requestingOrgId !== intent.organizationId) {
      return {
        allowed: false,
        reason: `TENANT_ISOLATION_VIOLATION: Cross-tenant execution blocked for org ${requestingOrgId} on intent of org ${intent.organizationId}`
      };
    }

    return { allowed: true };
  }

  public static enforceOrThrow(requestingOrgId: string, resourceOrgId: string): void {
    if (requestingOrgId !== resourceOrgId) {
      throw new Error(`TENANT_ISOLATION_BLOCK: Cross-tenant data access from ${requestingOrgId} to ${resourceOrgId} strictly prohibited.`);
    }
  }
}
