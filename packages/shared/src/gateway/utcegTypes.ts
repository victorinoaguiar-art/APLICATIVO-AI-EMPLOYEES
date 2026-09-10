export type CommandSourceType =
  | 'HUMAN_COMMAND'
  | 'DOCUMENT_COMMAND'
  | 'SYSTEM_EVENT'
  | 'SCHEDULED_WORK'
  | 'EMPLOYEE_HANDOFF'
  | 'MACHINE_EVENT';

export type SourceActorType = 'HUMAN' | 'SYSTEM' | 'EMPLOYEE' | 'DEVICE';

export interface AttachmentRef {
  attachmentId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  checksum: string;
}

export interface ContextRef {
  contextType: 'CUSTOMER' | 'INVOICE' | 'CONTRACT' | 'TRANSACTION' | 'PROJECT' | 'ASSET' | 'TASK';
  contextId: string;
  sourceSystem: string;
  deepLink?: string;
}

export interface UnifiedCommandEnvelope {
  commandId: string;
  organizationId: string;
  tenantId: string;
  sourceType: CommandSourceType;
  sourceChannel: string;
  sourceActorType: SourceActorType;
  sourceActorId?: string;
  receivedAt: string;
  language?: string;
  locale?: string;
  timezone?: string;
  rawInputReference?: string;
  normalizedIntent?: string;
  requestedEmployeeId?: number;
  requestedRoleKey?: string;
  requestedDepartment?: string;
  taskType: string;
  entities: Record<string, unknown>[];
  parameters: Record<string, unknown>;
  attachments: AttachmentRef[];
  contextRefs: ContextRef[];
  sourceSystem?: string;
  sourceRecordId?: string;
  sourceDeepLink?: string;
  confidence?: number;
  riskHint?: string;
  idempotencyKey: string;
  correlationId: string;
  traceId: string;
}

export interface BusinessEventEnvelope {
  eventId: string;
  organizationId: string;
  tenantId: string;
  eventType: string;
  eventVersion: string;
  sourceSystem: string;
  sourceRecordId?: string;
  occurredAt: string;
  receivedAt: string;
  payload: Record<string, unknown>;
  payloadSchema: string;
  classification: string;
  sensitivity: string;
  producer: string;
  correlationId: string;
  causationId?: string;
  idempotencyKey: string;
  traceId: string;
}

export interface EmployeeHandoffEnvelope {
  handoffId: string;
  organizationId: string;
  fromEmployeeId: number;
  toEmployeeId: number;
  sourceTaskId: string;
  nextTaskType: string;
  workProductRefs: string[];
  dataProductRefs: string[];
  documentRefs: string[];
  requiredAction: string;
  contextRefs: string[];
  confidence?: number;
  riskLevel: string;
  correlationId: string;
  traceId: string;
}

export interface WorkActivationContract {
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  commandModes: string[];
  activationModes: string[];
  eventTriggers: string[];
  inputContract: {
    requiredDataProducts: string[];
    optionalDataProducts: string[];
    sourceSystemFamilies: string[];
    supportedFileTypes: string[];
    supportedModalities: string[];
    contextRequirements: string[];
    freshnessRules: string[];
    validationRules: string[];
    missingDataPolicy: string;
  };
  connectionContract: {
    logicalTools: string[];
    preferredConnectors: string[];
    fallbackConnectors: string[];
    enterpriseGatewaySupported: boolean;
    readWritePolicy: string;
  };
  executionContract: {
    deterministicSteps: string[];
    aiSteps: string[];
    workflowSteps: string[];
    escalationConditions: string[];
  };
  outputContract: {
    workProducts: string[];
    structuredOutputs: string[];
    documentOutputs: string[];
    eventsEmitted: string[];
  };
  deliveryContract: {
    recipients: string[];
    channels: string[];
    targetSystems: string[];
    downstreamEmployees: number[];
    writeBackOperations: string[];
    approvalRequired: string;
    deliveryReceiptRequired: boolean;
  };
  auditContract: {
    provenance: boolean;
    lineage: boolean;
    trace: boolean;
    sourceDeepLinks: boolean;
  };
}

export interface EventRule {
  ruleId: string;
  organizationId: string;
  eventType: string;
  conditionExpr?: string;
  targetEmployeeId: number;
  targetTaskType: string;
  approvalPolicy?: string;
  enabled: boolean;
}

export enum UTCEGErrorCode {
  COMMAND_INVALID = 'COMMAND_INVALID',
  COMMAND_AMBIGUOUS = 'COMMAND_AMBIGUOUS',
  COMMAND_UNAUTHORIZED = 'COMMAND_UNAUTHORIZED',
  COMMAND_RISK_BLOCKED = 'COMMAND_RISK_BLOCKED',
  COMMAND_APPROVAL_REQUIRED = 'COMMAND_APPROVAL_REQUIRED',
  CHANNEL_NOT_ALLOWED = 'CHANNEL_NOT_ALLOWED',
  CHANNEL_AUTH_FAILED = 'CHANNEL_AUTH_FAILED',
  EVENT_INVALID = 'EVENT_INVALID',
  EVENT_REPLAYED = 'EVENT_REPLAYED',
  EVENT_SCHEMA_MISMATCH = 'EVENT_SCHEMA_MISMATCH',
  EVENT_TENANT_MISMATCH = 'EVENT_TENANT_MISMATCH',
  EMPLOYEE_NOT_RESOLVED = 'EMPLOYEE_NOT_RESOLVED',
  EMPLOYEE_NOT_AVAILABLE = 'EMPLOYEE_NOT_AVAILABLE',
  INPUT_MISSING = 'INPUT_MISSING',
  INPUT_STALE = 'INPUT_STALE',
  INPUT_VALIDATION_FAILED = 'INPUT_VALIDATION_FAILED',
  CONNECTOR_UNAVAILABLE = 'CONNECTOR_UNAVAILABLE',
  GATEWAY_OFFLINE = 'GATEWAY_OFFLINE',
  HANDOFF_INVALID = 'HANDOFF_INVALID',
  HANDOFF_UNAUTHORIZED = 'HANDOFF_UNAUTHORIZED',
  OUTPUT_ROUTE_UNAVAILABLE = 'OUTPUT_ROUTE_UNAVAILABLE',
  DELIVERY_FAILED = 'DELIVERY_FAILED'
}
