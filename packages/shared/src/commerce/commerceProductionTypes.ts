/**
 * AI Employee Commerce Production Hardening, Billing, Payments & Paid Customer Readiness
 * Extended Data Models & Contracts (AETF-500 Production Release 2026)
 */

import { CommercialPlanTier, CommercialBillingCycle, CommercialCurrency } from './commerce2026types.js';

export type SubscriptionStatusHardened =
  | 'DRAFT'
  | 'TRIAL'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCEL_AT_PERIOD_END'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'TERMINATED';

export type FXRateStatus = 'CURRENT' | 'STALE' | 'UNAVAILABLE' | 'MANUAL_APPROVED';

export interface FXRateRecord {
  rate_id: string;
  base_currency: CommercialCurrency;
  quote_currency: CommercialCurrency;
  rate: number;
  source: string;
  effective_at: string;
  expires_at: string;
  retrieved_at: string;
  status: FXRateStatus;
}

export interface PricingVersion {
  pricing_version_id: string;
  employee_template_id: string;
  plan_tier: CommercialPlanTier;
  currency: CommercialCurrency;
  base_price: number;
  direct_cost: number;
  minimum_selling_price: number;
  target_gross_margin_pct: number;
  included_usage: {
    tasks: number;
    tokens: number;
    storage_mb: number;
    hitl_calls: number;
  };
  overage_rates: {
    task: number;
    token: number;
    hitl: number;
  };
  effective_from: string;
  effective_to?: string;
  status: 'CURRENT' | 'ARCHIVED' | 'DRAFT';
}

export interface EntitlementLimits {
  max_tasks_per_month: number;
  max_tokens_per_month: number;
  max_storage_mb: number;
  allowed_connectors: string[];
  max_concurrent_instances: number;
  allowed_premium_tools: string[];
  hitl_allowance_calls: number;
  support_level: 'STANDARD' | 'PRIORITY' | 'DEDICATED';
  sla_tier: 'SL_99_0' | 'SL_99_5' | 'SL_99_9' | 'SL_99_99';
}

export interface EnterpriseActivationGates13 {
  subscription_active: boolean;
  tenant_verified: boolean;
  client_authorization_valid: boolean;
  cpeaa_policy_assigned: boolean;
  approved_workflows_configured: boolean;
  permissions_configured: boolean;
  credentials_valid: boolean;
  connectors_connected: boolean;
  financial_authorization_configured: boolean;
  hitl_configured_if_required: boolean;
  risk_policy_active: boolean;
  certification_valid: boolean;
  billing_profile_ready: boolean;
}

export type InvoiceStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'VOID'
  | 'CANCELLED';

export interface InvoiceLine {
  line_id: string;
  category:
    | 'SUBSCRIPTION'
    | 'INSTANCE'
    | 'OVERAGE'
    | 'CONNECTOR'
    | 'HITL'
    | 'IMPLEMENTATION'
    | 'DISCOUNT'
    | 'TAX'
    | 'LATE_FEE';
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceRecord {
  invoice_id: string;
  invoice_number: string;
  tenant_id: string;
  customer_id: string;
  subscription_id: string;
  billing_period: {
    start: string;
    end: string;
  };
  currency: CommercialCurrency;
  lines: InvoiceLine[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  credits_applied: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  issued_at: string;
  due_at: string;
  status: InvoiceStatus;
  is_sandbox: boolean;
}

export interface TaxProfile {
  profile_id: string;
  country: string;
  tax_id_nif: string;
  customer_type: 'BUSINESS' | 'INDIVIDUAL' | 'GOVERNMENT';
  tax_registration_status: 'NOT_YET_VERIFIED' | 'VERIFIED' | 'EXEMPT';
  applicable_tax_rate_pct: number;
  effective_date: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'CHARGEBACK'
  | 'EXPIRED';

export type PaymentMode = 'REAL_PAYMENT' | 'SANDBOX_PAYMENT' | 'SIMULATED_PAYMENT';

export interface PaymentRecord {
  payment_id: string;
  invoice_id: string;
  customer_id: string;
  tenant_id: string;
  provider: string;
  provider_reference: string;
  amount: number;
  currency: CommercialCurrency;
  payment_method: string;
  initiated_at: string;
  confirmed_at?: string;
  status: PaymentStatus;
  payment_mode: PaymentMode;
  is_real_payment: boolean;
}

export type ReconciliationStatus =
  | 'MATCHED'
  | 'PARTIALLY_MATCHED'
  | 'UNMATCHED'
  | 'OVERPAID'
  | 'UNDERPAID'
  | 'DUPLICATE'
  | 'REFUND_PENDING'
  | 'MANUAL_REVIEW';

export interface ReconciliationRecord {
  reconciliation_id: string;
  invoice_id: string;
  payment_id: string;
  tenant_id: string;
  expected_amount: number;
  received_amount: number;
  discrepancy_amount: number;
  currency: CommercialCurrency;
  matching_criteria_used: string[];
  status: ReconciliationStatus;
  reconciled_at: string;
  reconciled_by: string;
}

export interface CommercialLedgerEvent {
  ledger_id: string;
  event_type:
    | 'SUBSCRIPTION_CREATED'
    | 'INVOICE_ISSUED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_RECONCILED'
    | 'CREDIT_ISSUED'
    | 'REFUND_ISSUED'
    | 'WRITE_OFF'
    | 'REVENUE_RECOGNIZED';
  tenant_id: string;
  amount: number;
  currency: CommercialCurrency;
  timestamp: string;
  reference_id: string;
  metadata: Record<string, any>;
}

export interface ContractAcceptanceRecord {
  acceptance_id: string;
  contract_id: string;
  contract_version: string;
  terms_hash_sha256: string;
  customer_id: string;
  authorized_signatory_name: string;
  authorized_signatory_email: string;
  acceptance_method: 'DIGITAL_PORTAL' | 'QUALIFIED_E_SIGNATURE' | 'MANUAL_UPLOAD';
  accepted_at: string;
  signature_status: 'VALIDATED' | 'SANDBOX_DEMO';
  signature_reference: string;
}

export interface CustomerVerificationProfile {
  customer_id: string;
  tenant_id: string;
  legal_name: string;
  commercial_name: string;
  tax_id_nif: string;
  country: string;
  billing_address: string;
  authorized_contacts: { name: string; email: string; role: string }[];
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'RESTRICTED' | 'SUSPENDED';
}

export type PaidCustomerReadinessStatus =
  | 'NOT_READY'
  | 'SANDBOX_READY'
  | 'PILOT_CUSTOMER_READY'
  | 'PAID_CUSTOMER_READY'
  | 'PRODUCTION_HARDENED';

export interface PaidCustomerReadinessGate {
  status: PaidCustomerReadinessStatus;
  gate_checks: {
    customer_verification: boolean;
    contract_legal: boolean;
    subscription_valid: boolean;
    billing_profile_ready: boolean;
    tax_profile_ready: boolean;
    payment_method_configured: boolean;
    activation_gates_passed: boolean;
    entitlements_verified: boolean;
    security_isolation_passed: boolean;
    audit_logging_active: boolean;
    support_channel_active: boolean;
    monitoring_alerting_active: boolean;
  };
  real_paid_mrr_aoa: 0;
  first_real_paid_customer_confirmed: boolean;
}
