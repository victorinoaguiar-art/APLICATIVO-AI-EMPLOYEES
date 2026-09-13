export type CoverageMode = 'human_only' | 'AI_assisted' | 'AI_operated_supervised' | 'AI_orchestrated' | 'not_covered';
export type CoverageScopeType = 'organization' | 'area' | 'department' | 'process' | 'subprocess' | 'task' | 'system' | 'site' | 'legal_entity';

export interface CoverageGap {
  gap_id: string;
  scope_type: CoverageScopeType;
  scope_id: string;
  description: string;
  gap_type: 'NO_WORKER' | 'NO_SKILL' | 'NO_DATA' | 'NO_CONNECTOR' | 'NO_PERMISSION' | 'NO_APPROVER' | 'NO_CAPACITY' | 'NO_CERTIFICATION';
  recommended_action: string;
}

export interface OrganizationCoverageBlueprint {
  organization_id: string;
  total_work_units: number;
  covered_work_units: number;
  coverage_percentage: number;
  coverage_by_department: Record<string, number>;
  active_coverage_mode: CoverageMode;
  human_dependency_score: number; // 0-100
  ai_dependency_score: number; // 0-100
  critical_gaps: CoverageGap[];
  last_calculated_at: string;
}

export type CapacityState = 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'IN_PROGRESS' | 'WAITING' | 'BLOCKED' | 'DEGRADED' | 'UNAVAILABLE';
export type CapacityUnitType = 'tasks_per_hour' | 'docs_per_hour' | 'transactions_per_day' | 'tokens' | 'tool_executions' | 'compute_minutes';

export interface CapacityAllocation {
  allocation_id: string;
  area_code: string;
  process_id: string;
  employee_id: string;
  allocated_units: number;
  unit_type: CapacityUnitType;
  capacity_state: CapacityState;
  reserved_for_event?: string;
  updated_at: string;
}

export type SimulationMode = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE_AUTOMATION' | 'CUSTOM';

export interface StaffingSimulationResult {
  simulation_id: string;
  organization_id: string;
  mode: SimulationMode;
  input_monthly_invoices: number;
  input_bank_accounts: number;
  input_employees_count: number;
  input_stock_movements_monthly: number;
  recommended_areas: string[];
  recommended_solution_packs: string[];
  recommended_ai_employee_capacity_units: number;
  required_human_supervisors_fte: number;
  recommended_connectors: string[];
  estimated_monthly_cost_aoa: number;
  expected_time_to_value_days: number;
  is_production_affecting: false; // Mandatory safeguard
  simulated_at: string;
}

export type HybridRoleType = 
  | 'RESPONSIBLE'
  | 'ACCOUNTABLE'
  | 'CONSULTED'
  | 'INFORMED'
  | 'APPROVER'
  | 'AI_EXECUTOR'
  | 'AI_REVIEWER'
  | 'AI_COORDINATOR'
  | 'HUMAN_OVERRIDE';

export interface HybridResponsibilityAssignment {
  process_id: string;
  process_name: string;
  area_code: string;
  risk_class: 'R1' | 'R2' | 'R3' | 'R4';
  ai_executor: string;
  ai_reviewer?: string;
  human_approver?: string;
  cfo_accountable?: string;
  human_override_authorized: boolean;
}

export interface HybridResponsibilityMatrix {
  organization_id: string;
  assignments: HybridResponsibilityAssignment[];
  updated_at: string;
}

export type DecisionAction = 'CAN_ACCESS' | 'CAN_PREPARE' | 'CAN_RECOMMEND' | 'CAN_DECIDE' | 'CAN_APPROVE' | 'CAN_EXECUTE';

export interface DecisionRightPolicy {
  policy_id: string;
  role_key: string;
  allowed_actions: DecisionAction[];
  monetary_limit_aoa: number;
  risk_threshold: 'R1' | 'R2' | 'R3' | 'R4';
  requires_human_approval: boolean;
  requires_segregation_of_duties: boolean;
}

export type WorkControlPatternType = 
  | 'MAKER_ONLY'
  | 'MAKER_CHECKER'
  | 'MAKER_CHECKER_APPROVER'
  | 'HUMAN_ONLY_APPROVAL'
  | 'DUAL_APPROVAL'
  | 'EXPERT_REVIEW';

export interface WorkControlPattern {
  pattern_id: string;
  task_type: string;
  control_pattern: WorkControlPatternType;
  maker_role: string;
  checker_role?: string;
  approver_role?: string;
  prevent_self_approval: boolean;
}

export type BackupState = 'PRIMARY' | 'HOT_BACKUP' | 'WARM_BACKUP' | 'COLD_BACKUP' | 'UNAVAILABLE';

export interface EmployeeSubstitutionProfile {
  primary_employee_id: string;
  backup_employee_id: string;
  backup_state: BackupState;
  skill_match_pct: number;
  inherits_permissions_automatically: false; // Mandatory safeguard
  last_certified_at: string;
}

