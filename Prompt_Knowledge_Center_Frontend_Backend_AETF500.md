# PROMPT MESTRE DE IMPLEMENTAÇÃO
## Knowledge Center Frontend, Knowledge Intake, Validation, Provenance, Mapping & Runtime Publication Engine
### AETF-500 — Gestão de Conhecimento pelo Frontend com Processamento, Governação e Execução Controlada no Backend

---

# 0. OBJECTIVO

Implementar na plataforma AETF-500 um **Knowledge Center completo**, orientado ao utilizador, para permitir que clientes, administradores e equipas autorizadas adicionem, validem, organizem e publiquem conhecimento directamente pelo frontend do aplicativo, sem editar código, mexer manualmente em pastas do servidor ou depender de um programador para cada novo manual, política, template ou fonte.

O princípio central é:

```text
FRONTEND = entrada, gestão e controlo pelo utilizador
BACKEND = validação, processamento, proveniência, armazenamento, publicação e runtime
```

O utilizador deve poder carregar:

- manuais;
- procedimentos;
- políticas internas;
- templates;
- legislação;
- regulamentos;
- normas;
- documentação de fornecedores;
- documentação de software;
- instruções operacionais;
- exemplos aprovados;
- documentos de treino;
- fontes oficiais;
- materiais específicos da empresa;
- ficheiros de apoio às competências;
- documentos de referência;
- versões actualizadas de fontes existentes.

O backend deve transformar essas entradas em conhecimento utilizável pelos AI Employees, com:

- validação;
- classificação;
- hashing;
- proveniência;
- versionamento;
- extracção;
- chunking;
- Knowledge Objects;
- mapeamento a competências;
- mapeamento a tasks;
- mapeamento a Employees;
- controlo por tenant;
- testes;
- retestes;
- publicação em runtime;
- revogação;
- auditoria.

---

# 1. PRINCÍPIO FUNDAMENTAL

Não considerar que um ficheiro foi “adicionado ao conhecimento” apenas porque foi feito upload.

A cadeia obrigatória deve ser:

```text
UPLOAD
↓
VALIDATION
↓
SOURCE REGISTRATION
↓
HASH
↓
CLASSIFICATION
↓
EXTRACTION
↓
CHUNKING
↓
KNOWLEDGE OBJECTS
↓
COMPETENCY MAPPING
↓
EMPLOYEE MAPPING
↓
TASK MAPPING
↓
REVIEW / TEST
↓
PUBLICATION
↓
RUNTIME AVAILABILITY
```

---

# 2. NÃO CRIAR 500 BIBLIOTECAS ISOLADAS

Evitar:

```text
EMP-001/
EMP-002/
EMP-003/
...
EMP-500/
```

com ficheiros duplicados.

Adoptar:

```text
CENTRAL KNOWLEDGE LIBRARY
↓
KNOWLEDGE OBJECTS
↓
COMPETENCIES
↓
TASK TYPES
↓
EMPLOYEES
```

Uma mesma fonte pode servir:

```text
1 SOURCE
→ 1..N KNOWLEDGE OBJECTS
→ 1..N COMPETENCIES
→ 1..N TASK TYPES
→ 1..N EMPLOYEES
```

---

# 3. TIPOS DE CONHECIMENTO

Suportar pelo menos:

```text
GLOBAL_KNOWLEDGE
JURISDICTION_KNOWLEDGE
REGULATORY_KNOWLEDGE
SECTOR_KNOWLEDGE
VENDOR_KNOWLEDGE
PROFESSIONAL_KNOWLEDGE
CLIENT_PRIVATE_KNOWLEDGE
INTERNAL_AUTHORED_KNOWLEDGE
TEMPLATE_KNOWLEDGE
PROCEDURE_KNOWLEDGE
EXAMPLE_KNOWLEDGE
```

---

# 4. MODOS DE CONHECIMENTO

Integrar com os modos já definidos:

```text
MODEL_NATIVE_SUFFICIENT
MODEL_NATIVE_PLUS_CURATED
SOURCE_CRITICAL
CLIENT_SOURCE_REQUIRED
UNSUPPORTED
```

---

# 5. SOURCE CRITICALITY

Cada source deve ter:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Regra:

```text
HIGH / CRITICAL
→ proveniência e validade obrigatórias
```

---

# 6. KNOWLEDGE CENTER NO FRONTEND

Criar no menu principal:

# Knowledge Center

Subsecções:

