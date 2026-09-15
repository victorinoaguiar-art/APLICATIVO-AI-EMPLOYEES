/**
 * AI Employee Platform — Real Runtime, Model Binding & Execution Types
 * As specified in Prompt_Dar_Vida_Aos_AI_Employees_Runtime_Model_Binding_Real_Execution.md
 */

import {
  RuntimeExecutionMode,
  ModelExecutionMode,
  ToolExecutionMode,
  OutputExecutionMode,
  OverallExecutionMode,
  MockSource,
  ExecutionGateVerificationStatus,
  SystemEnvironment
} from './executionModeTypes';

export type RealEmployeeLifecycleState =
  | 'CREATED'
  | 'PROVISIONING'
  | 'COMPANY_BOUND'
  | 'TENANT_BOUND'
  | 'MODEL_BOUND'
  | 'KNOWLEDGE_BOUND'
  | 'TOOLS_BOUND'
  | 'PERMISSIONS_VALIDATED'
  | 'COMPETENCY_CHECKED'
  | 'READINESS_PASSED'
  | 'RUNTIME_READY'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'SUSPENDED'
  | 'ERROR'
  | 'OFFBOARDING'
  | 'DEACTIVATED';

export type ModelRoutingMode =
  | 'FIXED_MODEL'
  | 'PRIMARY_WITH_FALLBACK'
  | 'TASK_AWARE'
  | 'COST_AWARE'
  | 'QUALITY_FIRST'
  | 'BALANCED';

export type ModelProvider = 'GOOGLE_GEMINI' | 'ANTHROPIC' | 'OPENAI' | 'DETERMINISTIC_FALLBACK';

export interface EmployeeExecutionProfile {
  instanceId: string;
  catalogEmployeeId: string;
  companyId: string;
  tenantId: string;

  primaryProvider: ModelProvider;
  primaryModel: string;
  primaryConfiguration?: Record<string, any>;

  fallbackProvider1?: ModelProvider;
  fallbackModel1?: string;

  fallbackProvider2?: ModelProvider;
  fallbackModel2?: string;

  routingMode: ModelRoutingMode;
  reasoningLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  temperature: number;
  maxOutputTokens: number;

  toolPolicy: 'AUTHORIZED_ONLY' | 'ALL_PERMITTED' | 'DISABLED';
  knowledgePolicy: 'VERIFIED_ONLY' | 'HYBRID' | 'OPEN';
  memoryPolicy: 'ISOLATED_TENANT' | 'DISABLED';
  approvalPolicy: 'STRICT_HITL' | 'RISK_BASED' | 'AUTO';

  capabilityBaselineId: string;
  status: 'READY' | 'DEGRADED' | 'CONFIG_ERROR';
  version: string;
  updatedAt: string;
}

export interface AIEmployeeInstanceRecord {
  instanceId: string; // AEI-XXXXXX
  catalogEmployeeId: string; // EMP-XXX
  employeeName: string;
  roleKey: string;
  department: string;

  companyId: string; // CMP-XXXXXX
  tenantId: string; // TNT-XXXXXX

  lifecycleState: RealEmployeeLifecycleState;
  executionProfile: EmployeeExecutionProfile;

  isOperational: boolean;
  modelConnectionStatus: 'VERIFIED' | 'FAILED' | 'PENDING';
  taskEngineStatus: 'READY' | 'PAUSED' | 'UNAVAILABLE';
  permissionsStatus: 'VALID' | 'REVOKED';

  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeMemoryScope =
  | 'COMPANY_MEMORY'
  | 'EMPLOYEE_MEMORY'
  | 'TASK_MEMORY'
  | 'USER_PREFERENCES'
  | 'APPROVED_DECISIONS';

export interface EmployeeMemoryRecord {
  memoryId: string;
  companyId: string;
  tenantId: string;
  instanceId: string;
  scope: EmployeeMemoryScope;
  key: string;
  value: any;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type HumanApprovalStatus =
  | 'APPROVAL_NOT_REQUIRED'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export interface EmployeeApprovalRecord {
  approvalId: string;
  taskId: string;
  instanceId: string;
  companyId: string;
  tenantId: string;
  actionType: string;
  description: string;
  requestedBy: string;
  approvedBy?: string;
  status: HumanApprovalStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface RawRuntimeReceipt {
  executionId: string; // EXEC-TASK-XXXXXX-XXX
  taskId: string;
  instanceId: string;
  catalogEmployeeId: string;
  companyId: string;
  tenantId: string;

  provider: ModelProvider;
  modelId: string;
  modelVersion: string;
  providerRequestId: string;

  startedAt: string;
  completedAt: string;
  latencyMs: number;

  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;

  toolsRequested: string[];
  toolsExecuted: string[];

  knowledgeObjectsUsed: string[];
  sourceIdsUsed: string[];

  approvalsRequired: string[];
  approvalStatus: HumanApprovalStatus;

  outputIds: string[];
  outputContent?: string;

  cost: {
    usdCost: number;
    aoaCost: number;
    eurCost: number;
  };

  // AETF-500 Execution Mode Control & Evidence Gate Fields
  executionMode?: RuntimeExecutionMode;
  modelExecutionMode?: ModelExecutionMode;
  toolExecutionMode?: ToolExecutionMode;
  outputExecutionMode?: OutputExecutionMode;
  overallExecutionMode?: OverallExecutionMode;
  realApiVerified?: boolean;
  verificationStatus?: ExecutionGateVerificationStatus;
  mockSource?: MockSource;
  mockFixtureId?: string;
  simulatedInputTokens?: number;
  simulatedOutputTokens?: number;
  environment?: SystemEnvironment;
  billableExecution?: boolean;
  providerRequestIdAvailable?: boolean;

  routingReason: string;
  status: 'SUCCESS' | 'FAILED' | 'FALLBACK_TRIGGERED' | 'WAITING_APPROVAL' | 'BLOCKED';
  error?: string;
  signature: string;
  isMock: boolean;
}

export interface EmployeeRuntimeTestCaseResult {
  testId: string;
  name: string;
  details: string;
  expectedCode: string;
  actualCode: string;
  passed: boolean;
  executionId?: string;
  latencyMs?: number;
}

export interface EmployeeRuntimeTestSuiteReport {
  companyId: string;
  tenantId: string;
  total: number;
  passed: number;
  failed: number;
  timestamp: string;
  tests: EmployeeRuntimeTestCaseResult[];
}
