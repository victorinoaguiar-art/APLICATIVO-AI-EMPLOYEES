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

// V2.1 Work Contract & Enterprise Data Fabric Types
export type ActivationMode =
  | 'MANUAL_TASK'
  | 'API_TASK'
  | 'UPSTREAM_EMPLOYEE_HANDOFF'
  | 'EVENT'
  | 'SCHEDULE_OPTIONAL'
  | 'FILE_OR_MESSAGE_ARRIVAL';

import { DocumentDeliveryPolicy } from '../document/documentServiceTypes.js';
export * from '../document/documentServiceTypes.js';

export interface WorkContractTemplate {
  schema_version: string;
  employee_id: number;
  role_key: string;
  display_name: string;
  department: string;
  rolepack_version: string;
  documentDelivery?: DocumentDeliveryPolicy;
  activation: {
    modes: ActivationMode[];
    canonical_triggers: string[];
    rule: string;
  };
  inputs: {
    canonical_data_products: string[];
    business_source_context: string[];
    connection_families: Array<{
      tool: string;
      family: string;
      examples: string[];
    }>;
    ingestion_methods: string[];
  };
  processing_contract: {
    processing_style: string;
    stages: Array<{
      stage_number: number;
      name: string;
      objective: string;
      validation_rule: string;
    }>;
    deterministic_validation: string[];
    transformation_rules: string[];
    missing_data_policy: 'WAITING_DATA' | 'PARTIAL_WITH_WARNING' | 'BLOCK';
  };
  outputs: {
    output_contracts: string[];
    delivered_artifacts: string[];
    handoffs: string[];
    downstream_consumers: string[];
  };
  governance: {
    risk: {
      level: RiskLevel;
      materiality_threshold_usd: number;
      approval_triggers: string[];
    };
    autonomy: {
      default: AutonomyLevel;
      maximum: AutonomyLevel;
    };
    approval_policy: ApprovalPolicy;
    audit_requirements: string[];
  };
  kpis_and_slas: {
    measurable_kpis: string[];
    target_slas: Array<{
      priority: string;
      target_completion: string;
    }>;
    quality_gates: string[];
  };
}

export interface DataEnvelope<T = unknown> {
  envelopeId: string;
  organizationId: string;
  sourceConnectionId: string;
  sourceSystem: string;
  sourceRecordId?: string;
  sourceDeepLink?: string;
  schemaKey: string;
  schemaVersion: string;
  eventType?: string;
  occurredAt?: string;
  ingestedAt: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'HIGHLY_RESTRICTED';
  payload: T;
  attachmentRefs: string[];
  lineage: Array<{ step: string; system: string; timestamp: string }>;
  idempotencyKey: string;
  checksum: string;
  confidence?: number;
  freshness?: { asOf: string; status: 'FRESH' | 'STALE' | 'UNKNOWN' };
}

export interface OutputRoute {
  routeId: string;
  employeeId: string;
  roleKey: string;
  outputContract: string;
  destinationType: string;
  destinationTarget: string;
  autoDelivery: boolean;
}

export interface WorkProductEnvelope<T = unknown> {
  workProductId: string;
  organizationId: string;
  taskId: string;
  employeeId: string;
  roleKey: string;
  rolePackVersion: string;
  type: string;
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'DELIVERED' | 'FAILED';
  structuredPayload?: T;
  artifactRefs: string[];
  sourceSnapshotId: string;
  sourceLineage: Array<{ step: string; system: string; timestamp: string }>;
  confidence?: number;
  approvalId?: string;
  deliveryRoutes: OutputRoute[];
  checksum: string;
  createdAt: string;
}

export interface DeliveryReceipt {
  receiptId: string;
  workProductId: string;
  organizationId: string;
  destinationType: 'HUMAN' | 'SYSTEM' | 'EMPLOYEE' | 'ARTIFACT' | 'EMAIL' | 'WEBHOOK' | 'STORAGE';
  destinationTarget: string;
  deliveredAt: string;
  status: 'DELIVERED' | 'PENDING' | 'FAILED';
  receiptProof: string;
}

export interface ConnectionProfile {
  id: string;
  organizationId: string;
  name: string;
  systemType: 'ERP' | 'CRM' | 'BI' | 'DATABASE' | 'SPREADSHEET' | 'FILE_STORAGE' | 'API' | 'WEBHOOK';
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED' | 'SYNCING';
  authType: 'OAUTH2' | 'API_KEY' | 'BASIC' | 'GATEWAY_AGENT';
  scopes: string[];
  lastSyncedAt?: string;
  health: 'HEALTHY' | 'WARNING' | 'ERROR';
  deepLinkPattern?: string;
}

export interface InputBinding {
  bindingId: string;
  employeeId: string;
  roleKey: string;
  dataProduct: string;
  connectionId: string;
  sourceFamily: string;
  ingestionMethod: string;
  status: 'ACTIVE' | 'PAUSED' | 'ERROR';
}

export interface EmployeeWorkBinding {
  organizationId: string;
  employeeId: string;
  roleKey: string;
  workContractVersion: string;
  inputBindings: InputBinding[];
  triggerBindings: Array<{ triggerType: string; connectionId: string; filter?: string }>;
  outputRoutes: OutputRoute[];
  supervisorId?: string;
  policySetId: string;
}