```text
Biblioteca
Adicionar Conhecimento
Fontes
Knowledge Objects
Competências
Employees Afectados
Tasks Afectadas
Lacunas
Versões
Revisões
Publicações
Proveniência
Auditoria
```

---

# 7. BOTÕES PRINCIPAIS

Disponibilizar:

```text
[ Adicionar Conhecimento ]
[ Carregar Ficheiro ]
[ Adicionar URL / Fonte ]
[ Adicionar Procedimento ]
[ Adicionar Política ]
[ Adicionar Template ]
[ Adicionar Manual ]
[ Adicionar Fonte Oficial ]
[ Criar Conteúdo Interno ]
[ Nova Versão ]
```

---

# 8. SUPORTE DE FICHEIROS

Suportar inicialmente:

```text
PDF
DOCX
XLSX
XLS
PPTX
CSV
TXT
MD
JSON
XML
HTML
JPG
PNG
ZIP
```

Adicionar validação por MIME type, tamanho, integridade e política de segurança.

---

# 9. FORMULÁRIO DE UPLOAD

Ao carregar um documento, solicitar ou inferir:

```text
title
description
knowledge_type
source_type
company_scope
jurisdiction
country
sector
domain
competency
task_type
employee_scope
source_criticality
source_authority
source_url
publication_date
effective_date
expiry_date
version
language
confidentiality
owner
reviewer
approver
```

---

# 10. COMPANY SCOPE

Cada conhecimento deve declarar:

```text
GLOBAL
JURISDICTION
SECTOR
COMPANY_PRIVATE
```

---

# 11. COMPANY PRIVATE KNOWLEDGE

Para conhecimento do cliente:

```text
company_id
tenant_id
```

obrigatórios.

Nunca permitir acesso cross-tenant.

---

# 12. EXEMPLO — MANUAL PRIMAVERA

Frontend:

```text
Title:
Manual Primavera v10 - Importações

Knowledge Type:
VENDOR_KNOWLEDGE

Competency:
PRIMAVERA_IMPORT

Scope:
GLOBAL

Source Criticality:
MEDIUM
```

---

# 13. EXEMPLO — POLÍTICA MARVINE

Frontend:

```text
Title:
Procedimento de Aprovação de Pagamentos

Knowledge Type:
CLIENT_PRIVATE_KNOWLEDGE

Company:
MARVINE, LDA

Tenant:
TNT-962837

Competency:
PAYMENT_APPROVAL

Source Criticality:
HIGH
```

---

# 14. EXEMPLO — LEGISLAÇÃO

Frontend:

```text
Title:
Legislação Fiscal Angola

Knowledge Type:
REGULATORY_KNOWLEDGE

Jurisdiction:
AO

Source Criticality:
CRITICAL

Source Authority:
Official
```

---

# 15. BACKEND INGESTION PIPELINE

Criar:

```text
KnowledgeIngestionPipeline
```

Responsabilidades:

```text
receiveUpload()
validateUpload()
calculateHash()
registerSource()
classifySource()
extractText()
normalizeContent()
chunkContent()
createKnowledgeObjects()
mapCompetencies()
mapTaskTypes()
mapEmployees()
runValidation()
publishKnowledge()
```

---

# 16. SOURCE REGISTRY

Criar ou consolidar:

```text
SOURCE_REGISTRY
```

Campos:

```text
source_id
title
description
source_type
authority
url
company_id
tenant_id
jurisdiction
sector
domain
language
version
publication_date
effective_date
expiry_date
status
source_criticality
created_at
updated_at
```

---

# 17. PHYSICAL FILE REGISTRY

Criar:

```text
PHYSICAL_FILE_REGISTRY
```

Campos:

```text
file_id
source_id
filename
mime_type
size
physical_path
storage_provider
sha256
uploaded_by
uploaded_at
company_id
tenant_id
```

---

# 18. HASH

Calcular:

```text
SHA-256
```

sobre os bytes físicos reais do ficheiro.

Não aceitar hash sintético.

---

# 19. SOURCE PROVENANCE

Guardar:

```text
source_id
origin
authority
retrieval_method
uploaded_by
url
publication_date
version
physical_file_id
sha256
```

---

# 20. INTERNAL AUTHORED KNOWLEDGE

Permitir conteúdo criado internamente.

Mas marcar explicitamente:

```text
INTERNAL_AUTHORED
```

Nunca apresentar como fonte externa independente.

---

