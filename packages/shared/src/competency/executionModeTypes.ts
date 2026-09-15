/**
 * AETF-500 — Execution Mode Control, Mock vs Real API Visibility & Runtime Evidence Gate Types
 * As specified in Prompt_Execution_Mode_MOCK_vs_REAL_API_AETF500.md
 */

export type RuntimeExecutionMode = 'MOCK' | 'REAL_API' | 'UNKNOWN' | 'LOCAL_TEST' | 'REPLAY' | 'SANDBOX_API';
export type ModelExecutionMode = 'MOCK' | 'REAL_API';
export type ToolExecutionMode = 'MOCK' | 'REAL';
export type OutputExecutionMode = 'MOCK_OUTPUT' | 'REAL_OUTPUT';
export type OverallExecutionMode = 'REAL_API' | 'MOCK' | 'REAL_API_WITH_MOCK_COMPONENTS';

export type MockSource = 'HARDCODED' | 'FIXTURE' | 'LOCAL_GENERATOR' | 'RECORDED_RESPONSE' | 'TEST_FACTORY';

export type ExecutionGateVerificationStatus =
  | 'REAL_API_VERIFIED'
  | 'REAL_API_UNVERIFIED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'MOCK_SIMULATION'
  | 'REJECTED_FAKE_REQUEST_ID'
  | 'BLOCKED_PRODUCTION_MOCK';

export type SystemEnvironment = 'DEVELOPMENT' | 'TEST' | 'STAGING' | 'PRODUCTION';

export interface ExecutionEvidenceGateResult {
  verified: boolean;
  status: ExecutionGateVerificationStatus;
  reason: string;
  providerRequestIdAvailable: boolean;
  metadataPresent: boolean;
}

export interface SeparateExecutionMetrics {
  realApiTaskCount: number;
  mockTaskCount: number;
  unknownTaskCount: number;
  realApiSuccessRate: number;
  mockSuccessRate: number;
  realApiCostUsd: number;
  mockCostUsd: number;
  realApiInputTokens: number;
  realApiOutputTokens: number;
  simulatedInputTokens: number;
  simulatedOutputTokens: number;
  productionMockIncidents: number;
}

export interface LegacyAuditRecord {
  executionId: string;
  taskId: string;
  existingStatus: string;
  evidenceFound: boolean;
  recommendedMode: RuntimeExecutionMode;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'MIGRATED_TO_UNKNOWN' | 'VERIFIED_REAL_API' | 'VERIFIED_MOCK';
}

export interface ExecutionModeTestCaseResult {
  testId: string;
  name: string;
  details: string;
  expectedCode: string;
  actualCode: string;
  passed: boolean;
  executionMode?: RuntimeExecutionMode;
}

export interface ExecutionModeTestSuiteReport {
  companyId: string;
  tenantId: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  timestamp: string;
  tests: ExecutionModeTestCaseResult[];
}
