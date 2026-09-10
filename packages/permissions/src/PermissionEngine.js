"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionEngine = void 0;
class PermissionEngine {
    static checkPermission(request) {
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
        const hasPermission = rolePack.permissions.some((p) => p.toLowerCase() === requiredPermission.toLowerCase());
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
exports.PermissionEngine = PermissionEngine;
//# sourceMappingURL=PermissionEngine.js.map