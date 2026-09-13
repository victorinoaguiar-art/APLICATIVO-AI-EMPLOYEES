/**
 * AI Employee Controlled Paid Scale, Customer Success, Retention, Expansion & Metric Maturity Engine
 * Data Contracts & Types (AETF-500 Release v3.0 - WAVE 2 Hardening)
 */

import { CommercialPlanTier, CommercialCurrency } from './commerce2026types.js';
import { OnboardingCohortWave, MetricSource, EvidenceEnvironment } from './firstPaidCustomerTypes.js';

export type CustomerLifecycleStage =
  | 'LEAD'
  | 'QUALIFIED'
  | 'CONTRACTED'
  | 'ACTIVATING'
  | 'FIRST_VALUE_PENDING'
  | 'ACTIVE_ADOPTED'
  | 'HEALTHY'
  | 'ATTENTION_REQUIRED'
  | 'AT_RISK'
  | 'RECOVERY'
  | 'EXPANSION_READY'
  | 'RENEWAL_PENDING'
  | 'RENEWED'
  | 'CHURNED';

export type CustomerHealthState = 'EXCELLENT' | 'HEALTHY' | 'ATTENTION' | 'AT_RISK' | 'CRITICAL';
export type ChurnRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ChurnType = 'LOGO_CHURN' | 'REVENUE_CHURN' | 'VOLUNTARY_CHURN' | 'INVOLUNTARY_CHURN' | 'CONTRACTION' | 'PAUSE';

export type RenewalStatus =
  | 'RENEWAL_NOT_DUE'
  | 'RENEWAL_INTENT'
  | 'RENEWAL_PREPARATION'
  | 'RENEWAL_READY'
  | 'RENEWAL_PENDING'
  | 'RENEWAL_CONTRACTED'
  | 'RENEWAL_INVOICED'
  | 'RENEWAL_PAID'
  | 'RENEWAL_SETTLED'
  | 'RENEWAL_RECONCILED'
  | 'RENEWAL_CONFIRMED'
  | 'RENEWAL_COMPLETED'
  | 'RENEWAL_FAILED'
  | 'RENEWAL_AT_RISK'
  | 'RENEWAL_CANCELLED';

export type ExpansionReadinessLevel = 'NOT_READY' | 'POTENTIAL' | 'READY' | 'HIGH_OPPORTUNITY';
export type ProfitabilityStatus = 'HIGHLY_PROFITABLE' | 'PROFITABLE' | 'MARGIN_WARNING' | 'LOW_MARGIN' | 'NEGATIVE_CONTRIBUTION';
export type SupportSeverity = 'S1_CRITICAL' | 'S2_HIGH' | 'S3_MEDIUM' | 'S4_LOW';

export type MetricMaturity =
  | 'SIMULATED'
  | 'MODELLED'
  | 'PROJECTED'
  | 'PROVISIONAL_OBSERVED'
  | 'OBSERVED'
  | 'LONGITUDINALLY_OBSERVED'
  | 'AUDITED';

export type LTVType = 'MODELLED_LTV' | 'PROJECTED_LTV' | 'COHORT_LTV' | 'OBSERVED_LTV';

export interface MetricProvenanceRecord {
  provenance_id: string;
  metric_id: string;
  source: MetricSource;
  source_record_id?: string;
  source_tables?: string[];
  source_events?: string[];
  evidence_ids?: string[];
  query_version?: string;
  formula_version?: string;
  calculation_job?: string;
  calculated_at?: string;
  calculated_by?: string;
  timestamp?: string;
  provenance_hash: string;
  audit_trail: string[];
}

export interface StrategicMetricRecord {
  metric_id: string;
  metric_key: string;
  metric_name: string;
  metric_value: number;
  value: number;
  unit: string;
  maturity: MetricMaturity;
  ltv_type?: LTVType;
  source: MetricSource;
  customer_scope: string; // e.g. "COHORT_WAVE_2"
  cohort_id: string;
  wave: OnboardingCohortWave;
  measurement_window_start: string;
  measurement_window_end: string;
  observation_days: number;
  formula_id: string;
  formula_version: string;
  calculation_method: string;
  provenance: MetricProvenanceRecord;
  confidence_level: 'LOW_SAMPLE_CONFIDENCE' | 'HIGH_CONFIDENCE';
  temporal_scope?: string;
  notes: string;
}

