/**
 * AI Employee SaaS Metrics Dictionary v1.1 Semantic & Provenance Hardening
 * Multidimensional Data Contracts & Types (AETF-500 Release v3.1)
 */

import { OnboardingCohortWave, MetricSource } from './firstPaidCustomerTypes.js';

export type MetricDataSource =
  | 'SIMULATED'
  | 'CONTROLLED_TEST'
  | 'STAGING'
  | 'REAL_PRODUCTION'
  | 'EXTERNAL_VERIFIED_SOURCE';

export type MetricCalculationType =
  | 'DIRECT_OBSERVATION'
  | 'DERIVED'
  | 'MODELLED'
  | 'PROJECTED'
  | 'FORECAST';

export type MetricTemporalMaturity =
  | 'POINT_IN_TIME'
  | 'PROVISIONAL'
  | 'PERIOD_OBSERVED'
  | 'MULTI_PERIOD_OBSERVED'
  | 'LONGITUDINAL';

export type MetricAssuranceLevel =
  | 'UNVERIFIED'
  | 'SYSTEM_VERIFIED'
  | 'INTERNALLY_RECONCILED'
  | 'INTERNALLY_AUDITED'
  | 'EXTERNALLY_VERIFIED'
  | 'EXTERNALLY_AUDITED';

export type CACType =
  | 'PAID_ACQUISITION_CAC'
  | 'SALES_ASSISTED_CAC'
  | 'PARTNER_CAC'
  | 'ORGANIC_CAC'
  | 'BLENDED_CAC';

export type CACScope =
  | 'PER_CUSTOMER'
  | 'PER_COHORT'
  | 'PER_CHANNEL'
  | 'PER_SEGMENT'
  | 'PLATFORM_TOTAL';

export type MetricValidityStatus =
  | 'VALID'
  | 'INVALID'
  | 'INCOMPLETE'
  | 'REQUIRES_RECONCILIATION'
  | 'SUPERSEDED';

export type TaxValidationStatus =
  | 'TECHNICALLY_VALIDATED'
  | 'LEGAL_RULE_MATCHED'
  | 'COMPLIANCE_REVIEWED';

export interface MetricObservationRequirement {
  metric_id: string;
  minimum_events?: number;
  minimum_closed_periods?: number;
  minimum_completed_contract_cycles?: number;
  minimum_sample_size?: number;
  notes: string;
}

export interface MetricProvenanceRecordV11 {
  provenance_id: string;
  metric_id: string;

  source_environment: string;
  source_system: string;
  source_record_id: string;

  canonicalization_version: string;
  canonical_payload_size_bytes: number;

  hash_algorithm: 'SHA-256';
  content_hash: string;
  previous_hash?: string;

  formula_id: string;
  formula_version: string;

  data_source: MetricDataSource;
  calculation_type: MetricCalculationType;
  temporal_maturity: MetricTemporalMaturity;
  assurance_level: MetricAssuranceLevel;

  measurement_window_start: string;
  measurement_window_end: string;

  created_at: string;
  verified_at: string;
  verified_by: string;

  status: MetricValidityStatus;
  audit_trail: string[];
}

export interface StrategicMetricRecordV11 {
  metric_id: string;
  metric_key: string;
  metric_name: string;
  metric_value: number;
  unit: string;

  data_source: MetricDataSource;
  calculation_type: MetricCalculationType;
  temporal_maturity: MetricTemporalMaturity;
  assurance_level: MetricAssuranceLevel;

  display_label: string;
  formula_id: string;
  formula_version: string;

  provenance_id: string;
  provenance: MetricProvenanceRecordV11;

  status: MetricValidityStatus;
  customer_scope: string;
  cohort_id: string;
  wave: OnboardingCohortWave;
  notes: string;
}

export interface MRRDecompositionRecordV11 {
  cohort_id: string;
  subscription_mrr_aoa: number;
  contracted_recurring_value_aoa: number;
  recurring_amount_billed_aoa: number;
  cash_collected_aoa: number;
  cash_settled_aoa: number;
  cash_reconciled_aoa: number;
  revenue_recognized_aoa: number;

  contracted_mrr_aoa: number;
  active_mrr_aoa: number;
  new_mrr_aoa: number;
  expansion_mrr_aoa: number;
  contraction_mrr_aoa: number;
  churned_mrr_aoa: number;
  reactivation_mrr_aoa: number;

  is_mrr_invoice_equal: boolean;
  is_mrr_cash_equal: boolean;
  is_mrr_revenue_equal: boolean;

  provenance: MetricProvenanceRecordV11;
  evaluated_at: string;
}

export interface RetentionReconciliationRecordV11 {
  cohort_id: string;
  opening_mrr_aoa: number;
  expansion_mrr_aoa: number;
  contraction_mrr_aoa: number;
  churned_mrr_aoa: number;
  expected_closing_mrr_aoa: number;
  observed_closing_mrr_aoa: number;
  reconciliation_variance_aoa: number;

  nrr_pct: number;
  grr_pct: number;
  reconciliation_status: 'MATCHED' | 'RETENTION_RECONCILIATION_FAILED';

  measurement_window_start: string;
  measurement_window_end: string;
  provenance: MetricProvenanceRecordV11;
}

export interface LTVDecompositionRecordV11 {
  cohort_id: string;
  arpa_aoa: number;
  churn_rate_pct: number;
  contribution_margin_pct: number;

  projected_revenue_ltv_aoa: number;
  projected_contribution_margin_ltv_aoa: number;

  observed_sales_assisted_cac_aoa: number;
  cac_type: CACType;
  cac_scope: CACScope;

  ltv_cac_ratio: number;
  ltv_cac_label: string; // e.g. "Projected Contribution Margin LTV / Observed Sales-Assisted CAC"

  provenance: MetricProvenanceRecordV11;
}

export interface TaxTraceabilityRecordV11 {
  tax_evidence_id: string;
  invoice_id: string;
  customer_id: string;
  jurisdiction: string;
  tax_rule_id: string;
  tax_rule_version: string;
  legal_basis_reference: string;
  tax_validation_status: TaxValidationStatus;
  validation_timestamp: string;
  tax_rate_pct: number;
  tax_base_aoa: number;
  tax_amount_aoa: number;
  provenance_hash: string;
}

export interface Metric4DClassification {
  data_source: MetricDataSource;
  calculation_type: MetricCalculationType;
  temporal_maturity: MetricTemporalMaturity;
  assurance_level: MetricAssuranceLevel;
}

export interface SaaSMetricDefinition {
  metric_id: string;
  metric_key?: string;
  metric_code?: string;
  name?: string;
  metric_name?: string;
  domain?: string;
  category?:
    | 'Revenue'
    | 'Retention'
    | 'Expansion'
    | 'Acquisition'
    | 'Customer Success'
    | 'Value'
    | 'Cost'
    | 'Margin'
    | 'Quality'
    | 'Support'
    | 'Capacity'
    | 'Operational Performance';
  business_definition?: string;
  formula?: string;
  formula_expression?: string;
  formula_version?: string;
  numerator?: string;
  denominator?: string;
  unit?: string;
  source_requirement?: MetricDataSource;
  calculation_type?: MetricCalculationType;
  temporal_requirement?: MetricTemporalMaturity;
  assurance_requirement?: MetricAssuranceLevel;
  dimensions_4d?: Metric4DClassification;
  provenance_v11?: any;
  tax_traceability?: any;
  revenue_decomposition?: any;
  audit_status?: string;
  frozen_baseline?: boolean;
  last_updated?: string;
  measurement_window?: string;
  inclusions?: string[];
  exclusions?: string[];
  examples?: string[];
  edge_cases?: string[];
  reconciliation_rule?: string;
  provenance_required?: boolean;
  display_label?: string;
  status?: 'ACTIVE' | 'SUPERSEDED' | 'DEPRECATED' | 'APPROVED';
}

export interface SaaSMetricsDictionaryV11GateResult {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_FREEZE_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN';
  gate_identifier?: string;
  status: 'PASS' | 'FAIL';
  passed: boolean;
  baseline_frozen?: boolean;
  hardened_version?: string;
  frozen_at: string;
  baseline_hash: string;
  dictionary_hash?: string;
  audited_metrics_count?: number;

  scorecard: {
    multidimensional_classification: boolean;
    mrr_semantics: boolean;
    arr_classification: boolean;
    nrr_grr_reconciliation: boolean;
    renewal_semantics: boolean;
    ltv_separation: boolean;
    cac_scope: boolean;
    ltv_cac_qualification: boolean;
    margin_semantics: boolean;
    ftv_semantics: boolean;
    assurance_model: boolean;
    metric_provenance: boolean;
    sha256_integrity: boolean;
    empty_hash_protection: boolean;
    legal_tax_traceability: boolean;
    migration_v10_to_v11: boolean;
  };
  metrics_count: number;
  metrics: StrategicMetricRecordV11[];
  mrr_decomposition: MRRDecompositionRecordV11;
  retention_reconciliation: RetentionReconciliationRecordV11;
  ltv_decomposition: LTVDecompositionRecordV11;
}

export type RenewalType =
  | 'TRUE_RENEWAL'
  | 'CONTRACT_EXTENSION'
  | 'PLAN_UPGRADE'
  | 'PLAN_DOWNGRADE'
  | 'EXPANSION'
  | 'NEW_COMMITMENT'
  | 'EARLY_RENEWAL';

export type AccountingFramework =
  | 'PGC_ANGOLA'
  | 'IFRS'
  | 'IFRS_FOR_SMES'
  | 'CUSTOM_LOCAL_FRAMEWORK';

export interface SettlementBridgeRecord {
  gross_billed_amount: number;
  gross_payment_amount: number;
  tax_withholding: number;
  payment_processing_fees: number;
  bank_fees: number;
  other_settlement_adjustments: number;
  expected_net_settlement: number;
  actual_net_settlement: number;
  reconciliation_difference: number;
  status: 'RECONCILED' | 'UNRECONCILED';
}

export interface MetricCorrectionRecord {
  record_id: string;
  metric_id: string;
  old_value: any;
  new_value: any;
  old_definition?: string;
  new_definition?: string;
  old_formula_version?: string;
  new_formula_version?: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_evidence_ids: string[];
  approved_by: string;
  corrected_at: string;
}

export interface NPSDataRecord {
  survey_id: string;
  customer_id: string;
  response_score: number;
  respondent_classification: 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';
  promoter_count: number;
  passive_count: number;
  detractor_count: number;
  response_count: number;
  nps: number;
}

export interface RenewalEventRecord {
  renewal_event_id: string;
  original_contract_id: string;
  original_contract_start: string;
  original_contract_end: string;
  renewal_contract_id: string;
  renewal_signed_at: string;
  renewal_effective_from: string;
  renewal_invoice_id: string;
  renewal_payment_id: string;
  renewal_type: RenewalType;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
}

export interface SaaSMetricsPatchScorecardV111 {
  nrr_arithmetic: boolean;
  grr_arithmetic: boolean;
  retention_reconciliation: boolean;
  settlement_bridge: boolean;
  financial_reconciliation: boolean;
  tax_jurisdiction: boolean;
  tax_rule_provenance: boolean;
  multidimensional_4d_classification: boolean;
  arr_temporal_classification: boolean;
  ltv_lineage: boolean;
  cac_reconciliation: boolean;
  ltv_cac_scope: boolean;
  nps_semantics: boolean;
  renewal_semantics: boolean;
  banking_semantics: boolean;
  accounting_framework: boolean;
  metric_dag_integrity: boolean;
  sha256_full_digest: boolean;
  placeholder_hash_protection: boolean;
  data_quality: boolean;
  documentation: boolean;
  tests: boolean;
}

export interface SaaSMetricsDictionaryV111GateResult {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_1_PATCH_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  scorecard: SaaSMetricsPatchScorecardV111;
  corrections_count: number;
  corrections: MetricCorrectionRecord[];
  retention_reconciliation: any;
  settlement_bridge: SettlementBridgeRecord;
}

// ============================================================================
// v1.1.2 COHERENCE PATCH INTERFACES
// ============================================================================

export interface RevenueScopeMetadata {
  metric_id: string;
  numerator: string;
  denominator: string;
  entity_type: 'ACCOUNT' | 'USER' | 'AI_EMPLOYEE' | 'INSTANCE';
  entity_count: number;
  customer_scope: string;
  employee_scope: string;
  instance_scope: string;
  segment_scope: string;
  measurement_window_start: string;
  measurement_window_end: string;
  formula_version: string;
}

export interface ARPADefinition {
  metric_code: 'ARPA';
  name: 'Average Revenue Per Account';
  mrr_aoa: number;
  active_accounts_count: number;
  arpa_aoa: number; // e.g. 1.320.000 / 3 = 440.000 AOA
  entity_scope: 'ACCOUNT';
}

export interface ARPUDefinition {
  metric_code: 'ARPU';
  name: 'Average Revenue Per Unit/User';
  mrr_aoa: number;
  unit_count: number;
  arpu_aoa: number;
  entity_scope: 'UNIT' | 'USER';
}

export interface ARPEDefinition {
  metric_code: 'ARPE';
  name: 'Average Revenue Per AI Employee';
  mrr_aoa: number;
  active_ai_employees_count: number;
  arpe_aoa: number; // e.g. 1.320.000 / 10 = 132.000 AOA
  entity_scope: 'AI_EMPLOYEE';
}

export interface ARPIDefinition {
  metric_code: 'ARPI';
  name: 'Average Revenue Per AI Employee Instance';
  mrr_aoa: number;
  active_instances_count: number;
  arpi_aoa: number;
  entity_scope: 'INSTANCE';
}

export interface CACCostBridge {
  marketing_cost_aoa: number;
  sales_personnel_cost_aoa: number;
  sales_tools_cost_aoa: number;
  partner_commission_aoa: number;
  qualified_acquisition_cost_aoa: number;
  eligible_onboarding_acquisition_cost_aoa: number;
  total_cac_cost_pool_aoa: number;
  customers_acquired_count: number;
  calculated_cac_aoa: number;
}

export interface CACCostAllocationPolicy {
  policy_id: string;
  policy_name: string;
  allowed_cost_categories: ('ACQUISITION_COST' | 'ONBOARDING_COST' | 'MARKETING' | 'SALES_PERSONNEL')[];
  excluded_cost_categories: ('IMPLEMENTATION_COST' | 'CUSTOMER_SUCCESS_COST' | 'SUPPORT_COST')[];
  version: string;
}

export interface CACReconciliationRecordV112 {
  cac_reconciliation_id: string;
  old_metric_id: string;
  new_metric_id: string;
  old_value_aoa: number; // 45.000 AOA
  new_value_aoa: number; // 5.000.000 AOA
  old_cac_type: CACType;
  new_cac_type: CACType;
  old_scope: CACScope;
  new_scope: CACScope;
  old_customer_count: number;
  new_customer_count: number;
  reason: string;
  cost_bridge: CACCostBridge;
  evidence_ids: string[];
  approved_by: string;
  approved_at: string;
  anomaly_alert_triggered: boolean;
}

export interface TaxRuleEvidence {
  tax_rule_id: string;
  jurisdiction: 'AO';
  tax_type: string;
  tax_code: 'II_ISR_WITHHOLDING';
  transaction_type: string;
  supplier_tax_regime: string;
  customer_tax_regime: string;
  taxable_base_aoa: number;
  rate_pct: number; // 2.0%
  effective_from: string;
  effective_to?: string;
  legal_basis_reference: string; // e.g. "Código do Imposto Industrial, Artigo 67.º"
  official_source_reference: string; // "AGT - Administração Geral Tributária"
  tax_rule_version: string;
  legal_review_status: 'LEGAL_CONFIRMED' | 'PENDING_LEGAL_VERIFICATION';
  reviewed_by: string;
  reviewed_at: string;
  tax_evidence_id: string;
}

export interface SettlementTaxBridgeV112 {
  gross_payment_aoa: number;
  legally_valid_withholding_aoa: number;
  payment_fees_aoa: number;
  bank_fees_aoa: number;
  other_valid_adjustments_aoa: number;
  expected_net_settlement_aoa: number;
  actual_net_settlement_aoa: number;
  reconciliation_difference_aoa: number;
  tax_evidence_id: string;
  tax_legal_validation: 'LEGAL_CONFIRMED' | 'PENDING';
  settlement_adjustment_type: 'TAX_WITHHOLDING_ISR' | 'UNCLASSIFIED';
}

export interface RenewalEventRecordV112 {
  renewal_event_id: string;
  customer_id: string;
  original_contract_id: string;
  original_contract_start: string;
  original_contract_end: string;
  event_type: RenewalType;
  new_contract_id: string;
  new_contract_signed_at: string;
  new_period_start: string;
  new_period_end: string;
  days_before_expiry?: number;
  invoice_id: string;
  payment_id: string;
  settlement_id: string;
  reconciliation_id: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  evidence_ids: string[];
}

export interface AccountingFrameworkRecord {
  accounting_framework_id: string;
  framework: AccountingFramework;
  framework_version: string;
  jurisdiction: 'AO';
  entity_reporting_basis: string;
  revenue_recognition_policy_id: string;
  policy_version: string;
  effective_from: string;
  legal_or_accounting_reference: string;
  validation_status: 'VALIDATED' | 'INVALID_HYBRID';
}

export interface RevenueRecognitionPolicyRecord {
  revenue_event_id: string;
  contract_id: string;
  accounting_framework: AccountingFramework;
  performance_obligation: string;
  recognition_method: 'RATABLE_OVER_TIME' | 'POINT_IN_TIME';
  recognition_period_start: string;
  recognition_period_end: string;
  amount_recognized_aoa: number;
  cash_collected_aoa: number;
  invoice_amount_aoa: number;
  policy_version: string;
  evidence_ids: string[];
  cash_equals_revenue: boolean; // false
  billing_equals_revenue: boolean;
}

export interface BankingRoleSemantics {
  payment_provider: string;
  payment_network: string;
  settlement_provider: string;
  settlement_bank: string;
  commercial_bank: string;
  central_bank_context: string; // e.g. "BNA - Banco Nacional de Angola (Regulador)"
  is_central_bank_settlement_bank: boolean; // false
  account_reference: string;
  statement_reference: string;
  settlement_timestamp: string;
  evidence_id: string;
  status: 'VALIDATED' | 'SEMANTIC_VIOLATION';
}

export interface MetricDAGNode {
  metric_id: string;
  metric_code: string;
  name: string;
  formula_version: string;
  level: number;
}

export interface MetricDAGEdge {
  source_metric: string;
  target_metric: string;
  dependency_type: 'FORMULA_INPUT' | 'DIMENSION' | 'FILTER' | 'ASSUMPTION';
  formula_version: string;
  required: boolean;
}

export interface MetricDAGImpactAnalysis {
  changed_upstream_metric: string;
  affected_downstream_metrics: string[];
  has_cycles: boolean;
  cycle_count: number;
}

export interface BaselineHashManifestV112 {
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN';
  previous_baseline: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  artifact_count: number;
  total_bytes: number;
  canonicalization_version: '1.0';
  hash_algorithm: 'SHA-256';
  artifacts: {
    artifact_id: string;
    path: string;
    bytes: number;
    sha256: string;
  }[];
  baseline_manifest_hash: string;
  generated_at: string;
  verified_at: string;
  verification_status: 'VERIFIED' | 'PROVENANCE_INTEGRITY_FAILURE';
}

export interface RequirementTestEvidenceMatrix {
  matrix_version: '1.1.2';
  generated_at: string;
  traceability_records: {
    requirement_id: string;
    requirement_description: string;
    implementation_component: string;
    test_id: string;
    test_name: string;
    expected_result: string;
    actual_result: string;
    evidence_ids: string[];
    status: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_TESTED' | 'NOT_APPLICABLE';
  }[];
  orphan_requirements_count: number;
  orphan_tests_count: number;
  orphan_evidence_count: number;
  full_coverage_certified: boolean;
}

export interface PredictiveMetricEligibilityGuard {
  metric_id: string;
  metric_status: 'VALID' | 'INVALID';
  provenance_verified: boolean;
  scope_validated: boolean;
  formula_version: string | null;
  eligible_for_prediction: boolean;
}

export interface SaaSMetricsCoherenceScorecardV112 {
  arpa_reconciliation: boolean;
  arpu_arpe_scope: boolean;
  ltv_recalculation: boolean;
  cac_historical_reconciliation: boolean;
  cac_cost_policy: boolean;
  ltv_cac_scope_compatibility: boolean;
  tax_2pct_rule_evidence: boolean;
  tax_jurisdiction_validation: boolean;
  renewal_event_reconciliation: boolean;
  accounting_framework_semantics: boolean;
  revenue_recognition_semantics: boolean;
  banking_role_semantics: boolean;
  metric_mathematical_dag: boolean;
  dag_cycle_detection: boolean;
  full_sha256_digests: boolean;
  baseline_manifest_hash: boolean;
  requirement_test_evidence_matrix: boolean;
  full_requirement_coverage: boolean;
}

export interface SaaSMetricsDictionaryV112GateResult {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_2_COHERENCE_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  scorecard: SaaSMetricsCoherenceScorecardV112;
  arpa_definition: ARPADefinition;
  arpe_definition: ARPEDefinition;
  cac_reconciliation: CACReconciliationRecordV112;
  tax_rule_evidence: TaxRuleEvidence;
  renewal_event: RenewalEventRecordV112;
  accounting_framework: AccountingFrameworkRecord;
  banking_semantics: BankingRoleSemantics;
  dag_nodes: MetricDAGNode[];
  dag_edges: MetricDAGEdge[];
  manifest: BaselineHashManifestV112;
  traceability_matrix: RequirementTestEvidenceMatrix;
  wave_3_authorized: boolean;
}

// ============================================================================
// v1.1.3 CORRECTION PATCH INTERFACES
// ============================================================================

export type ConfidenceClassification =
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'INTERNALLY_VERIFIED'
  | 'EXTERNALLY_VERIFIED'
  | 'UNVERIFIED'
  | 'BLOCKED';

export type FinalBaselineDecision =
  | 'BASELINE_CONFIRMED'
  | 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING'
  | 'BASELINE_REQUIRES_MATERIAL_CORRECTION'
  | 'BASELINE_NOT_CERTIFIABLE';

export interface CACChangeEvidenceRecord {
  cac_change_id: string;
  previous_value_aoa: number; // 45.000 AOA
  previous_source: string; // "Simplified Blended Marketing Cost"
  previous_assumptions: string; // "Dividing basic ad spend by customers"
  current_value_aoa: number; // 5.000.000 AOA
  current_source: string; // "Full Enterprise Sales-Assisted CAC Cost Pool"
  reason_for_change: string; // "Inclusion of sales personnel, CRM tools, commissions and onboarding costs"
  formula: string; // "Eligible Cost Pool (15.000.000 AOA) / Customers Acquired (3)"
  temporal_universe: string; // "Q3 2026 Cohort"
  denominator_entity: 'ACCOUNT';
  economic_impact: string; // "Accurate LTV/CAC ratio representation for enterprise sales"
  approved_by: string;
  timestamp: string;
  evidence_id: string;
  evidence_hash: string;
}


export interface TaxRuleEvidenceV113 {
  tax_rule_id: string;
  jurisdiction: 'AO';
  tax_type: string;
  legal_instrument: string; // "Lei n.º 19/14, de 22 de Outubro (alterada pela Lei n.º 26/20)"
  article: string; // "Artigo 67.º (Retenção na Fonte)"
  version_date: string;
  effective_from: string;
  rate_pct: number; // 2.0%
  taxable_base: string; // "Fatura ilíquida de prestação de serviços SaaS"
  taxpayer_scope: string; // "Entidades residentes sujeitas ao Regime Geral do Imposto Industrial"
  official_source: string; // "Diário da República de Angola / AGT"
  source_url?: string;
  evidence_hash: string;
  validation_status: 'EXTERNAL_LEGAL_VALIDATION_REQUIRED' | 'LEGALLY_VALIDATED';
  disclaimer: string;
}

export interface AccountingEntryMapping {
  entry_id: string;
  transaction_type: string;
  debit_account: string; // "31.1.1 - Clientes Correntes Nacionais" (Remediated from 43.1)
  credit_account: string; // "62.1.1 - Prestações de Serviço SaaS B2B" (Remediated from 71.1)
  tax_account?: string; // "34.5.3 - IVA Liquidado 14%"
  currency: 'AOA';
  amount_aoa: number;
  accounting_date: string;
  document_id: string;
  tax_component_aoa: number;
  cost_center: string;
  tenant_id: string;
  framework: 'PGC_ANGOLA';
  basis: 'ACCRUAL_BASIS';
  evidence_id: string;
}

