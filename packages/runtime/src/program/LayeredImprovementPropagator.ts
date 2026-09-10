import {
  ImprovementScope,
  LayeredImprovementRecord,
  EmployeeReadinessPassport
} from '@ai-employee/shared';
import { EmployeeCompletenessRegistry } from './EmployeeCompletenessRegistry.js';

export class LayeredImprovementPropagator {
  private registry: EmployeeCompletenessRegistry;
  private improvementHistory: LayeredImprovementRecord[] = [];

  constructor() {
    this.registry = EmployeeCompletenessRegistry.getInstance();
  }

  public propagateImprovement(
    scope: ImprovementScope,
    targetIdentifier: string,
    description: string
  ): LayeredImprovementRecord {
    const allPassports = this.registry.getAllPassports();
    const affectedPassports: EmployeeReadinessPassport[] = [];

    for (const passport of allPassports) {
      let isAffected = false;

      if (scope === 'GLOBAL') {
        isAffected = true;
      } else if (scope === 'DEPARTMENT' && passport.department.toLowerCase() === targetIdentifier.toLowerCase()) {
        isAffected = true;
      } else if (scope === 'ROLE_SPECIFIC' && (passport.roleKey === targetIdentifier || String(passport.employeeId) === targetIdentifier)) {
        isAffected = true;
      }

      if (isAffected) {
        passport.lastUpdated = new Date().toISOString();
        passport.notes = `[PROPAGATED: ${scope}] ${description} (Atualizado em ${new Date().toLocaleDateString('pt-AO')})`;
        affectedPassports.push(passport);
      }
    }

    const record: LayeredImprovementRecord = {
      improvementId: `imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      scope,
      targetIdentifier,
      description,
      appliedAt: new Date().toISOString(),
      affectedEmployeeIds: affectedPassports.map((p) => p.employeeId),
      recompiledPassportsCount: affectedPassports.length
    };

    this.improvementHistory.push(record);
    return record;
  }

  public getImprovementHistory(): LayeredImprovementRecord[] {
    return this.improvementHistory;
  }
}
