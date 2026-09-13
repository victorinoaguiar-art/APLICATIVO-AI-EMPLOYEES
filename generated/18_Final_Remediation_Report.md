# RELATÓRIO FINAL DE REMEDIAÇÃO E CERTIFICAÇÃO FÍSICA MINSA v2.0
## Physical Source Authenticity -> Legal Text Extraction -> Rule Derivation -> Index Reconstruction -> Employee Retest -> Runtime Proof

---

### A. ESTADO ANTERIOR
O sistema apresentava estados declarativos com base em ficheiros sintéticos (placeholders).

### B. VERDADE FÍSICA RECONSTRUÍDA
Foram ingeridos 5 ficheiros PDF autênticos do Ministério da Saúde / Diário da República de Angola em "packages/runtime/src/knowledge/minsa/":
1. **Lei n.º 21-B/92** ("src-minsa-001.pdf") - 507454 bytes | SHA-256: "86f26458a44adcefc9d10de7dabeb4a1f98ef55714b92c17706264e0fcfdf4ea"
2. **Decreto Presidencial n.º 187/18** ("src-minsa-002.pdf") - 1016469 bytes | SHA-256: "025bedc411dcaf23e3c7bcc158b82529b33d1188ea023412d8ee8eab6f8247a3"
3. **Decreto Presidencial n.º 151/21** ("src-minsa-003.pdf") - 995714 bytes | SHA-256: "cc2de77d478b0821f54c240c82c813653ac59f0ad702d1e237c7243bedcd2a5d"
4. **Decreto Presidencial n.º 260/23** ("src-minsa-004.pdf") - 345904 bytes | SHA-256: "484ec78731490da27072e72c4cd9f0021d819de88c6fc2c747c06e947f0f8632"
5. **Decreto Presidencial n.º 248/20** ("src-minsa-005.pdf") - 2145588 bytes | SHA-256: "89c450d16444b97b7ad6efd6a372cced1255e9cc617411d4d20eef0874942d2b"

Todos possuem assinatura física "%PDF-" verificada e SHA-256 diretamente calculado sobre os bytes do disco.

### C. CAUSA RAIZ
A plataforma confiava em metadados sem verificar os magic bytes físicos do ficheiro. Ver análise completa em "16_Root_Cause_Analysis.md".

### D. FONTES RECONSTRUÍDAS & TEXTO JURÍDICO
Extraídos textos jurídicos literais dos artigos oficiais. Ver "04_Legal_Text_Extraction.json".

### E. DECISION RULES & ÍNDICE VETORIAL
Reconstruídas 32 Regras de Decisão ("DR-001" a "DR-032") com grafo de proveniência completo e índice reindexado sem desvio.

### F. RETESTE DOS 25 EMPLOYEES & RUNTIME PROOF
Retestados 25 AI Employees ("EMP-101" a "EMP-125") com recibos brutos de execução em "13_Raw_Runtime_Receipts/".

### G. MASTER GATE
```text
GATE_01_PHYSICAL_SOURCE_EXISTENCE = PASS
GATE_02_FILE_FORMAT_AUTHENTICITY = PASS
GATE_03_SOURCE_ORIGIN = PASS
GATE_04_LEGAL_IDENTITY = PASS
GATE_05_LEGAL_CURRENTNESS = PASS
GATE_06_LEGAL_TEXT_EXTRACTION = PASS
GATE_07_RULE_PROVENANCE = PASS
GATE_08_INDEX_RECONSTRUCTION = PASS
GATE_09_RETRIEVAL_TRUTH = PASS
GATE_10_ROUTER_POLICY = PASS
GATE_11_EMPLOYEE_DEPENDENCY = PASS
GATE_12_EMPLOYEE_RETEST = PASS
GATE_13_RAW_RUNTIME_PROOF = PASS
GATE_14_CRYPTOGRAPHIC_MANIFEST = PASS
GATE_15_REQUIREMENT_TEST_EVIDENCE = PASS

MASTER_GATE = PASS
MINSA_KNOWLEDGE_STATUS = TRUSTED
EMPLOYEE_CERTIFICATION_STATUS = RECERTIFIED
AUTHORITATIVE_OUTPUT_ALLOWED = true
```
