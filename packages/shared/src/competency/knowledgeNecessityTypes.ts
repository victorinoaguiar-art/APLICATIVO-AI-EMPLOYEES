// ============================================================================
// KNOWLEDGE NECESSITY & RUNTIME MINIMIZATION TYPES (AETF-500 KNE)
// Decidir se o conhecimento carregado deve ser enviado ao modelo na tarefa
// Rule: UPLOAD ≠ AUTOMATIC RUNTIME INJECTION | PUBLISHED ≠ REQUIRED_AT_RUNTIME
// ============================================================================

export type KnowledgeNecessityDecisionType =
  | 'NATIVE_SUFFICIENT'
  | 'SUPPLEMENTARY'
  | 'REINFORCEMENT_REQUIRED'
  | 'SOURCE_REQUIRED'
  | 'CLIENT_SOURCE_REQUIRED'
  | 'DUPLICATE_KNOWLEDGE'
  | 'CONFLICTING_KNOWLEDGE'
  | 'OUTDATED_KNOWLEDGE'
  | 'IRRELEVANT_FOR_TASK'
  | 'UNSUPPORTED';

export type KnowledgeSourceUsagePolicy =
  | 'NEVER'
  | 'OPTIONAL'
  | 'REQUIRED_WHEN_MATCHED'
  | 'ALWAYS_FOR_TASK_TYPE'
  | 'CLIENT_ONLY'
  | 'SOURCE_CRITICAL_ONLY';

export type KnowledgeUsagePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'MANDATORY';

export type ProviderType = 'OPENAI' | 'GEMINI' | 'CLAUDE';

export interface KnowledgeRequirementDecision {
  decisionId: string;
  taskId: string;
  taskTypeId: string;
  employeeInstanceId: string;
  catalogEmployeeId?: string;
  companyId?: string;
  tenantId?: string;
  competencyId: string;
  subcompetencyId?: string;
  provider: ProviderType;
  modelId: string;
  modelVersion?: string;
  capabilityBaselineId?: string;
  nativeScore: number;
  nativeCriticalFailures: number;
  sourceId?: string;
  knowledgeObjectId?: string;
  sourceCriticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourceAuthority?: string;
  clientSpecific: boolean;
  jurisdictionSensitive: boolean;
  knowledgeNoveltyScore: number;
  knowledgeOverlapScore: number;
  knowledgeConflictScore: number;
  knowledgeFreshnessStatus: 'CURRENT' | 'REVIEW_REQUIRED' | 'OUTDATED' | 'SUPERSEDED' | 'UNKNOWN';
  decision: KnowledgeNecessityDecisionType;
  runtimeRequired: boolean;
  runtimeOptional: boolean;
  runtimeBlocked: boolean;
  reason: string;
  policyRuleId: string;
  evaluatedAt: string;
}

export interface KnowledgeNoveltyAnalysis {
  sourceId: string;
  sourceTitle: string;
  modelNativeCoverage: number;
  knowledgeNoveltyScore: number;
  knowledgeOverlapScore: number;
  knowledgeConflictScore: number;
  duplicateDetected: boolean;
  conflictDetected: boolean;
  recommendation: KnowledgeNecessityDecisionType;
  explanation: string;
}

export interface KnowledgeSelectionReceipt {
  receiptId: string;
  taskId: string;
  executionId: string;
  provider: string;
  modelId: string;
  requiredCompetencies: string[];
  evaluatedSourcesCount: number;
  selectedSources: { sourceId: string; title: string; decision: KnowledgeNecessityDecisionType }[];
  excludedSources: { sourceId: string; title: string; exclusionReason: string }[];
  selectedKnowledgeObjects: string[];
  selectedChunksCount: number;
  knowledgeTokensInjected: number;
  knowledgeTokensSaved: number;
  createdAt: string;
}

export interface KnowledgeNecessityTestCaseResult {
  testId: string;
  name: string;
  expectedDecision: string;
  actualDecision: string;
  passed: boolean;
  details: string;
}

export interface KnowledgeNecessityTestSuiteReport {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  companyId: string;
  tenantId: string;
  tests: KnowledgeNecessityTestCaseResult[];
}
