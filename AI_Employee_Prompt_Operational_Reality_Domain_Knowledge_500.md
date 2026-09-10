# PROMPT MESTRE COMPLEMENTAR — OPERATIONAL REALITY & DOMAIN KNOWLEDGE SYSTEM
## Conhecimento Profissional, Realidade Operacional, Casos, Excepções e Contexto para os 500 AI Employees

**Versão:** 1.0  
**Âmbito:** AI Employee Platform — catálogo canónico de 500 AI Employees  
**Objectivo:** transformar os 500 Employees de funções genericamente definidas em especialistas digitais operacionalmente competentes, capazes de executar trabalho real com conhecimento profissional, sectorial, regulamentar, tecnológico e organizacional verificável.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto de Software;
- Arquitecto de Knowledge Systems;
- Arquitecto de Sistemas RAG;
- Arquitecto de Sistemas Multiagente;
- Especialista em Knowledge Graphs;
- Especialista em Ontologias;
- Engenheiro de Dados;
- Especialista em MLOps/LLMOps;
- Especialista em avaliação de IA;
- Especialista em segurança e governance;
- Especialista em gestão documental;
- Especialista em processos empresariais;
- Especialista em compliance e legislação;
- Especialista em ERP, CRM, HRIS, WMS, DMS e ferramentas empresariais;
- Especialistas de domínio por sector;
- Especialistas em auditoria e rastreabilidade;
- Especialistas em aprendizagem supervisionada e human-in-the-loop.

Implemente na AI Employee Platform um sistema transversal denominado:

# **OPERATIONAL REALITY & DOMAIN KNOWLEDGE SYSTEM — ORDKS**

Este sistema deve servir os **500 AI Employees**.

NÃO assumir que o conhecimento geral do modelo é suficiente.

NÃO colocar todo o conhecimento dentro do Prompt Mestre.

NÃO permitir que cada Employee possua uma enciclopédia isolada e duplicada.

NÃO misturar legislação, política interna, conhecimento geral, memória e casos sem indicar proveniência.

NÃO permitir que conteúdo não verificado se torne automaticamente regra operacional.

NÃO permitir que uma correcção humana isolada altere o comportamento global sem avaliação.

O sistema deve assegurar que cada Employee saiba:

```text
QUEM SOU?
O QUE FAÇO?
COMO ESTA FUNÇÃO É REALMENTE EXECUTADA?
QUE DADOS E DOCUMENTOS APARECEM?
QUE SISTEMAS SÃO USADOS?
QUE PROCEDIMENTOS SÃO NORMAIS?
QUE EXCEPÇÕES ACONTECEM?
QUE ERROS SÃO FREQUENTES?
QUE REGRAS SE APLICAM?
QUE LEGISLAÇÃO SE APLICA?
QUE CONTROLOS EXISTEM?
QUE SINAIS INDICAM PROBLEMAS?
QUANDO POSSO CONTINUAR?
QUANDO DEVO PARAR?
QUANDO DEVO PEDIR DADOS?
QUANDO DEVO ESCALAR?
QUANDO PRECISO DE APROVAÇÃO HUMANA?
COMO UM PROFISSIONAL EXPERIENTE INVESTIGARIA O CASO?
COMO COMPROVO A ORIGEM DA MINHA CONCLUSÃO?
```

---

# 1. PRINCÍPIO DE ARQUITECTURA

A competência efectiva de um AI Employee deve resultar de:

```text
AI EMPLOYEE
=
CORE RUNTIME
+
ROLE PACK
+
WORK CONTRACT
+
DOMAIN KNOWLEDGE PACK
+
OPERATIONAL REALITY PACK
+
DEPARTMENT KNOWLEDGE PACK
+
INDUSTRY PACK
+
JURISDICTION PACK
+
ORGANIZATION PACK
+
SYSTEM / TOOL KNOWLEDGE PACK
+
PROCESS PACK
+
DOCUMENT & DATA SCHEMA PACK
+
EXCEPTION LIBRARY
+
CASE LIBRARY
+
CONTROL LIBRARY
+
TEMPLATES
+
MEMORY
+
TOOLS
+
PERMISSIONS
+
POLICIES
+
WORKFLOW
+
KPIs
+
EVALUATION
```

---

# 2. PRINCÍPIO DE SEPARAÇÃO DE CONHECIMENTO

Separar obrigatoriamente:

```text
GENERAL MODEL KNOWLEDGE
DOMAIN KNOWLEDGE
INDUSTRY KNOWLEDGE
JURISDICTION KNOWLEDGE
ORGANIZATION KNOWLEDGE
SYSTEM KNOWLEDGE
PROCESS KNOWLEDGE
CASE KNOWLEDGE
EXCEPTION KNOWLEDGE
OPERATIONAL MEMORY
```

Cada classe tem:

- origem;
- autoridade;
- validade;
- owner;
- versão;
- data efectiva;
- nível de confiança;
- classificação;
- escopo.

---

# 3. KNOWLEDGE PRECEDENCE

Implementar prioridade formal.

Ordem base:

```text
1. PLATFORM SAFETY RULES
2. CERTIFIED ROLE PACK CONSTRAINTS
3. APPLICABLE LAW / REGULATION
4. ORGANIZATION POLICY
5. APPROVED SOP / PROCESS
6. CERTIFIED SYSTEM DOCUMENTATION
7. VERIFIED DOMAIN KNOWLEDGE
8. VERIFIED INDUSTRY KNOWLEDGE
9. VALIDATED CASE LIBRARY
10. VALIDATED OPERATIONAL MEMORY
11. GENERAL MODEL KNOWLEDGE
```

A prioridade real pode depender da matéria, mas nunca deve ser improvisada silenciosamente.

---

# 4. KNOWLEDGE ITEM MODEL

Criar:

`KnowledgeItem`

Campos mínimos:

```text
knowledge_id
title
knowledge_type
domain
department
employee_ids[]
industry
jurisdiction
organization_id
system_name
process_key
source_type
source_reference
source_url_or_file_ref
source_version
effective_from
effective_until
last_verified_at
verification_status
authority_level
confidence
sensitivity
classification
language
locale
tags[]
content_hash
supersedes
superseded_by
owner
reviewer
created_at
updated_at
```

