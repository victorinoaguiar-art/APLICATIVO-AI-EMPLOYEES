# AETF-500 — Physical Source Authenticity → Legal Text Extraction → Rule Derivation → Index Reconstruction → Employee Retest → Runtime Proof

## 1. Missão

Executar um **patch forense de remediação de raiz** sobre o domínio regulatório MINSA/Healthcare da plataforma AETF-500.

Este patch **NÃO deve corrigir apenas relatórios, manifests, estados, hashes, métricas ou classificações existentes**.

A missão é reconstruir e provar, de forma física, semântica, jurídica, criptográfica e operacional, toda a cadeia:

> **Physical Source Authenticity → Legal Text Extraction → Rule Derivation → Index Reconstruction → Employee Retest → Runtime Proof**

Nenhum novo `PASS`, `CERTIFIED`, `VERIFIED`, `RECERTIFIED`, `CURRENT`, `IN_FORCE` ou equivalente pode ser emitido sem evidência material verificável em cada camada.

---

# 2. Princípio central

Aplicar obrigatoriamente:

```text
NO SOURCE → NO KNOWLEDGE
NO AUTHENTIC SOURCE → NO LEGAL CLAIM
NO LEGAL TEXT → NO RULE
NO RULE PROVENANCE → NO INDEX
NO INDEX EVIDENCE → NO EMPLOYEE CERTIFICATION
NO RUNTIME EXECUTION → NO PASS
```

E ainda:

```text
HASH_VALID ≠ DOCUMENT_AUTHENTIC
FILE_EXISTS ≠ SOURCE_VALID
METADATA ≠ PHYSICAL_TRUTH
INDEX_ENTRY ≠ KNOWLEDGE_PROOF
TEST_RECORD ≠ EXECUTION_PROOF
REPORT_PASS ≠ REAL_PASS
```

O sistema deve adoptar política **FAIL-CLOSED**.

Na ausência de prova suficiente:

```text
STATUS = FAIL | UNPROVEN | QUARANTINED
```

Nunca assumir `PASS`.

---

# 3. Estado inicial obrigatório

Antes de qualquer reconstrução:

```text
DOMAIN = HEALTHCARE_MINSA_ANGOLA
KNOWLEDGE_STATUS = QUARANTINED
REGULATORY_STATUS = UNTRUSTED
EMPLOYEE_CERTIFICATION_STATUS = SUSPENDED
AUTHORITATIVE_OUTPUT_ALLOWED = false
AUTO_PASS_ALLOWED = false
SYNTHETIC_EVIDENCE_ALLOWED = false
PLACEHOLDER_AS_SOURCE_ALLOWED = false
```

Todos os AI Employees dependentes desta biblioteca devem permanecer impedidos de apresentar como juridicamente confirmada qualquer conclusão baseada nas fontes actualmente contestadas.

---

# 4. FASE 1 — Physical Source Authenticity

## 4.1. Inventariar todas as fontes MINSA

Localizar todos os objectos que o sistema considera fonte regulatória MINSA.

Para cada fonte produzir:

```text
source_id
filename
physical_path
storage_origin
repository
original_filename
file_extension
detected_mime_type
declared_mime_type
physical_size_bytes
declared_size_bytes
page_count_physical
page_count_declared
sha256_physical
hash_registered
created_at
modified_at
ingested_at
source_url
source_authority
legal_document_number
legal_document_title
publication_date
effective_date
document_status
```

---

## 4.2. Validar os bytes físicos

Não confiar na extensão do ficheiro.

Executar análise do ficheiro físico:

```text
magic_bytes
file_signature
mime_detection
container_integrity
pdf_header
pdf_eof
page_structure
embedded_text_presence
image_only_detection
encryption_status
corruption_status
```

Para PDF verdadeiro, provar pelo menos:

```text
starts_with = %PDF-
valid_pdf_structure = true
readable_pages > 0
```

Se:

```text
extension = .pdf
```

mas:

```text
physical_type != PDF
```

classificar:

