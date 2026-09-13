/**
 * SMCH-CP v1.0 — Social Media Connector Hub & Controlled Publishing Data Contracts
 * Scope: A08 Marketing & Enterprise Social Media Connections
 */

export type SocialMediaProvider =
  | 'META_FACEBOOK'
  | 'META_INSTAGRAM'
  | 'LINKEDIN'
  | 'TIKTOK'
  | 'YOUTUBE'
  | 'X_TWITTER';

export type SocialProviderAccountType =
  | 'BUSINESS_ACCOUNT'
  | 'PROFESSIONAL_ACCOUNT'
  | 'ORGANIZATION_PAGE'
  | 'CREATOR_ACCOUNT'
  | 'PERSONAL_ACCOUNT'
  | 'CHANNEL'
  | 'AD_ACCOUNT';

export type SocialCapabilityState =
  | 'SUPPORTED'
  | 'SUPPORTED_WITH_LIMITS'
  | 'REQUIRES_BUSINESS_ACCOUNT'
  | 'REQUIRES_PROFESSIONAL_ACCOUNT'
  | 'REQUIRES_ADDITIONAL_AUTHORIZATION'
  | 'REQUIRES_PROVIDER_REVIEW'
  | 'UNSUPPORTED'
  | 'TEMPORARILY_UNAVAILABLE';

export type SocialConnectionMode =
  | 'READ_ONLY'
  | 'READ_AND_PREPARE'
  | 'PUBLISH_WITH_APPROVAL'
  | 'LIMITED_AUTONOMOUS_PUBLISHING'
  | 'ADS_READ_ONLY'
  | 'ADS_PREPARE'
  | 'ADS_EXECUTE_WITH_APPROVAL';

export type SocialTokenState =
  | 'ACTIVE'
  | 'REFRESH_DUE'
  | 'REFRESHING'
  | 'EXPIRED'
  | 'REVOKED'
  | 'INVALID';

export type SocialConnectionProfileStatus =
  | 'NOT_CONFIGURED'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'CONNECTED_READ_ONLY'
  | 'READY_FOR_BINDING'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'BLOCKED';

export type EmployeeSocialBindingStatus =
  | 'DRAFT'
  | 'READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'REVOKED';

export type SocialContentPostStatus =
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

export type SocialDeliveryState =
  | 'PENDING'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'PARTIAL'
  | 'RETRYING'
  | 'CANCELLED';

export type AssetRightsState =
  | 'UNKNOWN'
  | 'CLIENT_OWNED'
  | 'LICENSED'
  | 'APPROVED'
  | 'RESTRICTED'
  | 'BLOCKED';

export interface SocialProviderCapability {
  capability_key: string;
  name: string;
  state: SocialCapabilityState;
  granted_scope?: string;
  notes?: string;
}

export interface SocialMediaConnectionProfile {
  social_connection_profile_id: string;
  organization_id: string;
  tenant_id: string;
  provider: SocialMediaProvider;
  provider_account_id: string;
  provider_account_type: SocialProviderAccountType;
  display_name: string;
  credential_reference: string;
  granted_scopes: string[];
  capabilities: SocialProviderCapability[];
  mode: SocialConnectionMode;
  status: SocialConnectionProfileStatus;
  health: 'HEALTHY' | 'ATTENTION' | 'DEGRADED' | 'EXPIRED' | 'REVOKED' | 'BLOCKED';
  token_state: SocialTokenState;
  last_authenticated_at: string;
  last_refreshed_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeSocialConnectionBinding {
  binding_id: string;
  employee_instance_id: string;
  employee_role_id: string; // e.g. #026, #027, #029, #031, #033, #036
  social_connection_profile_id: string;
  allowed_capabilities: string[];
  scope_constraints: string[];
  approval_policy_id: string;
  status: EmployeeSocialBindingStatus;
  created_at: string;
}

export interface SocialContentSnapshot {
  snapshot_id: string;
  task_id: string;
  employee_instance_id: string;
  provider: SocialMediaProvider;
  account_id: string;
  text: string;
  media_refs: string[];
  link?: string;
  hashtags: string[];
  mentions: string[];
  scheduled_at?: string;
  content_hash: string;
  version: number;
  status: SocialContentPostStatus;
  approval_ref?: string;
  created_at: string;
}

export interface SocialDeliveryReceipt {
  delivery_id: string;
  provider: SocialMediaProvider;
  account_id: string;
  provider_post_id: string;
  content_snapshot_id: string;
  content_hash: string;
  published_at: string;
  published_by_employee_instance: string;
  approved_by: string;
  status: SocialDeliveryState;
  provider_response_ref: string;
}

export interface SocialMediaAsset {
  asset_id: string;
  organization_id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  file_ref: string;
  mime_type: string;
  dimensions?: string;
  duration_seconds?: number;
  rights_status: AssetRightsState;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hash: string;
}

export interface SocialAdsBudgetPolicy {
  policy_id: string;
  organization_id: string;
  ad_account_id: string;
  daily_limit: number;
  campaign_limit: number;
  monthly_limit: number;
  approval_threshold: number;
  currency: string;
  allowed_objectives: string[];
  allowed_regions: string[];
  created_at: string;
}

export interface SocialCommentRecord {
  comment_id: string;
  provider: SocialMediaProvider;
  account_id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  text: string;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS_LEGAL' | 'PII_SENSITIVE';
  status: 'RECEIVED' | 'CLASSIFIED' | 'DRAFTED' | 'APPROVED' | 'PUBLISHED' | 'ESCALATED';
  assigned_employee_id?: string;
  created_at: string;
}

export interface SocialMediaIncident {
  incident_id: string;
  organization_id: string;
  type:
    | 'UNAUTHORIZED_PUBLISH_ATTEMPT'
    | 'WRONG_ACCOUNT_TARGET'
    | 'TOKEN_EXPOSURE'
    | 'PROVIDER_REVOCATION'
    | 'PUBLISH_FAILURE'
    | 'CONTENT_POLICY_VIOLATION'
    | 'AD_BUDGET_VIOLATION'
    | 'WEBHOOK_SECURITY_FAILURE'
    | 'CROSS_TENANT_ATTEMPT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'MUTED';
  details: string;
  triggered_at: string;
}

export interface SocialConnectionReadinessCheck {
  check_id: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface SocialConnectionReadiness {
  connection_profile_id: string;
  status: 'READY' | 'READY_WITH_WARNINGS' | 'NEEDS_AUTH' | 'TOKEN_EXPIRED' | 'BLOCKED';
  checks: SocialConnectionReadinessCheck[];
  score_percentage: number;
  evaluated_at: string;
}

export interface SMCHCPGlobalSummary {
  total_connections: number;
  active_connections: number;
  active_bindings: number;
  frozen_snapshots: number;
  published_deliveries: number;
  ads_budget_policies: number;
  total_incidents: number;
  kill_switch_active: boolean;
}
