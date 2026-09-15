export type CompetencyCategory =
  | 'GENERAL'
  | 'PROFESSIONAL'
  | 'TECHNICAL'
  | 'REGULATORY'
  | 'JURISDICTIONAL'
  | 'CLIENT_SPECIFIC'
  | 'TOOL_SPECIFIC'
  | 'TIME_SENSITIVE'
  | 'HIGH_RISK';

export type SourceCriticalityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FinalKnowledgeMode =
  | 'MODEL_NATIVE_SUFFICIENT'
  | 'MODEL_NATIVE_PLUS_CURATED'
  | 'SOURCE_CRITICAL'
  | 'CLIENT_SOURCE_REQUIRED'
  | 'UNSUPPORTED';

export type OperationalReadinessStatus =
  | 'READY'
  | 'READY_WITH_SUPERVISION'
  | 'NOT_READY'
  | 'BLOCKED';

export type ModelKnowledgeGapSeverity =
  | 'NO_GAP'
  | 'MINOR_GAP'
  | 'MODERATE_GAP'
  | 'MAJOR_GAP'
  | 'CRITICAL_GAP';

export type KnowledgeReinforcementType =
  | 'SOURCE_REINFORCEMENT'
  | 'PROCEDURE_REINFORCEMENT'
  | 'TEMPLATE_REINFORCEMENT'
  | 'EXAMPLE_REINFORCEMENT'
  | 'TOOL_DOCUMENTATION_REINFORCEMENT'
  | 'JURISDICTION_REINFORCEMENT'
  | 'CLIENT_KNOWLEDGE_REINFORCEMENT'
  | 'PROMPTING_REINFORCEMENT'
  | 'WORKFLOW_REINFORCEMENT'
  | 'HUMAN_SUPERVISION_REQUIRED';

export interface ModelNativeCapabilityRegistryRecord {
  modelId: string;
  modelName: string;
  provider: string;
  modelVersion: string;
  configuration: string;
  reasoningLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  evaluationDate: string;
  evaluationBaselineId: string;
  externalToolsEnabled: boolean;
  externalSourcesEnabled: boolean;
  testSuiteVersion: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPERIMENTAL';
}

export interface DeduplicatedCompetencyRecord {
  competencyId: string;
  name: string;
  description: string;
  domain: string;
  subdomain: string;
  category: CompetencyCategory;
  sourceCriticality: SourceCriticalityLevel;
  affectedEmployeeIds: string[];
  affectedEmployeesCount: number;
  supportedTaskTypes: string[];
  minimumRequiredScore: number;
  jurisdiction: string;
  version: string;
  createdAt: string;
}

export interface ModelCapabilityTestResultRecord {
  testRunId: string;
  modelId: string;
  competencyId: string;
  testCaseId: string;
  testName: string;
  inputPrompt: string;
  expectedOutcome: string;
  actualOutput: string;
  scorePercent: number;
  criticalFail: boolean;
  criticalFailReason?: string;
  errorTypes: string[];
  durationMs: number;
  timestamp: string;
  evaluator: string;
}

export interface ConsolidatedCompetencyScoreRecord {
  competencyId: string;
  modelId: string;
  totalTestCases: number;
  averageScorePercent: number;
  medianScorePercent: number;
  minScorePercent: number;
  maxScorePercent: number;
  standardDeviationPercent: number;
  passRatePercent: number;
  criticalFailureCount: number;
  consistencyScorePercent: number;
  evaluatedAt: string;
}

export interface KnowledgeGapRecord {
  gapId: string;
  competencyId: string;
  competencyName: string;
  modelId: string;
  requiredCapabilityScore: number;
  observedNativeScore: number;
  sourceCriticality: SourceCriticalityLevel;
  gapSeverity: ModelKnowledgeGapSeverity;
  reinforcementType: KnowledgeReinforcementType;
  missingMaterialDescription: string;
  suggestedSourceType: string;
  affectedEmployeesCount: number;
  detectedAt: string;
}

export interface KnowledgeAcquisitionQueueRecord {
  queueId: string;
  gapId: string;
  competencyId: string;
  competencyName: string;
  gapType: ModelKnowledgeGapSeverity;
  priorityScore: number; // Calculated: affectedEmployees * riskFactor + criticality
  requiredMaterialType: string;
  suggestedSourceType: string;
  affectedEmployeesCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_ACQUISITION' | 'IN_CURATION' | 'REINFORCED' | 'RETESTED';
  assignedOwner: string;
  createdAt: string;
}

export interface RetestComparisonResult {
  competencyId: string;
  competencyName: string;
  reinforcementSourceId: string;
  scoreBeforePercent: number;
  scoreAfterPercent: number;
  improvementPoints: number;
  modeBefore: FinalKnowledgeMode;
  modeAfter: FinalKnowledgeMode;
  effective: boolean;
  retestedAt: string;
}

export interface ModelNativeGlobalSummary {
  modelId: string;
  modelName: string;
  evaluationBaselineId: string;
  totalCatalogEmployees: number;
  totalUniqueCompetencies: number;
  nativeSufficientCount: number;
  nativePlusCuratedCount: number;
  sourceCriticalCount: number;
  clientSourceRequiredCount: number;
  unsupportedCount: number;
  readyForProductionCount: number;
  readyWithSupervisionCount: number;
  blockedCount: number;
  acquisitionQueuePendingCount: number;
  lastUpdated: string;
}

export interface ModelNativeTestSuiteReport {
  timestamp: string;
  total: number;
  passed: number;
  failed: number;
  tests: Array<{
    testId: string;
    name: string;
    passed: boolean;
    expectedCode: string;
    actualCode: string;
    details: string;
  }>;
}
