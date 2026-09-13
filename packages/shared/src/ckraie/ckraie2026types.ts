/**
 * CKRAIE-2026 — Compliance Knowledge, Regulatory & Approval Intelligence Engine (2026 Specs)
 * Types & Contracts
 */

export type RiskApprovalMode =
  | 'AUTO_ACCEPTABLE'
  | 'AUTO_UPDATE'
  | 'AUTO_UPDATE_TEST_NOTIFY'
  | 'HUMAN_APPROVAL_REQUIRED'
  | 'DUAL_APPROVAL_REQUIRED';

export type SegregationRole =
  | 'COMPLIANCE_ANALYST'
  | 'COMPLIANCE_MANAGER'
  | 'TAX_MANAGER'
  | 'LEGAL_REVIEWER'
  | 'IT_SECURITY'
  | 'BUSINESS_OWNER'
  | 'SYSTEM_ADMIN'
  | 'AUDITOR';

export interface RegulatoryChangeCard {
  change_id: string;
  source: string; // e.g. "AGT", "BNA", "Diário da República"
  authority: string;
  title: string;
  jurisdiction: string;
  domain: string;
  publication_date: string;
  effective_date: string;
  detected_at: string;
  old_rule: string;
  new_rule: string;
  semantic_difference: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  approval_mode: RiskApprovalMode;
  employees_affected: string[]; // employee_id[]
  clients_affected: string[]; // tenant_id[]
  workflows_affected: string[];
  systems_affected: string[];
  tests_affected: string[];
  financial_impact: string;
  compliance_impact: string;
  recommended_action: string;
  verification_status: 'UNVERIFIED' | 'VERIFIED' | 'APPROVED' | 'ACTIVATED' | 'BLOCKED';
}

export interface ApprovalCardRecord {
  approval_card_id: string;
  change_id: string;
  source: string;
  old_rule: string;
  new_rule: string;
  effective_date: string;
  impact_summary: string;
  employees_affected_count: number;
  clients_affected_count: number;
  workflows_affected_count: number;
  test_results_summary: string; // e.g. "38/38 PASS"
  risks_summary: string;
  recommended_action: string;
  dual_approval_required: boolean;
  reviewer_role_required: SegregationRole;
  approver_role_required: SegregationRole;
}

export interface DualApprovalRecord {
  approval_id: string;
  change_id: string;
  reviewer_email: string;
  reviewer_role: SegregationRole;
  reviewed_at: string;
  approver1_email: string | null;
  approver1_role: SegregationRole | null;
  approver1_at: string | null;
  approver2_email: string | null;
  approver2_role: SegregationRole | null;
  approver2_at: string | null;
  status: 'PENDING_REVIEW' | 'PENDING_APPROVER_1' | 'PENDING_APPROVER_2' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}

export type PreApprovalTestCategory =
  | 'FACTUAL'
  | 'REGULATORY'
  | 'TEMPORAL'
  | 'CALCULATION'
  | 'WORKFLOW'
  | 'API'
  | 'SECURITY'
  | 'INTEGRATION'
  | 'REGRESSION'
  | 'EDGE_CASE'
  | 'CONTRADICTION';

export interface PreApprovalTestCase {
  test_id: string;
  category: PreApprovalTestCategory;
  name: string;
  passed: boolean;
  details: string;
}

export interface PreApprovalTestSuiteResult {
  suite_id: string;
  change_id: string;
  total_tests: number; // 11
  passed_tests: number;
  all_passed: boolean;
  approval_blocked: boolean; // APPROVAL_BLOCKED if passed_tests < total_tests
  tests: PreApprovalTestCase[];
  executed_at: string;
}

export interface Secure1ClickApprovalEvent {
  event_id: string;
  change_id: string;
  actor_email: string;
  actor_role: SegregationRole;
  source_verified: boolean; // must be true
  diff_reviewed: boolean; // must be true
  impact_calculated: boolean; // must be true
  tests_passed: boolean; // must be true
  authorization_valid: boolean; // must be true
  timestamp: string;
  hash: string;
}

export interface CrossEnginePolicyReview {
  review_request_id: string;
  change_id: string;
  regulatory_source: string;
  regulatory_summary: string;
  affected_tenant_ids: string[];
  affected_client_policies: string[];
  status: 'POLICY_REVIEW_REQUIRED' | 'POLICIES_UPDATED';
  created_at: string;
}

export interface CKRAIE2026GlobalSummary {
  engine_version: string; // "v2026.1"
  total_regulatory_change_cards: number;
  pending_dual_approvals_count: number;
  approved_changes_count: number;
  pending_effective_date_count: number;
  total_pre_approval_test_suites: number;
  total_1click_approval_events: number;
  cross_engine_reviews_count: number;
  last_updated_at: string;
}
