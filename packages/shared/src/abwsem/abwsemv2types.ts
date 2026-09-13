/**
 * ABWSEM v2.0 — Area-Based Digital Workforce Subscription & Entitlement Model
 * Types and Contracts for 48 Commercial Areas + 1 Platform Workforce Management Layer
 */

export type CommercialAreaTypeV2 = 'FUNCTIONAL_AREA' | 'SECTOR_AREA' | 'PLATFORM_LAYER';

export type CommercialAreaCodeV2 =
  // 28 Functional / Horizontal Areas (A01 - A28)
  | 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07' | 'A08' | 'A09' | 'A10'
  | 'A11' | 'A12' | 'A13' | 'A14' | 'A15' | 'A16' | 'A17' | 'A18' | 'A19' | 'A20'
  | 'A21' | 'A22' | 'A23' | 'A24' | 'A25' | 'A26' | 'A27' | 'A28'
  // 20 Sectoral / Vertical Areas (S01 - S20)
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09' | 'S10'
  | 'S11' | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18' | 'S19' | 'S20'
  // 1 Platform Layer (P01)
  | 'P01';

export interface AreaIndependenceTest {
  buyer_budget_owner: boolean;
  business_outcome: boolean;
  kpis: boolean;
  data_tools: boolean;
  process_ownership: boolean;
  standalone_value: boolean;
  commercial_clarity: boolean;
  passed: boolean;
}

export interface CommercialAreaV2 {
  commercial_area_id: string;
  code: CommercialAreaCodeV2;
  name: string;
  type: CommercialAreaTypeV2;
  description: string;
  target_buyer: string;
  typical_kpis: string[];
  key_outcomes: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'BETA';
  display_order: number;
  home_roles_count: number;
  included_capabilities_count: number;
  recommended_integrations: string[];
  independence_test: AreaIndependenceTest;
}

export type AreaMembershipTypeV2 =
  | 'PRIMARY_EMPLOYEE'
  | 'CAPABILITY'
  | 'SPECIALIZATION'
  | 'TASK_PACK'
  | 'INTERNAL_SUPPORT'
  | 'MERGED_ROLE';

export interface AreaRoleMembershipV2 {
  commercial_area_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  rolepack_id: number;
  rolepack_key: string;
  rolepack_title: string;
  membership_type: AreaMembershipTypeV2;
  semantic_category: 'KEEP' | 'CAPABILITY' | 'SPECIALIZATION' | 'TASK PACK' | 'INTERNAL ONLY' | 'MERGE';
  is_home_area: boolean;
  related_commercial_area_codes: CommercialAreaCodeV2[];
  display_in_catalog: boolean;
  included_by_default: boolean;
}

export type EmployeeAreaStatusV2 =
  | 'NOT_ENTITLED'
  | 'AVAILABLE'
  | 'CONFIGURING'
  | 'READY_FOR_ACTIVATION'
  | 'ACTIVE'
  | 'PAUSED'
  | 'DEGRADED'
  | 'SUSPENDED'
  | 'RETIRED';

export type AreaSubscriptionPlanV2 =
  | 'SINGLE_AREA'
  | 'MULTI_AREA'
  | 'FUNCTIONAL_SUITE'
  | 'INDUSTRY_SUITE'
  | 'BUSINESS_SUITE'
  | 'ENTERPRISE_ALL_AREAS';

export interface AreaSubscriptionV2 {
  subscription_id: string;
  organization_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  plan_id: AreaSubscriptionPlanV2;
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED';
  started_at: string;
  renewal_at: string;
  monthly_fee_kwz: number;
  usage_policy: {
    max_active_employees?: number;
    max_concurrency?: number;
    unlimited_available_access: boolean;
  };
}

export interface AreaEntitlementV2 {
  organization_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  rolepack_id: number;
  entitlement_type: AreaMembershipTypeV2;
  status: 'ENTITLED' | 'NOT_ENTITLED';
  employee_status: EmployeeAreaStatusV2;
  source_subscription_id: string;
}

export interface EmployeeActivationGateV2 {
  area_entitlement_valid: boolean;
  platform_certified: boolean;
  organization_ready: boolean;
  input_readiness_valid: boolean;
  permissions_configured: boolean;
  required_connections_configured: boolean;
  autonomy_risk_policy_configured: boolean;
  human_supervisor_configured: boolean;
  passed_all: boolean;
  missing_requirements: string[];
}

export interface AreaEmployeeActivationV2 {
  activation_id: string;
  organization_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  rolepack_id: number;
  rolepack_key: string;
  activation_status: EmployeeAreaStatusV2;
  supervisor_email?: string;
  autonomy_level: 'FULL_AUTONOMY' | 'HUMAN_APPROVAL_REQUIRED' | 'STRICT_SUPERVISION';
  risk_policy_code: string;
  activated_at: string;
  gate_evaluation: EmployeeActivationGateV2;
}

export interface AreaOutcomeInputV2 {
  outcome_id: string;
  commercial_area_code: CommercialAreaCodeV2;
  desired_outcome: string;
  primary_rolepack_id: number;
  primary_rolepack_title: string;
  required_inputs: Array<{
    input_key: string;
    description: string;
    classification: 'REQUIRED' | 'CONDITIONAL' | 'RECOMMENDED';
    example: string;
  }>;
  recommended_connections: string[];
  expected_deliverable: string;
}

export interface AreaRecommendationV2 {
  recommendation_id: string;
  business_need: string;
  recommended_area_code: CommercialAreaCodeV2;
  recommended_area_name: string;
  included_rolepack_id: number;
  included_rolepack_title: string;
  reason: string;
  required_inputs: string[];
  required_connections: string[];
  estimated_monthly_value_kwz: number;
  is_subscribed: boolean;
  action: 'ACTIVATE_INCLUDED_EMPLOYEE' | 'SUBSCRIBE_COMMERCIAL_AREA';
}

export interface ABWSEMV2GlobalSummary {
  total_areas: number;
  total_functional_areas: number; // 28
  total_sectoral_areas: number;   // 20
  total_platform_layers: number;  // 1
  total_sellable_areas: number;   // 48
  total_rolepacks_accounted: number; // 500
  total_commercial_home_rolepacks: number; // 490
  total_platform_rolepacks: number; // 10 (#251-#260)
  ait_compliance_rate: number; // 100%
  subscriptions_count: number;
  active_activations_count: number;
  area_independence_enforced: boolean;
}