# 21. SOURCE AUTHORITY

Valores possíveis:

```text
OFFICIAL_PRIMARY
OFFICIAL_SECONDARY
VENDOR_OFFICIAL
PROFESSIONAL_LICENSED
CLIENT_INTERNAL
INTERNAL_AUTHORED
PUBLIC_REFERENCE
UNKNOWN
```

---

# 22. UNKNOWN SOURCE

Se:

```text
authority = UNKNOWN
```

não permitir uso em:

```text
SOURCE_CRITICAL
```

sem revisão.

---

# 23. EXTRACTION

Criar:

```text
DocumentExtractionService
```

Guardar:

```text
raw_text
normalized_text
page_map
section_map
table_map
```

quando possível.

---

# 24. CHUNKING

Criar chunking semântico.

Cada chunk:

```text
chunk_id
source_id
file_id
section
page
text
token_estimate
hash
```

---

# 25. KNOWLEDGE OBJECTS

Criar:

```text
KNOWLEDGE_OBJECT
```

Campos:

```text
knowledge_object_id
title
summary
source_id
chunk_ids
domain
competency_ids
task_type_ids
jurisdiction
company_id
tenant_id
criticality
status
version
```

---

# 26. KNOWLEDGE OBJECT STATUS

Estados:

```text
DRAFT
VALIDATING
READY_FOR_REVIEW
APPROVED
PUBLISHED
DEPRECATED
REVOKED
REJECTED
```

---

# 27. COMPETENCY MAPPING

Criar:

```text
KNOWLEDGE_COMPETENCY_MAP
```

Campos:

```text
knowledge_object_id
competency_id
relationship
confidence
required
```

---

# 28. TASK MAPPING

Criar:

```text
KNOWLEDGE_TASK_MAP
```

Campos:

```text
knowledge_object_id
task_type_id
required
usage_mode
```

---

# 29. EMPLOYEE MAPPING

Criar:

```text
KNOWLEDGE_EMPLOYEE_MAP
```

Não duplicar ficheiros.

Guardar apenas relação lógica.

---

# 30. EMPLOYEES AFECTADOS

Após processamento, mostrar no frontend:

```text
Affected Employees:
37

Affected Competencies:
5

Affected Task Types:
12
```

---

# 31. KNOWLEDGE IMPACT ANALYZER

Criar:

```text
KnowledgeImpactAnalyzer
```

Fluxo:

```text
SOURCE
↓
KNOWLEDGE OBJECTS
↓
COMPETENCIES
↓
TASK TYPES
↓
EMPLOYEES
```

---

# 32. GAP INTEGRATION

Integrar com MNCA-500:

```text
KNOWLEDGE GAP
↓
KNOWLEDGE ACQUISITION QUEUE
↓
UPLOAD
↓
PROCESS
↓
RETEST
```

---

# 33. KNOWLEDGE ACQUISITION QUEUE

O frontend deve mostrar:

```text
Missing Knowledge
Required Source Type
Affected Competencies
Affected Employees
Priority
Suggested Action
```

---

# 34. ACQUISITION ACTION

Botão:

```text
[ Adicionar Fonte ]
```

deve abrir upload já pré-preenchido com contexto da lacuna.

---

# 35. SOURCE-CRITICAL WORKFLOW

Para `HIGH` ou `CRITICAL`:

```text
UPLOAD
↓
AUTHORITY CHECK
↓
HASH
↓
VERSION CHECK
↓
CURRENTNESS CHECK
↓
HUMAN REVIEW
↓
APPROVAL
↓
PUBLISH
```

---

# 36. CURRENTNESS STATUS

Criar:

```text
CURRENT
REVIEW_REQUIRED
OUTDATED
SUPERSEDED
UNKNOWN
```

---

# 37. EFFECTIVE DATE

Conhecimento regulatório deve ter:

```text
effective_date
```

quando aplicável.

---

# 38. EXPIRY / REVIEW DATE

Suportar:

```text
expiry_date
next_review_date
```

---

# 39. VERSIONING

Toda fonte deve suportar:

```text
version
supersedes_source_id
superseded_by_source_id
```

---

# 40. NOVA VERSÃO

Frontend:

```text
[ Carregar Nova Versão ]
```

Fluxo:

```text
OLD VERSION
↓
NEW FILE
↓
DIFF
↓
IMPACT ANALYSIS
↓
RETEST
↓
PUBLISH
```

---

