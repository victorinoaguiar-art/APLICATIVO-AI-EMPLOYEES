/**
 * AI Employee Commercial Operations Engine (AETF-500 Commercial Release 2026)
 * Marketplace Catalog, Hiring, Subscription, Deployment, Usage Metering & Revenue Operations
 */

import {
  safeHash,
  CommercialPlanTier,

  CommercialBillingCycle,
  CommercialCurrency,
  CommercialSubscriptionStatus,
  CommercialDeploymentStatus,
  CommercialPricingFloor,
  MarketplaceItem,
  HiringRequest,
  EmployeeActivationGates,
  CommercialEmployeeInstance,
  SubscriptionRecord,
  UsageEvent,
  CommercialContractRecord,
  UnitEconomicsRecord,
  CommercialRevenueMetrics,
  MarketplaceSearchResult,
} from '@ai-employee/shared';

// Exchange rates baseline (AOA default)
const EXCHANGE_RATES: Record<CommercialCurrency, number> = {
  AOA: 1,
  USD: 920, // 1 USD = 920 AOA
  EUR: 1000, // 1 EUR = 1000 AOA
};

// Human equivalent monthly salary baseline (AOA) for ROI calculation
const HUMAN_EQUIVALENT_SALARY_AOA: Record<string, number> = {
  Accounting: 1500000, // 1.5M AOA/mo
  Tax: 1800000, // 1.8M AOA/mo
  Legal: 2500000, // 2.5M AOA/mo
  HR: 1200000, // 1.2M AOA/mo
  Finance: 2000000, // 2.0M AOA/mo
  Operations: 1400000,
  IT: 1800000,
  'Customer Support': 800000,
  Procurement: 1500000,
  Sales: 1600000,
  Marketing: 1300000,
  Compliance: 2200000,
  Audit: 2400000,
  Executive: 4000000,
  Risk: 2200000,
  'Supply Chain': 1500000,
  Logistics: 1100000,
  Engineering: 2200000,
};

export class AIEmployeeCommerceEngine {
  private marketplaceCatalog: Map<string, MarketplaceItem> = new Map();
  private hiringRequests: Map<string, HiringRequest> = new Map();
  private instances: Map<string, CommercialEmployeeInstance> = new Map();
  private subscriptions: Map<string, SubscriptionRecord> = new Map();
  private usageEvents: UsageEvent[] = [];
  private contracts: Map<string, CommercialContractRecord> = new Map();

  constructor() {
    this.seedMarketplaceCatalog();
  }

  /**
   * Seed catalog from the 500 AETF CERT-L3 baseline across 18 departments
   */
  private seedMarketplaceCatalog(): void {
    const departments = [
      'Accounting',
      'Tax',
      'Legal',
      'HR',
      'Finance',
      'Operations',
      'IT',
      'Customer Support',
      'Procurement',
      'Sales',
      'Marketing',
      'Compliance',
      'Audit',
      'Executive',
      'Risk',
      'Supply Chain',
      'Logistics',
      'Engineering',
    ];

    let count = 0;
    for (const dept of departments) {
      // Create 27-28 templates per department to total 500
      const templatesInDept = dept === 'Accounting' || dept === 'Tax' ? 28 : 27;

      for (let i = 1; i <= templatesInDept; i++) {
        count++;
        if (count > 500) break;

        const empId = `EMP-${count.toString().padStart(3, '0')}`;
        const isRestricted = count > 490; // 10 Primavera-restricted from baseline
        const baseAoa = 250000 + (count % 15) * 20000; // Base Digital Salary e.g. 250k - 530k AOA/month

        const pricingFloor: CommercialPricingFloor = {
          model_cost: 35000,
          compute_cost: 15000,
          storage_cost: 5000,
          connector_cost: 10000,
          hitl_cost: 15000,
          risk_reserve: 10000,
          target_margin_pct: 60,
          minimum_digital_salary: 180000,
        };

        const item: MarketplaceItem = {
          catalog_id: `CAT-${empId}`,
          employee_template_id: empId,
          employee_name: `AI Colaborador ${dept} #${i}`,
          role_title: `Especialista Digital de ${dept}`,
          department: dept,
          cert_level: 'CERT-L3',
          operational_status: isRestricted
            ? 'PRODUCTION_READY_RESTRICTED'
            : 'PRODUCTION_READY_FULL',
          supported_plans: ['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE'],
          base_monthly_price: {
            AOA: baseAoa,
            USD: Math.round(baseAoa / EXCHANGE_RATES.USD),
            EUR: Math.round(baseAoa / EXCHANGE_RATES.EUR),
          },
          pricing_floor: pricingFloor,
          sla_guarantee_pct: isRestricted ? 99.5 : 99.9,
          included_tasks_per_month: 2500,
          overage_cost_per_task: {
            AOA: 150,
            USD: 0.16,
            EUR: 0.15,
          },
          hitl_cost_per_escalation: {
            AOA: 2500,
            USD: 2.7,
            EUR: 2.5,
          },
          skills: [
            `Processamento de Tarefas de ${dept}`,
            'Validação Contínua CPEAA',
            'Auditoria RCODE & Trilha Temporal',
            'Integração ERP/CRM Multi-tenant',
          ],
          supported_connectors: ['PostgreSQL', 'SAP', 'Primavera', 'Email', 'REST_API'],
          restrictions: isRestricted
            ? ['Requer Módulo de Suporte Legado Primavera v10 Ativo']
            : undefined,
        };

        this.marketplaceCatalog.set(empId, item);
      }
    }
  }

