export type EmployeePilotLifecycleState =
  | 'REGISTERED'
  | 'SPECIFIED'
  | 'CONFIGURED_FOR_TEST'
  | 'CONNECTORS_PENDING'
  | 'DATA_CONTRACTS_PENDING'
  | 'TESTS_DEFINED'
  | 'READY_FOR_TEST'
  | 'IN_TESTING'
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
  | 'SUSPENDED';

export type PilotTenantEnvironment = 'DEVELOPMENT' | 'STAGING' | 'SHADOW' | 'PRODUCTION';
export type PilotTenantValidationState = 'DRAFT' | 'VALIDATING' | 'READY_FOR_PILOT' | 'INVALID' | 'BLOCKED';

export interface PilotTenant {
  tenant_key: string;
  name: string;
  environment: PilotTenantEnvironment;
  currency: 'AOA' | 'EUR' | 'USD';
  locale: string;
  timezone: string;
  test_nif: string;
  validation_state: PilotTenantValidationState;
  created_at: string;
}

export type PilotEmployeeId = '261' | '286' | '066' | '064' | '073';

export interface EmployeePilotConfig {
  employee_id: PilotEmployeeId;
  role_key: string;
  name: string;
  home_area_code: string;
  canonical_risk: 'R1' | 'R2' | 'R3' | 'R4';
  current_state: EmployeePilotLifecycleState;
  pilot_mode: 'SHADOW' | 'NO_SIDE_EFFECTS' | 'ACTIVE_TEST';
  pilot_autonomy: string;
  allowed_inputs: string[];
  allowed_connectors: string[];
  allowed_actions: string[];
  denied_actions: string[];
  human_supervisor_email: string;
  reviewer_email: string;
  updated_at: string;
}

export type ConnectorType = 'FILE_UPLOAD' | 'GOOGLE_DRIVE' | 'EMAIL' | 'PRIMAVERA_V10' | 'BANK_READONLY';
export type ConnectorCertificationState = 'NOT_CONFIGURED' | 'AUTHENTICATING' | 'CONNECTED' | 'CONNECTED_READ_ONLY' | 'DEGRADED' | 'EXPIRED' | 'REVOKED' | 'FAILED' | 'CERTIFIED_FOR_TEST';

export interface PilotConnectorInstance {
  connector_id: string;
  name: string;
  connector_type: ConnectorType;
  mode: 'READ_ONLY' | 'SANDBOX' | 'MOCK';
  status: ConnectorCertificationState;
  tenant_key: string;
  write_actions_allowed: false; // Mandatory safeguard
  last_test_at: string;
}

export interface OTCTECDataContract {
  contract_id: string;
  name: string;
  semantic_type: string;
  required_fields: string[];
  recommended_fields: string[];
  date_range_rule: string;
  freshness_rule: string;
  version: string;
  status: 'DRAFT' | 'VALIDATING' | 'VALID' | 'INVALID' | 'STALE' | 'BROKEN';
}

export interface NormalizedWorkRequest {
  request_id: string;
  organization_id: string;
  target_area_code: string;
  assigned_employee_id: PilotEmployeeId;
  resolved_outcome: string;
  target_account?: string;
  period?: { from: string; to: string };
  execution_mode: 'SHADOW' | 'PREVIEW';
  write_actions_allowed: false; // Mandatory safeguard
  missing_required_fields: string[];
  needs_clarification: boolean;
  created_at: string;
}

export interface OTCTECInputSnapshot {
  snapshot_id: string;
  task_id: string;
  files: { filename: string; file_hash: string; mime_type: string }[];
  record_counts: Record<string, number>;
  source_versions: Record<string, string>;
  frozen_at: string;
  is_frozen: true;
}

export type ErrorSeverityTaxonomy = 'E0_NO_ERROR' | 'E1_COSMETIC' | 'E2_MINOR' | 'E3_OPERATIONAL' | 'E4_MATERIAL' | 'E5_CRITICAL';
export type RootCauseTaxonomy = 
  | 'INPUT_ERROR'
  | 'DATA_CONTRACT_ERROR'
  | 'KNOWLEDGE_ERROR'
  | 'PROMPT_ERROR'
  | 'ROLEPACK_ERROR'
  | 'REASONING_ERROR'
  | 'ALGORITHM_ERROR'
  | 'TOOL_ERROR'
  | 'CONNECTOR_ERROR'
  | 'WORKFLOW_ERROR'
  | 'POLICY_ERROR'
  | 'PERMISSION_ERROR'
  | 'RENDERING_ERROR'
  | 'CLIENT_EXPECTATION';

export interface OTCTECErrorCase {
  error_case_id: string;
  task_id: string;
  employee_id: PilotEmployeeId;
  severity: ErrorSeverityTaxonomy;
  root_cause: RootCauseTaxonomy;
  input_snapshot_id: string;
  expected_result: string;
  actual_result: string;
  reproduction_steps: string[];
  status: 'OPEN' | 'REPRODUCED' | 'ROOT_CAUSE_IDENTIFIED' | 'FIX_IN_PROGRESS' | 'FIXED_IN_SANDBOX' | 'REGRESSION_PASS' | 'CLOSED';
  created_at: string;
}

export interface OTCTECGoldenCase {
  case_id: string;
  employee_id: PilotEmployeeId;
  family: 'HAPPY_PATH' | 'EDGE_CASE' | 'FAILURE_CASE' | 'ADVERSARIAL_CASE';
  title: string;
  input_fixture: Record<string, any>;
  expected_facts: string[];
  forbidden_behaviors: string[];
  approved_by: string;
  version: string;
}

export interface PilotAcceptanceGateResult {
  gate_id: string; // G1 to G13
  gate_name: string;
  passed: boolean;
  score_pct: number;
  details: string;
}

export interface PlatformCertificationRecord {
  employee_id: PilotEmployeeId;
  role_key: string;
  certification_state: 'PLATFORM_CERTIFIED' | 'CONDITIONAL' | 'NOT_ASSESSED' | 'SUSPENDED';
  gates_summary: PilotAcceptanceGateResult[];
  certified_at: string;
}

export interface OTCTECGlobalSummary {
  pilot_tenant: PilotTenant;
  pilot_employees: EmployeePilotConfig[];
  connectors_certified_count: number;
  open_error_cases_count: number;
  golden_cases_count: number;
  platform_certified_count: number;
  updated_at: string;
}