# 41. NÃO APAGAR HISTÓRICO

Nunca substituir bytes e perder versões antigas.

Preservar:

```text
version history
hash history
approval history
```

---

# 42. KNOWLEDGE DIFF

Criar:

```text
KnowledgeDiffService
```

Mostrar:

```text
added
removed
changed
```

---

# 43. CHANGE IMPACT

Quando fonte muda:

```text
SOURCE CHANGE
↓
AFFECTED KNOWLEDGE OBJECTS
↓
AFFECTED COMPETENCIES
↓
AFFECTED EMPLOYEES
↓
AFFECTED TESTS
```

---

# 44. RETEST

Se conhecimento impactar Employee:

```text
RETEST_REQUIRED
```

conforme política.

---

# 45. PUBLICATION

Criar:

```text
KnowledgePublicationService
```

Só conhecimento:

```text
APPROVED
```

pode ser:

```text
PUBLISHED
```

---

# 46. RUNTIME AVAILABILITY

Após publicação:

```text
runtime_available = true
```

---

# 47. KNOWLEDGE RESOLVER

Integrar com:

```text
KnowledgeResolver
```

O resolver deve seleccionar apenas conhecimento:

```text
PUBLISHED
CURRENT
AUTHORIZED
TENANT_VALID
```

---

# 48. KNOWLEDGE BINDING

Durante execução:

```text
TASK
↓
REQUIRED COMPETENCIES
↓
REQUIRED KNOWLEDGE MODE
↓
KNOWLEDGE RESOLVER
↓
AUTHORIZED KNOWLEDGE
```

---

# 49. SOURCE-CRITICAL GATE

Se tarefa exigir:

```text
SOURCE_CRITICAL
```

e não houver source válido:

```text
TASK_BLOCKED_MISSING_SOURCE
```

---

# 50. CLIENT-SOURCE GATE

Se:

```text
CLIENT_SOURCE_REQUIRED
```

e fonte do tenant faltar:

```text
TASK_BLOCKED_CLIENT_SOURCE_MISSING
```

---

# 51. FRONTEND STATUS PIPELINE

Mostrar:

```text
UPLOADED
VALIDATING
EXTRACTING
CLASSIFYING
MAPPING
WAITING_REVIEW
TESTING
READY
PUBLISHED
```

---

# 52. ERROR STATES

Mostrar:

```text
INVALID_FILE
HASH_ERROR
EXTRACTION_FAILED
SOURCE_UNVERIFIED
VERSION_CONFLICT
REVIEW_REQUIRED
REJECTED
```

---

# 53. KNOWLEDGE LIBRARY TABLE

Colunas:

```text
Source
Type
Scope
Company
Jurisdiction
Version
Criticality
Status
Employees Affected
Updated At
```

---

# 54. SOURCE DETAIL VIEW

Mostrar:

```text
Metadata
Physical File
SHA-256
Provenance
Version
Extraction
Chunks
Knowledge Objects
Competencies
Task Types
Employees
Tests
Usage
Audit
```

---

# 55. PHYSICAL SOURCE EXPLORER

Criar:

```text
Physical Source Explorer
```

Permitir:

```text
open file
view metadata
view sha256
recalculate hash
view extraction
view chunks
view knowledge objects
view employees using source
```

---

# 56. HASH VERIFICATION

Botão:

```text
[ Recalcular Hash ]
```

Comparar:

```text
DECLARED_SHA256
vs
PHYSICAL_SHA256
```

---

# 57. HASH MISMATCH

Se divergente:

```text
SOURCE_INTEGRITY_FAIL
```

e bloquear uso em runtime até revisão.

---

# 58. FILE STORAGE

Definir storage abstracto:

```text
LOCAL
OBJECT_STORAGE
CLOUD_STORAGE
```

sem expor path físico ao utilizador quando não necessário.

---

# 59. SOURCE INGESTION API

Criar endpoint/backend action equivalente a:

```text
POST /knowledge/sources
```

---

# 60. UPLOAD API

Criar:

```text
POST /knowledge/files
```

---

# 61. PROCESSING API

Criar:

```text
POST /knowledge/sources/:id/process
```

---

# 62. REVIEW API

Criar:

```text
POST /knowledge/sources/:id/review
```

---

# 63. PUBLISH API

Criar:

```text
POST /knowledge/sources/:id/publish
```

---

# 64. REVOKE API

Criar:

```text
POST /knowledge/sources/:id/revoke
```