---

# 5. KNOWLEDGE STATUS

Estados:

```text
DRAFT
UNDER_REVIEW
VERIFIED
ACTIVE
STALE
SUPERSEDED
DEPRECATED
REJECTED
QUARANTINED
```

Nenhum Employee deve tratar `STALE`, `SUPERSEDED`, `REJECTED` ou `QUARANTINED` como fonte principal para decisão material.

---

# 6. DOMAIN KNOWLEDGE PACK

Cada função profissional deve possuir um conjunto de conhecimento de domínio.

Exemplos:

```text
ACCOUNTING
FINANCE
TAX
HR
SALES
MARKETING
LEGAL
AUDIT
PROCUREMENT
INVENTORY
LOGISTICS
OPERATIONS
PROJECTS
IT
PRODUCT
BANKING
INSURANCE
AGRICULTURE
MANUFACTURING
ENERGY
TELECOM
MINING
OIL_GAS
PUBLIC_ADMINISTRATION
FACILITIES
SECURITY
ESG
RESEARCH
MEDIA
AVIATION
PHARMA
DATA_AI_OPERATIONS
```

---

# 7. OPERATIONAL REALITY PACK

Para cada Employee, registar:

```text
typical_day
typical_tasks
common_inputs
common_outputs
common_documents
common_systems
normal_sequence
dependencies
expected_delays
frequent_missing_data
frequent_data_quality_issues
common_errors
common_exceptions
common_workarounds
red_flags
escalation_triggers
approval_points
handoff_points
controls
evidence_required
completion_criteria
```

---

# 8. DEPARTMENT KNOWLEDGE PACKS

Criar conhecimento reutilizável por departamento.

O catálogo canónico actual possui 44 Departments.

Cada Department Pack deve conter:

```text
department_objectives
core_processes
common_data_products
common_documents
common_systems
common_controls
common_risks
common_metrics
common_events
common_workflows
common_exceptions
common_terminology
```

---

# 9. ROLE-SPECIFIC KNOWLEDGE PACKS

Cada um dos 500 Employees deve possuir:

```yaml
role_knowledge_profile:
  employee_id: 1
  role_key: "..."

  core_concepts: []
  standard_tasks: []
  common_inputs: []
  common_outputs: []
  documents_encountered: []
  systems_used: []
  normal_workflow: []
  domain_rules: []
  calculations: []
  decision_rules: []
  validation_rules: []
  common_errors: []
  exception_patterns: []
  escalation_rules: []
  evidence_requirements: []
  completion_rules: []
  relevant_kpis: []
```

Release gate:

```text
500/500 role_knowledge_profiles valid
```

---

# 10. INDUSTRY PACKS

Implementar packs sectoriais que alteram o contexto sem criar novos Employees.

Exemplos:

```text
RETAIL
WHOLESALE
SERVICES
CONSTRUCTION
HEALTHCARE_ADMIN
EDUCATION
REAL_ESTATE
HOSPITALITY
BANKING
INSURANCE
AGRICULTURE
MANUFACTURING
ENERGY
TELECOM
MINING
OIL_GAS
PUBLIC_SECTOR
FACILITIES
SECURITY
AVIATION
PHARMA
MEDIA
FRANCHISE
```

---

# 11. EXEMPLO DE COMPOSIÇÃO POR SECTOR

```text
Accounting Employee
+
Retail Industry Pack
```

não é igual a:

```text
Accounting Employee
+
Construction Industry Pack
```

O Employee continua o mesmo; muda o contexto aplicável.

---

# 12. JURISDICTION PACKS

Criar arquitectura para:

```text
COUNTRY
PROVINCE/STATE
MUNICIPALITY
REGULATOR
INDUSTRY REGULATOR
```

Campos:

```text
jurisdiction_code
regulation_id
title
authority
legal_source
effective_from
effective_until
version
status
affected_roles[]
affected_processes[]
affected_documents[]
affected_calculations[]
affected_deadlines[]
```

---

# 13. ANGOLA PACK

Criar suporte específico e modular para Angola.

Exemplos de áreas a suportar, conforme Employee:

```text
AGT
PGCA
OCPCA
INSS
IVA
IRT
Imposto Industrial
Imposto do Selo
legislação laboral
legislação comercial
licenciamento
administração pública
procurement
construção
publicidade
banca
seguros
aduanas
comércio
```

Não hardcodear legislação em prompts.

Legislação deve ser versionada e actualizável.

---

# 14. CURRENT LAW POLICY

Para áreas reguladas:

```text
IF knowledge is jurisdiction-sensitive
AND source is stale or unverified
THEN
  do not present as current law
  request verification or trusted source
  flag uncertainty
```

---

# 15. ORGANIZATION PACK

Cada cliente deve possuir um pack próprio.

Conteúdo típico:

```text
organization_master_data
organizational_structure
chart_of_accounts
cost_centers
departments
approval_matrix
bank_accounts
customer_master
supplier_master
product_master
service_catalog
asset_register
inventory_structure
locations
warehouses
business_calendar
internal_policies
SOPs
templates
document_numbering
ERP configuration
CRM configuration
HR rules
KPIs
budget structure
reporting rules
security rules
delegations
exception policies
```

---

# 16. ORGANIZATION ONBOARDING

Criar workflow:

```text
Organization Created
↓
Systems Connected
↓
Documents Imported
↓
Policies Imported
↓
SOPs Imported
↓
Templates Imported
↓
Master Data Mapped
↓
Approval Matrix Configured
↓
Industry Selected
↓
Jurisdiction Selected
↓
Knowledge Validation
↓
Simulation
↓
Employee Activation
```

---

# 17. SYSTEM / TOOL KNOWLEDGE PACKS

Cada sistema empresarial deve ter documentação operacional.

Exemplos:

```text
PRIMAVERA_V10
SAP
ODOO
MICROSOFT_DYNAMICS
SAGE
SALESFORCE
HUBSPOT
EXCEL
POWER_QUERY
POWER_BI
SHAREPOINT
ONEDRIVE
GOOGLE_DRIVE
GOOGLE_SHEETS
SERVICENOW
JIRA
ZENDESK
```

---

# 18. PRIMAVERA V10 KNOWLEDGE PACK

