export type PriorityClass = 'P1' | 'P2';

export type CohortGroup = 'P1-A' | 'P1-B' | 'P1-C' | 'P2-QUEUE';

export type EmployeeLifecycleState =
  | 'REGISTERED'
  | 'SPECIFIED'
  | 'KNOWLEDGE_PREPARED'
  | 'INTEGRATION_MAPPED'
  | 'TESTS_DEFINED'
  | 'READY_FOR_TEST'
  | 'IN_TESTING'
  | 'CONNECTED'
  | 'FUNCTIONAL_TESTED'
  | 'E2E_TESTED'
  | 'SHADOW_MODE'
  | 'HUMAN_BENCHMARKED'
  | 'SECURITY_VALIDATED'
  | 'CERTIFIED'
  | 'ACTIVE'
  | 'NEEDS_IMPROVEMENT'
  | 'BLOCKED'
  | 'DEGRADED'
  | 'SUSPENDED'
  | 'DEPRECATED';

export type ReadinessCriterionStatus = 'PASS' | 'FAIL' | 'PENDING';

export interface StructuralReadinessCriteria {
  rolePack: ReadinessCriterionStatus;
  workContract: ReadinessCriterionStatus;
  activationContract: ReadinessCriterionStatus;
  inputContract: ReadinessCriterionStatus;
  outputContract: ReadinessCriterionStatus;
  deliveryContract: ReadinessCriterionStatus;
  domainKnowledgeProfile: ReadinessCriterionStatus;
  operationalRealityProfile: ReadinessCriterionStatus;
  departmentPackLinkage: ReadinessCriterionStatus;
  systemToolMapping: ReadinessCriterionStatus;
  securityRulesDefined: ReadinessCriterionStatus;
  acceptanceTestsDefined: ReadinessCriterionStatus;
}

export interface TestingMilestoneStatus {
  functionalTest: ReadinessCriterionStatus;
  e2eTest: ReadinessCriterionStatus;
  shadowValidation: ReadinessCriterionStatus;
  humanBenchmark: ReadinessCriterionStatus;
  securityValidation: ReadinessCriterionStatus;
  certification: ReadinessCriterionStatus;
}

export interface EmployeeReadinessPassport {
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  priorityClass: PriorityClass;
  cohortGroup: CohortGroup;
  currentState: EmployeeLifecycleState;
  structuralCriteria: StructuralReadinessCriteria;
  testingMilestones: TestingMilestoneStatus;
  structurallyPrepared: boolean;
  readyForTest: boolean;
  activeInProduction: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface ProgramCompletenessSummary {
  totalEmployees: number;
  p1Count: number;
  p2Count: number;
  unassignedCount: number;
  duplicateAssignmentsCount: number;
  structurallyPreparedCount: number;
  readyForTestCount: number;
  inTestingCount: number;
  shadowModeCount: number;
  certifiedCount: number;
  activeCount: number;
  cohorts: {
    p1A: number;
    p1B: number;
    p1C: number;
    p2Queue: number;
  };
  mathematicalGatePassed: boolean;
}

export type ImprovementScope =
  | 'GLOBAL'
  | 'DEPARTMENT'
  | 'DOMAIN'
  | 'PROCESS'
  | 'INDUSTRY'
  | 'JURISDICTION'
  | 'SYSTEM'
  | 'ROLE_SPECIFIC'
  | 'ORGANIZATION_SPECIFIC';

export interface LayeredImprovementRecord {
  improvementId: string;
  scope: ImprovementScope;
  targetIdentifier: string;
  description: string;
  appliedAt: string;
  affectedEmployeeIds: number[];
  recompiledPassportsCount: number;
}
