# AETF-500 Metric Assurance Guide v1.1.1

> **Status**: APPROVED & ACTIVE  
> **Target Audience**: Financial Controllers, System Auditors, Operations Lead  

---

## 1. Assurance Checklist

| Check ID | Verification Rule | Target Threshold | Validation Method |
|---|---|---|---|
| `CHK-111-01` | NRR Formula Integrity | Exactly `124.1%` | Unit Test `NRR verification` |
| `CHK-111-02` | GRR Formula Integrity | Exactly `94.1%` | Unit Test `GRR verification` |
| `CHK-111-03` | Settlement Bridge Difference | Exactly `0 AOA` | Automated Reconciliation |
| `CHK-111-04` | Tax Code Jurisdiction Guard | Reject `ISS/ICMS/PIS/COFINS` in `AO` | Jurisdiction Guard Enforcement |
| `CHK-111-05` | Temporal Maturity Strictness | Reject `temporal_maturity === 'PROJECTED'` | 4D Dimension Rule Engine |
| `CHK-111-06` | SHA-256 Format Integrity | `^[a-fA-F0-9]{64}$` | Cryptographic Digest Guard |

---

## 2. Audit Execution Commands

To execute automated metric assurance suite:

```bash
# Run unit tests
npm test --workspace=@ai-employee/runtime

# Run full project build
npm run build
```
