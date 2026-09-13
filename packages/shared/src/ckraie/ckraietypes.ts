/**
 * AI Employee Continuous Knowledge, Regulation & API Intelligence Engine (CKRAIE-500 v1.0)
 * Types & Contracts
 */

export type SourceTypeCKRAIE =
  | 'LAW'
  | 'REGULATION'
  | 'CIRCULAR'
  | 'OFFICIAL_GUIDANCE'
  | 'TAX_CALENDAR'
  | 'PROFESSIONAL_STANDARD'
  | 'TECHNICAL_STANDARD'
  | 'API_DOCUMENTATION'
  | 'CHANGELOG'
  | 'RELEASE_NOTES'
  | 'SECURITY_ADVISORY'
  | 'POLICY'
  | 'PRODUCT_DOCUMENTATION'
  | 'OTHER';

export type AuthorityLevel =
  | 'PRIMARY_OFFICIAL'
  | 'SECONDARY_OFFICIAL'
  | 'HIGH_TRUST_INDEPENDENT'
  | 'AUXILIARY';

export type SourceMonitoringMethod =
  | 'AUTOMATED_SCRAPE'
  | 'RSS_FEED'
  | 'API_POLLING'
  | 'OFFICIAL_GAZETTE_DIGEST'
  | 'MANUAL_VERIFICATION';

export type SourceStatusCKRAIE =
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'PAUSED'
  | 'UNAVAILABLE'
  | 'ERROR';

export interface SourceRecordCKRAIE {
  id: string;
  name: string;
  organization: string;
  source_type: SourceTypeCKRAIE;
  jurisdiction: string; // e.g. "AO", "GLOBAL", "EU"
  domain: string;
  url: string;
  authority_level: AuthorityLevel;
  official: boolean;
  monitoring_method: SourceMonitoringMethod;
  monitoring_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  last_checked_at: string;
  last_changed_at: string;
  status: SourceStatusCKRAIE;
  terms_or_access_notes: string;
}

export type RuleTypeCKRAIE =
  | 'OBLIGATION'
  | 'TAX_RATE'
  | 'DEADLINE'
  | 'FORMULA'
  | 'EXCEPTION'
  | 'PROCEDURE'
  | 'DEFINITION'
  | 'LIMIT'
  | 'API_SPEC'
  | 'SECURITY_POLICY'
  | 'OTHER';

export interface KnowledgeItemCKRAIE {
  knowledge_id: string;
  title: string;
  domain: string;
  subdomain: string;
  jurisdiction: string;
  content: string;
  rule_type: RuleTypeCKRAIE;
  valid_from: string;
  valid_to: string | null;
  supersedes: string | null;
  superseded_by: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';
  confidence: number; // 0-100%
  risk_level: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  created_at: string;
  updated_at: string;
}

export interface KnowledgeVersionCKRAIE {
  version_id: string;
  knowledge_id: string;
  version_label: string; // e.g. "KR-2026.09.11"
  source_id: string;
  snapshot_hash: string;
  content_snapshot: string;
  effective_date: string;
  verified_by: string;
  verified_at: string;
}

export type FreshnessStatusCKRAIE =
  | 'CURRENT'
  | 'STALE'
  | 'UPDATE_PENDING'
  | 'TEST_PENDING'
  | 'REVIEW_PENDING'
  | 'BLOCKED'
  | 'SOURCE_UNAVAILABLE';

export interface EmployeeKnowledgeProfileCKRAIE {
  employee_id: string;
  employee_name: string;
  department: string;
  knowledge_domains: string[];
  knowledge_items: string[]; // knowledge_id[]
  regulations: string[];
  professional_standards: string[];
  software_dependencies: string[];
  api_dependencies: string[];
  data_dependencies: string[];
  jurisdictions: string[];
  last_full_review: string;
  last_incremental_review: string;
  baseline_version: string; // "2026.09.11"
  current_knowledge_version: string; // "KR-2026.09.11"
  freshness_status: FreshnessStatusCKRAIE;
  critical_gaps: string[];
}

export type DependencyRelationType =
  | 'DEPENDS_ON'
  | 'USES'
  | 'REGULATED_BY'
  | 'IMPLEMENTS'
  | 'CALCULATES_FROM'
  | 'REPORTS_TO'
  | 'INTEGRATES_WITH'
  | 'SUPERSEDES'
  | 'AFFECTS'
  | 'TESTED_BY';

export interface DependencyEdgeCKRAIE {
  edge_id: string;
  source_or_item_id: string;
  target_employee_id: string;
  relation_type: DependencyRelationType;
  description: string;
}

export interface ApiVersionItemCKRAIE {
  api_id: string;
  provider: string; // e.g. "Google Workspace", "Primavera ERP", "LinkedIn"
  product: string;
  api: string;
  version: string;
  release_date: string;
  deprecated_at: string | null;
  sunset_at: string | null;
  breaking_changes: boolean;
  migration_required: boolean;
  employees_affected: string[]; // employee_id[]
  integration_components_affected: string[];
  source_id: string;
  status: 'STABLE' | 'DEPRECATED' | 'SUNSET_PENDING' | 'RETIRED';
}

