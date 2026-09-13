# AETF-500 SaaS Metrics Dictionary v1.1.8 (FROZEN)
## Official VAT Nomenclature Source-Lock & Final Evidence Closure Micro-Patch (Addendum 2)

- **Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN`
- **Addendum ID**: `AETF500_v1.1.8_EVIDENCE_CLOSURE_ADDENDUM_2`
- **Effective Date**: 2026-09-12
- **Jurisdiction**: Angola (Decreto n.º 82/01 PGC & Decreto Presidencial n.º 180/19 Regulamento do IVA, Art. 22.º)
- **Execution Classification**: `FINAL_EVIDENCE_CORRECTION_MICRO_PATCH`
- **Baseline Internal Status**: `INTERNALLY_FROZEN_AND_AUDITED`
- **VAT Official Account Tree Status**: `INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE`
- **Accounting Internal Remediation**: `COMPLETE`
- **Baseline Status**: `BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING`

### Key Addendum 2 Evidence Rules
1. **Real Source Hashes (SHA-256 sobre bytes reais dos PDFs)**:
   - Decreto n.º 82/01 (PGC): `4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702` (5.188.378 bytes)
   - Decreto Presidencial n.º 180/19 (IVA / Art. 22.º): `131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c` (1.571.244 bytes)
2. **Sidecar Own File SHA-256**:
   - `sidecar.content_value == manifest.sha256`
   - `sidecar.file_sha256 == SHA256(real_sidecar_bytes)`
3. **Artifact Layering & Acyclic Evidence DAG**:
   - Layer 1: Primary Baseline Artifacts (11)
   - Layer 2: Evidence Metadata Files (4)
   - Layer 3: Integrity Metadata Files (2)
   - Zero self-referential cryptographic hashing (`SELF_REFERENTIAL_HASHES_FOUND = 0`).
4. **Transparent Certification Language**:
   > *"A baseline AETF500_SAAS_METRICS_DICTIONARY_v1.1.8 encontra-se congelada internamente e auditada contra as fontes oficiais fornecidas. A integridade dos artefactos é verificável através de SHA-256. Permanecem pendentes as validações contabilísticas, fiscais, regulatórias e institucionais externas identificadas no External Validation Register, que não são substituídas pela validação interna automatizada."*
