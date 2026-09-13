# AETF-500 CAC Reconciliation Specification v1.1.2

> **Scope**: CAC Reclassification (45.000 AOA Blended -> 5.000.000 AOA Sales-Assisted CAC)  
> **Status**: APPROVED  

---

## 1. Cost Pool Breakdown (`CACCostBridge`)

| Cost Category | Included in CAC? | Pool Amount (AOA) | Notes |
|---|---|---|---|
| Marketing Expenses | YES | 2,000,000 AOA | Digital campaigns & events |
| Sales Personnel Salaries | YES | 8,000,000 AOA | Enterprise sales reps |
| Sales Tools & Software | YES | 1,500,000 AOA | CRM & prospecting tools |
| Partner Commissions | YES | 1,500,000 AOA | Channel partner incentives |
| Qualified Acquisition Cost | YES | 2,000,000 AOA | Legal & contract onboarding |
| **Total CAC Cost Pool** | **YES** | **15,000,000 AOA** | **Eligible Cost Pool** |
| Customer Success Cost | EXCLUDED | - | Post-sale retention cost |
| Customer Support Cost | EXCLUDED | - | Post-sale support cost |

$$\text{Sales-Assisted CAC} = \frac{\text{Total Cost Pool}}{\text{Customers Acquired}} = \frac{15,000,000}{3} = \mathbf{5,000,000\text{ AOA per Customer}}$$

---

## 2. Anomaly Alerting

The transition ratio ($\frac{5,000,000}{45,000} = 111.11\times$) exceeds the 10x threshold, triggering `CAC_MATERIAL_RECLASSIFICATION_ALERT`. This is formally logged and reconciled via `CACReconciliationRecordV112`.