export type ContinuityState = 'NORMAL' | 'DEGRADED' | 'SAFE_FALLBACK' | 'HUMAN_TAKEOVER' | 'PAUSED' | 'RECOVERING';

export interface WorkContinuityPlan {
  plan_id: string;
  service_component: string; // e.g., 'BANK_API', 'MODEL_GATEWAY', 'ERP_CONNECTOR'
  current_state: ContinuityState;
  fallback_action: string;
  notify_supervisor: boolean;
  last_state_change: string;
}

export interface EnterpriseDataContract {
  data_contract_id: string;
  semantic_type: string;
  source_owner: string;
  system: string;
  schema_definition: Record<string, string>;
  required_fields: string[];
  freshness_max_minutes: number;
  quality_threshold_pct: number;
  contract_state: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'STALE' | 'BROKEN' | 'DEPRECATED';
  updated_at: string;
}

export interface ProcessTwinNode {
  node_id: string;
  process_name: string;
  step_sequence: number;
  actor_type: 'HUMAN' | 'AI_EMPLOYEE' | 'AI_TEAM' | 'SYSTEM';
  actor_id: string;
  input_contracts: string[];
  output_outcome: string;
  sla_minutes: number;
  risk_level: 'R1' | 'R2' | 'R3' | 'R4';
}

export interface BusinessProcessDigitalTwin {
  process_id: string;
  process_name: string;
  nodes: ProcessTwinNode[];
  bottlenecks_detected: string[];
  total_cycle_time_minutes: number;
}

export type PriorityLevel = 'P0_CRITICAL' | 'P1_HIGH' | 'P2_NORMAL' | 'P3_LOW';

export interface WorkRequest {
  request_id: string;
  organization_id: string;
  channel: 'TEXT' | 'VOICE' | 'FORM' | 'FILE' | 'EMAIL' | 'API' | 'EVENT' | 'BUTTON';
  raw_prompt: string;
  resolved_intent: string;
  target_area_code: string;
  assigned_employee_id: string;
  priority: PriorityLevel;
  sla_deadline: string;
  status: 'NEW' | 'QUALIFIED' | 'QUEUED' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_DATA' | 'WAITING_APPROVAL' | 'BLOCKED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  created_at: string;
}

export interface EnterpriseWorkQueueSummary {
  organization_id: string;
  total_open_tasks: number;
  active_ai_employees_count: number;
  active_areas_count: number;
  waiting_approval_count: number;
  waiting_data_count: number;
  blocked_count: number;
  p0_critical_count: number;
  updated_at: string;
}

export type DWOSAutonomyLevel = 'L0_OBSERVE' | 'L1_ANALYZE' | 'L2_RECOMMEND' | 'L3_PREPARE' | 'L4_EXECUTE_LIMITED' | 'L5_SUPERVISED_AUTONOMOUS';

export interface AutonomyProgressionRecord {
  employee_id: string;
  role_key: string;
  current_autonomy_level: DWOSAutonomyLevel;
  empirical_sample_size: number;
  error_free_streak: number;
  risk_budget_cap: DWOSAutonomyLevel;
  last_evaluated_at: string;
}

export interface OutcomeQualityContract {
  contract_id: string;
  outcome_code: string;
  acceptance_criteria: string[];
  required_evidence_keys: string[];
  accuracy_threshold_pct: number;
  approval_required: boolean;
}

export interface WorkProductProvenancePassport {
  passport_id: string;
  task_id: string;
  employee_id: string;
  role_key: string;
  input_snapshot_hash: string;
  data_contract_versions: string[];
  policy_versions: string[];
  approval_signature?: string;
  output_hash: string;
  created_at: string;
}

export interface OrganizationRiskBudget {
  organization_id: string;
  area_risk_caps: Record<string, 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGHER'>;
  max_allowed_autonomy: DWOSAutonomyLevel;
  updated_at: string;
}

export interface CapacityPricingTier {
  area_code: string;
  capacity_units_included: number;
  unit_type: CapacityUnitType;
  monthly_base_price_aoa: number;
  overage_unit_price_aoa: number;
}

export interface InternalChargebackShare {
  department: string;
  percentage: number;
  monthly_amount_aoa: number;
}

export interface EnterpriseGroupStructure {
  holding_id: string;
  holding_name: string;
  subsidiary_companies: {
    company_id: string;
    company_name: string;
    tenant_id: string;
    isolated_legal_entity: boolean;
  }[];
}

export interface DWOSGlobalSummary {
  organization_id: string;
  coverage_blueprint: OrganizationCoverageBlueprint;
  active_capacity_allocations: number;
  queue_summary: EnterpriseWorkQueueSummary;
  risk_budget: OrganizationRiskBudget;
  responsibility_matrix_size: number;
  group_structure: EnterpriseGroupStructure;
  updated_at: string;
}
