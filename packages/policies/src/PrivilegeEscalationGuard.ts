import { AutonomyLevel, RolePack } from '@ai-employee/shared';

const AUTONOMY_HIERARCHY: Record<AutonomyLevel, number> = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5
};

export interface PrivilegeCheckResult {
  allowed: boolean;
  reason?: string;
}

export class PrivilegeEscalationGuard {
  public static validateAutonomyCeiling(requestedAutonomy: AutonomyLevel, rolePack: RolePack): PrivilegeCheckResult {
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

  public static enforceOrThrow(requestedAutonomy: AutonomyLevel, rolePack: RolePack): void {
    const result = this.validateAutonomyCeiling(requestedAutonomy, rolePack);
    if (!result.allowed) {
      throw new Error(`SECURITY_BLOCK: ${result.reason}`);
    }
  }
}
