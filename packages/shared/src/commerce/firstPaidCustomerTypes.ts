/**
 * AI Employee First Paid Customer Controlled Onboarding & Commercial Baseline Hardening (WAVE 1)
 * Data Contracts & Types (AETF-500 Release v2.1 - Pre-Freeze Hardening)
 */

import { CommercialPlanTier, CommercialCurrency } from './commerce2026types.js';

export type OnboardingCohortWave =
  | 'WAVE_0_INTERNAL'
  | 'WAVE_1_SINGLE_CUSTOMER'
  | 'WAVE_2_TRIO_CUSTOMERS'
  | 'WAVE_3_10_CUSTOMERS'
  | 'WAVE_4_25_CUSTOMERS'
  | 'WAVE_5_50_CUSTOMERS'
  | 'GENERAL_AVAILABILITY';

export type MetricSource = 'SIMULATED' | 'CONTROLLED_TEST' | 'STAGING' | 'REAL_PRODUCTION';
export type EvidenceEnvironment = 'PRODUCTION' | 'STAGING' | 'TEST' | 'DEVELOPMENT';

export type CustomerHealthStatus = 'HEALTHY' | 'ATTENTION' | 'AT_RISK' | 'CRITICAL';
export type FirstTaskStatus = 'FIRST_TASK_STARTED' | 'FIRST_TASK_COMPLETED' | 'FIRST_TASK_REVIEWED' | 'FIRST_TASK_ACCEPTED';
export type RealRevenueValidationStatus = 'PENDING_VALIDATION' | 'REAL_REVENUE_VALIDATED' | 'REJECTED';

export type CommercialCertificationState =
  | 'PILOT_CUSTOMER_READY'
  | 'LIVE_CUSTOMER_ONBOARDING'
  | 'CONTROLLED_PAID_PRODUCTION'
  | 'FIRST_PAID_CUSTOMER_VALIDATED'
  | 'REAL_REVENUE_VALIDATED'
  | 'WAVE_1_CERTIFIED'
  | 'AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS';

export type CommercialEvidenceType =
  | 'CONTRACT_EVIDENCE'
  | 'INVOICE_EVIDENCE'
  | 'PAYMENT_EVIDENCE'
  | 'SETTLEMENT_EVIDENCE'
  | 'RECONCILIATION_EVIDENCE'
  | 'TENANT_EVIDENCE'
  | 'DEPLOYMENT_EVIDENCE'
  | 'READINESS_EVIDENCE'
  | 'TASK_EVIDENCE'
  | 'ACCEPTANCE_EVIDENCE'
  | 'FIRST_VALUE_EVIDENCE'
  | 'FTV_EVIDENCE'
  | 'USAGE_EVIDENCE'
  | 'COST_EVIDENCE'
  | 'MARGIN_EVIDENCE'
  | 'REVENUE_EVIDENCE'
  | 'TAX_EVIDENCE'
  | 'INCIDENT_EVIDENCE'
  | 'RENEWAL_EVIDENCE';

export type SignatureStatus = 'NOT_SIGNED' | 'INTERNALLY_SIGNED' | 'EXTERNALLY_SIGNED' | 'SIGNATURE_VERIFIED' | 'SIGNATURE_INVALID';
export type TimestampStatus = 'SYSTEM_TIMESTAMP' | 'TRUSTED_TIMESTAMP' | 'EXTERNAL_TIMESTAMP' | 'TIMESTAMP_VERIFIED';
export type EvidenceAuthenticityLevel = 'LEVEL_0_UNVERIFIED' | 'LEVEL_1_INTERNAL_SOURCE' | 'LEVEL_2_VERIFIED_SOURCE' | 'LEVEL_3_EXTERNALLY_VERIFIABLE' | 'LEVEL_4_SIGNED_AND_VERIFIED';

export interface EnhancedCommercialEvidenceRecord {
  evidence_id: string;
  evidence_type: CommercialEvidenceType;
  customer_id: string;
  employee_id: string;
  employee_instance_id: string;
  related_entity_type: string;
  related_entity_id: string;
  environment: EvidenceEnvironment;
  source: MetricSource;
  source_system: string;
  source_reference: string;
  issuer: string;
  content_hash: string;
  previous_hash: string;
  canonical_payload_json: string;
  signature_status: SignatureStatus;
  timestamp_status: TimestampStatus;
  authenticity_level: EvidenceAuthenticityLevel;
  created_at: string;
  verified_at: string;
  verified_by: string;
  status: 'VALID' | 'REVOKED' | 'SUPERSEDED';
}

