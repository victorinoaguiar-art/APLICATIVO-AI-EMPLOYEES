/**
 * AI Employee Marketplace, Hiring, Subscription, Deployment & Revenue Operations
 * Data Contracts & Types (AETF-500 Commercial Release 2026)
 */

import { CertificationLevelAETF } from '../aetf/aetf2026types.js';

export type CommercialPlanTier = 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
export type CommercialBillingCycle = 'MONTHLY' | 'ANNUAL' | 'PAY_PER_TASK';
export type CommercialCurrency = 'AOA' | 'USD' | 'EUR';
export type CommercialSubscriptionStatus =
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export type CommercialDeploymentStatus =
  | 'NOT_DEPLOYED'
  | 'ACTIVATING'
  | 'HEALTHY'
  | 'DEGRADED'
  | 'TERMINATED';

export interface CommercialPricingFloor {
  model_cost: number;
  compute_cost: number;
  storage_cost: number;
  connector_cost: number;
  hitl_cost: number;
  risk_reserve: number;
  target_margin_pct: number;
  minimum_digital_salary: number;
}

export interface MarketplaceItem {
  catalog_id: string;
  employee_template_id: string;
  employee_name: string;
  role_title: string;
  department: string;
  cert_level: CertificationLevelAETF;
  operational_status: 'PRODUCTION_READY_FULL' | 'PRODUCTION_READY_RESTRICTED';
  supported_plans: CommercialPlanTier[];
  base_monthly_price: Record<CommercialCurrency, number>;
  pricing_floor: CommercialPricingFloor;
  sla_guarantee_pct: number;
  included_tasks_per_month: number;
  overage_cost_per_task: Record<CommercialCurrency, number>;
  hitl_cost_per_escalation: Record<CommercialCurrency, number>;
  skills: string[];
  supported_connectors: string[];
  restrictions?: string[];
}

export interface HiringRequest {
  hiring_id: string;
  tenant_id: string;
  employee_template_id: string;
  hired_instance_name: string;
  selected_plan: CommercialPlanTier;
  billing_cycle: CommercialBillingCycle;
  currency: CommercialCurrency;
  agreed_digital_salary: number;
  custom_overrides?: {
    sla_tier?: string;
    extra_connectors?: string[];
  };
  contract_signed_at: string;
  contract_terms_hash: string;
}

export interface EmployeeActivationGates {
  tenant_onboarded: boolean;
  cpeaa_policy_assigned: boolean;
  permissions_configured: boolean;
  connectors_connected: boolean;
  financial_limits_set: boolean;
}

export interface CommercialEmployeeInstance {
  instance_id: string;
  hiring_id: string;
  tenant_id: string;
  employee_template_id: string;
  hired_name: string;
  subscription_id: string;
  hired_at: string;
  activated_at?: string;
  activation_status: CommercialSubscriptionStatus;
  deployment_status: CommercialDeploymentStatus;
  activation_gates: EmployeeActivationGates;
  current_period_tasks_executed: number;
  current_period_hitl_escalations: number;
  current_period_cost_accumulated: number;
}

export interface SubscriptionRecord {
  subscription_id: string;
  tenant_id: string;
  instance_id: string;
  employee_template_id: string;
  plan_tier: CommercialPlanTier;
  billing_cycle: CommercialBillingCycle;
  currency: CommercialCurrency;
  digital_salary_monthly: number;
  overage_rate: number;
  hitl_rate: number;
  current_period_start: string;
  current_period_end: string;
  status: CommercialSubscriptionStatus;
  payment_status: 'PAID' | 'DUE' | 'OVERDUE' | 'DEMO_TEST';
  is_demo: boolean;
}

export interface UsageEventCostBreakdown {
  model_cost: number;
  compute_cost: number;
  connector_cost: number;
  hitl_cost: number;
  total_cost: number;
}

export interface UsageEvent {
  event_id: string;
  instance_id: string;
  tenant_id: string;
  timestamp: string;
  task_type: string;
  tokens_used: number;
  compute_ms: number;
  connectors_invoked: string[];
  hitl_escalated: boolean;
  cost_breakdown: UsageEventCostBreakdown;
}

export interface CommercialContractRecord {
  contract_id: string;
  hiring_id: string;
  tenant_id: string;
  instance_id: string;
  digital_employee_name: string;
  legal_disclaimer: string;
  terms_and_conditions: string;
  signed_at: string;
  terms_sha256: string;
}

export interface UnitEconomicsRecord {
  employee_template_id: string;
  employee_name: string;
  department: string;
  monthly_digital_salary: number;
  monthly_direct_cost: number;
  gross_margin_aoa: number;
  gross_margin_pct: number;
  human_equivalent_cost_aoa: number;
  roi_for_client_pct: number;
}

export interface CommercialRevenueMetrics {
  total_arr_aoa: number;
  total_mrr_aoa: number;
  real_paid_mrr_aoa: number;
  demo_simulated_mrr_aoa: number;
  active_subscriptions_count: number;
  total_instances_deployed: number;
  average_revenue_per_employee_arpe: number;
  gross_margin_pct: number;
  net_margin_pct: number;
  blended_cac_aoa: number;
  ltv_aoa: number;
  payback_period_months: number;
  churn_rate_pct: number;
  currency_breakdown: Record<CommercialCurrency, number>;
}

export interface MarketplaceSearchResult {
  total_catalog_items: number;
  filtered_items: MarketplaceItem[];
  department_summary: Record<string, number>;
  cert_level_summary: Record<string, number>;
}
