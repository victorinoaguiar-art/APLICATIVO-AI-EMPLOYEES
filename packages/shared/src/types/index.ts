export type RiskLevel = 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export type AutonomyLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export type RolePackLifecycle = 'draft' | 'validated' | 'certified' | 'marketplace_ready' | 'deprecated';

export type ApprovalPolicy = 'AP.NONE' | 'AP.HUMAN_REQUIRED' | 'AP.SUPERVISOR_ONLY' | 'AP.TWO_PERSON_RULE';

export type TaskStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'RESOLVING_ROLE'
  | 'LOADING_CONTEXT'
  | 'AUTHORIZING'
  | 'ROUTING_MODEL'
  | 'PLANNING'
  | 'WAITING_TOOL'
  | 'WAITING_DATA'
  | 'WAITING_APPROVAL'
  | 'EXECUTING_TOOLS'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'PAUSED_GLOBAL';

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'MODIFIED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface RolePackInputOutput {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

export interface RolePackRiskControl {
  risk: RiskLevel;
  rule: string;
  action: string;
}

export interface RolePackAcceptanceTest {
  id: string;
  name: string;
  description: string;
  expectedOutcome: string;
}

export interface RolePack {
  schema_version: string;
  id: number;
  role_key: string;
  display_name: string;
  department: string;
  archetypes: string[];
  mission: string;
  inputs: (RolePackInputOutput | string)[];
  outputs: (RolePackInputOutput | string)[];
  capabilities: string[];
  tools: {
    required: string[];
    optional: string[];
  };
  permissions: string[];
  autonomy: {
    default: AutonomyLevel;
    maximum: AutonomyLevel;
  };
  risk: {
    level: RiskLevel;
    controls: (RolePackRiskControl | string)[];
  };
  approval_policy: ApprovalPolicy;
  events: {
    triggers: string[];
    emits: string[];
  };
  workflow: {
    primary: string;
  };
  kpis: string[];
  acceptance_tests: RolePackAcceptanceTest[];
  version: string;
  lifecycle: RolePackLifecycle;
  metadata?: {
    source?: string;
    source_sheet?: string;
    source_row?: number;
    generated?: boolean;
    tags?: string[];
    author?: string;
    description_pt?: string;
  };
}

export interface ToolCallIntent {
  intentId: string;
  organizationId: string;
  employeeId: string;
  taskId: string;
  roleKey: string;
  toolKey: string;
  operation: string;
  arguments: Record<string, unknown>;
  reason: string;
  confidence: number;
  idempotencyKey: string;
  requestedAt: string;
}

export interface ApprovalRecord {
  approvalId: string;
  organizationId: string;
  taskId: string;
  employeeId: string;
  requestedAction: string;
  toolKey: string;
  operation: string;
  riskLevel: RiskLevel;
  impact: string;
  reason: string;
  evidence: Record<string, unknown>;
  snapshotReference: string;
  snapshotHash: string;
  requestedBy: string;
  decidedBy?: string;
  status: ApprovalStatus;
  createdAt: string;
  decidedAt?: string;
  version: number;
}

export interface TaskRecord {
  id: string;
  organizationId: string;
  employeeId: string;
  rolepackVersion: string;
  promptVersion: string;
  workflowVersion: string;
  policyVersion: string;
  parentTaskId?: string;
  title: string;
  instruction: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  riskLevel: RiskLevel;
  autonomyLevel: AutonomyLevel;
  status: TaskStatus;
  requestedBy: string;
  deadline?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedCost: number;
  actualCost: number;
  resultReference?: string;
  configurationFingerprint: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface DecisionTrace {
  traceId: string;
  taskId: string;
  organizationId: string;
  employeeId: string;
  roleKey: string;
  stepName: string;
  inputSnapshot: unknown;
  outputSnapshot: unknown;
  permissionCheckResult: boolean;
  policyCheckResult: boolean;
  modelUsed?: string;
  executionTimeMs: number;
  timestamp: string;
}

export interface AuditEvent {
  eventId: string;
  organizationId: string;
  actorId: string;
  actorType: 'USER' | 'AI_EMPLOYEE' | 'SYSTEM';
  eventType: string;
  resourceId: string;
  resourceType: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface CertificationResult {
  roleKey: string;
  version: string;
  fingerprint: string;
  certified: boolean;
  autonomyLevel: AutonomyLevel;
  score: number;
  blockingFailures: string[];
  timestamp: string;
}
