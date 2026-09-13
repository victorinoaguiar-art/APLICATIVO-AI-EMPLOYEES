# AETF-500 ARPA / ARPU / LTV Reconciliation Spec v1.1.2

> **Status**: APPROVED & RECONCILED  

---

## 1. Scope Reconciliation Matrix

| Metric Code | Full Metric Name | Numerator | Denominator | Value (AOA) | Entity Scope |
|---|---|---|---|---|---|
| `ARPA` | Average Revenue Per Account | 1,320,000 AOA | 3 Customer Accounts | **440,000 AOA** | Account |
| `ARPE` | Average Revenue Per AI Employee | 1,320,000 AOA | 10 Active Employees | **132,000 AOA** | AI Employee |
| `ARPI` | Average Revenue Per Instance | 1,320,000 AOA | 10 Deployed Instances | **132,000 AOA** | Instance |
| `ARPU` | Average Revenue Per Unit | Undefined | Ambiguous | **BLOCKED** | Unit/User |

---

## 2. LTV Recalculation Methodology

- **ARPA**: 440,000 AOA per account.
- **Monthly Revenue Churn Rate**: 0.51% (derived from 99.49% MRR retention).
- **Contribution Margin %**: 86.89% (weighted average across Alpha/Beta/Gamma cohorts).

$$\text{Revenue LTV} = \frac{\text{ARPA}}{\text{Churn Rate}} = \frac{440,000}{0.0051} = 86,274,509\text{ AOA}$$

$$\text{Contribution Margin LTV} = 86,274,509 \times 0.8689 = 74,963,921\text{ AOA}$$

---

## 3. Scope Compatibility Rules

- Revenue basis and churn rate MUST share the exact same entity scope (Account vs Account, Instance vs Instance).
- Mixing per-account revenue with per-instance churn triggers `LTVScopeCompatibilityGuard` failure.
