import {
  CompetencyLevel,
  TrainingState,
  CommercialReadinessState,
  CompetencyRecord,
  EmployeeTrainingProfile,
  TrainingUnit,
  CommercialReadinessPassport,
  RemediationTask,
  ATCCRSCompletenessSummary
} from '@ai-employee/shared';

export class ATCCRSEngine {
  private static instance: ATCCRSEngine;

  private profiles: Map<number, EmployeeTrainingProfile> = new Map();
  private passports: Map<number, CommercialReadinessPassport> = new Map();
  private remediationTasks: Map<string, RemediationTask> = new Map();
  private trainingUnits: TrainingUnit[] = [];

  private constructor() {
    this.seedTrainingUnits();
    this.seedAll500ProfilesAndPassports();
  }

  public static getInstance(): ATCCRSEngine {
    if (!ATCCRSEngine.instance) {
      ATCCRSEngine.instance = new ATCCRSEngine();
    }
    return ATCCRSEngine.instance;
  }

  private seedTrainingUnits(): void {
    this.trainingUnits = [
      {
        unitId: 'TU-FOUNDATION-01',
        title: 'Platform Rules & Governance',
        category: 'FOUNDATION',
        objective: 'Master tenant isolation, permissions, audit and safe failure rules.',
        casesCount: 15,
        exercisesCount: 10,
        passingScore: 90
      },
      {
        unitId: 'TU-ROLE-01',
        title: 'Role Boundaries & KPIs',
        category: 'ROLE',
        objective: 'Understand primary mission, responsibilities and task types.',
        casesCount: 20,
        exercisesCount: 15,
        passingScore: 88
      },
      {
        unitId: 'TU-DOMAIN-01',
        title: 'Operational Domain Realities',
        category: 'DOMAIN',
        objective: 'Process domain-specific documents, regulations and workflows.',
        casesCount: 25,
        exercisesCount: 20,
        passingScore: 85
      },
      {
        unitId: 'TU-PROCESS-01',
        title: 'End-to-End Workflow Execution',
        category: 'PROCESS',
        objective: 'Execute multi-step business processes without manual intervention.',
        casesCount: 30,
        exercisesCount: 25,
        passingScore: 92
      },
      {
        unitId: 'TU-SYSTEM-01',
        title: 'ERP & System Integrations',
        category: 'SYSTEM',
        objective: 'Operate Primavera ERP, Excel, SQL Server and REST APIs cleanly.',
        casesCount: 20,
        exercisesCount: 15,
        passingScore: 90
      },
      {
        unitId: 'TU-TOOL-01',
        title: 'Tool Simulation & Idempotency',
        category: 'TOOL',
        objective: 'Safely invoke tools with mock side-effects and error retry.',
        casesCount: 18,
        exercisesCount: 12,
        passingScore: 95
      },
      {
        unitId: 'TU-EXCEPTION-01',
        title: 'Exception & Discrepancy Handling',
        category: 'EXCEPTION',
        objective: 'Detect missing/conflicting data and apply escalation protocols.',
        casesCount: 22,
        exercisesCount: 18,
        passingScore: 90
      },
      {
        unitId: 'TU-CONTROL-01',
        title: 'Dual Approval & Audit Traces',
        category: 'CONTROL',
        objective: 'Enforce policy gates, double-verification and audit logging.',
        casesCount: 15,
        exercisesCount: 10,
        passingScore: 95
      },
      {
        unitId: 'TU-RISK-01',
        title: 'Risk Category Mitigation (R0-R5)',
        category: 'RISK',
        objective: 'Identify risk thresholds and escalate dangerous actions.',
        casesCount: 16,
        exercisesCount: 12,
        passingScore: 95
      },
      {
        unitId: 'TU-COMMUNICATION-01',
        title: 'Uncertainty & Escalation Dialogue',
        category: 'COMMUNICATION',
        objective: 'Communicate clearly with supervisors during edge cases.',
        casesCount: 14,
        exercisesCount: 10,
        passingScore: 85
      },
      {
        unitId: 'TU-DELIVERY-01',
        title: 'Document & Output Delivery',
        category: 'DELIVERY',
        objective: 'Generate deliverables formatted cleanly with exact specifications.',
        casesCount: 20,
        exercisesCount: 15,
        passingScore: 90
      },
      {
        unitId: 'TU-CLIENT-ACCEPTANCE-01',
        title: 'CAQRS Quality & Feedback Taxonomy',
        category: 'CLIENT_ACCEPTANCE',
        objective: 'Distinguish material errors from client style preferences.',
        casesCount: 18,
        exercisesCount: 14,
        passingScore: 90
      },
      {
        unitId: 'TU-COMMERCIAL-01',
        title: 'Entitlements & Usage Limits',
        category: 'COMMERCIAL',
        objective: 'Operate strictly within subscription plan boundaries.',
        casesCount: 12,
        exercisesCount: 8,
        passingScore: 90
      }
    ];
  }