export interface MRRReconciliationRecord {
  customer_id?: string;
  subscription_id?: string;
  contracted_mrr: number;
  contracted_mrr_aoa: number;
  contracted_mrr_maturity: MetricMaturity;
  contracted_mrr_provenance: MetricProvenanceRecord;

  billed_mrr: number;
  billed_mrr_aoa: number;
  billed_mrr_maturity: MetricMaturity;
  billed_mrr_provenance: MetricProvenanceRecord;

  collected_mrr: number;
  collected_mrr_aoa: number;
  collected_mrr_maturity: MetricMaturity;
  collected_mrr_provenance: MetricProvenanceRecord;

  recognized_mrr: number;
  reconciled_recognized_mrr_aoa: number;
  reconciled_recognized_mrr_maturity: MetricMaturity;
  reconciled_recognized_mrr_provenance: MetricProvenanceRecord;

  difference: number;
  variance_aoa: number;
  status: 'MATCHED' | 'DISCREPANCY';
  reconciled: boolean;
  reconciled_at: string;
}

export interface MetricDistributionResult {
  metric_name: string;
  sample_size: number;
  sample_count: number;
  mean: number;
  median: number;
  p75: number;
  p90: number;
  p95: number;
  min: number;
  max: number;
  unit: string;
  standard_deviation?: number;
  sample_warning?: 'SMALL_SAMPLE_SIZE';
}

export interface CustomerSuccessProfile {
  customer_id: string;
  customer_name: string;
  tenant_id: string;
  complexity_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'ENTERPRISE';
  lifecycle_stage: CustomerLifecycleStage;
  health_state: CustomerHealthState;
  health_score: number; // 0 - 100
  activation_score: number; // 0 - 100
  ftv_hours: number;
  active_employee_count: number;
  active_instances_count: number;
  monthly_contract_value_aoa: number;
  plan_tier: CommercialPlanTier;
  churn_risk_level: ChurnRiskLevel;
  churn_risk_score: number; // 0 - 100
  expansion_readiness: ExpansionReadinessLevel;
  expansion_readiness_score: number; // 0 - 100
  nrr_pct: number;
  grr_pct: number;
  created_at: string;
  last_updated_at: string;
}

export interface RevenueMetricsSnapshot {
  period_iso: string; // e.g. "2026-09"
  contracted_mrr_aoa: number;
  billed_mrr_aoa: number;
  collected_mrr_aoa: number;
  recognized_mrr_aoa: number;
  mrr_aoa: number; // Contracted MRR
  arr_aoa: number; // Derived: Eligible MRR * 12
  new_mrr_aoa: number;
  expansion_mrr_aoa: number;
  contraction_mrr_aoa: number;
  churned_mrr_aoa: number;
  reactivation_mrr_aoa: number;
  nrr_pct: number;
  nrr_maturity?: MetricMaturity;
  grr_pct: number;
  grr_maturity?: MetricMaturity;
  arpa_aoa: number;
  active_customers_count: number;
  total_employee_instances: number;
  calculated_at: string;
}

export interface CustomerUnitEconomics {
  customer_id: string;
  monthly_revenue_aoa: number;
  ai_cost_aoa: number;
  infrastructure_cost_aoa: number;
  api_cost_aoa: number;
  storage_cost_aoa: number;
  support_cost_aoa: number;
  payment_fees_aoa: number;
  integration_cost_aoa: number;
  total_variable_cost_aoa: number;
  contribution_margin_aoa: number;
  contribution_margin_pct: number;
  profitability_status: ProfitabilityStatus;
  cac_aoa: number;
  cac_payback_months: number;
  ltv_type: LTVType;
  observed_ltv_aoa: number;
  projected_ltv_aoa: number;
  ltv_cac_ratio: number;
  ltv_cac_label: string; // e.g. "Projected LTV / Observed CAC"
  evaluated_at: string;
}