Estruturar, conforme integrações disponíveis:

```text
entities
documents
accounting structures
customer records
supplier records
inventory records
sales documents
purchase documents
exports
imports
field mappings
known constraints
common errors
read operations
write operations
permission requirements
integration methods
```

---

# 19. EXCEL KNOWLEDGE PACK

Incluir:

```text
workbooks
worksheets
tables
named ranges
formulas
data types
dates
currencies
filters
Power Query
pivot tables
charts
common data quality issues
merged cells
hidden sheets
external links
formula injection risks
```

---

# 20. PROCESS PACKS

Separar profissão de processo.

Exemplos:

```text
MONTH_END_CLOSE
PURCHASE_TO_PAY
ORDER_TO_CASH
HIRE_TO_RETIRE
PROCURE_TO_PAY
BANK_RECONCILIATION
DOCUMENT_CLASSIFICATION
MANAGEMENT_REPORTING
CLAIMS_PROCESSING
MAINTENANCE_WORK_ORDER
PERMIT_PROCESSING
INCIDENT_RESPONSE
```

---

# 21. PROCESS MODEL

Cada Process Pack deve conter:

```text
process_key
objective
trigger
preconditions
steps[]
roles[]
inputs[]
outputs[]
systems[]
documents[]
controls[]
approvals[]
exceptions[]
handoffs[]
sla
completion_conditions
```

---

# 22. DOCUMENT & DATA SCHEMA PACKS

O Employee deve saber o que esperar de cada tipo de documento/dataset.

Exemplo:

```text
PURCHASE_INVOICE
SALES_INVOICE
RECEIPT
CREDIT_NOTE
DEBIT_NOTE
BANK_STATEMENT
EMPLOYMENT_CONTRACT
TAX_NOTICE
PURCHASE_ORDER
DELIVERY_NOTE
WORK_ORDER
CLAIM_FORM
INSPECTION_REPORT
```

---

# 23. DOCUMENT SCHEMA EXAMPLE

```yaml
document_type: PURCHASE_INVOICE

expected_fields:
  - supplier_name
  - supplier_tax_id
  - document_number
  - issue_date
  - currency
  - subtotal
  - tax
  - total

validation_rules:
  - total = subtotal + tax +/- adjustments

possible_exceptions:
  - missing_tax_id
  - duplicate_document
  - illegible_total
  - unknown_supplier
```

---

# 24. EXCEPTION LIBRARY

Criar uma biblioteca formal de excepções.

`OperationalException`

Campos:

```text
exception_id
role_keys[]
process_keys[]
trigger_pattern
symptoms
possible_causes[]
required_checks[]
forbidden_assumptions[]
safe_actions[]
escalation_rules[]
evidence_required[]
resolved_examples[]
regression_tests[]
```

---

# 25. EXEMPLO — FACTURA SEM NIF

```text
Exception:
MISSING_SUPPLIER_TAX_ID

Detect:
supplier_tax_id missing

Do:
search approved supplier master

Do not:
invent tax ID

If unresolved:
NEEDS_HUMAN_REVIEW
```

---

# 26. EXEMPLO — POSSÍVEL DUPLICADO BANCÁRIO

```text
Exception:
POSSIBLE_DUPLICATE_BANK_TRANSACTION

Possible causes:
- duplicated import
- genuinely duplicated transaction
- reversal
- same amount/date but different transaction

Checks:
- transaction id
- bank reference
- posting date
- value date
- amount
- counterparty

Do not:
delete automatically
```

---

# 27. CASE LIBRARY

Criar biblioteca de casos reais/anónimos/sintéticos validados.

Tipos:

```text
GOLDEN
NORMAL
EDGE
NEGATIVE
AMBIGUOUS
FAILURE
ESCALATION
ADVERSARIAL
REGULATORY
```

---

# 28. CASE MODEL

```text
case_id
role_key
department
industry
jurisdiction
scenario
inputs
expected_process
expected_output
expected_decisions
forbidden_actions
expected_escalations
supporting_sources
review_status
```

---

# 29. GOLDEN EXAMPLES

Cada Role Pack deve possuir exemplos de alta qualidade.

Objectivo:

```text
show what good work looks like
```

Mas exemplos não substituem regras e fontes.

---

# 30. NEGATIVE EXAMPLES

Ensinar explicitamente:

```text
what not to do
```

Exemplos:

- inventar valor;
- usar documento de empresa errada;
- assumir classificação fiscal;
- executar pagamento sem autorização;
- substituir lei actual por memória do modelo;
- completar campo desconhecido sem evidência.

---

# 31. EDGE CASES

Cobrir:

```text
missing data
conflicting data
stale data
partial document
duplicate record
unusual format
new supplier
new customer
zero value
negative value
unexpected currency
timezone mismatch
period mismatch
cross-tenant-looking identifier
```

---

# 32. CONTROL LIBRARY

Criar biblioteca de controlos empresariais.

Exemplos:

```text
segregation_of_duties
four_eyes_review
dual_approval
amount_threshold
period_lock
bank_reconciliation
duplicate_detection
document_completeness
source_verification
maker_checker
```

---

# 33. CONTROL MODEL

```text
control_id
control_type
purpose
applicable_roles[]
applicable_processes[]
trigger
condition
required_action
evidence
owner
frequency
```

---

# 34. KNOWLEDGE GRAPH

Criar grafo ligando:

```text
Employee
Department
Process
Document
Data Product
System
Tool
Policy
Regulation
Control
Risk
Exception
Case
KPI
Organization
Industry
Jurisdiction
```

---

# 35. GRAPH EXAMPLE

```text
#73 Management Reporting
  → uses PROCESS: MANAGEMENT_REPORTING
  → depends_on DATA: TRIAL_BALANCE
  → depends_on DATA: BUDGET
  → uses SYSTEM: ERP
  → uses SYSTEM: EXCEL
  → produces DOCUMENT: MANAGEMENT_REPORT
  → governed_by POLICY: MANAGEMENT_REPORT_APPROVAL
  → measured_by KPI: REPORT_TIMELINESS
```

---

# 36. KNOWLEDGE RETRIEVAL

Runtime flow:

```text
TASK
↓
ROLE RESOLUTION
↓
ORGANIZATION
↓
INDUSTRY
↓
JURISDICTION
↓
PROCESS
↓
SYSTEMS
↓
RISK
↓
KNOWLEDGE QUERY PLAN
↓
RETRIEVE ONLY RELEVANT KNOWLEDGE
↓
RANK / FILTER / VERIFY
↓
CONTEXT PACKAGE
↓
EMPLOYEE EXECUTION
```

---

# 37. CONTEXT MINIMIZATION

Não injectar todo o conhecimento no contexto.

Aplicar:

```text
role filter
process filter
organization filter
jurisdiction filter
industry filter
effective-date filter
status filter
sensitivity filter
task relevance
```

---

# 38. KNOWLEDGE CONTEXT PACKAGE

Criar:

`KnowledgeContextPackage`

```text
package_id
task_id
employee_id
organization_id
sources[]
rules[]
procedures[]
examples[]
exceptions[]
controls[]
system_docs[]
jurisdiction_rules[]
organization_rules[]
retrieved_at
cutoff
hash
```

---

# 39. SOURCE PROVENANCE

Toda afirmação material derivada de knowledge deve poder apontar para:

```text
knowledge_id
source_reference
source_version
effective_date
retrieval_timestamp
```

---

# 40. SOURCE AUTHORITY

Classificar fontes:

```text
A1 OFFICIAL_PRIMARY
A2 OFFICIAL_SECONDARY
B1 ORGANIZATION_APPROVED
B2 CERTIFIED_VENDOR
C1 VERIFIED_PROFESSIONAL
C2 VALIDATED_CASE
D1 GENERAL_REFERENCE
D2 UNVERIFIED
```

---

# 41. KNOWLEDGE CONFLICT ENGINE

Se duas fontes activas discordarem:

```text
KNOWLEDGE_CONFLICT
```

Gerar:

```text
source_A
source_B
authority_A
authority_B
effective_dates
affected_decision
resolution_policy
human_review_required
```

---

# 42. STALE KNOWLEDGE ENGINE

Detecção:

```text
IF current_date > review_due_date
THEN status = STALE
```

Ou:

```text
IF superseding source detected
THEN status = SUPERSEDED
```

---

# 43. KNOWLEDGE REVIEW CADENCE

Configurar por tipo:

```text
tax/regulation: high-frequency review
security/vendor docs: frequent
organization policy: on-change + scheduled
domain knowledge: periodic
examples/cases: continuous quality review
```

Não hardcodear uma única frequência.

---

# 44. LEARNING FROM HUMAN CORRECTIONS

Fluxo:

```text
Employee Output
↓
Human Correction
↓
Learning Candidate
↓
Reason Classification
↓
Review
↓
Evaluation
↓
Regression Test
↓
Approve
↓
New Knowledge Version
```

---

# 45. NÃO APRENDER DIRECTAMENTE DE UMA CORRECÇÃO

Proibido:

```text
one user correction
↓
global permanent behavior change
```

---

# 46. LEARNING CANDIDATE MODEL

```text
candidate_id
source_task
employee_id
organization_id
original_output
human_correction
reason
suggested_knowledge_update
scope
risk
review_status
```

---

# 47. SCOPE OF LEARNING

Uma correcção pode ser:

```text
TASK_ONLY
USER
ORGANIZATION
INDUSTRY
JURISDICTION
GLOBAL_DOMAIN
```

Nunca promover automaticamente para escopo global.

---

# 48. ORGANIZATION MEMORY VS KNOWLEDGE

Separar:

```text
Memory
=
experiência contextual/operacional

Knowledge
=
fonte estruturada/verificada
```

Memory não substitui política, lei ou SOP.

---

# 49. EXAMPLE — EMPLOYEE #66 DOCUMENT CLASSIFICATION

O Employee deve conhecer:

```text
document families
invoice variants
receipts
credit/debit notes
bank statements
payment proofs
contracts
HR docs
tax notices
purchase docs
sales docs
inventory docs
government correspondence
```

Também:

```text
expected fields
classification hierarchy
confidence thresholds
duplicate signals
routing rules
unknown-document handling
illegible-document handling
human-review rules
```

---

# 50. #66 OPERATIONAL REALITY

Casos:

```text
document is rotated
scan is poor
invoice number missing
supplier not in master
wrong company
wrong period
duplicate
two documents in one PDF
credit note resembles invoice
photo cuts off total
```

Cada caso deve ter tratamento explícito.

---

# 51. EXAMPLE — EMPLOYEE #73 MANAGEMENT REPORTING

Conhecimento:

```text
P&L
Balance Sheet
Cash Flow
Working Capital
Margins
Profitability
Liquidity
Leverage
Budget
Actual vs Budget
Forecast
Aging
Inventory
Revenue
Cost
KPIs
Variance Analysis
Trend Analysis
Management Commentary
Executive Reporting
```

---

# 52. #73 OPERATIONAL REALITY

Saber lidar com:

```text
accounting period not closed
bank reconciliation incomplete
budget missing
inventory stale
late invoices
manual adjustments
one-off expenses
reclassification
seasonality
large customer concentration
incomplete prior-year comparator
```

---

# 53. DETERMINISTIC CALCULATIONS

Conhecimento pode explicar fórmulas, mas cálculos críticos devem ser implementados em engines determinísticos.

Exemplos:

```text
gross_margin
variance
aging
tax calculations
bank reconciliation matching
inventory totals
```

IA interpreta; não reinventa fórmula em cada execução.

---

# 54. DOMAIN CALCULATION REGISTRY

Criar:

```text
calculation_key
formula
inputs
unit
currency_rule
rounding_rule
jurisdiction_scope
industry_scope
version
tests
```

---

# 55. DECISION RULE REGISTRY

Criar regras determinísticas quando possível:

```text
rule_key
condition
action
exceptions
priority
source
effective_date
```

---

# 56. DOMAIN TERMINOLOGY

Criar glossários por:

```text
department
industry
jurisdiction
organization
system
```

Suportar sinónimos e termos locais.

---

# 57. LANGUAGE / LOCALE

Conhecimento deve suportar:

```text
language
locale
currency
timezone
date format
number format
```

Exemplo:

```text
pt-AO
AOA
Africa/Luanda
```

