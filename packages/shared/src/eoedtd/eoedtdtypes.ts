/**
 * PROMPT MESTRE — ENTERPRISE OFFBOARDING, EMPLOYEE DEACTIVATION & TENANT DECOMMISSIONING (EOEDTD v1.0)
 * Data contracts and type definitions for enterprise offboarding, access revocation, data retention, purge, and tenant decommissioning.
 */

export type OffboardingScopeType =
  | 'EMPLOYEE_OFFBOARDING'
  | 'AREA_OFFBOARDING'
  | 'UNIT_OFFBOARDING'
  | 'SITE_OFFBOARDING'
  | 'CONNECTION_OFFBOARDING'
  | 'ORGANIZATION_OFFBOARDING'
  | 'TENANT_DECOMMISSIONING';

export type OffboardingReasonCode =
  | 'CONTRACT_END'
  | 'CLIENT_REQUEST'
  | 'AREA_CANCELLATION'
  | 'EMPLOYEE_NO_LONGER_NEEDED'
  | 'SITE_CLOSURE'
  | 'UNIT_CLOSURE'
  | 'SECURITY_EVENT'
  | 'NON_PAYMENT'
  | 'RESTRUCTURING'
  | 'MIGRATION'
  | 'OTHER';

export type OffboardingCaseStatus =
  | 'DRAFT'
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'GRACE_PERIOD'
  | 'OFFBOARDING_IN_PROGRESS'
  | 'READ_ONLY_RETENTION'
  | 'PURGE_ELIGIBLE'
  | 'PURGE_BLOCKED'
  | 'PURGING'
  | 'DECOMMISSIONING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type EmployeeOffboardingStatus =
  | 'ACTIVE'
  | 'OFFBOARDING_REQUESTED'
  | 'STOPPING_NEW_WORK'
  | 'DRAINING'
  | 'PAUSED'
  | 'DEACTIVATING'
  | 'DEACTIVATED'
  | 'ARCHIVED';

export type AreaOffboardingStatus =
  | 'SUBSCRIBED'
  | 'CANCELLATION_REQUESTED'
  | 'CANCELLATION_SCHEDULED'
  | 'GRACE_PERIOD'
  | 'DRAINING'
  | 'ENTITLEMENTS_REVOKING'
  | 'CANCELLED'
  | 'ARCHIVED';

export type TenantOffboardingStatus =
  | 'ACTIVE'
  | 'CANCELLATION_SCHEDULED'
  | 'OFFBOARDING'
  | 'READ_ONLY_RETENTION'
  | 'ARCHIVED'
  | 'DECOMMISSIONING'
  | 'DECOMMISSIONED';

export type OpenWorkResolutionOption =
  | 'FINISH_THEN_DEACTIVATE'
  | 'CANCEL_AND_DEACTIVATE'
  | 'TRANSFER_AND_DEACTIVATE'
  | 'PAUSE_FOR_REVIEW';

export type LegalHoldStatus =
  | 'ACTIVE'
  | 'REVIEW_DUE'
  | 'RELEASED'
  | 'EXPIRED';

export type DataPurgeStatus =
  | 'NOT_ELIGIBLE'
  | 'ELIGIBLE'
  | 'BLOCKED'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'VERIFICATION'
  | 'COMPLETED'
  | 'FAILED';

