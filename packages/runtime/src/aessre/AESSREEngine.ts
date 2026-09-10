/**
 * AI EMPLOYEE HIRING, SALARY, SUBSCRIPTION & REVENUE ENGINE (AESSRE)
 * Core Engine for Commercial Products, Digital Salaries, Subscriptions & Revenue Ops
 */

import {
  AIEmployeeProduct,
  AITeamProduct,
  CurrencyCode,
  EmployeeInstance,
  EmployeeSubscription,
  InstanceStatus,
  PricingModel,
  RevenueMetricsSummary,
  SubscriptionStatus,
  SubscriptionTier
} from '@ai-employee/shared';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';

export class AESSREEngine {
  private static instance: AESSREEngine;
  private products: Map<number, AIEmployeeProduct> = new Map();
  private instances: Map<string, EmployeeInstance> = new Map();
  private subscriptions: Map<string, EmployeeSubscription> = new Map();
  private teamBundles: Map<string, AITeamProduct> = new Map();

  private constructor() {
    this.seedCanonicalProducts();
    this.seedDefaultInstances();
    this.seedDefaultTeamBundles();
  }

  public static getInstance(): AESSREEngine {
    if (!AESSREEngine.instance) {
      AESSREEngine.instance = new AESSREEngine();
    }
    return AESSREEngine.instance;
  }

  private seedCanonicalProducts(): void {
    CANONICAL_500_ROLES.forEach((role) => {
      const baseSalaryAoa = 25000 + (role.id % 15) * 5000;

      const product: AIEmployeeProduct = {
        productId: `prod_role_${role.id}`,
        roleId: role.id,
        roleKey: role.role_key,
        commercialName: role.display_name,
        shortDescription: role.mission,
        department: role.department,
        archetype: (role as any).archetype?.name || (role as any).archetypes?.[0] || 'Specialist',
        riskLevel: typeof role.risk === 'string' ? role.risk : role.risk?.level || 'R2',
        commercialStatus: 'AVAILABLE',
        availablePlans: [
          {
            tier: 'STARTER',
            currency: 'AOA',
            digitalSalaryDisplayLabel: `Salário Digital: ${baseSalaryAoa.toLocaleString()} AOA/mês`,
            monthlyPrice: baseSalaryAoa,
            annualPriceDiscountPercent: 15,
            includedTasksPerMonth: 500,
            includedDocumentsPerMonth: 50,
            includedConnectors: 2,
            overagePricePerTask: 50
          },
          {
            tier: 'PROFESSIONAL',
            currency: 'AOA',
            digitalSalaryDisplayLabel: `Salário Digital: ${(baseSalaryAoa * 1.8).toLocaleString()} AOA/mês`,
            monthlyPrice: Math.round(baseSalaryAoa * 1.8),
            annualPriceDiscountPercent: 20,
            includedTasksPerMonth: 2000,
            includedDocumentsPerMonth: 250,
            includedConnectors: 5,
            overagePricePerTask: 40
          },
          {
            tier: 'ENTERPRISE',
            currency: 'AOA',
            digitalSalaryDisplayLabel: `Salário Digital: ${(baseSalaryAoa * 3.5).toLocaleString()} AOA/mês`,
            monthlyPrice: Math.round(baseSalaryAoa * 3.5),
            annualPriceDiscountPercent: 25,
            includedTasksPerMonth: 10000,
            includedDocumentsPerMonth: 1500,
            includedConnectors: 20,
            overagePricePerTask: 25
          }
        ],
        supportedLanguages: ['pt-AO', 'en-US']
      };

      this.products.set(role.id, product);
    });
  }

  private seedDefaultInstances(): void {
    const defaultOrgId = 'tenant_enterprise_001';

    // Seed default instances for demo/testing
    const rolesToHire = [73, 53, 64, 50, 10];
    rolesToHire.forEach((roleId) => {
      this.hireEmployeeInstance({
        organizationId: defaultOrgId,
        roleId,
        planTier: 'PROFESSIONAL',
        supervisorId: 'usr_admin_001',
        departmentId: 'dept_finance',
        currency: 'AOA'
      });
    });
  }

  private seedDefaultTeamBundles(): void {
    const financeBundle: AITeamProduct = {
      teamId: 'team_bundle_finance_v1',
      teamName: 'Equipa Financeira Digital (Starter)',
      department: 'Finance',
      description: 'Tesouraria, Reconciliação Bancária e Relatórios de Gestão Consolidados',
      bundledRoleKeys: ['treasury_officer', 'bank_reconciliation_specialist', 'management_reporting_specialist'],
      bundleDiscountPercent: 15,
      totalMonthlyPriceAoa: 95000
    };

    this.teamBundles.set(financeBundle.teamId, financeBundle);
  }

