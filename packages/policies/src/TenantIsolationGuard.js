"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantIsolationGuard = void 0;
class TenantIsolationGuard {
    static validateTaskAccess(requestingOrgId, task) {
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
    static validateIntentAccess(requestingOrgId, intent) {
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
    static enforceOrThrow(requestingOrgId, resourceOrgId) {
        if (requestingOrgId !== resourceOrgId) {
            throw new Error(`TENANT_ISOLATION_BLOCK: Cross-tenant data access from ${requestingOrgId} to ${resourceOrgId} strictly prohibited.`);
        }
    }
}
exports.TenantIsolationGuard = TenantIsolationGuard;
//# sourceMappingURL=TenantIsolationGuard.js.map