export type ChangeCategoryCKRAIE =
  | 'LEGAL'
  | 'REGULATORY'
  | 'TAX'
  | 'ACCOUNTING'
  | 'API'
  | 'SECURITY'
  | 'PRODUCT'
  | 'STANDARD'
  | 'PROCESS'
  | 'POLICY'
  | 'DATA'
  | 'OTHER';

export type SeverityCKRAIE =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFORMATIONAL';

export interface ChangeEventCKRAIE {
  change_id: string;
  source_id: string;
  detected_at: string;
  old_version: string;
  new_version: string;
  change_type: ChangeCategoryCKRAIE;
  summary: string;
  effective_date: string;
  severity: SeverityCKRAIE;
  jurisdiction: string;
  domains: string[];
  evidence: string;
}

export interface SemanticDiffCKRAIE {
  diff_id: string;
  change_id: string;
  before: string;
  after: string;
  material_difference: string;
  effective_date: string;
  key_changes: string[];
  has_deadline_change: boolean;
  has_rate_change: boolean;
  has_breaking_api_change: boolean;
}

export interface ImpactAssessmentCKRAIE {
  assessment_id: string;
  change_id: string;
  severity: SeverityCKRAIE;
  rationale: string;
  affected_employees: string[]; // employee_id[]
  affected_knowledge_items: string[];
  affected_prompts: string[];
  affected_workflows: string[];
  affected_rules: string[];
  affected_calculations: string[];
  affected_integrations: string[];
  affected_tests: string[];
  affected_clients_or_tenants: string[];
  created_at: string;
}

export type HITLStatusCKRAIE =
  | 'AUTO_APPROVABLE'
  | 'HUMAN_REVIEW_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED';

export interface HITLReviewRecordCKRAIE {
  review_id: string;
  change_id: string;
  status: HITLStatusCKRAIE;
  reviewer_email: string | null;
  reviewer_role: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  auto_approved_reason?: string;
}

export interface KnowledgeReleaseCKRAIE {
  release_id: string; // e.g. "KR-2026.09.11"
  release_date: string;
  baseline_version: string; // "2026.09.11"
  changes: string[]; // change_id[]
  sources: string[]; // source_id[]
  employees_affected: string[];
  tests_executed: number;
  tests_passed: number;
  approvals: string[]; // review_id[]
  status: 'DRAFT' | 'APPROVED' | 'RELEASED' | 'ROLLED_BACK';
  rollback_reference: string | null;
}

export interface TemporalTestCaseCKRAIE {
  test_id: string;
  employee_id: string;
  query_context: string;
  temporal_target_year: string; // e.g. "2025" vs "2026"
  expected_rule_summary: string;
  actual_output?: string;
  passed: boolean;
  tested_at: string;
}

export interface RegressionTestRunCKRAIE {
  run_id: string;
  change_id: string;
  employee_id: string;
  test_category: 'KNOWLEDGE' | 'LEGAL' | 'REGULATORY' | 'CALCULATION' | 'API' | 'SECURITY' | 'TEMPORAL' | 'HALLUCINATION';
  passed: boolean;
  score: number; // 0-100%
  execution_time_ms: number;
  ran_at: string;
  failure_reason?: string;
}

export interface SourceHealthRecordCKRAIE {
  source_id: string;
  source_name: string;
  last_successful_check: string;
  failed_checks: number;
  http_status: number;
  parsing_status: 'OK' | 'WARNING' | 'FAILED';
  authentication_status: 'VALID' | 'EXPIRED' | 'NOT_REQUIRED';
  structure_changed: boolean;
  source_available: boolean;
  status_label: 'HEALTHY' | 'DEGRADED' | 'SOURCE_MONITORING_FAILURE';
}

export interface CKRAIEAuditEvent {
  event_id: string;
  timestamp: string;
  actor: string; // "SYSTEM_CRAWLER", "COMPLIANCE_OFFICER", "CKRAIE_ORCHESTRATOR"
  action: string;
  source_id: string | null;
  change_id: string | null;
  employee_id: string | null;
  knowledge_version: string;
  old_value: string | null;
  new_value: string | null;
  reason: string;
  hash: string;
}

export interface EmployeeKnowledgeCard {
  employee_id: string;
  employee_name: string;
  department: string;
  knowledge_status: FreshnessStatusCKRAIE;
  baseline: string; // "2026.09.11"
  current_version: string; // "KR-2026.09.11"
  last_verified: string;
  sources_monitored: number;
  pending_changes: number;
  critical_gaps: number;
  regression_tests_status: 'PASS' | 'FAIL' | 'UNTESTED';
  human_review: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  production_eligibility: boolean;
}

export interface CKRAIEGlobalSummary {
  engine_version: string; // "v1.0"
  baseline_version: string; // "2026.09.11"
  active_release_version: string; // "KR-2026.09.11"
  total_employees: number; // 500
  employees_current_count: number;
  employees_stale_count: number;
  employees_pending_review_count: number;
  employees_blocked_count: number;
  total_sources_monitored: number;
  healthy_sources_count: number;
  failed_sources_count: number;
  total_change_events: number;
  critical_changes_count: number;
  pending_hitl_reviews_count: number;
  total_releases_count: number;
  total_regression_tests: number;
  passed_regression_tests: number;
  overall_freshness_score: number; // 0-100%
  last_updated_at: string;
}
