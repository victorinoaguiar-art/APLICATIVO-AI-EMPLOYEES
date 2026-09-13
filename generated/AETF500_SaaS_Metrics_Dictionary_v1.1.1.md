# AETF-500 SaaS Metrics Dictionary v1.1.1 (Hardened Baseline)

> **Status**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN`  
> **Certification**: `METRICS_FOUNDATION_CERTIFIED`  
> **Wave Status**: `READY_FOR_COMMERCIAL_PREDICTABILITY_WAVE_3`  
> **Date**: 2026-09-12  

---

## 1. Executive Summary

This document defines the hardened SaaS Metrics Dictionary v1.1.1 for the AETF-500 Platform. It corrects mathematical errors in Net Retention Rate (NRR) and Gross Retention Rate (GRR), implements a mandatory `SettlementBridgeRecord` for billing vs cash reconciliation, establishes non-destructive audit logging, enforces Angolan (`AO`) Tax Jurisdiction rules, standardizes 4D Metric Dimensions, and enforces 64-character SHA-256 cryptographic lineage tracking.

---

## 2. Core Corrected Metrics (v1.1.1 Baseline)

| Metric Code | Metric Name | Previous Value (v1.1) | Corrected Value (v1.1.1) | Formula / Derivation Rule |
|---|---|---|---|---|
| `METRIC_NRR` | Net Retention Rate | 120.0% | **124.1%** | `((Opening + Expansion - Contraction - Churn) / Opening) * 100` |
| `METRIC_GRR` | Gross Retention Rate | 95.0% | **94.1%** | `((Opening - Contraction - Churn) / Opening) * 100` |
| `METRIC_SETTLEMENT_BRIDGE` | Settlement Bridge | Unresolved 26,400 AOA | **0 AOA Diff** | `Billed (1.32M) - ISR Tax (26.4k) = Cash (1.2936M)` |
| `METRIC_ARR` | Annual Recurring Revenue | Direct Input | **Derived ($MRR \times 12$)** | CalculationType = `DERIVED`, TemporalMaturity = `PERIOD_OBSERVED` |
| `METRIC_NPS` | Net Promoter Score | Generic Avg | **+50 (+50.0)** | `% Promoters - % Detractors` (Score 9 = Promoter) |

---

## 3. Financial Breakdown (MRR Cohort AOA)

- **Opening MRR**: 1,000,000 AOA
- **Expansion MRR**: 300,000 AOA
- **Contraction MRR**: 50,000 AOA
- **Churn MRR**: 9,000 AOA
- **Closing MRR**: 1,241,000 AOA

$$\text{NRR} = \frac{1,000,000 + 300,000 - 50,000 - 9,000}{1,000,000} \times 100 = \frac{1,241,000}{1,000,000} \times 100 = 124.1\%$$

$$\text{GRR} = \frac{1,000,000 - 50,000 - 9,000}{1,000,000} \times 100 = \frac{941,000}{1,000,000} \times 100 = 94.1\%$$

---

## 4. Tax Jurisdiction Protection (`AO`)

For Tax Jurisdiction **`AO`** (Angola):
- **Approved Tax Codes**: `IVA` (Imposto sobre o Valor Acrescentado), `IRT` (Imposto sobre os Rendimentos do Trabalho), `IS` (Imposto de Selo), `II` (Imposto Industrial), `IP` (Imposto Predial).
- **Prohibited Tax Codes**: `ISS`, `ICMS`, `PIS`, `COFINS` (Brazilian jurisdiction codes). Any presence raises `INVALID_TAX_JURISDICTION_CODE`.

---

## 5. Non-Destructive Audit Log Architecture

All metric adjustments are appended non-destructively as structured audit records:
1. `MetricCorrectionRecord`: Recalculations and mathematical corrections.
2. `MetricReclassificationRecord`: Recalculation or scope adjustment (e.g. ARPA vs ARPU, Sales CAC vs Marketing CAC).
3. `MetricReconciliationRecord`: Financial variance resolution (e.g. ISR Tax withholding).

No past historical state is ever overwritten or deleted. Lineage is maintained via SHA-256 parent hash chains.