  /**
   * Search / Filter Marketplace Catalog
   */
  public searchMarketplace(filters?: {
    department?: string;
    search?: string;
    plan_tier?: CommercialPlanTier;
    cert_level?: string;
  }): MarketplaceSearchResult {
    let items = Array.from(this.marketplaceCatalog.values());

    if (filters?.department) {
      items = items.filter(
        (it) => it.department.toLowerCase() === filters.department?.toLowerCase(),
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (it) =>
          it.employee_name.toLowerCase().includes(q) ||
          it.role_title.toLowerCase().includes(q) ||
          it.employee_template_id.toLowerCase().includes(q) ||
          it.department.toLowerCase().includes(q),
      );
    }

    if (filters?.plan_tier) {
      items = items.filter((it) => it.supported_plans.includes(filters.plan_tier!));
    }

    const deptSummary: Record<string, number> = {};
    const certSummary: Record<string, number> = {};

    for (const item of Array.from(this.marketplaceCatalog.values())) {
      deptSummary[item.department] = (deptSummary[item.department] || 0) + 1;
      certSummary[item.cert_level] = (certSummary[item.cert_level] || 0) + 1;
    }

    return {
      total_catalog_items: this.marketplaceCatalog.size,
      filtered_items: items,
      department_summary: deptSummary,
      cert_level_summary: certSummary,
    };
  }

  /**
   * Get single marketplace item
   */
  public getMarketplaceItem(templateId: string): MarketplaceItem | undefined {
    return this.marketplaceCatalog.get(templateId);
  }

  /**
   * Price calculation with floor enforcement
   */
  public calculatePrice(
    templateId: string,
    planTier: CommercialPlanTier,
    billingCycle: CommercialBillingCycle,
    currency: CommercialCurrency = 'AOA',
  ): {
    final_monthly_price: number;
    pricing_floor_aoa: number;
    discount_applied_pct: number;
    currency: CommercialCurrency;
    is_above_floor: boolean;
  } {
    const item = this.marketplaceCatalog.get(templateId);
    if (!item) {
      throw new Error(`Template ${templateId} não encontrado no catálogo.`);
    }

    const floorAoa = item.pricing_floor.minimum_digital_salary;
    let basePrice = item.base_monthly_price[currency];

    // Tier Multipliers
    const tierMultiplier: Record<CommercialPlanTier, number> = {
      STARTER: 1.0,
      PROFESSIONAL: 1.35,
      BUSINESS: 1.8,
      ENTERPRISE: 2.5,
    };

    let calculatedPrice = basePrice * tierMultiplier[planTier];

    // Annual Discount
    let discountPct = 0;
    if (billingCycle === 'ANNUAL') {
      discountPct = 15; // 15% discount for annual commitment
      calculatedPrice = calculatedPrice * 0.85;
    }

    // Floor check in target currency
    const minSalaryInCurrency = floorAoa / EXCHANGE_RATES[currency];
    const isAboveFloor = calculatedPrice >= minSalaryInCurrency;
    const finalPrice = Math.max(calculatedPrice, minSalaryInCurrency);

    return {
      final_monthly_price: Math.round(finalPrice),
      pricing_floor_aoa: floorAoa,
      discount_applied_pct: discountPct,
      currency,
      is_above_floor: isAboveFloor,
    };
  }

