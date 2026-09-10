/**
 * AWEEP — AI Workforce Enterprise Extension Pack Data Models & Contracts
 */

// ---------------------------------------------------------------------------
// A. PORTAL MULTI-CLIENTE PARA ESCRITÓRIOS, CONSULTORES E GRUPOS
// ---------------------------------------------------------------------------

export type FirmPartnerStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'RETIRED';
export type FirmBillingModel = 'FIRM_PAID' | 'CLIENT_PAID' | 'RESOLD' | 'REVENUE_SHARE' | 'MANAGED_SERVICE';
export type RelationshipType = 
  | 'ACCOUNTING_SERVICE' 
  | 'TAX_SERVICE' 
  | 'HR_SERVICE' 
  | 'CONSULTING' 
  | 'OUTSOURCED_FINANCE' 
  | 'MANAGED_AI_WORKFORCE' 
  | 'GROUP_ADMINISTRATION';

export type FirmUserRole = 
  | 'FIRM_ADMIN' 
  | 'CLIENT_MANAGER' 
  | 'ACCOUNTANT' 
  | 'TAX_SPECIALIST' 
  | 'HR_SPECIALIST' 
  | 'REVIEWER' 
  | 'APPROVER' 
  | 'VIEWER';

export interface FirmAccount {
  firm_id: string;
  legal_name: string;
  tax_id: string;
  country: string;
  primary_admin_email: string;
  partner_status: FirmPartnerStatus;
  billing_model: FirmBillingModel;
  white_label_enabled: boolean;
  custom_domain?: string;
  created_at: string;
}

export interface FirmClientRelationship {
  relationship_id: string;
  firm_id: string;
  organization_id: string;
  organization_name: string;
  relationship_type: RelationshipType;
  assigned_staff_emails: string[];
  effective_from: string;
  effective_to?: string;
  status: 'ACTIVE' | 'PAUSED' | 'TERMINATED';
}

export interface ClientWorkspaceContext {
  active_organization_id: string;
  firm_id: string;
  user_email: string;
  user_role: FirmUserRole;
  allowed_features: string[];
}

// ---------------------------------------------------------------------------
// B. NO-CODE WORKFLOW BUILDER
// ---------------------------------------------------------------------------

export type WorkflowNodeType = 
  | 'TRIGGER' 
  | 'AI_EMPLOYEE' 
  | 'HUMAN_TASK' 
  | 'CONDITION' 
  | 'APPROVAL' 
  | 'TOOL' 
  | 'CONNECTOR' 
  | 'WAIT' 
  | 'TIMER' 
  | 'DOCUMENT' 
  | 'DELIVERY' 
  | 'SUBWORKFLOW' 
  | 'END';

export type WorkflowStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'SUPERSEDED' | 'RETIRED';

export interface WorkflowNode {
  node_id: string;
  label: string;
  type: WorkflowNodeType;
  config: Record<string, any>;
  employee_id?: string;
  approval_required?: boolean;
}

export interface WorkflowEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  condition_expression?: string;
}

export interface WorkflowDefinition {
  workflow_id: string;
  organization_id: string;
  name: string;
  version: number;
  status: WorkflowStatus;
  trigger_type: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  risk_level: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  owner_email: string;
  effective_from: string;
}

export interface WorkflowExecutionInstance {
  execution_id: string;
  workflow_id: string;
  organization_id: string;
  current_node_id: string;
  status: 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'TERMINATED';
  execution_log: Array<{
    timestamp: string;
    node_id: string;
    action: string;
    result: string;
  }>;
  started_at: string;
  completed_at?: string;
}

// ---------------------------------------------------------------------------
// C. AI TEAM & DEPARTMENT ORCHESTRATOR
// ---------------------------------------------------------------------------

export type TeamTopology = 'PIPELINE' | 'STAR' | 'PARALLEL' | 'HIERARCHICAL' | 'CONSULTATIVE';

export interface AITeamMember {
  role_in_team: string;
  employee_id: string;
  role_key: string;
  responsibility_scope: string;
  delegation_priority: number;
}

export interface AITeamDefinition {
  team_id: string;
  organization_id: string;
  team_name: string;
  department: string;
  topology: TeamTopology;
  leader_employee_id: string;
  members: AITeamMember[];
  handoff_rules: Array<{
    from_employee_id: string;
    to_employee_id: string;
    condition: string;
  }>;
}

export interface HandoffMessage {
  handoff_id: string;
  team_id: string;
  from_employee_id: string;
  to_employee_id: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: string;
}

// ---------------------------------------------------------------------------
// D. ENTERPRISE SEARCH — "PERGUNTE À EMPRESA" (RAG)
// ---------------------------------------------------------------------------

export interface KnowledgeSource {
  source_id: string;
  organization_id: string;
  name: string;
  type: 'GOOGLE_DRIVE' | 'ERP_DATABASE' | 'DOCUMENT_VAULT' | 'POLICY_REPOSITORY';
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';
  last_indexed_at: string;
  document_count: number;
}

export interface SearchResultChunk {
  chunk_id: string;
  document_title: string;
  source_type: string;
  snippet: string;
  relevance_score: number;
  security_clearance_passed: boolean;
  citation_url: string;
}

