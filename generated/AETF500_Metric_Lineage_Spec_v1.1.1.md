# AETF-500 Metric Lineage Specification v1.1.1

> **Status**: APPROVED  
> **Architecture**: Non-Destructive Audit Trail & SHA-256 Provenance Chaining  

---

## 1. Lineage Data Architecture

Metric updates, corrections, and reclassifications strictly follow an **append-only model**.

```
[Genesis Baseline v1.1 Snapshot] 
             │ (SHA-256 Digest)
             ▼
[MetricCorrectionRecord: NRR -> 124.1%, GRR -> 94.1%] 
             │ (Parent Hash Chain)
             ▼
[MetricReconciliationRecord: ISR Withholding 26,400 AOA] 
             │ (Parent Hash Chain)
             ▼
[Frozen Baseline v1.1.1 Snapshot]
```

---

## 2. Lineage Audit Record Types

### A. `MetricCorrectionRecord`
Logs changes to metric definitions or mathematical formula errors.

### B. `MetricReclassificationRecord`
Logs changes in scope, segment, or metric breakdown (e.g. ARPA vs ARPU, CAC Sales vs CAC Marketing).

### C. `MetricReconciliationRecord`
Logs reconciliation of billing vs cash variances, withholding taxes, or bank settlement differences.

---

## 3. Cryptographic Enforcements
- SHA-256 hashes must match `^[a-fA-F0-9]{64}$`.
- Placeholder hash strings (e.g., all zeroes or repeated test characters) trigger `HASH_PLACEHOLDER_DETECTION`.
- Root genesis records default to `SHA256_EMPTY` (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).