export interface PaymentEvidenceRecord {
  payment_evidence_id: string;
  payment_id: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  currency: CommercialCurrency;
  provider: string;
  provider_reference: string;
  received_at: string;
  status: 'PAYMENT_RECEIVED' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED';
  content_hash: string;
}

export interface SettlementEvidenceRecord {
  settlement_evidence_id: string;
  payment_id: string;
  settlement_id: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  currency: CommercialCurrency;
  provider: string;
  bank_reference: string;
  settlement_date: string;
  settlement_account_reference: string;
  status: 'PAYMENT_SETTLED' | 'SETTLEMENT_PENDING';
  content_hash: string;
}

export interface ReconciliationEvidenceRecord {
  reconciliation_evidence_id: string;
  payment_id: string;
  settlement_id: string;
  invoice_id: string;
  customer_id: string;
  subscription_id: string;
  expected_amount: number;
  settled_amount: number;
  difference: number;
  currency: CommercialCurrency;
  reconciliation_status: 'MATCHED' | 'PARTIALLY_MATCHED' | 'UNMATCHED' | 'RECONCILED';
  reconciled_at: string;
  reconciled_by: string;
  matching_method: string;
  content_hash: string;
}

export interface TimeMetricsBreakdown {
  payment_timestamp: string;
  employee_ready_timestamp: string;
  first_task_started_timestamp: string;
  first_task_completed_timestamp: string;
  customer_acceptance_timestamp: string;
  time_to_payment_hours: number;
  time_to_provision_hours: number;
  time_to_ready_hours: number;
  time_to_first_task_hours: number;
  task_execution_time_minutes: number;
  time_to_first_accepted_result_hours: number;
  first_time_to_value_hours: number; // AcceptedResult - PaymentTimestamp
  semantic_validation_passed: boolean;
}

export interface TaxDeterminationResult {
  tax_jurisdiction: string; // e.g. "Angola (AGAO)"
  tax_country: string; // "AO"
  tax_region: string;
  customer_tax_id: string;
  supplier_tax_id: string;
  tax_regime: 'GERAL' | 'SIMPLIFICADO' | 'ISENTO' | 'CUSTOM';
  transaction_type: 'B2B_SERVICES' | 'SAAS_SUBSCRIPTION' | 'EXPORT_SERVICE';
  tax_code: string;
  tax_rate: number; // e.g. 14 for 14%
  tax_base: number;
  tax_amount: number;
  tax_rule_id: string; // e.g. "AO-VAT-STANDARD-2026-v1"
  tax_rule_version: string;
  legal_basis_reference: string;
  tax_determination_timestamp: string;
}

export interface TaxEvidenceRecord {
  tax_evidence_id: string;
  invoice_id: string;
  customer_id: string;
  jurisdiction: string;
  tax_regime: string;
  tax_rate: number;
  tax_base: number;
  tax_amount: number;
  tax_rule_id: string;
  legal_basis_reference: string;
  calculated_at: string;
  content_hash: string;
}

export type CapacityStatus = 'CAPACITY_HEALTHY' | 'CAPACITY_WARNING' | 'CAPACITY_AT_RISK' | 'CAPACITY_LIMITED' | 'CAPACITY_BLOCKED';

export interface DynamicCapacitySnapshot {
  current_customer_count: number;
  current_employee_instances: number;
  soft_customer_capacity: number;
  hard_customer_capacity: number;
  soft_employee_capacity: number;
  hard_employee_capacity: number;
  compute_capacity_pct: number;
  storage_capacity_pct: number;
  support_capacity_pct: number;
  api_capacity_pct: number;
  autoscaling_enabled: boolean;
  capacity_status: CapacityStatus;
  evaluated_at: string;
}

export interface ScaleReadinessGateResult {
  passed: boolean;
  capacity_snapshot: DynamicCapacitySnapshot;
  evaluations: Record<string, boolean>;
  gate_timestamp: string;
}

export interface CohortWaveDefinition {
  wave_id: OnboardingCohortWave;
  name: string;
  max_customers: number; // Unlimited (0) for GENERAL_AVAILABILITY
  max_employees_per_customer: number;
  max_allowed_incidents: number;
  min_target_margin_pct: number;
  min_customer_satisfaction: number;
  rollout_status: 'LOCKED' | 'ACTIVE' | 'PASSED' | 'HALTED';
  is_dynamic_capacity_managed?: boolean;
}

