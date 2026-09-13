# AETF-500 SaaS Metrics Dictionary v1.1.7 (FROZEN)
## Official VAT Subaccount Tree, PGC Naming & Manifest Sidecar Integrity Final Patch

- **Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.7_FROZEN`
- **Effective Date**: 2026-09-12
- **Jurisdiction**: Angola (Decreto n.º 82/01 PGC & Decreto Presidencial n.º 180/19 IVA)
- **Status Classification**: `FINAL_ACCOUNTING_PRECISION_PATCH`
- **Accounting Internal Remediation**: `COMPLETE`
- **Baseline Status**: `BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING`

### Corrected Accounting Rules Summary
1. **PGC 49 & 49.1 Official Statutory Nomenclature**:
   - Account 49: `Provisões para aplicações de tesouraria`
   - Account 49.1: `Títulos negociáveis`
   - Any prior reference to Account 49.1 as "Adiantamentos de Clientes" or SaaS deferred revenue is invalidated as `PGC_49_1_NAME_ERROR`.
2. **PGC 37 & 37.6 Official Statutory Nomenclature & Policy**:
   - Account 37: `Outros valores a receber e a pagar` (NOT "Acréscimos e Diferimentos")
   - Account 37.6: `Proveitos a repartir por períodos futuros`
   - Statutory subaccounts preserved: `37.6.1` (Prémios de emissão de obrigações), `37.6.2` (Prémios de emissão de títulos de participação), `37.6.3` (Subsídios para investimento).
   - Internal SaaS deferred revenue policy: `SAAS_DEFERRED_REVENUE_POLICY = INTERNALLY_MODELLED_PENDING_ACCOUNTING_POLICY_APPROVAL` with analytic extension metadata.
3. **Official VAT Subaccount Tree (Artigo 22.º, Decreto Presidencial n.º 180/19)**:
   - 9 Top-Level Statutory Families: 34.5.1 to 34.5.9.
   - 25 Official 4th-Level Subaccounts under 34.5.1 through 34.5.8.
   - Subaccount `34.5.9.1` is invalidated as an official statutory subaccount (34.5.9 remains main account `IVA liquidações oficiosas` without statutory 4th level).
4. **VAT Account Mapping & Rate Decoupling**:
   - SaaS revenue operations map to `34.5.3.1 — Operações gerais`.
   - Tax rate (14%) decoupled from account code semantics.
   - Reintroduced `EXT-VAL-WHT-2PCT` (Retenção 2% Imposto Industrial) into External Validation Register.
5. **Manifest & Sidecar Cryptographic Semantics (Policy A)**:
   - Ficheiro Sidecar `.digest` contém textualmente a hash SHA-256 (64 hex characters) do ficheiro manifesto.
   - `DOCUMENT_GENERATION_STATUS = SYSTEM_GENERATED`
   - `INTEGRITY_PROTECTION = SHA256_HASHED`
   - `DIGITAL_SIGNATURE_STATUS = NOT_IMPLEMENTED`