export interface OffboardingCase {
  offboarding_case_id: string;
  organization_id: string;
  tenant_id: string;
  scope_type: OffboardingScopeType;
  scope_id: string;
  reason_code: OffboardingReasonCode;
  reason_text: string;
  requested_by: string;
  requested_at: string;
  effective_service_stop_at: string;
  read_only_until: string;
  retention_end_at: string;
  status: OffboardingCaseStatus;
  legal_hold_status: 'NONE' | 'ACTIVE' | 'BLOCKED';
  billing_close_status: 'OPEN' | 'CALCULATING' | 'CLOSED';
  export_status: 'NOT_REQUESTED' | 'REQUESTED' | 'GENERATING' | 'READY' | 'DELIVERED';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OffboardingSchedule {
  offboarding_schedule_id: string;
  offboarding_case_id: string;
  freeze_at: string;
  stop_new_work_at: string;
  deactivate_employees_at: string;
  revoke_connections_at: string;
  read_only_until: string;
  retention_end_at: string;
  purge_after: string;
  status: 'SCHEDULED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';
}

export interface OffboardingAction {
  offboarding_action_id: string;
  offboarding_case_id: string;
  action_type:
    | 'STOP_NEW_WORK'
    | 'PAUSE_EMPLOYEE'
    | 'DEACTIVATE_EMPLOYEE'
    | 'REVOKE_ENTITLEMENT'
    | 'CANCEL_AREA'
    | 'UNBIND_CONNECTION'
    | 'REVOKE_CONNECTION'
    | 'DESTROY_SECRET'
    | 'CANCEL_SCHEDULE'
    | 'DISABLE_WEBHOOK'
    | 'DISABLE_EVENT_SUBSCRIPTION'
    | 'FREEZE_ORG_PACK'
    | 'LOCK_TENANT'
    | 'GENERATE_EXPORT'
    | 'CLOSE_BILLING'
    | 'START_RETENTION'
    | 'PURGE_DATA'
    | 'DECOMMISSION_TENANT'
    | 'GENERATE_CERTIFICATE';
  target_type: 'EMPLOYEE' | 'AREA' | 'CONNECTION' | 'TENANT' | 'SECRET' | 'EXPORT' | 'ORG';
  target_id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'RETRYING' | 'BLOCKED' | 'SKIPPED';
  started_at?: string;
  completed_at?: string;
  error_code?: string;
  error_detail?: string;
}

export interface AreaOffboardingDependencyCheck {
  area_id: string;
  organization_id: string;
  dependent_areas: Array<{
    area_id: string;
    area_name: string;
    relationship_type: 'SUPPLIES_DATA_TO' | 'RECEIVES_DATA_FROM' | 'TRIGGERS' | 'DEPENDS_ON' | 'SHARES_CONNECTOR_WITH';
  }>;
  active_employees_count: number;
  open_workflows_count: number;
  shared_connectors_count: number;
  has_blocking_dependency: boolean;
  warnings: string[];
}

export interface OpenWorkImpactSummary {
  offboarding_case_id: string;
  running_tasks_count: number;
  queued_tasks_count: number;
  scheduled_jobs_count: number;
  pending_approvals_count: number;
  cross_area_dependencies_count: number;
  recommended_action: OpenWorkResolutionOption;
}

export interface OffboardingExportPackage {
  export_package_id: string;
  offboarding_case_id: string;
  organization_id: string;
  included_categories: string[];
  excluded_categories: string[];
  generated_at: string;
  hash: string;
  delivery_method: 'DIRECT_DOWNLOAD' | 'SECURE_CLOUD_LINK' | 'ENCRYPTED_ARCHIVE';
  delivery_status: 'NOT_REQUESTED' | 'REQUESTED' | 'GENERATING' | 'READY' | 'DELIVERED' | 'EXPIRED';
  download_expiry: string;
  size_bytes: number;
}

export interface DataRetentionPolicy {
  policy_id: string;
  data_category:
    | 'TASK_DATA'
    | 'DOCUMENTS'
    | 'APPROVED_OUTPUTS'
    | 'AUDIT'
    | 'BILLING'
    | 'SECURITY_LOGS'
    | 'OPERATIONAL_MEMORY'
    | 'CONNECTOR_LOGS'
    | 'EMPLOYEE_INSTANCE_CONFIG'
    | 'CERTIFICATION_HISTORY'
    | 'INCIDENTS';
  retention_period_days: number;
  retention_basis: string; // e.g. "Commercial Code Art. 45 / Tax Retention"
  effective_from: string;
  legal_hold_allowed: boolean;
  purge_method: 'LOGICAL_DELETE' | 'SECURE_DELETE' | 'CRYPTO_SHRED' | 'STORAGE_EXPIRY';
  backup_treatment: 'EXPIRE_NATURALLY_WITH_TOMBSTONE' | 'IMMEDIATE_PURGE_REINDEX';
}

export interface LegalHold {
  legal_hold_id: string;
  organization_id: string;
  scope_type: 'ORGANIZATION' | 'AREA' | 'EMPLOYEE' | 'DATA_CATEGORY';
  scope_id: string;
  reason: string;
  authority: string;
  start_at: string;
  end_at?: string;
  status: LegalHoldStatus;
  created_by: string;
  case_reference?: string;
}

export interface DataDeletionCertificate {
  certificate_id: string;
  organization_id: string;
  offboarding_case_id: string;
  categories_deleted: string[];
  categories_retained: string[];
  retention_basis: string;
  legal_hold_exceptions: string[];
  purge_completed_at: string;
  verification_status: 'PASS' | 'PASS_WITH_RETAINED_AUDIT' | 'FAILED';
  authorized_by: string;
  audit_reference: string;
  verification_hash: string;
}

export interface DeletionTombstone {
  tombstone_id: string;
  tenant_id: string;
  organization_id: string;
  entity_type: 'ORGANIZATION' | 'EMPLOYEE_INSTANCE' | 'AREA' | 'DATA_RECORD';
  entity_id: string;
  deleted_at: string;
  purge_certificate_id: string;
  restore_protection: 'BLOCK_AND_PURGE' | 'SILENT_SUPPRESS';
}

export interface OffboardingCertificate {
  certificate_id: string;
  organization_id: string;
  offboarding_case_id: string;
  service_stop_at: string;
  areas_cancelled: number;
  employees_deactivated: number;
  connections_revoked: number;
  secrets_destroyed: number;
  exports_delivered: boolean;
  retention_status: string;
  purge_status: string;
  legal_hold_summary: string;
  billing_status: string;
  tenant_status: TenantOffboardingStatus;
  completed_at: string;
  authorized_by: string;
  audit_reference: string;
  certificate_fingerprint: string;
}

export interface EOEDTDGlobalSummary {
  active_offboarding_cases_count: number;
  scheduled_cases_count: number;
  grace_period_cases_count: number;
  read_only_retention_tenants_count: number;
  decommissioned_tenants_count: number;
  active_legal_holds_count: number;
  purge_blocked_cases_count: number;
  completed_purge_certificates_count: number;
}