  public getProduct(roleId: number): AIEmployeeProduct | undefined {
    return this.products.get(roleId);
  }

  public getAllProducts(): AIEmployeeProduct[] {
    return Array.from(this.products.values());
  }

  public hireEmployeeInstance(params: {
    organizationId: string;
    roleId: number;
    planTier: SubscriptionTier;
    supervisorId: string;
    departmentId: string;
    currency?: CurrencyCode;
  }): { instance: EmployeeInstance; subscription: EmployeeSubscription } {
    const product = this.products.get(params.roleId);
    if (!product) {
      throw new Error(`Product for Role ID [${params.roleId}] not found in Catalog.`);
    }

    const currency: CurrencyCode = params.currency || 'AOA';
    const plan = product.availablePlans.find((p) => p.tier === params.planTier) || product.availablePlans[0];

    const timestamp = Date.now();
    const randSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const instanceId = `EMP-${params.organizationId.substring(0, 5).toUpperCase()}-${params.roleId}-${timestamp.toString().slice(-4)}-${randSuffix}`;
    const subscriptionId = `SUB-${timestamp.toString().slice(-6)}-${randSuffix}`;

    const digitalSalaryMonthly = plan.monthlyPrice;

    const instance: EmployeeInstance = {
      instanceId,
      organizationId: params.organizationId,
      roleId: params.roleId,
      roleKey: product.roleKey,
      displayName: product.commercialName,
      departmentId: params.departmentId,
      supervisorId: params.supervisorId,
      subscriptionId,
      planTier: params.planTier,
      autonomyLevel: 'L3_SUPERVISED',
      status: 'ACTIVE',
      digitalSalaryMonthly,
      currency,
      createdAt: new Date().toISOString(),
      activatedAt: new Date().toISOString()
    };

    const subscription: EmployeeSubscription = {
      subscriptionId,
      organizationId: params.organizationId,
      instanceId,
      planTier: params.planTier,
      pricingModel: 'HYBRID',
      billingCycle: 'MONTHLY',
      currency,
      unitPriceMonthly: digitalSalaryMonthly,
      legalDescriptor: 'MONTHLY_SUBSCRIPTION_FEE',
      status: 'ACTIVE',
      startAt: new Date().toISOString(),
      renewAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.instances.set(instanceId, instance);
    this.subscriptions.set(subscriptionId, subscription);

    return { instance, subscription };
  }

  public transitionInstanceStatus(instanceId: string, newStatus: InstanceStatus): EmployeeInstance {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance [${instanceId}] not found.`);
    }
    instance.status = newStatus;
    if (newStatus === 'ACTIVE' && !instance.activatedAt) {
      instance.activatedAt = new Date().toISOString();
    }
    return instance;
  }

  public getAllInstances(organizationId?: string): EmployeeInstance[] {
    const all = Array.from(this.instances.values());
    if (organizationId) {
      return all.filter((i) => i.organizationId === organizationId);
    }
    return all;
  }

  public getAllSubscriptions(): EmployeeSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getAllTeamBundles(): AITeamProduct[] {
    return Array.from(this.teamBundles.values());
  }

  public getRevenueMetrics(): RevenueMetricsSummary {
    let totalMrrAoa = 0;
    let activeSubs = 0;
    const mrrByDept: Record<string, number> = {};

    this.subscriptions.forEach((sub) => {
      if (sub.status === 'ACTIVE') {
        activeSubs++;
        totalMrrAoa += sub.unitPriceMonthly;

        const instance = this.instances.get(sub.instanceId);
        if (instance) {
          const dept = instance.departmentId;
          mrrByDept[dept] = (mrrByDept[dept] || 0) + sub.unitPriceMonthly;
        }
      }
    });

    const activeInstancesCount = this.instances.size;
    const arpuAoa = activeSubs > 0 ? Math.round(totalMrrAoa / activeSubs) : 0;
    const grossMarginPercent = 84.5; // High-margin digital SaaS workforce model
    const churnRatePercent = 0.8;

    return {
      totalMrrAoa,
      activeSubscriptionsCount: activeSubs,
      activeInstancesCount,
      arpuAoa,
      grossMarginPercent,
      churnRatePercent,
      mrrByDepartmentAoa: mrrByDept
    };
  }
}
