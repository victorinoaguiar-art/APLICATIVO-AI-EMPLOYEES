export type PCECertificationState =
  | 'NOT_ASSESSED'
  | 'EVIDENCE_RECEIVED'
  | 'EVIDENCE_INVALID'
  | 'UNDER_CERTIFICATION_REVIEW'
  | 'WAITING_HUMAN_APPROVAL'
  | 'CERTIFIED'
  | 'CERTIFIED_WITH_RESTRICTIONS'
  | 'CONDITIONAL'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'REVIEW_DUE'
  | 'RECERTIFICATION_REQUIRED';

export type CertificationDecisionType =
  | 'CERTIFIED'
  | 'CERTIFIED_WITH_RESTRICTIONS'
  | 'CONDITIONAL'
  | 'REJECTED'
  | 'WAITING_HUMAN_APPROVAL';

export type HireabilityState =
  | 'HIREABLE'
  | 'HIREABLE_WITH_SUPERVISION'
  | 'NOT_YET_HIREABLE'
  | 'RESTRICTED';

export type HardGateId =
  | 'G1_ROLEPACK_VALID'
  | 'G2_KNOWLEDGE_VERIFIED'
  | 'G3_REQUIRED_CASES_COMPLETE'
  | 'G4_PRACTICAL_EXAM_PASS'
  | 'G5_ADVERSARIAL_EXAM_PASS'
  | 'G6_SECURITY_TESTS_PASS'
  | 'G7_NEGATIVE_PERMISSIONS_PASS'
  | 'G8_REQUIRED_TOOL_TESTS_PASS'
  | 'G9_HUMAN_REVIEW_PASS'
  | 'G10_HUMAN_BENCHMARK_PASS'
  | 'G11_RELIABILITY_THRESHOLD_PASS'
  | 'G12_NO_UNRESOLVED_E5'
  | 'G13_E4_WITHIN_POLICY'
  | 'G14_EVIDENCE_PACKAGE_INTEGRITY'
  | 'G15_SCOPE_TESTED';

export interface HardGateCheckResult {
  gate_id: HardGateId;
  gate_name: string;
  policy_requirement: string;
  evidence_reference: string;
  passed: boolean;
  notes?: string;
}

export type CertifiedToolScopeStatus =
  | 'CERTIFIED'
  | 'CERTIFIED_READ_ONLY'
  | 'CERTIFIED_PREPARE_ONLY'
  | 'NOT_CERTIFIED'
  | 'SUSPENDED';

export interface ProfessionalCertificationPolicy {
  policy_id: string;
  name: string;
  risk_class: string;
  professional_domain: string;
  required_case_count: number;
  required_adversarial_count: number;
  human_review_required: boolean;
  human_benchmark_required: boolean;
  security_pass_required: boolean;
  tool_pass_required: boolean;
  knowledge_verified_required: boolean;
  max_unresolved_E3: number;
  max_unresolved_E4: number;
  max_unresolved_E5: number;
  umer_threshold: number;
  repeatability_threshold: number;
  validity_period_days: number;
  approval_policy_id: string;
  effective_from: string;
  version: string;
}

export interface ProfessionalCertificationRecord {
  certification_id: string;
  employee_id: string;
  role_key: string;
  role_name: string;
  department: string;
  professional_domain: string;
  certification_scope: string[];
  restricted_scope: string[];
  certified_capabilities: Record<string, boolean>;
  certified_tools: Record<string, CertifiedToolScopeStatus>;
  certified_autonomy_max: string;
  required_supervision: string;
  risk_class: string;
  jurisdiction_scope: string;
  industry_scope: string;
  evidence_package_id: string;
  evidence_hash: string;
  policy_id: string;
  policy_version: string;
  decision: CertificationDecisionType;
  valid_from: string;
  review_due: string;
  expires_at: string;
  status: PCECertificationState;
  approved_by?: string;
  created_at: string;
  certificate_version: number;
}

export interface HireabilityDecision {
  employee_id: string;
  role_key: string;
  role_name: string;
  department: string;
  hireability_state: HireabilityState;
  certified_scope: string[];
  limitations: string[];
  recommended_supervision: string;
  verified_certification_id?: string;
  decided_at: string;
}

export interface CertificationSuspensionRecord {
  suspension_id: string;
  certification_id: string;
  employee_id: string;
  reason: string;
  triggered_by_incident_id?: string;
  affected_capabilities: string[];
  suspended_at: string;
  suspended_by: string;
  active: boolean;
}

export interface PCEGlobalSummary {
  total_employees: number;
  certified_count: number;
  certified_with_restrictions_count: number;
  conditional_count: number;
  rejected_count: number;
  suspended_count: number;
  review_due_count: number;
  expired_count: number;
  claim_gate_500_passed: boolean;
  departments_certified: number;
}
