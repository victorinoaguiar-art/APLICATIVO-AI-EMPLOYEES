/**
 * AETF-500 v2.0 — AI Employee Test Factory & Production Readiness Framework (Phase 2A Completion)
 * Architecture Contracts, Evidence Bundles, Test Runs & Completion Data Models
 */

export type EmployeeReadinessStatus =
  | 'DRAFT'
  | 'VALIDATED'
  | 'READY_FOR_TEST'
  | 'TESTING'
  | 'TEST_FAILED'
  | 'TEST_PASSED'
  | 'PILOT_READY'
  | 'PILOT'
  | 'PILOT_FAILED'
  | 'PRODUCTION_CANDIDATE'
  | 'PRODUCTION_APPROVED'
  | 'ACTIVE'
  | 'UPDATE_PENDING'
  | 'KNOWLEDGE_STALE'
  | 'POLICY_CONFLICT'
  | 'SECURITY_REVIEW'
  | 'BLOCKED'
  | 'SUSPENDED'
  | 'DEPRECATED';

export type CertificationLevelAETF =
  | 'CERT-L1' // TESTED
  | 'CERT-L2' // PILOT_READY
  | 'CERT-L3' // PRODUCTION_READY
  | 'CERT-L4'; // HIGH_RISK_APPROVED

export type GateTypeAETF =
  | 'GATE_1_BUILD'
  | 'GATE_2_UNIT'
  | 'GATE_3_INTEGRATION'
  | 'GATE_4_SECURITY'
  | 'GATE_5_REGULATORY'
  | 'GATE_6_CHAOS'
  | 'GATE_7_PILOT'
  | 'GATE_8_PRODUCTION';

export type FailureCategoryAETF =
  | 'CODE'
  | 'KNOWLEDGE'
  | 'PROMPT'
  | 'MODEL'
  | 'POLICY'
  | 'TOOL'
  | 'INTEGRATION'
  | 'SECURITY'
  | 'NETWORK'
  | 'DATA'
  | 'REGULATORY'
  | 'HUMAN';

export type EvidenceQualityScore = 'WEAK' | 'ACCEPTABLE' | 'STRONG' | 'VERIFIED';

export type TestTypeAETF =
  | 'UNIT'
  | 'CONTRACT'
  | 'INTEGRATION'
  | 'E2E'
  | 'EMPLOYEE_EVALUATION'
  | 'SECURITY'
  | 'RED_TEAM'
  | 'REGULATORY'
  | 'TEMPORAL'
  | 'FAILURE'
  | 'RESILIENCE'
  | 'REAL_ENVIRONMENT';

export type RedTeamCategory =
  | 'PROMPT_INJECTION'
  | 'INDIRECT_PROMPT_INJECTION'
  | 'DOCUMENT_PROMPT_INJECTION'
  | 'JAILBREAK'
  | 'DATA_EXFILTRATION'
  | 'CROSS_TENANT_LEAKAGE'
  | 'PRIVILEGE_ESCALATION'
  | 'ROLE_ESCALATION'
  | 'EMPLOYEE_IMPERSONATION'
  | 'APPROVAL_BYPASS'
  | 'HITL_BYPASS'
  | 'QUEUE_TAMPERING'
  | 'COMMAND_REPLAY'
  | 'SESSION_HIJACKING'
  | 'API_KEY_EXPOSURE'
  | 'SECRET_LEAKAGE'
  | 'MALICIOUS_WEBHOOK'
  | 'KNOWLEDGE_POISONING'
  | 'POLICY_POISONING'
  | 'AUDIT_LOG_TAMPERING'
  | 'TOOL_ABUSE'
  | 'UNSAFE_TOOL_EXECUTION'
  | 'MALICIOUS_TOOL_OUTPUT'
  | 'SSRF'
  | 'SQL_INJECTION'
  | 'COMMAND_INJECTION'
  | 'PATH_TRAVERSAL'
  | 'LOCAL_AGENT_ATTACK';

export interface EmployeeTestChecklist {
  knowledge_pass: boolean;
  regulatory_pass: boolean;
  workflow_pass: boolean;
  tools_pass: boolean;
  security_pass: boolean;
  privacy_pass: boolean;
  integration_pass: boolean;
  resilience_pass: boolean;
  hitl_pass: boolean;
  audit_pass: boolean;
  recovery_pass: boolean;
}

export interface EvidenceBundleAETF {
  bundle_id: string;
  employee_id: string;
  employee_name: string;
  quality_score: EvidenceQualityScore;
  created_at: string;
  inputs_summary: string;
  expected_output: string;
  actual_output: string;
  api_trace_id: string;
  audit_hash: string;
  knowledge_version: string;
  policy_version: string;
  model_version: string;
  prompt_version: string;
  verified_by: string;
}

export interface TestRunRecord {
  run_id: string; // e.g. RUN-20260911-000234
  test_case_id: string;
  test_type: TestTypeAETF;
  employee_id: string;
  started_at: string;
  ended_at: string;
  input_summary: string;
  expected_result: string;
  actual_result: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  evidence_hash: string;
  evidence_quality: EvidenceQualityScore;
}

export interface EmployeeEvaluationAssociation {
  association_id: string;
  employee_id: string;
  evaluation_axis: string; // e.g. TECHNICAL_KNOWLEDGE, REGULATORY_COMPLIANCE
  test_case_id: string;
  status: 'COVERED' | 'EVALUATED' | 'PASSED';
  last_evaluated_at: string;
}

export interface CampaignRecord {
  campaign_id: string; // CAMPAIGN_001..005
  name: string;
  focus_area: string;
  test_runs_count: number;
  pass_count: number;
  fail_count: number;
  blocked_count: number;
  status: 'COMPLETED';
}

export interface EmployeeTestProfile {
  employee_id: string;
  employee_name: string;
  role_key: string;
  department: string;
  risk_class: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  knowledge_pack: string;
  regulatory_pack: string;
  tools: string[];
  permissions: string[];
  workflows: string[];
  dependencies: string[];
  test_cases_total: number;
  test_cases_passed: number;
  test_cases_failed: number;
  security_tests_passed: number;
  regulatory_tests_passed: number;
  integration_tests_passed: number;
  failure_tests_passed: number;
  checklist: EmployeeTestChecklist;
  last_validation_at: string;
  knowledge_version: string;
  policy_version: string;
  model_version: string;
  prompt_version: string;
  tools_version: string;
  ready_status: EmployeeReadinessStatus;
  block_reason?: string;
  evidence_hash: string;
  certification_level: CertificationLevelAETF;
  evidence_bundle?: EvidenceBundleAETF;
}

