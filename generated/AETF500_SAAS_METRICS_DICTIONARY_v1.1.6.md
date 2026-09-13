# AETF-500 SaaS Metrics Dictionary v1.1.6 — Frozen Specification

## Document Control
- **Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.6_FROZEN`
- **Previous Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.5_FROZEN` (SUPERSEDED)
- **Status**: `FINAL_ACCOUNTING_INTEGRITY_PATCH`
- **Accounting Internal Remediation**: `COMPLETE`
- **Baseline Final Status**: `BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING`
- **Effective Date**: 2026-09-12
- **Document Generation Status**: `SYSTEM_GENERATED`
- **Integrity Protection**: `SHA256_HASHED`
- **Digital Signature Status**: `NOT_IMPLEMENTED`

---

## 1. Executive Summary
This document freezes specification v1.1.6 for the AI Employee Platform (AETF-500).
It addresses three core material corrections:
1. **Deferred Revenue**: Reconciles Account `37.6 — Proveitos a repartir por períodos futuros` (Decreto n.º 82/01) with analytic dimensions and invalidates Account `49.1` for SaaS deferred revenue (`ERROR_ID = DEFERRED_REVENUE_ACCOUNT_49_1`).
2. **VAT Semantics**: Invalidates `34.5.9 — IVA Retenções na Fonte` (`ERROR_ID = VAT_ACCOUNT_34_5_9_SEMANTIC_ERROR`) and restores official PGC name `34.5.9 — IVA liquidações oficiosas` (Decreto Presidencial n.º 180/19) with 12 official subaccount desdobramentos.
3. **Cryptographic Integrity**: Rejects empty SHA-256 digests (`e3b0c442...`), ensures all file digests are calculated on non-zero binary bytes, and explicitly removes digital signature claims.

---

## 2. Core Accounting Corrections

### 2.1 Correction 1 — Deferred Revenue (PGC Account 37.6 vs 49.1)
- **Invalidated Account**: `49.1` (Adiantamentos de Clientes) is restricted to customer prepayments/deposit liabilities, NOT SaaS deferred revenue.
- **Reconciled Account**: `37.6 — Proveitos a repartir por períodos futuros` (Class 37 - Acréscimos e Diferimentos, Decreto n.º 82/01).
- **Analytic Dimensions**: Unchanged PGC account code `37.6` enriched with `AnalyticDimensionsV116` (`contract_id`, `subscription_id`, `customer_id`, `product_line_code`, `market_segment`, `tax_regime`).

### 2.2 Correction 2 — VAT Semantics & Subaccount Structure
- **Top-level 34.5.9 Correction**: `34.5.9` official name is **`IVA liquidações oficiosas`**.
- **12 Official Subaccounts**: Registered `34.5.1.1` to `34.5.9.1`.
- **Decoupled Tax Rates**: VAT rate (14%) decoupled from account `34.5.3`.
- **Reintroduced Withholding Item**: Reintroduced `EXT-VAL-WHT-2PCT` for 2% Industrial Tax withholding validation.

### 2.3 Correction 3 — Cryptographic Integrity & Signature Semantics
- **Empty Digest Prohibition**: Empty SHA-256 hash (`e3b0c442...`) is strictly rejected for files with `size_bytes > 0`.
- **Real File Byte Hashes**: Digests calculated over actual bytes.
- **Digital Signature Claims**: Explicitly set to `NOT_IMPLEMENTED`. Hashes provide tamper evidence (`SHA256_HASHED`), not digital signatures.

---

## 3. Final Integrity Gate Status
```json
{
  "gate_name": "SAAS_METRICS_DICTIONARY_v1_1_6_FINAL_ACCOUNTING_INTEGRITY_GATE",
  "status": "PASS",
  "passed": true,
  "internal_accounting_defects_remaining": 0,
  "final_accounting_status": "ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE",
  "final_baseline_status": "BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING"
}
```
