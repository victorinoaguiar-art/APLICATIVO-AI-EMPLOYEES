# AETF-500 Accounting Framework & Banking Semantics Specification v1.1.2

> **Scope**: Statutory PGC Angola Framework & Banking Role Semantics  
> **Status**: APPROVED & VALIDATED  

---

## 1. Accounting Framework Standard (`PGC_ANGOLA`)

- **Statutory Basis**: Plano Geral de Contabilidade de Angola (Decreto n.º 82/01).
- **Prohibition**: Hybrid ambiguous terms like `IFRS 15 / PGC Angola` are strictly prohibited.
- **Revenue Recognition**: Ratable monthly deferral over contract subscription period (Classe 7 - Vendas e Prestação de Serviços).
- **Invariance**: $\text{CASH\_COLLECTED} \neq \text{REVENUE\_RECOGNIZED}$ and $\text{INVOICE\_AMOUNT} \neq \text{REVENUE\_RECOGNIZED}$.

---

## 2. Banking Role Semantics (`BankingRoleSemanticGuard`)

- **Central Bank Context**: BNA (Banco Nacional de Angola) is the Regulatory and Supervisory Authority.
- **Settlement Bank**: Commercial bank executing financial settlement (e.g., Banco BAI SA).
- **Guard Enforcement**: `is_central_bank_settlement_bank = false`. Setting BNA as a commercial settlement bank without specific evidence is blocked as a `SEMANTIC_VIOLATION`.
