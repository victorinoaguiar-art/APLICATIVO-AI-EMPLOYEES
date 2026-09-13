export type EvaluationStatusState = 
  | 'NOT_PREPARED'
  | 'BLUEPRINT_DRAFT'
  | 'READY_FOR_EXAM'
  | 'EXAM_SCHEDULED'
  | 'EXAM_RUNNING'
  | 'WAITING_HUMAN_REVIEW'
  | 'EVALUATED_PASS'
  | 'EVALUATED_CONDITIONAL'
  | 'EVALUATED_FAIL'
  | 'INVALIDATED'
  | 'RETEST_REQUIRED';

export type CaseFamily =
  | 'HAPPY_PATH'
  | 'EDGE_CASE'
  | 'MISSING_DATA'
  | 'CONFLICTING_DATA'
  | 'STALE_DATA'
  | 'AMBIGUOUS_CASE'
  | 'OUT_OF_SCOPE'
  | 'UNAUTHORIZED_ACTION'
  | 'TOOL_FAILURE'
  | 'CONNECTOR_FAILURE'
  | 'PROMPT_INJECTION'
  | 'TENANT_ISOLATION'
  | 'LOW_CONFIDENCE'
  | 'HIGH_RISK_CASE'
  | 'REALISTIC_COMPLEX_CASE';

export type DifficultyLevel =
  | 'D1_BASIC'
  | 'D2_INTERMEDIATE'
  | 'D3_PROFESSIONAL'
  | 'D4_ADVANCED'
  | 'D5_EXPERT_SUPPORT';

export type PEEErrorSeverity =
  | 'E0_NO_ERROR'
  | 'E1_COSMETIC'
  | 'E2_MINOR'
  | 'E3_OPERATIONAL'
  | 'E4_MATERIAL'
  | 'E5_CRITICAL';

export type RootCauseCategory =
  | 'INPUT_GAP'
  | 'KNOWLEDGE_GAP'
  | 'PROCESS_GAP'
  | 'DOCUMENT_GAP'
  | 'TOOL_GAP'
  | 'REASONING_GAP'
  | 'JUDGMENT_GAP'
  | 'PROMPT_GAP'
  | 'WORKFLOW_GAP'
  | 'CONNECTOR_GAP'
  | 'PERMISSION_GAP'
  | 'POLICY_GAP'
  | 'RENDERING_GAP'
  | 'EVALUATION_GAP';

export interface ProfessionalExamBlueprint {
  blueprint_id: string;
  employee_id: string;
  role_key: string;
  role_name: string;
  department: string;
  risk_class: string;
  max_autonomy: string;
  knowledge_topics: string[];
  process_topics: string[];
  document_topics: string[];
  tool_topics: string[];
  exception_topics: string[];
  minimum_cases: number;
  hidden_case_ratio: number;
  difficulty_distribution: Record<DifficultyLevel, number>;
  required_adversarial_families: CaseFamily[];
  required_security_tests: string[];
  required_tool_tests: string[];
  required_human_review: boolean;
  required_human_benchmark: boolean;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE';
  version: string;
  created_at: string;
}

export interface GoldenExamCase {
  case_id: string;
  blueprint_id: string;
  employee_id: string;
  case_family: CaseFamily;
  difficulty: DifficultyLevel;
  scenario_title: string;
  business_context: string;
  input_fixtures: Record<string, any>;
  expected_facts: string[];
  expected_calculations: Record<string, number>;
  expected_actions: string[];
  forbidden_actions: string[];
  expected_escalations: string[];
  acceptance_criteria: string[];
  is_hidden_case: boolean;
  is_adversarial: boolean;
}

export interface DeterministicValidatorResult {
  validator_id: string;
  case_id: string;
  totals_match: boolean;
  balances_match: boolean;
  formula_correctness: boolean;
  required_fields_present: boolean;
  forbidden_tool_calls_detected: number;
  output_schema_valid: boolean;
  numeric_errors: string[];
  passed: boolean;
}

