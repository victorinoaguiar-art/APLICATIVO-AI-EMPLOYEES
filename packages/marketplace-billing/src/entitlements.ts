import { PlanTier, TenantSubscription, Entitlements } from './types';

export const DEFAULT_PLAN_ENTITLEMENTS: Record<PlanTier, Entitlements> = {
  Starter: {
    maxInstalledEmployees: 5,
    maxActiveEmployees: 2,
    maxConcurrentTasks: 2,
    allowEnterpriseFeatures: false,
    allowCustomTools: false,
    auditRetentionDays: 30
  },
  Team: {
    maxInstalledEmployees: 25,
    maxActiveEmployees: 10,
    maxConcurrentTasks: 10,
    allowEnterpriseFeatures: false,
    allowCustomTools: true,
    auditRetentionDays: 90
  },
  Business: {
    maxInstalledEmployees: 100,
    maxActiveEmployees: 50,
    maxConcurrentTasks: 50,
    allowEnterpriseFeatures: true,
    allowCustomTools: true,
    auditRetentionDays: 365
  },
  Enterprise: {
    maxInstalledEmployees: 1000,
    maxActiveEmployees: 500,
    maxConcurrentTasks: 200,
    allowEnterpriseFeatures: true,
    allowCustomTools: true,
    auditRetentionDays: 2555 // 7 years
  }
};

export class EntitlementsManager {
  private subscriptions: Map<string, TenantSubscription> = new Map();

  constructor() {
    this.seedDefaultSubscription();
  }

  private seedDefaultSubscription(): void {
    this.subscriptions.set('tenant_default', {
      tenantId: 'tenant_default',
      plan: 'Enterprise',
      status: 'ACTIVE',
      currency: 'USD',
      startedAt: new Date().toISOString(),
      expiresAt: '2099-12-31T23:59:59Z',
      entitlements: DEFAULT_PLAN_ENTITLEMENTS.Enterprise
    });
  }

  public getSubscription(tenantId: string): TenantSubscription {
    return (
      this.subscriptions.get(tenantId) || {
        tenantId,
        plan: 'Starter',
        status: 'ACTIVE',
        currency: 'USD',
        startedAt: new Date().toISOString(),
        expiresAt: '2099-12-31T23:59:59Z',
        entitlements: DEFAULT_PLAN_ENTITLEMENTS.Starter
      }
    );
  }

  public checkCanInstallEmployee(tenantId: string, currentInstalledCount: number): boolean {
    const sub = this.getSubscription(tenantId);
    return currentInstalledCount < sub.entitlements.maxInstalledEmployees;
  }

  public checkCanRunTask(tenantId: string, currentConcurrentTasks: number): boolean {
    const sub = this.getSubscription(tenantId);
    return currentConcurrentTasks < sub.entitlements.maxConcurrentTasks;
  }
}
