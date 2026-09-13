/**
 * AI Employee Unit Economics & Profitability Engine
 * (AETF-500 Release v3.0 - Controlled Scale Phase)
 */

import { CustomerUnitEconomics, ProfitabilityStatus } from '@ai-employee/shared';

export class UnitEconomicsEngine {
  private static instance: UnitEconomicsEngine | null = null;
  private economicsMap: Map<string, CustomerUnitEconomics> = new Map();

  private constructor() {}

  public static getInstance(): UnitEconomicsEngine {
    if (!UnitEconomicsEngine.instance) {
      UnitEconomicsEngine.instance = new UnitEconomicsEngine();
    }
    return UnitEconomicsEngine.instance;
  }

  /**
   * Calculate Comprehensive Customer Unit Economics
   */
  public calculateUnitEconomics(
    customerId: string,
    monthlyRevenueAoa: number = 350000,
    employeeCount: number = 3,
  ): CustomerUnitEconomics {
    const aiCost = 8200 * employeeCount;
    const infraCost = 3400 * employeeCount;
    const apiCost = 1200 * employeeCount;
    const storageCost = 1500;
    const supportCost = 5000;
    const paymentFees = parseFloat((monthlyRevenueAoa * 0.015).toFixed(2)); // 1.5% EMIS
    const integrationCost = 2500;

    const totalVarCost = aiCost + infraCost + apiCost + storageCost + supportCost + paymentFees + integrationCost;
    const contributionMargin = monthlyRevenueAoa - totalVarCost;
    const marginPct = parseFloat(((contributionMargin / monthlyRevenueAoa) * 100).toFixed(2));

    let profStatus: ProfitabilityStatus = 'HIGHLY_PROFITABLE';
    if (marginPct < 0) profStatus = 'NEGATIVE_CONTRIBUTION';
    else if (marginPct < 30) profStatus = 'LOW_MARGIN';
    else if (marginPct < 50) profStatus = 'MARGIN_WARNING';
    else if (marginPct < 70) profStatus = 'PROFITABLE';

    const cacAoa = 450000; // Customer Acquisition Cost
    const monthlyGrossProfit = contributionMargin;
    const paybackMonths = parseFloat((cacAoa / monthlyGrossProfit).toFixed(1)); // ~1.5 months
    const observedLtv = contributionMargin * 24; // 24 months observed
    const projectedLtv = contributionMargin * 36;
    const ltvCacRatio = parseFloat((projectedLtv / cacAoa).toFixed(1)); // ~24.5x

    const record: CustomerUnitEconomics = {
      customer_id: customerId,
      monthly_revenue_aoa: monthlyRevenueAoa,
      ai_cost_aoa: aiCost,
      infrastructure_cost_aoa: infraCost,
      api_cost_aoa: apiCost,
      storage_cost_aoa: storageCost,
      support_cost_aoa: supportCost,
      payment_fees_aoa: paymentFees,
      integration_cost_aoa: integrationCost,
      total_variable_cost_aoa: totalVarCost,
      contribution_margin_aoa: contributionMargin,
      contribution_margin_pct: marginPct,
      profitability_status: profStatus,
      cac_aoa: cacAoa,
      cac_payback_months: paybackMonths,
      ltv_type: 'PROJECTED_LTV',
      observed_ltv_aoa: observedLtv,
      projected_ltv_aoa: projectedLtv,
      ltv_cac_ratio: ltvCacRatio,
      ltv_cac_label: 'Projected LTV / Observed CAC',
      evaluated_at: new Date().toISOString(),
    };

    this.economicsMap.set(customerId, record);
    return record;
  }

  public getUnitEconomics(customerId: string): CustomerUnitEconomics | undefined {
    return this.economicsMap.get(customerId);
  }
}