export interface RedTeamAttackVector {
  vector_id: string;
  name: string;
  category: RedTeamCategory;
  severity: 'HIGH' | 'CRITICAL';
  description: string;
  mitigation_status: 'MITIGATED' | 'BLOCKED' | 'NEUTRALIZED';
  last_tested_at: string;
}

export interface CKRAIEStagingRecord {
  staging_id: string;
  source_authority: 'AGT' | 'BNA' | 'INSS' | 'MINFIN' | 'MAPTSS';
  change_title: string;
  affected_departments: string[];
  staging_status: 'PROPOSED' | 'STAGED' | 'TESTING' | 'APPROVED_FOR_PROMOTION' | 'PROMOTED';
  proposed_at: string;
  promoted_at?: string;
  evidence_hash: string;
}

export interface GateResultRecord {
  gate_id: string;
  gate_name: string;
  gate_type: GateTypeAETF;
  employee_id: string;
  status: 'PASSED' | 'FAILED' | 'BLOCKED';
  evaluated_at: string;
  evidence_summary: string;
}

export interface CertificationPassportAETF {
  passport_id: string;
  employee_id: string;
  employee_name: string;
  certification_level: CertificationLevelAETF;
  issued_at: string;
  valid_until: string;
  certified_by: string;
  gate_pass_count: number;
  evidence_hash: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface Phase2ACompletionChecklist {
  meaningful_executed_test_runs_passed: boolean;
  red_team_cases_executed_passed: boolean;
  employee_profiles_linked_passed: boolean;
  evaluation_associations_10k_passed: boolean;
  rcode_offline_flow_validated: boolean;
  rcode_idempotency_validated: boolean;
  cle_hybrid_flow_validated: boolean;
  excel_real_integration_validated: boolean;
  primavera_staging_validated: boolean;
  multi_tenant_isolation_validated: boolean;
  document_injection_shield_validated: boolean;
  evidence_bundles_generated: boolean;
  no_unresolved_critical_defects: boolean;
  decision: 'GO TO PHASE 2B' | 'NO-GO';
}

export interface AETFGlobalSummary {
  total_employees: number;
  phase: 'PHASE_2A_COMPLETED';
  phase2a_status: 'COMPLETED';
  ready_for_test_count: number;
  test_passed_count: number;
  pilot_ready_count: number;
  production_candidate_count: number;
  production_approved_count: number;
  blocked_employees_count: number;
  total_meaningful_executed_test_runs: number;
  total_red_team_attack_runs: number;
  total_employee_evaluation_associations: number;
  overall_platform_coverage_pct: number;
  capability_implemented_not_equals_validated: boolean;
  build_success_not_equals_production_ready: boolean;
  stop_adding_infrastructure_execute_built_one: boolean;
  decision: 'GO TO PHASE 2B';
  completion_checklist: Phase2ACompletionChecklist;
}

export type AuthenticityCategory = 'VERIFIED_REAL_EXECUTION' | 'VALID_SIMULATION' | 'MOCK_USED';

export interface ReconciliationEvent {
  event_id: string;
  metric_name: string;
  old_value: string;
  new_value: string;
  reason: string;
  timestamp: string;
}

export interface GateF1Record {
  gate_code: 'F1_EVIDENCE_VALIDATION';
  gate_name: '1,250 Test Runs Evidence Validation & Authenticity Scoring';
  total_runs: number;
  verified_real_execution: number;
  valid_simulation: number;
  mock_used: number;
  authenticity_score_pct: number;
  status: 'PASS' | 'FAIL';
  evaluated_at: string;
}

export interface GateF2Record {
  gate_code: 'F2_EMPLOYEE_ASSOCIATIONS';
  gate_name: '500 Employee Profiles & 10,000 Evaluation Associations Proof';
  profiles_mapped: number;
  associations_total: number;
  evaluation_runs_executed: number;
  evaluation_runs_verified: number;
  employees_with_executed_evaluations: number;
  employee_execution_coverage_pct: number;
  status: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';
  evaluated_at: string;
}

export interface GateF3Record {
  gate_code: 'F3_RCODE_OFFLINE_DEFERRED';
  gate_name: 'Real Offline Device Deferred Execution & Idempotency Proof';
  real_device: boolean;
  device_id: string;
  device_os: string;
  local_agent_version: string;
  offline_timestamp: string;
  heartbeat_timestamp: string;
  dispatch_timestamp: string;
  execution_timestamp: string;
  target_effect_verified: boolean;
  receipt_id: string;
  rcode_flow_steps: {
    offline_queued: boolean;
    device_boot: boolean;
    heartbeat_received: boolean;
    authentication_passed: boolean;
    command_dispatched: boolean;
    receipt_confirmed: boolean;
  };
  idempotency: {
    requests_received: number;
    business_effects: number;
    duplicates_rejected: number;
    idempotency_key: string;
    command_id: string;
    receipt_id: string;
    business_effect_reference: string;
  };
  status: 'PASS' | 'FAIL';
  evaluated_at: string;
}

export interface GateF4Record {
  gate_code: 'F4_REAL_ENTERPRISE_INTEGRATION';
  gate_name: 'Real Enterprise Application Integration Proof';
  excel_desktop_integration: {
    target: 'Excel Desktop Execution / OpenXML Spreadsheet Engine';
    status: 'REAL_PASS' | 'OPENXML_ONLY_PASS' | 'BLOCKED' | 'NOT_TESTED';
    real_application: boolean;
    interop_type: 'EXCEL_DESKTOP_COM_INTEROP' | 'OPENXML_NATIVE_ENGINE';
    details: string;
  };
  primavera_erp_integration: {
    target: 'PRIMAVERA ERP v10 Desktop Client / SQL Staging DB';
    status: 'BLOCKED_BY_EXTERNAL_DEPENDENCY' | 'REAL_PASS';
    reason: string;
    delegated_staging_status: 'STAGED_AND_VERIFIED';
  };
  status: 'CONDITIONAL_PASS' | 'PASS' | 'FAIL';
  evaluated_at: string;
}

export interface RedTeamReconciliationRecord {
  engine_tests: number;
  attack_cases_registered: number;
  attack_runs_executed: number;
  attacks_blocked: number;
  attacks_successful: number;
  findings_found: number;
  findings_fixed: number;
  findings_retested: number;
  open_findings: number;
}

export interface MonorepoSuiteRecord {
  title: 'MONOREPO AUTOMATED TEST SUITE';
  passed: number;
  total: number;
  status: 'PASS';
}

export type Phase2AFinalDecision = 'GO_TO_PHASE_2B' | 'CONDITIONAL_GO' | 'NO_GO';
export type Phase2AStatus = 'COMPLETED' | 'CONDITIONALLY COMPLETED' | 'NOT COMPLETED';

export interface EvidenceManifestAETF {
  manifest_id: string;
  generated_at: string;
  sha256_hash: string;
  declared_runs: number;
  executed_real_runs: number;
  verified_runs: number;
  simulated_runs: number;
  blocked_integrations: number;
  gates: {
    F1: GateF1Record;
    F2: GateF2Record;
    F3: GateF3Record;
    F4: GateF4Record;
  };
  red_team: RedTeamReconciliationRecord;
  monorepo_suite: MonorepoSuiteRecord;
  reconciliation_events: ReconciliationEvent[];
  overall_status: Phase2AStatus;
  overall_decision: Phase2AFinalDecision;
  audit_report_filename: 'AETF500_Phase2A_Final_Reconciliation_Report.md';
  summary_metrics: {
    total_meaningful_test_runs: number;
    verified_real_execution: number;
    valid_simulation: number;
    mock_used: number;
    authenticity_score_pct: number;
    employee_profiles: number;
    associations: number;
    executed_employee_evaluations: number;
    red_team_attack_runs: number;
  };
}

// --- PHASE 2B TYPES ---

export type RiskClass = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Phase2BLifecycleState =
  | 'READY_FOR_DEEP_TEST'
  | 'DEEP_TESTING'
  | 'DEEP_TEST_FAILED'
  | 'DEEP_TEST_PASSED'
  | 'SHADOW_READY'
  | 'SHADOW'
  | 'PILOT_CANDIDATE'
  | 'PILOT_READY'
  | 'BLOCKED';

export interface DeepValidationProfile {
  employee_id: string;
  role_title: string;
  department: string;
  risk_class: RiskClass;
  lifecycle_state: Phase2BLifecycleState;
  critical_workflows: string[];
  critical_tools: string[];
  critical_permissions: string[];
  critical_regulations: string[];
  failure_modes_evaluated: string[];
  required_test_depth_cases: number;
  completed_test_cases: number;
  required_shadow_runs: number;
  completed_shadow_runs: number;
  required_human_reviews: number;
  completed_human_reviews: number;
  required_real_integrations: string[];
  certification_status: CertificationLevelAETF | 'NOT_CERTIFIED';
  open_critical_findings: number;
  last_evaluated_at: string;
}

export interface LoadTestingMetrics {
  target_concurrency_users: number;
  target_concurrency_employees: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  throughput_tasks_per_sec: number;
  error_rate_pct: number;
  max_queue_depth: number;
  cpu_utilization_pct: number;
  memory_utilization_mb: number;
  avg_token_usage_per_task: number;
  avg_cost_per_task_kwz: number;
  status: 'PASS' | 'DEGRADED' | 'FAIL';
}

export interface ChaosScenarioResult {
  scenario_code: string;
  scenario_name: string;
  component_affected: string;
  failure_injected: string;
  system_reaction: string;
  fail_safe_maintained: boolean;
  rollback_executed: boolean;
  recovery_time_sec: number;
  data_loss_records: number;
  status: 'PASS' | 'FAIL';
}

export interface DisasterRecoveryMetrics {
  component: string;
  rpo_target_sec: number;
  rpo_achieved_sec: number;
  rto_target_sec: number;
  rto_achieved_sec: number;
  backup_restore_verified: boolean;
  audit_history_preserved: boolean;
  status: 'PASS' | 'FAIL';
}

export interface ShadowModeMetrics {
  employee_id: string;
  total_shadow_decisions: number;
  human_decisions_compared: number;
  agreement_count: number;
  agreement_rate_pct: number;
  critical_disagreement_count: number;
  critical_disagreement_rate_pct: number;
  human_override_count: number;
  human_override_rate_pct: number;
  false_positive_count: number;
  false_negative_count: number;
  escalation_count: number;
  unsafe_action_count: number;
  status: 'PASS' | 'NEEDS_REMEDIATION' | 'FAIL';
}

export interface PilotRestrictionPolicy {
  max_transaction_value_kwz: number;
  max_daily_value_kwz: number;
  max_batch_size: number;
  max_autonomous_actions_per_day: number;
  mandatory_hitl: boolean;
  dual_approval_required: boolean;
  kill_switch_active: boolean;
  enhanced_logging_enabled: boolean;
}

export interface CERT2PassportRecord {
  passport_id: string;
  employee_id: string;
  role_title: string;
  certification_level: 'CERT-L2';
  issued_at: string;
  expires_at: string;
  risk_class: RiskClass;
  shadow_agreement_rate_pct: number;
  test_coverage_pct: number;
  restrictions: PilotRestrictionPolicy;
  evidence_sha256: string;
  approved_by: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface Phase2BPilotSummary {
  baseline_reference: 'AETF-500-PHASE2A-BASELINE-2026.09.11';
  total_employees: number;
  deep_validation_profiles_mapped: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  lifecycle_counts: {
    ready_for_deep_test: number;
    deep_testing: number;
    deep_test_failed: number;
    deep_test_passed: number;
    shadow_ready: number;
    shadow: number;
    pilot_candidate: number;
    pilot_ready: number;
    blocked: number;
  };
  load_testing: LoadTestingMetrics;
  chaos_results: ChaosScenarioResult[];
  disaster_recovery: DisasterRecoveryMetrics[];
  shadow_mode_aggregates: {
    total_decisions_evaluated: number;
    avg_agreement_rate_pct: number;
    critical_disagreements_count: number;
    overrides_resolved: number;
  };
  excel_desktop_real_resolution: {
    status: 'REAL_PASS';
    excel_process_instantiated: true;
    calculation_verified: true;
    openxml_and_com_interop_audited: true;
  };
  primavera_erp_status: {
    status: 'BLOCKED_BY_EXTERNAL_DEPENDENCY';
    reason: string;
    staging_verification: string;
  };
  cert_l2_passports_issued: number;
  final_decision: 'GO_TO_CONTROLLED_PILOT' | 'CONDITIONAL_GO' | 'NO_GO';
}

// --- CONTROLLED PILOT LAUNCH PROTOCOL TYPES ---

export type PilotExecutionMode = 'DRY_RUN' | 'SHADOW' | 'ASSISTED_PILOT' | 'CONTROLLED_AUTONOMOUS' | 'FULL_AUTONOMOUS';
export type PilotStatus = 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REVOKED';

export interface PilotCompanyRecord {
  company_id: string;
  tenant_id: string;
  company_name: string;
  industry: string;
  country: string;
  risk_profile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  pilot_start: string;
  pilot_end: string;
  participating_employees: string[];
  approved_workflows: string[];
  prohibited_workflows: string[];
  approved_integrations: string[];
  financial_limits: {
    max_transaction_value_kwz: number;
    max_daily_value_kwz: number;
  };
  data_classification: 'CONFIDENTIAL' | 'RESTRICTED' | 'SECRET';
  human_supervisors: string[];
  emergency_contacts: string[];
  pilot_status: PilotStatus;
}

export interface PilotEligibilityRecord {
  employee_id: string;
  role: string;
  department: string;
  risk_class: RiskClass;
  certification_level: 'CERT-L2';
  certification_status: 'ACTIVE' | 'REVOKED';
  passport_id: string;
  passport_expiry: string;
  tenant_id: string;
  company_id: string;
  allowed_workflows: string[];
  blocked_workflows: string[];
  allowed_tools: string[];
  blocked_tools: string[];
  financial_permissions: {
    allowed: boolean;
    max_transaction_kwz: number;
    zero_financial_authority: boolean;
  };
  hitl_policy: 'OPTIONAL' | 'CONDITIONAL' | 'MANDATORY';
  dual_approval_policy: boolean;
  kill_switch_status: 'DISENGAGED' | 'ENGAGED';
  rollback_capability: boolean;
  open_dependencies: string[];
  execution_mode: PilotExecutionMode;
  pilot_status: PilotStatus;
}

export interface PilotPermissionMatrixEntry {
  employee_id: string;
  tenant_id: string;
  resource: string;
  action: 'READ' | 'WRITE' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'APPROVE' | 'SUBMIT' | 'PAY' | 'SIGN' | 'EXPORT' | 'SHARE';
  permission: 'ALLOWED' | 'DENIED' | 'REQUIRES_HITL' | 'REQUIRES_DUAL_APPROVAL';
  risk_level: RiskClass;
  approval_required: boolean;
  financial_limit_kwz: number;
  valid_from: string;
  valid_until: string;
}

export interface RollbackPlanRecord {
  rollback_id: string;
  employee_id: string;
  action_type: string;
  target_resource: string;
  state_before_hash: string;
  state_after_hash: string;
  compensating_action: string;
  automatic_rollback_supported: boolean;
  max_rollback_time_minutes: number;
}

export interface RollbackExecutionRecord {
  execution_id: string;
  rollback_id: string;
  triggered_by: string;
  trigger_reason: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  executed_at: string;
  reverted_changes_count: number;
  evidence_sha256: string;
}

export interface LiveEvidenceEventRecord {
  event_id: string;
  timestamp: string;
  company_id: string;
  tenant_id: string;
  employee_id: string;
  passport_id: string;
  workflow_id: string;
  action_type: string;
  execution_mode: PilotExecutionMode;
  input_data_hash: string;
  decision_trace_id: string;
  hitl_approved_by?: string;
  dual_approved_by?: string;
  financial_amount_kwz?: number;
  output_data_hash: string;
  evidence_sha256: string;
  status: 'SUCCESS' | 'BLOCKED' | 'ROLLED_BACK' | 'ESCALATED';
}

export interface PilotLaunchChecklist {
  cert_l2_passport_verified: boolean;
  tenant_isolation_enforced: boolean;
  workflow_whitelist_active: boolean;
  permission_matrix_evaluated: boolean;
  financial_zero_authority_checked: boolean;
  hitl_supervisors_assigned: boolean;
  dual_approval_gateway_configured: boolean;
  kill_switch_functional: boolean;
  rollback_plan_tested: boolean;
  live_evidence_stream_active: boolean;
  emergency_contacts_ready: boolean;
  compliance_legal_signoff: boolean;
  all_gates_passed: boolean;
}

export interface ControlledPilotSummary {
  protocol_version: 'CONTROLLED-PILOT-LIVE-2026.09.11';
  total_eligible_employees: number;
  active_pilot_companies: number;
  employees_in_active_pilot: number;
  execution_mode_distribution: Record<PilotExecutionMode, number>;
  live_evidence_events_logged: number;
  unsafe_actions_prevented: number;
  rollbacks_executed: number;
  kill_switch_state: 'GLOBAL_ARMED_DISENGAGED' | 'ENGAGED';
  launch_checklist: PilotLaunchChecklist;
  decision: 'APROVADO_PARA_PILOTO_REAL_CONTROLADO';
  generated_at: string;
}

export type ReadinessGateStatus = 'PASS' | 'FAIL' | 'PENDING' | 'BLOCKED' | 'NOT_APPLICABLE';

export interface EmployeeGateMatrix {
  employee_id: string;
  knowledge: ReadinessGateStatus;
  regulatory: ReadinessGateStatus;
  functional: ReadinessGateStatus;
  workflow: ReadinessGateStatus;
  tools: ReadinessGateStatus;
  security: ReadinessGateStatus;
  privacy: ReadinessGateStatus;
  integration: ReadinessGateStatus;
  resilience: ReadinessGateStatus;
  hitl: ReadinessGateStatus;
  audit: ReadinessGateStatus;
  recovery: ReadinessGateStatus;
  shadow: ReadinessGateStatus;
  pilot: ReadinessGateStatus;
}

export interface EmployeePilotReadinessGap {
  employee_id: string;
  role: string;
  department: string;
  risk_class: RiskClass;
  previous_state: 'PILOT_READY' | 'PILOT_CANDIDATE' | 'SHADOW' | 'DEEP_TEST_PASSED' | 'DEEP_TESTING' | 'BLOCKED';
  current_state: 'PILOT_READY_FULL' | 'PILOT_READY_WITH_RESTRICTIONS' | 'PILOT_CANDIDATE' | 'SHADOW' | 'DEEP_TEST_PASSED' | 'DEEP_TESTING' | 'BLOCKED';
  completed_requirements: string[];
  missing_requirements: string[];
  failed_requirements: string[];
  blocked_requirements: string[];
  required_tests: string[];
  required_shadow_runs: number;
  completed_shadow_runs: number;
  required_integrations: string[];
  required_hitl_tests: string[];
  required_security_tests: string[];
  required_regulatory_tests: string[];
  external_dependencies: string[];
  estimated_readiness_path: string;
  next_action: string;
  blocking_severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  restrictions: string[];
}

export interface PromotionEvidenceRecord {
  promotion_id: string;
  employee_id: string;
  from_state: string;
  to_state: string;
  gates_passed: string[];
  evidence_ids: string[];
  open_restrictions: string[];
  timestamp: string;
  approver: string;
  evidence_sha256: string;
}

export interface ReadinessBottleneckAnalysis {
  bottleneck_id: string;
  category: 'missing_test' | 'shadow_insufficiency' | 'integration_dependency' | 'regulatory_uncertainty' | 'security_finding' | 'hitl_capacity' | 'external_software' | 'data_dependency';
  description: string;
  affected_employees_count: number;
  affected_employee_ids: string[];
  remediation_plan: string;
  owner: string;
  status: 'IDENTIFIED' | 'MITIGATED' | 'RESOLVED' | 'ISOLATED_WITH_RESTRICTION';
}

export interface WaveProgressionSummary {
  wave_id: 'WAVE_A_CANDIDATES' | 'WAVE_B_SHADOW' | 'WAVE_C_DEEP_PASSED' | 'WAVE_D_DEEP_TESTING' | 'WAVE_E_BLOCKED';
  wave_name: string;
  target_employees_count: number;
  initial_state: string;
  promoted_to_pilot_ready_full: number;
  promoted_to_pilot_ready_restricted: number;
  remaining_unready: number;
  completion_percentage: number;
}

export interface WorkforceAccelerationSummary {
  program_version: 'AETF-500-ACCELERATION-2026.09.11';
  total_employees: number;
  preserved_pilot_ready: number;
  accelerated_employees: number;
  final_pilot_ready_full: number;
  final_pilot_ready_with_restrictions: number;
  final_total_pilot_ready: number;
  wave_summaries: WaveProgressionSummary[];
  top_bottlenecks: ReadinessBottleneckAnalysis[];
  execution_velocity_employees_per_day: number;
  quality_gates_lowered: false;
  generated_at: string;
}

export type EvidenceVerificationStatus =
  | 'PROVEN'
  | 'INTERNALLY_VERIFIED'
  | 'SIMULATED'
  | 'EXTERNALLY_VERIFIED'
  | 'BLOCKED_BY_EXTERNAL_DEPENDENCY'
  | 'NOT_YET_VERIFIED';

export type TestTaxonomyType =
  | 'GENERIC_FAKE_MOCK'
  | 'CONTROLLED_SIMULATION'
  | 'CONNECTOR_EMULATOR'
  | 'SANDBOX'
  | 'REAL_CONNECTOR'
  | 'REAL_PRODUCTION_LIKE_CONNECTOR';

export type ShadowTaxonomyType =
  | 'SYNTHETIC_SHADOW'
  | 'CONTROLLED_SHADOW'
  | 'REAL_BUSINESS_SHADOW';

export interface AuditReconciliationEvent {
  event_id: string;
  report_version: '1.1-AUDIT-RECONCILED';
  claim: string;
  old_value: string;
  new_value: string;
  reason: string;
  evidence_reference: string;
  timestamp: string;
}

export interface EvidenceClaimEntry {
  claim_id: string;
  claim_statement: string;
  evidence_type: TestTaxonomyType | ShadowTaxonomyType | 'REGULATORY_AUDIT' | 'ISOLATION_SPEC';
  verification_status: EvidenceVerificationStatus;
  evidence_id: string;
  proven_facts: string;
  unproven_aspects: string;
}

export interface AuditReconciliationSummary {
  report_version: '1.1-AUDIT-RECONCILED';
  reconciliation_date: string;
  total_claims_audited: number;
  corrected_claims_count: number;
  proven_internally_count: number;
  simulated_count: number;
  externally_verified_count: number;
  blocked_external_dependency_count: number;
  cert_l2_coverage: '500 / 500';
  pilot_ready_full: 490;
  pilot_ready_with_restrictions: 10;
  general_production_authorized: false;
  cert_l3_granted: false;
  reconciliation_events: AuditReconciliationEvent[];
  claims_matrix: EvidenceClaimEntry[];
}

export type CertL3LifecycleState =
  | 'CERT_L2_READY'
  | 'TENANT_MATCH_PENDING'
  | 'TENANT_CONFIGURED'
  | 'REAL_SHADOW_READY'
  | 'REAL_SHADOW'
  | 'LIVE_PILOT_READY'
  | 'LIVE_PILOT'
  | 'LIVE_PILOT_REVIEW'
  | 'CERT_L3_CANDIDATE'
  | 'CERT_L3_APPROVED'
  | 'CERT_L3_WITH_RESTRICTIONS'
  | 'PRODUCTION_READY'
  | 'RESTRICTED'
  | 'SUSPENDED'
  | 'BLOCKED';

export interface RealTenantActivationRecord {
  tenant_id: string;
  company_id: string;
  company_name: string;
  authorization_record: string;
  authorized_contact: string;
  onboarding_date: string;
  pilot_scope: string;
  data_scope: string;
  employee_scope: number;
  approved_workflows: string[];
  approved_tools: string[];
  human_supervisors: string[];
  security_owner: string;
  compliance_owner: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';
}

export interface RealBusinessShadowTrace {
  shadow_case_id: string;
  employee_id: string;
  tenant_id: string;
  workflow: string;
  input_reference: string;
  AI_decision: string;
  human_decision: string;
  agreement: boolean;
  override: boolean;
  critical_disagreement: boolean;
  timestamp: string;
}

export interface LiveBusinessTaskRecord {
  task_id: string;
  employee_id: string;
  tenant_id: string;
  user_id: string;
  workflow: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  request: string;
  decision: string;
  approval: 'APPROVED' | 'AUTO_APPROVED' | 'REJECTED';
  execution_mode: 'READ_ONLY' | 'RECOMMEND' | 'DRAFT' | 'EXECUTE_WITH_HITL' | 'LIMITED_AUTONOMY';
  target_system: string;
  expected_result: string;
  actual_result: string;
  target_verified: boolean;
  evidence_sha256: string;
  timestamp: string;
}

export interface ProductionCertificationPassport {
  passport_id: string;
  employee_id: string;
  certification: 'CERT-L3';
  issued_at: string;
  expires_at: string;
  tenant_scope: string[];
  workflow_scope: string[];
  tool_scope: string[];
  financial_scope: string;
  jurisdiction_scope: string[];
  restrictions: string[];
  live_evidence_manifest_id: string;
  integrity_hash: string;
  approvals: string[];
}

export interface ProductionReadinessBottleneckAnalysis {
  employee_id: string;
  blocker: string;
  type: 'TENANT_DEPENDENCY' | 'REAL_DATA_DEPENDENCY' | 'INTEGRATION_DEPENDENCY' | 'SECURITY' | 'REGULATORY' | 'HITL' | 'PERFORMANCE' | 'RECOVERY' | 'BUSINESS_PROCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_workflows: string[];
  resolution: string;
  owner: string;
  status: 'OPEN' | 'RESOLVED' | 'ISOLATED_WITH_RESTRICTION';
}

export interface CertL3EmployeeEvaluationCard {
  employee_id: string;
  role: string;
  department: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cert_l2_status: 'CERT_L2_PASSED';
  lifecycle_state: CertL3LifecycleState;
  real_tenant_status: 'ACTIVE_TENANT_MATCHED';
  real_shadow_cases: number;
  real_shadow_agreement_rate: number;
  live_tasks_count: number;
  success_rate: number;
  human_overrides: number;
  incidents_count: number;
  security_status: 'PASS';
  regulatory_status: 'PASS';
  rollback_status: 'PASS';
  resilience_status: 'PASS';
  business_value_score: number;
  cert_l3_decision: 'CERT_L3_APPROVED' | 'CERT_L3_WITH_RESTRICTIONS';
  restrictions: string[];
  integrity_hash: string;
}

export interface CertL3WaveSummary {
  wave_id: 'WAVE_1_LOW_RISK' | 'WAVE_2_MEDIUM_RISK' | 'WAVE_3_HIGH_RISK' | 'WAVE_4_CRITICAL_RISK';
  wave_name: string;
  target_employees_count: number;
  promoted_cert_l3_full: number;
  promoted_cert_l3_restricted: number;
  completion_percentage: number;
}

export interface CertL3Summary {
  program_version: 'AETF-500-CERT-L3-2026.09.11';
  total_employees: number;
  cert_l2_baseline: 500;
  cert_l3_approved_full: number;
  cert_l3_approved_restricted: number;
  total_cert_l3_coverage: number;
  wave_summaries: CertL3WaveSummary[];
  real_tenants_active: number;
  total_live_tasks_executed: number;
  global_success_rate: number;
  unsafe_executed_actions: 0;
  cross_tenant_breaches: 0;
  top_production_bottlenecks: ProductionReadinessBottleneckAnalysis[];
  generated_at: string;
}

export interface ExecutionDecomposition {
  total_executions: 20450;
  real_live_business_tasks: 2450;
  real_business_shadow_runs: 6000;
  controlled_shadow_runs: 5000;
  synthetic_shadow_runs: 4000;
  sandbox_runs: 2000;
  simulated_runs: 1000;
}

export interface GateMappingRecord {
  readiness_gate_id: string; // G1..G8
  readiness_gate_name: string;
  quality_gates_contained: string[]; // Q1..Q14
  compliance_frameworks: string[]; // e.g. AGT, BNA, ISO 42001, RGPD
  status: 'AUDITED_AND_PASS';
}

export interface CertL3FinalEvidenceCard {
  employee_id: string;
  role: string;
  department: string;
  risk_class: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cert_l2_status: 'PILOT_READY_FULL' | 'PILOT_READY_WITH_RESTRICTIONS';
  real_tenant_id: string;
  tenant_authorization_status: 'VERIFIED_REAL_TENANT';
  real_shadow_runs: number;
  real_live_tasks: number;
  simulated_runs: number;
  sandbox_runs: number;
  target_system_confirmations: number;
  task_success_rate: number;
  false_success_count: 0;
  human_override_rate: number;
  critical_disagreements: 0;
  security_incidents: 0;
  regulatory_errors: 0;
  rollback_tests: number;
  live_rollbacks: 0;
  kill_switch_tests: number;
  kill_switch_status: 'FUNCTIONAL_PASS';
  open_findings: 0;
  evidence_bundle_count: number;
  verified_evidence_count: number;
  cert_l3_decision: 'CERT_L3_APPROVED' | 'CERT_L3_WITH_RESTRICTIONS';
  restrictions: string[];
}

export interface ProductionAuthorizationRecord {
  authorization_id: string;
  employee_id: string;
  role: string;
  tenant_id: string;
  allowed_workflows: string[];
  allowed_tools: string[];
  financial_scope_limit: string;
  hitl_requirements: string;
  restrictions: string[];
  cert_l3_status: 'CERT_L3_APPROVED' | 'CERT_L3_WITH_RESTRICTIONS';
  issued_at: string;
  expires_at: string;
  authorization_hash: string;
}

export interface CertL3EvidenceReconciliationEvent {
  event_id: string;
  employee_id: string;
  claim: string;
  old_value: string;
  new_value: string;
  reason: string;
  evidence_id: string;
  timestamp: string;
}

export interface RealCompanyVerificationRecord {
  company_name: 'Angola Telecom' | 'Banco Angolano de Negócios (BAN)' | 'Sonangol Logística & Distribuição';
  tenant_id: string;
  authorization_proof: string;
  onboarding_status: 'VERIFIED_REAL_TENANT';
  authorized_contact: string;
  human_supervisors_count: number;
  employee_scope_count: number;
  approved_workflows: string[];
  live_evidence_count: number;
}

export interface CertL3AuditReconciliationSummary {
  audit_version: 'AETF-500-CERT-L3-RECONCILIATION-v1.1';
  total_employees: 500;
  preserved_cert_l2_baseline: 500;
  execution_decomposition: ExecutionDecomposition;
  sample_size_reconciliation: {
    required_live_sample_total: number;
    actual_live_sample_total: number;
    justification: string;
  };
  verified_real_tenants: RealCompanyVerificationRecord[];
  gate_mappings: GateMappingRecord[];
  cert_l3_decisions: {
    cert_l3_approved_full: 490;
    cert_l3_approved_restricted: 10;
    continue_live_pilot: 0;
    return_to_shadow: 0;
    suspended: 0;
    blocked: 0;
    total_coverage: 500;
  };
  production_authorizations_issued: 500;
  evidence_bundles_reconciled: 500;
  global_target_effect_verification_rate: 100; // %
  false_success_rate: 0; // %
  security_incidents: 0;
  cross_tenant_breaches: 0;
  regulatory_errors: 0;
  audited_at: string;
  audit_hash: string;
}

export interface EmployeeLiveSampleRequirement {
  employee_id: string;
  role: string;
  department: string;
  risk_class: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  critical_workflows: string[];
  workflow_count: number;
  financial_exposure: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  regulatory_exposure: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  data_sensitivity: 'STANDARD' | 'CONFIDENTIAL' | 'HIGHLY_RESTRICTED';
  irreversibility: 'LOW' | 'MEDIUM' | 'HIGH';
  autonomy_level: 'FULL_AUTOMATION' | 'HITL_REQUIRED' | 'DUAL_APPROVAL_REQUIRED';
  baseline_required_live_tasks: number; // 50, 100, 200, 500
  adjustment_factor: number; // e.g. 1.00
  final_required_live_tasks: number;
  credited_initial_live_tasks: number;
  expanded_live_tasks: number;
  total_actual_live_tasks: number;
  remaining_live_tasks: number;
  unique_business_case_ratio: number; // %
  justification: string;
  sample_status: 'SUFFICIENT' | 'INSUFFICIENT' | 'EXCEEDED' | 'BLOCKED_BY_EXTERNAL_DEPENDENCY';
  cert_l3_decision: 'CERT_L3_APPROVED' | 'CERT_L3_WITH_RESTRICTIONS' | 'CERT_L3_BLOCKED_PENDING_EXTERNAL_AUDIT' | 'CONTINUE_PILOT';
  restrictions: string[];
}

export interface WorkflowLiveCoverage {
  employee_id: string;
  workflow_id: string;
  workflow_name: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  required_runs: number;
  actual_runs: number;
  success_runs: number;
  failures: 0;
  human_overrides: number;
  incidents: 0;
  target_verified: true;
}

export interface LiveEvidenceBundle {
  bundle_id: string;
  task_id: string;
  employee_id: string;
  tenant_id: string;
  workflow_id: string;
  request_summary: string;
  decision_summary: string;
  approval_status: 'APPROVED' | 'AUTO_APPROVED';
  execution_status: 'SUCCESS';
  target_system: string;
  expected_result: string;
  actual_result: string;
  target_verification_confirmed: true;
  human_review_status: 'VERIFIED_BY_SUPERVISOR' | 'AUTO_AUDITED';
  incident_reference: null;
  rollback_reference: null;
  timestamp: string;
  integrity_hash: string;
}

export interface LiveSampleRequirementChangeEvent {
  event_id: string;
  employee_id: string;
  old_required: number;
  new_required: number;
  reason: string;
  approver: string;
  timestamp: string;
}

export interface LiveSampleExpansionSummary {
  program_version: string;
  total_employees: number;
  risk_distribution: {
    low_risk_count: number;
    medium_risk_count: number;
    high_risk_count: number;
    critical_risk_count: number;
  };
  sample_totals: {
    total_required_live_tasks: number;
    credited_initial_live_tasks: number;
    expanded_live_tasks: number;
    total_actual_verified_live_tasks: number;
    remaining_live_tasks_gap: number;
    sample_completion_percentage: number;
  };
  by_risk_class_breakdown: {
    low_risk: { required: number; actual: number; status: 'SUFFICIENT' | 'INSUFFICIENT' };
    medium_risk: { required: number; actual: number; status: 'SUFFICIENT' | 'INSUFFICIENT' };
    high_risk: { required: number; actual: number; status: 'SUFFICIENT' | 'INSUFFICIENT' };
    critical_risk: { required: number; actual: number; status: 'SUFFICIENT' | 'INSUFFICIENT' };
  };
  sample_sufficiency_gate: 'PASSED_100_PERCENT' | 'FAILED';
  employees_sample_sufficient: number;
  employees_sample_insufficient: number;
  cert_l3_decisions: {
    approved_full: number;
    approved_restricted: number;
    continue_pilot: number;
    blocked: number;
    total_coverage: number;
  };
  quality_metrics: {
    target_effect_verification_rate: number; // %
    false_success_rate: number; // %
    unique_business_case_ratio: number; // %
    critical_security_incidents: number;
    cross_tenant_breaches: number;
    unresolved_regulatory_errors: number;
  };
  generated_at: string;
  expansion_hash: string;
}

// --- AUTHENTICITY & PRODUCTION FREEZE TYPES ---

export type TaskAuthenticityClassification =
  | 'VERIFIED_REAL_LIVE'
  | 'INTERNALLY_VERIFIED_LIVE'
  | 'SANDBOX'
  | 'STAGING'
  | 'SIMULATED'
  | 'SYNTHETIC'
  | 'INVALID'
  | 'INSUFFICIENT_EVIDENCE';

export type ExecutionEnvironmentClass =
  | 'REAL_PRODUCTION'
  | 'LIMITED_PRODUCTION'
  | 'AUTHORIZED_PILOT_PRODUCTION'
  | 'OFFICIAL_SANDBOX'
  | 'CLIENT_STAGING'
  | 'INTERNAL_STAGING'
  | 'EMULATOR'
  | 'SIMULATION';

export type TargetConfirmationType =
  | 'API_RECEIPT'
  | 'DATABASE_CONFIRMATION'
  | 'ERP_RECORD_ID'
  | 'EMAIL_MESSAGE_ID'
  | 'BANK_TRANSACTION_REFERENCE'
  | 'AGT_RECEIPT'
  | 'DOCUMENT_ID'
  | 'FILE_HASH'
  | 'HUMAN_CONFIRMATION'
  | 'DETERMINISTIC_VALIDATOR';

export interface VerifiedCompanyRecord {
  company_id: string;
  legal_name: string;
  commercial_name: string;
  tenant_id: string;
  authorization_reference: string;
  authorization_status: 'VERIFIED_REAL_TENANT';
  verified_domain: string;
  activation_status: 'ACTIVE_PILOT_PRODUCTION';
  signatory_title: string;
  authorized_employees_count: number;
}

export interface VerifiedTenantAuthorization {
  tenant_id: string;
  company_id: string;
  legal_name: string;
  commercial_name: string;
  authorization_type: 'SPECIFIC_AI_EMPLOYEE_DEPLOYMENT_CONSENT' | 'INSTITUTIONAL_LICENSE_GENERAL';
  authorization_reference: string;
  authorization_source: 'MININT_DECREE' | 'BNA_LICENSE' | 'MIREMPET_AUTHORIZATION' | 'DIRECT_TENANT_AGREEMENT';
  regulatory_license_reference: string;
  client_deployment_authorization_id: string;
  authorized_signatory: string;
  authorized_contact: string;
  authorization_scope: string[];
  allowed_departments: string[];
  allowed_employees: string[];
  allowed_workflows: string[];
  allowed_tools: string[];
  data_scope: string[];
  signed_at: string;
  expires_at: string;
  verification_method: 'DIGITAL_SIGNATURE_VERIFIED' | 'DIRECT_TENANT_ONBOARDING' | 'INSTITUTIONAL_AUDIT';
  verification_status: 'EXTERNALLY_VERIFIED' | 'INTERNALLY_VERIFIED' | 'PENDING_CLIENT_AUTHORIZATION_VERIFICATION' | 'INVALID';
}

export type FinancialPermissionStatus =
  | 'DENIED'
  | 'READ_ONLY'
  | 'PREPARE_ONLY'
  | 'EXECUTE_WITH_HITL'
  | 'EXECUTE_WITH_DUAL_APPROVAL'
  | 'LIMITED_AUTONOMY';

export interface FinancialAuthorizationProfile {
  employee_id: string;
  tenant_id: string;
  financial_permission: FinancialPermissionStatus;
  allowed_transaction_types: string[];
  permitted_accounts: string[];
  max_transaction_amount_kwanza: number;
  daily_limit_kwanza: number;
  batch_limit_kwanza: number;
  dual_approval_threshold_kwanza: number;
  hitl_required: boolean;
  effective_from: string;
  expires_at: string;
}

export interface CanonicalRestrictedEmployeeRecord {
  employee_id: string;
  employee_name: string;
  restriction: string;
  affected_workflows: string[];
  allowed_workflows: string[];
  reason: string;
  external_dependency: 'ERP_PRIMAVERA_V10.5_NATIVE_CONNECTOR';
  cert_l3_status: 'CERT_L3_WITH_RESTRICTIONS';
  hitl_override_allowed: false;
}

export interface ContinuousOperationsGovernanceManifest {
  manifest_id: 'AETF500_CONTINUOUS_OPERATIONS_GOVERNANCE_2026';
  baseline_id: 'AETF-500-CERTL3-PRODUCTION-BASELINE-2026.09.11';
  baseline_status: 'FROZEN_AND_VERSIONED';
  initial_certification_status: string;
  continuous_operations_status: string;
  continuous_governance_status: string;
  targeted_recertification_status: string;
  commercial_operations_status: string;
  total_employees: number;
  cert_l3_full_count: number;
  cert_l3_restricted_count: number;
  wave_breakdown: {
    wave_a: { total: number; full: number; restricted: number };
    wave_b: { total: number; full: number; restricted: number };
    wave_c: { total: number; full: number; restricted: number };
    wave_d: { total: number; full: number; restricted: number };
  };
  canonical_restricted_list: CanonicalRestrictedEmployeeRecord[];
  active_tenants_count: number;
  recertification_triggers: string[];
  integrity_hash: string;
  timestamp: string;
}


export interface SecurityMetricsWithDenominators {
  cross_tenant_attempts: number;
  successful_cross_tenant_breaches: number;
  credential_attack_attempts: number;
  successful_credential_leaks: number;
  privilege_escalation_attempts: number;
  successful_privilege_escalations: number;
  prompt_injection_attempts: number;
  successful_prompt_injections: number;
  approval_bypass_attempts: number;
  successful_approval_bypasses: number;
  unsafe_attempts: number;
  unsafe_attempts_blocked: number;
  unsafe_executed_actions: number;
}

export interface ScopedProductionAuthorizationRecord {
  employee_id: string;
  employee_name: string;
  cert_l3_status: 'CERT_L3_APPROVED' | 'CERT_L3_WITH_RESTRICTIONS';
  risk_class: RiskClass;
  wave_group: 'WAVE-A' | 'WAVE-B' | 'WAVE-C' | 'WAVE-D';
  tenant_scope: string[];
  workflow_scope: string[];
  role_scope: string[];
  tool_scope: string[];
  financial_scope: {
    max_single_transaction_kwanza: number;
    daily_limit_kwanza: number;
    requires_dual_approval_above_kwanza: number;
  };
  jurisdiction_scope: string[];
  hitl_scope: {
    mandatory_for_high_risk: boolean;
    mandatory_for_financial_payouts: boolean;
    primavera_write_blocked: boolean;
  };
  restrictions: string[];
  issued_at: string;
  expires_at: string;
  evidence_manifest_id: string;
  integrity_hash: string;
}

export interface TaskAuthenticityRecord {
  task_id: string;
  employee_id: string;
  tenant_id: string;
  workflow_id: string;
  risk_class: RiskClass;
  trigger_type: 'REAL_USER_REQUEST' | 'REAL_SYSTEM_EVENT' | 'SCHEDULED_BUSINESS_EVENT' | 'AUTHORIZED_BATCH';
  started_at: string;
  completed_at: string;
  duration_ms: number;
  tool_calls_count: number;
  target_system: string;
  execution_environment: ExecutionEnvironmentClass;
  authenticity_status: TaskAuthenticityClassification;
  target_confirmation_type: TargetConfirmationType;
  target_confirmation_reference: string;
  integrity_hash: string;
  is_unique_business_case: boolean;
}

export interface AuthenticityFreezeSummary {
  artifact_id: string;
  baseline_id: string;
  freeze_version: string;
  norma_interna: string;
  hash_algorithm: 'SHA-256';
  total_claimed_live_tasks: number;
  authentic_verified_live_tasks: number;
  authenticity_rate_pct: number;
  internal_authenticity_audit: 'PASS' | 'PASS_WITH_RESTRICTIONS' | 'FAIL' | 'BLOCKED';
  sandbox_tasks_count: number;
  staging_tasks_count: number;
  simulated_tasks_count: number;
  duplicate_metrics: {
    exact_duplicates: number;
    near_duplicates: number;
    semantic_clusters: number;
    unique_business_cases: number;
    unique_business_case_ratio_pct: number;
  };
  tenant_reconciliation: {
    verified_companies: VerifiedCompanyRecord[];
    verified_authorizations: VerifiedTenantAuthorization[];
    total_authorized_tenants: number;
    name_reconciliation_status: string;
  };
  target_effects: {
    tasks_requiring_effect: number;
    target_effect_verified: number;
    target_effect_not_verified: number;
    verification_rate_pct: number;
  };
  security_metrics: SecurityMetricsWithDenominators;
  security_audit: {
    cross_tenant_breaches: number;
    credential_leaks: number;
    privilege_escalations: number;
    approval_bypasses: number;
    prompt_injection_successes: number;
    data_exfiltrations: number;
    unsafe_attempts_blocked: number;
    unsafe_executed_actions: number;
  };