---

# 58. MULTI-JURISDICTION

Uma organização pode operar em vários países.

Task deve resolver:

```text
organization
legal_entity
jurisdiction
transaction jurisdiction
employee jurisdiction context
```

---

# 59. SYSTEM DOCUMENTATION INGESTION

Permitir carregar:

```text
vendor docs
API docs
ERP manuals
internal guides
data dictionaries
field mapping docs
release notes
```

Aplicar:

```text
scan
parse
classify
version
verify
index
```

---

# 60. ORGANIZATION DOCUMENT INGESTION

Permitir:

```text
policies
SOPs
manuals
templates
contracts
approval matrices
chart of accounts
process maps
internal memos
```

Todos tenant-scoped.

---

# 61. KNOWLEDGE CONNECTORS

Suportar:

```text
Google Drive
SharePoint
OneDrive
DMS
S3/object storage
internal wiki
Confluence-like systems
database tables
API
file upload
```

---

# 62. RAG ARCHITECTURE

Implementar retrieval com:

```text
metadata filtering
hybrid search
semantic search
keyword search
structured lookup
knowledge graph traversal
reranking
effective-date filtering
authority filtering
tenant filtering
```

---

# 63. NO BLIND VECTOR SEARCH

Não confiar apenas em vector similarity.

Aplicar filtros obrigatórios:

```text
tenant
jurisdiction
status
effective date
role
process
sensitivity
permissions
```

---

# 64. STRUCTURED KNOWLEDGE FIRST

Quando existir dado estruturado:

```text
regulation registry
policy registry
calculation registry
process registry
exception registry
```

usar lookup estruturado antes de busca semântica.

---

# 65. RETRIEVAL CONFIDENCE

Cada contexto recuperado deve indicar:

```text
authority
relevance
freshness
verification
conflict state
```

---

# 66. LOW EVIDENCE POLICY

Se a decisão exige conhecimento que não foi encontrado:

```text
INSUFFICIENT_EVIDENCE
```

O Employee deve:

- pedir informação;
- consultar fonte autorizada;
- escalar;
- produzir rascunho com ressalva;

conforme risco.

---

# 67. NO FABRICATION POLICY

Proibido:

```text
invent law
invent policy
invent supplier
invent tax ID
invent document field
invent system state
invent approval
invent factual evidence
```

---

# 68. EXPLAINABILITY

Decision Trace deve permitir visualizar:

```text
Task
Role
Knowledge used
Policy used
Data used
Tools used
Risk
Approval
Output
```

Sem expor cadeia privada de raciocínio do modelo.

---

# 69. KNOWLEDGE CITATIONS IN WORK PRODUCTS

Para outputs que exigem fundamentação:

```text
source_reference
knowledge_id
version
effective_date
```

podem ser anexados como evidência.

---

# 70. SECURITY

Testar:

```text
knowledge poisoning
cross-tenant retrieval
malicious document instructions
prompt injection in SOP
fake regulation
superseded policy
tampered vendor docs
source spoofing
metadata spoofing
privilege escalation via knowledge
```

---

# 71. TRUST LABELS

Aplicar:

```text
SYSTEM
CERTIFIED_PLATFORM
OFFICIAL_REGULATION
ORGANIZATION_APPROVED
VENDOR_VERIFIED
PROFESSIONAL_VERIFIED
VALIDATED_CASE
OPERATIONAL_MEMORY
EXTERNAL_UNTRUSTED
```

---

# 72. KNOWLEDGE QUARANTINE

Novo conteúdo externo não deve ficar activo imediatamente.

Fluxo:

```text
INGESTED
↓
QUARANTINED
↓
PARSED
↓
CLASSIFIED
↓
REVIEWED
↓
VERIFIED
↓
ACTIVE
```

---

# 73. KNOWLEDGE CHANGE IMPACT

Ao actualizar fonte importante:

```text
knowledge item changed
↓
identify affected Employees
↓
affected processes
↓
affected tests
↓
affected policies
↓
affected outputs
↓
re-evaluation
```

---

# 74. REGRESSION ENGINE

Mudança em conhecimento material deve activar testes P04.

Exemplo:

```text
Tax rule changed
↓
affected tax Employees
↓
re-run tax cases
↓
compare outputs
↓
certification status
```

---

# 75. CERTIFICATION

Conhecimento pode ter:

```text
DRAFT
VERIFIED
CERTIFIED
ENTERPRISE_CERTIFIED
SUSPENDED
```

Role Pack certificado + Knowledge Pack não certificado não equivale automaticamente a Employee certificado.

---

# 76. EMPLOYEE COMPETENCE PROFILE

Criar:

```text
employee_id
role_key
domain_coverage
process_coverage
system_coverage
industry_coverage
jurisdiction_coverage
case_coverage
exception_coverage
evaluation_score
certification_status
```

---

# 77. COMPETENCE DOES NOT MEAN UNIVERSAL EXPERTISE

Employee deve saber declarar:

```text
OUT_OF_SCOPE
```

quando o pedido exceder:

```text
role
capability
knowledge
permission
jurisdiction
certification
```

---

# 78. ONBOARDING KNOWLEDGE GAP ANALYSIS

Ao contratar Employee para organização:

```text
Role Requirements
↓
Organization Available Knowledge
↓
System Connections
↓
Jurisdiction
↓
Industry
↓
Gap Analysis
```

Resultado:

```text
READY
READY_WITH_LIMITATIONS
NEEDS_CONFIGURATION
NEEDS_KNOWLEDGE
NOT_CERTIFIED
```

---

# 79. READINESS EXAMPLE

```text
Employee #73

Role knowledge:        READY
Angola pack:           READY
Retail pack:           READY
Organization policy:   READY
ERP connection:        READY
Budget mapping:        MISSING
Management template:   READY

Overall:
READY_WITH_LIMITATIONS
```

---

# 80. KNOWLEDGE ADMIN UI

Criar ecrã:

# Knowledge Center

Mostrar:

```text
Knowledge Packs
Sources
Jurisdictions
Industries
Organizations
Systems
Processes
Cases
Exceptions
Controls
Freshness
Conflicts
Reviews
Certifications
```

---

# 81. EMPLOYEE UI — KNOWLEDGE TAB