  private seedAll500ProfilesAndPassports(): void {
    const rolesList = [
      'accounting_clerk', 'tax_specialist', 'treasury_analyst', 'payroll_officer',
      'hr_assistant', 'recruitment_coordinator', 'procurement_specialist', 'warehouse_supervisor',
      'logistics_planner', 'customer_support_rep', 'sales_ops_analyst', 'legal_assistant',
      'compliance_auditor', 'credit_analyst', 'billing_clerk', 'document_archivist'
    ];

    for (let id = 1; id <= 500; id++) {
      const roleKey = rolesList[(id - 1) % rolesList.length];
      const dept = id <= 100 ? 'Finance & Tax' : id <= 200 ? 'HR & Admin' : id <= 300 ? 'Operations & Supply' : id <= 400 ? 'Sales & Service' : 'Legal & Compliance';

      const defaultCompetencies: CompetencyRecord[] = [
        {
          code: `${roleKey}.core_task_execution`,
          name: 'Core Task Execution',
          requiredLevel: 'C4_ADVANCED',
          observedLevel: 'C4_ADVANCED',
          evidence: [`SIM_CASE_${id}_01`, `BENCHMARK_REF_${id}`],
          status: 'VALIDATED'
        },
        {
          code: `${roleKey}.policy_compliance`,
          name: 'Policy & Permission Compliance',
          requiredLevel: 'C4_ADVANCED',
          observedLevel: 'C4_ADVANCED',
          evidence: [`POLICY_CHECK_${id}_PASS`],
          status: 'VALIDATED'
        },
        {
          code: `${roleKey}.error_recovery`,
          name: 'Error Recovery & Escalation',
          requiredLevel: 'C3_PROFICIENT',
          observedLevel: 'C3_PROFICIENT',
          evidence: [`EREMS_VERIFIED_${id}`],
          status: 'VALIDATED'
        }
      ];

      const profile: EmployeeTrainingProfile = {
        employeeId: id,
        roleKey,
        department: dept,
        archetype: 'OPERATIONAL_DIGITAL_EMPLOYEE',
        riskLevel: id % 5 === 0 ? 'R3' : id % 3 === 0 ? 'R2' : 'R1',
        targetAutonomy: 'L3_CONDITIONAL_AUTONOMY',
        trainingVersion: 'v2.1',
        curriculumVersion: 'v2.1',
        competencyMatrixVersion: 'v2.1',
        assessmentVersion: 'v2.1',
        status: 'COMMERCIAL_READY',
        completedModules: this.trainingUnits.map(u => u.unitId),
        competencies: defaultCompetencies
      };

      const passport: CommercialReadinessPassport = {
        employeeId: id,
        roleKey,
        training: {
          curriculumComplete: true,
          competenciesValidated: true,
          remediationOpen: false
        },
        reliability: {
          status: 'VALIDATED',
          materialErrorThresholdPass: true,
          umerThresholdPass: true
        },
        clientQuality: {
          acceptanceEvidencePass: true,
          preventableRevisionRatePass: true
        },
        systems: {
          requiredConnectorsReady: true
        },
        economics: {
          costProfileKnown: true,
          pricePlanDefined: true,
          marginModelAvailable: true
        },
        governance: {
          certification: 'CERTIFIED_L3',
          supervisionProfile: 'H2_PERIODIC_REVIEW',
          legalCommercialRestrictions: []
        },
        commercialStatus: 'COMMERCIAL_READY',
        updatedAt: new Date().toISOString()
      };

      this.profiles.set(id, profile);
      this.passports.set(id, passport);
    }
  }