---

# 65. ACCESS CONTROL

Permissões:

```text
KNOWLEDGE_VIEW
KNOWLEDGE_UPLOAD
KNOWLEDGE_EDIT
KNOWLEDGE_REVIEW
KNOWLEDGE_APPROVE
KNOWLEDGE_PUBLISH
KNOWLEDGE_REVOKE
```

---

# 66. TENANT ISOLATION

Todas as queries de conhecimento privado devem incluir:

```text
company_id
tenant_id
```

---

# 67. CROSS-TENANT PROTECTION

Bloquear:

```text
cross-tenant source read
cross-tenant source write
cross-tenant employee mapping
cross-tenant runtime retrieval
```

---

# 68. GLOBAL KNOWLEDGE GOVERNANCE

Conhecimento global só pode ser publicado por utilizador autorizado.

---

# 69. COMPANY OVERRIDE

Permitir:

```text
GLOBAL SOURCE
+
COMPANY OVERRIDE
```

quando apropriado.

---

# 70. OVERRIDE PRECEDENCE

Definir política clara:

```text
CLIENT POLICY
> SECTOR
> JURISDICTION
> GLOBAL
```

apenas quando semanticamente aplicável.

Não usar override para contradizer lei vigente.

---

# 71. KNOWLEDGE CONFLICT DETECTION

Criar:

```text
KnowledgeConflictDetector
```

Detectar:

```text
conflicting rules
duplicate versions
superseded rules
client/global conflicts
```

---

# 72. CONFLICT STATUS

```text
NO_CONFLICT
REVIEW_REQUIRED
BLOCKING_CONFLICT
```

---

# 73. DUPLICATE DETECTION

Detectar duplicação por:

```text
hash
title
source
content similarity
```

---

# 74. DUPLICATE ACTION

Frontend:

```text
Possible duplicate detected.
```

Opções:

```text
Use Existing
Create New Version
Upload Anyway
Cancel
```

---

# 75. LICENSING METADATA

Adicionar:

```text
license_type
usage_rights
distribution_rights
```

quando necessário.

---

# 76. PROTECTED MATERIAL

Não redistribuir material protegido sem autorização.

---

# 77. INTERNAL CONTENT CREATION

Frontend deve permitir criar:

```text
Procedure
Policy
Template
Guideline
Checklist
```

sem upload.

---

# 78. INTERNAL CONTENT EDITOR

Criar editor com:

```text
title
content
version
owner
reviewer
approval
```

---

# 79. INTERNAL CONTENT LABEL

Marcar:

```text
INTERNAL_AUTHORED
```

---

# 80. CLIENT POLICY PACK

Integrar automaticamente conhecimento interno aprovado em:

```text
CLIENT_POLICY_PACK
```

---

# 81. TEMPLATE LIBRARY

Criar:

```text
TEMPLATE_LIBRARY
```

Tipos:

```text
letter
report
invoice support
memo
email
social post
HR form
```

---

# 82. TEMPLATE MAPPING

Mapear template a:

```text
company
task type
employee
output format
```

---

# 83. KNOWLEDGE USAGE TRACE

Durante execução, guardar:

```text
knowledge_object_ids_used
source_ids_used
chunk_ids_used
```

---

# 84. DISTINGUIR DISPONÍVEL VS USADO

Guardar separadamente:

```text
knowledge_available
knowledge_used
```

---

# 85. RUNTIME EVIDENCE

Cada task receipt deve poder mostrar:

```text
Sources Used
Knowledge Objects Used
Versions
Hashes
```

---

# 86. KNOWLEDGE USAGE DASHBOARD

Mostrar:

```text
Most Used Sources
Unused Sources
High-Risk Sources
Expired Sources
Sources Awaiting Review
```

---

# 87. EMPLOYEE KNOWLEDGE VIEW

Dentro de cada Employee mostrar:

```text
Model Native
Inherited Knowledge
Jurisdiction Knowledge
Sector Knowledge
Company Knowledge
Missing Knowledge
Blocked Knowledge
```

---

# 88. EMPLOYEE SOURCE COUNT

Mostrar:

```text
Active Sources
Required Sources
Missing Sources
Expired Sources
```

---

# 89. KNOWLEDGE GAP VIEW

Dentro do Employee:

```text
Competency
Gap
Required Knowledge
Suggested Source Type
Priority
```

---

# 90. BUTTON FROM EMPLOYEE

Adicionar:

