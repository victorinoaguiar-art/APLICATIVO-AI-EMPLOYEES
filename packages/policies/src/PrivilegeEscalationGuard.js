"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivilegeEscalationGuard = void 0;
const AUTONOMY_HIERARCHY = {
    L0: 0,
    L1: 1,
    L2: 2,
    L3: 3,
    L4: 4,
    L5: 5
};
class PrivilegeEscalationGuard {
    static validateAutonomyCeiling(requestedAutonomy, rolePack) {
        const requestedVal = AUTONOMY_HIERARCHY[requestedAutonomy] ?? 0;
        const maxVal = AUTONOMY_HIERARCHY[rolePack.autonomy.maximum] ?? 0;
        if (requestedVal > maxVal) {
            return {
                allowed: false,
                reason: `PRIVILEGE_ESCALATION_BLOCK: Requested autonomy ${requestedAutonomy} exceeds maximum ceiling ${rolePack.autonomy.maximum} for role ${rolePack.role_key}`
            };
        }
        return { allowed: true };
    }
    static enforceOrThrow(requestedAutonomy, rolePack) {
        const result = this.validateAutonomyCeiling(requestedAutonomy, rolePack);
        if (!result.allowed) {
            throw new Error(`SECURITY_BLOCK: ${result.reason}`);
        }
    }
}
exports.PrivilegeEscalationGuard = PrivilegeEscalationGuard;
//# sourceMappingURL=PrivilegeEscalationGuard.js.map