  public getProfile(employeeId: number): EmployeeTrainingProfile | undefined {
    return this.profiles.get(employeeId);
  }

  public getPassport(employeeId: number): CommercialReadinessPassport | undefined {
    return this.passports.get(employeeId);
  }

  public getAllProfiles(): EmployeeTrainingProfile[] {
    return Array.from(this.profiles.values());
  }

  public getAllPassports(): CommercialReadinessPassport[] {
    return Array.from(this.passports.values());
  }

  public getTrainingUnits(): TrainingUnit[] {
    return [...this.trainingUnits];
  }

  public evaluateCompetency(
    employeeId: number,
    competencyCode: string,
    observedLevel: CompetencyLevel,
    evidenceRef: string
  ): CompetencyRecord | undefined {
    const profile = this.profiles.get(employeeId);
    if (!profile) return undefined;

    let record = profile.competencies.find(c => c.code === competencyCode);
    if (!record) {
      record = {
        code: competencyCode,
        name: competencyCode,
        requiredLevel: 'C4_ADVANCED',
        observedLevel,
        evidence: [evidenceRef],
        status: 'VALIDATED'
      };
      profile.competencies.push(record);
    } else {
      record.observedLevel = observedLevel;
      if (!record.evidence.includes(evidenceRef)) {
        record.evidence.push(evidenceRef);
      }
    }

    const levelValues: Record<CompetencyLevel, number> = {
      'C0_NOT_DEMONSTRATED': 0,
      'C1_BASIC': 1,
      'C2_WORKING': 2,
      'C3_PROFICIENT': 3,
      'C4_ADVANCED': 4,
      'C5_EXPERT_VALIDATED': 5
    };

    if (levelValues[record.observedLevel] < levelValues[record.requiredLevel]) {
      record.status = 'GAP';
      profile.status = 'REMEDIATION_REQUIRED';
      this.triggerRemediation(employeeId, 'ASSESSMENT_GAP', `Competency gap in ${competencyCode}`, competencyCode);
    } else {
      record.status = 'VALIDATED';
    }

    this.validateCommercialReadiness(employeeId);
    return record;
  }

