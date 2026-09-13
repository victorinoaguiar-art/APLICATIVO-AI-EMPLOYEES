export type KnowledgeState =
  | 'INVENTORIED'
  | 'RESEARCH_REQUIRED'
  | 'RESEARCHED'
  | 'CHANGE_DETECTED'
  | 'KNOWLEDGE_UPDATED'
  | 'VALIDATION_REQUIRED'
  | 'VALIDATED'
  | 'REGRESSION_TESTED'
  | 'READY_FOR_TEST'
  | 'BLOCKED';

export type SourceLevel =
  | 'LEVEL_1_PRIMARY'
  | 'LEVEL_2_SECONDARY'
  | 'LEVEL_3_AUXILIARY';

export type VerificationStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'REVOKED'
  | 'SUPERSEDED';

export type ChangeCategory =
  | 'LEGAL'
  | 'REGULATORY'
  | 'TAX'
  | 'ACCOUNTING'
  | 'PROFESSIONAL_STANDARD'
  | 'TECHNICAL'
  | 'API_VERSION'
  | 'DEPRECATION'
  | 'SECURITY'
  | 'DATA'
  | 'PROCESS'
  | 'PRODUCT'
  | 'POLICY'
  | 'BEST_PRACTICE'
  | 'OTHER';

export type KBUEImpactLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFORMATIONAL';

export interface SourceRecord {
  source_id: string;
  source_name: string;
  source_type: string;
  source_url: string;
  jurisdiction: string;
  document_title: string;
  publication_date: string;
  effective_date: string;
  version: string;
  retrieved_at: string;
  applies_to: string[];
  evidence_excerpt_or_reference: string;
  verification_status: VerificationStatus;
  level: SourceLevel;
}

export interface KnowledgeDiffItem {
  diff_id: string;
  domain: string;
  subdomain: string;
  old_knowledge: string;
  current_evidence_at_2026_09_11: string;
  difference: string;
  category: ChangeCategory;
  impact: KBUEImpactLevel;
  action_required: string;
  source_id: string;
  verified: boolean;
}

export interface EmployeeKnowledgeInventory {
  employee_id: string;
  employee_name: string;
  department: string;
  role: string;
  description: string;
  jurisdictions: string[];
  industries: string[];
  knowledge_domains: string[];
  regulatory_domains: string[];
  software_dependencies: string[];
  api_dependencies: string[];
  data_dependencies: string[];
  professional_standards: string[];
  critical_decisions: string[];
  risk_level: string;
  knowledge_sources: SourceRecord[];
  diffs: KnowledgeDiffItem[];
  last_verified_at: string;
  knowledge_baseline_version: string;
  state: KnowledgeState;
  critical_gap_locked: boolean;
}

export interface KnowledgeFreshnessMetrics {
  employee_id: string;
  total_domains: number;
  verified_domains: number;
  outdated_domains: number;
  updated_domains: number;
  unverified_domains: number;
  critical_gaps: number;
  last_verified_at: string;
  knowledge_freshness_score: number; // Percentage 0..100
  critical_gap_locked: boolean;
}

export interface KBUEGlobalSummary {
  total_employees: number;
  baseline_version: string;
  cutoff_date: string;
  researched_count: number;
  updated_count: number;
  unchanged_count: number;
  critical_changes_count: number;
  high_changes_count: number;
  critical_gaps_count: number;
  blocked_count: number;
  ready_for_test_count: number;
  average_freshness_score: number;
}
