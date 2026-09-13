/**
 * IRECE — AI Employee Input Readiness, Evidence Completeness & Preflight Engine
 */

export type InputReadinessStatus = 
  | 'READY' 
  | 'READY_WITH_WARNINGS' 
  | 'NEEDS_DATA' 
  | 'NEEDS_CLARIFICATION' 
  | 'DATA_CONFLICT' 
  | 'STALE_DATA' 
  | 'INVALID_DATA' 
  | 'UNAUTHORIZED_SOURCE' 
  | 'BLOCKED';

export type InputClassification = 
  | 'REQUIRED' 
  | 'CONDITIONAL' 
  | 'RECOMMENDED' 
  | 'OPTIONAL' 
  | 'FORBIDDEN';

export interface SingleInputRequirement {
  input_key: string;
  display_name: string;
  classification: InputClassification;
  description: string;
  expected_mime_types?: string[];
  max_age_days?: number;
  condition_description?: string;
}

export interface EmployeeInputRequirementProfile {
  employee_id: string;
  role_key: string;
  task_type: string;
  requirements: SingleInputRequirement[];
  forbidden_sources?: string[];
  allow_degraded_execution: boolean;
}

export interface DiscoveredInputSource {
  source_id: string;
  source_name: string;
  source_type: 'PEIP_EMAIL' | 'PEIP_DRIVE' | 'GWNIS_DOCS' | 'GWNIS_SHEETS' | 'ERP_PRIMAVERA' | 'USER_UPLOAD' | 'CREDENTIAL_VAULT';
  input_key: string;
  file_name?: string;
  created_at: string;
  is_authorized: boolean;
  content_hash: string;
}

export interface DataValidationIssue {
  issue_id: string;
  input_key: string;
  issue_type: 'MISSING_REQUIRED_DATA' | 'STALE_DATA_EXPIRED' | 'FORMAT_MISMATCH' | 'DATA_CONFLICT' | 'UNAUTHORIZED_SOURCE';
  severity: 'BLOCKING' | 'WARNING' | 'INFO';
  description: string;
  remediation_suggestion: string;
}

export interface TaskPreflightRequest {
  request_id: string;
  organization_id: string;
  employee_id: string;
  role_key: string;
  task_type: string;
  user_intent_prompt: string;
  provided_inputs?: Record<string, any>;
  requested_by: string;
}

export interface TaskPreflightResult {
  preflight_id: string;
  request_id: string;
  organization_id: string;
  employee_id: string;
  task_type: string;
  status: InputReadinessStatus;
  execution_permitted: boolean;
  discovered_sources: DiscoveredInputSource[];
  issues: DataValidationIssue[];
  missing_required_keys: string[];
  warnings: string[];
  summary_message: string;
  evaluated_at: string;
}

export interface IRECEGlobalSummary {
  total_preflights_evaluated: number;
  total_ready_executions: number;
  total_ready_with_warnings: number;
  total_blocked_missing_data: number;
  total_blocked_data_conflicts: number;
  average_preflight_latency_ms: number;
  input_health_index_pct: number;
}