Na ficha de cada Employee:

```text
Knowledge
├── Domain
├── Processes
├── Industry
├── Jurisdiction
├── Organization
├── Systems
├── Cases
├── Exceptions
└── Readiness
```

---

# 82. KNOWLEDGE HEALTH DASHBOARD

Métricas:

```text
active_items
stale_items
superseded_items
unverified_items
conflicts
coverage_by_employee
coverage_by_department
coverage_by_jurisdiction
knowledge_age
review_due
```

---

# 83. SOURCE OWNER

Cada fonte importante deve ter owner.

Exemplos:

```text
Tax Team
Legal Team
HR Director
Finance Director
Platform Knowledge Team
Vendor Integration Team
```

---

# 84. HUMAN EXPERT REVIEW

Permitir workflow:

```text
Draft Knowledge
↓
Domain Expert Review
↓
Compliance Review when needed
↓
Approval
↓
Publish
```

---

# 85. EXPERT NETWORK

Futuramente suportar:

```text
Certified Accountants
Lawyers
Tax Specialists
Engineers
Doctors/admin experts
Security Experts
Industry Experts
```

para validar packs específicos.

---

# 86. MARKETPLACE KNOWLEDGE PACKS

Futuramente permitir packs certificados de terceiros.

Exemplos:

```text
Angola Tax Pack
Retail Operations Pack
Construction Safety Pack
Primavera Accounting Pack
```

Requer:

- publisher verification;
- versioning;
- signing;
- evaluation;
- permissions disclosure;
- update policy.

---

# 87. KNOWLEDGE SIGNING

Packs certificados devem possuir:

```text
package_hash
publisher_id
signature
version
issued_at
```

---

# 88. PACKAGE DEPENDENCIES

Exemplo:

```text
Management Reporting Role Pack
depends_on:
- Finance Core Knowledge
- Accounting Core Knowledge
- Management Reporting Process Pack
```

---

# 89. PACK COMPATIBILITY

Definir:

```text
minimum_rolepack_version
supported_runtime_version
supported_jurisdictions
supported_industries
```

---

# 90. KNOWLEDGE VERSION LOCKING

Uma task crítica pode congelar:

```text
rolepack_version
policy_version
knowledge_package_versions
```

durante a execução.

---

# 91. KNOWLEDGE SNAPSHOT

Criar:

`KnowledgeSnapshot`

para tasks materiais.

Campos:

```text
snapshot_id
task_id
employee_id
knowledge_items[]
versions[]
hash
created_at
```

---

# 92. HISTORICAL REPRODUCIBILITY

Deve ser possível reconstruir:

> “Com que conhecimento este Employee tomou esta decisão em 10/09/2026?”

---

# 93. KNOWLEDGE RETENTION

Não apagar versões antigas necessárias para auditoria apenas porque foram substituídas.

Marcar:

```text
SUPERSEDED
```

e aplicar retention policy.

---

# 94. DEPARTMENT IMPLEMENTATION WAVES

Priorizar por risco e valor.

## Wave 1

```text
Documents
Accounting
Finance
Tax & Compliance
HR
Sales
Customer Service
Procurement
Inventory
Operations
Projects
Legal
Audit
```

## Wave 2

```text
IT
Product
Construction
Retail
Hospitality
Real Estate
Public Administration
Facilities
Security
Research
```

## Wave 3

```text
Banking
Insurance
Agriculture
Manufacturing
Energy
Telecom
Mining
Oil & Gas
ESG
Aviation
Pharma
Data & AI Operations
```

---

# 95. 500/500 KNOWLEDGE COMPILER

Criar compilador:

```text
Role Pack
+
Department Pack
+
Role Domain Pack
+
Industry Pack
+
Jurisdiction Pack
+
Organization Pack
+
System Packs
+
Process Packs
+
Exception Library
+
Case Library
=
Effective Knowledge Profile
```

---

# 96. COMPILE-TIME VALIDATION

Para cada Employee validar:

```text
has_role_domain_pack
has_primary_processes
has_common_inputs
has_common_outputs
has_common_documents
has_common_systems
has_common_errors
has_exceptions
has_escalation_rules
has_evidence_rules
has_tests
```

---

# 97. ACCEPTANCE TESTS PER EMPLOYEE

Mínimo:

1. normal case;
2. missing data;
3. ambiguous case;
4. common exception;
5. policy conflict;
6. stale knowledge;
7. wrong-tenant knowledge;
8. prohibited action;
9. human escalation;
10. expected output.

---

# 98. DOMAIN EVALUATION

Avaliar:

```text
factual correctness
process correctness
policy compliance
jurisdiction correctness
system correctness
exception handling
evidence quality
escalation quality
output quality
```

---

# 99. HUMAN BENCHMARK

Comparar Employees contra casos validados por profissionais.

Não usar AI-as-judge como única autoridade para:

```text
law
tax
security
payments
safety-critical work
high-impact HR
```

---

# 100. OPERATIONAL REALITY SCORE

Criar score interno por Employee:

```text
Domain Coverage
Process Coverage
System Coverage
Exception Coverage
Case Coverage
Jurisdiction Coverage
Organization Readiness
Evaluation Performance
```

Não apresentar como “percentagem de inteligência”.

---

# 101. READINESS STATES

```text
UNCONFIGURED
KNOWLEDGE_INCOMPLETE
CONFIGURED
VALIDATED
CERTIFIED
READY_FOR_PRODUCTION
SUSPENDED
```

---

# 102. NO FALSE READY

Não marcar Employee como `READY_FOR_PRODUCTION` apenas porque:

- Role Pack existe;
- prompt existe;
- knowledge files foram carregados.

Exigir testes.

---

# 103. INTEGRATION WITH UNIFIED TASK & COMMAND GATEWAY

Fluxo:

```text
Command/Event
↓
Task
↓
Employee
↓
Knowledge Query Plan
↓
ORDKS
↓
Context Package
↓
Execution
```

---

# 104. INTEGRATION WITH ENTERPRISE DATA GATEWAY

ORDKS descreve:

```text
what data means
what fields are expected
how systems behave
```

Enterprise Data Gateway fornece:

```text
actual organization data
```

Não confundir conhecimento com dados transaccionais.

