/**
 * PTKML-500 v1.0 — 500 AI Employees Professional Technical Knowledge Master Library Data Contracts
 * Scope: 500 Role Packs, 44 Technical Departments, 48 Commercial Areas
 */

export type KnowledgeStatusState =
  | 'BASELINE_GENERATED_FOR_VALIDATION'
  | 'DOMAIN_REVIEWED'
  | 'SOURCE_VERIFIED'
  | 'PRACTICALLY_TESTED'
  | 'HUMAN_BENCHMARKED'
  | 'PROFESSIONALLY_CERTIFIED'
  | 'REVIEW_DUE'
  | 'STALE'
  | 'SUSPENDED';

export interface TechnicalKnowledgeSyllabus {
  syllabus_id: string;
  employee_id: string;
  mandatory_topics: string[];
  verified_sources: string[];
  methods_and_calculations: string[];
  last_updated_at: string;
}

export interface ProfessionalProcessMap {
  process_id: string;
  employee_id: string;
  main_workflow: string;
  key_processes: string[];
  input_validations: string[];
  handoffs: string[];
}

export interface ProfessionalDocumentMap {
  map_id: string;
  employee_id: string;
  required_documents: string[];
  canonical_metrics: string[];
  data_elements: string[];
}

export interface ProfessionalToolMap {
  tool_map_id: string;
  employee_id: string;
  authorized_tools: string[];
  tool_constraints: string[];
}

export interface ProfessionalExceptionLibrary {
  library_id: string;
  employee_id: string;
  handled_exceptions: string[];
  escalation_thresholds: string[];
  stop_rules: string[];
}

export interface ExamBlueprint {
  blueprint_id: string;
  employee_id: string;
  normal_case_topic: string;
  incomplete_data_case_topic: string;
  contradictory_data_case_topic: string;
  adversarial_prompt_injection_case_topic: string;
  unauthorized_action_attempt_case_topic: string;
}

export interface ExamRunResult {
  run_id: string;
  employee_id: string;
  passed: boolean;
  score_percentage: number;
  cases_passed: {
    normal_case: boolean;
    incomplete_data_case: boolean;
    contradictory_data_case: boolean;
    adversarial_prompt_injection_case: boolean;
    unauthorized_action_attempt_case: boolean;
  };
  details: string;
  executed_at: string;
}

export interface CertificationGateResult {
  employee_id: string;
  certified: boolean;
  status: KnowledgeStatusState;
  gates: {
    profile_defined: boolean;
    knowledge_verified: boolean;
    practically_tested: boolean;
    professionally_certified: boolean;
    production_proven: boolean;
  };
  evaluated_at: string;
}

export interface ProfessionalCompetencyProfile {
  employee_id: string; // e.g. "001", "027", "261", "500"
  role_key: string; // e.g. "ceo_assistant", "social_media", "tax_auditor"
  role_name: string;
  department: string; // e.g. "Strategy", "Marketing", "Taxation", "Legal"
  canonical_risk: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  max_autonomy: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  canonical_outputs: string[];
  knowledge_status: KnowledgeStatusState;
  
  // Section B-J breakdown
  syllabus: TechnicalKnowledgeSyllabus;
  process_map: ProfessionalProcessMap;
  document_map: ProfessionalDocumentMap;
  tool_map: ProfessionalToolMap;
  exception_library: ProfessionalExceptionLibrary;
  exam_blueprint: ExamBlueprint;
  
  last_promotion_at: string;
  promoted_by?: string;
  created_at: string;
}

export interface PTKMLGlobalSummary {
  total_profiles: number;
  certified_profiles_count: number;
  practically_tested_count: number;
  baseline_count: number;
  department_count: number;
  departments: string[];
  certification_percentage: number;
  all_500_loaded: boolean;
}