export interface AIEvaluatorResult {
  evaluator_id: string;
  case_id: string;
  technical_correctness_score: number; // 0-100
  completeness_score: number; // 0-100
  exception_handling_score: number; // 0-100
  professional_judgment_score: number; // 0-100
  evidence_quality_score: number; // 0-100
  governance_score: number; // 0-100
  detected_errors: Array<{
    severity: PEEErrorSeverity;
    root_cause: RootCauseCategory;
    description: string;
  }>;
  recommended_evaluation: 'PASS' | 'CONDITIONAL' | 'FAIL';
  summary_notes: string;
}

export interface HumanDomainReview {
  review_id: string;
  run_id: string;
  employee_id: string;
  reviewer_id: string;
  decision: 'AGREE' | 'OVERRIDE_PASS' | 'OVERRIDE_FAIL' | 'REQUEST_RETEST';
  override_reason?: string;
  notes: string;
  reviewed_at: string;
}

export interface HumanBenchmarkRun {
  benchmark_id: string;
  employee_id: string;
  case_id: string;
  ai_accuracy_percent: number;
  human_accuracy_percent: number;
  ai_execution_time_sec: number;
  human_execution_time_sec: number;
  review_burden_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  professionally_acceptable: boolean;
  conducted_at: string;
}

export interface PEEReliabilityMetrics {
  employee_id: string;
  case_pass_rate_percent: number;
  first_pass_acceptance_percent: number;
  revision_rate_percent: number;
  e3_operational_error_rate: number;
  e4_material_error_rate: number;
  e5_critical_error_rate: number;
  umer_undetected_material_error_rate: number;
  false_escalation_rate_percent: number;
  missed_escalation_rate_percent: number;
  tool_error_rate_percent: number;
  permission_violation_attempt_rate_percent: number;
  repeatability_score: number;
  human_review_burden_hours: number;
}

export interface ProfessionalEvaluationEvidencePackage {
  evidence_package_id: string;
  employee_id: string;
  role_key: string;
  role_name: string;
  department: string;
  blueprint_id: string;
  exam_run_ids: string[];
  total_cases_evaluated: number;
  hidden_cases_evaluated: number;
  adversarial_cases_evaluated: number;
  deterministic_validators_pass: boolean;
  ai_evaluator_summary: 'PASS' | 'CONDITIONAL' | 'FAIL';
  human_review_status: string;
  human_benchmark_acceptable: boolean;
  reliability_metrics: PEEReliabilityMetrics;
  error_summary: Record<PEEErrorSeverity, number>;
  security_summary: {
    prompt_injections_neutralized: number;
    cross_tenant_blocks: number;
    unauthorized_action_blocks: number;
  };
  recommended_scope: string[];
  recommended_autonomy_max: string;
  status: EvaluationStatusState;
  created_at: string;
  package_hash: string;
}

export interface EvaluationAcceptanceGateResult {
  employee_id: string;
  role_key: string;
  blueprint_valid: boolean;
  required_cases_complete: boolean;
  hidden_cases_complete: boolean;
  adversarial_cases_complete: boolean;
  tool_tests_complete: boolean;
  security_tests_complete: boolean;
  human_review_complete: boolean;
  benchmark_complete: boolean;
  reliability_metrics_calculated: boolean;
  evidence_package_frozen: boolean;
  overall_gate_passed: boolean;
  target_next_status: 'SENT_TO_CERTIFICATION' | 'RETEST_REQUIRED';
  evaluated_at: string;
}

export interface PEEGlobalSummary {
  total_employees: number;
  blueprints_ready: number;
  exams_scheduled: number;
  exams_running: number;
  waiting_human_review: number;
  evaluated_pass: number;
  evaluated_conditional: number;
  evaluated_fail: number;
  retest_required: number;
  evidence_packages_frozen: number;
  sent_to_certification_count: number;
  departments_covered: number;
}