export interface RenewalForecastRecord {
  renewal_id: string;
  customer_id: string;
  contract_end_date: string;
  days_to_renewal: number;
  current_mrr_aoa: number;
  renewal_probability_pct: number;
  expected_renewal_mrr_aoa: number;
  renewal_status: RenewalStatus;
  renewal_risk: ChurnRiskLevel;
  recommended_playbook: string;
}

export interface ExpansionOpportunityRecord {
  opportunity_id: string;
  customer_id: string;
  opportunity_type: 'ADDITIONAL_INSTANCE' | 'ADDITIONAL_EMPLOYEE' | 'PLAN_UPGRADE' | 'DEPARTMENT_PACK' | 'AI_TEAM';
  target_employee_id: string;
  recommended_plan?: CommercialPlanTier;
  expected_additional_mrr_aoa: number;
  readiness_level: ExpansionReadinessLevel;
  confidence_score: number; // 0 - 100
  evidence_of_need: string;
  status: 'IDENTIFIED' | 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
}

export interface SupportTicketRecord {
  ticket_id: string;
  customer_id: string;
  severity: SupportSeverity;
  category: 'BUG' | 'CONFIGURATION' | 'INTEGRATION' | 'BILLING' | 'EMPLOYEE_BEHAVIOUR';
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  sla_response_time_minutes: number;
  sla_target_hours: number;
  actual_response_time_minutes: number;
  resolved_in_sla: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface CustomerValueRealizationReport {
  customer_id: string;
  measurement_period_days: number;
  total_tasks_completed: number;
  total_tasks_accepted: number;
  acceptance_rate_pct: number;
  estimated_hours_saved: number;
  process_acceleration_factor: number;
  error_reduction_pct: number;
  estimated_cost_savings_aoa: number;
  observed_roi_pct: number;
  value_evidence_hash: string;
  generated_at: string;
}

export interface CommercialMetricMaturityGateResult {
  gate_name: 'COMMERCIAL_METRIC_MATURITY_GATE' | 'WAVE_2_FINAL_FREEZE_GATE';
  wave_id: OnboardingCohortWave;
  baseline_id: string;
  status: 'PASSED' | 'FAILED';
  passed: boolean;
  frozen_at: string;
  baseline_hash: string;
  previous_wave1_baseline_id: string;
  previous_wave1_baseline_immutable: boolean;
  mrr_reconciliation?: MRRReconciliationRecord;
  revenue_weighted_margin_pct?: number;
  simple_average_margin_pct?: number;
  ftv_distribution?: MetricDistributionResult;
  metrics_count?: number;
  metrics?: StrategicMetricRecord[];
  compliance_verification: {
    ltv_cac_labeled_correctly: boolean;
    nrr_grr_temporal_maturity_valid: boolean;
    renewal_intent_vs_completed_separated: boolean;
    arr_classified_as_derived: boolean;
    provenance_audit_passed: boolean;
  };
  mrr_observed?: boolean;
  arr_derived?: boolean;
  arpa_observed?: boolean;
  nrr_maturity_classified?: boolean;
  grr_maturity_classified?: boolean;
  renewal_signal_vs_actual_explicit?: boolean;
  cac_evidenced?: boolean;
  ltv_type_classified?: boolean;
  ltv_cac_qualification_disclosed?: boolean;
  revenue_weighted_margin_available?: boolean;
  ftv_distribution_available?: boolean;
  metric_provenance_100_pct?: boolean;
  gate_passed?: boolean;
  evaluated_at?: string;
}

export interface WaveCertificationResult {
  wave_id: OnboardingCohortWave;
  certified: boolean;
  customers_count: number;
  successful_customers_count: number;
  critical_incidents_count: number;
  avg_ftv_hours: number;
  p90_ftv_hours: number;
  simple_average_margin_pct: number;
  revenue_weighted_margin_pct?: number;
  avg_contribution_margin_pct?: number;
  evidence_completeness_pct: number;
  nrr_pct: number;
  nrr_maturity?: MetricMaturity;
  scorecard_summary: Record<string, boolean>;
  certified_at: string;
  next_wave_authorized?: OnboardingCohortWave;
}
