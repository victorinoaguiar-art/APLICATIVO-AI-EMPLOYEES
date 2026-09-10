export type AutomationCandidateStatus =
  | 'AUTOMATION_CANDIDATE'
  | 'AI_ASSISTANCE_CANDIDATE'
  | 'HUMAN_ONLY'
  | 'UNSAFE_TO_AUTOMATE'
  | 'INSUFFICIENT_EVIDENCE';

export type MatchType =
  | 'DIRECT_MATCH'
  | 'TEAM_MATCH'
  | 'DEPARTMENT_MATCH'
  | 'PARTIAL_MATCH'
  | 'NO_SAFE_MATCH';

export type BusinessCaseStatus =
  | 'DRAFT'
  | 'ESTIMATED'
  | 'VALIDATED_WITH_CLIENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export type DigitalWorkforceInstanceStatus =
  | 'ACTIVE'
  | 'WORKING'
  | 'WAITING_DATA'
  | 'WAITING_APPROVAL'
  | 'PAUSED'
  | 'DEGRADED'
  | 'SUSPENDED'
  | 'PAUSED_GLOBAL';

export type ValueEventType =
  | 'TASK_COMPLETED'
  | 'DOCUMENT_CREATED'
  | 'ERROR_AVOIDED'
  | 'MANUAL_STEP_REMOVED'
  | 'TIME_REDUCED'
  | 'REWORK_REDUCED'
  | 'CYCLE_TIME_REDUCED'
  | 'APPROVAL_ACCELERATED'
  | 'REVENUE_SUPPORTED'
  | 'COLLECTION_ACCELERATED'
  | 'COMPLIANCE_TASK_COMPLETED';

export type MeasurementType = 'MEASURED' | 'ESTIMATED' | 'ASSUMED';

export type ROIStatus = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'INSUFFICIENT_DATA';

export type UpsellType =
  | 'ADD_EMPLOYEE'
  | 'ADD_SECOND_INSTANCE'
  | 'CREATE_TEAM'
  | 'CREATE_DEPARTMENT'
  | 'UPGRADE_PLAN'
  | 'ADD_CONNECTOR'
  | 'ADD_INDUSTRY_PACK'
  | 'ADD_JURISDICTION_PACK';

export interface ProcessSignal {
  signal_id: string;
  organization_id: string;
  source_type: string;
  source_ref: string;
  process_candidate: string;
  task_pattern: string;
  frequency: string;
  volume: number;
  manual_touchpoints: number;
  waiting_time_hours: number;
  error_signals: number;
  handoff_count: number;
  estimated_effort_hours: number;
  confidence: number;
  created_at: string;
}

export interface ProcessCandidate {
  process_candidate_id: string;
  organization_id: string;
  name: string;
  description: string;
  department: string;
  frequency: string;
  volume: number;
  systems: string[];
  documents: string[];
  actors: string[];
  steps: string[];
  approvals: string[];
  risk: 'R1' | 'R2' | 'R3' | 'R4';
  estimated_manual_effort_hours_monthly: number;
  error_rate_estimate_pct: number;
  business_impact: 'HIGH' | 'MEDIUM' | 'LOW';
  automation_candidate_status: AutomationCandidateStatus;
  friction_score: number;
}

export interface EmployeeOpportunityMatch {
  match_id: string;
  process_candidate_id: string;
  employee_id: number;
  role_key: string;
  fit_score: number;
  fit_reasons: string[];
  missing_capabilities: string[];
  required_connectors: string[];
  required_configuration: string[];
  risk: 'R1' | 'R2' | 'R3' | 'R4';
  estimated_supervision: string;
  commercial_eligibility: boolean;
  match_type: MatchType;
}

export interface EmployeeOpportunityBusinessCase {
  business_case_id: string;
  process_candidate_id: string;
  recommended_employee_id: number;
  current_process_cost_usd: number;
  estimated_manual_hours_monthly: number;
  current_cycle_time_hours: number;
  current_error_rework_pct: number;
  expected_ai_task_volume_monthly: number;
  expected_review_effort_hours_monthly: number;
  estimated_subscription_cost_usd: number;
  estimated_usage_cost_usd: number;
  estimated_connector_cost_usd: number;
  estimated_human_review_cost_usd: number;
  estimated_savings_usd_monthly: number;
  estimated_time_reduction_pct: number;
  estimated_payback_months: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: BusinessCaseStatus;
  assumptions: string[];
}

export interface DigitalWorkforceInstance {
  instance_id: string;
  organization_id: string;
  department: string;
  employee_id: number;
  role_key: string;
  display_name: string;
  supervisor_user_ref: string;
  autonomy_level: string;
  risk_level: string;
  status: DigitalWorkforceInstanceStatus;
  current_task?: string;
  reliability_score: number;
  monthly_cost_usd: number;
  tasks_completed_count: number;
  created_at: string;
}

export interface ValueEvent {
  event_id: string;
  timestamp: string;
  employee_instance_id: string;
  tenant_id: string;
  organization_id: string;
  type: ValueEventType;
  measurement_type: MeasurementType;
  amount_usd: number;
  time_saved_hours: number;
  details: string;
}

export interface EmployeeValuePassport {
  passport_id: string;
  employee_instance_id: string;
  period: string;
  tasks_completed: number;
  accepted_outputs: number;
  first_pass_acceptance_pct: number;
  human_review_hours: number;
  total_cost_usd: number;
  estimated_savings_usd: number;
  roi_status: ROIStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  limitations: string[];
}

export interface NextBestEmployeeRecommendation {
  recommendation_id: string;
  organization_id: string;
  recommended_employee_id: number;
  role_key: string;
  display_name: string;
  reason: string;
  process_opportunity: string;
  expected_value_usd_monthly: number;
  required_setup: string[];
  risk: 'R1' | 'R2' | 'R3' | 'R4';
  commercial_cost_usd_monthly: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  upsell_type: UpsellType;
  status: 'PENDING_REVIEW' | 'PILOT_APPROVED' | 'HIRED' | 'REJECTED';
}

export interface ResponsibilityMap {
  process_name: string;
  human_owner: string;
  responsibilities: Array<{
    task: string;
    type: 'HUMAN_ONLY' | 'AI_PREPARES' | 'AI_RECOMMENDS' | 'AI_EXECUTES_WITH_APPROVAL' | 'AI_EXECUTES_WITHIN_LIMITS' | 'AI_MONITORS';
    assigned_actor: string;
  }>;
}

export interface AWDSEGlobalSummary {
  total_process_signals: number;
  qualified_process_candidates: number;
  active_digital_workforce_count: number;
  paused_digital_workforce_count: number;
  global_pause_active: boolean;
  total_measured_value_usd: number;
  total_estimated_time_saved_hours: number;
  pending_expansion_recommendations_count: number;
}