  /**
   * Process Employee Hiring Request
   */
  public hireEmployee(request: HiringRequest): {
    hiring_id: string;
    instance: CommercialEmployeeInstance;
    subscription: SubscriptionRecord;
    contract: CommercialContractRecord;
  } {
    const template = this.marketplaceCatalog.get(request.employee_template_id);
    if (!template) {
      throw new Error(`Template ${request.employee_template_id} não existe.`);
    }

    const priceDetails = this.calculatePrice(
      request.employee_template_id,
      request.selected_plan,
      request.billing_cycle,
      request.currency,
    );

    const instanceId = `INSTANCE-${request.tenant_id.substring(0, 6)}-${request.employee_template_id}-${Date.now().toString(36).substring(4)}`;
    const subscriptionId = `SUB-${Date.now().toString(36).toUpperCase()}`;
    const contractId = `CTR-${Date.now().toString(36).toUpperCase()}`;

    // 1. Legal Contract
    const legalDisclaimer =
      'ESTE CONTRATO REFERE-SE EXCLUSIVAMENTE À CONTRATAÇÃO DE UM COLABORADOR DIGITAL (AI EMPLOYEE) EM REGIME DE SUBSCRIÇÃO DE SOFTWARE/SERVIÇO (SaaS). NÃO CONSTITUI NEM CRIA QUALQUER TIPO DE VÍNCULO LABORAL HUMANO, DIREITO DE TRABALHO, SEGURANÇA SOCIAL OU ENCARGO TRABALHISTA.';
    const terms = `CONTRATO COMERCIAL DE COLABORADOR DIGITAL AETF-500\nContratante: ${request.tenant_id}\nColaborador: ${template.employee_name} (${request.employee_template_id})\nPlano: ${request.selected_plan}\nCiclo: ${request.billing_cycle}\nSalário Digital Acordado: ${priceDetails.final_monthly_price} ${request.currency}/mês\nSLA: ${template.sla_guarantee_pct}%\n\n${legalDisclaimer}`;

    const termsHash = safeHash(terms);


    const contract: CommercialContractRecord = {
      contract_id: contractId,
      hiring_id: request.hiring_id,
      tenant_id: request.tenant_id,
      instance_id: instanceId,
      digital_employee_name: request.hired_instance_name || template.employee_name,
      legal_disclaimer: legalDisclaimer,
      terms_and_conditions: terms,
      signed_at: request.contract_signed_at || new Date().toISOString(),
      terms_sha256: termsHash,
    };
    this.contracts.set(contractId, contract);

    // 2. Subscription Record
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (request.billing_cycle === 'ANNUAL' ? 12 : 1));

    const subscription: SubscriptionRecord = {
      subscription_id: subscriptionId,
      tenant_id: request.tenant_id,
      instance_id: instanceId,
      employee_template_id: request.employee_template_id,
      plan_tier: request.selected_plan,
      billing_cycle: request.billing_cycle,
      currency: request.currency,
      digital_salary_monthly: priceDetails.final_monthly_price,
      overage_rate: template.overage_cost_per_task[request.currency],
      hitl_rate: template.hitl_cost_per_escalation[request.currency],
      current_period_start: now.toISOString(),
      current_period_end: endDate.toISOString(),
      status: 'PENDING_ACTIVATION',
      payment_status: 'DEMO_TEST', // Default simulation flag
      is_demo: true,
    };
    this.subscriptions.set(subscriptionId, subscription);

    // 3. Employee Instance (SUBSCRIBED != ACTIVATED)
    const instance: CommercialEmployeeInstance = {
      instance_id: instanceId,
      hiring_id: request.hiring_id,
      tenant_id: request.tenant_id,
      employee_template_id: request.employee_template_id,
      hired_name: request.hired_instance_name || template.employee_name,
      subscription_id: subscriptionId,
      hired_at: now.toISOString(),
      activation_status: 'PENDING_ACTIVATION',
      deployment_status: 'NOT_DEPLOYED',
      activation_gates: {
        tenant_onboarded: false,
        cpeaa_policy_assigned: false,
        permissions_configured: false,
        connectors_connected: false,
        financial_limits_set: false,
      },
      current_period_tasks_executed: 0,
      current_period_hitl_escalations: 0,
      current_period_cost_accumulated: 0,
    };
    this.instances.set(instanceId, instance);
    this.hiringRequests.set(request.hiring_id, request);

