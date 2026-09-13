export type OrganizationStatus =
  | 'DRAFT'
  | 'CONFIGURING'
  | 'READY'
  | 'SUSPENDED'
  | 'ARCHIVED';

export interface Organization {
  organization_id: string;
  tenant_id: string;
  legal_name: string;
  trade_name: string;
  tax_id: string;
  country: string;
  currency: string;
  locale: string;
  timezone: string;
  industry: string;
  company_size: string;
  fiscal_year_start: string;
  status: OrganizationStatus;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export type TenantStatus =
  | 'PROVISIONING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DECOMMISSIONING'
  | 'DECOMMISSIONED';

export type TenantEnvironment =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'SHADOW'
  | 'PRODUCTION';

export interface TenantEntity {
  tenant_id: string;
  organization_id: string;
  tenant_key: string;
  environment: TenantEnvironment;
  data_region: string;
  security_profile: string;
  status: TenantStatus;
  created_at: string;
}

export type OrganizationUnitType =
  | 'HEADQUARTERS'
  | 'BRANCH'
  | 'STORE'
  | 'WAREHOUSE'
  | 'FACTORY'
  | 'CONSTRUCTION_SITE'
  | 'OFFICE'
  | 'DEPARTMENT'
  | 'COST_CENTER'
  | 'OTHER';

export interface OrganizationUnit {
  unit_id: string;
  organization_id: string;
  parent_unit_id?: string;
  type: OrganizationUnitType;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type OrganizationPackStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'VALID'
  | 'SUPERSEDED'
  | 'STALE';

export interface OrganizationPack {
  organization_pack_id: string;
  organization_id: string;
  version: number;
  status: OrganizationPackStatus;
  business_units: string[];
  departments: string[];
  cost_centers: string[];
  bank_accounts: {
    bank_name: string;
    account_number: string;
    iban: string;
    currency: string;
  }[];
  policies: string[];
  approval_matrix: {
    threshold_aoa: number;
    required_role: string;
  }[];
  effective_from: string;
  created_by: string;
  created_at: string;
}

export type CommercialAreaSubscriptionStatus =
  | 'NOT_SUBSCRIBED'
  | 'TRIAL'
  | 'SUBSCRIBED'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface CommercialAreaSubscription {
  subscription_id: string;
  organization_id: string;
  area_id: string;
  area_name: string;
  plan_id: string;
  status: CommercialAreaSubscriptionStatus;
  start_date: string;
  end_date?: string;
  billing_model: string;
  created_at: string;
}

export type EntitlementStatus =
  | 'AVAILABLE'
  | 'RESTRICTED'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'REVOKED';

export interface OrganizationEmployeeEntitlement {
  entitlement_id: string;
  organization_id: string;
  area_id: string;
  rolepack_id: number;
  rolepack_key: string;
  source: string;
  status: EntitlementStatus;
  valid_from: string;
  valid_to?: string;
}

export type EmployeeInstanceStatus =
  | 'AVAILABLE'
  | 'CONFIGURING'
  | 'CONFIGURED'
  | 'READINESS_CHECK'
  | 'READY'
  | 'ACTIVATING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'DEGRADED'
  | 'BLOCKED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type EmployeeScopeType =
  | 'ORGANIZATION_WIDE'
  | 'UNIT_SCOPED'
  | 'DEPARTMENT_SCOPED'
  | 'SITE_SCOPED'
  | 'PROJECT_SCOPED'
  | 'RESOURCE_SCOPED';

export type CPEAAAutonomyLevel =
  | 'L0_OBSERVE'
  | 'L1_ANALYZE'
  | 'L2_RECOMMEND'
  | 'L3_PREPARE'
  | 'L4_EXECUTE_LIMITED'
  | 'L5_SUPERVISED_AUTONOMOUS';

export interface CPEAAEmployeeInstance {
  employee_instance_id: string;
  organization_id: string;
  tenant_id: string;
  rolepack_id: number;
  rolepack_version: string;
  home_area_id: string;
  scope_type: EmployeeScopeType;
  scope_id?: string;
  display_name: string;
  status: EmployeeInstanceStatus;
  pilot_mode: boolean;
  autonomy_level: CPEAAAutonomyLevel;
  risk_level: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  primary_supervisor_user_id: string;
  backup_supervisor_user_id?: string;
  reviewer_user_id?: string;
  approver_policy_id?: string;
  organization_pack_version: number;
  created_at: string;
  created_by: string;
  config_version: number;
  config_fingerprint?: string;
  activated_at?: string;
  paused_at?: string;
  deactivated_at?: string;
}

export interface EmployeeInstanceDataPermission {
  permission_id: string;
  employee_instance_id: string;
  resource_type: string;
  resource_id: string;
  access_mode: 'NONE' | 'READ_METADATA' | 'READ' | 'READ_WRITE';
  status: 'ACTIVE' | 'DENIED';
}

export interface CPEAAConnectionProfile {
  connection_profile_id: string;
  organization_id: string;
  type:
    | 'PRIMAVERA_V10'
    | 'BANK'
    | 'GOOGLE_DRIVE'
    | 'SHAREPOINT'
    | 'EMAIL'
    | 'EXCEL'
    | 'SQL'
    | 'API';
  name: string;
  mode: 'READ_ONLY' | 'READ_WRITE';
  status: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
}

export interface EmployeeInstanceConnection {
  employee_instance_connection_id: string;
  employee_instance_id: string;
  connection_profile_id: string;
  allowed_operations: string[];
  status: 'ACTIVE' | 'BLOCKED';
}

export interface EmployeeInstanceToolPermission {
  employee_instance_id: string;
  tool_id: string;
  allowed: boolean;
  constraints: string[];
}

export interface EmployeeInstanceActionPermission {
  employee_instance_id: string;
  action_type:
    | 'CAN_READ'
    | 'CAN_ANALYZE'
    | 'CAN_PREPARE'
    | 'CAN_RECOMMEND'
    | 'CAN_WRITE'
    | 'CAN_SEND'
    | 'CAN_POST'
    | 'CAN_PAY'
    | 'CAN_APPROVE';
  authority: 'ALLOWED' | 'REQUIRES_APPROVAL' | 'PROHIBITED';
}

export type ReadinessState =
  | 'READY'
  | 'READY_WITH_WARNINGS'
  | 'NEEDS_CONNECTION'
  | 'NEEDS_DATA'
  | 'NEEDS_PERMISSION'
  | 'NEEDS_SUPERVISOR'
  | 'NEEDS_APPROVER'
  | 'NEEDS_CONFIGURATION'
  | 'CERTIFICATION_REQUIRED'
  | 'BLOCKED';

export interface EmployeeOrganizationReadiness {
  readiness_id: string;
  employee_instance_id: string;
  tenant_id: string;
  evaluated_at: string;
  overall_state: ReadinessState;
  score: number;
  checks: {
    entitlement_valid: boolean;
    rolepack_active: boolean;
    platform_certification_valid: boolean;
    organization_ready: boolean;
    tenant_active: boolean;
    organization_pack_valid: boolean;
    connections_healthy: boolean;
    permissions_configured: boolean;
    scope_enforced: boolean;
    supervisor_assigned: boolean;
    approver_policy_configured: boolean;
    autonomy_within_cap: boolean;
    output_route_ready: boolean;
    audit_enabled: boolean;
  };
  blockers: string[];
  warnings: string[];
}

export interface ActivationGateResult {
  employee_instance_id: string;
  tenant_id: string;
  status: 'ACTIVE' | 'ACTIVATION_BLOCKED';
  activated_at?: string;
  config_fingerprint?: string;
  blockers: string[];
}

export interface CPEAAGlobalSummary {
  totalOrganizations: number;
  totalTenants: number;
  totalAreaSubscriptions: number;
  totalEntitlements: number;
  totalInstances: number;
  instancesByState: Record<string, number>;
  readyToActivateCount: number;
  activeCount: number;
}
