export type CertificationTier = 'Verified' | 'Certified' | 'Enterprise Certified';
export type PlanTier = 'Starter' | 'Team' | 'Business' | 'Enterprise';
export type CurrencyCode = 'AOA' | 'USD' | 'EUR';
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';

export interface Publisher {
  id: string;
  name: string;
  verified: boolean;
  email: string;
  payoutCurrency: CurrencyCode;
}

export interface MarketplaceListing {
  id: string;
  publisherId: string;
  publisherName: string;
  roleKey: string;
  displayName: string;
  department: string;
  version: string;
  description: string;
  certification: CertificationTier;
  riskLevel: 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  maxAutonomy: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  pricingModel: 'per_employee' | 'per_task' | 'per_usage' | 'included_in_plan';
  unitPrice: number;
  currency: CurrencyCode;
  installsCount: number;
  rating: number;
  requiredPermissions: string[];
  requiredTools: string[];
}

export interface Installation {
  id: string;
  tenantId: string;
  listingId: string;
  roleKey: string;
  installedVersion: string;
  installedAt: string;
  adminConsentBy: string;
  status: 'ACTIVE' | 'PAUSED' | 'UNINSTALLED';
  configuredAutonomy: string;
}

export interface PermissionDiff {
  addedPermissions: string[];
  removedPermissions: string[];
  riskEscalated: boolean;
  oldRisk: string;
  newRisk: string;
  materialConsentRequired: boolean;
}

export interface Entitlements {
  maxInstalledEmployees: number;
  maxActiveEmployees: number;
  maxConcurrentTasks: number;
  allowEnterpriseFeatures: boolean;
  allowCustomTools: boolean;
  auditRetentionDays: number;
}

export interface TenantSubscription {
  tenantId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currency: CurrencyCode;
  startedAt: string;
  expiresAt: string;
  entitlements: Entitlements;
}

export interface UsageEvent {
  eventId: string;
  idempotencyKey: string;
  tenantId: string;
  departmentId: string;
  employeeId: string;
  taskId: string;
  modelProvider: string;
  operationType: string;
  providerCost: number;
  internalCost: number;
  customerPrice: number;
  currency: CurrencyCode;
  timestamp: string;
}

export interface FinancialLedgerEntry {
  ledgerId: string;
  eventId: string;
  tenantId: string;
  priceBookVersion: string;
  grossAmount: number;
  providerCost: number;
  platformShare: number;
  publisherShare: number;
  currency: CurrencyCode;
  timestamp: string;
}

export interface BudgetConfig {
  tenantId: string;
  departmentId?: string;
  monthlyLimit: number;
  currentSpend: number;
  currency: CurrencyCode;
  alertThresholdPercent: number; // e.g. 80 for 80%
  hardLimitReached: boolean;
}

export interface PublisherPayout {
  payoutId: string;
  publisherId: string;
  period: string;
  grossRevenue: number;
  publisherShare: number;
  platformShare: number;
  currency: CurrencyCode;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  timestamp: string;
}
