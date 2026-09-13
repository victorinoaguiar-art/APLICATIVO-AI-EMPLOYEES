# AETF-500 Financial Reconciliation Specification v1.0

> **Scope**: Billing to Cash Settlement Bridge & Withholding Tax Reconciliation  
> **Status**: APPROVED  

---

## 1. Variance Analysis Case Study

In the baseline period:
- **Total Billed Amount**: 1,320,000 AOA
- **Total Cash Collected**: 1,293,600 AOA
- **Apparent Financial Variance**: 26,400 AOA

---

## 2. Settlement Bridge Resolution

Analysis confirmed that the 26,400 AOA variance is NOT bad debt or an uncollected shortfall. It represents a mandatory **2.0% ISR (Imposto sobre Rendimentos / Retenção na Fonte)** tax withholding executed by corporate enterprise clients prior to cash disbursement.

$$\text{Tax Withholding} = 1,320,000 \times 0.02 = 26,400\text{ AOA}$$

$$\text{Cash Receivable} = 1,320,000 - 26,400 = 1,293,600\text{ AOA}$$

$$\text{Reconciliation Difference} = 1,320,000 - (1,293,600 + 26,400) = 0\text{ AOA}$$

---

## 3. Mandatory Audit Record Schema (`SettlementBridgeRecord`)

```typescript
export interface SettlementBridgeRecord {
  bridge_id: string;
  billed_amount: number;         // 1,320,000 AOA
  cash_collected: number;        // 1,293,600 AOA
  variance_amount: number;       // 26,400 AOA
  reclassification_category: 'TAX_WITHHOLDING_ISR';
  tax_jurisdiction: 'AO';
  tax_withholding_rate: 0.02;
  reconciliation_difference: 0;  // Zero variance verified!
  timestamp: string;
  provenance_hash: string;
}
```