```text
SOURCE_AUTHENTICITY = FAIL
SOURCE_TYPE_MISMATCH = true
```

---

# 5. Proibição absoluta de placeholders

Detectar conteúdo semelhante a:

```text
SOURCE_BYTE_STREAM_...
OFFICIAL_PAYLOAD
PLACEHOLDER
MOCK
SAMPLE
DUMMY
SYNTHETIC
TEST_SOURCE
FAKE_PDF
```

Qualquer ficheiro deste tipo deve ser classificado:

```text
source_type = SYNTHETIC_PLACEHOLDER
legal_authority = NONE
eligible_for_regulatory_use = false
eligible_for_indexing = false
eligible_for_certification = false
```

Os placeholders podem permanecer apenas como artefactos de teste.

Nunca como fonte jurídica.

---

# 6. Reconstrução das fontes oficiais

Para cada diploma alegado, obter ou identificar a versão documental efectivamente usada pela plataforma.

A cadeia de origem deve demonstrar:

```text
Official Authority
        ↓
Publication / Official Repository
        ↓
Original Document
        ↓
Physical File
        ↓
SHA-256
        ↓
Knowledge Registry
```

Preferência de origem:

```text
1. Diário da República / Imprensa Nacional
2. Portal oficial do MINSA
3. Portal oficial do Governo de Angola
4. Base jurídica oficial autorizada
5. Repositório institucional autenticado
```

Fontes secundárias não podem substituir silenciosamente fontes oficiais.

---

# 7. Verificação jurídica documental

Para cada diploma verificar:

```text
document_number
document_type
title
issuing_authority
publication_date
gazette_number
gazette_series
article_structure
annexes
amendments
rectifications
revocations
superseding_legislation
effective_date
current_status
verified_as_of
```

Estados admitidos:

```text
IN_FORCE_VERIFIED
PARTIALLY_IN_FORCE
AMENDED
REVOKED
SUPERSEDED
UNKNOWN
UNVERIFIED
```

Nunca utilizar:

```text
IN_FORCE
```

apenas porque esse valor existe num JSON anterior.

---

# 8. FASE 2 — Legal Text Extraction

Depois de validada fisicamente cada fonte, extrair o conteúdo jurídico real.

Para cada artigo:

```json
{
  "source_id": "",
  "document_number": "",
  "article_number": "",
  "article_title": "",
  "verbatim_text": "",
  "page_number": null,
  "section": "",
  "paragraph": "",
  "subparagraph": "",
  "extraction_method": "",
  "extraction_confidence": 0,
  "source_sha256": "",
  "text_sha256": ""
}
```

---

# 9. Proibição de conteúdo jurídico genérico

Bloquear textos como:

```text
Substantive legal content defining regulatory compliance...
```

ou qualquer frase produzida sem correspondência textual verificável com a fonte.

Para cada extracção executar:

```text
EXTRACTED_TEXT_EXISTS
EXTRACTED_TEXT_MATCHES_SOURCE
ARTICLE_NUMBER_EXISTS
PAGE_REFERENCE_EXISTS
SOURCE_HASH_MATCHES
```

Se qualquer condição essencial falhar:

```text
LEGAL_TEXT_STATUS = FAIL
```

---

# 10. Text Provenance Gate

Criar:

```text
LEGAL_TEXT_PROVENANCE_GATE
```

PASS apenas quando:

```text
physical_source_valid = true
article_exists = true
text_matches_source = true
page_verified = true
source_hash_verified = true
```

---

# 11. FASE 3 — Rule Derivation

Somente depois da validação do texto jurídico reconstruir:

```text
DR-001 ... DR-n
```

Cada Decision Rule deve possuir:

```json
{
  "rule_id": "",
  "source_id": "",
  "document_number": "",
  "article_number": "",
  "paragraph": "",
  "legal_text": "",
  "normative_subject": "",
  "obligation": "",
  "condition": "",
  "exception": "",
  "deadline": "",
  "competent_authority": "",
  "evidence_required": "",
  "sanction_or_consequence": "",
  "machine_rule": "",
  "derivation_explanation": "",
  "review_status": "",
  "reviewer": "",
  "source_sha256": "",
  "legal_text_sha256": "",
  "rule_sha256": ""
}
```

