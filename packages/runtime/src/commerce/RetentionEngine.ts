/**
 * AI Employee Retention, Renewal & Churn Risk Engine
 * (AETF-500 Release v3.0 - Controlled Scale Phase)
 */

import {
  RenewalForecastRecord,
  ChurnRiskLevel,
  RenewalStatus,
} from '@ai-employee/shared';

export class RetentionEngine {
  private static instance: RetentionEngine | null = null;
  private renewalForecasts: Map<string, RenewalForecastRecord> = new Map();

  private constructor() {}

  public static getInstance(): RetentionEngine {
    if (!RetentionEngine.instance) {
      RetentionEngine.instance = new RetentionEngine();
    }
    return RetentionEngine.instance;
  }

  /**
   * Forecast Renewal Probability and Expected MRR
   */
  public forecastRenewal(
    customerId: string,
    currentMrrAoa: number,
    healthScore: number,
    contractEndDateIso: string = '2027-09-15',
  ): RenewalForecastRecord {
    const renewalId = `REN-${customerId}-${Date.now().toString(36).toUpperCase()}`;
    const endDate = new Date(contractEndDateIso);
    const now = new Date();
    const daysToRenewal = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    let riskLevel: ChurnRiskLevel = 'LOW';
    let probabilityPct = 98;
    let status: RenewalStatus = 'RENEWAL_CONFIRMED';

    if (healthScore < 60) {
      riskLevel = 'CRITICAL';
      probabilityPct = 35;
      status = 'RENEWAL_AT_RISK';
    } else if (healthScore < 75) {
      riskLevel = 'HIGH';
      probabilityPct = 65;
      status = 'RENEWAL_AT_RISK';
    } else if (healthScore < 85) {
      riskLevel = 'MODERATE';
      probabilityPct = 85;
      status = 'RENEWAL_PREPARATION';
    }

    const expectedMrr = parseFloat(((currentMrrAoa * probabilityPct) / 100).toFixed(2));

    const rec: RenewalForecastRecord = {
      renewal_id: renewalId,
      customer_id: customerId,
      contract_end_date: contractEndDateIso,
      days_to_renewal: daysToRenewal,
      current_mrr_aoa: currentMrrAoa,
      renewal_probability_pct: probabilityPct,
      expected_renewal_mrr_aoa: expectedMrr,
      renewal_status: status,
      renewal_risk: riskLevel,
      recommended_playbook: riskLevel === 'LOW' ? 'STANDARD_AUTO_RENEWAL' : 'EXECUTIVE_RECOVERY_ENGAGEMENT',
    };

    this.renewalForecasts.set(customerId, rec);
    return rec;
  }

  public getRenewalForecast(customerId: string): RenewalForecastRecord | undefined {
    return this.renewalForecasts.get(customerId);
  }
}