```text
[ Adicionar Conhecimento ]
```

pré-preenchendo:

```text
employee
competency
gap
```

---

# 91. BUTTON FROM MNCA

Adicionar:

```text
[ Resolver Lacuna ]
```

---

# 92. AUTO-MAPPING

Pode sugerir mapeamento com IA.

Mas marcar:

```text
AI_SUGGESTED
```

até aprovação quando necessário.

---

# 93. MAPPING CONFIDENCE

Guardar:

```text
mapping_confidence
```

---

# 94. LOW CONFIDENCE

Se baixo:

```text
HUMAN_REVIEW_REQUIRED
```

---

# 95. AUTOMATIC EMPLOYEE IMPACT

Após aprovação:

```text
SOURCE
↓
COMPETENCY
↓
EMPLOYEE IMPACT
```

mostrar automaticamente.

---

# 96. RETEST ENGINE

Integrar com MNCA:

```text
BEFORE
↓
REINFORCEMENT
↓
AFTER
```

---

# 97. RETEST RESULT

Guardar:

```text
before_score
after_score
delta
effective
```

---

# 98. INEFFECTIVE REINFORCEMENT

Se melhoria insuficiente:

```text
REINFORCEMENT_INSUFFICIENT
```

---

# 99. MODEL CAPABILITY GAP

Se source correcto e modelo continua a falhar:

```text
MODEL_CAPABILITY_GAP
```

---

# 100. MODEL ROUTER FEEDBACK

Pode sugerir:

```text
stronger model
different provider
supervision
```

---

# 101. APPROVAL WORKFLOW

Suportar:

```text
DRAFT
↓
REVIEW
↓
APPROVED
↓
PUBLISHED
```

---

# 102. HIGH-RISK SOURCE APPROVAL

Para high/critical:

```text
APPROVED_BY
APPROVED_AT
```

obrigatórios.

---

# 103. REVOCATION

Permitir:

```text
[ Revogar Fonte ]
```

Resultado:

```text
REVOKED
```

---

# 104. REVOCATION IMPACT

Ao revogar:

```text
affected employees
affected tasks
affected certifications
```

---

# 105. DEGRADED KNOWLEDGE

Se fonte crítica for revogada:

```text
KNOWLEDGE_DEGRADED
```

---

# 106. TASK ELIGIBILITY INTEGRATION

Bloquear task se:

```text
required source revoked
required source expired
required source unverified
```

---

# 107. AUDIT EVENTS

Registar:

```text
source_uploaded
source_validated
hash_calculated
source_classified
text_extracted
chunks_created
knowledge_object_created
competency_mapped
employee_mapped
source_reviewed
source_approved
source_published
source_revoked
source_retested
```

---

# 108. AUDIT RECORD

Campos:

```text
event_id
event_type
user_id
company_id
tenant_id
source_id
file_id
timestamp
details
```

---

# 109. IMMUTABILITY

Não permitir apagar silenciosamente histórico de source-critical.

---

# 110. SEARCH

Permitir pesquisa por:

```text
title
domain
competency
employee
company
jurisdiction
source type
status
version
```

---

# 111. FILTERS

Criar:

```text
Global
Jurisdiction
Company
Critical
Expired
Awaiting Review
Published
Revoked
```

---

# 112. DASHBOARD

Indicadores:

```text
Total Sources
Published Sources
Pending Review
Critical Sources
Outdated Sources
Missing Knowledge
Employees Impacted
Competencies Covered
```

---

# 113. COVERAGE METRICS

Criar:

```text
knowledge_coverage_by_competency
knowledge_coverage_by_employee
knowledge_coverage_by_task
```

---

# 114. NO FALSE COVERAGE

Não contar source apenas carregado como cobertura.

Só:

```text
PUBLISHED + VALID
```

---

# 115. INGESTION SECURITY

Validar:

```text
file type
file size
malware policy
zip content
path traversal
unsafe macros
```

---

# 116. MACRO FILES

Tratar ficheiros com macros com política específica.

---

# 117. ZIP INGESTION

Se ZIP:

```text
extract safely
inventory files
validate each file
```

---

# 118. BULK UPLOAD

Permitir:

```text
[ Upload em Lote ]
```

---

# 119. BULK REVIEW

Mostrar:

```text
accepted
rejected
duplicates
needs review
```

---

# 120. IMPORT MANIFEST

Gerar:

```text
BULK_INGESTION_MANIFEST
```