---

# 105. INTEGRATION WITH DOCUMENT SERVICE

Document Generation Service usa:

```text
Work Product
+
Document Template
+
Organization Branding
+
Relevant Document Knowledge
```

para materializar:

```text
DOCX
PDF
XLSX
PPTX
```

---

# 106. INTEGRATION WITH P03 TOOL SDK

System Knowledge Packs devem mapear:

```text
business concept
→ tool
→ connector
→ operation
→ permission
```

---

# 107. INTEGRATION WITH P04 EVALUATION

Toda alteração material em:

```text
domain pack
jurisdiction pack
organization policy
process pack
system pack
exception rule
```

deve poder acionar regressões.

---

# 108. INTEGRATION WITH P02 SECURITY

Red Team deve testar:

```text
knowledge poisoning
malicious source
fake policy
fake law
tenant leak
stale law
prompt injection
memory poisoning
publisher compromise
pack tampering
```

---

# 109. INTEGRATION WITH P05 INFRASTRUCTURE

ORDKS deve suportar:

```text
versioned storage
metadata DB
vector/search index
graph store or graph abstraction
object storage
queues
background indexing
observability
backups
restore
```

---

# 110. INTEGRATION WITH P06 MARKETPLACE

Knowledge Packs de terceiros só poderão ser instalados com:

```text
publisher
version
permissions
jurisdiction
scope
signature
evaluation status
```

---

# 111. INTEGRATION WITH P07 RELEASE READINESS

Adicionar gate:

```text
K — KNOWLEDGE READINESS
```

No-Go quando:

```text
critical Employees lack verified knowledge
jurisdiction pack missing for regulated deployment
stale critical legal rules unresolved
cross-tenant knowledge retrieval found
critical knowledge conflicts unresolved
```

---

# 112. DATABASE ENTITIES

Criar:

```text
knowledge_items
knowledge_sources
knowledge_versions
knowledge_packages
knowledge_package_versions
knowledge_package_dependencies
knowledge_reviews
knowledge_conflicts
knowledge_snapshots
domain_packs
department_packs
industry_packs
jurisdiction_packs
organization_packs
system_packs
process_packs
document_schema_packs
data_schema_packs
exception_library
case_library
control_library
calculation_registry
decision_rule_registry
learning_candidates
knowledge_certifications
knowledge_usage_events
```

---

# 113. API SURFACE

Exemplos:

```text
GET  /knowledge
POST /knowledge
GET  /knowledge/{id}
POST /knowledge/{id}/verify
POST /knowledge/{id}/supersede

GET  /knowledge-packs
POST /knowledge-packs
POST /knowledge-packs/{id}/publish

GET  /employees/{id}/knowledge-profile
GET  /employees/{id}/knowledge-readiness
POST /employees/{id}/knowledge/compile

GET  /exceptions
POST /exceptions

GET  /cases
POST /cases

GET  /knowledge-conflicts
POST /knowledge-conflicts/{id}/resolve

POST /learning-candidates
POST /learning-candidates/{id}/approve
```

---

# 114. OBSERVABILITY

Medir:

```text
knowledge_retrievals
retrieval_latency
items_used_per_task
stale_items_used
conflicts_detected
low_evidence_events
knowledge_gap_events
human_corrections
learning_candidates
approved_learnings
regression_failures
coverage_by_employee
```

---

# 115. COST CONTROL

Medir:

```text
indexing cost
embedding cost
retrieval cost
reranking cost
graph lookup cost
AI context cost
storage cost
human review cost
```

---

# 116. EFFICIENT RETRIEVAL

Prioridade:

```text
structured lookup
→ metadata filtered retrieval
→ semantic retrieval
→ graph expansion
```

Não executar consultas caras sem necessidade.

---

# 117. SAFE FAILURE

Se ORDKS estiver indisponível:

- tasks de baixo risco podem usar contexto mínimo conforme política;
- tasks reguladas/materials devem bloquear ou escalar;
- nunca fingir que knowledge foi recuperado.

---

# 118. ERROR CODES

```text
KNOWLEDGE_NOT_FOUND
KNOWLEDGE_INSUFFICIENT
KNOWLEDGE_STALE
KNOWLEDGE_SUPERSEDED
KNOWLEDGE_CONFLICT
KNOWLEDGE_UNVERIFIED
KNOWLEDGE_TENANT_ACCESS_DENIED
KNOWLEDGE_PACKAGE_INVALID
KNOWLEDGE_PACKAGE_TAMPERED
KNOWLEDGE_JURISDICTION_MISMATCH
KNOWLEDGE_INDUSTRY_MISMATCH
KNOWLEDGE_PROCESS_MISMATCH
KNOWLEDGE_CERTIFICATION_REQUIRED
LEARNING_REVIEW_REQUIRED
```

---

# 119. IMPLEMENTATION PHASES

## Phase 1 — Foundations

- schemas;
- package registry;
- knowledge item model;
- versioning;
- source authority;
- status;
- tenant isolation.

## Phase 2 — Core Packs

- Department Packs;
- Domain Packs;
- Process Packs;
- Document/Data Schemas.

## Phase 3 — Exceptions & Cases

- Exception Library;
- Case Library;
- Control Library;
- Golden/Negative/Edge cases.

## Phase 4 — Organization Knowledge

- onboarding;
- SOP ingestion;
- policy ingestion;
- templates;
- approval matrices;
- master data mapping.

## Phase 5 — System Knowledge

- Excel;
- Power Query;
- Primavera;
- Microsoft 365;
- Google Workspace;
- ERP/CRM adapters.

## Phase 6 — Jurisdiction

- framework;
- Angola Pack;
- regulatory versioning;
- effective dates;
- stale/superseded handling.

## Phase 7 — Retrieval & Graph

- metadata filtering;
- hybrid retrieval;
- graph relationships;
- reranking;
- context packages.

## Phase 8 — Learning Loop

- human corrections;
- learning candidates;
- review;
- regression;
- publish.

## Phase 9 — 500/500 Compilation

- role profiles;
- coverage matrix;
- gap analysis;
- readiness.

## Phase 10 — Evaluation & Release

- P04;
- P02;
- P07;
- human benchmarks.

---

# 120. FINAL VALIDATION MATRIX

