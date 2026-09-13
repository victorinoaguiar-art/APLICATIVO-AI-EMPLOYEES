/**
 * AI Employee Expansion Revenue & Land-and-Expand Engine
 * (AETF-500 Release v3.0 - Controlled Scale Phase)
 */

import {
  ExpansionOpportunityRecord,
  ExpansionReadinessLevel,
  CommercialPlanTier,
} from '@ai-employee/shared';

export class ExpansionRevenueEngine {
  private static instance: ExpansionRevenueEngine | null = null;
  private expansionOpps: Map<string, ExpansionOpportunityRecord> = new Map();

  private constructor() {}

  public static getInstance(): ExpansionRevenueEngine {
    if (!ExpansionRevenueEngine.instance) {
      ExpansionRevenueEngine.instance = new ExpansionRevenueEngine();
    }
    return ExpansionRevenueEngine.instance;
  }

  /**
   * Identify Expansion Opportunity for Customer
   */
  public identifyExpansionOpportunity(
    customerId: string,
    currentPlan: CommercialPlanTier = 'PROFESSIONAL',
    activeEmployeeCount: number = 3,
  ): ExpansionOpportunityRecord {
    const oppId = `EXP-${customerId}-${Date.now().toString(36).toUpperCase()}`;

    let oppType: ExpansionOpportunityRecord['opportunity_type'] = 'ADDITIONAL_INSTANCE';
    let targetEmp = 'EMP-012';
    let additionalMrr = 180000;
    let readiness: ExpansionReadinessLevel = 'READY';
    let confidence = 85;
    let evidence = 'Alta utilização do colaborador EMP-001 (satuação de tarefas em 92%)';

    if (activeEmployeeCount >= 3) {
      oppType = 'DEPARTMENT_PACK';
      targetEmp = 'DEPARTMENT-FINANCE-PACK';
      additionalMrr = 450000;
      readiness = 'HIGH_OPPORTUNITY';
      confidence = 92;
      evidence = 'Procura cruzada comprovada entre Faturação, Tesouraria e Reconciliação Bancária';
    }

    const record: ExpansionOpportunityRecord = {
      opportunity_id: oppId,
      customer_id: customerId,
      opportunity_type: oppType,
      target_employee_id: targetEmp,
      recommended_plan: currentPlan === 'STARTER' ? 'PROFESSIONAL' : 'BUSINESS',
      expected_additional_mrr_aoa: additionalMrr,
      readiness_level: readiness,
      confidence_score: confidence,
      evidence_of_need: evidence,
      status: 'IDENTIFIED',
    };

    this.expansionOpps.set(oppId, record);
    return record;
  }

  public getOpportunitiesForCustomer(customerId: string): ExpansionOpportunityRecord[] {
    return Array.from(this.expansionOpps.values()).filter((o) => o.customer_id === customerId);
  }
}
