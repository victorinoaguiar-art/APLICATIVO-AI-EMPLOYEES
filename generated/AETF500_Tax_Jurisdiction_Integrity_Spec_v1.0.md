# AETF-500 Tax Jurisdiction Integrity Specification v1.0

> **Jurisdiction Focus**: Republic of Angola (`AO`)  
> **Status**: APPROVED  

---

## 1. Statutory Context (Angola - Jurisdiction Code `AO`)

Under the tax law of the Republic of Angola (AGT - Administração Geral Tributária), commercial transactions, B2B services, and SaaS billing are governed by the following valid statutory taxes:

1. **IVA** (Imposto sobre o Valor Acrescentado - 14% / Standard Rate)
2. **IRT** (Imposto sobre os Rendimentos do Trabalho)
3. **IS** (Imposto de Selo - Stamp Duty)
4. **II** (Imposto Industrial - Corporate Income Tax / 6.5% withholding on B2B service invoices / 2% ISR)
5. **IP** (Imposto Predial - Property Tax)

---

## 2. Foreign Tax Code Invalidation Rules

The following foreign tax codes originating from Brazilian tax legislation (RFB) are strictly prohibited and MUST NOT appear in any Angolan tax invoice or metric calculation:

- ❌ `ISS` (Imposto Sobre Serviços)
- ❌ `ICMS` (Imposto sobre Circulação de Mercadorias e Serviços)
- ❌ `PIS` (Programa de Integração Social)
- ❌ `COFINS` (Contribuição para o Financiamento da Seguridade Social)

---

## 3. Enforcement Engine Response

When `TaxJurisdictionGuard.validateTaxJurisdiction('AO', taxCode)` encounters a prohibited tax code:
1. Rejects payload immediately.
2. Throws `INVALID_TAX_JURISDICTION_CODE`.
3. Appends violation to systemic security log.