---

# 12. Regra jurídica ≠ frase programática genérica

Não aceitar como derivação suficiente:

```text
REQUIRE(MINSA_CHECK_X == VALID)
```

sem explicar:

```text
WHAT is required?
WHO is obligated?
WHEN?
UNDER WHICH CONDITION?
BASED ON WHICH ARTICLE?
WHAT EXCEPTION EXISTS?
WHAT EVIDENCE PROVES COMPLIANCE?
```

---

# 13. Rule Provenance Graph

Cada regra deve possuir cadeia demonstrável:

```text
DR
 ↓
Article
 ↓
Paragraph
 ↓
Legal Text
 ↓
Physical Page
 ↓
Physical Source
 ↓
SHA-256
 ↓
Official Origin
```

Criar:

```text
RULE_PROVENANCE_GATE
```

PASS apenas quando a cadeia estiver completa.

---

# 14. FASE 4 — Index Reconstruction

Eliminar ou colocar em quarentena entradas construídas a partir das fontes contestadas.

Executar:

```text
VECTOR_INDEX_QUARANTINE
```

seguido de:

```text
CLEAN_REBUILD_FROM_AUTHENTIC_SOURCES_ONLY
```

---

# 15. Estrutura obrigatória dos chunks

Para cada chunk:

```json
{
  "chunk_id": "",
  "source_id": "",
  "document_number": "",
  "article_number": "",
  "page_number": null,
  "text": "",
  "text_sha256": "",
  "source_sha256": "",
  "embedding_model": "",
  "embedding_model_version": "",
  "vector_id": "",
  "namespace": "",
  "created_at": ""
}
```

---

# 16. Provas materiais do índice

Não basta escrever:

```text
INDEX_HASH_MATCH_VERIFIED
```

Produzir evidência verificável de:

```text
source → chunk
chunk → text
text → hash
hash → embedding request
embedding request → vector
vector → namespace
namespace → retrieval
retrieval → original source
```

---

# 17. Retrieval Truth Test

Executar consultas reais.

Para cada consulta armazenar:

```text
query
timestamp
employee_id
retrieved_vector_ids
retrieved_chunk_ids
retrieved_source_ids
scores
legal_article
source_path
source_hash
router_decision
fallback_attempted
final_answer
citation_generated
```

O teste deve provar que a resposta chegou à fonte correcta.

---

# 18. FASE 5 — Knowledge Source Routing

O sistema deve distinguir claramente:

```text
REGULATORY_KNOWLEDGE
CLIENT_INTERNAL_KNOWLEDGE
USER_DOCUMENTS
WORKING_FILES
TEMP_FILES
LOCAL_FILES
CLOUD_FILES
TEST_FIXTURES
```

Nunca tratar estes domínios como equivalentes.

---

# 19. Política MINSA

Para consultas regulatórias MINSA:

```text
PRIMARY_SOURCE =
REGULATORY_KNOWLEDGE_REGISTRY
```

OneDrive, Google Drive, disco local ou documentos de cliente não devem ser utilizados automaticamente como fonte normativa oficial.

Podem ser utilizados apenas quando a respectiva política autorizar explicitamente.

---

# 20. Bloqueio de procura indevida

Testar especificamente:

```text
C:\
OneDrive
Desktop
Downloads
Documents
Google Drive
network shares
temporary directories
```

quando não autorizados.

O teste deve registar individualmente:

```text
path
lookup_requested
policy_decision
lookup_executed
lookup_blocked
reason
timestamp
trace_id
```

---

# 21. FASE 6 — Employee Knowledge Dependency Reconstruction

Para cada AI Employee afectado gerar:

```text
employee_id
employee_role
required_domain
required_sources[]
required_rules[]
required_chunks[]
knowledge_registry_ids[]
permitted_tools[]
forbidden_sources[]
last_certification
certification_status
```

Validar:

```text
Employee
 → Rule
 → Article
 → Source
 → Physical document
 → Official origin
```

---

# 22. Detectar referências órfãs

Identificar:

```text
employee_without_rule
rule_without_source
chunk_without_article
vector_without_chunk
test_without_employee
execution_without_trace
trace_without_source
source_without_physical_file
```

Qualquer referência órfã:

```text
STATUS = FAIL
```

---

# 23. FASE 7 — Employee Retest

Invalidar os resultados anteriores afectados pela contaminação da biblioteca.

Classificação:

```text
PREVIOUS_RESULT = INVALIDATED_BY_SOURCE_FAILURE
```

Não apagar a evidência histórica.

Preservá-la para auditoria.

---

# 24. Reteste integral dos Employees afectados

Cada Employee deve executar testes independentes com:

```text
TEST_ID
EMPLOYEE_ID
TEST_CASE
INPUT
EXPECTED_SOURCE
EXPECTED_RULE
EXPECTED_ARTICLE
EXECUTION_ID
TRACE_ID
ACTUAL_SOURCE
ACTUAL_RULE
ACTUAL_ARTICLE
OUTPUT
PASS_FAIL
START_TIMESTAMP
END_TIMESTAMP
```

---

# 25. Um Employee não é considerado retestado porque aparece num registo

Aplicar:

```text
RETESTED = true
```

somente quando existir:

```text
execution_id
AND
runtime_trace
AND
employee_match
AND
source_match
AND
rule_match
AND
timestamp_match
```

---

# 26. Exact ID Matching

Proibir normalização silenciosa de IDs.

Exemplo:

```text
EXEC-001 ≠ EXEC-1
```

salvo se existir regra oficial de canonicalização registada.

Validar:

```text
employee_execution_id
runtime_execution_id
test_execution_id
trace_execution_id
```

por igualdade exacta ou transformação explicitamente documentada.

---

# 27. FASE 8 — Runtime Proof

Cada execução certificável deve gerar um **Raw Runtime Receipt**.

Estrutura mínima:

```json
{
  "execution_id": "",
  "employee_id": "",
  "test_id": "",
  "started_at": "",
  "completed_at": "",
  "input": "",
  "router_events": [],
  "retrieval_events": [],
  "tool_calls": [],
  "sources_consulted": [],
  "chunks_retrieved": [],
  "rules_applied": [],
  "final_output": "",
  "citations": [],
  "policy_events": [],
  "errors": [],
  "final_status": ""
}
```

---

# 28. Não aceitar resumo como Raw Trace

Artefactos do tipo:

```text
onedrive_fallback_events = 0
```

sem eventos brutos associados devem ser classificados:

```text
SUMMARY_CLAIM
```

e nunca:

```text
RAW_RUNTIME_PROOF
```

---

# 29. FASE 9 — Cryptographic Evidence

Calcular hashes directamente a partir dos bytes físicos.

Para cada artefacto:

```text
filename
physical_path
size_bytes
mime_type
sha256
generated_at
producer
```

---

# 30. Manifesto físico

Gerar:

```text
AETF500_MINSA_PHYSICAL_EVIDENCE_MANIFEST_v2.json
```

O manifesto deve incluir:

```text
official sources
legal extracts
decision rules
chunks
index snapshots
employee mappings
test definitions
runtime traces
router traces
certification records
```

---

# 31. Evitar self-hash ambíguo

Se o manifesto possuir o próprio hash, definir explicitamente:

```text
hash_scope
canonicalization_method
excluded_field
serialization_method
encoding
```

ou manter o self-hash fora do objecto hashado.

Nunca publicar um `manifest_sha256` impossível de reproduzir.

---

# 32. FASE 10 — Requirement → Test → Evidence Matrix

Criar matriz obrigatória:

| Requirement | Test | Evidence | Physical Artifact | Hash | Status |
|---|---|---|---|---|---|
| Fonte é PDF real | MIME + signature test | Physical file | source.pdf | SHA-256 | PASS/FAIL |
| Artigo existe | Article extraction | Text + page | article.json | SHA-256 | PASS/FAIL |
| Rule deriva da lei | Rule provenance | DR record | rule.json | SHA-256 | PASS/FAIL |
| Índice contém texto real | Retrieval test | Chunk/vector trace | index.json | SHA-256 | PASS/FAIL |
| Employee usa fonte correcta | Runtime test | Raw trace | trace.json | SHA-256 | PASS/FAIL |
| OneDrive não foi usado | Router test | Router event log | router.json | SHA-256 | PASS/FAIL |

Nenhum requisito crítico pode ficar apenas como afirmação narrativa.

---

# 33. Master Gates

Implementar, no mínimo:

```text
GATE_01_PHYSICAL_SOURCE_EXISTENCE
GATE_02_FILE_FORMAT_AUTHENTICITY
GATE_03_SOURCE_ORIGIN
GATE_04_LEGAL_IDENTITY
GATE_05_LEGAL_CURRENTNESS
GATE_06_LEGAL_TEXT_EXTRACTION
GATE_07_RULE_PROVENANCE
GATE_08_INDEX_RECONSTRUCTION
GATE_09_RETRIEVAL_TRUTH
GATE_10_ROUTER_POLICY
GATE_11_EMPLOYEE_DEPENDENCY
GATE_12_EMPLOYEE_RETEST
GATE_13_RAW_RUNTIME_PROOF
GATE_14_CRYPTOGRAPHIC_MANIFEST
GATE_15_REQUIREMENT_TEST_EVIDENCE
```

---

# 34. Regra de Master PASS

O `MASTER_GATE` pode ser:

```text
PASS
```

somente se:

```text
ALL_CRITICAL_GATES == PASS
```

Caso contrário:

```text
MASTER_GATE = FAIL
```

ou:

```text
MASTER_GATE = UNPROVEN
```

Não utilizar:

```text
PASS_WITH_EXCEPTION
```

para esconder falha em fonte, conteúdo jurídico, proveniência, indexação ou execução.

---

# 35. Critérios mínimos de aprovação

Antes de novo `PASS`, demonstrar:

```text
100% das fontes críticas fisicamente válidas
100% dos diplomas identificados
100% dos artigos utilizados existentes
100% dos DR com provenance completo
0 placeholders usados como fonte
0 synthetic legal content
0 source metadata mismatches
0 orphan references
100% dos Employees afectados retestados
100% dos retestes com runtime trace
100% dos execution IDs reconciliados
100% dos traces ligados às fontes correctas
0 unauthorized filesystem fallback
100% do manifesto fisicamente reproduzível
```

---

# 36. Proibição de fabricação de evidência

Se determinado elemento não puder ser obtido ou comprovado:

NÃO:

```text
inventar PDF
inventar artigo
inventar página
inventar source URL
inventar hash
inventar execução
inventar trace
inventar Employee test
inventar vector
inventar resultado PASS
```

Registar:

```text
NOT_AVAILABLE
NOT_FOUND
UNVERIFIED
UNPROVEN
```

e manter o Gate fechado.

---

# 37. Root Cause Analysis

Produzir análise específica sobre como a plataforma conseguiu anteriormente gerar um estado aparentemente consistente baseado em fontes inválidas.

Investigar:

```text
placeholder ingestion
metadata trust
extension trust
synthetic test fixtures
hashing pipeline
source registry
rule generation
indexing pipeline
employee mapping
testing framework
certification engine
report generator
```

Responder:

> Como foi possível um ficheiro não jurídico produzir hashes válidos, regras, índice, testes e certificação?

---

# 38. Propagation Analysis

Determinar se a mesma vulnerabilidade existe fora do MINSA.

Pesquisar nos outros domínios da AETF-500:

```text
AGT
BNA
MAPTSS
INADEC
MINFIN
ANPG
IRSEA
ARSEG
MINSA
customs
labour
accounting
banking
insurance
municipal
compliance
```

Detectar padrões de:

```text
fake PDF
placeholder bytes
metadata/physical mismatch
synthetic legal text
generic decision rules
unsupported in_force status
fake runtime proof
```

