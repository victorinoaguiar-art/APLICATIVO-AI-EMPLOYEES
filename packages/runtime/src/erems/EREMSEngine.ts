import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  ErrorIncidentRecord,
  ErrorSeverity,
  ErrorTaxonomyCategory,
  ReliabilityMetrics,
  StatisticalConfidenceInterval,
  EmployeeReliabilityPassport,
  SupervisionLevel,
  CertificationVerdict,
  EREMSGlobalSummary
} from '@ai-employee/shared';

export class EREMSEngine {
  private static instance: EREMSEngine;
  private incidentStore: Map<string, ErrorIncidentRecord> = new Map();
  private employeePassports: Map<number, EmployeeReliabilityPassport> = new Map();

  private constructor() {
    this.initializeBaselinePassports();
  }

  public static getInstance(): EREMSEngine {
    if (!EREMSEngine.instance) {
      EREMSEngine.instance = new EREMSEngine();
    }
    return EREMSEngine.instance;
  }

  /**
   * Wilson Score 95% Confidence Interval for a Binomial Proportion (Success / Error Rate)
   */
  public calculateWilsonScoreInterval(
    successes: number,
    trials: number,
    confidence: number = 0.95
  ): StatisticalConfidenceInterval {
    if (trials === 0) {
      return { pointEstimate: 0, lowerBound95: 0, upperBound95: 0, sampleSize: 0 };
    }

    const z = 1.96; // 95% Confidence z-score
    const p = successes / trials;
    const n = trials;

    const denominator = 1 + (z * z) / n;
    const center = p + (z * z) / (2 * n);
    const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));

    const lowerBound95 = Math.max(0, (center - spread) / denominator);
    const upperBound95 = Math.min(1, (center + spread) / denominator);

    return {
      pointEstimate: Number(p.toFixed(4)),
      lowerBound95: Number(lowerBound95.toFixed(4)),
      upperBound95: Number(upperBound95.toFixed(4)),
      sampleSize: trials
    };
  }

  private initializeBaselinePassports(): void {
    CANONICAL_500_ROLES.forEach((role) => {
      const empId = role.id;
      const totalTasks = 100;
      const materialErrors = empId % 7 === 0 ? 1 : 0; // Baseline realistic errors
      const undetectedMaterial = materialErrors;

      const successfulTasks = totalTasks - materialErrors;
      const taskSuccessRate = Number(((successfulTasks / totalTasks) * 100).toFixed(2));
      const umer = Number(((undetectedMaterial / totalTasks) * 100).toFixed(2));

      const umerCI = this.calculateWilsonScoreInterval(undetectedMaterial, totalTasks);

      const metrics: ReliabilityMetrics = {
        totalTasksEvaluated: totalTasks,
        successfulTasks,
        taskSuccessRate,
        overallErrorRate: Number((100 - taskSuccessRate).toFixed(2)),
        minorErrorRate: 0.5,
        operationalErrorRate: 0.3,
        materialErrorRate: umer,
        criticalErrorRate: 0,
        catastrophicErrorRate: 0,
        undetectedErrorRate: umer,
        umer,
        umerConfidenceInterval: umerCI,
        humanCorrectionRate: 1.2,
        correctEscalationRate: 98.5,
        missedEscalationRate: 1.5,
        falseEscalationRate: 0.8,
        hallucinationRate: 0.1,
        calculationErrorRate: 0.05
      };

      const riskLevel = typeof role.risk === 'string' ? role.risk : role.risk?.level;
      const assignedSupervisionLevel: SupervisionLevel =
        riskLevel === 'R4' || riskLevel === 'R5'
          ? 'L3_HUMAN_APPROVAL'
          : umer > 2.0
          ? 'L3_HUMAN_APPROVAL'
          : 'L1_AUTONOMOUS';

      const certificationVerdict: CertificationVerdict =
        assignedSupervisionLevel === 'L1_AUTONOMOUS'
          ? 'CERTIFIED_AUTONOMOUS'
          : 'CERTIFIED_SUPERVISED';

      const passport: EmployeeReliabilityPassport = {
        employeeId: empId,
        roleKey: role.role_key,
        displayName: role.display_name,
        department: role.department,
        metrics,
        assignedSupervisionLevel,
        certificationVerdict,
        incidentHistory: [],
        lastAuditDate: new Date().toISOString()
      };

      this.employeePassports.set(empId, passport);
    });
  }

  public logIncident(
    employeeId: number,
    severity: ErrorSeverity,
    category: ErrorTaxonomyCategory,
    taskDescription: string,
    isMaterial: boolean,
    isUndetected: boolean,
    rootCauseDescription?: string
  ): ErrorIncidentRecord {
    const passport = this.employeePassports.get(employeeId);
    if (!passport) {
      throw new Error(`Employee #${employeeId} not found in EREMS Engine.`);
    }

    const incidentId = `inc_${employeeId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const incident: ErrorIncidentRecord = {
      incidentId,
      employeeId,
      roleKey: passport.roleKey,
      taskDescription,
      severity,
      category,
      isMaterial,
      isUndetected,
      rootCauseDescription: rootCauseDescription || `Root cause identified in component: ${category}`,
      timestamp: new Date().toISOString()
    };

    this.incidentStore.set(incidentId, incident);
    passport.incidentHistory.unshift(incident);

    // Recalculate employee metrics
    this.recalculateEmployeeMetrics(employeeId);

    return incident;
  }

  private recalculateEmployeeMetrics(employeeId: number): void {
    const passport = this.employeePassports.get(employeeId);
    if (!passport) return;

    const incidents = passport.incidentHistory;
    const totalEvaluated = 100 + incidents.length;

    const materialIncidents = incidents.filter((i) => i.isMaterial);
    const undetectedMaterialIncidents = incidents.filter((i) => i.isMaterial && i.isUndetected);
    const criticalIncidents = incidents.filter(
      (i) => i.severity === 'E4_CRITICAL' || i.severity === 'E5_CATASTROPHIC'
    );

    const totalFailed = materialIncidents.length;
    const totalSuccessful = totalEvaluated - totalFailed;

    const taskSuccessRate = Number(((totalSuccessful / totalEvaluated) * 100).toFixed(2));
    const umer = Number(((undetectedMaterialIncidents.length / totalEvaluated) * 100).toFixed(2));

    const umerCI = this.calculateWilsonScoreInterval(undetectedMaterialIncidents.length, totalEvaluated);

    passport.metrics.totalTasksEvaluated = totalEvaluated;
    passport.metrics.successfulTasks = totalSuccessful;
    passport.metrics.taskSuccessRate = taskSuccessRate;
    passport.metrics.overallErrorRate = Number((100 - taskSuccessRate).toFixed(2));
    passport.metrics.materialErrorRate = Number(((materialIncidents.length / totalEvaluated) * 100).toFixed(2));
    passport.metrics.criticalErrorRate = Number(((criticalIncidents.length / totalEvaluated) * 100).toFixed(2));
    passport.metrics.catastrophicErrorRate = Number(
      ((incidents.filter((i) => i.severity === 'E5_CATASTROPHIC').length / totalEvaluated) * 100).toFixed(2)
    );
    passport.metrics.umer = umer;
    passport.metrics.umerConfidenceInterval = umerCI;

    // Evaluate Supervision & Certification Verdict based on UMER & Critical Errors
    if (criticalIncidents.length > 0 || umer > 5.0) {
      passport.assignedSupervisionLevel = 'L4_DUAL_APPROVAL';
      passport.certificationVerdict = 'BLOCKED';
    } else if (umer > 1.5) {
      passport.assignedSupervisionLevel = 'L3_HUMAN_APPROVAL';
      passport.certificationVerdict = 'CERTIFIED_SUPERVISED';
    } else {
      passport.assignedSupervisionLevel = 'L1_AUTONOMOUS';
      passport.certificationVerdict = 'CERTIFIED_AUTONOMOUS';
    }

    passport.lastAuditDate = new Date().toISOString();
  }

  public getPassport(employeeId: number): EmployeeReliabilityPassport | undefined {
    return this.employeePassports.get(employeeId);
  }

  public getAllPassports(): EmployeeReliabilityPassport[] {
    return Array.from(this.employeePassports.values());
  }

  public getGlobalSummary(): EREMSGlobalSummary {
    const passports = this.getAllPassports();
    const totalEmployeesMonitored = passports.length;

    let totalTasksSum = 0;
    let totalSuccessSum = 0;
    let totalUndetectedMaterialSum = 0;

    const severityBreakdown: Record<ErrorSeverity, number> = {
      E0_NO_ERROR: 0,
      E1_MINOR: 0,
      E2_OPERATIONAL: 0,
      E3_MATERIAL: 0,
      E4_CRITICAL: 0,
      E5_CATASTROPHIC: 0
    };

    const categoryMap: Map<ErrorTaxonomyCategory, number> = new Map();
    const certificationBreakdown: Record<CertificationVerdict, number> = {
      CERTIFIED_AUTONOMOUS: 0,
      CERTIFIED_SUPERVISED: 0,
      DEGRADED: 0,
      BLOCKED: 0
    };

    this.incidentStore.forEach((inc) => {
      severityBreakdown[inc.severity] = (severityBreakdown[inc.severity] || 0) + 1;
      categoryMap.set(inc.category, (categoryMap.get(inc.category) || 0) + 1);
    });

    passports.forEach((p) => {
      totalTasksSum += p.metrics.totalTasksEvaluated;
      totalSuccessSum += p.metrics.successfulTasks;
      totalUndetectedMaterialSum += Math.round((p.metrics.umer / 100) * p.metrics.totalTasksEvaluated);
      certificationBreakdown[p.certificationVerdict] =
        (certificationBreakdown[p.certificationVerdict] || 0) + 1;
    });

    const globalTaskSuccessRate = Number(((totalSuccessSum / totalTasksSum) * 100).toFixed(2));
    const globalUMER = Number(((totalUndetectedMaterialSum / totalTasksSum) * 100).toFixed(2));
    const globalUMERCI = this.calculateWilsonScoreInterval(totalUndetectedMaterialSum, totalTasksSum);

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEmployeesMonitored,
      globalTaskSuccessRate,
      globalUMER,
      globalUMERConfidenceInterval: globalUMERCI,
      totalIncidentsLogged: this.incidentStore.size,
      severityBreakdown,
      topErrorCategories: topCategories,
      certificationBreakdown,
      timestamp: new Date().toISOString()
    };
  }
}