    return {
      hiring_id: request.hiring_id,
      instance,
      subscription,
      contract,
    };
  }

  /**
   * Activate Employee Instance after passing mandatory activation gates
   */
  public activateInstance(
    instanceId: string,
    gatesInput: Partial<EmployeeActivationGates>,
  ): {
    success: boolean;
    instance: CommercialEmployeeInstance;
    missing_gates: string[];
  } {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância ${instanceId} não encontrada.`);
    }

    // Update gates
    instance.activation_gates = {
      ...instance.activation_gates,
      ...gatesInput,
    };

    const missingGates: string[] = [];
    const gates = instance.activation_gates;

    if (!gates.tenant_onboarded) missingGates.push('tenant_onboarded');
    if (!gates.cpeaa_policy_assigned) missingGates.push('cpeaa_policy_assigned');
    if (!gates.permissions_configured) missingGates.push('permissions_configured');
    if (!gates.connectors_connected) missingGates.push('connectors_connected');
    if (!gates.financial_limits_set) missingGates.push('financial_limits_set');

    if (missingGates.length === 0) {
      instance.activation_status = 'ACTIVE';
      instance.deployment_status = 'HEALTHY';
      instance.activated_at = new Date().toISOString();

      const sub = this.subscriptions.get(instance.subscription_id);
      if (sub) {
        sub.status = 'ACTIVE';
      }
    } else {
      instance.activation_status = 'PENDING_ACTIVATION';
      instance.deployment_status = 'ACTIVATING';
    }

    return {
      success: missingGates.length === 0,
      instance,
      missing_gates: missingGates,
    };
  }

  /**
   * Record task usage event and compute direct costs
   */
  public recordUsage(
    instanceId: string,
    taskType: string,
    tokensUsed: number,
    computeMs: number,
    connectorsInvoked: string[],
    hitlEscalated: boolean = false,
  ): UsageEvent {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância ${instanceId} não encontrada.`);
    }

    if (instance.activation_status !== 'ACTIVE') {
      throw new Error(
        `Instância ${instanceId} está em estado ${instance.activation_status}. Apenas instâncias ATIVAS podem executar tarefas.`,
      );
    }

    // Direct cost calculations (AOA)
    const modelCost = (tokensUsed / 1000) * 8; // ~8 AOA per 1k tokens
    const computeCost = (computeMs / 1000) * 2; // ~2 AOA per sec compute
    const connectorCost = connectorsInvoked.length * 15; // 15 AOA per connector call
    const hitlCost = hitlEscalated ? 2500 : 0; // 2500 AOA per HITL escalation

    const totalCost = modelCost + computeCost + connectorCost + hitlCost;

    const event: UsageEvent = {
      event_id: `EVT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      instance_id: instanceId,
      tenant_id: instance.tenant_id,
      timestamp: new Date().toISOString(),
      task_type: taskType,
      tokens_used: tokensUsed,
      compute_ms: computeMs,
      connectors_invoked: connectorsInvoked,
      hitl_escalated: hitlEscalated,
      cost_breakdown: {
        model_cost: Math.round(modelCost),
        compute_cost: Math.round(computeCost),
        connector_cost: Math.round(connectorCost),
        hitl_cost: Math.round(hitlCost),
        total_cost: Math.round(totalCost),
      },
    };

    this.usageEvents.push(event);

    // Update instance counters
    instance.current_period_tasks_executed += 1;
    if (hitlEscalated) instance.current_period_hitl_escalations += 1;
    instance.current_period_cost_accumulated += event.cost_breakdown.total_cost;

    return event;
  }

  /**
   * Calculate Unit Economics per template / instance
   */
  public getUnitEconomics(templateId?: string): UnitEconomicsRecord[] {
    const results: UnitEconomicsRecord[] = [];
    const templates = templateId
      ? [this.marketplaceCatalog.get(templateId)!].filter(Boolean)
      : Array.from(this.marketplaceCatalog.values());

    for (const tmpl of templates) {
      const dept = tmpl.department;
      const humanCost = HUMAN_EQUIVALENT_SALARY_AOA[dept] || 1500000;

      // Base Digital Salary
      const digitalSalaryAoa = tmpl.base_monthly_price.AOA;

      // Estimated Monthly Direct Cost (Model + Compute + Connectors + Storage)
      const directCostAoa =
        tmpl.pricing_floor.model_cost +
        tmpl.pricing_floor.compute_cost +
        tmpl.pricing_floor.storage_cost +
        tmpl.pricing_floor.connector_cost +
        tmpl.pricing_floor.hitl_cost;

      const grossMarginAoa = digitalSalaryAoa - directCostAoa;
      const grossMarginPct = Math.round((grossMarginAoa / digitalSalaryAoa) * 100);

      const clientSavings = humanCost - digitalSalaryAoa;
      const roiForClientPct = Math.round((clientSavings / humanCost) * 100);

      results.push({
        employee_template_id: tmpl.employee_template_id,
        employee_name: tmpl.employee_name,
        department: tmpl.department,
        monthly_digital_salary: digitalSalaryAoa,
        monthly_direct_cost: directCostAoa,
        gross_margin_aoa: grossMarginAoa,
        gross_margin_pct: grossMarginPct,
        human_equivalent_cost_aoa: humanCost,
        roi_for_client_pct: roiForClientPct,
      });
    }

    return results;
  }

  /**
   * Commercial Revenue Control Plane & Financial Governance Metrics
   */
  public getRevenueMetrics(): CommercialRevenueMetrics {
    const activeSubs = Array.from(this.subscriptions.values()).filter(
      (s) => s.status === 'ACTIVE',
    );
    const allSubs = Array.from(this.subscriptions.values());

    let totalMrrAoa = 0;
    let realPaidMrrAoa = 0;
    let demoMrrAoa = 0;
    const currencyBreakdown: Record<CommercialCurrency, number> = {
      AOA: 0,
      USD: 0,
      EUR: 0,
    };

    for (const sub of allSubs) {
      const mrrInAoa = sub.digital_salary_monthly * EXCHANGE_RATES[sub.currency];
      totalMrrAoa += mrrInAoa;
      currencyBreakdown[sub.currency] += sub.digital_salary_monthly;

      if (sub.is_demo || sub.payment_status === 'DEMO_TEST') {
        demoMrrAoa += mrrInAoa;
      } else if (sub.payment_status === 'PAID') {
        realPaidMrrAoa += mrrInAoa;
      }
    }

    const totalArrAoa = totalMrrAoa * 12;
    const activeCount = activeSubs.length || allSubs.length;
    const deployedCount = Array.from(this.instances.values()).filter(
      (i) => i.deployment_status === 'HEALTHY',
    ).length;

    const arpe = activeCount > 0 ? Math.round(totalMrrAoa / activeCount) : 0;

    // Direct Cost Calculation across instances
    let totalDirectCostAoa = 0;
    for (const inst of Array.from(this.instances.values())) {
      totalDirectCostAoa += inst.current_period_cost_accumulated;
    }

    const grossMarginPct =
      totalMrrAoa > 0
        ? Math.round(((totalMrrAoa - totalDirectCostAoa) / totalMrrAoa) * 100)
        : 65;

    return {
      total_arr_aoa: totalArrAoa,
      total_mrr_aoa: totalMrrAoa,
      real_paid_mrr_aoa: realPaidMrrAoa, // 0 if all are DEMO/TEST
      demo_simulated_mrr_aoa: demoMrrAoa,
      active_subscriptions_count: activeCount,
      total_instances_deployed: deployedCount,
      average_revenue_per_employee_arpe: arpe,
      gross_margin_pct: Math.min(Math.max(grossMarginPct, 0), 95),
      net_margin_pct: Math.max(grossMarginPct - 15, 0), // 15% operating overhead
      blended_cac_aoa: 120000, // ~120k AOA CAC baseline
      ltv_aoa: arpe > 0 ? arpe * 36 : 0, // 3-year LTV baseline
      payback_period_months: 1.8,
      churn_rate_pct: 0.5,
      currency_breakdown: currencyBreakdown,
    };
  }

  // Getters for inspection
  public getInstance(instanceId: string): CommercialEmployeeInstance | undefined {
    return this.instances.get(instanceId);
  }

  public getSubscription(subId: string): SubscriptionRecord | undefined {
    return this.subscriptions.get(subId);
  }

  public getContract(contractId: string): CommercialContractRecord | undefined {
    return this.contracts.get(contractId);
  }

  public getAllInstances(): CommercialEmployeeInstance[] {
    return Array.from(this.instances.values());
  }

  public getAllSubscriptions(): SubscriptionRecord[] {
    return Array.from(this.subscriptions.values());
  }
}
