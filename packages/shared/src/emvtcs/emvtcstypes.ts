export type EMVTCSReadinessState =
  | 'REGISTERED'
  | 'SPECIFIED'
  | 'IMPLEMENTED'
  | 'KNOWLEDGE_PREPARED'
  | 'INTEGRATION_MAPPED'
  | 'TESTS_DEFINED'
  | 'STRUCTURALLY_READY'
  | 'READY_FOR_TEST'
  | 'IN_TESTING'
  | 'CONNECTED'
  | 'FUNCTIONAL_TESTED'
  | 'E2E_TESTED'
  | 'SHADOW_MODE'
  | 'SHADOW_VALIDATED'
  | 'HUMAN_BENCHMARKED'
  | 'SECURITY_VALIDATED'
  | 'PLATFORM_CERTIFIED'
  | 'ORGANIZATION_CONFIGURING'
  | 'ORGANIZATION_READY'
  | 'ACTIVE'
  | 'NEEDS_IMPROVEMENT'
  | 'WAITING_DATA'
  | 'WAITING_CONNECTION'
  | 'WAITING_APPROVAL'
  | 'BLOCKED'
  | 'DEGRADED'
  | 'SUSPENDED'
  | 'DEPRECATED';

export type TestDimension =
  | 'STRUCTURAL'
  | 'FUNCTIONAL'
  | 'PROCESS'
  | 'EXCEPTIONS'
  | 'TOOLS'
  | 'CONNECTORS'
  | 'PERMISSIONS'
  | 'POLICIES'
  | 'SECURITY'
  | 'E2E'
  | 'RELIABILITY'
  | 'CLIENT_QUALITY'
  | 'SHADOW'
  | 'HUMAN_BENCHMARK';

export type CaseTaxonomy =
  | 'GOLDEN'
  | 'NORMAL'
  | 'EDGE'
  | 'AMBIGUOUS'
  | 'MISSING_DATA'
  | 'CONFLICTING_DATA'
  | 'STALE_DATA'
  | 'DUPLICATE'
  | 'NEGATIVE'
  | 'FAILURE'
  | 'ESCALATION'
  | 'ADVERSARIAL'
  | 'REGULATORY'
  | 'REALISTIC';

export type CaseDifficulty = 'D1_BASIC' | 'D2_STANDARD' | 'D3_COMPLEX' | 'D4_ADVANCED' | 'D5_EXPERT';

export interface DatasetCase {
  caseId: string;
  employeeId: number;
  roleKey: string;
  title: string;
  taxonomy: CaseTaxonomy;
  difficulty: CaseDifficulty;
  inputPayload: Record<string, any>;
  expectedOutput: Record<string, any>;
  expectedToolCalls: string[];
  expectedForbiddenActions: string[];
  expectedEscalationRequired: boolean;
  groundTruthSource: 'DETERMINISTIC_RULE' | 'EXPERT_HUMAN' | 'GOLDEN_CASE' | 'CERTIFIED_SYSTEM';
}

export interface EmployeeTestPlan {
  planId: string;
  employeeId: number;
  roleKey: string;
  riskLevel: string;
  targetAutonomy: string;
  testDimensions: TestDimension[];
  requiredCasesCount: number;
  requiredExceptionsCount: number;
  passConditions: string[];
  hardFailConditions: string[];
  humanReviewRequirements: string[];
}

export interface ValidationRunResult {
  runId: string;
  employeeId: number;
  roleKey: string;
  configurationFingerprint: string;
  dimensionsTested: TestDimension[];
  totalCasesExecuted: number;
  casesPassedCount: number;
  casesFailedCount: number;
  passPercentage: number;
  securityChecksPassed: boolean;
  e2eExecutionPassed: boolean;
  overallOutcome: 'PASS' | 'FAIL' | 'NEEDS_REMEDIATION';
  executedAt: string;
  logs: string[];
}

export interface MasterValidationRecord {
  employeeId: number;
  roleKey: string;
  roleName: string;
  department: string;
  archetype: string;
  riskLevel: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  targetAutonomy: string;
  requiredSupervision: string;
  rolePackVersion: string;
  workContractVersion: string;
  knowledgeVersion: string;
  operationalRealityVersion: string;
  testSuiteVersion: string;
  datasetReady: boolean;
  groundTruthReady: boolean;
  structuralTestPassed: boolean;
  functionalTestPassed: boolean;
  exceptionTestPassed: boolean;
  toolTestPassed: boolean;
  connectorTestPassed: boolean;
  securityTestPassed: boolean;
  e2eTestPassed: boolean;
  eremsValidated: boolean;
  caqrsValidated: boolean;
  shadowModeValidated: boolean;
  humanBenchmarkScore: number; // 0 - 100
  remediationCount: number;
  certificationStatus: 'NOT_CERTIFIED' | 'CERTIFIED' | 'REVOKED';
  currentState: EMVTCSReadinessState;
  blocker?: string;
  owner: string;
  validationWave: number; // Wave 0 to Wave 10
  lastTestDate: string;
  nextAction: string;
}

export interface EMVTCSGlobalSummary {
  totalEmployees: number; // 500
  totalPriority: number; // 500
  totalNonPriority: number; // 0
  totalStructurallyReady: number;
  totalReadyForTest: number;
  totalInTesting: number;
  totalShadowValidated: number;
  totalPlatformCertified: number;
  totalActive: number;
  totalRemediationOpen: number;
  overallPassRatePercentage: number;
  gatePassed: boolean;
  timestamp: string;
}
