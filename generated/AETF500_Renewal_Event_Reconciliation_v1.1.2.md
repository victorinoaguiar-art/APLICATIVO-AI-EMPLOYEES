# AETF-500 Renewal Event Reconciliation Specification v1.1.2

> **Scope**: Formal Contract Period Continuity & Event Classification  
> **Status**: APPROVED  

---

## 1. Renewal Event Classification Taxonomy

- **`TRUE_RENEWAL`**: Formal contract renewal with continuous service period.
- **`EARLY_RENEWAL`**: Contract renewed prior to expiration (`days_before_expiry > 0`).
- **`CONTRACT_EXTENSION`**: Service period extended without plan modification.
- **`PLAN_UPGRADE`**: Contract renewed with higher tier plan.
- **`PLAN_DOWNGRADE`**: Contract renewed with lower tier plan.
- **`EXPANSION`**: Account expansion (NOT a renewal).

---

## 2. Rule Enforcement

`RENEWAL_COMPLETED = true` MUST only be set if formal contract period continuity is established with linked original and new contract IDs (`original_contract_id` and `new_contract_id`).