export interface EnterpriseSearchQuery {
  query_id: string;
  organization_id: string;
  user_email: string;
  user_roles: string[];
  natural_language_query: string;
  results: SearchResultChunk[];
  generated_answer: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// E. CONTINUOUS IMPROVEMENT LABORATORY
// ---------------------------------------------------------------------------

export interface OptimizationHypothesis {
  hypothesis_id: string;
  employee_id: string;
  target_metric: 'ACCURACY' | 'LATENCY' | 'USER_SATISFACTION' | 'TOKEN_EFFICIENCY';
  current_baseline_value: number;
  proposed_change_description: string;
  status: 'PROPOSED' | 'TESTING' | 'ACCEPTED' | 'REJECTED';
}

export interface ContinuousImprovementExperiment {
  experiment_id: string;
  hypothesis_id: string;
  employee_id: string;
  control_prompt_version: string;
  variant_prompt_version: string;
  sample_size: number;
  control_score: number;
  variant_score: number;
  statistically_significant: boolean;
  winner: 'CONTROL' | 'VARIANT' | 'INCONCLUSIVE';
  executed_at: string;
}

// ---------------------------------------------------------------------------
// F. COMPLIANCE EVIDENCE VAULT
// ---------------------------------------------------------------------------

export interface ComplianceEvidenceRecord {
  evidence_id: string;
  organization_id: string;
  employee_id: string;
  task_id: string;
  evidence_type: 'APPROVAL_SIGNATURE' | 'PAYROLL_RECEIPT' | 'TAX_DECLARATION' | 'AUDIT_LOG_HASH';
  file_hash_sha256: string;
  signed_by: string;
  timestamp: string;
  storage_location: string;
  immutable_lock: boolean;
}

export interface EvidenceVaultAudit {
  audit_id: string;
  organization_id: string;
  auditor_email: string;
  records_verified: number;
  integrity_status: 'VERIFIED_100_PERCENT' | 'HASH_MISMATCH_DETECTED';
  generated_at: string;
}

// ---------------------------------------------------------------------------
// G. SECURE COMPUTER-USE / RPA GATEWAY
// ---------------------------------------------------------------------------

export interface RPABotDefinition {
  bot_id: string;
  organization_id: string;
  target_application_name: string;
  allowed_actions: Array<'CLICK' | 'TYPE' | 'READ_SCREEN' | 'SUBMIT_FORM'>;
  sandbox_environment: string;
  human_in_loop_required: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'DISABLED';
}

export interface RPATaskExecution {
  execution_id: string;
  bot_id: string;
  employee_id: string;
  screenshot_hash?: string;
  actions_taken: number;
  status: 'SUCCESS' | 'BLOCKED_BY_SECURITY' | 'REQUIRES_HUMAN_INTERVENTION';
  executed_at: string;
}

// ---------------------------------------------------------------------------
// H. CONNECTOR MARKETPLACE
// ---------------------------------------------------------------------------

export interface ConnectorPackage {
  connector_id: string;
  display_name: string;
  category: 'ERP' | 'CRM' | 'BANKING' | 'CLOUD' | 'GOVERNMENT';
  vendor: string;
  version: string;
  rating: number;
  installations_count: number;
  required_scopes: string[];
  price_tier: 'FREE' | 'ENTERPRISE_INCLUDED' | 'PREMIUM';
}

// ---------------------------------------------------------------------------
// I. INDUSTRY & JURISDICTION PACK MARKETPLACE
// ---------------------------------------------------------------------------

export interface IndustryJurisdictionPack {
  pack_id: string;
  country_code: 'AO' | 'PT' | 'BR' | 'MZ' | 'GLOBAL';
  industry: 'ACCOUNTING' | 'FINANCE' | 'LEGAL' | 'LOGISTICS' | 'HEALTHCARE';
  title: string;
  compliance_frameworks: string[];
  included_roles_count: number;
  version: string;
}

// ---------------------------------------------------------------------------
// J. DEPLOYMENT & DATA RESIDENCY LAYER
// ---------------------------------------------------------------------------

export type ResidencyRegion = 'EU_FRANKFURT' | 'AFRICA_LUANDA' | 'US_EAST' | 'GLOBAL_MULTI_REGION';

export interface DataResidencyPolicy {
  policy_id: string;
  organization_id: string;
  primary_storage_region: ResidencyRegion;
  backup_storage_region: ResidencyRegion;
  llm_processing_region: ResidencyRegion;
  strict_geo_fencing: boolean;
  compliance_certifications: string[];
}

// ---------------------------------------------------------------------------
// K. ENTERPRISE IDENTITY LIFECYCLE — SCIM / JOINER-MOVER-LEAVER
// ---------------------------------------------------------------------------

export type IdentityEventType = 'USER_JOINED' | 'USER_MOVED' | 'USER_LEFT' | 'ROLE_CHANGED' | 'ACCESS_REVOKED';

export interface JoinerMoverLeaverEvent {
  event_id: string;
  organization_id: string;
  user_email: string;
  event_type: IdentityEventType;
  previous_department?: string;
  new_department?: string;
  affected_employee_bindings: string[];
  scim_sync_status: 'SYNCHRONIZED' | 'PENDING' | 'FAILED';
  processed_at: string;
}

// ---------------------------------------------------------------------------
// AWEEP GLOBAL SUMMARY
// ---------------------------------------------------------------------------

export interface AWEEPGlobalSummary {
  total_firms_registered: number;
  total_managed_client_orgs: number;
  active_workflows_count: number;
  active_ai_teams_count: number;
  enterprise_search_queries_24h: number;
  continuous_experiments_active: number;
  evidence_records_secured: number;
  rpa_executions_24h: number;
  installed_connectors_count: number;
  active_jurisdiction_packs: number;
  primary_data_residency_region: ResidencyRegion;
  scim_sync_status: 'HEALTHY' | 'SYNCING' | 'ERROR';
}