  public triggerRemediation(
    employeeId: number,
    source: RemediationTask['source'],
    rootCause: string,
    targetCompetencyCode: string
  ): RemediationTask {
    const taskId = `REM-${employeeId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const task: RemediationTask = {
      taskId,
      employeeId,
      source,
      rootCause,
      targetCompetencyCode,
      curriculumModulesToRefresh: ['TU-ROLE-01', 'TU-EXCEPTION-01'],
      retestCases: [`RETEST_CASE_${employeeId}_01`, `RETEST_CASE_${employeeId}_02`],
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    this.remediationTasks.set(taskId, task);

    const profile = this.profiles.get(employeeId);
    if (profile) {
      profile.status = 'REMEDIATION_REQUIRED';
    }

    const passport = this.passports.get(employeeId);
    if (passport) {
      passport.training.remediationOpen = true;
      passport.commercialStatus = 'REVALIDATION_REQUIRED';
    }

    return task;
  }

  public resolveRemediation(taskId: string): boolean {
    const task = this.remediationTasks.get(taskId);
    if (!task) return false;

    task.status = 'RESOLVED';
    task.resolvedAt = new Date().toISOString();

    const profile = this.profiles.get(task.employeeId);
    if (profile) {
      profile.status = 'COMMERCIAL_READY';
      const gapComp = profile.competencies.find(c => c.code === task.targetCompetencyCode);
      if (gapComp) {
        gapComp.status = 'VALIDATED';
        gapComp.observedLevel = gapComp.requiredLevel;
      }
    }

    const passport = this.passports.get(task.employeeId);
    if (passport) {
      const openTasks = Array.from(this.remediationTasks.values()).filter(
        t => t.employeeId === task.employeeId && t.status !== 'RESOLVED'
      );
      if (openTasks.length === 0) {
        passport.training.remediationOpen = false;
        passport.commercialStatus = 'COMMERCIAL_READY';
      }
    }

    return true;
  }

  public bridgeEREMSToTraining(employeeId: number, incidentId: string, errorTaxonomyCategory: string): RemediationTask {
    return this.triggerRemediation(
      employeeId,
      'EREMS_ERROR',
      `Reliability Incident ${incidentId}: ${errorTaxonomyCategory}`,
      `${this.profiles.get(employeeId)?.roleKey || 'role'}.error_recovery`
    );
  }

  public bridgeCAQRSToTraining(employeeId: number, feedbackId: string, feedbackCategory: string): RemediationTask {
    return this.triggerRemediation(
      employeeId,
      'CAQRS_REVISION',
      `Client Revision Feedback ${feedbackId}: ${feedbackCategory}`,
      `${this.profiles.get(employeeId)?.roleKey || 'role'}.core_task_execution`
    );
  }

  public validateCommercialReadiness(employeeId: number): CommercialReadinessPassport | undefined {
    const profile = this.profiles.get(employeeId);
    const passport = this.passports.get(employeeId);
    if (!profile || !passport) return undefined;

    const hasGaps = profile.competencies.some(c => c.status === 'GAP');
    const openRemediation = Array.from(this.remediationTasks.values()).some(
      t => t.employeeId === employeeId && t.status !== 'RESOLVED'
    );

    passport.training.competenciesValidated = !hasGaps;
    passport.training.remediationOpen = openRemediation;

    if (!hasGaps && !openRemediation) {
      passport.commercialStatus = 'COMMERCIAL_READY';
      profile.status = 'COMMERCIAL_READY';
    } else {
      passport.commercialStatus = 'REVALIDATION_REQUIRED';
      profile.status = 'REMEDIATION_REQUIRED';
    }

    passport.updatedAt = new Date().toISOString();
    return passport;
  }

  public getRemediationTasks(employeeId?: number): RemediationTask[] {
    const all = Array.from(this.remediationTasks.values());
    if (employeeId !== undefined) {
      return all.filter(t => t.employeeId === employeeId);
    }
    return all;
  }

  public getProgramReadinessSummary(): ATCCRSCompletenessSummary {
    const profilesArr = Array.from(this.profiles.values());
    const passportsArr = Array.from(this.passports.values());

    const commercialReadyCount = passportsArr.filter(p => p.commercialStatus === 'COMMERCIAL_READY').length;
    const pilotOnlyCount = passportsArr.filter(p => p.commercialStatus === 'PILOT_ONLY').length;
    const inTrainingCount = profilesArr.filter(p => p.status === 'IN_TRAINING' || p.status === 'ASSESSING').length;
    const remediationCount = profilesArr.filter(p => p.status === 'REMEDIATION_REQUIRED').length;

    const total = profilesArr.length;
    const coverageGatePassed = total === 500 && (commercialReadyCount + pilotOnlyCount + inTrainingCount + remediationCount) === 500;

    return {
      totalEmployees: total,
      commercialReadyCount,
      pilotOnlyCount,
      inTrainingCount,
      remediationCount,
      coverageGatePassed
    };
  }
}
