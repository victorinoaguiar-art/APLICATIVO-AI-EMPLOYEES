/**
 * CPEAA — Client Policy, Enterprise Alignment & Adaptation Engine (2026 Specs)
 * Types & Contracts
 */

export type KnowledgeLayer =
  | 'GLOBAL'
  | 'JURISDICTION'
  | 'REGULATORY'
  | 'INDUSTRY'
  | 'CLIENT'
  | 'DEPARTMENT'
  | 'EMPLOYEE_SPECIFIC';

export type AuthorityHierarchyLevel =
  | 'LAW_REGULATION'
  | 'SECTORIAL_STANDARD'
  | 'CONTRACT_EXTERNAL'
  | 'INTERNAL_POLICY'
  | 'PROCEDURE'
  | 'WORK_INSTRUCTION'
  | 'PREFERENCE';

export type DocumentTypeCPEAA =
  | 'POLICY'
  | 'PROCEDURE'
  | 'MANUAL'
  | 'INTERNAL_REGULATION'
  | 'WORK_INSTRUCTION'
  | 'APPROVAL_MATRIX'
  | 'ORGANIZATION_CHART'
  | 'CODE_OF_CONDUCT'
  | 'FINANCIAL_POLICY'
  | 'PROCUREMENT_POLICY'
  | 'HR_POLICY'
  | 'SECURITY_POLICY'
  | 'COMPLIANCE_POLICY'
  | 'RISK_POLICY'
  | 'ACCOUNTING_POLICY'
  | 'TAX_POLICY'
  | 'TREASURY_POLICY'
  | 'AUDIT_POLICY'
  | 'DATA_POLICY'
  | 'IT_POLICY'
  | 'TEMPLATE'
  | 'CHECKLIST'
  | 'GUIDELINE'
  | 'OTHER';

export type DocumentStatusCPEAA =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'ARCHIVED';

export type ConfidentialityLevelCPEAA =
  | 'PUBLIC_INTERNAL'
  | 'INTERNAL'
  | 'RESTRICTED'
  | 'CONFIDENTIAL'
  | 'HIGHLY_CONFIDENTIAL';

export interface ClientDocumentRecord {
  document_id: string;
  tenant_id: string;
  title: string;
  document_type: DocumentTypeCPEAA;
  department: string;
  jurisdiction: string;
  industry: string;
  version: string;
  status: DocumentStatusCPEAA;
  effective_date: string;
  expiration_date: string | null;
  approved_by: string;
  owner: string;
  confidentiality_level: ConfidentialityLevelCPEAA;
  applicable_employees: string[]; // employee_id[]
  applicable_roles: string[];
  supersedes: string | null;
  superseded_by: string | null;
  uploaded_at: string;
  validated_at: string;
  last_reviewed_at: string;
  next_review_date: string | null;
  source: string;
  hash: string;
}

export type RuleTypeCPEAA =
  | 'PROCUREMENT'
  | 'FINANCIAL'
  | 'AUTHORIZATION'
  | 'COMPLIANCE'
  | 'SECURITY'
  | 'OPERATIONAL'
  | 'HR'
  | 'OTHER';

export interface PolicyRuleCPEAA {
  rule_id: string;
  tenant_id: string;
  document_id: string;
  rule_type: RuleTypeCPEAA;
  subject: string;
  condition: string;
  action: string;
  threshold: number | null;
  currency: string | null; // e.g. "AOA", "EUR", "USD"
  approval_level: string; // e.g. "DEPARTMENT_HEAD", "BOARD_APPROVAL", "DIRECTOR"
  exception: string | null;
  effective_from: string;
  effective_to: string | null;
  risk_level: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  source_reference: string; // e.g. "Cláusula 4.2 do Manual de Compras"
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
}

export interface ClientKnowledgeProfileCPEAA {
  tenant_id: string;
  tenant_name: string;
  active_documents: number;
  active_policies: number;
  departments: string[];
  mapped_employees: string[];
  policy_conflicts: number;
  expired_documents: number;
  pending_reviews: number;
  critical_rules: number;
  knowledge_version: string; // e.g. "CKR-ACME-2026.09.11-v1"
  last_updated_at: string;
}

export interface PolicyConflictRecord {
  conflict_id: string;
  tenant_id: string;
  conflict_type: 'POLICY_CONFLICT_DETECTED' | 'INTERNAL_POLICY_CONFLICT';
  superior_source: string; // e.g. "Diário da República / AGT Decreto 10/26"
  superior_level: AuthorityHierarchyLevel;
  inferior_source: string; // e.g. "Manual Interno de Compras do Cliente"
  inferior_level: AuthorityHierarchyLevel;
  explanation: string;
  action_taken: 'LOWER_RULE_BLOCKED_PENDING_HUMAN_REVIEW';
  detected_at: string;
  resolved: boolean;
}

export interface ExplainableDecisionTrace {
  decision_id: string;
  tenant_id: string;
  employee_id: string;
  query: string;
  decision_summary: string;
  applied_policy_id: string;
  applied_document_title: string;
  applied_version: string;
  applied_clause: string;
  effective_date: string;
  approved_by: string;
  legal_precedence_verified: boolean;
  hash: string;
}

export interface CPEAA2026GlobalSummary {
  total_tenants_configured: number;
  total_client_documents: number;
  total_extracted_rules: number;
  active_client_releases: number;
  detected_policy_conflicts: number;
  total_explainable_decisions: number;
  last_updated_at: string;
}