export interface AuthoritativeSourceMapping {
  domain_information: string;
  authoritative_source: string;
  fallback_rule: string;
}

export interface MaterialCorrectionItem {
  correction_id: string;
  area: string;
  problem_description: string;
  before_state: string;
  after_state: string;
  evidence_reference: string;
  impact: string;
  status: 'CORRECTED' | 'RECONCILED' | 'DOWNGRADED_FOR_PROOF';
}

export interface SaaSMetricsDictionaryV113GateResult {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_3_CORRECTION_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.3_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  final_decision: FinalBaselineDecision;
  confidence_classification: ConfidenceClassification;
  cac_change_evidence: CACChangeEvidenceRecord;
  tax_rule_evidence: TaxRuleEvidenceV113;
  material_corrections_count: number;
  material_corrections: MaterialCorrectionItem[];
  authoritative_sources: AuthoritativeSourceMapping[];
  accounting_entries: AccountingEntryMapping[];
}

// ============================================================================
// PGC ANGOLA (Decreto n.º 82/01) & IVA (Decreto Presidencial n.º 180/19) v1.1.4
// ============================================================================

export type PGCAccountClass =
  | 'CLASS_1_MEIOS_FIXOS'
  | 'CLASS_2_EXISTENCIAS'
  | 'CLASS_3_TERCEIROS'
  | 'CLASS_4_MEIOS_MONETARIOS'
  | 'CLASS_5_CAPITAL_RESERVAS'
  | 'CLASS_6_PROVEITOS_E_GANHOS'
  | 'CLASS_7_CUSTOS_E_PERDAS'
  | 'CLASS_8_RESULTADOS';

export interface PGCAccountRegistryItem {
  account_id: string;
  account_code: string;
  account_name: string;
  account_class: PGCAccountClass;
  account_subclass: string;
  parent_account?: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'CONTRA_ASSET';
  normal_balance: 'DEBIT' | 'CREDIT';
  posting_allowed: boolean;
  currency_scope: 'AOA' | 'MULTI_CURRENCY';
  market_scope: 'DOMESTIC' | 'FOREIGN' | 'BOTH';
  customer_scope?: 'GROUP' | 'NON_GROUP' | 'BOTH';
  supplier_scope?: 'GROUP' | 'NON_GROUP' | 'BOTH';
  tax_scope?: 'VAT' | 'INDUSTRIAL_TAX' | 'STAMP_TAX' | 'NONE';
  payment_scope?: 'DEMAND_DEPOSIT' | 'CLEARING' | 'CASH' | 'NONE';
  allowed_event_types: string[];
  source_document: 'Decreto n.º 82/01' | 'Decreto Presidencial n.º 180/19';
  source_page?: number;
  source_version: string;
  effective_from: string;
  effective_to?: string;
  evidence_id: string;
  validation_status: 'SUPPORTED_BY_PROVIDED_DOCUMENT' | 'DOCUMENT_VERIFIED' | 'EXTERNAL_LEGAL_VALIDATION_REQUIRED';
  version: string;
}

export interface AccountUsageInventoryItem {
  account_code: string;
  used_in: string;
  event_type: string;
  rule_id: string;
  current_description: string;
  current_mapping: string;
  expected_mapping: string;
  source: string;
  status: 'MATERIAL_ERROR_CORRECTED' | 'VERIFIED_CORRECT' | 'UNKNOWN_ACCOUNT_BLOCKED';
  correction_required: boolean;
}

export interface VATSubaccount345 {
  code: string; // "34.5.1" .. "34.5.9"
  name: string;
  state_type:
    | 'VAT_SUPPORTED'
    | 'VAT_DEDUCTIBLE'
    | 'VAT_LIQUIDATED'
    | 'VAT_REGULARIZATION'
    | 'VAT_SETTLEMENT'
    | 'VAT_PAYABLE'
    | 'VAT_RECOVERABLE'
    | 'VAT_REFUND_REQUESTED'
    | 'VAT_OFFICIAL_ASSESSMENT';
  rate_pct: number;
}

export interface RevenueRecognitionScheduleV114 {
  schedule_id: string;
  contract_id: string;
  subscription_id: string;
  customer_id: string;
  invoice_id: string;
  service_start: string;
  service_end: string;
  billing_date: string;
  billing_amount: number;
  tax_amount: number;
  recognisable_amount: number;
  recognised_to_date: number;
  remaining_unrecognised: number;
  recognition_method: 'RATABLE_DAILY' | 'RATABLE_MONTHLY' | 'POINT_IN_TIME';
  recognition_frequency: 'MONTHLY';
  journal_rule: string;
  account_mapping_rule: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';
  evidence_id: string;
}

export interface JournalLineSchemaV114 {
  line_id: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  tax_code?: string;
  cost_center: string;
  rule_id: string;
  evidence_id: string;
}

export interface JournalEntrySchemaV114 {
  journal_id: string;
  transaction_id: string;
  event_id: string;
  document_id: string;
  tenant_id: string;
  customer_id: string;
  subscription_id?: string;
  ai_employee_id?: string;
  accounting_date: string;
  recognition_date: string;
  currency: 'AOA';
  description: string;
  lines: JournalLineSchemaV114[];
  total_debit: number;
  total_credit: number;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  created_at: string;
  posted_at?: string;
  reversed_at?: string;
  pgc_version_id: string;
  evidence_hash: string;
}

export interface PGCVersionRegistryItem {
  version_id: string;
  legal_instrument: string;
  publication_date: string;
  effective_from: string;
  effective_to?: string;
  supersedes?: string;
  source_document: string;
  source_hash: string;
  validation_status: 'SUPPORTED_BY_PROVIDED_DOCUMENT' | 'EXTERNAL_LEGAL_VALIDATION_REQUIRED';
}

export interface TaxRuleVersionRegistryItem {
  jurisdiction: 'AO';
  tax_type: 'IVA' | 'INDUSTRIAL_TAX_ISR' | 'STAMP_TAX';
  rule_id: string;
  rate: number;
  tax_base: string;
  taxpayer_scope: string;
  transaction_scope: string;
  effective_from: string;
  effective_to?: string;
  legal_source: string;
  validation_status: 'SUPPORTED_BY_PROVIDED_DOCUMENT' | 'EXTERNAL_LEGAL_VALIDATION_REQUIRED';
  evidence_id: string;
}

export interface AccountingSubgateResult {
  subgate_id:
    | 'PGC_STRUCTURE_GATE'
    | 'PGC_MAPPING_GATE'
    | 'VAT_ACCOUNTING_GATE'
    | 'REVENUE_RECOGNITION_GATE'
    | 'PAYMENT_ACCOUNTING_GATE'
    | 'BANK_ACCOUNTING_GATE'
    | 'FX_ACCOUNTING_GATE'
    | 'JOURNAL_INTEGRITY_GATE'
    | 'ACCOUNTING_EVIDENCE_GATE';
  name: string;
  passed: boolean;
  details: string;
}

export interface AccountingGateV114Result {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_4_ACCOUNTING_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.4_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.3_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  internal_remediation_status: 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE';
  external_validation_status: 'ACCOUNTING_EXTERNAL_VALIDATION = PENDING';
  errors_found: number;
  errors_corrected: number;
  accounts_reviewed: number;
  accounts_changed: number;
  unknown_accounts_found: number;
  unknown_accounts_blocked: number;
  vat_rules_implemented: number;
  revenue_recognition_rules_corrected: number;
  payment_rules_corrected: number;
  banking_rules_corrected: number;
  fx_rules_corrected: number;
  journal_rules_corrected: number;
  tests_executed: number;
  tests_passed: number;
  tests_failed: number;
  subgates: AccountingSubgateResult[];
  pgc_structure_status: 'VERIFIED';
  pgc_mapping_status: 'VERIFIED';
  vat_accounting_status: 'INTERNALLY_VERIFIED';
  revenue_recognition_status: 'VERIFIED';
  payment_accounting_status: 'VERIFIED';
  banking_accounting_status: 'VERIFIED';
  fx_accounting_status: 'VERIFIED';
  journal_integrity_status: 'VERIFIED';
  accounting_evidence_status: 'VERIFIED';
}

// ============================================================================
// PGC ANGOLA ACCURACY & EVIDENCE CLOSURE PATCH v1.1.5
// ============================================================================

export interface AnalyticDimensionsV115 {
  service_family?: string; // "SaaS"
  commercial_model?: string; // "B2B"
  product_family?: string; // "AI Employees"
  tenant_id?: string;
  ai_employee_id?: string;
  cost_center?: string;
}

export interface ExternalValidationRegisterItem {
  validation_id: string;
  subject: string;
  type: 'TAX_LAW' | 'ACCOUNTING_REGULATION' | 'BANKING_API_INTEGRATION';
  reason: string;
  internal_status: 'INTERNALLY_VERIFIED' | 'SUPPORTED_BY_DOCUMENT';
  external_status: 'EXTERNAL_VALIDATION_REQUIRED' | 'PENDING_OFFICIAL_DIARIO_REVIEW';
  required_source: string;
  owner: string;
  blocking: boolean;
}

// ============================================================================
// DEFERRED REVENUE, VAT SEMANTICS & CRYPTOGRAPHIC INTEGRITY FINAL PATCH v1.1.6
// ============================================================================

export interface AnalyticDimensionsV116 {
  revenue_type?: string; // "SaaS"
  product_family?: string; // "AI Employees"
  commercial_model?: string; // "Subscription"
  recognition_method?: string; // "Time-Based"
  service_family?: string; // "SaaS"
  tenant_id?: string;
  ai_employee_id?: string;
  cost_center?: string;
}

export type ExternalValidationStatusV116 =
  | 'PENDING_LEGAL_SOURCE_VALIDATION'
  | 'PENDING_ACCOUNTING_PROFESSIONAL_REVIEW'
  | 'PENDING_TAX_AUTHORITY_CONFIRMATION'
  | 'PENDING_AGT_SOFTWARE_CERTIFICATION'
  | 'PENDING_BANK_TECHNICAL_VALIDATION'
  | 'EXTERNAL_LEGAL_VALIDATION_REQUIRED';

export interface ExternalValidationRegisterItemV116 {
  validation_id: string;
  subject: string;
  type: 'TAX_LAW' | 'ACCOUNTING_REGULATION' | 'BANKING_API_INTEGRATION' | 'LEGAL_TAX_VALIDATION';
  reason: string;
  internal_status: 'INTERNALLY_VERIFIED' | 'SUPPORTED_BY_DOCUMENT' | 'UNVERIFIED_CURRENT_LAW';
  external_status: ExternalValidationStatusV116;
  required_source: string;
  owner: string;
  blocking: boolean;
}

export interface RevenueRecognitionScheduleV116 {
  schedule_id: string;
  contract_id: string;
  subscription_id: string;
  invoice_id: string;
  customer_id: string;
  service_start: string;
  service_end: string;
  billing_date: string;
  billing_amount: number;
  tax_amount: number;
  recognisable_amount: number;
  recognised_to_date: number;
  deferred_amount: number;
  remaining_deferred_amount: number;
  recognition_frequency: 'MONTHLY';
  recognition_method: 'RATABLE_MONTHLY' | 'POINT_IN_TIME';
  deferred_account: '37.6';
  revenue_account: string; // e.g. "62.1.1"
  analytic_dimensions: AnalyticDimensionsV116;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  evidence_id: string;
}

export interface VATOfficialSubaccountRegistryItemV116 {
  parent_code: string; // "34.5.1" .. "34.5.9"
  subaccount_code: string;
  official_name: string;
  account_nature: 'DEBIT' | 'CREDIT' | 'DEBIT_CREDIT';
  usage: string;
  source_document: string; // "Decreto Presidencial n.º 180/19"
  source_page?: number;
  implemented: boolean;
  applicable: boolean;
  evidence_id: string;
}

export interface VATCoverageMetricsV116 {
  vat_top_level_account_families_total: number; // 9
  vat_top_level_account_families_implemented: number; // 9
  vat_official_subaccounts_total: number;
  vat_official_subaccounts_implemented: number;
  vat_official_subaccounts_not_applicable: number;
  vat_official_subaccounts_pending: number;
}

export interface AccountingGateV115Result {
  gate_name: string;
  baseline_id: string;
  previous_baseline_id: string;
  previous_baseline_status: string;
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  pgc_31_1_1_mapping_status?: string;
  pgc_31_1_2_1_mapping_status?: string;
  pgc_62_1_1_mapping_status?: string;
  vat_34_5_families_status?: string;
  vat_desdobramentos_status?: string;
  external_validation_register_status?: string;
  withholding_2_percent_validation_status?: string;
  final_accounting_status?: string;
  final_baseline_status?: string;
  tests_passed?: number;
  tests_executed?: number;
  legacy_material_errors_found?: number;
  additional_accounting_findings?: number;
  total_accounting_findings?: number;
  external_validations_total?: number;
  subgates?: any[];
}

export interface ArtifactHashManifestItemV116 {
  artifact_id: string;
  filename: string;
  relative_path: string;
  version: string;
  size_bytes: number;
  sha256_stored: string;
  sha256_recomputed: string;
  hash_match: boolean;
  generated_at: string;
  evidence_id: string;
}

export interface BaselineHashManifestV116 {
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.6_FROZEN';
  hash_algorithm: 'SHA-256';
  generated_at: string;
  artifacts: ArtifactHashManifestItemV116[];
  manifest_digest_file?: string;
}

