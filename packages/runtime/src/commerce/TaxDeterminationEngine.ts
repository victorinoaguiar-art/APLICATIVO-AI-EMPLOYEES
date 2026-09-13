/**
 * AI Employee Tax Determination & Legal Traceability Engine
 * (AETF-500 Release v2.1 - Pre-Freeze Hardening)
 *
 * Configurable, versioned and legally traceable tax determination engine
 * resolving jurisdiction, tax regime, rates, codes, and audit evidence.
 */

import { safeHash } from '@ai-employee/shared';
import { TaxDeterminationResult, TaxEvidenceRecord } from '@ai-employee/shared';

export interface TaxRuleConfig {
  rule_id: string;
  rule_version: string;
  country: string;
  jurisdiction_name: string;
  regime: 'GERAL' | 'SIMPLIFICADO' | 'ISENTO' | 'CUSTOM';
  transaction_type: 'B2B_SERVICES' | 'SAAS_SUBSCRIPTION' | 'EXPORT_SERVICE';
  tax_code: string;
  tax_rate_pct: number;
  legal_basis_reference: string;
  effective_from: string;
  effective_to?: string;
  is_active: boolean;
}

export class TaxDeterminationEngine {
  private static instance: TaxDeterminationEngine | null = null;
  private rulesMap: Map<string, TaxRuleConfig> = new Map();

  private constructor() {
    this.initDefaultTaxRules();
  }

  public static getInstance(): TaxDeterminationEngine {
    if (!TaxDeterminationEngine.instance) {
      TaxDeterminationEngine.instance = new TaxDeterminationEngine();
    }
    return TaxDeterminationEngine.instance;
  }

  private initDefaultTaxRules(): void {
    const defaultRules: TaxRuleConfig[] = [
      {
        rule_id: 'AO-VAT-STANDARD-2026-v1',
        rule_version: 'v1.0.2026',
        country: 'AO',
        jurisdiction_name: 'Angola (Administração Geral Tributária - AGT)',
        regime: 'GERAL',
        transaction_type: 'SAAS_SUBSCRIPTION',
        tax_code: 'IVA-AO-14',
        tax_rate_pct: 14.0,
        legal_basis_reference: 'Código do IVA (Lei n.º 7/19 de 24 de Abril, com redação dada pela Lei n.º 17/23)',
        effective_from: '2026-01-01',
        is_active: true,
      },
      {
        rule_id: 'AO-VAT-EXEMPT-EXPORT-2026',
        rule_version: 'v1.0.2026',
        country: 'AO',
        jurisdiction_name: 'Angola (AGT Export Services)',
        regime: 'ISENTO',
        transaction_type: 'EXPORT_SERVICE',
        tax_code: 'IVA-EXEMPT-EXP',
        tax_rate_pct: 0.0,
        legal_basis_reference: 'Artigo 12.º, n.º 1 do Código do IVA - Isenção nas Operações de Exportação',
        effective_from: '2026-01-01',
        is_active: true,
      },
      {
        rule_id: 'EU-REVERSE-CHARGE-2026',
        rule_version: 'v2.1.2026',
        country: 'EU',
        jurisdiction_name: 'União Europeia (MOSS / Reverse Charge)',
        regime: 'GERAL',
        transaction_type: 'SAAS_SUBSCRIPTION',
        tax_code: 'EU-REV-CHARGE',
        tax_rate_pct: 0.0,
        legal_basis_reference: 'EU Council Directive 2006/112/EC - Reverse Charge Mechanism',
        effective_from: '2026-01-01',
        is_active: true,
      },
    ];

    for (const r of defaultRules) {
      this.rulesMap.set(r.rule_id, r);
    }
  }

  /**
   * Determine Tax for Invoice Line Item
   */
  public determineTax(
    country: string = 'AO',
    transactionType: 'B2B_SERVICES' | 'SAAS_SUBSCRIPTION' | 'EXPORT_SERVICE' = 'SAAS_SUBSCRIPTION',
    customerTaxId: string = 'NIF-5418001122',
    supplierTaxId: string = 'NIF-5000998811',
    netBaseAmount: number = 180000,
    forcedRuleId?: string,
  ): {
    tax_result: TaxDeterminationResult;
    tax_evidence: TaxEvidenceRecord;
  } {
    let selectedRule: TaxRuleConfig | undefined;

    if (forcedRuleId) {
      selectedRule = this.rulesMap.get(forcedRuleId);
    }

    if (!selectedRule) {
      selectedRule = Array.from(this.rulesMap.values()).find(
        (r) => r.country === country && r.transaction_type === transactionType && r.is_active,
      );
    }

    if (!selectedRule) {
      // Fallback rule
      selectedRule = this.rulesMap.get('AO-VAT-STANDARD-2026-v1')!;
    }

    const taxAmount = parseFloat(((netBaseAmount * selectedRule.tax_rate_pct) / 100).toFixed(2));
    const now = new Date().toISOString();

    const taxResult: TaxDeterminationResult = {
      tax_jurisdiction: selectedRule.jurisdiction_name,
      tax_country: selectedRule.country,
      tax_region: 'Nacional',
      customer_tax_id: customerTaxId,
      supplier_tax_id: supplierTaxId,
      tax_regime: selectedRule.regime,
      transaction_type: selectedRule.transaction_type,
      tax_code: selectedRule.tax_code,
      tax_rate: selectedRule.tax_rate_pct,
      tax_base: netBaseAmount,
      tax_amount: taxAmount,
      tax_rule_id: selectedRule.rule_id,
      tax_rule_version: selectedRule.rule_version,
      legal_basis_reference: selectedRule.legal_basis_reference,
      tax_determination_timestamp: now,
    };

    const evidenceId = `TAX-EVID-${Date.now().toString(36).toUpperCase()}`;
    const payloadStr = JSON.stringify(taxResult);
    const contentHash = safeHash(payloadStr);

    const taxEvidence: TaxEvidenceRecord = {
      tax_evidence_id: evidenceId,
      invoice_id: `INV-${Date.now().toString(36).toUpperCase()}`,
      customer_id: customerTaxId,
      jurisdiction: selectedRule.jurisdiction_name,
      tax_regime: selectedRule.regime,
      tax_rate: selectedRule.tax_rate_pct,
      tax_base: netBaseAmount,
      tax_amount: taxAmount,
      tax_rule_id: selectedRule.rule_id,
      legal_basis_reference: selectedRule.legal_basis_reference,
      calculated_at: now,
      content_hash: contentHash,
    };

    return {
      tax_result: taxResult,
      tax_evidence: taxEvidence,
    };
  }

  public getTaxRules(): TaxRuleConfig[] {
    return Array.from(this.rulesMap.values());
  }
}