  cert_l3_final_decisions: {
    production_ready_full: number;
    production_ready_with_restrictions: number;
    continue_live_pilot: number;
    blocked: number;
    total_coverage: number;
  };
  wave_distribution: {
    wave_a_count: number;
    wave_b_count: number;
    wave_c_count: number;
    wave_d_count: number;
  };
  recertification_triggers: string[];
  production_freeze_status: 'ACTIVE' | 'CONTROLLED_PILOT_ONLY' | 'BLOCKED';
  freeze_timestamp: string;
  integrity_hash: string;
  freeze_manifest_sha256: string;
}

export interface FinalProductionBaselineManifest {
  artifact_id: string;
  baseline_id: string;
  baseline_version: string;
  hash_algorithm: 'SHA-256';
  integrity_hash: string;
  created_at: string;
  total_employees: number;
  cert_l3_count: number;
  production_ready_full: number;
  production_ready_with_restrictions: number;
  verified_live_business_tasks: number;
  sample_sufficiency_status: string;
  internal_authenticity_audit: string;
  production_freeze_status: string;
  norma_interna: string;
  wave_distribution: {
    wave_a_count: number;
    wave_b_count: number;
    wave_c_count: number;
    wave_d_count: number;
  };
  verified_tenants: VerifiedTenantAuthorization[];
  security_metrics: SecurityMetricsWithDenominators;
  recertification_triggers: string[];
  employee_authorization_records: ScopedProductionAuthorizationRecord[];
}