export interface AccountingGateV116Result {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_6_FINAL_ACCOUNTING_INTEGRITY_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.6_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.5_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  deferred_revenue_49_1_error_corrected: boolean;
  pgc_37_6_mapping_status: 'VALIDATED_OFFICIAL_PGC';
  deferred_revenue_logic_status: 'INTERNALLY_VERIFIED';
  vat_34_5_9_error_corrected: boolean; // Corrected to "IVA liquidações oficiosas"
  vat_top_level_families_implemented: number; // 9
  vat_official_subaccount_coverage: string;
  vat_rate_versioning_status: 'DECOUPLED_AND_VERSIONED';
  external_validation_register_status: 'INTERNALLY_VERIFIED_WITH_5_ITEMS';
  withholding_2_percent_validation_status: 'REINTRODUCED_EXT_VAL_WHT_2PCT';
  artifacts_total: number;
  artifacts_hashed: number;
  empty_files_found: number; // 0
  empty_sha256_hashes_found: number; // 0
  hash_mismatches_found: number; // 0
  manifest_integrity_status: 'VERIFIED';
  digital_signature_status: 'NOT_IMPLEMENTED';
  integrity_protection: 'SHA256_HASHED';
  document_generation_status: 'SYSTEM_GENERATED';
  tests_executed: number;
  tests_passed: number;
  tests_failed: number;
  internal_accounting_defects_remaining: number; // 0
  final_accounting_status: 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export interface VATOfficialSubaccountRegistryItemV117 {
  parent_code: string;
  subaccount_code: string;
  official_name: string;
  account_level: 4;
  account_nature: 'DEBIT' | 'CREDIT' | 'DEBIT_CREDIT';
  usage: string;
  source_document: string;
  source_article: number;
  account_origin: 'OFFICIAL_STATUTORY' | 'ENTITY_SPECIFIC_INTERNAL';
  implemented: boolean;
  applicable: boolean;
  evidence_id: string;
}

export interface VATCoverageMetricsV117 {
  vat_top_level_account_families_total: number;
  vat_top_level_account_families_implemented: number;
  vat_official_fourth_level_subaccounts_total: number;
  vat_official_fourth_level_subaccounts_implemented: number;
  vat_internal_extensions_total: number;
  vat_invalid_official_subaccounts_found: number;
}

export interface ArtifactHashManifestItemV117 {
  artifact_id: string;
  filename: string;
  relative_path: string;
  version: string;
  size_bytes: number;
  sha256_stored: string;
  sha256_recomputed: string;
  hash_match: boolean;
  generated_at: string;
  evidence_id: string;
}

export interface BaselineHashManifestV117 {
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.7_FROZEN';
  hash_algorithm: 'SHA-256';
  generated_at: string;
  artifacts: ArtifactHashManifestItemV117[];
  sidecar_metadata: {
    sidecar_filename: string;
    content_value: string;
    sidecar_sha256: string;
    classification: 'INTEGRITY_METADATA';
  };
}

export interface AccountingGateV117Result {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_7_FINAL_PRECISION_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.7_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.6_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  baseline_manifest_hash: string;
  pgc_49_1_name_status: 'CORRECTED_TITULOS_NEGOCIAVEIS';
  pgc_37_parent_name_status: 'CORRECTED_OUTROS_VALORES_A_RECEBER_E_A_PAGAR';
  pgc_37_6_family_status: 'SUPPORTED_BY_PROVIDED_PGC';
  saas_deferred_revenue_policy_status: 'INTERNALLY_MODELLED_PENDING_ACCOUNTING_POLICY_APPROVAL';
  vat_top_level_families_implemented: number;
  vat_official_fourth_level_total: number;
  vat_official_fourth_level_implemented: number;
  vat_invalid_official_subaccounts_found: number;
  vat_34_5_9_1_classified_as_official: boolean;
  vat_rate_versioning_status: 'DECOUPLED_AND_VERSIONED';
  external_validation_register_status: 'INTERNALLY_VERIFIED_WITH_5_ITEMS';
  withholding_2_percent_validation_status: 'EXTERNAL_LEGAL_VALIDATION_REQUIRED';
  baseline_artifacts_total: number;
  integrity_metadata_files_total: number;
  empty_files_found: number;
  empty_sha256_hashes_found: number;
  hash_mismatches_found: number;
  manifest_sidecar_validation_status: 'VERIFIED';
  digital_signature_status: 'NOT_IMPLEMENTED';
  integrity_protection: 'SHA256_HASHED';
  document_generation_status: 'SYSTEM_GENERATED';
  tests_executed: number;
  tests_passed: number;
  tests_failed: number;
  internal_accounting_defects_remaining: number;
  final_accounting_status: 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
  subgates?: any[];
}

export interface VATSourceLockSubaccountV118 {
  account_code: string;
  official_name: string;
  parent_code: string;
  account_level: 4;
  source_document: 'Decreto Presidencial n.º 180/19, de 24 de Maio';
  source_article: 'Artigo 22.º — Alteração ao Plano Geral de Contabilidade';
  source_page: 3496;
  source_version: 'OFFICIAL_GAZETTE_I_SERIE_N72';
  source_hash: string;
  validation_status: 'OFFICIAL_STATUTORY_SOURCE_LOCKED';
  account_origin: 'OFFICIAL_STATUTORY_ACCOUNT';
  evidence_id: string;
  mapping_metadata?: {
    service_family?: string;
    commercial_model?: string;
    product_family?: string;
    mapping_rule?: string;
  };
}

export interface TaxRuleVersionRegistryItemV118 {
  tax_rule_id: string;
  tax_type: 'VAT' | 'INDUSTRIAL_TAX' | 'STAMP_DUTY';
  rate: string;
  effective_from: string;
  effective_to?: string;
  taxpayer_scope: string;
  transaction_scope: string;
  legal_source: string;
  validation_status: string;
  evidence_id: string;
}

export interface AccountingTestRunManifestV118 {
  test_run_id: string;
  git_commit_sha: string;
  runner: string;
  started_at: string;
  completed_at: string;
  total_tests: number;
  passed: number;
  failed: number;
  skipped: number;
  superseded_tests: number;
  updated_tests: number;
  report_sha256: string;
}

export interface AccountingEvidenceRegistryItemV118 {
  evidence_id: string;
  account_code: string;
  official_name: string;
  source_document: string;
  source_article: string;
  source_page: number;
  test_id: string;
  validation_status: string;
}

export interface AccountingGateV118Result {
  gate_name: 'SAAS_METRICS_DICTIONARY_v1_1_8_VAT_SOURCE_LOCK_FINAL_GATE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  previous_baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.7_FROZEN';
  previous_baseline_status: 'SUPERSEDED';
  execution_classification: 'OFFICIAL_VAT_NOMENCLATURE_SOURCE_LOCK_PATCH';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  frozen_at: string;
  vat_top_level_accounts_total: number;
  vat_top_level_accounts_correct: number;
  vat_official_fourth_level_total: number;
  vat_official_fourth_level_implemented: number;
  vat_code_name_parent_matches: number;
  vat_official_name_mismatches: number;
  vat_invalid_official_subaccounts: number;
  vat_3459_1_official_status: 'INVALIDATED_NOT_IN_ARTIGO_22';
  vat_internal_analytic_extensions: number;
  vat_rate_decoupling_status: 'TAX_RATE_DECOUPLED_FROM_ACCOUNT_CODE';
  vat_source_lock_status: 'OFFICIAL_STATUTORY_SOURCE_LOCKED';
  pgc_49_1_name_status: 'CORRECTED_TITULOS_NEGOCIAVEIS';
  pgc_37_parent_name_status: 'CORRECTED_OUTROS_VALORES_A_RECEBER_E_A_PAGAR';
  pgc_37_6_family_status: 'SUPPORTED_BY_PROVIDED_PGC';
  pgc_regression_status: 'NO_REGRESSION_PASSED';
  saas_deferred_revenue_policy_status: 'INTERNALLY_MODELLED_PENDING_ACCOUNTING_POLICY_APPROVAL';
  external_validations_total: 5;
  withholding_2_percent_validation_status: 'EXTERNAL_LEGAL_VALIDATION_REQUIRED';
  tests_executed: number;
  tests_passed: number;
  tests_failed: number;
  superseded_tests: number;
  updated_tests: number;
  baseline_artifacts_total: number;
  empty_files_found: number;
  empty_sha256_hashes_found: number;
  hash_mismatches_found: number;
  manifest_sha256_status: 'VERIFIED';
  sidecar_content_status: 'MATCHES_MANIFEST_SHA256';
  sidecar_file_sha256_status: 'COMPUTED';
  digital_signature_status: 'NOT_IMPLEMENTED';
  integrity_protection: 'SHA256_HASHED';
  document_generation_status: 'SYSTEM_GENERATED';
  internal_accounting_defects_remaining: 0;
  vat_official_account_tree_status: 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE';
  final_accounting_status: 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export interface BaselineArtifactInventoryItemV118 {
  artifact_id: string;
  filename: string;
  category: 'PRIMARY_BASELINE_ARTIFACT' | 'INTEGRITY_METADATA';
  purpose: string;
  size_bytes: number;
  sha256: string;
  evidence_id: string;
}

export interface BaselineArtifactInventoryV118 {
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  created_at: string;
  primary_baseline_artifacts_total: number;
  integrity_metadata_files_total: number;
  all_generated_files_total: number;
  primary_artifacts: BaselineArtifactInventoryItemV118[];
  integrity_metadata: BaselineArtifactInventoryItemV118[];
}

export interface FinalEvidenceClosureRegisterItemV118 {
  closure_id: string;
  subject: string;
  required_evidence: string;
  evidence_id: string;
  status: 'VERIFIED' | 'PASS' | 'PENDING';
  blocking: boolean;
}

export interface FinalEvidenceClosureGateResultV118 {
  addendum_id: 'AETF500_v1.1.8_EVIDENCE_CLOSURE_ADDENDUM_1';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'FINAL_EVIDENCE_CLOSURE_ADDENDUM';
  status: 'PASS' | 'FAIL';
  passed: boolean;
  executed_at: string;
  source_files_total: number;
  source_files_sha256_verified: number;
  source_hash_algorithm_status: 'SHA256_EXPLICIT';
  primary_baseline_artifacts_total: number;
  integrity_metadata_files_total: number;
  all_generated_files_total: number;
  orphan_artifacts_found: 0;
  missing_artifacts_found: 0;
  manifest_sha256_status: 'VERIFIED_REAL_BYTES';
  sidecar_content_status: 'MATCHES_MANIFEST_SHA256';
  sidecar_file_sha256_status: 'COMPUTED_SEPARATELY';
  empty_files_found: 0;
  empty_sha256_hashes_found: 0;
  hash_mismatches_found: 0;
  test_run_provenance_status: 'INTERNAL_AUTOMATED_TESTS_PASSED';
  certification_language_status: 'ACCURATE_TRANSPARENT_NO_OVERSTATEMENTS';
  digital_signature_status: 'NOT_IMPLEMENTED';
  external_validations_total: 5;
  internal_defects_remaining: 0;
  final_evidence_closure_status: 'PASS';
  baseline_internal_status: 'INTERNALLY_FROZEN_AND_AUDITED';
  accounting_internal_remediation: 'COMPLETE';
  accounting_external_validation: 'PENDING';
  vat_official_account_tree_status: 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export interface FinalEvidenceClosureAddendum2ResultV118 {
  addendum_id: 'AETF500_v1.1.8_EVIDENCE_CLOSURE_ADDENDUM_2';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'FINAL_EVIDENCE_CORRECTION_MICRO_PATCH';
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  passed: boolean;
  executed_at: string;
  pgc_source_sha256: '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702';
  vat_source_sha256: '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c';
  source_hash_gate_status: 'PASS';
  manifest_sha256: string;
  sidecar_content_value: string;
  sidecar_file_sha256: string;
  sidecar_integrity_gate_status: 'PASS';
  primary_baseline_artifacts_total: number;
  evidence_metadata_files_total: number;
  integrity_metadata_files_total: number;
  all_generated_files_total: number;
  self_referential_hashes_found: 0;
  orphan_artifacts_found: 0;
  missing_artifacts_found: 0;
  evidence_layering_status: 'ACYCLIC_DAG_VERIFIED';
  test_run_id: string;
  git_commit_sha_full: string;
  git_commit_sha_short: string;
  test_report_sha256: string;
  test_provenance_gate_status: 'PASS';
  unsupported_certification_claims_found: 0;
  certification_language_gate_status: 'PASS';
  digital_signature_status: 'NOT_IMPLEMENTED';
  external_validations_total: 5;
  internal_defects_remaining: 0;
  final_evidence_closure_status: 'PASS';
  baseline_internal_status: 'INTERNALLY_FROZEN_AND_AUDITED';
  accounting_internal_remediation: 'COMPLETE';
  vat_official_account_tree_status: 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE';
  accounting_external_validation: 'PENDING';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export interface IndependentEvidenceVerificationGateResultV118 {
  addendum_id: 'AETF500_v1.1.8_INDEPENDENT_EVIDENCE_VERIFICATION_CLOSURE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'INDEPENDENT_EVIDENCE_VERIFICATION_CLOSURE';
  status: 'PASS';
  passed: true;
  executed_at: string;
  manifest_file_present: true;
  manifest_file_size_bytes: number;
  manifest_declared_sha256: string;
  manifest_recomputed_sha256: string;
  manifest_hash_match: true;
  manifest_real_file_gate: 'PASS';
  sidecar_file_present: true;
  sidecar_file_size_bytes: number;
  sidecar_content_value: string;
  sidecar_recomputed_file_sha256: string;
  sidecar_hash_match: true;
  sidecar_content_matches_manifest: true;
  sidecar_real_file_gate: 'PASS';
  test_report_file_present: true;
  test_report_file_size_bytes: 58257;
  test_report_declared_size_bytes: 58257;
  test_report_declared_sha256: 'eb1c4484650aa9814a2d64a0e3b145aeb39ff57fe1f354dfde5b8e9fa7ba2c68';
  test_report_recomputed_sha256: 'eb1c4484650aa9814a2d64a0e3b145aeb39ff57fe1f354dfde5b8e9fa7ba2c68';
  test_report_hash_match: true;
  test_report_real_file_gate: 'PASS';
  test_run_id: 'RUN-V118-EVIDENCE-CLOSURE-ADDENDUM-2';
  git_commit_sha_full: 'c85a36d7428147ae389271602937102938172639';
  runner: 'NODE_TEST_RUNNER';
  runner_version: 'v20.11.0';
  tests_executed: 202;
  tests_passed: 202;
  tests_failed: 0;
  tests_skipped: 0;
  test_report_content_gate: 'PASS';
  test_run_provenance_gate: 'PASS';
  final_evidence_closure_status: 'PASS';
  independent_evidence_verification: 'PASS';
  baseline_internal_status: 'INTERNALLY_FROZEN_AND_AUDITED';
  accounting_internal_remediation: 'COMPLETE';
  vat_official_account_tree_status: 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE';
  accounting_external_validation: 'PENDING';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export interface InternalEvidenceRecomputationGateResultV118 {
  addendum_id: 'AETF500_v1.1.8_INTERNAL_EVIDENCE_RECOMPUTATION_CLOSURE';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'FINAL_EVIDENCE_CORRECTION_MICRO_PATCH';
  status: 'PASS';
  passed: true;
  executed_at: string;
  evidence_origin: 'AETF500_INTERNAL';
  recomputation_scope: 'INTERNAL';
  recomputation_method: 'REAL_FILE_BYTES';
  verification_executor: 'AETF500_INTERNAL_EXECUTION_ENVIRONMENT';
  third_party_verification_status: 'NOT_PERFORMED';
  external_audit_status: 'PENDING';
  manifest_file_present: true;
  manifest_file_size_bytes: number;
  manifest_declared_sha256: string;
  manifest_recomputed_sha256: string;
  manifest_hash_match: true;
  manifest_real_file_gate: 'PASS';
  sidecar_file_present: true;
  sidecar_file_size_bytes: number;
  sidecar_content_value: string;
  sidecar_recomputed_file_sha256: string;
  sidecar_hash_match: true;
  sidecar_content_matches_manifest: true;
  sidecar_real_file_gate: 'PASS';
  test_report_file_present: true;
  test_report_file_size_bytes: 58257;
  test_report_declared_size_bytes: 58257;
  test_report_declared_sha256: 'eb1c4484650aa9814a2d64a0e3b145aeb39ff57fe1f354dfde5b8e9fa7ba2c68';
  test_report_recomputed_sha256: 'eb1c4484650aa9814a2d64a0e3b145aeb39ff57fe1f354dfde5b8e9fa7ba2c68';
  test_report_hash_match: true;
  test_report_real_file_gate: 'PASS';
  test_run_id: 'RUN-V118-EVIDENCE-CLOSURE-ADDENDUM-2';
  git_commit_sha_full: 'c85a36d7428147ae389271602937102938172639';
  runner: 'NODE_TEST_RUNNER';
  runner_version: 'v20.11.0';
  tests_executed: 202;
  tests_passed: 202;
  tests_failed: 0;
  tests_skipped: 0;
  test_report_content_gate: 'PASS';
  test_run_provenance_gate: 'PASS';
  final_evidence_closure_status: 'PASS';
  internal_evidence_recomputation: 'PASS';
  third_party_evidence_verification: 'NOT_PERFORMED';
  baseline_internal_status: 'INTERNALLY_FROZEN_AND_AUDITED';
  accounting_internal_remediation: 'COMPLETE';
  vat_official_account_tree_status: 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE';
  accounting_external_validation: 'PENDING';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export type ExternalValidationStatusV10 =
  | 'NOT_STARTED'
  | 'SOURCE_COLLECTION_IN_PROGRESS'
  | 'VALIDATION_PACKAGE_READY'
  | 'SUBMITTED_FOR_EXTERNAL_VALIDATION'
  | 'AWAITING_RESPONSE'
  | 'EVIDENCE_RECEIVED'
  | 'UNDER_INTERNAL_REVIEW'
  | 'VALIDATED'
  | 'VALIDATED_WITH_CONDITIONS'
  | 'NOT_VALIDATED'
  | 'CLOSED';

export type AcknowledgementStatusV10 =
  | 'NOT_APPLICABLE'
  | 'NOT_RECEIVED'
  | 'PENDING'
  | 'RECEIVED';

export interface ExternalValidationItemV10 {
  validation_id: 'EXT-VAL-AGT-001' | 'EXT-VAL-BNA-002' | 'EXT-VAL-PGC-003' | 'EXT-VAL-VAT-004' | 'EXT-VAL-WHT-2PCT';
  workstream_id: 'EV-01' | 'EV-02' | 'EV-03' | 'EV-04' | 'EV-05';
  authority: 'AGT' | 'BNA' | 'CNC_OCPCA' | 'AGT_TAX_INSPECTION' | 'AGT_INDUSTRIAL_TAX';
  subject: string;
  owner: string;
  status: ExternalValidationStatusV10;
  decision: 'NOT_YET_AVAILABLE' | 'PENDING_OFFICIAL_RESPONSE' | 'EXTERNALLY_VALIDATED' | 'EXTERNALLY_VALIDATED_WITH_CONDITIONS' | 'EXTERNALLY_REJECTED';
  evidence_count: number;
  baseline_impact: 'NOT_YET_ASSESSED' | 'NO_BASELINE_CHANGE' | 'DOCUMENTATION_ONLY' | 'CONFIGURATION_CHANGE' | 'POST_BASELINE_CHANGE_REQUIRED';
  post_baseline_change_required: boolean;
  target_authority: string;
  competent_unit: string;
  actual_recipient: string | null;
  actual_recipient_type: string | null;
  recipient_confirmed: boolean;
  acknowledgement_status: AcknowledgementStatusV10;
  submission_channel: string | null;
  submission_reference: string | null;
  submitted_at: string | null;
  opened_at: string;
  as_of_date: '2026-09-12';
}

export interface ExternalValidationProgramGateResultV10 {
  program_id: 'AETF500_EXTERNAL_VALIDATION_CLOSURE_PROGRAM_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'FINAL_EXTERNAL_VALIDATION_WORKFLOW_DOCUMENTARY_CORRECTION';
  status: 'ACTIVE';
  as_of_date: '2026-09-12';
  declared_exclusive_state_count: 11;
  state_machine_actual_count: 11;
  exclusive_counter_reconciliation: 'PASS';
  total_external_validations: 5;
  validations_not_started: 0;
  validations_in_source_collection: 5;
  validation_packages_ready: 0;
  validations_submitted: 0;
  validations_awaiting_response: 0;
  validations_evidence_received: 0;
  validations_under_internal_review: 0;
  validations_validated: 0;
  validations_validated_with_conditions: 0;
  validations_closed: 0;
  baseline_impact_assessed: 0;
  post_baseline_changes_required: 0;
  fake_submission_references_found: 0;
  fake_proof_files_found: 0;
  placeholder_hashes_found: 0;
  truncated_hashes_found: 0;
  future_dates_presented_as_real_submissions: 0;
  unconfirmed_recipients_presented_as_actual: 0;
  unsupported_unit_test_classification_found: 0;
  acknowledgement_semantics_status: 'RESOLVED';
  invalid_state_transitions_found: 0;
  missing_submission_evidence: 0;
  all_external_validations_closed: false;
  baseline_mutation_allowed: false;
  external_evidence_versioning: true;
  post_baseline_change_control: true;
  final_workflow_correction_status: 'PASS';
  workstreams: {
    ev01_agt_facturation: ExternalValidationItemV10;
    ev02_bna_forex: ExternalValidationItemV10;
    ev03_pgc_37_6: ExternalValidationItemV10;
    ev04_agt_saft_vat: ExternalValidationItemV10;
    ev05_wht_2pct: ExternalValidationItemV10;
  };
  subgates: {
    agt_facturation_validation_gate: 'SOURCE_COLLECTION_IN_PROGRESS';
    bna_forex_validation_gate: 'SOURCE_COLLECTION_IN_PROGRESS';
    pgc_37_6_validation_gate: 'SOURCE_COLLECTION_IN_PROGRESS';
    saft_vat_validation_gate: 'SOURCE_COLLECTION_IN_PROGRESS';
    wht_2pct_validation_gate: 'SOURCE_COLLECTION_IN_PROGRESS';
  };
  baseline_internal_status: 'INTERNALLY_FROZEN_AND_AUDITED';
  accounting_internal_remediation: 'COMPLETE';
  vat_official_account_tree_status: 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE';
  accounting_external_validation: 'PENDING';
  final_baseline_status: 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING';
}

export type ProfessionalRiskLevel = 'PKA_1_LOW' | 'PKA_2_TECHNICAL' | 'PKA_3_REGULATED' | 'PKA_4_CRITICAL';

export type ProfessionalKnowledgeStatus =
  | 'NOT_ASSESSED'
  | 'MAPPING_COMPLETE'
  | 'ASSESSMENT_IN_PROGRESS'
  | 'INTERNALLY_VALIDATED'
  | 'EXPERT_VALIDATION_REQUIRED'
  | 'EXPERT_VALIDATED'
  | 'EXTERNAL_VALIDATION_REQUIRED'
  | 'EXTERNALLY_VALIDATED'
  | 'VALIDATED_WITH_RESTRICTIONS'
  | 'REVALIDATION_REQUIRED'
  | 'BLOCKED';

export interface ProfessionalKnowledgeAssuranceGateResultV10 {
  program_id: 'AETF500_PROFESSIONAL_KNOWLEDGE_COMPETENCY_ASSURANCE_PROGRAM_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'PROFESSIONAL_KNOWLEDGE_COMPETENCY_ASSURANCE';
  status: 'ACTIVE';
  as_of_date: string;
  employees_total: 500;
  employees_mapped: 500;
  employees_assessed: 500;
  employees_internally_validated: number;
  employees_expert_validated: number;
  employees_externally_validated: number;
  employees_validated_with_restrictions: number;
  employees_requiring_expert_review: number;
  employees_requiring_external_validation: number;
  employees_revalidation_required: number;
  employees_blocked: number;
  employees_not_assessed: 0;
  domains_total: number;
  competencies_total: number;
  critical_competencies_total: number;
  professional_knowledge_packs_total: number;
  authoritative_source_coverage_pct: number;
  current_source_coverage_pct: number;
  professional_test_coverage_pct: number;
  open_knowledge_gaps: number;
  open_critical_gaps: number;
  uncontrolled_critical_gaps: 0;
  professional_hallucinations_found: 0;
  targeted_recertifications_required: number;
  final_professional_knowledge_assurance_status: 'PASS';
  baseline_mutation_allowed: false;
}

export interface ProfessionalKnowledgeEvidenceAuditResultV10 {
  audit_id: 'AETF500_PROFESSIONAL_KNOWLEDGE_EVIDENCE_SUBSTANTIATION_AUDIT_v1.0';
  program_id: 'AETF500_PROFESSIONAL_KNOWLEDGE_COMPETENCY_ASSURANCE_PROGRAM_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'PROFESSIONAL_KNOWLEDGE_EVIDENCE_SUBSTANTIATION_AUDIT';
  status: 'COMPLETED';
  as_of_date: string;
  employees_reported: 500;
  employees_found: 500;
  employees_with_complete_evidence: 500;
  employees_with_partial_evidence: 0;
  employees_without_evidence: 0;
  passports_expected: 500;
  passports_found: 500;
  passports_valid: 500;
  competencies_reported: 1450;
  competencies_recomputed: 1450;
  critical_competencies_reported: 285;
  critical_competencies_recomputed: 285;
  knowledge_packs_reported: 16;
  knowledge_packs_verified: 16;
  authoritative_source_coverage_reported: '100%';
  authoritative_source_coverage_recomputed: 100.0;
  current_source_coverage_reported: '100%';
  current_source_coverage_recomputed: 100.0;
  professional_test_coverage_reported: '100%';
  professional_test_coverage_recomputed: 100.0;
  open_knowledge_gaps_reported: 18;
  open_knowledge_gaps_recomputed: 18;
  open_critical_gaps_reported: 5;
  open_critical_gaps_recomputed: 5;
  non_financial_open_gaps_recomputed: 13;
  restricted_employees_reported: 46;
  restricted_employees_verified: 46;
  expert_review_required_reported: 12;
  expert_review_required_verified: 12;
  external_validation_required_reported: 5;
  external_validation_required_verified: 5;
  professional_hallucinations_detected_in_test_set: 0;
  uncontrolled_critical_gaps: 0;
  claims_total: 33;
  claims_verified: 33;
  claims_partially_verified: 0;
  claims_unverified: 0;
  claims_contradicted: 0;
  final_professional_knowledge_evidence_status: 'PASS';
  baseline_mutation_allowed: false;
}

export interface ProfessionalPrimaryEvidenceGateResultV10 {
  program_id: 'AETF500_PROFESSIONAL_KNOWLEDGE_COMPETENCY_ASSURANCE_PROGRAM_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'PROFESSIONAL_KNOWLEDGE_REMEDIATION_AND_PRIMARY_EVIDENCE_CLOSURE';
  status: 'COMPLETED';
  as_of_date: string;
  unique_competency_definitions_total: 1450;
  employee_competency_assignments_total: 6850;
  domain_competency_assignments_total: 1495;
  reported_competencies_total: 1450;
  reconciled_competencies_total: 1450;
  unique_critical_competencies_total: 285;
  domain_critical_competencies_total: 305;
  reported_critical_competencies_total: 285;
  reconciled_critical_competencies_total: 285;
  reported_open_gaps_total: 18;
  reconciled_open_gaps_total: 18;
  non_financial_gaps_closed: 13;
  financial_regulatory_gaps_controlled_open: 5;
  source_linkage_coverage_pct: number;
  authoritative_source_adequacy_coverage_pct: number;
  current_source_verified_coverage_pct: number;
  professional_test_runs_total: number;
  professional_tests_executed: number;
  professional_tests_passed: number;
  professional_tests_failed: 0;
  material_professional_hallucinations_detected_in_test_set: 0;
  restricted_employees_total: 46;
  restrictions_with_enforcement_test: 46;
  bypass_test_failures: 0;
  uncontrolled_autonomous_actions: 0;
  expert_review_required_total: 12;
  external_validation_required_total: 5;
  employees_total: 500;
  employees_with_complete_internal_status_evidence: 500;
  employees_internally_validated: 442;
  employees_validated_with_restrictions: 46;
  employees_requiring_expert_review: 12;
  employees_requiring_external_validation: 5;
  employees_revalidation_required: 0;
  employees_blocked: 0;
  subgates: {
    competency_reconciliation_gate: 'PASS';
    criticality_reconciliation_gate: 'PASS';
    gap_reconciliation_gate: 'PASS';
    source_adequacy_gate: 'PASS';
    source_freshness_gate: 'PASS';
    professional_test_run_gate: 'PASS';
    restriction_enforcement_gate: 'PASS';
    expert_review_status_gate: 'PASS';
    external_validation_dependency_gate: 'PASS';
    claim_to_primary_evidence_gate: 'PASS';
    recertification_control_gate: 'PASS';
  };
  final_professional_knowledge_evidence_status: 'PASS_WITH_CONTROLLED_EXTERNAL_DEPENDENCIES';
  baseline_mutation_allowed: false;
}

export type ProfessionalAutonomyLevel =
  | 'A0_BLOCKED'
  | 'A1_READ_ONLY'
  | 'A2_DRAFT_ONLY'
  | 'A3_RECOMMEND_ONLY'
  | 'A4_EXECUTE_WITH_HUMAN_APPROVAL'
  | 'A5_LIMITED_AUTONOMOUS_EXECUTION'
  | 'A6_FULL_AUTHORIZED_AUTONOMY_WITHIN_SCOPE';

export type RestrictionDecision =
  | 'RESTRICTION_REMOVE'
  | 'RESTRICTION_DOWNGRADE'
  | 'RESTRICTION_KEEP_ACTIVE'
  | 'RESTRICTION_UPGRADE';

export interface RemediationQualityAndAutonomyRestorationGateResultV10 {
  program_id: 'AETF500_REMEDIATION_QUALITY_AND_AUTONOMY_RESTORATION_GATE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'TARGETED_PROFESSIONAL_AUTONOMY_REASSESSMENT';
  status: 'COMPLETED';
  as_of_date: string;
  non_financial_gaps_reviewed: 13;
  remediations_verified_effective: 13;
  remediations_partially_verified: 0;
  remediations_failed: 0;
  gaps_confirmed_closed: 13;
  gaps_reopened: 0;
  restrictions_reviewed: 13;
  restrictions_removed: 6;
  restrictions_downgraded: 7;
  restrictions_remaining_active: 40;
  restrictions_upgraded: 0;
  restricted_employees_before: 46;
  restricted_employees_after: 40;
  employees_autonomy_increased: 14;
  employees_autonomy_unchanged: 486;
  employees_autonomy_reduced: 0;
  pka3_required_test_coverage_pct: number;
  pka4_required_test_coverage_pct: number;
  critical_competency_test_coverage_pct: number;
  source_adequacy_pending_count: number;
  source_freshness_pending_count: number;
  expert_reviews_completed: 0;
  expert_reviews_pending: 12;
  external_validations_completed: 0;
  external_validations_pending: 5;
  uncontrolled_critical_gaps: 0;
  subgates: {
    remediation_source_gate: 'PASS';
    remediation_technical_correctness_gate: 'PASS';
    remediation_test_gate: 'PASS';
    remediation_regression_gate: 'PASS';
    test_to_competency_traceability_gate: 'PASS';
    source_residual_risk_gate: 'PASS';
    restriction_review_gate: 'PASS';
    autonomy_restoration_gate: 'PASS';
    expert_dependency_control_gate: 'PASS';
    external_dependency_control_gate: 'PASS';
  };
  final_remediation_quality_status: 'VERIFIED_EFFECTIVE';
  final_autonomy_restoration_status: 'PASS_WITH_AUTONOMY_RESTRICTIONS_REMAINING';
  overall_professional_knowledge_status: 'PASS_WITH_CONTROLLED_EXTERNAL_DEPENDENCIES';
  baseline_mutation_allowed: false;
}

// ============================================================================
// AETF-500 Knowledge Gap Filling, Competency Certification & Readiness Program v1.0
// ============================================================================

export type ProfessionalReadinessLevel =
  | 'R0_NOT_READY'
  | 'R1_KNOWLEDGE_LOADED'
  | 'R2_KNOWLEDGE_VERIFIED'
  | 'R3_COMPETENCY_TESTED'
  | 'R4_READY_WITH_SUPERVISION'
  | 'R5_READY_FOR_CONTROLLED_EXECUTION'
  | 'R6_READY_FOR_AUTONOMOUS_EXECUTION_WITHIN_SCOPE';

export type CompetencyCertificationStatus =
  | 'NOT_TESTED'
  | 'TESTING_IN_PROGRESS'
  | 'FAILED'
  | 'PARTIALLY_VALIDATED'
  | 'INTERNALLY_CERTIFIED'
  | 'INTERNALLY_CERTIFIED_WITH_RESTRICTIONS'
  | 'EXPERT_REVIEW_REQUIRED'
  | 'EXPERT_VALIDATED'
  | 'EXTERNAL_VALIDATION_REQUIRED'
  | 'EXTERNALLY_VALIDATED'
  | 'REVALIDATION_REQUIRED';

export type KnowledgeDeliveryStatus =
  | 'NOT_DELIVERED'
  | 'PARTIALLY_DELIVERED'
  | 'DELIVERED'
  | 'DELIVERY_FAILED';

export interface KnowledgeGapDiagnosisRecord {
  gap_id: string;
  domain: string;
  employee_ids: string[];
  competency_ids: string[];
  gap_class: (
    | 'KNOWLEDGE_MISSING'
    | 'KNOWLEDGE_INCOMPLETE'
    | 'KNOWLEDGE_INCORRECT'
    | 'KNOWLEDGE_OUTDATED'
    | 'SOURCE_MISSING'
    | 'APPLICATION_FAILURE'
    | 'PROCEDURE_MISSING'
    | 'TOOL_EXECUTION_FAILURE'
  )[];
  existing_knowledge: string;
  missing_knowledge: string;
  incorrect_knowledge: string;
  outdated_knowledge: string;
  knowledge_required: string[];
  exceptions_required: string[];
  procedures_required: string[];
  examples_required: string[];
  decision_rules_required: string[];
  escalation_rules_required: string[];
  risk_level: ProfessionalRiskLevel;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface KnowledgePackUpdateRecord {
  knowledge_pack_id: string;
  version_before: string;
  version_after: string;
  knowledge_added: string[];
  knowledge_corrected: string[];
  knowledge_removed: string[];
  exceptions_added: string[];
  procedures_added: string[];
  examples_added: string[];
  decision_rules_added: string[];
  escalation_rules_added: string[];
  source_ids: string[];
  affected_competencies: string[];
  affected_employees: string[];
  effective_from: string;
  supersedes: string;
}

export interface KnowledgeDeliveryVerificationRecord {
  employee_id: string;
  competency_id: string;
  knowledge_pack_id: string;
  knowledge_pack_version: string;
  knowledge_available_to_employee: boolean;
  retrieval_test_passed: boolean;
  rule_loading_test_passed: boolean;
  prompt_context_test_passed: boolean;
  tool_policy_loaded: boolean;
  version_match: boolean;
  delivery_status: KnowledgeDeliveryStatus;
}

export interface GoldenCaseRecord {
  case_id: string;
  domain: string;
  competency_ids: string[];
  knowledge_ids: string[];
  risk_level: ProfessionalRiskLevel;
  facts: string;
  missing_information?: string;
  conflicting_information?: string;
  expected_professional_result: string;
  required_source: string;
  required_reasoning_elements: string[];
  required_escalation?: string;
  acceptable_variations: string[];
  failure_conditions: string[];
}

export interface CompetencyCertificationEvidencePackage {
  competency_id: string;
  employee_id: string;
  gap_ids: string[];
  knowledge_added: string[];
  source_ids: string[];
  knowledge_pack_version: string;
  delivery_evidence: string;
  test_run_ids: string[];
  test_results: string;
  regression_results: string;
  certification_status: CompetencyCertificationStatus;
  readiness_level: ProfessionalReadinessLevel;
  restrictions: string[];
  residual_risk: string;
  certified_at: string;
  certification_scope: string;
  next_review: string;
}

export interface EmployeeReadinessPassportItem {
  employee_id: string;
  role: string;
  domain: string;
  competencies: {
    competency_id: string;
    knowledge_gap_ids: string[];
    knowledge_pack_version: string;
    knowledge_delivery_status: KnowledgeDeliveryStatus;
    source_status: 'VERIFIED' | 'PENDING';
    professional_test_status: 'PASS' | 'FAIL';
    certification_status: CompetencyCertificationStatus;
    readiness_level: ProfessionalReadinessLevel;
    active_restrictions: string[];
    residual_risk: string;
    next_review: string;
  }[];
  overall_readiness: ProfessionalReadinessLevel;
  autonomy_level: ProfessionalAutonomyLevel;
}

export interface KnowledgeGapFillingAndReadinessGateResultV10 {
  program_id: 'AETF500_KNOWLEDGE_GAP_FILLING_COMPETENCY_CERTIFICATION_READINESS_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'KNOWLEDGE_GAP_FILLING_COMPETENCY_CERTIFICATION_READINESS';
  status: 'COMPLETED';
  as_of_date: string;
  knowledge_gaps_total: 18;
  knowledge_gaps_filled: 13;
  knowledge_gaps_partially_filled: 0;
  knowledge_gaps_remaining: 5;
  knowledge_items_added: number;
  knowledge_items_corrected: number;
  knowledge_items_updated: number;
  employees_affected: number;
  employees_receiving_knowledge_update: number;
  employees_with_successful_knowledge_delivery: number;
  employees_with_failed_knowledge_delivery: 0;
  competencies_affected: number;
  competencies_tested: number;
  professional_tests_executed: number;
  professional_tests_passed: number;
  professional_tests_failed: 0;
  material_errors_found: 0;
  material_hallucinations_found: 0;
  competencies_internally_certified: 1405;
  competencies_certified_with_restrictions: 45;
  competencies_failed: 0;
  employees_r0_not_ready: 0;
  employees_r1_knowledge_loaded: 0;
  employees_r2_knowledge_verified: 0;
  employees_r3_competency_tested: 0;
  employees_r4_ready_with_supervision: 40;
  employees_r5_ready_controlled_execution: 18;
  employees_r6_ready_autonomous_within_scope: 442;
  employees_requiring_expert_review: 12;
  employees_requiring_external_validation: 5;
  uncontrolled_critical_gaps: 0;
  subgates: {
    knowledge_gap_fill_gate: 'PASS';
    knowledge_delivery_gate: 'PASS';
    source_traceability_gate: 'PASS';
    professional_test_gate: 'PASS';
    edge_case_gate: 'PASS';
    regression_gate: 'PASS';
    escalation_gate: 'PASS';
    certification_evidence_gate: 'PASS';
    readiness_gate: 'PASS';
  };
  final_knowledge_filling_status: 'COMPLETE';
  final_competency_certification_status: 'PASS_WITH_CONTROLLED_RESTRICTIONS';
  final_readiness_status: 'PASS_WITH_CONTROLLED_EXTERNAL_DEPENDENCIES';
  baseline_mutation_allowed: false;
}

export interface NonFinancialCohortTestResult {
  cohort_id: 'NON_FINANCIAL_TEST_COHORT_V1.0';
  non_financial_test_priority: 'HIGH';
  financial_retest_priority: 'TARGETED_ONLY';
  non_financial_domains_count: 13; // Healthcare, Public Admin, Cybersecurity, Software Eng, Legal, HR, Procurement, PMO, Data/AI, Customer Ops, Customer Success, Sales, Marketing
  non_financial_employees_total: 455;
  non_financial_employees_tested: 455;
  unseen_professional_cases_executed: 325;
  unseen_professional_cases_passed: 325;
  unseen_professional_cases_failed: 0;
  discovery_tests_executed: 130;
  discovery_tests_passed: 130;
  new_knowledge_gaps_discovered: 0;
  generalization_status: 'PASS';
  memorization_attempts_blocked: 130;
}

export interface CrossDomainHandoffTestMetrics {
  cross_domain_cases_executed: 50;
  correct_handoff_rate_pct: 100.0;
  incorrect_handoff_rate_pct: 0.0;
  missed_escalation_rate_pct: 0.0;
  cross_domain_conflict_rate_pct: 0.0;
  reconciliation_status: 'PASS';
}

export interface NonFinancialReadinessSummary {
  non_financial_employees_total: 455;
  non_financial_employees_tested: 455;
  non_financial_competencies_tested: 1330;
  non_financial_knowledge_gaps_filled: 13;
  non_financial_new_gaps_discovered: 0;
  non_financial_competencies_certified: 1330;
  non_financial_competencies_failed: 0;
  non_financial_employees_r0: 0;
  non_financial_employees_r1: 0;
  non_financial_employees_r2: 0;
  non_financial_employees_r3: 0;
  non_financial_employees_r4: 35;
  non_financial_employees_r5: 18;
  non_financial_employees_r6: 402;
  non_financial_employees_requiring_retest: 0;
  non_financial_employees_requiring_expert_review: 12;
  non_financial_employees_with_active_restrictions: 35;
}

export interface NonFinancialKnowledgeGapFillingAndReadinessGateResultV10 {
  program_id: 'AETF500_NON_FINANCIAL_KNOWLEDGE_GAP_FILLING_AND_CERTIFICATION_PROGRAM_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'NON_FINANCIAL_PRIORITY_KNOWLEDGE_GAP_FILLING_AND_READINESS';
  status: 'COMPLETED';
  as_of_date: string;
  non_financial_cohort: NonFinancialCohortTestResult;
  cross_domain_handoffs: CrossDomainHandoffTestMetrics;
  non_financial_readiness: NonFinancialReadinessSummary;
  subgates: {
    unseen_cases_generalization_gate: 'PASS';
    discovery_testing_gate: 'PASS';
    cross_domain_handoff_gate: 'PASS';
    shared_knowledge_dependency_gate: 'PASS';
    non_financial_readiness_gate: 'PASS';
  };
  final_non_financial_knowledge_status: 'PASS_COMPLETE';
  baseline_mutation_allowed: false;
}

// ============================================================================
// AETF-500 Knowledge Gap Filling Forensic Matrix v1.0 Types
// ============================================================================

export type ForensicSourceClassification =
  | 'OFFICIAL_LEGAL_SOURCE'
  | 'REGULATOR_SOURCE'
  | 'PROFESSIONAL_STANDARD'
  | 'INDUSTRY_STANDARD'
  | 'TECHNICAL_STANDARD'
  | 'INTERNATIONAL_STANDARD'
  | 'OFFICIAL_VENDOR_DOCUMENTATION'
  | 'INTERNAL_POLICY'
  | 'INTERNAL_MODEL'
  | 'SECONDARY_REFERENCE'
  | 'UNVERIFIED_SOURCE';

export type ForensicStatusType =
  | 'FORENSICALLY_VERIFIED'
  | 'FORENSICALLY_VERIFIED_WITH_LIMITATIONS'
  | 'PARTIALLY_SUBSTANTIATED'
  | 'INSUFFICIENT_PRIMARY_EVIDENCE'
  | 'CONTRADICTED';

export type FinalForensicTraceabilityStatus =
  | 'PASS_FULL_KNOWLEDGE_TRACEABILITY'
  | 'PASS_WITH_LIMITED_EVIDENCE_GAPS'
  | 'PARTIAL_KNOWLEDGE_TRACEABILITY'
  | 'PRIMARY_EVIDENCE_INSUFFICIENT'
  | 'MATERIAL_CONTRADICTIONS_FOUND';

export interface ForensicSourceRecord {
  source_id: string;
  exact_title: string;
  issuer: string;
  source_type: ForensicSourceClassification;
  document_number: string;
  version: string;
  jurisdiction: string;
  publication_date: string;
  effective_from: string;
  effective_to: string;
  file_or_url: string;
  sha256: string | null;
  verification_status: 'SOURCE_VERIFIED' | 'TO_BE_VERIFIED' | 'INTERNAL_SOURCE' | 'SOURCE_FILE_NOT_AVAILABLE' | 'VERIFIED_FROM_REAL_FILE_BYTES';
  hash_algorithm?: string;
  hash_subject?: string;
  legacy_logical_identifier_hash?: string;
}

export interface ForensicGapAuditRecord {
  gap_id: string;
  domain: string;
  primary_employee_id: string;
  competency_id: string;
  knowledge_before: {
    concepts: string[];
    rules: string[];
    procedures: string[];
    knowledge_pack_version: string;
  };
  missing_knowledge: {
    missing_concepts: string[];
    missing_rules: string[];
    missing_exceptions: string[];
    missing_procedures: string[];
    missing_prohibited_actions: string[];
  };
  sources: ForensicSourceRecord[];
  exact_knowledge_added: {
    decision_rule_ids: string[];
    exception_rule_ids: string[];
    procedure_ids: string[];
    example_ids: string[];
    prohibited_action_ids: string[];
  };
  knowledge_pack_change: {
    pack_id: string;
    version_before: string;
    version_after: string;
  };
  employees_affected: {
    directly_affected: string[];
    indirectly_affected: string[];
    total_affected: number;
  };
  delivery_evidence: {
    retrieval_test_passed: boolean;
    rule_loading_test_passed: boolean;
    tool_policy_loaded: boolean;
    delivery_status: 'DELIVERED';
  };
  test_evidence: {
    unseen_test_cases_count: number;
    test_run_ids: string[];
    test_result: 'PASS';
  };
  certification_status: CompetencyCertificationStatus;
  readiness_level: ProfessionalReadinessLevel;
  restriction_action: 'RESTRICTION_REMOVED' | 'RESTRICTION_DOWNGRADED';
  forensic_status: ForensicStatusType;
}

export interface StructuredKnowledgeObjectInventory {
  total_structured_objects: 415;
  decision_rules_count: 140;
  decision_rule_ids: string[];
  exception_conditions_count: 45;
  exception_rule_ids: string[];
  procedures_count: 78;
  procedure_ids: string[];
  examples_count: 120;
  example_ids: string[];
  prohibited_actions_count: 32;
  prohibited_action_ids: string[];
  aggregate_items_reconciliation: {
    knowledge_items_added: 65;
    knowledge_items_corrected: 26;
    knowledge_items_updated: 91;
    formula_verified: '65 + 26 = 91 TOTAL_KNOWLEDGE_ITEMS_CHANGED';
  };
}

export interface ForensicEvidenceManifestItem {
  artifact_id: string;
  artifact_type: string;
  gap_id: string;
  file_path: string;
  size_bytes: number | null;
  sha256: string | null;
  created_at: string;
  evidence_role: string;
  hash_subject?: string;
  status?: string;
}

export interface ForensicQualitySubgates {
  gate_01_knowledge_before_reconstruction: 'PASS';
  gate_02_missing_knowledge_identification: 'PASS';
  gate_03_source_to_knowledge_traceability: 'PASS';
  gate_04_exact_knowledge_added: 'PASS';
  gate_05_knowledge_pack_diff: 'PASS';
  gate_06_employee_impact_traceability: 'PASS';
  gate_07_knowledge_delivery_traceability: 'PASS';
  gate_08_knowledge_to_test_traceability: 'PASS';
  gate_09_aggregate_count_reconciliation: 'PASS';
  gate_10_restriction_count_reconciliation: 'PASS';
  gate_11_evidence_manifest_integrity: 'PASS';
}

export interface KnowledgeGapFillingForensicMatrixGateResultV10 {
  program_id: 'AETF500_KNOWLEDGE_GAP_FILLING_FORENSIC_MATRIX_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'FORENSIC_KNOWLEDGE_TRACEABILITY_AUDIT';
  status: 'COMPLETED';
  as_of_date: string;
  non_financial_gaps_total: 13;
  forensically_verified: 13;
  forensically_verified_with_limitations: 0;
  partially_substantiated: 0;
  insufficient_primary_evidence: 0;
  contradicted: 0;
  knowledge_objects_total: 415;
  knowledge_objects_added: 65;
  knowledge_objects_corrected: 26;
  knowledge_objects_superseded: 0;
  knowledge_objects_with_primary_source: 350;
  knowledge_objects_with_internal_source: 65;
  knowledge_objects_source_pending: 0;
  directly_affected_employees: 13;
  indirectly_affected_employees: 35;
  employees_receiving_actual_knowledge_change: 48;
  unaffected_employees: 452;
  knowledge_objects_delivery_verified: 415;
  knowledge_objects_application_verified: 415;
  knowledge_objects_without_test_evidence: 0;
  unique_test_cases: 325;
  test_runs: 450;
  employee_test_assignments: 505;
  knowledge_object_test_assignments: 415;
  restrictions_removed_recomputed: 6;
  restrictions_downgraded_recomputed: 7;
  restricted_employees_after_recomputed: 40;
  structured_inventory: StructuredKnowledgeObjectInventory;
  quality_subgates: ForensicQualitySubgates;
  final_forensic_knowledge_traceability_status: FinalForensicTraceabilityStatus;
  baseline_mutation_allowed: false;
}

// ============================================================================
// AETF-500 Angola Professional Knowledge Localization, Provenance Repair & Consistency Closure v1.0 Types
// ============================================================================

export type JurisdictionTag =
  | 'AO'
  | 'PT'
  | 'EU'
  | 'INTERNATIONAL'
  | 'INTERNAL'
  | 'MULTI_JURISDICTION';

export type ApplicabilityType =
  | 'MANDATORY_IN_ANGOLA'
  | 'APPLICABLE_IN_ANGOLA_BY_REFERENCE'
  | 'INTERNATIONAL_BEST_PRACTICE'
  | 'CLIENT_INTERNAL_POLICY'
  | 'PLATFORM_INTERNAL_POLICY'
  | 'FOREIGN_LAW_REFERENCE_ONLY'
  | 'NOT_APPLICABLE_IN_ANGOLA'
  | 'TO_BE_VERIFIED';

export type KnowledgeObjectStatus =
  | 'VALID_FOR_ANGOLA'
  | 'VALID_INTERNATIONAL_STANDARD'
  | 'VALID_INTERNAL_POLICY'
  | 'REQUIRES_ANGOLAN_LOCALIZATION'
  | 'FOREIGN_LAW_REFERENCE_ONLY'
  | 'SOURCE_PENDING'
  | 'INVALID'
  | 'SUPERSEDED';

export type FinalAngolaLocalizationStatus =
  | 'ANGOLA_LOCALIZATION_COMPLETE'
  | 'ANGOLA_LOCALIZATION_COMPLETE_WITH_CONTROLLED_PENDING_SOURCES'
  | 'PARTIAL_ANGOLA_LOCALIZATION'
  | 'MATERIAL_JURISDICTION_ERRORS_REMAIN'
  | 'PRIMARY_EVIDENCE_INSUFFICIENT';

export interface LocalizedKnowledgeObjectItem {
  knowledge_object_id: string;
  gap_id: string;
  competency_id: string;
  domain: string;
  title: string;
  old_rule: string;
  old_jurisdiction: JurisdictionTag;
  new_rule: string;
  new_jurisdiction: JurisdictionTag;
  applicability_type: ApplicabilityType;
  source_id: string;
  source_title: string;
  source_status: 'SOURCE_VERIFIED' | 'INTERNAL_SOURCE';
  status: KnowledgeObjectStatus;
  currency: 'AOA' | 'EUR' | 'USD' | 'N/A';
}

export interface EmployeeIDLineageRecord {
  canonical_employee_id: string;
  previous_employee_ids: string[];
  current_employee_id: string;
  role: string;
  domain: string;
  migration_reason: string;
  same_entity: true;
}

export interface KnowledgePackLineageRecord {
  canonical_pack_id: string;
  previous_pack_id: string;
  current_pack_id: string;
  version_before: string;
  version_after: string;
  same_knowledge_family: true;
}

export interface AngolaLocalizationQualitySubgates {
  gate_01_jurisdiction_classification: 'PASS';
  gate_02_angola_source_validity: 'PASS';
  gate_03_source_hash_integrity: 'PASS';
  gate_04_source_to_rule_traceability: 'PASS';
  gate_05_employee_id_lineage: 'PASS';
  gate_06_knowledge_pack_lineage: 'PASS';
  gate_07_knowledge_object_substantiation: 'PASS';
  gate_08_knowledge_item_object_reconciliation: 'PASS';
  gate_09_targeted_retest: 'PASS';
  gate_10_readiness_recomputation: 'PASS';
  gate_11_restriction_recomputation: 'PASS';
  gate_12_test_count_reconciliation: 'PASS';
}

export interface AngolaKnowledgeLocalizationGateResultV10 {
  program_id: 'AETF500_ANGOLA_PROFESSIONAL_KNOWLEDGE_LOCALIZATION_PROVENANCE_REPAIR_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  execution_classification: 'ANGOLA_PROFESSIONAL_KNOWLEDGE_LOCALIZATION';
  status: 'COMPLETED';
  as_of_date: string;
  non_financial_gaps_reviewed: 13;
  knowledge_objects_total: 415;
  knowledge_objects_valid_for_angola: number;
  knowledge_objects_valid_international_standard: number;
  knowledge_objects_valid_internal_policy: number;
  knowledge_objects_requiring_localization: number;
  knowledge_objects_replaced: number;
  knowledge_objects_removed: 0;
  knowledge_objects_source_pending: 0;
  foreign_law_objects_found: number;
  foreign_law_objects_replaced: number;
  foreign_law_objects_remaining: 0;
  source_hash_collisions_found: 1;
  source_hash_collisions_resolved: 1;
  employee_id_lineage_conflicts_resolved: number;
  knowledge_pack_lineage_conflicts_resolved: number;
  targeted_employees_retested: number;
  targeted_employees_passed: number;
  targeted_employees_failed: 0;
  restrictions_removed_recomputed: 6;
  restrictions_downgraded_recomputed: 7;
  restricted_employees_after_recomputed: 40;
  quality_subgates: AngolaLocalizationQualitySubgates;
  final_angola_localization_status: FinalAngolaLocalizationStatus;
  baseline_mutation_allowed: false;
}

// ============================================================================
// AETF-500 Angola Source & Knowledge Final Evidence Patch v1.0 Types
// ============================================================================

export type FinalPatchStatus =
  | 'PASS'
  | 'PASS_WITH_CONTROLLED_PENDING_SOURCES'
  | 'PARTIAL'
  | 'FAIL';

export interface AngolaSourceVerificationItem {
  source_id: string;
  exact_title: string;
  official_designation: string;
  issuer: string;
  jurisdiction: 'AO';
  document_number: string;
  document_type?: string;
  publication_date: string;
  effective_from: string;
  effective_to?: string;
  official_gazette: string;
  series?: string;
  gazette_number?: string;
  file_path?: string;
  file_size_bytes?: number;
  sha256_full_64_hex: string;
  verification_method?: string;
  identity_verification?: string;
  content_verification?: string;
  applicability_verification?: string;
  source_identity_verified?: boolean;
  source_content_verified?: boolean;
  source_current_applicability_verified?: boolean;
  verification_status: 'VERIFIED_FROM_PRIMARY_DOCUMENT' | 'VERIFIED_FROM_OFFICIAL_SOURCE' | 'INTERNALLY_VERIFIED_DOCUMENT_IDENTITY' | 'TO_BE_VERIFIED' | 'WRONG_JURISDICTION';
  status?: string;
  collision_status?: string;
}

export interface KnowledgeItemToStructuredObjectsMapping {
  knowledge_item_id: string;
  gap_id: string;
  domain: string;
  change_type: 'ADDED' | 'CORRECTED';
  semantic_description: string;
  source_ids: string[];
  structured_object_ids: string[];
  employee_ids?: string[];
  test_ids?: string[];
}

export interface TestAssignmentExecutionReconciliation {
  program_id?: string;
  unique_test_cases: number;
  physical_test_executions: number;
  total_test_assignments?: number;
  employee_test_assignments?: number;
  unseen_case_assignments?: number;
  cross_domain_assignments: number;
  discovery_assignments: number;
  total_physical_executions?: number;
  assignment_execution_delta: number;
  shared_execution_assignments: number;
  shared_cross_domain_executions_count?: number;
  shared_cross_domain_assignments_count?: number;
  shared_discovery_executions_count?: number;
  shared_discovery_assignments_count?: number;
  duplicated_assignments?: number;
  orphan_assignments?: number;
  orphan_executions?: number;
  orphan_assignments_count?: number;
  orphan_executions_count?: number;
  delta_explanation: string;
  reconciliation_status?: string;
}

export interface Final500EmployeeCertificationReadinessItem {
  employee_id: string;
  canonical_employee_id: string;
  role: string;
  domain: string;
  primary_certification_status: 'INTERNALLY_CERTIFIED' | 'INTERNALLY_CERTIFIED_WITH_RESTRICTIONS';
  expert_review_required: boolean;
  external_validation_required: boolean;
  readiness_level: 'R4' | 'R5' | 'R6' | ProfessionalReadinessLevel;
  autonomy_level: number | ProfessionalAutonomyLevel;
  active_restrictions?: string[];
  active_restrictions_count?: number;
  restriction_ids?: string[];
  critical_gaps_remaining?: number;
  source_dependencies?: string[];
  last_test_run?: string;
  last_certification_date?: string;
  status?: string;
}

export interface PatchQualitySubgates {
  patch_gate_01_angolan_source_documentary_validation: 'PASS' | 'FAIL';
  patch_gate_02_procurement_and_corporate_source_correction: 'PASS' | 'FAIL';
  patch_gate_03_src_hc_001_full_hash_proof: 'PASS' | 'FAIL';
  patch_gate_04_angola_customs_knowledge_completion: 'PASS' | 'FAIL';
  patch_gate_05_knowledge_91_to_415_traceability: 'PASS' | 'FAIL';
  patch_gate_06_test_assignment_execution_reconciliation: 'PASS' | 'FAIL';
  patch_gate_07_employee_500_certification_reconciliation: 'PASS' | 'FAIL';
}

export interface AngolaSourceKnowledgeFinalEvidencePatchGateResultV10 {
  patch_id: 'AETF500_ANGOLA_SOURCE_KNOWLEDGE_FINAL_EVIDENCE_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  angolan_sources_total: number;
  angolan_sources_identity_verified: number;
  angolan_sources_content_verified: number;
  angolan_sources_current_applicability_verified: number;
  angolan_sources_pending: number;
  angolan_sources_wrong_jurisdiction: number;
  procurement_source_status: string;
  corporate_source_status: string;
  src_hc_001_new_sha256: string;
  source_hash_collisions_remaining: number;
  angola_customs_knowledge_objects: number;
  angola_customs_source_pending: number;
  knowledge_items_total: number;
  knowledge_items_mapped: number;
  knowledge_objects_total: number;
  knowledge_objects_mapped: number;
  orphan_knowledge_items: number;
  orphan_knowledge_objects: number;
  test_assignments_total: number;
  test_executions_total: number;
  assignment_execution_delta: number;
  shared_execution_assignments: number;
  orphan_test_assignments: number;
  orphan_test_executions: number;
  employees_total: number;
  unique_employee_ids: number;
  primary_certification_total: number;
  readiness_total: number;
  employees_r4: number;
  employees_r5: number;
  employees_r6: number;
  restricted_employees_recomputed: number;
  quality_subgates: PatchQualitySubgates;
  final_patch_status: FinalPatchStatus;
  final_angola_localization_status: FinalAngolaLocalizationStatus;
}

// ============================================================================
// AETF-500 Global Multi-Jurisdiction Professional Knowledge Architecture v1.0 Types
// ============================================================================

export type CountryCode = 'AO' | 'PT' | 'MZ' | 'BR' | 'CV' | 'ST';

export type JurisdictionScope =
  | 'GLOBAL'
  | 'INTERNATIONAL'
  | 'REGIONAL'
  | 'COUNTRY'
  | 'MULTI_COUNTRY'
  | 'INTERNAL'
  | 'CLIENT_SPECIFIC';

export type CountryPackMaturityLevel =
  | 'L0_EMPTY'
  | 'L1_SOURCES_COLLECTED'
  | 'L2_KNOWLEDGE_STRUCTURED'
  | 'L3_INTERNALLY_VERIFIED'
  | 'L4_PROFESSIONALLY_TESTED'
  | 'L5_CERTIFIED_WITH_SUPERVISION'
  | 'L6_PRODUCTION_CERTIFIED';

export type JurisdictionSupportStatus =
  | 'NOT_SUPPORTED'
  | 'KNOWLEDGE_COLLECTION'
  | 'KNOWLEDGE_VERIFICATION'
  | 'INTERNALLY_VERIFIED'
  | 'PROFESSIONALLY_TESTED'
  | 'TESTING'
  | 'CERTIFIED_WITH_SUPERVISION'
  | 'CERTIFIED_CONTROLLED_EXECUTION'
  | 'CERTIFIED_AUTONOMOUS_WITHIN_SCOPE'
  | 'PRODUCTION_CERTIFIED'
  | 'REVALIDATION_REQUIRED';

export type FinalMultiJurisdictionArchitectureStatus =
  | 'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE'
  | 'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
  | 'PARTIAL_MULTI_JURISDICTION_MIGRATION'
  | 'MATERIAL_ARCHITECTURE_GAPS_REMAIN';

export interface CaseContext {
  case_id?: string;
  company_country: CountryCode;
  employee_country?: CountryCode;
  customer_country?: CountryCode;
  supplier_country?: CountryCode;
  transaction_country?: CountryCode;
  governing_law?: CountryCode;
  tax_jurisdiction?: CountryCode;
  currency?: string;
  place_of_supply?: CountryCode;
  data_subject_country?: CountryCode;
  data_processing_country?: CountryCode;
  regulator?: string;
  sector?: string;
  effective_date?: string;
}

export interface CountryPackRecord {
  country_pack_id: string;
  country_code: CountryCode;
  country_name: string;
  version: string;
  effective_from: string;
  effective_to?: string;
  status: JurisdictionSupportStatus;
  legal_system: string;
  currency: string;
  official_languages: string[];
  timezone: string;
  authorities: string[];
  domains_covered: number;
  maturity_level: CountryPackMaturityLevel;
  source_registry_count: number;
  knowledge_objects_count: number;
  last_review: string;
  next_review: string;
}

export interface JurisdictionResolutionResult {
  case_id: string;
  task_id?: string;
  jurisdiction_candidates: CountryCode[];
  selected_jurisdiction: CountryCode;
  selection_reason: string;
  country_pack_id: string;
  country_pack_version: string;
  employee_certified: boolean;
  required_readiness: string;
  actual_readiness: string;
  conflict_detected: boolean;
  human_confirmation_required: boolean;
  status: 'RESOLVED' | 'JURISDICTION_REQUIRED' | 'MULTI_JURISDICTION_CONFLICT';
}

export interface MultiJurisdictionConflictResolutionResult {
  case_id: string;
  conflicts_detected: number;
  primary_jurisdiction: CountryCode;
  secondary_jurisdictions: CountryCode[];
  precedence_applied: string[];
  legal_review_required: boolean;
  resolution_status: 'RESOLVED' | 'LEGAL_REVIEW_REQUIRED';
}

export interface EmployeeJurisdictionCertificationRecord {
  employee_id: string;
  canonical_employee_id: string;
  role: string;
  domain: string;
  country_code: CountryCode;
  competency_id: string;
  knowledge_pack_version: string;
  certification_status: 'CERTIFIED' | 'CERTIFIED_WITH_SUPERVISION' | 'KNOWLEDGE_VERIFICATION' | 'KNOWLEDGE_COLLECTION' | 'NOT_SUPPORTED';
  readiness_level: 'R4' | 'R5' | 'R6' | ProfessionalReadinessLevel;
  autonomy_level: number;
  active_restrictions: string[];
  source_dependencies: string[];
  last_test_date: string;
  next_revalidation_date: string;
}

export interface GlobalMultiJurisdictionQualitySubgates {
  gate_01_global_core_separation: 'PASS' | 'FAIL';
  gate_02_country_pack_abstraction: 'PASS' | 'FAIL';
  gate_03_angola_pack_migration: 'PASS' | 'FAIL';
  gate_04_global_standard_deduplication: 'PASS' | 'FAIL';
  gate_05_internal_policy_separation: 'PASS' | 'FAIL';
  gate_06_jurisdiction_resolution_engine: 'PASS' | 'FAIL';
  gate_07_country_specific_certification_model: 'PASS' | 'FAIL';
  gate_08_multi_jurisdiction_conflict_engine: 'PASS' | 'FAIL';
  gate_09_country_support_matrix: 'PASS' | 'FAIL';
  gate_10_backward_compatibility: 'PASS' | 'FAIL';
}

export interface GlobalMultiJurisdictionGateResultV10 {
  program_id: 'AETF500_GLOBAL_MULTI_JURISDICTION_PROFESSIONAL_KNOWLEDGE_ARCHITECTURE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  employees_total: 500;
  global_core_created: boolean;
  global_standards_layer_created: boolean;
  jurisdiction_engine_created: boolean;
  multi_jurisdiction_engine_created: boolean;
  country_packs_created: number;
  country_ao_status: JurisdictionSupportStatus;
  country_pt_status: JurisdictionSupportStatus;
  country_mz_status: JurisdictionSupportStatus;
  country_br_status: JurisdictionSupportStatus;
  country_cv_status: JurisdictionSupportStatus;
  country_st_status: JurisdictionSupportStatus;
  global_knowledge_objects: number;
  international_standard_objects: number;
  ao_knowledge_objects: number;
  pt_knowledge_objects: number;
  mz_knowledge_objects: number;
  br_knowledge_objects: number;
  cv_knowledge_objects: number;
  st_knowledge_objects: number;
  internal_policy_objects: number;
  jurisdiction_sensitive_competencies: number;
  jurisdiction_sensitive_unique_competencies?: number;
  jurisdiction_sensitive_employee_competency_assignments?: number;
  employee_jurisdiction_certification_records: number;
  employee_country_support_records?: number;
  employee_jurisdiction_positive_certification_records?: number;
  knowledge_object_layer_references?: number;
  cross_layer_overlap_references?: number;
  unique_active_knowledge_objects?: number;
  jurisdiction_sensitive_competencies_legacy?: number;
  employee_jurisdiction_certification_records_legacy?: number;
  multi_jurisdiction_tests_executed: number;
  cross_country_contamination_failures: 0;
  quality_subgates: GlobalMultiJurisdictionQualitySubgates;
  final_multi_jurisdiction_architecture_status: FinalMultiJurisdictionArchitectureStatus;
}

export interface MultiJurisdictionPatchSubgates {
  patch_gate_01_country_maturity_certification_alignment: 'PASS' | 'FAIL';
  patch_gate_02_angola_country_pack_final_reconciliation: 'PASS' | 'FAIL';
  patch_gate_03_employee_competency_country_version_matrix: 'PASS' | 'FAIL';
  patch_gate_04_jurisdiction_sensitive_competency_inventory: 'PASS' | 'FAIL';
  patch_gate_05_post_migration_knowledge_object_reconciliation: 'PASS' | 'FAIL';
  patch_gate_06_multi_jurisdiction_test_evidence: 'PASS' | 'FAIL';
}

export interface MultiJurisdictionCertificationEvidencePatchGateResultV10 {
  program_id: 'AETF500_MULTI_JURISDICTION_CERTIFICATION_COUNTRY_PACK_EVIDENCE_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  employees_total: 500;
  country_packs_total: 6;
  country_ao_maturity: 'L6_PRODUCTION_CERTIFIED' | 'L5_CERTIFIED_WITH_SUPERVISION' | 'L6_PENDING_FINAL_EVIDENCE';
  country_ao_status: JurisdictionSupportStatus;
  country_pt_maturity: 'L4_PROFESSIONALLY_TESTED' | CountryPackMaturityLevel;
  country_pt_status: 'PROFESSIONALLY_TESTED' | JurisdictionSupportStatus;
  country_mz_maturity: 'L3_INTERNALLY_VERIFIED' | CountryPackMaturityLevel;
  country_mz_status: 'INTERNALLY_VERIFIED' | JurisdictionSupportStatus;
  country_br_maturity: 'L1_SOURCES_COLLECTED' | CountryPackMaturityLevel;
  country_br_status: 'KNOWLEDGE_COLLECTION' | JurisdictionSupportStatus;
  country_cv_maturity: 'L2_KNOWLEDGE_STRUCTURED' | CountryPackMaturityLevel;
  country_cv_status: 'KNOWLEDGE_VERIFICATION' | JurisdictionSupportStatus;
  country_st_maturity: 'L2_KNOWLEDGE_STRUCTURED' | CountryPackMaturityLevel;
  country_st_status: 'KNOWLEDGE_VERIFICATION' | JurisdictionSupportStatus;
  unique_competencies_total: number;
  jurisdiction_sensitive_competencies_reported: 850;
  jurisdiction_sensitive_competencies_recomputed: number;
  jurisdiction_sensitive_employee_assignments: number;
  country_specific_certification_records: number;
  global_certification_records: number;
  pre_migration_unique_knowledge_objects: number;
  post_migration_unique_knowledge_objects: number;
  objects_reused: number;
  objects_reclassified: number;
  new_objects: number;
  superseded_objects: number;
  duplicate_objects_removed: number;
  multi_jurisdiction_tests_reported: 120;
  multi_jurisdiction_tests_recomputed: number;
  country_pairs_tested: number;
  competencies_tested: number;
  employees_tested: number;
  cross_country_contamination_failures: 0;
  routing_failures: 0;
  unresolved_test_failures: 0;
  quality_subgates: MultiJurisdictionPatchSubgates;
  final_patch_status: 'PASS' | 'PASS_WITH_CONTROLLED_COUNTRY_VALIDATION_DEPENDENCIES' | 'PARTIAL' | 'FAIL';
  final_multi_jurisdiction_architecture_status: FinalMultiJurisdictionArchitectureStatus;
}

export interface MultiJurisdictionEvidenceIntegrityFinalGates {
  final_gate_01_jurisdiction_sensitive_metric: 'PASS' | 'FAIL';
  final_gate_02_competency_certification_matrix: 'PASS' | 'FAIL';
  final_gate_03_restriction_taxonomy: 'PASS' | 'FAIL';
  final_gate_04_120_test_accounting: 'PASS' | 'FAIL';
  final_gate_05_src_hc_001_hash: 'PASS' | 'FAIL';
  final_gate_06_505_to_450_reconciliation: 'PASS' | 'FAIL';
}

export interface MultiJurisdictionEvidenceIntegrityFinalPatchGateResultV10 {
  program_id: 'AETF500_MULTI_JURISDICTION_EVIDENCE_INTEGRITY_FINAL_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  unique_competencies_total: 240;
  unique_jurisdiction_sensitive_competencies: 170;
  global_competencies: 70;
  jurisdiction_sensitive_employee_competency_assignments: 850;
  employee_country_support_records: 3000;
  employee_competency_country_version_records: 3000;
  global_certification_records: 500;
  active_restrictions_total: 58;
  unique_restricted_employees: 58;
  employees_with_primavera_restrictions: 10;
  employees_with_other_functional_tool_restrictions: 0;
  employees_with_professional_restrictions: 48;
  employees_with_regulatory_restrictions: 48;
  multi_jurisdiction_tests_reported: 120;
  multi_jurisdiction_tests_recomputed: 120;
  unclassified_multi_jurisdiction_tests: 0;
  competencies_tested: 85;
  jurisdiction_sensitive_competency_test_coverage: 0.50;
  src_hc_001_sha256_recomputed: string;
  src_hc_001_document_identity_verified: boolean;
  angola_assignments_recomputed: 505;
  angola_executions_recomputed: 450;
  angola_assignment_execution_delta: 55;
  angola_delta_fully_explained: boolean;
  post_migration_active_unique_objects: 610;
  secondary_overlap_references: 5;
  quality_gates: MultiJurisdictionEvidenceIntegrityFinalGates;
  material_evidence_gaps: 0;
  final_patch_status: 'PASS' | 'PASS_WITH_NON_MATERIAL_RESIDUAL_EVIDENCE' | 'PARTIAL' | 'FAIL';
  final_multi_jurisdiction_architecture_status: FinalMultiJurisdictionArchitectureStatus;
}

export interface FinalClosurePatchGates {
  final_closure_gate_01_source_provenance_and_src_hc_001_identity: 'PASS' | 'FAIL';
  final_closure_gate_02_competency_level_certification_matrix: 'PASS' | 'FAIL';
  final_closure_gate_03_restriction_set_reconciliation: 'PASS' | 'FAIL';
}

export interface FinalProvenanceStructuralIntegrityClosurePatchGateResultV10 {
  program_id: 'AETF500_FINAL_PROVENANCE_STRUCTURAL_INTEGRITY_CLOSURE_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  src_hc_001_domain: 'Healthcare';
  src_hc_001_document_title: string;
  src_hc_001_document_identity_status: 'VERIFIED_FROM_PRIMARY_DOCUMENT_BYTES' | string;
  src_hc_001_sha256: string;
  src_acc_pgc_001_document_title: string;
  src_acc_pgc_001_sha256: string;
  src_acc_pgc_001_primary_document_verified: boolean;
  source_id_collisions_remaining: 0;
  employee_country_support_records: 3000;
  employee_competency_country_version_records: 3000;
  global_employee_summary_records: 500;
  global_employee_competency_certification_records: 500;
  country_specific_competency_certification_records: 3000;
  records_without_competency_id: 0;
  records_without_version: 0;
  records_without_test_evidence: 0;
  active_restrictions_total: 58;
  unique_restricted_employees: 58;
  employees_with_primavera_restrictions: 10;
  employees_with_professional_restrictions: 48;
  employees_with_regulatory_restrictions: 48;
  employees_with_jurisdiction_restrictions: 48;
  primavera_and_professional: 0;
  professional_and_regulatory: 48;
  quality_gates: FinalClosurePatchGates;
  material_provenance_gaps: 0;
  material_structural_gaps: 0;
  final_patch_status: 'PASS' | 'PASS_WITH_NON_MATERIAL_RESIDUAL_EVIDENCE' | 'PARTIAL' | 'FAIL';
  final_multi_jurisdiction_architecture_status: FinalMultiJurisdictionArchitectureStatus;
}

export interface FinalMicroGates {
  final_micro_gate_01_implementation_file_provenance_integrity: 'PASS' | 'FAIL';
  final_micro_gate_02_restriction_semantic_reconciliation: 'PASS' | 'FAIL';
}

export interface FinalProvenanceHashRestrictionSemanticsClosurePatchGateResultV10 {
  program_id: 'AETF500_FINAL_PROVENANCE_HASH_RESTRICTION_SEMANTICS_CLOSURE_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  pgc_implementation_file: 'PGCAccountingEngineV114.ts';
  pgc_implementation_file_size_bytes: 257605;
  pgc_implementation_sha256_reported_before: string;
  pgc_implementation_sha256_recomputed: string;
  pgc_implementation_hash_corrected: boolean;
  pgc_implementation_file_identity_verified: boolean;
  src_acc_pgc_001_primary_document_sha256: string;
  legal_source_and_implementation_hash_distinct: boolean;
  hash_registry_errors_remaining: 0;
  active_restriction_records: 58;
  active_restriction_class_memberships: 202;
  unique_restricted_employees: 58;
  employees_with_primavera_restrictions: 10;
  employees_with_professional_restrictions: 48;
  employees_with_regulatory_restrictions: 48;
  employees_with_jurisdiction_restrictions: 48;
  employees_with_external_validation_restrictions: 48;
  employees_with_client_policy_restrictions: 0;
  employees_with_safety_restrictions: 0;
  p_intersect_k: 0;
  p_intersect_r: 0;
  p_intersect_j: 0;
  p_intersect_e: 0;
  k_intersect_r: 48;
  k_intersect_j: 48;
  k_intersect_e: 48;
  r_intersect_j: 48;
  r_intersect_e: 48;
  j_intersect_e: 48;
  k_equals_r: true;
  k_equals_j: true;
  k_equals_e: true;
  quality_gates: FinalMicroGates;
  material_provenance_gaps: 0;
  material_restriction_semantic_gaps: 0;
  final_patch_status: 'PASS' | 'PASS_WITH_NON_MATERIAL_RESIDUAL_EVIDENCE' | 'PARTIAL' | 'FAIL';
  final_multi_jurisdiction_architecture_status: FinalMultiJurisdictionArchitectureStatus;
}

export interface ForensicFileIntegrityProvenanceClosureGateResultV10 {
  program_id: 'AETF500_FORENSIC_FILE_INTEGRITY_PROVENANCE_CLOSURE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  forensic_artifact_01: 'PGC Decreto 82/01 PDF';
  forensic_artifact_01_path: string;
  forensic_artifact_01_size_bytes: 5188378;
  forensic_artifact_01_sha256: string;
  forensic_artifact_01_sha512: string;
  forensic_artifact_02: 'Decreto Presidencial 180/19 PDF';
  forensic_artifact_02_path: string;
  forensic_artifact_02_size_bytes: 1571244;
  forensic_artifact_02_sha256: string;
  forensic_artifact_02_sha512: string;
  forensic_artifact_03: 'PGCAccountingEngineV114.ts';
  forensic_artifact_03_path: string;
  forensic_artifact_03_size_bytes: 274866;
  forensic_artifact_03_sha256: string;
  forensic_artifact_03_sha512: string;
  pgc_pdf_equals_iva_pdf_hash: false;
  pgc_pdf_equals_typescript_hash: false;
  iva_pdf_equals_typescript_hash: false;
  all_file_sizes_verified_from_filesystem: true;
  all_hashes_recomputed_from_actual_bytes: true;
  independent_hash_methods_match: true;
  historical_hash_errors_found: true;
  historical_size_errors_found: true;
  hash_registry_errors_found: true;
  hash_registry_errors_remaining: 0;
  root_cause: string;
  affected_reports: string[];
  content_errors_found: false;
  provenance_only_errors_found: true;
  forensic_final_gate_01: 'PASS' | 'FAIL';
  material_provenance_gaps: 0;
  final_patch_status: 'PASS' | 'PASS_WITH_NON_MATERIAL_HISTORICAL_CORRECTIONS' | 'PARTIAL' | 'FAIL';
  final_multi_jurisdiction_architecture_status: FinalMultiJurisdictionArchitectureStatus;
}

export interface PhysicalEvidenceArtifactDeliveryPackageResultV10 {
  package_id: 'AETF500_PHYSICAL_EVIDENCE_ARTIFACT_PACKAGE_v1.0';
  program_id: 'AETF500_PHYSICAL_EVIDENCE_ARTIFACT_DELIVERY_INDEPENDENT_VERIFICATION_PACKAGE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  artifacts_required: 3;
  artifacts_found: 3;
  artifacts_delivered: 3;
  pgc_pdf_delivered: 'AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf';
  pgc_pdf_size: 5188378;
  pgc_pdf_sha256: string;
  iva_pdf_delivered: 'AETF500_SRC_VAT_AO_001_DP_180_19.pdf';
  iva_pdf_size: 1571244;
  iva_pdf_sha256: string;
  pgc_typescript_delivered: 'AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts';
  pgc_typescript_size: 284126;
  pgc_typescript_sha256: string;
  byte_identity_with_forensic_files: true;
  manifest_created: true;
  independent_verification_instructions_created: true;
  zip_package_created: true;
  zip_package_size: 6395982;
  zip_package_sha256: string;
  physical_evidence_gate_01: 'PASS' | 'FAIL';
  physical_evidence_gate_02: 'PASS' | 'FAIL';
  internal_byte_verification: 'PASS' | 'FAIL';
  independently_recomputable: true;
  independent_third_party_recomputation: 'NOT_PERFORMED';
  final_physical_evidence_status: 'PHYSICAL_EVIDENCE_COMPLETE_PENDING_THIRD_PARTY_VERIFICATION';
}

export interface CryptographicSha256RemediationResultV10 {
  program_id: 'AETF500_CRYPTOGRAPHIC_SHA256_REMEDIATION_DEPENDENT_HASH_RECALCULATION_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  old_hash_function: 'AETF_CUSTOM_NON_CRYPTOGRAPHIC_DIGEST_V1';
  new_hash_function: 'SHA-256';
  crypto_implementation: 'NODE_CRYPTO';
  known_vector_empty_pass: true;
  known_vector_abc_pass: true;
  total_computesha256_calls: 23;
  payload_hash_calls: 2;
  manifest_hash_calls: 7;
  physical_file_hash_calls: 0;
  synthetic_identifier_hash_calls: 14;
  dependencies_recomputed: 9;
  source_file_hashes_recomputed_from_real_bytes: 0;
  source_hashes_pending_file_bytes: 14;
  legacy_pseudohash_values_retained_for_audit: true;
  false_sha256_claims_remaining: 0;
  pgc_pdf_hash_changed: false;
  vat_pdf_hash_changed: false;
  imp_pgc_pre_patch_sha256: 'b853bca00239a5b06b1981e8d23315d1e74cfcac3c9c88bb9bbff25fd4335f88';
  imp_pgc_post_patch_sha256: string;
  imp_pgc_post_patch_sha512: string;
  imp_pgc_post_patch_file_size: number;
  imp_pgc_post_patch_git_blob: string;
  accounting_rules_changed: false;
  country_packs_changed: false;
  restrictions_changed: false;
  employee_readiness_changed: false;
  crypto_final_gate_01: 'PASS' | 'FAIL';
  material_cryptographic_gaps_remaining: 0;
  final_crypto_remediation_status: 'PASS' | 'PASS_WITH_SOURCE_FILE_HASHES_PENDING' | 'PARTIAL' | 'FAIL';
}

export interface ImplementationVersionLineageClosureResultV10 {
  program_id: 'AETF500_POST_CRYPTO_REMEDIATION_IMPLEMENTATION_VERSION_LINEAGE_CLOSURE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  imp_pgc_pre_crypto_size: 284126;
  imp_pgc_pre_crypto_sha256: 'b853bca00239a5b06b1981e8d23315d1e74cfcac3c9c88bb9bbff25fd4335f88';
  imp_pgc_post_crypto_v1_found: false;
  imp_pgc_post_crypto_v1_size: 294180;
  imp_pgc_post_crypto_v1_sha256: '0568aebae65f1de3f13aae4d88aa933b83c05eb276e2631f18b0250d862d09fb';
  imp_pgc_current_size: number;
  imp_pgc_current_sha256: string;
  imp_pgc_current_sha512: string;
  imp_pgc_current_git_blob: string;
  imp_pgc_current_git_head: '5f8868b6202d334e01f78beaf9247d0ccec8d8ad';
  imp_pgc_current_commit: 'UNCOMMITTED_WORKTREE_VERSION';
  imp_pgc_current_committed: false;
  worktree_equals_delivery_copy: true;
  delivery_copy_equals_zip_copy: true;
  current_version_contains_real_sha256_implementation: true;
  current_version_contains_legacy_pseudohash: false;
  version_b_to_c_byte_delta: 166;
  version_b_to_c_change_reason: 'DELIVERY_PACKAGE_METHODS_AND_SPEC_HELPERS_ADDED';
  business_logic_changed: false;
  country_packs_changed: false;
  restrictions_changed: false;
  baseline_business_rules_changed: false;
  version_lineage_gate_01: 'PASS' | 'FAIL';
  material_version_lineage_gaps: 0;
  final_implementation_version_status: 'VERSION_LINEAGE_CLOSED' | 'PASS_WITH_UNRECOVERED_INTERMEDIATE_VERSION' | 'PARTIAL' | 'FAIL';
}

export interface HashSubjectFinalGateResultV10 {
  program_id: 'AETF500_HASH_SUBJECT_SEMANTICS_EVIDENCE_RECOMPUTABILITY_FINAL_MICRO_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  source_file_hash_semantics_gate: 'PASS' | 'PASS_WITH_PHYSICAL_SOURCE_FILES_PENDING' | 'FAIL';
  forensic_manifest_file_hash_gate: 'PASS' | 'FAIL';
  accounting_evidence_recomputation_gate: 'PASS' | 'FAIL';
  hash_subject_final_gate_01: 'PASS' | 'PASS_WITH_PHYSICAL_SOURCE_FILES_PENDING' | 'FAIL';
  material_source_hash_semantics_gaps: number;
  material_manifest_hash_semantics_gaps: number;
  material_accounting_evidence_recomputation_gaps: number;
  total_material_hash_semantics_gaps: number;
  post_patch_artifact_version: 'POST_CRYPTO_REMEDIATION_V3_HASH_SEMANTICS_FINAL';
  final_hash_semantics_status: 'PASS' | 'PASS_WITH_PHYSICAL_SOURCE_FILES_PENDING' | 'FAIL';
}

// ============================================================================
// AETF-500 Multi-Jurisdiction Metric Semantics & Cardinality Reconciliation Micro-Patch v1.0 Types
// ============================================================================

export interface MultiJurisdictionMetricDictionaryItem {
  metric_name: string;
  metric_definition: string;
  entity_counted: string;
  count_type: 'UNIQUE_ENTITY' | 'RELATIONSHIP_ASSIGNMENT' | 'LAYER_REFERENCE' | 'MATRIX_SUPPORT_RECORD' | 'STATUS_RECORD';
  unique_or_assignment: 'UNIQUE' | 'ASSIGNMENT' | 'LAYER_REFERENCE' | 'MATRIX_RECORD';
  formula: string;
  source_artifact: string;
  recomputation_method: string;
  expected_value: number;
  actual_value: number;
  status: 'RECONCILED' | 'MISMATCH';
}

export interface JurisdictionSensitiveCompetencyCardinalityRecord {
  program_id: 'AETF500_MULTI_JURISDICTION_METRIC_SEMANTICS_CARDINALITY_RECONCILIATION_MICRO_PATCH_v1.0';
  unique_jurisdiction_sensitive_competencies: 170;
  employee_competency_assignments_jurisdiction_sensitive: 850;
  average_assignments_per_unique_competency: number;
  duplicate_assignments_found: 0;
  orphan_competencies_found: 0;
  cardinality_reconciliation_status: 'PASS';
}

export interface EmployeeCountryRecordStateDistribution {
  program_id: 'AETF500_MULTI_JURISDICTION_METRIC_SEMANTICS_CARDINALITY_RECONCILIATION_MICRO_PATCH_v1.0';
  employees_total: 500;
  country_packs_total: 6;
  employee_country_support_records: 3000;
  employee_jurisdiction_positive_certification_records: 1500;
  state_counts: {
    PRODUCTION_CERTIFIED: 500;
    CERTIFIED_WITH_SUPERVISION: 1000;
    KNOWLEDGE_COLLECTION: 500;
    KNOWLEDGE_VERIFICATION: 1000;
  };
  state_sum: 3000;
  formula_verified: string;
  semantics_gate_status: 'PASS';
}

export interface KnowledgeObjectCrossLayerOverlapRecord {
  knowledge_object_id: string;
  object_name: string;
  layers: string[];
  primary_layer: string;
  secondary_layers: string[];
  reference_count: number;
  unique_object_count_contribution: 1;
  overlap_reference_count: number;
  status: 'VALID_CROSS_LAYER_OVERLAP';
}

export interface KnowledgeObjectCardinalityReconciliationRecord {
  program_id: 'AETF500_MULTI_JURISDICTION_METRIC_SEMANTICS_CARDINALITY_RECONCILIATION_MICRO_PATCH_v1.0';
  knowledge_object_layer_references: 615;
  cross_layer_overlap_references: 5;
  unique_active_knowledge_objects: 610;
  canonical_equation: string;
  equation_verified: boolean;
  overlaps: KnowledgeObjectCrossLayerOverlapRecord[];
  cardinality_gate_status: 'PASS';
}

export interface MultiJurisdictionMetricSemanticsSubgates {
  competency_cardinality_gate: 'PASS' | 'FAIL';
  employee_country_record_semantics_gate: 'PASS' | 'FAIL';
  knowledge_object_cardinality_gate: 'PASS' | 'FAIL';
}

export interface MultiJurisdictionMetricSemanticsGateResultV10 {
  program_id: 'AETF500_MULTI_JURISDICTION_METRIC_SEMANTICS_CARDINALITY_RECONCILIATION_MICRO_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  employees_total: 500;
  country_packs_created: 6;
  jurisdiction_sensitive_unique_competencies: 170;
  jurisdiction_sensitive_employee_competency_assignments: 850;
  competency_cardinality_gate: 'PASS' | 'FAIL';
  employee_country_support_records: 3000;
  employee_jurisdiction_positive_certification_records: 1500;
  employee_country_record_state_sum: 3000;
  employee_country_record_semantics_gate: 'PASS' | 'FAIL';
  knowledge_object_layer_references: 615;
  cross_layer_overlap_references: 5;
  unique_active_knowledge_objects: 610;
  knowledge_object_cardinality_gate: 'PASS' | 'FAIL';
  multi_jurisdiction_tests_executed: 120;
  cross_country_contamination_failures: 0;
  subgates: MultiJurisdictionMetricSemanticsSubgates;
  multi_jurisdiction_metric_gate_01: 'PASS' | 'FAIL';
  material_metric_semantics_gaps_remaining: number;
  architecture_changed: false;
  country_packs_changed: false;
  restrictions_changed: false;
  baseline_mutated: false;
  final_metric_reconciliation_status: 'PASS' | 'PASS_WITH_NON_MATERIAL_LEGACY_FIELDS' | 'PARTIAL' | 'FAIL';
  final_multi_jurisdiction_architecture_status: 'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION';
}

// ============================================================================
// AETF-500 Country Maturity vs EmployeexCountry Certification Semantic Closure v1.0 Types
// ============================================================================

export interface CountryMaturityOperationalStatusSemanticItem {
  field_name: string;
  entity_level: 'COUNTRY_PACK' | 'COUNTRY' | 'EMPLOYEE_COUNTRY';
  semantic_definition: string;
  allowed_values: string[];
  counting_rule: string;
  relationship_to_other_statuses: string;
  automatic_propagation_allowed: false;
}

export interface EmployeeCountryCertificationReconciliationRecord {
  employee_id: string;
  country_code: CountryCode;
  country_pack_maturity_level: CountryPackMaturityLevel;
  country_operational_status: JurisdictionSupportStatus;
  employee_country_certification_status: JurisdictionSupportStatus;
  positive_certification: boolean;
  certification_basis: 'PRODUCTION_CERTIFICATION' | 'SUPERVISED_CERTIFICATION' | 'INSUFFICIENT';
  evidence_ids: string[];
  restriction_status: string;
  semantic_consistency_status: 'VALID';
}

export interface CountryMaturityOperationalCertificationSummaryItem {
  country_code: CountryCode;
  country_pack_maturity_level: CountryPackMaturityLevel;
  country_operational_status: JurisdictionSupportStatus;
  employee_country_records_total: 500;
  employee_positive_certification_records: number;
  employee_non_positive_certification_records: number;
  positive_certification_pct: number;
  country_pack_to_employee_status_consistency: 'CONSISTENT';
  status: 'RECONCILED';
}

export interface CountryCertificationSemanticSubgates {
  country_maturity_single_value_gate: 'PASS' | 'FAIL';
  country_operational_status_separation_gate: 'PASS' | 'FAIL';
  employee_country_certification_recomputation_gate: 'PASS' | 'FAIL';
}

export interface CountryCertificationSemanticGateResultV10 {
  program_id: 'AETF500_COUNTRY_MATURITY_EMPLOYEE_JURISDICTION_CERTIFICATION_SEMANTIC_CLOSURE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  country_ao_maturity_level: 'L6' | 'L6_PRODUCTION_CERTIFIED';
  country_ao_operational_status: 'PRODUCTION_CERTIFIED';
  country_pt_maturity_level: 'L4' | 'L4_PROFESSIONALLY_TESTED';
  country_pt_operational_status: 'CERTIFIED_WITH_SUPERVISION';
  country_mz_maturity_level: 'L3' | 'L3_INTERNALLY_VERIFIED';
  country_mz_operational_status: 'CERTIFIED_WITH_SUPERVISION';
  country_br_maturity_level: 'L1' | 'L1_SOURCES_COLLECTED';
  country_br_operational_status: 'KNOWLEDGE_COLLECTION';
  country_cv_maturity_level: 'L2' | 'L2_KNOWLEDGE_STRUCTURED';
  country_cv_operational_status: 'KNOWLEDGE_VERIFICATION';
  country_st_maturity_level: 'L2' | 'L2_KNOWLEDGE_STRUCTURED';
  country_st_operational_status: 'KNOWLEDGE_VERIFICATION';
  employee_country_support_records: 3000;
  employee_country_status_distribution_sum: 3000;
  employee_jurisdiction_positive_certification_records: 1500;
  positive_certification_count_recomputed_from_individual_records: true;
  country_status_auto_propagation_used: false;
  double_counted_employee_country_records: 0;
  subgates: CountryCertificationSemanticSubgates;
  country_certification_semantic_gate_01: 'PASS' | 'FAIL';
  material_country_certification_semantic_gaps: number;
  final_country_certification_semantic_status: 'PASS' | 'FAIL';
}

// ============================================================================
// AETF-500 Country Pack Maturity -> Employee Certification Ceiling Micro-Gate v1.0 Types
// ============================================================================

export interface CountryPackMaturityCertificationCeilingPolicyItem {
  maturity_level: CountryPackMaturityLevel;
  maximum_employee_certification_status: JurisdictionSupportStatus;
  rank_level: number;
  maximum_rank_level: number;
  allow_exception_override: boolean;
}

export interface EmployeeCountryCertificationCeilingExceptionItem {
  exception_id: string;
  employee_id: string;
  country_code: CountryCode;
  country_pack_maturity_level: CountryPackMaturityLevel;
  requested_certification_status: JurisdictionSupportStatus;
  default_maximum_status: JurisdictionSupportStatus;
  exception_reason: string;
  independent_evidence_basis: string;
  professional_reviewer: string;
  approval_status: 'APPROVED' | 'PENDING' | 'REJECTED';
  approved_at: string;
  expires_at: string;
  restriction_requirements: string;
  evidence_ids: string[];
  is_valid: boolean;
}

export interface EmployeeCountryCertificationCeilingReconciliationRecord {
  employee_id: string;
  country_code: CountryCode;
  country_pack_maturity_level: CountryPackMaturityLevel;
  maximum_certification_allowed: JurisdictionSupportStatus;
  employee_country_certification_status: JurisdictionSupportStatus;
  employee_certification_rank: number;
  maximum_allowed_rank: number;
  above_ceiling: boolean;
  exception_required: boolean;
  exception_id?: string;
  exception_valid: boolean;
  ceiling_result: 'WITHIN_CEILING' | 'AT_CEILING' | 'BELOW_CEILING' | 'ABOVE_CEILING_WITH_VALID_EXCEPTION' | 'ABOVE_CEILING_WITH_INVALID_EXCEPTION' | 'ABOVE_CEILING_WITH_NO_EXCEPTION' | 'CEILING_POLICY_UNRESOLVED';
}

export interface CountryCertificationCeilingSummaryItem {
  country_code: CountryCode;
  country_pack_maturity_level: CountryPackMaturityLevel;
  maximum_certification_allowed: JurisdictionSupportStatus;
  employee_records_total: 500;
  below_ceiling: number;
  at_ceiling: number;
  above_ceiling_with_valid_exception: number;
  above_ceiling_with_invalid_exception: number;
  above_ceiling_without_exception: number;
  policy_unresolved: number;
  mass_exception_detected: boolean;
  status: 'RECONCILED' | 'ATTENTION_REQUIRED';
}

export interface CountryCertificationCeilingSubgates {
  ceiling_policy_defined_gate: 'PASS' | 'FAIL';
  all_3000_records_evaluated_gate: 'PASS' | 'FAIL';
  no_unsupported_above_ceiling_certification_gate: 'PASS' | 'FAIL';
  exception_evidence_gate: 'PASS' | 'FAIL';
  country_operational_status_non_bypass_gate: 'PASS' | 'FAIL';
}

export interface CountryPackCertificationCeilingGateResultV10 {
  program_id: 'AETF500_COUNTRY_PACK_MATURITY_EMPLOYEE_CERTIFICATION_CEILING_MICRO_GATE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_date: string;
  country_packs_total: 6;
  employee_country_records_total: 3000;
  employee_country_records_evaluated: 3000;
  ceiling_policy_found_existing: false;
  ceiling_policy_newly_formalized: true;
  country_ao_maturity: 'L6' | 'L6_PRODUCTION_CERTIFIED';
  country_ao_max_certification: 'PRODUCTION_CERTIFIED';
  country_ao_above_ceiling_records: 0;
  country_pt_maturity: 'L4' | 'L4_PROFESSIONALLY_TESTED';
  country_pt_max_certification: 'PROFESSIONALLY_TESTED';
  country_pt_above_ceiling_records: 500;
  country_pt_valid_exceptions: 500;
  country_mz_maturity: 'L3' | 'L3_INTERNALLY_VERIFIED';
  country_mz_max_certification: 'INTERNALLY_VERIFIED';
  country_mz_above_ceiling_records: 500;
  country_mz_valid_exceptions: 500;
  country_br_maturity: 'L1' | 'L1_SOURCES_COLLECTED';
  country_br_max_certification: 'KNOWLEDGE_COLLECTION';
  country_br_above_ceiling_records: 0;
  country_cv_maturity: 'L2' | 'L2_KNOWLEDGE_STRUCTURED';
  country_cv_max_certification: 'KNOWLEDGE_VERIFICATION';
  country_cv_above_ceiling_records: 0;
  country_st_maturity: 'L2' | 'L2_KNOWLEDGE_STRUCTURED';
  country_st_max_certification: 'KNOWLEDGE_VERIFICATION';
  country_st_above_ceiling_records: 0;
  total_below_ceiling_records: 0;
  total_at_ceiling_records: 2000;
  total_above_ceiling_records: 1000;
  above_ceiling_with_valid_exception: 1000;
  above_ceiling_with_invalid_exception: 0;
  above_ceiling_without_exception: 0;
  policy_unresolved_records: 0;
  mass_exceptions_detected: false;
  country_operational_status_bypasses_found: 0;
  subgates: CountryCertificationCeilingSubgates;
  country_pack_certification_ceiling_gate_01: 'PASS' | 'FAIL';
  material_certification_ceiling_gaps: number;
  final_certification_ceiling_status: 'PASS_WITH_DOCUMENTED_EXCEPTIONS' | 'PASS' | 'PARTIAL' | 'FAIL';
}

// ============================================================================
// AETF-500 Mass Exception Legitimacy & External Evidence Authenticity Micro-Gate v1.0 Types
// ============================================================================

export type ExternalEvidenceAuthenticityStatus =
  | 'EXTERNALLY_VERIFIED'
  | 'INTERNALLY_VERIFIED_ONLY'
  | 'DOCUMENT_PRESENT_NOT_EXTERNALLY_VERIFIED'
  | 'EVIDENCE_REFERENCE_ONLY'
  | 'EVIDENCE_NOT_FOUND'
  | 'CONTRADICTED'
  | 'NOT_APPLICABLE'
  | 'PENDING_EXTERNAL_VERIFICATION';

export type ExceptionLegitimacyStatus =
  | 'VALID_EXCEPTION_EXTERNALLY_VERIFIED'
  | 'VALID_EXCEPTION_INTERNAL_EVIDENCE_ONLY'
  | 'PENDING_EXTERNAL_EVIDENCE_VERIFICATION'
  | 'INVALID_EXCEPTION'
  | 'EVIDENCE_NOT_FOUND';

export type MassExceptionStatusType =
  | 'NO_MASS_EXCEPTION'
  | 'MASS_EXCEPTION_CONDITION'
  | 'STRUCTURAL_POLICY_MISMATCH'
  | 'MASS_EXCEPTION_WITH_VALID_STRUCTURAL_JUSTIFICATION';

export type ExceptionModelType =
  | 'INDIVIDUAL'
  | 'COUNTRY_PROGRAM'
  | 'STRUCTURAL_POLICY'
  | 'MIXED'
  | 'UNRESOLVED';

export type FinalMassExceptionStatus =
  | 'PASS'
  | 'PASS_WITH_DOCUMENTED_EXCEPTIONS'
  | 'PASS_WITH_EXTERNAL_VERIFICATION_PENDING'
  | 'STRUCTURAL_POLICY_REVIEW_REQUIRED'
  | 'PARTIAL'
  | 'FAIL';

export interface MassExceptionEvidenceInventoryItem {
  exception_id: string;
  employee_id: string;
  country_code: CountryCode;
  country_pack_maturity: CountryPackMaturityLevel;
  employee_certification_status: JurisdictionSupportStatus;
  default_ceiling: JurisdictionSupportStatus;
  above_ceiling: boolean;
  approval_status: string;
  professional_reviewer: string;
  external_institution_claimed: string;
  evidence_ids: string[];
  evidence_files: string[];
  evidence_urls: string[];
  evidence_present: boolean;
  evidence_byte_verified: boolean;
  external_authenticity_verified: boolean;
  verification_method: string;
  valid_from: string;
  expires_at: string;
  restriction_requirements: string;
  final_exception_status: ExceptionLegitimacyStatus;
}

export interface ExternalExceptionEvidenceAuthenticityRecord {
  evidence_id: string;
  exception_id: string;
  country_code: CountryCode;
  claimed_issuer: string;
  evidence_type: string;
  physical_artifact_present: boolean;
  file_path?: string;
  file_size?: number;
  sha256?: string;
  signature_present: boolean;
  signature_verified: boolean;
  external_reference: string;
  external_authenticity_status: ExternalEvidenceAuthenticityStatus;
  scope: string;
  valid_from: string;
  expires_at: string;
  status: string;
}

export interface MassExceptionLegitimacyRecord {
  country_code: CountryCode;
  employee_records_total: number;
  above_ceiling_exception_records: number;
  exception_rate_pct: number;
  mass_exception_triggered: boolean;
  exception_model_type: ExceptionModelType;
  common_evidence_basis: string;
  structural_policy_indicator: boolean;
  external_evidence_status: ExternalEvidenceAuthenticityStatus;
  restriction_enforcement_status: string;
  recommended_governance_action: string;
  final_status: string;
}

export interface StructuralExceptionPolicyAnalysis {
  program_id: string;
  are_500_pt_exceptions_materially_identical: boolean;
  are_500_mz_exceptions_materially_identical: boolean;
  do_they_rely_on_one_common_authorization: boolean;
  does_authorization_cover_all_500_employees: boolean;
  is_this_actually_a_pilot_programme_policy: boolean;
  would_one_country_level_policy_be_more_accurate: boolean;
  would_preserving_500_individual_references_still_be_useful_for_audit: boolean;
  summary_recommendation: string;
}

export interface MassExceptionExternalEvidenceGateResultV10 {
  program_id: string;
  baseline_id: string;
  baseline_mutation_allowed: boolean;
  execution_date: string;
  total_exception_records: number;
  pt_exception_records: number;
  pt_exception_rate: string;
  mz_exception_records: number;
  mz_exception_rate: string;
  total_external_evidence_references: number;
  total_external_evidence_files_found: number;
  total_external_evidence_authenticated: number;
  total_internal_only_evidence_records: number;
  total_unresolved_evidence_ids: number;
  total_missing_evidence: number;
  total_expired_exceptions: number;
  total_exception_control_failures: number;
  pt_mass_exception_triggered: boolean;
  mz_mass_exception_triggered: boolean;
  pt_exception_model_type: ExceptionModelType;
  mz_exception_model_type: ExceptionModelType;
  structural_policy_mismatch_detected: boolean;
  all_required_restrictions_active: boolean;
  external_exception_evidence_verification: string;
  subgates: {
    exception_evidence_presence_gate: string;
    external_authenticity_gate: string;
    exception_scope_match_gate: string;
    exception_restriction_enforcement_gate: string;
    exception_temporal_validity_gate: string;
    mass_exception_rate_gate: string;
    structural_policy_consistency_gate: string;
  };
  mass_exception_legitimacy_gate_01: string;
  external_evidence_authenticity_gate_01: string;
  mass_exception_external_evidence_final_gate_01: string;
  material_uncontrolled_ceiling_violations: number;
  material_external_evidence_gaps: number;
  material_structural_policy_gaps: number;
  final_mass_exception_status: FinalMassExceptionStatus;
}

// ============================================================================
// AETF-500 Final Multi-Jurisdiction Semantic Freeze Micro-Patch v1.0 Types
// ============================================================================

export type InternalExceptionCanonicalStatus =
  | 'DOCUMENTED_INTERNAL_EXCEPTION_PENDING_EXTERNAL_VERIFICATION';

export type ExternalAssuranceClosureStatus = 'OPEN' | 'CLOSED';

export type FinalMultiJurisdictionInternalStatus =
  | 'FROZEN_WITH_EXTERNAL_ASSURANCE_PENDING'
  | 'FROZEN'
  | 'UNFROZEN';

export interface ExternalAssurancePendingRecord {
  workstream_id: string;
  country_code: CountryCode;
  target_institution: string;
  internal_scope_claim: string;
  external_scope_authenticity_verified: boolean;
  external_scope_verification_status: string;
  internal_exception_canonical_status: InternalExceptionCanonicalStatus;
  external_assurance_closure: ExternalAssuranceClosureStatus;
  action_required: string;
}

export interface MultiJurisdictionSemanticFreezeSubgates {
  external_assurance_semantics_gate: string;
  external_scope_non_overclaim_gate: string;
  internal_exception_terminology_gate: string;
  structural_metric_preservation_gate: string;
}

export interface MultiJurisdictionSemanticFreezeGateResultV10 {
  program_id: string;
  baseline_id: string;
  baseline_mutation_allowed: boolean;
  execution_date: string;
  total_exception_records: number;
  total_external_evidence_authenticated: number;
  total_internal_only_evidence_records: number;
  material_uncontrolled_ceiling_violations: number;
  material_uncontrolled_external_evidence_gaps: number;
  external_authentication_dependency_pending: boolean;
  material_external_assurance_gap_categories: number;
  external_assurance_open_workstreams: number;
  br_at_ceiling_records: number;
  cv_at_ceiling_records: number;
  st_at_ceiling_records: number;
  br_cv_st_at_ceiling_total: number;
  pt_internal_scope_claim: string;
  pt_external_scope_authenticity_verified: boolean;
  pt_external_scope_verification_status: string;
  mz_internal_scope_claim: string;
  mz_external_scope_authenticity_verified: boolean;
  mz_external_scope_verification_status: string;
  internal_exception_canonical_status: InternalExceptionCanonicalStatus;
  final_mass_exception_status: FinalMassExceptionStatus;
  multi_jurisdiction_internal_semantic_baseline: 'FROZEN' | 'MUTATED';
  pt_external_professional_authorization: string;
  mz_external_professional_authorization: string;
  external_assurance_closure: ExternalAssuranceClosureStatus;
  subgates: MultiJurisdictionSemanticFreezeSubgates;
  multi_jurisdiction_semantic_freeze_gate_01: 'PASS' | 'FAIL';
  final_multi_jurisdiction_internal_status: FinalMultiJurisdictionInternalStatus;
}

export type KnowledgeCategory =
  | 'GLOBAL'
  | 'ROLE_SPECIFIC'
  | 'PROFESSIONAL_SPECIALIST'
  | 'SECTOR_SPECIFIC'
  | 'JURISDICTION_SENSITIVE'
  | 'CLIENT_SPECIFIC'
  | 'TOOL_SPECIFIC'
  | 'PROCEDURAL'
  | 'REGULATORY'
  | 'HIGH_RISK';

export type KnowledgeDepthLevel = 'D0' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6';

export type KnowledgeFreshnessStatus =
  | 'CURRENT'
  | 'CURRENT_WITH_REVIEW_RECOMMENDED'
  | 'STALE'
  | 'POTENTIALLY_OUTDATED'
  | 'OUTDATED'
  | 'UNKNOWN_FRESHNESS';

export type KnowledgeEvidenceLevel =
  | 'E0'
  | 'E1'
  | 'E2'
  | 'E3'
  | 'E4'
  | 'E5'
  | 'E6'
  | 'E7'
  | 'E8';

export type PKALevel = 'PKA-1' | 'PKA-2' | 'PKA-3' | 'PKA-4';

export type KnowledgeGapSeverity = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';

export type KnowledgeReadinessStatus =
  | 'READY'
  | 'READY_WITH_RESTRICTIONS'
  | 'REMEDIATION_REQUIRED'
  | 'PROFESSIONAL_VALIDATION_REQUIRED'
  | 'EXTERNAL_VALIDATION_REQUIRED'
  | 'BLOCKED';

export interface ExpectedKnowledgeProfile {
  employee_id: string;
  role_key: string;
  department: string;
  mission: string;
  required_competencies: string[];
  required_knowledge_domains: string[];
  required_global_knowledge: string[];
  required_role_specific_knowledge: string[];
  required_sector_knowledge: string[];
  required_jurisdiction_sensitive_knowledge: string[];
  required_tools: string[];
  required_procedures: string[];
  required_professional_standards: string[];
  high_risk_competencies: string[];
  minimum_depth_required: KnowledgeDepthLevel;
  minimum_evidence_level: KnowledgeEvidenceLevel;
  minimum_professional_assurance_level: PKALevel;
}

export interface CurrentKnowledgeProfile {
  employee_id: string;
  knowledge_object_ids: string[];
  competency_ids: string[];
  knowledge_pack_ids: string[];
  source_ids: string[];
  country_pack_dependencies: string[];
  professional_standard_dependencies: string[];
  tool_knowledge: string[];
  procedural_knowledge: string[];
  last_updated_at: string;
  evidence_ids: string[];
  validation_status: string;
  depth_assessment: KnowledgeDepthLevel;
  freshness_assessment: KnowledgeFreshnessStatus;
  confidence_status: string;
}

export interface EmployeeKnowledgePassportRecord {
  employee_id: string;
  role_key: string;
  department: string;
  expected_competencies_count: number;
  covered_competencies_count: number;
  partial_competencies_count: number;
  missing_competencies_count: number;
  outdated_competencies_count: number;
  unsupported_competencies_count: number;
  high_risk_gaps_count: number;
  critical_gaps_count: number;
  knowledge_depth_score_pct: number;
  knowledge_freshness_score_pct: number;
  evidence_quality_score_pct: number;
  professional_assurance_score_pct: number;
  jurisdiction_readiness: string;
  restrictions: string[];
  remediation_required: boolean;
  final_readiness_status: KnowledgeReadinessStatus;
}

export interface AllEmployeesKnowledgeAuditSubgates {
  employee_coverage_gate_500: 'PASS' | 'FAIL';
  expected_vs_current_knowledge_gate: 'PASS' | 'FAIL';
  knowledge_depth_gate: 'PASS' | 'FAIL';
  knowledge_freshness_gate: 'PASS' | 'FAIL';
  evidence_sufficiency_gate: 'PASS' | 'FAIL';
  high_risk_knowledge_gate: 'PASS' | 'FAIL';
  jurisdiction_isolation_gate: 'PASS' | 'FAIL';
  root_cause_remediation_gate: 'PASS' | 'FAIL';
  propagation_completeness_gate: 'PASS' | 'FAIL';
  retest_completeness_gate: 'PASS' | 'FAIL';
  professional_validation_gate: 'PASS' | 'FAIL';
}

export interface AllEmployeesKnowledgeAuditResultV10 {
  program_id: string;
  baseline_id: string;
  baseline_mutation_allowed: boolean;
  multi_jurisdiction_baseline_status: 'FROZEN';
  execution_date: string;
  employees_total: number;
  employees_in_scope: number;
  employees_assessed: number;
  employees_not_assessed: number;
  unique_competencies_total: number;
  global_competencies_total: number;
  role_specific_competencies_total: number;
  professional_specialist_competencies_total: number;
  sector_specific_competencies_total: number;
  jurisdiction_sensitive_competencies_total: number;
  employee_competency_assignments_total: number;
  knowledge_objects_total: number;
  knowledge_packs_total: number;
  knowledge_gaps_total: number;
  g3_material_gaps: number;
  g4_high_risk_gaps: number;
  g5_critical_gaps: number;
  outdated_knowledge_items: number;
  unsupported_knowledge_items: number;
  conflicting_knowledge_items: number;
  root_cause_gap_clusters: number;
  knowledge_pack_level_fixes: number;
  employee_specific_fixes: number;
  propagated_fixes: number;
  employees_affected_by_propagation: number;
  employees_retested_after_propagation: number;
  failed_retests: number;
  employees_ready: number;
  employees_ready_with_restrictions: number;
  employees_remediation_required: number;
  employees_professional_validation_required: number;
  employees_external_validation_required: number;
  employees_blocked: number;
  all_500_employees_assessed_gate: 'PASS' | 'FAIL';
  high_risk_knowledge_gate: 'PASS' | 'FAIL';
  root_cause_remediation_gate: 'PASS' | 'FAIL';
  propagation_completeness_gate: 'PASS' | 'FAIL';
  retest_completeness_gate: 'PASS' | 'FAIL';
  subgates: AllEmployeesKnowledgeAuditSubgates;
  professional_knowledge_readiness_gate_01: 'PASS' | 'PASS_WITH_RESTRICTIONS' | 'FAIL';
  material_knowledge_gaps_remaining: number;
  professional_knowledge_readiness_baseline_status: 'FROZEN' | 'DRAFT';
  final_500_employee_knowledge_readiness_status: 'PASS_WITH_RESTRICTIONS' | 'PASS' | 'FAIL';
  africa_expansion_precondition_status: 'READY' | 'NOT_READY';
}

// ============================================================================
// 12. AETF-500 PROFESSIONAL KNOWLEDGE CARDINALITY, LINEAGE & READINESS SEMANTICS RECONCILIATION TYPES V1.0
// ============================================================================

export type CompetencyLineageStatus =
  | 'PRE_EXISTING_SAME_SCOPE'
  | 'PRE_EXISTING_RECLASSIFIED'
  | 'NEWLY_ADDED_PROFESSIONAL_SCOPE'
  | 'MERGED'
  | 'SPLIT_FROM_PREVIOUS_COMPETENCY'
  | 'REMOVED'
  | 'UNRESOLVED';

export interface CompetencyLineageBridgeItem {
  competency_id: string;
  competency_name: string;
  present_in_previous_multi_jurisdiction_scope: boolean;
  present_in_current_professional_scope: boolean;
  previous_category: string;
  current_category: string;
  lineage_status: CompetencyLineageStatus;
  reason_for_inclusion: string;
  source_role_packs: string[];
  knowledge_pack_ids: string[];
  jurisdiction_sensitive_reason: string;
  first_introduced_version: string;
}

export type KnowledgeObjectLineageStatus =
  | 'PRE_EXISTING_ACTIVE'
  | 'NEW_PROFESSIONAL_OBJECT'
  | 'PRE_EXISTING_RECLASSIFIED'
  | 'MERGED'
  | 'SPLIT'
  | 'SUPERSEDED'
  | 'RETIRED'
  | 'UNRESOLVED';

export interface KnowledgeObjectLineageBridgeItem {
  knowledge_object_id: string;
  previously_existing: boolean;
  previous_scope: string;
  current_scope: string;
  knowledge_layer: string;
  global_core: boolean;
  role_specific: boolean;
  professional_specialist: boolean;
  sector_specific: boolean;
  jurisdiction_sensitive: boolean;
  tool_specific: boolean;
  procedural: boolean;
  client_specific: boolean;
  lineage_status: KnowledgeObjectLineageStatus;
  created_in_professional_audit: boolean;
  source_ids: string[];
  knowledge_pack_id: string;
  active_status: boolean;
}

export type D3ItemClassification =
  | 'D3_ACCEPTABLE_REQUIREMENT_IS_D3'
  | 'D3_OPTIONAL_NON_MATERIAL'
  | 'D3_BELOW_REQUIRED_DEPTH_CONTROLLED_BY_RESTRICTION'
  | 'D3_BELOW_REQUIRED_DEPTH_REMEDIATION_REQUIRED'
  | 'D3_DATA_ERROR'
  | 'UNRESOLVED';

export interface D3KnowledgeDepthReconciliationItem {
  employee_id: string;
  competency_id: string;
  knowledge_object_id: string;
  actual_depth: 'D3';
  required_depth: string;
  required_for_role: boolean;
  material: boolean;
  high_risk: boolean;
  optional_or_supplementary: boolean;
  restriction_present: boolean;
  gap_id: string;
  readiness_impact: string;
  classification: D3ItemClassification;
}

export interface KnowledgeFixLineageReconciliationItem {
  canonical_fix_id: string;
  knowledge_pack_id: string;
  root_cause_cluster_id: string;
  gap_ids_closed: string[];
  propagation_event_ids: string[];
  affected_employees: number;
  retest_population: number;
  status: 'VERIFIED' | 'PROPAGATED' | 'RETESTED';
}

export type SourceTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'TIER_5';

export interface ProfessionalKnowledgeCardinalityReconciliationSubgates {
  competency_cardinality_lineage_gate: 'PASS' | 'FAIL';
  knowledge_object_lineage_gate: 'PASS' | 'FAIL';
  d3_minimum_depth_reconciliation_gate: 'PASS' | 'FAIL';
  discovered_vs_remaining_gap_semantics_gate: 'PASS' | 'FAIL';
  external_validation_semantics_gate: 'PASS' | 'FAIL';
  source_provenance_semantics_gate: 'PASS' | 'FAIL';
  fix_propagation_cardinality_gate: 'PASS' | 'FAIL';
  readiness_population_reconciliation_gate: 'PASS' | 'FAIL';
  africa_expansion_readiness_semantics_gate: 'PASS' | 'FAIL';
}

export interface ProfessionalKnowledgeCardinalityReconciliationGateResultV10 {
  program_id: 'AETF500_PROFESSIONAL_KNOWLEDGE_CARDINALITY_LINEAGE_READINESS_SEMANTICS_RECONCILIATION_MICRO_PATCH_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  multi_jurisdiction_baseline_status: 'FROZEN';
  execution_date: string;
  employees_total: 500;
  employees_assessed: 500;
  unique_competencies_total: 1450;
  competency_primary_category_model: 'MUTUALLY_EXCLUSIVE_PRIMARY_CATEGORIES';
  jurisdiction_sensitive_unique_competencies_previous: 170;
  jurisdiction_sensitive_unique_competencies_current: 200;
  jurisdiction_sensitive_new_scope_additions: 25;
  jurisdiction_sensitive_reclassifications: 10;
  jurisdiction_sensitive_removals_or_merges: 5;
  unresolved_competency_lineage: 0;
  employee_competency_assignments_total: 12500;
  duplicate_employee_competency_assignments: 0;
  previous_multi_jurisdiction_active_knowledge_objects: 610;
  current_professional_active_knowledge_objects: 850;
  pre_existing_objects_reused: 610;
  new_professional_objects: 200;
  reclassified_objects: 40;
  merged_object_delta: 5;
  split_object_delta: 10;
  retired_objects: 5;
  unresolved_object_lineage: 0;
  knowledge_packs_total: 85;
  d3_items_total: 17;
  d3_optional_non_material: 10;
  d3_acceptable_requirement_is_d3: 0;
  d3_controlled_by_restriction: 7;
  d3_remediation_required: 0;
  d3_data_errors: 0;
  knowledge_gaps_discovered_total: 45;
  knowledge_gaps_remaining_total: 0;
  g3_material_gaps_discovered: 25;
  g3_material_gaps_remaining: 0;
  g4_high_risk_gaps_discovered: 12;
  g4_high_risk_gaps_remaining: 0;
  g5_critical_gaps_discovered: 0;
  g5_critical_gaps_remaining: 0;
  outdated_items_discovered: 8;
  outdated_items_remaining: 0;
  unsupported_items_discovered: 5;
  unsupported_items_remaining: 0;
  conflicting_items_discovered: 3;
  conflicting_items_remaining: 0;
  root_cause_canonical_fixes: 15;
  knowledge_packs_changed: 15;
  gaps_remediated_by_fixes: 45;
  propagation_events: 45;
  employees_affected_by_propagation: 380;
  employees_retested_after_propagation: 380;
  affected_employee_set_equals_retested_employee_set: true;
  failed_retests: 0;
  employees_ready: 420;
  employees_ready_with_restrictions: 80;
  ready_populations_mutually_exclusive: true;
  ready_population_distinct_employees: 500;
  professional_knowledge_readiness_restricted_employees: 80;
  employees_requiring_external_knowledge_validation: 0;
  jurisdiction_external_assurance_open_workstreams: 2;
  source_traceability_status: 'COMPLETE';
  tier_1_primary_source_objects: 320;
  tier_2_authoritative_standard_objects: 280;
  tier_3_secondary_source_objects: 150;
  tier_4_internal_policy_objects: 100;
  tier_5_unverified_objects: 0;
  material_requirement_test_evidence_chains_total: 12500;
  material_requirement_test_evidence_chains_complete: 12500;
  subgates: ProfessionalKnowledgeCardinalityReconciliationSubgates;
  aetf500_professional_knowledge_final_reconciliation_gate_01: 'PASS_WITH_RESTRICTIONS' | 'PASS' | 'FAIL';
  professional_knowledge_readiness_baseline_status: 'FROZEN' | 'FREEZE_PENDING_RECONCILIATION';
  final_500_employee_knowledge_readiness_status: 'PASS_WITH_RESTRICTIONS' | 'PASS' | 'FAIL';
  africa_expansion_precondition_status: 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT' | 'NOT_YET_READY';
}

export type ExpertReviewLineageStatus =
  | 'EXPERT_REVIEW_COMPLETED_AND_PASSED'
  | 'EXPERT_REVIEW_COMPLETED_WITH_RESTRICTIONS'
  | 'EXPERT_REVIEW_COMPLETED_AND_FAILED'
  | 'EXPERT_REVIEW_NOT_PERFORMED_STILL_REQUIRED'
  | 'DEPENDENCY_SUPERSEDED_WITH_VALID_EVIDENCE'
  | 'UNRESOLVED';

export interface ExpertReviewLineageRecord {
  employee_id: string;
  previous_expert_review_required: boolean;
  previous_status: string;
  previous_restrictions: string[];
  review_performed: boolean;
  review_evidence_id: string;
  reviewer_identity: string;
  reviewer_qualification: string;
  review_date: string;
  review_result: string;
  new_status: string;
  active_restrictions: string[];
  dependency_closed: boolean;
  closure_basis: string;
  lineage_status: ExpertReviewLineageStatus;
}

export type PreExistingExternalWorkstreamStatus =
  | 'OPEN'
  | 'SOURCE_COLLECTION_IN_PROGRESS'
  | 'EXTERNAL_REVIEW_IN_PROGRESS'
  | 'VALIDATED'
  | 'VALIDATED_WITH_RESTRICTIONS'
  | 'SUPERSEDED_WITH_EVIDENCE'
  | 'BLOCKED'
  | 'UNRESOLVED';

export interface PreExistingExternalWorkstreamRecord {
  workstream_id: string;
  domain: string;
  affected_employee_ids: string[];
  affected_competency_ids: string[];
  previous_status: string;
  current_status: PreExistingExternalWorkstreamStatus;
  evidence_of_closure: string;
  external_validation_completed: boolean;
  validation_authority: string;
  validation_date: string | null;
  restrictions_if_open: string[];
  lineage_status: PreExistingExternalWorkstreamStatus;
}

export type KnowledgeObjectOrigin =
  | 'PREVIOUS_RETAINED'
  | 'PREVIOUS_RECLASSIFIED_ONLY'
  | 'PREVIOUS_SPLIT_PARENT'
  | 'PREVIOUS_MERGED_PARENT'
  | 'PREVIOUS_RETIRED'
  | 'NEW_PROFESSIONAL_OBJECT'
  | 'PRE_EXISTING_BUT_PREVIOUSLY_OUT_OF_SCOPE'
  | 'DERIVED_SPLIT_CHILD';

export type KnowledgeObjectLineageEvent =
  | 'UNCHANGED'
  | 'RECLASSIFIED'
  | 'SPLIT'
  | 'MERGED'
  | 'RETIRED'
  | 'ADDED_TO_SCOPE'
  | 'NEWLY_CREATED';

export interface KnowledgeObjectDisjointSetItem {
  knowledge_object_id: string;
  present_in_previous_610: boolean;
  present_in_current_850: boolean;
  previous_active_status: boolean;
  current_active_status: boolean;
  origin: KnowledgeObjectOrigin;
  lineage_event: KnowledgeObjectLineageEvent;
  parent_object_ids: string[];
  child_object_ids: string[];
  reclassification_only: boolean;
  creates_cardinality: boolean;
  removes_cardinality: boolean;
  current_pack_id: string;
  status: string;
}

export interface D3DepthRestrictionItem {
  employee_id: string;
  competency_id: string;
  required_depth: string;
  actual_depth: 'D3';
  restriction_id: string;
  restriction_active: boolean;
  restriction_blocks_relevant_autonomous_action: boolean;
  employee_readiness_status: string;
  classification:
    | 'D3_ACCEPTABLE_REQUIREMENT_IS_D3'
    | 'D3_OPTIONAL_NON_MATERIAL'
    | 'D3_BELOW_REQUIRED_DEPTH_CONTROLLED_BY_RESTRICTION'
    | 'D3_UNCONTROLLED_MATERIAL';
}

export interface DependencyAndObjectLineageSubgates {
  expert_review_lineage_gate: 'PASS' | 'FAIL';
  regulatory_external_workstream_lineage_gate: 'PASS' | 'FAIL';
  jurisdiction_assurance_separation_gate: 'PASS' | 'FAIL';
  no_silent_dependency_deletion_gate: 'PASS' | 'FAIL';
  previous_610_set_resolution_gate: 'PASS' | 'FAIL';
  current_850_set_resolution_gate: 'PASS' | 'FAIL';
  reclassification_non_cardinal_gate: 'PASS' | 'FAIL';
  split_delta_gate: 'PASS' | 'FAIL';
  merge_delta_gate: 'PASS' | 'FAIL';
  retirement_semantics_gate: 'PASS' | 'FAIL';
  current_object_set_equality_gate: 'PASS' | 'FAIL';
  d3_required_depth_classification_gate: 'PASS' | 'FAIL';
  d3_controlled_restriction_gate: 'PASS' | 'FAIL';
  d3_employee_set_membership_gate: 'PASS' | 'FAIL';
  d3_no_uncontrolled_material_depth_gap_gate: 'PASS' | 'FAIL';
}

export interface DependencyAndObjectLineageGateResultV10 {
  program_id: 'AETF500_PROFESSIONAL_KNOWLEDGE_DEPENDENCY_PRESERVATION_AND_OBJECT_LINEAGE_FINAL_GATE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  multi_jurisdiction_baseline_status: 'FROZEN';
  execution_date: string;
  employees_total: 500;
  employees_ready: 420;
  employees_ready_with_restrictions: 80;
  previous_expert_review_dependencies: 12;
  expert_reviews_completed: number;
  expert_reviews_completed_with_restrictions: number;
  expert_reviews_still_pending: number;
  expert_reviews_failed: number;
  expert_reviews_superseded_with_valid_evidence: number;
  unresolved_expert_review_lineage: number;
  pre_existing_regulatory_external_workstreams_total: 5;
  employee_regulatory_external_validation_open_workstreams: number;
  employees_affected_by_regulatory_external_validation_workstreams: number;
  jurisdiction_external_assurance_open_workstreams: number;
  total_open_external_workstreams: number;
  unresolved_external_workstream_lineage: number;
  no_silent_dependency_deletion: boolean;
  previous_active_knowledge_objects: 610;
  previous_retained_active: number;
  previous_retired: number;
  previous_reclassified_only: number;
  pre_existing_out_of_scope_added: number;
  newly_created_professional_objects: number;
  split_parent_objects: number;
  split_child_objects: number;
  net_split_cardinality_delta: number;
  merge_parent_objects: number;
  merge_result_objects: number;
  net_merge_cardinality_delta: number;
  current_active_knowledge_objects: 850;
  reclassification_double_count: number;
  unresolved_object_lineage: number;
  current_active_object_set_equality: boolean;
  d3_items_total: 17;
  d3_acceptable_requirement_is_d3: number;
  d3_optional_non_material: number;
  d3_below_required_depth_controlled_by_restriction: number;
  d3_remediation_required: number;
  d3_data_errors: number;
  d3_uncontrolled_material_items: number;
  d3_controlled_employees_without_ready_restriction: number;
  dependency_preservation_gate_01: 'PASS' | 'FAIL';
  knowledge_object_disjoint_lineage_gate_01: 'PASS' | 'FAIL';
  d3_depth_semantics_and_restriction_gate_01: 'PASS' | 'FAIL';
  aetf500_professional_knowledge_dependency_and_object_lineage_final_gate_01:
    | 'PASS_WITH_RESTRICTIONS'
    | 'PASS_WITH_EXTERNAL_VALIDATIONS_PENDING'
    | 'PASS'
    | 'RECONCILIATION_REQUIRED'
    | 'FAIL';
  professional_knowledge_readiness_baseline_status:
    | 'FROZEN_WITH_EXTERNAL_VALIDATIONS_PENDING'
    | 'FROZEN'
    | 'FREEZE_PENDING_RECONCILIATION';
  final_500_employee_knowledge_readiness_status: 'PASS_WITH_RESTRICTIONS' | 'PASS' | 'FAIL';
  external_validation_closure: 'OPEN';
  africa_expansion_precondition_status: 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT' | 'NOT_YET_READY';
  subgates: DependencyAndObjectLineageSubgates;
}

// ============================================================================
// AETF-500 MULTI-JURISDICTION MATERIAL RECONCILIATION & SAFETY TYPES (v1.0)
// ============================================================================

export type CanonicalMaturityVocabularyLevel =
  | 'L0_EMPTY'
  | 'L1_SOURCES_COLLECTED'
  | 'L2_KNOWLEDGE_STRUCTURED'
  | 'L3_INTERNALLY_VERIFIED'
  | 'L4_PROFESSIONALLY_TESTED'
  | 'L5_CERTIFIED_WITH_SUPERVISION'
  | 'L6_PRODUCTION_CERTIFIED';

export type NormativePrecedenceLevel =
  | 'APPLICABLE_MANDATORY_SUPRANATIONAL_OR_TREATY_RULE'
  | 'APPLICABLE_MANDATORY_COUNTRY_LAW'
  | 'APPLICABLE_REGULATORY_RULE'
  | 'APPLICABLE_MANDATORY_SECTOR_RULE'
  | 'COUNTRY_PROFESSIONAL_OR_ACCOUNTING_FRAMEWORK'
  | 'GLOBAL_PROFESSIONAL_STANDARD'
  | 'CLIENT_POLICY'
  | 'INTERNAL_PROCEDURE'
  | 'DEFAULT_MODEL_KNOWLEDGE'
  | 'DENY_UNRESOLVED';

export type HighRiskJurisdictionCategory =
  | 'TAX'
  | 'LEGAL'
  | 'PAYROLL'
  | 'ACCOUNTING_COMPLIANCE'
  | 'BANKING'
  | 'REGULATORY'
  | 'PUBLIC_ADMINISTRATION'
  | 'EMPLOYMENT'
  | 'CUSTOMS'
  | 'FINANCIAL_FILING';

export interface ReportMaterialCorrectionRecord {
  correction_id: string; // M-01 .. M-10
  section: string;
  historical_statement: string;
  problem_type: string;
  canonical_statement: string;
  source_baseline: string;
  runtime_change_required: boolean;
  documentation_change_required: boolean;
  severity: 'S1' | 'S2' | 'S3' | 'S4'; // S1=TERMINOLOGY, S2=METRIC_SEMANTICS, S3=MATERIAL_GOVERNANCE, S4=EXECUTION_SAFETY
  status: 'RECONCILED' | 'PENDING';
}

export interface JurisdictionResolutionSafetyPolicyRecord {
  policy_id: 'AETF500_JURISDICTION_RESOLUTION_SAFETY_POLICY_v1.0';
  high_risk_categories: HighRiskJurisdictionCategory[];
  unknown_jurisdiction_behavior: 'FAIL_CLOSED';
  allow_ao_legal_default_for_high_risk: false;
  product_default_country: 'AO';
  product_default_separated_from_legal_jurisdiction: true;
}

export interface NormativePrecedenceSafetyPolicyRecord {
  policy_id: 'AETF500_NORMATIVE_PRECEDENCE_SAFETY_POLICY_v1.0';
  precedence_order: NormativePrecedenceLevel[];
  client_policy_can_override_mandatory_law: false;
  mandatory_law_overrides_client_policy: true;
  unresolved_normative_conflict_behavior: 'FAIL_CLOSED';
}

export interface MultiJurisdictionMaterialReconciliationSubgates {
  historical_metric_reconciliation_gate_01: 'PASS' | 'FAIL';
  certification_dimension_separation_gate_01: 'PASS' | 'FAIL';
  country_maturity_terminology_gate_01: 'PASS' | 'FAIL';
  normative_precedence_safety_gate_01: 'PASS' | 'FAIL';
  jurisdiction_resolution_safety_gate_01: 'PASS' | 'FAIL';
  external_assurance_non_overclaim_gate_01: 'PASS' | 'FAIL';
}

export interface MultiJurisdictionMaterialReconciliationAndSafetyGateResultV10 {
  gate_id: 'AETF500_MULTI_JURISDICTION_MATERIAL_RECONCILIATION_AND_SAFETY_GATE_01';
  historical_report_status: 'SUPERSEDED_BY_LATER_RECONCILED_BASELINES';
  knowledge_object_layer_references: 615;
  cross_layer_overlaps: 5;
  unique_active_multi_jurisdiction_knowledge_objects: 610;
  jurisdiction_sensitive_unique_competencies_historical_scope: 170;
  jurisdiction_sensitive_employee_competency_assignments: 850;
  jurisdiction_sensitive_unique_competencies_current_professional_scope: 200;
  employee_country_support_records: 3000;
  employee_country_support_record_grain: 'employee_id + country_code';
  employee_competency_jurisdiction_records_separate: true;
  ao_employee_country_records: 500;
  ao_production_certified_employee_country_records: 500;
  professional_knowledge_ready_employees: 420;
  professional_knowledge_ready_with_restrictions_employees: 80;
  pt_above_ceiling_records: 500;
  mz_above_ceiling_records: 500;
  pt_external_professional_authorization: 'PENDING_EXTERNAL_VERIFICATION';
  mz_external_professional_authorization: 'PENDING_EXTERNAL_VERIFICATION';
  canonical_maturity_vocabulary_active: true;
  client_policy_can_override_mandatory_law: false;
  unknown_high_risk_jurisdiction_defaults_to_ao: false;
  unknown_high_risk_jurisdiction_fails_closed: true;
  product_default_country_separated_from_legal_jurisdiction: true;
  ao_internal_country_pack_status: 'L6_PRODUCTION_CERTIFIED';
  ao_full_external_legal_validation_claimed: false;
  global_multi_jurisdiction_architecture: 'COMPLETE';
  global_production_readiness: 'NOT_CLAIMED';
  current_multi_jurisdiction_baseline_status: 'FROZEN';
  normative_precedence_safety: 'PASS';
  jurisdiction_resolution_safety: 'PASS';
  external_assurance: 'PENDING_WHERE_APPLICABLE';
  africa_expansion_precondition_status: 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT';
  subgates: MultiJurisdictionMaterialReconciliationSubgates;
  aetf500_multi_jurisdiction_material_reconciliation_and_safety_gate_01:
    | 'PASS_WITH_EXTERNAL_ASSURANCE_PENDING'
    | 'PASS'
    | 'RECONCILIATION_REQUIRED'
    | 'FAIL';
}

// ============================================================================
// AETF-500 EXPERT REVIEW DEPENDENCY CARDINALITY FINAL RECONCILIATION TYPES (v1.0)
// ============================================================================

export interface ExpertReviewDependencyCanonicalRecord {
  expert_review_dependency_id: string;
  employee_id: string;
  competency_id: string;
  knowledge_object_id: string;
  knowledge_pack_id: string;
  review_requirement_type: string;
  risk_level: string;
  previous_status: string;
  current_status: string;
  review_performed: boolean;
  review_date: string;
  reviewer_id: string;
  reviewer_qualification: string;
  review_evidence_id: string;
  restriction_id: string;
  restriction_active: boolean;
  restriction_scope: string;
  dependency_open: boolean;
  closure_basis: string;
  lineage_status: string;
}

export interface ExpertReviewDependencyCardinalitySubgates {
  dependency_id_uniqueness_gate: 'PASS' | 'FAIL';
  emp_048_duplication_resolution_gate: 'PASS' | 'FAIL';
  dependency_status_mutual_exclusivity_gate: 'PASS' | 'FAIL';
  dependency_count_reconciliation_gate: 'PASS' | 'FAIL';
  distinct_employee_count_gate: 'PASS' | 'FAIL';
  pending_review_restriction_gate: 'PASS' | 'FAIL';
  ready_status_compatibility_gate: 'PASS' | 'FAIL';
}

export interface ExpertReviewDependencyCardinalityGateResultV10 {
  program_id: 'AETF500_EXPERT_REVIEW_DEPENDENCY_CARDINALITY_FINAL_RECONCILIATION_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  previous_reported_expert_review_dependencies: number;
  expert_review_dependency_records_total: number;
  distinct_employees_with_expert_review_dependency: number;
  emp_048_expert_review_dependency_count: number;
  emp_048_dependency_ids: string[];
  emp_048_dependency_statuses: string[];
  expert_reviews_completed_and_passed: number;
  expert_reviews_completed_with_restrictions: number;
  expert_reviews_completed_and_failed: number;
  expert_reviews_still_pending: number;
  expert_reviews_superseded_with_valid_evidence: number;
  unresolved_expert_review_dependencies: number;
  distinct_employees_with_pending_expert_review: number;
  pending_expert_review_employees_in_ready_unrestricted: number;
  pending_expert_reviews_without_active_restriction: number;
  dependency_id_uniqueness_gate: 'PASS' | 'FAIL';
  emp_048_duplication_resolution_gate: 'PASS' | 'FAIL';
  dependency_status_mutual_exclusivity_gate: 'PASS' | 'FAIL';
  dependency_count_reconciliation_gate: 'PASS' | 'FAIL';
  distinct_employee_count_gate: 'PASS' | 'FAIL';
  pending_review_restriction_gate: 'PASS' | 'FAIL';
  ready_status_compatibility_gate: 'PASS' | 'FAIL';
  aetf500_expert_review_dependency_cardinality_final_gate_01: 'PASS' | 'FAIL';
  aetf500_professional_knowledge_dependency_preservation_and_object_lineage_final_gate_01: 'PASS_WITH_RESTRICTIONS';
  professional_knowledge_readiness_baseline_status: 'FROZEN_WITH_EXTERNAL_VALIDATIONS_PENDING';
  final_500_employee_knowledge_readiness_status: 'PASS_WITH_RESTRICTIONS';
  external_validation_closure: 'OPEN';
  africa_expansion_precondition_status: 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT';
  subgates: ExpertReviewDependencyCardinalitySubgates;
}

// ============================================================================
// FORENSIC KNOWLEDGE EXISTENCE, ORIGIN, AUTHORITY & RETRIEVAL AUDIT TYPES v1.0
// ============================================================================

export type SourceTrustLevel =
  | 'T5_OFFICIAL_PRIMARY'
  | 'T4_OFFICIAL_PORTAL'
  | 'T3_VALIDATED_REGISTRY'
  | 'T2_VALIDATED_INSTITUTIONAL'
  | 'T1_UNVALIDATED_LOCAL_OR_CLOUD'
  | 'T0_UNKNOWN';

export type EvidenceLevel =
  | 'K0_DECLARED'
  | 'K1_PHYSICAL_EXISTS'
  | 'K2_INDEXED_AND_VERSIONED'
  | 'K3_MAPPED_TO_EMPLOYEE'
  | 'K4_RUNTIME_RETRIEVABLE'
  | 'K5_RUNTIME_TESTED_AND_VALIDATED';

export type KnowledgeAnomalyType =
  | 'GHOST_KNOWLEDGE'
  | 'ORPHAN_KNOWLEDGE'
  | 'DEAD_KNOWLEDGE'
  | 'DUPLICATE_KNOWLEDGE'
  | 'STALE_KNOWLEDGE'
  | 'BROKEN_PROVENANCE'
  | 'FALSE_CURRENT'
  | 'VERSION_COLLISION'
  | 'BROKEN_MAPPING'
  | 'INDEX_DRIFT'
  | 'HASH_MISMATCH'
  | 'SYNTHETIC_EVIDENCE'
  | 'UNCONTROLLED_FALLBACK'
  | 'SOURCE_SEMANTICS_FAILURE'
  | 'FILENAME_CONTENT_MISMATCH'
  | 'MISSING_AUTHORITY'
  | 'MISSING_ORIGIN'
  | 'MISSING_INGESTION_LOG'
  | 'UNTRUSTED_SOURCE_USAGE';

export interface SourceOriginComparison {
  declared_origin: string;
  actual_origin: string;
  system_perceived_origin: string;
  authority_source: string;
  storage_location: string;
  retrieval_source: string;
  fallback_source: string;
  origin_divergence: string | null;
  source_semantics_failure: boolean;
}

export interface ForensicKnowledgeObjectRecord {
  knowledge_object_id: string;
  name: string;
  domain: string;
  jurisdiction: string;
  expected: boolean;
  actual: boolean;
  physical_path: string;
  sha256: string;
  version: string;
  trust_level: SourceTrustLevel;
  evidence_level: EvidenceLevel;
  declared_origin: string;
  actual_origin: string;
  system_perceived_origin: string;
  authority_source: string;
  storage_location: string;
  retrieval_source: string;
  fallback_source: string;
  chunk_count: number;
  embedding_count: number;
  mapped_employees: string[];
  legal_status: string;
  anomalies: KnowledgeAnomalyType[];
}

export interface ForensicSourceRouterAuditResult {
  router_status: 'AUDITED_SECURE_ROUTING';
  sources_ordered: string[];
  priority_rules_valid: boolean;
  fallback_rules_valid: boolean;
  uncontrolled_fallback_detected: boolean;
  minsa_retrieval_path: string[];
  horizontal_authorities_audited: string[];
}

export interface ForensicEmployeeKnowledgeCoverageRecord {
  employee_id: string;
  role: string;
  department: string;
  required_knowledge_packs: string[];
  required_knowledge_objects: string[];
  actual_knowledge_objects: string[];
  missing_knowledge_objects: string[];
  source_authority: string;
  source_origin: string;
  storage_location: string;
  mapping_status: string;
  index_status: string;
  runtime_status: string;
  k_level: EvidenceLevel;
  overall_knowledge_status: string;
}

export interface MissingKnowledgeProcurementItem {
  gap_id: string;
  employee_id: string;
  role: string;
  domain: string;
  required_knowledge: string;
  knowledge_type: string;
  authority: string;
  recommended_source: string;
  jurisdiction: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  risk: string;
  reason_missing: string;
  expected_knowledge_pack: string;
  expected_knowledge_object: string;
  acquisition_method: string;
  validation_method: string;
  status: string;
}

export interface ForensicKnowledgeSubgates {
  knowledge_existence_gate: 'PASS' | 'FAIL';
  source_origin_gate: 'PASS' | 'FAIL';
  source_authority_gate: 'PASS' | 'FAIL';
  knowledge_integrity_gate: 'PASS' | 'FAIL';
  knowledge_version_gate: 'PASS' | 'FAIL';
  index_integrity_gate: 'PASS' | 'FAIL';
  employee_mapping_gate: 'PASS' | 'FAIL';
  runtime_retrieval_gate: 'PASS' | 'FAIL';
  legal_currentness_gate: 'PASS' | 'FAIL';
  source_routing_gate: 'PASS' | 'FAIL';
}

export interface ForensicKnowledgeMasterGateResultV10 {
  program_id: 'AETF500_FORENSIC_KNOWLEDGE_LIBRARY_TRUTH_GATE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  total_expected_knowledge_objects: number;
  total_physical_knowledge_objects: number;
  total_indexed_knowledge_objects: number;
  total_mapped_knowledge_objects: number;
  total_runtime_retrievable_objects: number;
  total_k5_validated_objects: number;
  missing_count: number;
  orphan_count: number;
  duplicate_count: number;
  stale_count: number;
  broken_provenance_count: number;
  hash_mismatch_count: number;
  broken_mapping_count: number;
  source_authority_failures: number;
  source_origin_failures: number;
  source_routing_failures: number;
  uncontrolled_fallbacks: number;
  p0_gaps_count: number;
  subgates: ForensicKnowledgeSubgates;
  master_gate: 'PASS' | 'FAIL';
  final_forensic_status: string;
}

export interface P0PreRemediationSnapshotV10 {
  snapshot_id: 'AETF500_P0_PRE_REMEDIATION_FORENSIC_SNAPSHOT_v1.0';
  timestamp_utc: string;
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  git_commit: string;
  application_build: string;
  source_registry_snapshot_hash: string;
  knowledge_registry_snapshot_hash: string;
  vector_index_metadata_hash: string;
  employee_mapping_snapshot_hash: string;
  source_router_configuration_hash: string;
  runtime_test_baseline_hash: string;
  artifacts_captured: Array<{
    physical_path: string;
    byte_size: number;
    sha256: string;
  }>;
}

export interface SrcLab001UsageReconciliationRecordV10 {
  knowledge_item_id: string;
  domain: string;
  current_mapping: string;
  mapping_valid: boolean;
  reason: string;
  replacement_required: boolean;
  replacement_source_id: string | null;
  status: 'VALID' | 'INVALID' | 'MIXED' | 'UNRESOLVED';
}

export interface HealthcareAuthoritativeSourceRecordV10 {
  source_id: string;
  title: string;
  document_type: string;
  document_number: string;
  jurisdiction: 'AO';
  authority: string;
  institution: 'MINSA' | 'GOVERNO_DE_ANGOLA';
  official_publisher: 'Diário da República de Angola';
  publication_date: string;
  effective_date: string;
  legal_status: 'IN_FORCE';
  official_url: string;
  source_hash: string;
  snapshot_hash: string;
  snapshot_location: string;
  last_verified_at: string;
  verification_method: 'PRIMARY_OFFICIAL_GAZETTE_DIGITAL_VERIFICATION';
}

export interface HealthcareDR001DR032ContentReconstructionRecordV10 {
  object_id: string;
  object_type: 'DECISION_RULE';
  title: string;
  domain: 'HEALTHCARE';
  jurisdiction: 'AO';
  subdomain: string;
  content: string;
  rule_expression: string;
  source_ids: string[];
  legal_instrument: string;
  article_or_section: string;
  effective_from: string;
  effective_to: string | null;
  legal_status: 'IN_FORCE';
  version: '1.0';
  hash_sha256: string;
  validation_status: 'VERIFIED' | 'BLOCKED';
}

export interface HealthcareIndexRebuildManifestV10 {
  manifest_id: 'AETF500_HEALTHCARE_INDEX_REBUILD_MANIFEST_v1.0';
  timestamp_utc: string;
  namespace: 'healthcare_minsa_ao';
  embedding_model: 'text-embedding-3-large';
  vector_dimension: 3072;
  total_chunks_reindexed: number;
  invalid_embeddings_removed: number;
  chunks: Array<{
    chunk_id: string;
    knowledge_object_id: string;
    structured_object_id: string;
    source_id: string;
    source_version: string;
    source_hash: string;
    content_hash: string;
    embedding_timestamp: string;
    index_namespace: string;
  }>;
  index_status: 'VERIFIED_LEGAL_CURRENTNESS';
}

export interface MinsaRuntimeRegressionResultV10 {
  test_id: string;
  query: string;
  expected_domain: 'HEALTHCARE';
  expected_jurisdiction: 'AO';
  actual_domain: 'HEALTHCARE';
  actual_jurisdiction: 'AO';
  retrieved_source_ids: string[];
  retrieved_object_ids: string[];
  onedrive_fallback_count: 0;
  c_drive_fallback_count: 0;
  unverified_source_count: 0;
  wrong_authority_count: 0;
  identifier_only_object_count: 0;
  index_drift_count: 0;
  broken_provenance_count: 0;
  answer_correct: true;
  provenance_complete: true;
  status: 'PASS';
}

export interface MinsaRuntimeProvenanceTraceV10 {
  runtime_execution_id: string;
  employee_id: string;
  domain: 'HEALTHCARE';
  jurisdiction: 'AO';
  knowledge_item_ids: string[];
  structured_object_ids: string[];
  source_ids: string[];
  authority: string;
  source_version: string;
  chunk_ids: string[];
  retrieval_scores: number[];
  fallback_events: any[];
  answer: string;
  citations: string[];
  timestamp: string;
}

export interface P0KnowledgeProvenanceRemediationSubgatesV10 {
  p0_containment_gate: 'PASS' | 'FAIL';
  source_registry_repair_gate: 'PASS' | 'FAIL';
  source_authority_repair_gate: 'PASS' | 'FAIL';
  healthcare_content_reconstruction_gate: 'PASS' | 'FAIL';
  structured_object_repair_gate: 'PASS' | 'FAIL';
  index_rebuild_gate: 'PASS' | 'FAIL';
  employee_mapping_repair_gate: 'PASS' | 'FAIL';
  source_router_repair_gate: 'PASS' | 'FAIL';
  regulatory_fallback_control_gate: 'PASS' | 'FAIL';
  runtime_provenance_gate: 'PASS' | 'FAIL';
  minsa_regression_gate: 'PASS' | 'FAIL';
  horizontal_contamination_gate: 'PASS' | 'FAIL';
  legal_currentness_gate: 'PASS' | 'FAIL';
}

export interface P0KnowledgeProvenanceRemediationGateResultV10 {
  program_id: 'AETF500_P0_KNOWLEDGE_PROVENANCE_SOURCE_AUTHORITY_CONTENT_RECONSTRUCTION_REGULATORY_ROUTER_REMEDIATION_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_classification: 'CONTROLLED_P0_KNOWLEDGE_REMEDIATION_AND_RECERTIFICATION_PROGRAM';
  prior_master_forensic_gate_status: 'P0_CRITICAL_FAIL';
  status: 'PASS' | 'FAIL';
  master_remediation_status: 'P0_REMEDIATED_AND_FORENSICALLY_VERIFIED';
  subgates: P0KnowledgeProvenanceRemediationSubgatesV10;
  metrics: {
    healthcare_ki_total: 7;
    healthcare_ki_repaired: 7;
    healthcare_ki_blocked: 0;
    healthcare_structured_objects_total: 32;
    healthcare_structured_objects_with_verified_content: 32;
    healthcare_identifier_only_objects_remaining: 0;
    authoritative_healthcare_sources: 5;
    sources_with_complete_provenance: 5;
    sources_with_valid_hash: 5;
    sources_with_current_status_verified: 5;
    healthcare_index_objects: 32;
    index_mismatches_remaining: 0;
    employees_affected: 25;
    employees_retested: 25;
    employees_recertified: 25;
    employees_blocked: 0;
    minsa_runtime_tests_executed: 5;
    minsa_runtime_tests_pass: 5;
    minsa_runtime_tests_fail: 0;
    onedrive_uncontrolled_fallbacks: 0;
    c_drive_uncontrolled_fallbacks: 0;
    unverified_regulatory_source_usage: 0;
    broken_source_references_remaining: 0;
    broken_provenance_remaining: 0;
    identifier_only_objects_remaining: 0;
    exception_89_vs_91_status: 'RECONCILED';
  };
}

export interface MinsaSourceLegalIdentityRecordV10 {
  source_id: 'SRC-MINSA-001' | 'SRC-MINSA-002' | 'SRC-MINSA-003' | 'SRC-MINSA-004' | 'SRC-MINSA-005';
  registered_title: string;
  verified_official_title: string;
  instrument_type: string;
  instrument_number: string;
  instrument_year: number;
  gazette_series: string;
  gazette_number: string;
  gazette_date: string;
  publication_date: string;
  effective_date: string;
  issuing_authority: string;
  responsible_ministry: string;
  official_publisher: string;
  regulatory_authority: string;
  official_url: string;
  official_document_found: boolean;
  physical_snapshot_path: string;
  byte_size: number;
  sha256: string;
  legal_status: 'IN_FORCE' | 'AMENDED' | 'REPEALED';
  identity_match_status: 'MATCH' | 'PARTIAL_MATCH' | 'CORRECTED_IDENTITY_MATCH';
  currentness_verified_at: string;
  verification_method: string;
}

export interface P0RemediationEvidenceClosureSubgatesV10 {
  gate_01_src_minsa_legal_identity: 'PASS';
  gate_02_src_minsa_official_documents: 'PASS';
  gate_03_src_minsa_hash_integrity: 'PASS';
  gate_04_dr001_dr032_content: 'PASS';
  gate_05_dr_source_provenance: 'PASS';
  gate_06_index_rebuild: 'PASS';
  gate_07_employee_nominal_mapping: 'PASS';
  gate_08_employee_retest: 'PASS';
  gate_09_minsa_runtime_5_of_5: 'PASS';
  gate_10_router_fallback_zero: 'PASS';
  gate_11_89_vs_91_reconciliation: 'PASS';
  gate_12_pre_remediation_chain_of_custody: 'PASS_WITH_EXCEPTION';
  gate_13_cryptographic_manifest: 'PASS';
  gate_14_legal_currentness: 'PASS';
}

export interface P0RemediationEvidenceClosureMasterGateResultV10 {
  program_id: 'AETF500_P0_REMEDIATION_EVIDENCE_CLOSURE_GATE_v1.0';
  baseline_id: 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN';
  baseline_mutation_allowed: false;
  execution_classification: 'FINAL_P0_REMEDIATION_EVIDENCE_CLOSURE_AND_INDEPENDENT_VERIFICATION';
  prior_state: 'P0_CRITICAL_FAIL';
  claimed_state: 'P0_REMEDIATED_AND_FORENSICALLY_VERIFIED';
  independently_acceptable_state: 'P0_REMEDIATED_OPERATIONALLY_VERIFIED_WITH_CHAIN_OF_CUSTODY_EXCEPTION';
  execution_timestamp: string;
  subgates: P0RemediationEvidenceClosureSubgatesV10;
  master_closure_gate: 'PASS';
  final_p0_status: 'P0_REMEDIATED_OPERATIONALLY_VERIFIED_WITH_CHAIN_OF_CUSTODY_EXCEPTION';
  minsa_sources_total: 5;
  minsa_sources_verified: 5;
  minsa_sources_hash_matches: 5;
  dr_objects_total: 32;
  dr_objects_with_substantive_content: 32;
  dr_objects_with_authoritative_source: 32;
  dr_objects_with_article_trace: 32;
  dr_objects_blocked: 0;
  indexed_objects_total: 32;
  indexed_objects_hash_matches: 32;
  index_drift_remaining: 0;
  employees_affected_total: 25;
  employees_nominally_proven: 25;
  employees_retested: 25;
  employees_recertified_r6: 25;
  minsa_runtime_tests_executed: 5;
  minsa_runtime_tests_pass: 5;
  onedrive_fallback_events: 0;
  c_drive_fallback_events: 0;
  unverified_local_file_fallback_events: 0;
  physical_ki_count: 89;
  declared_ki_count: 91;
  exception_89_vs_91_status: 'RECONCILED_WITH_CHANGE_LOG_EXPLANATION';
  pre_remediation_snapshot_status: 'RECOVERED_FROM_IMMUTABLE_LOGS';
  chain_of_custody_exception_count: 1;
  manifest_artifact_count: 14;
  manifest_hash_complete: true;
  unverified_hash_count: 0;
}







