Não alterar automaticamente os outros domínios.

Gerar lista de exposição e prioridade.

---

# 39. Deliverables obrigatórios

Produzir:

```text
01_Physical_Source_Audit.json
02_Source_Authenticity_Matrix.csv
03_Legal_Source_Register.json
04_Legal_Text_Extraction.json
05_Article_Provenance_Matrix.csv
06_Decision_Rule_Reconstruction.json
07_Rule_Provenance_Graph.json
08_Vector_Index_Rebuild.json
09_Retrieval_Truth_Tests.json
10_Router_Raw_Trace.json
11_Employee_Knowledge_Dependency_Map.json
12_Employee_Retest_Results.json
13_Raw_Runtime_Receipts/
14_Cryptographic_Evidence_Manifest.json
15_Requirement_Test_Evidence_Matrix.csv
16_Root_Cause_Analysis.md
17_Cross_Domain_Exposure_Report.md
18_Final_Remediation_Report.md
```

---

# 40. Estrutura do relatório final

O relatório deve apresentar:

## A. Estado anterior

O que o sistema afirmava possuir.

## B. Verdade física

O que realmente existia nos ficheiros.

## C. Causa raiz

Porque a discrepância foi aceite.

## D. Fontes reconstruídas

Documentos oficialmente validados.

## E. Texto jurídico

Artigos efectivamente extraídos.

## F. Decision Rules

Regras reconstruídas e rastreáveis.

## G. Índice

Chunks e vectores reconstruídos.

## H. Employee Mapping

Dependências reconciliadas.

## I. Retestes

Execuções reais.

## J. Runtime Evidence

Traces e receipts.

## K. Criptografia

Hashes reproduzíveis.

## L. Exposição transversal

Outros domínios potencialmente afectados.

## M. Master Gate

Resultado final.

---

# 41. Regra final de verdade

A plataforma deve responder à seguinte cadeia sem depender de declarações produzidas por si própria:

> **Qual foi a fonte física exacta?**

> **Quem publicou essa fonte?**

> **Que bytes correspondem ao documento?**

> **Qual é o SHA-256?**

> **Em que página está a norma?**

> **Qual é o texto exacto?**

> **Como o texto originou a regra?**

> **Como a regra entrou no índice?**

> **Qual Employee recuperou essa regra?**

> **Qual execução real utilizou essa fonte?**

> **Qual trace prova isso?**

> **Qual resultado foi produzido?**

> **A evidência pode ser reproduzida independentemente?**

Se qualquer elo não puder ser respondido:

```text
CHAIN_OF_EVIDENCE = BROKEN
```

e:

```text
PASS = PROHIBITED
```

---

# 42. Resultado esperado

O objectivo não é produzir um relatório que diga que o sistema está correcto.

O objectivo é tornar impossível ao sistema declarar-se correcto quando a realidade física, jurídica ou operacional não sustenta essa conclusão.

A sequência final obrigatória é:

```text
AUTHENTIC PHYSICAL SOURCE
        ↓
VERIFIED LEGAL IDENTITY
        ↓
VERIFIED CURRENTNESS
        ↓
REAL LEGAL TEXT
        ↓
TRACEABLE DECISION RULE
        ↓
CLEAN KNOWLEDGE INDEX
        ↓
CORRECT EMPLOYEE DEPENDENCY
        ↓
REAL RETEST
        ↓
RAW RUNTIME TRACE
        ↓
CRYPTOGRAPHIC EVIDENCE
        ↓
INDEPENDENTLY REPRODUCIBLE PASS
```

Somente após essa cadeia estar integralmente provada:

```text
MINSA_KNOWLEDGE_STATUS = TRUSTED
EMPLOYEE_CERTIFICATION_STATUS = RECERTIFIED
AUTHORITATIVE_OUTPUT_ALLOWED = true
MASTER_GATE = PASS
```

Até lá:

```text
MINSA_KNOWLEDGE_STATUS = QUARANTINED
MASTER_GATE != PASS
```