---

# 121. SOURCE ORIGIN OPTIONS

Frontend:

```text
Upload Local File
Official URL
Cloud Drive
Company Repository
Internal Editor
```

---

# 122. CLOUD CONNECTORS

Quando disponível:

```text
Google Drive
OneDrive
SharePoint
```

mas sempre via autorização da empresa.

---

# 123. NO UNCONTROLLED FILESYSTEM SEARCH

O runtime não deve procurar livremente em:

```text
C:\
OneDrive
Desktop
Downloads
```

à procura de conhecimento.

Só fontes registadas/autorizadas.

---

# 124. KNOWLEDGE SOURCE RESOLUTION

O Employee deve consultar:

```text
SOURCE_REGISTRY
```

não o filesystem arbitrário.

---

# 125. SOURCE PATH TRANSPARENCY

Guardar de onde o sistema pensa que a fonte vem.

---

# 126. PHYSICAL SOURCE AUTHENTICITY

Para source critical, provar:

```text
declared source
physical file
hash
extraction
knowledge object
runtime use
```

---

# 127. FILE → KNOWLEDGE LINEAGE

Criar lineage:

```text
FILE
↓
SOURCE
↓
CHUNK
↓
KNOWLEDGE OBJECT
↓
COMPETENCY
↓
EMPLOYEE
↓
TASK
```

---

# 128. UI LINEAGE VIEW

Botão:

```text
[ Ver Linhagem ]
```

---

# 129. SOURCE USAGE COUNT

Mostrar:

```text
Used by 37 Employees
Used by 12 Task Types
Used in 482 Executions
```

---

# 130. DEPRECATION

Permitir:

```text
DEPRECATED
```

sem apagar histórico.

---

# 131. SUPERSESSION

Permitir:

```text
SUPERSEDED_BY
```

---

# 132. CURRENT VERSION RESOLUTION

Runtime deve escolher:

```text
CURRENT + PUBLISHED + AUTHORIZED
```

---

# 133. KNOWLEDGE FREEZE

Permitir congelar baseline:

```text
KNOWLEDGE_BASELINE
```

---

# 134. BASELINE FIELDS

```text
baseline_id
source_versions
hashes
created_at
approved_by
```

---

# 135. BASELINE ROLLBACK

Permitir rollback controlado.

---

# 136. FRONTEND — USER EXPERIENCE

O utilizador não deve precisar conhecer:

```text
filesystem
hash command
database
chunking algorithm
vector index
API route
```

A interface deve traduzir isso para passos simples.

---

# 137. WIZARD

Criar wizard:

```text
1. Escolher ficheiro/fonte
2. Classificar
3. Definir âmbito
4. Rever metadados
5. Processar
6. Rever impacto
7. Aprovar
8. Publicar
```

---

# 138. QUICK ADD

Para baixo risco:

```text
Quick Add
```

com defaults seguros.

---

# 139. EXPERT MODE

Para administradores:

```text
Advanced Metadata
Provenance
Versioning
Criticality
Hash
Mappings
```

---

# 140. NOTIFICATIONS

Notificar:

```text
processing complete
review required
source expired
new version available
source conflict
retest completed
```

---

# 141. TESTES OBRIGATÓRIOS

## TEST-KC-01
Upload de PDF válido.

Esperado:

```text
UPLOADED
```

## TEST-KC-02
Hash SHA-256 real.

Esperado:

```text
HASH_VERIFIED
```

## TEST-KC-03
Source registry criado.

## TEST-KC-04
Extraction concluída.

## TEST-KC-05
Chunks criados.

## TEST-KC-06
Knowledge Objects criados.

## TEST-KC-07
Competência mapeada.

## TEST-KC-08
Employees afectados calculados.

## TEST-KC-09
Company private knowledge isolado.

## TEST-KC-10
Cross-tenant bloqueado.

## TEST-KC-11
Source Critical sem autoridade.

Esperado:

```text
REVIEW_REQUIRED
```

## TEST-KC-12
Source Critical aprovada.

Esperado:

```text
PUBLISHED
```

## TEST-KC-13
Hash mismatch.

Esperado:

```text
SOURCE_INTEGRITY_FAIL
```

## TEST-KC-14
Nova versão.

Esperado:

```text
CHANGE_IMPACT_CALCULATED
```

## TEST-KC-15
Revogação.

Esperado:

```text
KNOWLEDGE_DEGRADED
```