Gerar:

```text
employee_id
role_key
department
domain_pack
department_pack
primary_processes
industry_compatible
jurisdiction_ready
organization_ready
system_knowledge_ready
exception_coverage
case_coverage
control_coverage
evaluation_status
certification_status
```

---

# 121. RELEASE GATE

Resultado mínimo:

```text
CATALOG:                    500/500
ROLE KNOWLEDGE PROFILES:    500/500
DOMAIN COVERAGE:            PASS
PROCESS COVERAGE:           PASS
EXCEPTION COVERAGE:         PASS
CASE COVERAGE:              PASS
TENANT ISOLATION:           PASS
KNOWLEDGE VERSIONING:       PASS
STALE KNOWLEDGE CONTROL:    PASS
CONFLICT ENGINE:            PASS
LEARNING GOVERNANCE:        PASS
AUDIT / PROVENANCE:         PASS
```

---

# 122. PRINCÍPIO FINAL

Um AI Employee não deve ser considerado operacionalmente competente apenas porque:

```text
tem um nome
tem um Role Pack
tem um prompt
tem acesso a um LLM
```

Ele deve demonstrar conhecimento verificável da realidade da função.

O objectivo do ORDKS é transformar:

```text
"sei qual é a minha profissão"
```

em:

```text
"sei como esta profissão é realmente exercida,
sei quais dados e documentos aparecem,
sei quais sistemas são usados,
sei quais erros são frequentes,
sei quais excepções existem,
sei quais controlos devo respeitar,
sei quais regras estão activas,
sei quando a evidência é insuficiente,
sei quando devo parar,
sei quando devo perguntar,
sei quando devo escalar,
e consigo demonstrar de onde veio a minha conclusão."
```

---

# 123. ARQUITECTURA CONSOLIDADA DO AI EMPLOYEE

```text
UNIFIED TASK / COMMAND / EVENT GATEWAY
        ↓
TASK ENGINE
        ↓
ROLE PACK RESOLVER
        ↓
WORK CONTRACT
        ↓
OPERATIONAL REALITY & DOMAIN KNOWLEDGE SYSTEM
        ↓
ENTERPRISE DATA / CONNECTOR LAYER
        ↓
PERMISSION / POLICY / RISK / APPROVAL
        ↓
AI EMPLOYEE RUNTIME
        ↓
TOOLS / WORKFLOWS
        ↓
WORK PRODUCT
        ↓
DOCUMENT GENERATION SERVICE quando aplicável
        ↓
DELIVERY ROUTER
        ↓
HUMAN / SYSTEM / ANOTHER EMPLOYEE
        ↓
AUDIT + LINEAGE + DELIVERY RECEIPT
```

---

# 124. ENTREGÁVEIS À IA DE DESENVOLVIMENTO

Gerar:

```text
schemas/knowledge-item.schema.json
schemas/knowledge-package.schema.json
schemas/role-knowledge-profile.schema.json
schemas/operational-exception.schema.json
schemas/domain-case.schema.json
schemas/control.schema.json
schemas/knowledge-snapshot.schema.json
schemas/learning-candidate.schema.json

generated/role-knowledge-profiles.500.json
generated/department-packs.json
generated/domain-packs.json
generated/process-packs.json
generated/exception-library.json
generated/case-library.json
generated/control-library.json
generated/knowledge-coverage-matrix.500.json

db/migrations/...
db/seeds/...

packages/knowledge-registry/...
packages/knowledge-retrieval/...
packages/knowledge-graph/...
packages/knowledge-conflict-engine/...
packages/knowledge-learning/...
packages/knowledge-evaluation/...

tests/knowledge/
tests/500-role-knowledge/
tests/security/
tests/regression/

docs/KNOWLEDGE_ARCHITECTURE.md
docs/500_EMPLOYEE_KNOWLEDGE_COVERAGE.md
docs/OPERATIONAL_REALITY_MODEL.md
docs/JURISDICTION_PACKS.md
docs/KNOWLEDGE_RELEASE_READINESS.md
```

---

# 125. REGRA DE INTEGRIDADE

Não alterar os IDs 1–500.

Não eliminar Role Packs.

Não duplicar `role_key`.

Não alterar permissões máximas apenas por adicionar conhecimento.

Conhecimento nunca concede permission.

Conhecimento nunca aumenta autonomia automaticamente.

Conhecimento nunca substitui approval.

Conhecimento nunca contorna policy.

Se a compilação resultar em menos de 500 perfis:

```text
BUILD FAIL
```

---

# 126. DEFINITION OF DONE

O ORDKS só pode ser considerado implementado quando:

```text
✓ 500/500 Employees têm Role Knowledge Profile
✓ Department Packs existem
✓ Domain Packs existem
✓ Process Packs existem
✓ Industry Packs suportados
✓ Jurisdiction framework existe
✓ Organization Packs existem
✓ System Knowledge Packs existem
✓ Exception Library existe
✓ Case Library existe
✓ Control Library existe
✓ Calculation Registry existe
✓ Decision Rule Registry existe
✓ Knowledge Graph/relationship layer existe
✓ Retrieval com tenant/effective-date filtering existe
✓ Provenance existe
✓ Knowledge Snapshot existe
✓ Conflict Engine existe
✓ Stale/Superseded handling existe
✓ Human correction learning loop existe
✓ No direct unsafe self-learning
✓ P04 regression integration existe
✓ P02 security tests passam
✓ 500/500 compilation passa
✓ Release Gate passa
```

---

# 127. RESULTADO ESPERADO

Depois desta implementação, a plataforma deve conseguir distinguir claramente:

```text
O EMPLOYEE SABE A PROFISSÃO
+
SABE O PROCESSO
+
SABE O SECTOR
+
SABE O PAÍS
+
SABE A EMPRESA
+
SABE OS SISTEMAS
+
SABE OS DOCUMENTOS
+
SABE AS EXCEPÇÕES
+
SABE OS CONTROLOS
+
SABE OS LIMITES
+
SABE QUANDO ESCALAR
```

O resultado não deve ser um chatbot que "parece especialista".

Deve ser um **especialista digital operacionalmente governado, verificável, versionado, auditável e configurável para a realidade de cada empresa**.
