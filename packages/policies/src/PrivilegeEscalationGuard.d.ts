import { AutonomyLevel, RolePack } from '@ai-employee/shared';
export interface PrivilegeCheckResult {
    allowed: boolean;
    reason?: string;
}
export declare class PrivilegeEscalationGuard {
    static validateAutonomyCeiling(requestedAutonomy: AutonomyLevel, rolePack: RolePack): PrivilegeCheckResult;
    static enforceOrThrow(requestedAutonomy: AutonomyLevel, rolePack: RolePack): void;
}
//# sourceMappingURL=PrivilegeEscalationGuard.d.ts.map