export interface CustomerProductionReadiness23Gates {
  identity_verification: boolean;
  commercial_contract: boolean;
  customer_data: boolean;
  payment_method: boolean;
  first_payment: boolean;
  tenant_creation: boolean;
  employee_assignment: boolean;
  employee_version: boolean;
  permissions: boolean;
  knowledge_provisioning: boolean;
  internal_policies: boolean;
  integrations: boolean;
  security_controls: boolean;
  audit_logging: boolean;
  data_protection: boolean;
  backup_recovery: boolean;
  human_supervisor: boolean;
  escalation_rules: boolean;
  support_channel: boolean;
  usage_metering: boolean;
  billing_metering: boolean;
  rollback_plan: boolean;
  emergency_stop: boolean;
}

export interface FirstDayAtWorkConfig {
  organization_id: string;
  mission_statement: string;
  department: string;
  role_title: string;
  key_objectives: string[];
  forbidden_activities: string[];
  human_supervisor_id: string;
  authorized_tools: string[];
  permissions: string[];
  internal_systems: string[];
  knowledge_pack_ids: string[];
  autonomy_limit_aoa: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  first_task_prompt: string;
}

export interface FirstTaskRecord {
  task_id: string;
  employee_id: string;
  instance_id: string;
  customer_id: string;
  tenant_id: string;
  input_summary: string;
  tools_used: string[];
  source: MetricSource;
  started_at: string;
  completed_at?: string;
  reviewed_at?: string;
  accepted_at?: string;
  duration_ms: number;
  cost_aoa: number;
  output_result: string;
  supervisor_approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  customer_acceptance_status: 'PENDING' | 'ACCEPTED' | 'REWORK_REQUESTED';
  status: FirstTaskStatus;
}

export interface FirstTimeToValueMetrics {
  customer_id: string;
  source: MetricSource;
  payment_timestamp: string;
  activation_timestamp: string;
  employee_ready_timestamp: string;
  first_task_timestamp: string;
  accepted_result_timestamp: string;
  ftv_hours: number;
  hours_saved_estimate: number;
  error_reduction_pct: number;
  estimated_roi_pct: number;
  time_breakdown: TimeMetricsBreakdown;
  evidence_id: string;
}

export interface RevenueValidationRecord {
  revenue_validation_id: string;
  customer_id: string;
  employee_id: string;
  employee_instance_id: string;
  plan: CommercialPlanTier;
  monthly_contract_value: number;
  currency: CommercialCurrency;
  amount_invoiced: number;
  amount_received: number;
  amount_settled: number;
  payment_status: 'SETTLED' | 'PENDING' | 'FAILED';
  reconciliation_status: 'RECONCILED' | 'UNMATCHED';
  payment_evidence_id: string;
  settlement_evidence_id: string;
  reconciliation_evidence_id: string;
  tax_evidence_id: string;
  subscription_status: 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED';
  source: MetricSource;
  ai_cost: number;
  infrastructure_cost: number;
  api_cost: number;
  support_cost: number;
  total_variable_cost: number;
  contribution_margin: number;
  contribution_margin_pct: number; // 90.11%
  first_task_completed: boolean;
  first_task_accepted: boolean;
  first_value_validated: boolean;
  customer_satisfaction: number;
  renewal_signal: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  status: RealRevenueValidationStatus;
  evidence_id: string;
  validated_at: string;
}

export interface CustomerHealthRecord {
  customer_id: string;
  tenant_id: string;
  health_score: number;
  status: CustomerHealthStatus;
  activation_progress_pct: number;
  adoption_rate_pct: number;
  tasks_executed_30d: number;
  incidents_count_30d: number;
  support_tickets_30d: number;
  payment_delays_count: number;
  renewal_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  expansion_potential: 'LOW' | 'MEDIUM' | 'HIGH';
  last_evaluated_at: string;
}

export interface CustomerValidationScorecard {
  customer_id: string;
  commercial_validation: boolean;
  payment_validation: boolean;
  settlement_validation: boolean;
  reconciliation_validation: boolean;
  technical_validation: boolean;
  operational_validation: boolean;
  value_validation: boolean;
  ftv_semantic_validation: boolean;
  cost_validation: boolean;
  margin_validation: boolean;
  tax_validation: boolean;
  security_validation: boolean;
  audit_validation: boolean;
  support_validation: boolean;
  retention_validation: boolean;
  all_passed: boolean;
  evidence_completeness_pct: number;
  overall_status: CommercialCertificationState;
  scorecard_evidence_hashes: Record<string, string>;
}

export interface CommercialBaselineFreezeGateResult {
  baseline_id: string;
  frozen_at: string;
  payment_settlement_separation: boolean;
  financial_reconciliation: boolean;
  ftv_semantics: boolean;
  general_availability_capacity_model: boolean;
  tax_determination_engine: boolean;
  evidence_authenticity_controls: boolean;
  migrations: boolean;
  tests: boolean;
  documentation: boolean;
  wave_1_revalidation: boolean;
  gate_passed: boolean;
}