## TEST-KC-16
MNCA gap resolvido.

Esperado:

```text
RETEST_TRIGGERED
```

## TEST-KC-17
Fonte duplicada.

Esperado:

```text
DUPLICATE_DETECTED
```

## TEST-KC-18
Employee runtime usa apenas source publicada.

Esperado:

```text
AUTHORIZED_KNOWLEDGE_ONLY
```

---

# 142. TESTE REAL — MARVINE

Usar:

```text
MARVINE, LDA
CMP-486564
TNT-962837
```

Carregar um documento privado real de baixo risco.

Esperado:

```text
Frontend Upload
↓
Backend Processing
↓
Tenant Binding
↓
Knowledge Object
↓
Employee Mapping
↓
Runtime Availability
↓
Task Uses Knowledge
↓
Audit Evidence
```

---

# 143. TESTE REAL — GLOBAL

Carregar fonte de conhecimento global não regulatória.

Esperado:

```text
1 source
→ multiple competencies
→ multiple employees
```

sem duplicar ficheiro.

---

# 144. TESTE REAL — SOURCE CRITICAL

Usar fonte oficial real e aprovada.

Esperado:

```text
authority
version
hash
effective date
approval
publication
runtime trace
```

---

# 145. RAW EVIDENCE

Para cada teste, produzir:

```text
source record
physical file record
hash
extraction
chunks
knowledge objects
mappings
publication
runtime usage
audit
```

---

# 146. NO MOCK AS PROOF

Mocks podem validar UI e lógica.

Não podem provar:

```text
physical source authenticity
real file hash
real extraction
real runtime knowledge use
```

---

# 147. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ cliente consegue adicionar conhecimento no frontend
✓ não precisa editar código
✓ backend processa automaticamente
✓ source registry é criado
✓ ficheiro físico é registado
✓ SHA-256 é calculado
✓ proveniência existe
✓ texto é extraído
✓ chunks são criados
✓ Knowledge Objects são criados
✓ competências são mapeadas
✓ Employees afectados são identificados
✓ Task Types são mapeados
✓ source-critical exige validação
✓ company private knowledge é isolado
✓ cross-tenant é bloqueado
✓ publicação controla runtime
✓ versões são preservadas
✓ nova versão gera impact analysis
✓ revogação afecta readiness
✓ MNCA recebe feedback
✓ runtime mostra fontes realmente usadas
✓ Physical Source Explorer existe
✓ nenhuma procura arbitrária no filesystem é necessária
```

---

# 148. RESULTADO VISUAL ESPERADO

No frontend:

```text
Knowledge Center
```

Exemplo:

```text
Manual Primavera v10
Status: PUBLISHED
Version: 10.x
Type: VENDOR_KNOWLEDGE
Competencies: 4
Employees Affected: 37
Tasks Affected: 12
SHA-256: VERIFIED
Currentness: CURRENT
```

---

# 149. RESULTADO NO EMPLOYEE

Dentro de um Employee:

```text
Knowledge Status:
READY

Inherited Sources:
8

Company Sources:
3

Missing Sources:
0

Critical Sources:
2

Last Knowledge Retest:
PASS
```

---

# 150. RESULTADO NO MNCA

Exemplo:

```text
Before:
72%

Knowledge Added:
SRC-PRIM-001

After:
91%

Result:
REINFORCEMENT_EFFECTIVE
```

---

# 151. REGRA FINAL

O utilizador deve poder acrescentar conhecimento pelo frontend.

Mas o conhecimento só pode ser considerado operacional depois de passar pelo backend.

Formalizar:

```text
FRONTEND
=
USER EXPERIENCE
+
UPLOAD
+
MANAGEMENT

BACKEND
=
SOURCE OF TRUTH
+
VALIDATION
+
PROVENANCE
+
PROCESSING
+
MAPPING
+
PUBLICATION
+
RUNTIME
```

---

# 152. OBJECTIVO FINAL

Eliminar a necessidade de um programador para actualizar conhecimento rotineiro dos AI Employees.

O cliente deve conseguir:

```text
Adicionar manual
Adicionar política
Adicionar template
Adicionar fonte
Actualizar versão
Revogar conhecimento
Ver impacto
Ver Employees afectados
Publicar
Retestar
Auditar
```

tudo através da aplicação.

A plataforma deve transformar conhecimento carregado pelo utilizador em conhecimento governado, verificável, reutilizável e operacional para os 500 AI Employees.
