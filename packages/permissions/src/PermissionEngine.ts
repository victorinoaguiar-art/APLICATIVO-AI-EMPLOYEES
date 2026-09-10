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

export class PermissionEngine {
  public static checkPermission(request: PermissionCheckRequest): PermissionCheckResult {
    const { rolePack, requiredPermission } = request;

    // Check wildcard forbidden permissions
    if (requiredPermission.includes('*')) {
      return {
        allowed: false,
        reason: 'DENIED: Wildcard permissions are strictly forbidden by platform security policy.',
        evaluatedPermissions: rolePack.permissions,
        principle: 'DENY_BY_DEFAULT'
      };
    }

    // Check if rolepack explicitly possesses the permission
    const hasPermission = rolePack.permissions.some((p: string) => p.toLowerCase() === requiredPermission.toLowerCase());

    if (!hasPermission) {
      return {
        allowed: false,
        reason: `DENIED: RolePack ${rolePack.role_key} does not grant permission ${requiredPermission}`,
        evaluatedPermissions: rolePack.permissions,
        principle: 'DENY_BY_DEFAULT'
      };
    }

    return {
      allowed: true,
      reason: `GRANTED: Permission ${requiredPermission} verified for RolePack ${rolePack.role_key}`,
      evaluatedPermissions: rolePack.permissions,
      principle: 'DENY_BY_DEFAULT'
    };
  }
}
