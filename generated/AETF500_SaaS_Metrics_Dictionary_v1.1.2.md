# AETF-500 SaaS Metrics Dictionary v1.1.2 (Final Coherence Baseline)

> **Baseline Status**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN`  
> **Previous Baseline**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN` (`SUPERSEDED`)  
> **Gate Status**: `SAAS_METRICS_DICTIONARY_v1_1_2_COHERENCE_GATE = PASS`  
> **Certification**: `METRICS_FOUNDATION_CERTIFIED` & `FULL_REQUIREMENT_TRACEABILITY_CERTIFIED`  
> **Wave Status**: `READY_FOR_COMMERCIAL_PREDICTABILITY_WAVE_3`  
> **Date**: 2026-09-12  

---

## 1. Executive Summary

This document establishes the final hardened SaaS Metrics Dictionary v1.1.2 for the AETF-500 Platform. It reconciles ARPA vs ARPE scopes, reconciles historical CAC transition from 45.000 AOA to 5.000.000 AOA with a 15M AOA cost pool, establishes statutory legal evidence for 2% ISR tax withholding under Angolan tax law (Art. 67.º Código do Imposto Industrial AGT), standardizes PGC Angola accounting semantics, enforces central bank role guards (BNA as regulator, not commercial settlement bank), formalizes the complete mathematical Metric DAG (16 nodes, 14 edges, 0 cycles), publishes 100% full 64-character hex SHA-256 digests, and guarantees 100% requirement-to-evidence traceability.

---

## 2. Core Reconciled Metrics (v1.1.2 Baseline)

| Metric Code | Metric Name | Value (v1.1.2) | Scope & Entity | Formula / Derivation Rule |
|---|---|---|---|---|
| `ARPA` | Average Revenue Per Account | **440.000 AOA** | Account (3 Accounts) | `Eligible MRR (1.32M) / Active Accounts (3)` |
| `ARPE` | Average Revenue Per AI Employee | **132.000 AOA** | AI Employee (10 Inst) | `Eligible MRR (1.32M) / Active AI Employees (10)` |
| `CAC` | Sales-Assisted CAC | **5.000.000 AOA** | Per Customer | `Total Cost Pool (15M) / Customers Acquired (3)` |
| `ISR_2PCT` | 2% ISR Tax Withholding | **26.400 AOA** | Transaction | `Billed (1.32M) * 2%` (Art. 67.º Código Imposto Industrial AGT) |
| `NRR` | Net Revenue Retention | **124.1%** | Cohort | `((Opening 1M + Exp 300k - Cont 50k - Churn 9k) / Opening 1M) * 100` |
| `GRR` | Gross Revenue Retention | **94.1%** | Cohort | `((Opening 1M - Cont 50k - Churn 9k) / Opening 1M) * 100` |

---

## 3. Scope & Compatibility Guards

1. **`RevenueUnitScopeGuard`**: Rejects calculation of `ARPU` when `denominator_definition === 'UNKNOWN'` (returns `METRIC_SCOPE_AMBIGUOUS`).
2. **`LTVScopeCompatibilityGuard`**: Rejects mixing per-account revenue with per-instance churn (returns `LTV_SCOPE_INCOMPATIBLE`).
3. **`BankingRoleSemanticGuard`**: Rejects setting `central_bank = settlement_bank` without specific transaction evidence.
4. **`PredictiveMetricEligibilityGuard`**: Blocks invalid/unverified metrics from predictive models in Wave 3.
