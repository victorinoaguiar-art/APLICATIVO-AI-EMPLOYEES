/**
 * AI EMPLOYEE HIRING, SALARY, SUBSCRIPTION & REVENUE ENGINE (AESSRE)
 * Types & Contracts for 500 AI Employees
 */

export type CommercialStatus =
  | 'DRAFT'
  | 'INTERNAL_ONLY'
  | 'PILOT'
  | 'AVAILABLE'
  | 'LIMITED_AVAILABILITY'
  | 'SUSPENDED'
  | 'RETIRED';

export type InstanceStatus =
  | 'PROVISIONING'
  | 'CONFIGURING'
  | 'WAITING_CONNECTIONS'
  | 'WAITING_APPROVAL'
  | 'ORGANIZATION_READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'ARCHIVED';

export type SubscriptionTier = 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';

export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PricingModel =
  | 'FLAT_MONTHLY'
  | 'PER_EMPLOYEE_INSTANCE'
  | 'PER_TASK'
  | 'PER_DOCUMENT'
  | 'HYBRID'
  | 'ENTERPRISE_CONTRACT';

export type CurrencyCode = 'AOA' | 'USD' | 'EUR';

export interface PlanPricing {
  tier: SubscriptionTier;
  currency: CurrencyCode;
  digitalSalaryDisplayLabel: string; // e.g. "Salário Digital: 25.000 AOA/mês"
  monthlyPrice: number;
  annualPriceDiscountPercent: number;
  includedTasksPerMonth: number;
  includedDocumentsPerMonth: number;
  includedConnectors: number;
  overagePricePerTask: number;
}

export interface AIEmployeeProduct {
  productId: string;
  roleId: number;
  roleKey: string;
  commercialName: string;
  shortDescription: string;
  department: string;
  archetype: string;
  riskLevel: string;
  commercialStatus: CommercialStatus;
  availablePlans: PlanPricing[];
  supportedLanguages: string[];
}

export interface EmployeeInstance {
  instanceId: string;
  organizationId: string;
  roleId: number;
  roleKey: string;
  displayName: string;
  departmentId: string;
  supervisorId: string;
  subscriptionId: string;
  planTier: SubscriptionTier;
  autonomyLevel: string;
  status: InstanceStatus;
  digitalSalaryMonthly: number;
  currency: CurrencyCode;
  createdAt: string;
  activatedAt?: string;
}

export interface EmployeeSubscription {
  subscriptionId: string;
  organizationId: string;
  instanceId: string;
  planTier: SubscriptionTier;
  pricingModel: PricingModel;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  currency: CurrencyCode;
  unitPriceMonthly: number;
  legalDescriptor: string; // e.g. "MONTHLY_SUBSCRIPTION_FEE"
  status: SubscriptionStatus;
  startAt: string;
  renewAt: string;
  cancelAt?: string;
}

export interface AITeamProduct {
  teamId: string;
  teamName: string;
  department: string;
  description: string;
  bundledRoleKeys: string[];
  bundleDiscountPercent: number;
  totalMonthlyPriceAoa: number;
}

export interface RevenueMetricsSummary {
  totalMrrAoa: number;
  activeSubscriptionsCount: number;
  activeInstancesCount: number;
  arpuAoa: number;
  grossMarginPercent: number;
  churnRatePercent: number;
  mrrByDepartmentAoa: Record<string, number>;
}
