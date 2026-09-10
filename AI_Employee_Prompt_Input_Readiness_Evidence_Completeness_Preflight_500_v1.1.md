# PROMPT MESTRE — AI EMPLOYEE INPUT READINESS, EVIDENCE COMPLETENESS & PREFLIGHT ENGINE
## Garantia de Inputs Correctos, Completos, Actuais, Coerentes e Autorizados antes da Execução dos 500 AI Employees

**Sigla:** IRECE  
**Versão:** 1.1  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program

---

# 0. OBJECTIVO

Implementar uma camada nuclear da plataforma responsável por verificar, antes de qualquer execução material, se o AI Employee recebeu a informação adequada para produzir um resultado correcto, completo e auditável.

O sistema deve responder antes de executar:

```text
O Employee recebeu:
✓ os dados certos?
✓ da empresa certa?
✓ do período certo?
✓ no formato certo?
✓ completos?
✓ actualizados?
✓ coerentes entre si?
✓ provenientes de fontes autorizadas?
✓ suficientes para este tipo exacto de tarefa?
```

A plataforma não deve transferir para o cliente a obrigação de conhecer tecnicamente todos os inputs necessários.

O cliente deve poder começar por dizer apenas:

```text
“Quero o relatório de gestão de Agosto.”
```

e a plataforma deve descobrir:

```text
o que é necessário
o que já existe
onde está
o que falta
o que está desactualizado
o que está em conflito
o que precisa ser confirmado
```

---

# 1. INSTRUÇÃO À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Arquitecto de Sistemas Multiagente;
- Engenheiro de Dados;
- Engenheiro de Data Quality;
- Especialista em Master Data;
- Especialista em Document Intelligence;
- Especialista em Accounting/Finance Data;
- Especialista em Enterprise Search;
- Especialista em Data Lineage;
- Especialista em Knowledge Systems;
- Especialista em Human-in-the-Loop;
- Especialista em Reliability;
- Especialista em Audit;
- Especialista em Workflow;
- Especialista em UX empresarial;
- Especialista em Validation Engines;
- Especialista em Multi-Tenant Security.

Implemente:

# **AI EMPLOYEE INPUT READINESS, EVIDENCE COMPLETENESS & PREFLIGHT ENGINE — IRECE**

como camada transversal a todos os 500 AI Employees.

Reutilizar obrigatoriamente:

```text
Runtime Orchestrator
RolePack Registry
Work Contracts
ORDKS
Enterprise Search
PEIP
GWNIS
Enterprise Data Gateway
Connector SDK
Permission Engine
Policy Engine
Risk Engine
Approval Gateway
EREMS
CAQRS
EMVTCS
EPTOWDS
Audit
Observability
Organization Pack
```

Não criar runtime separado.

---

# 2. PRINCÍPIO FUNDAMENTAL

A plataforma deve substituir:

```text
USER PROVIDES FILE
↓
EMPLOYEE STARTS WORK
```

por:

```text
USER REQUESTS OUTCOME
↓
TASK TYPE RESOLVED
↓
INPUT REQUIREMENTS RESOLVED
↓
AVAILABLE DATA DISCOVERED
↓
DATA VALIDATED
↓
READINESS DECISION
↓
ONLY THEN EXECUTE
```

---

# 3. PRE-FLIGHT OBRIGATÓRIO

Criar fase obrigatória:

```text
TASK_PREFLIGHT
```

antes de:

```text
EXECUTION
```

---

# 4. STATE MACHINE

Estados:

```text
TASK_REQUESTED
↓
TASK_TYPE_RESOLVING
↓
INPUT_REQUIREMENTS_LOADING
↓
SOURCE_DISCOVERY
↓
INPUT_VALIDATION
↓
READINESS_ASSESSMENT
```

Resultados possíveis:

```text
READY
READY_WITH_WARNINGS
NEEDS_DATA
NEEDS_CLARIFICATION
DATA_CONFLICT
STALE_DATA
INVALID_DATA
UNAUTHORIZED_SOURCE
BLOCKED
```

---

# 5. EXECUTION GATE

Execução só pode iniciar se:

```text
status = READY
```

ou, quando permitido:

```text
status = READY_WITH_WARNINGS
```

---

# 6. READY_WITH_WARNINGS

Só usar se:

```text
missing information is non-blocking
+
result limitations can be explicitly disclosed
+
risk policy permits
```

---

# 7. BLOCKING INPUT

Se input obrigatório estiver ausente:

```text
NEEDS_DATA
```

---

# 8. TASK TYPE RESOLUTION

Antes de verificar dados, identificar exactamente o tipo de trabalho.

Exemplo:

```text
Management Reporting Employee
```

pode executar:

```text
monthly_management_report
board_summary
variance_analysis
kpi_report
cash_performance_summary
```

Cada um pode exigir inputs diferentes.

---

# 9. EMPLOYEE INPUT REQUIREMENT PROFILE

Criar para todos os 500:

`EmployeeInputRequirementProfile`

---

# 10. PROFILE FIELDS

```text
employee_id
role_key
task_type
required_inputs
conditional_inputs
recommended_inputs
optional_inputs
forbidden_inputs
source_preferences
validation_rules
freshness_rules
completeness_rules
consistency_rules
stop_conditions
clarification_rules
degraded_execution_rules
```

---

# 11. INPUT CLASSIFICATIONS

Usar:

```text
REQUIRED
CONDITIONAL
RECOMMENDED
OPTIONAL
FORBIDDEN
```

---

# 12. REQUIRED

Sem este input:

```text
do not complete the task
```

---

# 13. CONDITIONAL

Obrigatório apenas quando:

```text
specific scope
specific jurisdiction
specific analysis
specific output
specific transaction type
```

se aplica.

---

# 14. RECOMMENDED

Melhora materialmente qualidade, mas pode não bloquear.

---

# 15. OPTIONAL

Enriquece o resultado.

---

# 16. FORBIDDEN

Employee não pode usar essa fonte/dado para aquela tarefa.

---

# 17. EXAMPLE — MANAGEMENT REPORTING

```yaml
employee_id: 73
task_type: monthly_management_report

required:
  - trial_balance
  - sales_data
  - expense_data

conditional:
  - inventory_data
  - bank_data
  - budget_data
  - cost_center_data

recommended:
  - prior_period
  - targets
  - prior_year_comparison

optional:
  - management_notes
  - market_context
```

---

# 18. EXAMPLE — BANK RECONCILIATION

```yaml
employee_id: 64
task_type: monthly_bank_reconciliation

required:
  - bank_statement
  - ledger_bank_account

conditional:
  - opening_balance_confirmation
  - prior_reconciliation

recommended:
  - bank_reference_mapping
  - known_reconciling_items
```

---

# 19. EXAMPLE — DOCUMENT CREATOR

```yaml
employee_id: 261
task_type: bank_letter

required:
  - organization_legal_name
  - tax_id
  - recipient
  - purpose
  - authorized_signatory

conditional:
  - bank_account_number
  - branch
  - reference_number

recommended:
  - approved_letterhead
  - approved_template
```

---

# 20. INPUT ITEM MODEL

Criar:

`TaskInputRequirement`

Campos:

```text
requirement_id
task_type
semantic_type
classification
description
accepted_formats
accepted_sources
freshness_window
validation_rules
blocking
```

---

# 21. INPUT INSTANCE

Criar:

`TaskInputInstance`

Campos:

```text
task_id
requirement_id
source_ref
source_type
document_id
dataset_id
status
validated_at
validation_result
freshness
completeness
consistency
authorization
confidence
```

---

# 22. SIX VALIDATION DIMENSIONS

Cada input deve ser avaliado em:

```text
PRESENCE
VALIDITY
COMPLETENESS
FRESHNESS
CONSISTENCY
AUTHORIZATION
```

---

# 23. PRESENCE

Pergunta:

```text
Does it exist?
```

Estados:

```text
PRESENT
MISSING
UNKNOWN
```

---

# 24. VALIDITY

Pergunta:

```text
Is this really the required data/document?
```

---

# 25. COMPLETENESS

Pergunta:

```text
Is the required content complete?
```

---

# 26. FRESHNESS

Pergunta:

```text
Is it current enough for this task?
```

---

# 27. CONSISTENCY

Pergunta:

```text
Does it agree with related sources?
```

---

# 28. AUTHORIZATION

Pergunta:

```text
Is the Employee allowed to use this source?
```

---

# 29. VALIDATION RESULT

Por dimensão:

```text
PASS
WARNING
FAIL
UNKNOWN
NOT_APPLICABLE
```

---

# 30. INPUT READINESS DECISION

Criar:

`InputReadinessDecision`

---

# 31. DECISION FIELDS

```text
task_id
employee_id
task_type
status
blocking_issues
warnings
missing_required
missing_recommended
conflicts
stale_inputs
unauthorized_inputs
coverage_summary
decision_at
```

---

# 32. SOURCE DISCOVERY

Antes de pedir ficheiros ao cliente, procurar automaticamente em fontes autorizadas.

---

# 33. SOURCE ORDER

Exemplo:

```text
Organization Pack
↓
ERP / Primavera
↓
Google Drive
↓
Google Docs
↓
Google Sheets
↓
Excel Automation
↓
Bank Read-Only
↓
DMS
↓
Email
↓
Manual Upload
```

A ordem pode variar por task type.

---

# 34. DISCOVERY QUERY PLAN

Criar:

`InputDiscoveryPlan`

com:

```text
semantic requirement
preferred sources
fallback sources
period
organization
legal entity
expected schema
```

---

# 35. NO GLOBAL SEARCH

Pesquisa respeita:

```text
tenant
organization
legal entity
department
Employee permissions
source scope
```

---

# 36. AUTOMATIC DISCOVERY EXAMPLE

Cliente:

```text
“Prepare o relatório de Agosto.”
```

Sistema:

```text
Need:
Trial Balance
Sales
Expenses
Budget
Stock
Bank

Search:
Primavera
Drive
Sheets
Bank
```

---

# 37. DISCOVERY RESULT

Exemplo:

```text
Trial Balance      FOUND
Sales              FOUND
Expenses           FOUND
Budget             FOUND
Stock              FOUND
Bank               NOT_CONNECTED
```

---

# 38. ASK ONLY FOR WHAT IS MISSING

Não pedir ao cliente novamente informação já disponível e validada.

---

# 39. SMART REQUEST

Exemplo:

```text
“Já encontrei o balancete, vendas, stock e orçamento.
Falta apenas o extracto bancário de Agosto.
Pode carregá-lo ou ligar a conta em modo read-only.”
```

---

# 40. SOURCE CANDIDATES

Se existirem vários:

```text
Candidate A
Candidate B
Candidate C
```

---

# 41. DISAMBIGUATION

Se escolha não for segura:

```text
NEEDS_CLARIFICATION
```

---

# 42. NO BLIND FIRST MATCH

Obrigatório.

---

# 43. PERIOD VALIDATION

Verificar:

```text
requested period
source period
```

---

# 44. ORGANIZATION VALIDATION

Verificar:

```text
organization_id
legal_entity_id
```

---

# 45. DOCUMENT TYPE VALIDATION

Exemplo:

```text
Trial_Balance.xlsx
```

nome do ficheiro não é prova suficiente.

Validar conteúdo/schema.

---

# 46. SCHEMA VALIDATION

Para spreadsheet:

```text
required columns
types
period
totals
keys
```

---

# 47. PDF/DOCUMENT VALIDATION

Verificar:

```text
document type
issuer
recipient
period
key fields
page completeness
```

---

# 48. DATASET COMPLETENESS

Exemplo:

```text
Bank statement:
01/08–31/08
```

é completo para Agosto.

```text
01/08–28/08
```

pode ser incompleto.

---

# 49. BALANCE VALIDATION

Quando aplicável:

```text
opening balance
debits
credits
closing balance
```

---

# 50. CROSS-SOURCE CONSISTENCY

Exemplos:

```text
Bank closing balance
vs
ledger balance

Sales total
vs
ledger revenue

Inventory movement
vs
stock report

Payroll total
vs
accounting posting
```

---

# 51. CONFLICT ENGINE

Criar:

`InputConflict`

Campos:

```text
conflict_id
task_id
source_a
source_b
field/concept
value_a
value_b
materiality
status
resolution
```

---

# 52. CONFLICT STATUS

```text
OPEN
UNDER_REVIEW
RESOLVED
ACCEPTED_DIFFERENCE
BLOCKING
```

---

# 53. MATERIALITY

Nem toda diferença bloqueia.

Classificar:

```text
MINOR
OPERATIONAL
MATERIAL
CRITICAL
```

---

# 54. STALE DATA

Criar:

```text
STALE_DATA
```

quando fonte ultrapassa freshness policy.

---

# 55. FRESHNESS POLICY

Por task type:

```text
real-time
same-day
current period
latest approved version
within N days
```

---

# 56. VERSION SELECTION

Se houver várias versões:

```text
select latest valid approved version
```

não simplesmente a mais recente por timestamp.

---

# 57. APPROVED VS DRAFT

Distinguir:

```text
DRAFT
APPROVED
SUPERSEDED
```

---

# 58. DATA QUALITY ENGINE

Integrar Data Quality.

Regras:

```text
missing values
duplicates
invalid types
invalid dates
outliers
broken formulas
negative impossible values
schema drift
partial data
```

---

# 59. TASK-SPECIFIC VALIDATION

A mesma fonte pode ser suficiente para uma tarefa e insuficiente para outra.

---

# 60. EXAMPLE

```text
Sales Summary
```

pode precisar apenas de:

```text
sales data
```

Mas:

```text
Profitability Analysis
```

precisa de:

```text
sales
costs
expenses
allocation rules
```

---

# 61. STOP CONDITIONS

Cada Employee deve ter:

```text
stop_conditions[]
```

---

# 62. EXAMPLE STOP CONDITIONS — #73

```text
missing trial balance
wrong reporting period
unresolved material source conflict
wrong legal entity
```

---

# 63. EXAMPLE STOP CONDITIONS — #64

```text
missing bank statement
missing ledger account
statement period incomplete
bank account mismatch
```

---

# 64. ASK CONDITIONS

Criar:

```text
clarification_rules[]
```

---

# 65. SAFE QUESTIONS

Perguntas devem ser:

```text
specific
minimal
actionable
```

---

# 66. BAD QUESTION

```text
“Envie todos os documentos necessários.”
```

---

# 67. GOOD QUESTION

```text
“Falta o extracto bancário da conta terminada em 3472 para o período 01/08–31/08.”
```

---

# 68. MULTIPLE MISSING ITEMS

Agrupar inteligentemente.

---

# 69. DO NOT OVERWHELM USER

Mostrar primeiro:

```text
blocking items
```

depois:

```text
recommended items
```

---

# 70. READINESS UI

Criar componente:

`TaskReadinessPanel`

---

# 71. PANEL

Mostrar:

```text
Task
Employee
Period
Organization
Readiness Status
Required Inputs
Warnings
Conflicts
Optional Enhancements
```

---

# 72. EXAMPLE UI

```text
RELATÓRIO DE GESTÃO — AGOSTO 2026

Balancete                 ✓ Validado
Vendas                    ✓ Validado
Despesas                  ✓ Validado
Stock                     ✓ Validado
Orçamento                 ✓ Validado
Banco                     ⚠ Não ligado
Comparativo anterior      ○ Opcional

ESTADO
READY_WITH_WARNINGS

[ Ver dados usados ]
[ Adicionar informação ]
[ Ligar banco ]
[ Iniciar trabalho ]
```

---

# 73. DO NOT RELY ON PERCENTAGE ALONE

Pode mostrar:

```text
readiness score
```

mas nunca substituir bloqueadores explícitos.

---

# 74. COVERAGE

Criar:

`TaskEvidenceCoverage`

---

# 75. COVERAGE DIMENSIONS

```text
financial
operational
temporal
organizational
source
```

---

# 76. RESULT LIMITATION

Se executar com aviso:

```text
result must explicitly disclose limitations
```

---

# 77. RESULT COVERAGE

Exemplo:

```text
Sales Analysis          COMPLETE
Expense Analysis        COMPLETE
Inventory Analysis      COMPLETE
Cash Analysis           LIMITED
Budget Comparison       COMPLETE
```

---

# 78. LIMITATION BLOCK

Todo output deve poder incluir:

```text
Data Coverage
Known Limitations
Missing Sources
Stale Sources
Conflicts
```

---

# 79. NO FALSE COMPLETENESS

Documento profissional não pode parecer completo quando não é.

---

# 80. LOW-COVERAGE OUTPUT

Se cobertura abaixo do mínimo:

```text
BLOCK FINALIZATION
```

---

# 81. TASK EXECUTION CONTRACT

Adicionar ao Work Contract:

```text
input_readiness_policy
minimum_evidence_coverage
degraded_mode_allowed
```

---

# 82. 500/500 COVERAGE

Todos os 500 Employees devem receber:

```text
EmployeeInputRequirementProfile
```

---

# 83. PROFILE GENERATION

Gerar por Role:

```text
supported_task_types
required inputs
conditional inputs
recommended inputs
optional inputs
validation
freshness
consistency
stop
clarification
```

---

# 84. NO GENERIC SAME PROFILE

Não aplicar o mesmo perfil aos 500.

---

# 85. DOMAIN-SPECIFIC PROFILES

Exemplo:

```text
Finance Employee
≠
HR Employee
≠
Construction Employee
≠
Insurance Employee
```

---

# 86. TASK-TYPE DEPENDENCY

Dentro do mesmo Employee:

```text
Task A requirements
≠
Task B requirements
```

---

# 87. INPUT SEMANTIC REGISTRY

Criar:

`InputSemanticRegistry`

---

# 88. EXAMPLES

```text
IN.TRIAL_BALANCE
IN.SALES_DATA
IN.BANK_STATEMENT
IN.INVENTORY
IN.CUSTOMER_MASTER
IN.SUPPLIER_MASTER
IN.CONTRACT
IN.POLICY
IN.USER_BRIEF
```

---

# 89. SOURCE MAPPING

Cada semantic input pode mapear para:

```text
file
database
API
ERP
Drive
Docs
Sheets
Bank
manual form
```

---

# 90. SOURCE PREFERENCE

Exemplo:

```text
IN.TRIAL_BALANCE
1 Primavera
2 Approved Excel
3 Google Sheets
4 Manual Upload
```

---

# 91. SOURCE AUTHORITY

Aplicar ORDKS source authority.

---

# 92. SOURCE TRUST

Estados:

```text
CERTIFIED_SYSTEM
APPROVED_INTERNAL
VERIFIED_EXTERNAL
UNVERIFIED_EXTERNAL
USER_PROVIDED
```

---

# 93. UNVERIFIED EXTERNAL

Pode exigir validação adicional.

---

# 94. DATA PROVENANCE

Guardar:

```text
source
retrieved_at
source_version
hash
owner
mapping
```

---

# 95. EVIDENCE SNAPSHOT

Antes de execução:

```text
TaskInputSnapshot
```

---

# 96. SNAPSHOT CONTENT

```text
task_id
employee_id
task_type
input_refs
versions
hashes
readiness decision
warnings
created_at
```

---

# 97. REPRODUCIBILITY

Resultado deve poder ser reproduzido com o mesmo input snapshot, subject to model/runtime versioning.

---

# 98. CHANGE AFTER PREFLIGHT

Se input muda antes da execução:

```text
re-run preflight
```

---

# 99. CHANGE DURING EXECUTION

Se material:

```text
pause
invalidate snapshot
revalidate
```

---

# 100. INPUT LOCK

Para tarefas materiais:

```text
freeze input snapshot
```

---

# 101. SOURCE ARRIVAL EVENT

Se dado em falta chega:

```text
EV.input.available
```

---

# 102. AUTOMATIC RESUME

Pode retomar tarefa apenas se:

```text
policy allows
+
readiness re-evaluated
```

---

# 103. USER NOTIFICATION

Exemplo:

```text
“A informação em falta foi recebida.
O Employee está pronto para continuar.”
```

---

# 104. CONNECTOR-AWARE READINESS

Se source connector estiver down:

```text
WAITING_CONNECTION
```

---

# 105. NO STALE SILENT CACHE

Mostrar stale state.

---

# 106. ORGANIZATION MASTER DATA

Validar contra Organization Pack:

```text
legal name
NIF/tax id
currency
fiscal period
legal entity
cost centers
departments
```

---

# 107. WRONG COMPANY

Se documento pertence a outra empresa:

```text
WRONG_LEGAL_ENTITY
→ BLOCK
```

---

# 108. WRONG PERIOD

```text
WRONG_PERIOD
→ BLOCK or WARNING
```

conforme task.

---

# 109. DUPLICATE DOCUMENT

Detectar por:

```text
hash
document number
date
amount
source
```

---

# 110. DUPLICATE HANDLING

Não contar duas vezes.

---

# 111. MISSING PAGE

PDF/documento incompleto:

```text
DOCUMENT_INCOMPLETE
```

---

# 112. MISSING SHEET

Spreadsheet sem folha esperada:

```text
SPREADSHEET_INCOMPLETE
```

---

# 113. BROKEN FORMULA

```text
FORMULA_ERROR
```

---

# 114. UNKNOWN COLUMN MAPPING

```text
WAITING_MAPPING_APPROVAL
```

---

# 115. UNIT / CURRENCY VALIDATION

Verificar:

```text
AOA
USD
EUR
units
kg
litres
etc.
```

---

# 116. CURRENCY CONFLICT

Se fontes misturam moeda sem regra:

```text
NEEDS_CLARIFICATION
```

---

# 117. DATE FORMAT

Normalizar com locale-aware parser.

---

# 118. JURISDICTION CONTEXT

Task pode exigir:

```text
jurisdiction
```

---

# 119. JURISDICTION MISSING

Se relevante:

```text
NEEDS_CLARIFICATION
```

---

# 120. USER INTENT COMPLETENESS

Além de dados, verificar se o pedido está suficientemente definido.

---

# 121. INTENT REQUIREMENTS

Exemplo:

```text
output type
period
organization
audience
purpose
```

---

# 122. USER BRIEF PROFILE

Criar:

`TaskBriefRequirementProfile`

---

# 123. EXAMPLE — LETTER

Precisa de:

```text
recipient
purpose
organization
signatory
```

---

# 124. EXAMPLE — REPORT

Precisa de:

```text
period
audience
report type
```

---

# 125. BRIEF STATUS

```text
COMPLETE
NEEDS_CLARIFICATION
```

---

# 126. READINESS = DATA + BRIEF

```text
Task Readiness
=
Input Readiness
+
Brief Readiness
+
Permission Readiness
+
Connector Readiness
+
Knowledge Readiness
```

---

# 127. KNOWLEDGE READINESS

Se task depende de regulation/policy:

```text
required knowledge pack active?
```

---

# 128. STALE KNOWLEDGE

Pode bloquear.

---

# 129. SYSTEM READINESS

Se Employee precisa de tool/connector:

```text
tool available?
connector healthy?
```

---

# 130. PERMISSION READINESS

Se não pode ler source requerido:

```text
UNAUTHORIZED_SOURCE
```

---

# 131. TOTAL PREFLIGHT

Criar:

`TaskPreflightResult`

---

# 132. PREFLIGHT COMPONENTS

```text
brief
inputs
knowledge
permissions
connectors
risk
approvals
```

---

# 133. PREFLIGHT DECISION

```text
READY
READY_WITH_WARNINGS
NOT_READY
BLOCKED
```

---

# 134. EXPLAINABILITY

Preflight deve dizer:

```text
what is ready
what is missing
why it matters
what user should do
```

---

# 135. NO TECHNICAL JARGON ONLY

Cliente deve receber linguagem simples.

---

# 136. TECHNICAL DETAILS

Admin pode abrir:

```text
Advanced Details
```

---

# 137. CLIENT ACTIONS

Botões:

```text
Upload Missing Data
Connect Source
Select Correct File
Resolve Conflict
Confirm Period
Continue With Limitations
Cancel
```

---

# 138. CONTINUE WITH LIMITATIONS

Só permitido se:

```text
degraded_mode_allowed = true
```

---

# 139. CLIENT ACKNOWLEDGEMENT

Para limitation material:

```text
explicit acknowledgement
```

---

# 140. NO ACKNOWLEDGEMENT FOR UNSAFE GAP

Algumas lacunas não podem ser ignoradas.

---

# 141. EXAMPLE — BANK RECONCILIATION

Falta statement:

```text
cannot continue
```

---

# 142. EXAMPLE — MANAGEMENT REPORT

Falta optional market note:

```text
can continue
```

---

# 143. EREMS INTEGRATION

Se Employee executa apesar de blocking gap por bug:

```text
system failure
+
reliability incident
```

---

# 144. CAQRS INTEGRATION

Se cliente reclama de informação não fornecida:

classificar correctamente:

```text
INPUT_GAP
CLIENT_REQUIREMENT_GAP
EMPLOYEE_MISS
```

---

# 145. INPUT RESPONSIBILITY ATTRIBUTION

Criar:

```text
CLIENT_MISSING_INPUT
SYSTEM_FAILED_TO_RETRIEVE
EMPLOYEE_FAILED_TO_REQUEST
CONNECTOR_FAILED
DATA_INVALID
UNKNOWN
```

---

# 146. NO UNFAIR EMPLOYEE PENALTY

Se cliente não forneceu obrigatório e system pediu correctamente:

```text
not Employee error
```

---

# 147. NO UNFAIR CLIENT BLAME

Se dado já estava no sistema e platform não encontrou:

```text
system retrieval failure
```

---

# 148. PREVENTABLE INPUT FAILURE

Medir.

---

# 149. INPUT METRICS

Criar:

```text
Input Readiness Pass Rate
Missing Required Input Rate
Data Conflict Rate
Stale Input Rate
Wrong Period Rate
Wrong Entity Rate
Automatic Discovery Success Rate
Human Clarification Rate
Preventable Input Failure Rate
```

---

# 150. FIRST-PASS READINESS

Métrica:

```text
tasks ready without additional client intervention
```

---

# 151. CLIENT EFFORT METRIC

Medir:

```text
number of extra requests
time to provide missing data
```

---

# 152. GOAL

Reduzir progressivamente:

```text
client setup burden
```

sem relaxar validação.

---

# 153. READINESS PASSPORT

Criar:

`TaskReadinessPassport`

---

# 154. PASSPORT CONTENT

```text
task
employee
task_type
inputs
validation
coverage
warnings
conflicts
readiness decision
snapshot
```

---

# 155. AUDIT

Guardar:

```text
what was requested
what was discovered
what was missing
what was asked
what client provided
what was validated
why execution was allowed
```

---

# 156. UI — EMPLOYEE CATALOG EXTENSION

Adicionar a cada Employee:

```text
WHAT YOU RECEIVE
WHAT YOU NEED TO PROVIDE
WHAT THE PLATFORM CAN FIND AUTOMATICALLY
WHAT IS REQUIRED
WHAT IS RECOMMENDED
WHEN THE EMPLOYEE WILL STOP AND ASK
```

---

# 157. CATALOG EXAMPLE — #73

```text
WHAT IT DELIVERS
Management report

REQUIRED
Trial balance
Sales
Expenses

RECOMMENDED
Budget
Stock
Bank
Prior period

CAN FIND FROM
Primavera
Excel
Google Sheets
Google Drive
Bank

WILL STOP IF
Wrong period
Missing trial balance
Material source conflict
Wrong legal entity
```

---

# 158. CATALOG EXAMPLE — #261

```text
WHAT IT DELIVERS
Business documents

REQUIRED
Organization
Recipient
Purpose
Signatory

RECOMMENDED
Letterhead
Template

CAN FIND FROM
Organization Pack
Drive
Docs

WILL STOP IF
Recipient unknown
Wrong legal entity
Unauthorized signatory
```

---

# 159. INPUT GUIDE

Para cada Employee gerar:

```text
EmployeeInputGuide
```

---

# 160. CLIENT-FACING FORMAT

Mostrar em linguagem simples.

---

# 161. 500 INPUT GUIDES

Gerar 500 guias.

---

# 162. TASK TYPE GUIDES

Se Employee tiver múltiplas tarefas:

```text
guide per task type
```

---

# 163. API — PREFLIGHT

```text
POST /tasks/{taskId}/preflight
GET  /tasks/{taskId}/preflight
POST /tasks/{taskId}/preflight/revalidate
```

---

# 164. API — INPUTS

```text
GET  /tasks/{taskId}/inputs
POST /tasks/{taskId}/inputs
POST /tasks/{taskId}/inputs/discover
POST /tasks/{taskId}/inputs/{inputId}/validate
```

---

# 165. API — CONFLICTS

```text
GET  /tasks/{taskId}/input-conflicts
POST /input-conflicts/{id}/resolve
```

---

# 166. API — READINESS

```text
GET /tasks/{taskId}/readiness
```

---

# 167. API — CONTINUE WITH WARNING

```text
POST /tasks/{taskId}/continue-with-limitations
```

only when policy permits.

---

# 168. DATABASE ENTITIES

Criar/reutilizar:

```text
employee_input_requirement_profiles
task_input_requirements
task_input_instances
input_validation_results
input_readiness_decisions
input_discovery_plans
input_conflicts
task_evidence_coverage
task_input_snapshots
task_preflight_results
task_readiness_passports
employee_input_guides
```

---

# 169. SCHEMAS

Criar:

```text
employee-input-requirement-profile.schema.json
task-input-requirement.schema.json
task-input-instance.schema.json
input-validation-result.schema.json
input-readiness-decision.schema.json
input-conflict.schema.json
task-evidence-coverage.schema.json
task-input-snapshot.schema.json
task-preflight-result.schema.json
task-readiness-passport.schema.json
employee-input-guide.schema.json
```

---

# 170. PACKAGES

Criar:

```text
packages/input-requirements/
packages/input-discovery/
packages/input-validation/
packages/input-readiness/
packages/input-conflict-engine/
packages/input-freshness/
packages/input-consistency/
packages/task-preflight/
packages/readiness-ui/
packages/input-guide-generator/
```

---

# 171. GENERATED FILES

Gerar:

```text
generated/employee_input_profiles_500.json
generated/employee_input_guides_500.json
generated/task_type_input_matrix_500.json
generated/input_semantic_registry.json
generated/source_preference_matrix.json
generated/input_validation_rules.json
generated/input_freshness_rules.json
generated/input_stop_conditions_500.json
```

---

# 172. TEST SUITE

Criar:

```text
tests/input-requirements/
tests/input-discovery/
tests/input-validation/
tests/input-conflicts/
tests/input-freshness/
tests/input-readiness/
tests/preflight/
tests/wrong-entity/
tests/wrong-period/
tests/duplicates/
tests/missing-data/
tests/stale-data/
```

---

# 173. TEST — MISSING REQUIRED

Expected:

```text
NEEDS_DATA
```

---

# 174. TEST — MISSING OPTIONAL

Expected:

```text
READY
```

---

# 175. TEST — MISSING RECOMMENDED

Expected:

```text
READY_WITH_WARNINGS
```

when policy permits.

---

# 176. TEST — WRONG PERIOD

Expected:

```text
BLOCK / NEEDS_CLARIFICATION
```

---

# 177. TEST — WRONG ENTITY

Expected:

```text
BLOCK
```

---

# 178. TEST — STALE

Expected:

```text
STALE_DATA
```

---

# 179. TEST — CONFLICT

Expected:

```text
DATA_CONFLICT
```

---

# 180. TEST — AUTO DISCOVERY

Required input already in Drive:

```text
system must find it
```

before asking user.

---

# 181. TEST — MULTIPLE CANDIDATES

Must not silently choose ambiguous source.

---

# 182. TEST — UNAUTHORIZED SOURCE

Must not use it.

---

# 183. TEST — INPUT CHANGED

Must invalidate/re-run preflight.

---

# 184. TEST — DEGRADED EXECUTION

Must disclose limitation.

---

# 185. HARD NO-GO

Bloquear release se:

```text
Employee can execute without required preflight
missing required data is ignored
wrong legal entity accepted
wrong period accepted silently
unauthorized source used
material source conflict ignored
stale critical data used silently
client cannot see limitation
```

---

# 186. IMPLEMENTATION ORDER

Executar:

```text
PHASE 1
Input Semantic Registry

PHASE 2
Employee Input Requirement Profile schema

PHASE 3
Profiles for Wave Zero Employees

PHASE 4
Input Validation Engine

PHASE 5
Readiness Decision Engine

PHASE 6
Preflight UI

PHASE 7
Source Discovery

PHASE 8
Conflict/Freshness Engine

PHASE 9
Task Input Snapshots

PHASE 10
500/500 Profile Generation

PHASE 11
500/500 Validation

PHASE 12
Catalog Input Guide Integration
```

---

# 187. WAVE ZERO

Começar com:

```text
#64 Bank Reconciliation
#66 Document Classification
#73 Management Reporting
#261 Document Creator
#268 Tax Document Employee
#281 Document Reviewer
#286 Spreadsheet Employee
#289 KYC Verification
#333 Manufacturing Quality Control
#399 Citizen Request
#495 Data Quality
#498 AI Model Operations
```

---

# 188. WAVE ZERO GOAL

Validar que o engine funciona em tarefas:

```text
financial
documental
analytical
regulatory
operational
data
```

---

# 189. 500/500 GATE

```text
TOTAL EMPLOYEES                    500
INPUT PROFILES                     500
INPUT GUIDES                       500
STOP CONDITIONS                    500
SOURCE PREFERENCES                 500
VALIDATION RULES                   500
PREFLIGHT COMPATIBILITY            500
```

---

# 190. CATALOG INTEGRATION GATE

Todo Employee deve responder:

```text
What do I deliver?
What do I need?
What is mandatory?
What is recommended?
What can I find automatically?
When will I stop and ask?
```

---

# 191. PRODUCT EXPERIENCE

Cliente não deve perguntar:

```text
“Que ficheiros preciso enviar?”
```

sempre que possível.

A plataforma deve dizer:

```text
“Para este trabalho, preciso destes inputs.
Já encontrei estes.
Faltam estes.
Estes estão inválidos.
Estes estão desactualizados.”
```

---

# 192. CORE UX PRINCIPLE

```text
OUTCOME FIRST
INPUT GUIDANCE SECOND
EXECUTION THIRD
```

---

# 193. SYSTEM RESPONSIBILITY

A responsabilidade por input quality é partilhada:

```text
Client
+
Platform
+
Employee
```

---

# 194. PLATFORM DUTY

A plataforma deve:

```text
discover
validate
warn
ask
block
```

quando necessário.

---

# 195. EMPLOYEE DUTY

Employee deve:

```text
know what it needs
know when data is insufficient
know when to stop
know what to ask
```

---

# 196. CLIENT DUTY

Cliente deve:

```text
authorize
provide unavailable information
resolve ambiguous business facts
approve assumptions when permitted
```

---

# 197. NO GARBAGE-IN-GARBAGE-OUT ACCEPTANCE

A filosofia não pode ser:

```text
BAD INPUT
→
BAD OUTPUT
```

---

# 198. REQUIRED PHILOSOPHY

```text
BAD / INCOMPLETE INPUT
↓
DETECT
↓
VALIDATE
↓
WARN
↓
ASK
↓
CORRECT
↓
THEN EXECUTE
```

---

# 199. RESULT PHILOSOPHY

```text
GOOD RESULT
=
RIGHT TASK
+
RIGHT INPUT
+
RIGHT PERIOD
+
RIGHT ENTITY
+
RIGHT SOURCE
+
RIGHT KNOWLEDGE
+
RIGHT PERMISSIONS
+
RIGHT EXECUTION
```

---

# 200. FINAL ACCEPTANCE GATE

```text
INPUT REQUIREMENT ENGINE          PASS
SOURCE DISCOVERY                  PASS
VALIDATION                        PASS
COMPLETENESS                      PASS
FRESHNESS                         PASS
CONSISTENCY                       PASS
AUTHORIZATION                     PASS
CONFLICT ENGINE                   PASS
PREFLIGHT                         PASS
INPUT SNAPSHOT                    PASS
READINESS UI                      PASS
500/500 PROFILES                  PASS
500/500 GUIDES                    PASS
AUDIT                             PASS
SECURITY                          PASS
```

---

# 201. PRINCÍPIO DE VERDADE

Nunca confundir:

```text
FILE RECEIVED
!=
VALID INPUT

DATA EXISTS
!=
DATA COMPLETE

LATEST FILE
!=
LATEST APPROVED VERSION

SOURCE FOUND
!=
SOURCE AUTHORIZED

TASK REQUESTED
!=
TASK READY

EMPLOYEE CAN EXECUTE
!=
EMPLOYEE SHOULD EXECUTE
```

---


# 202. CLIENT OUTCOME-TO-INPUT GUIDANCE LAYER

Adicionar uma camada explícita voltada para o cliente:

# **Guia Resultado → Informação Necessária**

Objectivo:

```text
QUERO OBTER A
↓
PRECISO DISPONIBILIZAR B
↓
A PLATAFORMA VERIFICA B
↓
SE B ESTIVER SUFICIENTE
→ EMPLOYEE PRODUZ A
```

Esta camada deve traduzir os requisitos técnicos do IRECE para linguagem simples, comercial e operacional.

---

# 203. OUTCOME REQUIREMENT PROFILE

Criar:

`OutcomeRequirementProfile`

Campos:

```text
outcome_id
employee_id
task_type
outcome_name
outcome_description
minimum_required_inputs
conditional_inputs
recommended_inputs
complementary_inputs
platform_auto_discovery_sources
stop_conditions
expected_deliverables
client_facing_guidance
```

---

# 204. THREE CLIENT-FACING INPUT LEVELS

Para cada resultado, apresentar:

```text
MÍNIMO OBRIGATÓRIO
Sem isto o Employee não consegue produzir o resultado correctamente.

RECOMENDADO
O Employee consegue trabalhar sem isto, mas o resultado ficará menos completo.

COMPLEMENTAR
Enriquece análise, personalização ou profundidade.
```

Manter `CONDITIONAL` internamente e expor ao cliente quando aplicável.

---

# 205. OUTCOME-FIRST EXPERIENCE

A aplicação deve permitir começar por:

```text
O QUE DESEJA OBTER?
```

em vez de obrigar o cliente a conhecer primeiro o Employee correcto.

Exemplos:

```text
[ Relatório de Gestão ]
[ Reconciliação Bancária ]
[ Carta Bancária ]
[ Folha Salarial ]
[ Análise de Vendas ]
[ Contrato ]
[ Relatório Fiscal ]
[ Análise de Stock ]
```

Ao seleccionar o resultado, a plataforma resolve automaticamente:

```text
Outcome
↓
Task Type
↓
Best-fit Employee
↓
Required Inputs
↓
Available Data
↓
Missing Data
↓
Readiness
```

---

# 206. EXAMPLE — MANAGEMENT REPORTING

Cliente escolhe:

```text
RELATÓRIO DE GESTÃO MENSAL
```

Mostrar:

```text
PARA TER ESTE RESULTADO, PRECISA DISPONIBILIZAR:

MÍNIMO OBRIGATÓRIO
✓ Balancete do período
✓ Vendas do período
✓ Despesas do período

RECOMENDADO
○ Orçamento
○ Stock
○ Extracto bancário
○ Período anterior

COMPLEMENTAR
○ Metas comerciais
○ Comentários da gestão
○ Comparativo do ano anterior

A PLATAFORMA PODE PROCURAR AUTOMATICAMENTE EM:
Primavera
Google Drive
Google Sheets
Excel
Banco Read-Only

RESULTADO:
Relatório de Gestão
KPIs
Variações
Análise
Conclusões
PDF/XLSX
```

---

# 207. EXAMPLE — BANK RECONCILIATION

```text
QUERO:
Reconciliação Bancária

MÍNIMO OBRIGATÓRIO
✓ Extracto bancário
✓ Razão/lançamentos da conta bancária
✓ Período

RECOMENDADO
○ Reconciliação anterior
○ Movimentos em trânsito conhecidos

A PLATAFORMA PODE OBTER DE:
Banco Read-Only
Primavera
Excel
Google Drive

RESULTADO:
Movimentos conciliados
Diferenças
Pendências
Movimentos sem correspondência
Relatório de reconciliação
```

---

# 208. EXAMPLE — BANK LETTER

```text
QUERO:
Carta de solicitação de TPA

MÍNIMO OBRIGATÓRIO
✓ Nome legal da empresa
✓ NIF
✓ Banco destinatário
✓ Objectivo do pedido
✓ Responsável autorizado

RECOMENDADO
○ Número da conta
○ Agência
○ Papel timbrado
○ Modelo da empresa

RESULTADO:
Carta pronta
DOCX
PDF
Versão para assinatura/envio
```

---

# 209. EXAMPLE — PAYROLL

```text
QUERO:
Folha salarial do mês

MÍNIMO OBRIGATÓRIO
✓ Lista de trabalhadores
✓ Salário base
✓ Período
✓ Subsídios aplicáveis
✓ Faltas aplicáveis
✓ Horas extraordinárias aplicáveis
✓ Descontos aplicáveis

CONDICIONAL
○ IRT
○ Segurança Social
○ Outros descontos/retenções

RESULTADO:
Folha salarial
Totais
Descontos
Líquido a pagar
XLSX/PDF
```

---

# 210. CLIENT GUIDANCE CARD

Criar UI component:

`OutcomeInputGuidanceCard`

Mostrar:

```text
O QUE VAI RECEBER
PARA TER ESTE RESULTADO, PRECISA DISPONIBILIZAR
MÍNIMO OBRIGATÓRIO
RECOMENDADO
COMPLEMENTAR
A PLATAFORMA PODE ENCONTRAR AUTOMATICAMENTE
O QUE ESTÁ EM FALTA
QUANDO O EMPLOYEE VAI PARAR E PERGUNTAR
```

---

# 211. LIVE GUIDANCE STATUS

Depois de resolver o outcome, combinar o guia com os dados realmente existentes:

```text
Balancete             ✓ Já encontrado
Vendas                ✓ Já encontrado
Despesas              ✗ Em falta
Orçamento             ○ Recomendado
Stock                 ✓ Já encontrado
Banco                  ⚠ Não ligado
```

Acções:

```text
[ Carregar ]
[ Procurar no Drive ]
[ Ligar Primavera ]
[ Ligar Banco ]
[ Escolher outro ficheiro ]
[ Continuar com limitações ]
```

---

# 212. REVERSE CAPABILITY MAPPING — B → POSSÍVEIS A

Adicionar a capacidade inversa:

```text
TENHO B
↓
O QUE CONSIGO PRODUZIR COM ISTO?
```

Criar:

`AvailableDataCapabilityProfile`

Campos:

```text
organization_id
available_input_types
available_sources
validated_inputs
candidate_outcomes
best_fit_employees
additional_inputs_needed
readiness_status
```

---

# 213. EXAMPLE — REVERSE DISCOVERY

Se o cliente já possui:

```text
Balancete
Vendas
Stock
Orçamento
```

a plataforma pode responder:

```text
COM ESTES DADOS, JÁ PODE PRODUZIR:

✓ Relatório de Gestão
✓ Análise de Vendas
✓ Análise de Stock
✓ Comparativo Orçamento vs Real

PARA PRODUZIR:
○ Reconciliação Bancária

AINDA FALTA:
Extracto bancário
Razão da conta bancária
```

---

# 214. OUTCOME CAPABILITY ENGINE

Criar:

`OutcomeCapabilityEngine`

Responsável por calcular:

```text
validated available inputs
+
Employee Input Requirement Profiles
+
Outcome Requirement Profiles
+
permissions
+
connectors
+
knowledge readiness
=
possible outcomes
```

---

# 215. NO FALSE CAPABILITY CLAIM

Um outcome só deve aparecer como:

```text
READY_TO_PRODUCE
```

quando o IRECE confirmar que os inputs obrigatórios estão satisfeitos.

Outros estados:

```text
AVAILABLE_WITH_WARNINGS
NEEDS_MORE_DATA
NEEDS_CONNECTION
NEEDS_CLARIFICATION
NOT_AUTHORIZED
NOT_SUPPORTED
```

---

# 216. CATALOG INTEGRATION

Actualizar a ficha de cada um dos 500 Employees para incluir:

```text
O QUE ESTE EMPLOYEE ENTREGA

PARA TER CADA RESULTADO, PRECISA DISPONIBILIZAR

MÍNIMO OBRIGATÓRIO

RECOMENDADO

COMPLEMENTAR

A PLATAFORMA PODE PROCURAR AUTOMATICAMENTE EM

QUANDO O EMPLOYEE INTERROMPE E PERGUNTA
```

Importante:

```text
Employee
```

pode oferecer múltiplos outcomes.

Por isso, a directriz deve ser:

```text
per Employee
+
per Task Type
+
per Outcome
```

e não uma lista genérica por Employee.

---

# 217. HIRING / MARKETPLACE INTEGRATION

Na página comercial de cada Employee, antes da contratação, mostrar:

```text
O QUE PODE FAZER
O QUE ENTREGA
O QUE VOCÊ PRECISA TER
O QUE A PLATAFORMA PODE ENCONTRAR SOZINHA
INTEGRAÇÕES RECOMENDADAS
EXEMPLOS DE RESULTADOS
```

Isto deve permitir ao cliente avaliar se a organização já possui condições de usar o Employee.

---

# 218. APIs

Adicionar:

```text
GET /employees/{employeeId}/outcomes
GET /outcomes/{outcomeId}/requirements
POST /outcomes/{outcomeId}/readiness/check

GET /organizations/{orgId}/available-data
GET /organizations/{orgId}/possible-outcomes
POST /organizations/{orgId}/possible-outcomes/recalculate
```

---

# 219. DATABASE ENTITIES

Criar/reutilizar:

```text
outcome_requirement_profiles
outcome_input_requirements
outcome_input_guidance_cards
available_data_capability_profiles
organization_possible_outcomes
outcome_readiness_results
```

---

# 220. GENERATED FILES

Gerar:

```text
generated/outcome_requirement_profiles_500.json
generated/outcome_input_guides_500.json
generated/outcome_to_input_matrix_500.json
generated/input_to_possible_outcome_matrix_500.json
generated/employee_outcome_catalog_500.json
```

A matriz principal deve permitir:

```text
A → B
```

e:

```text
B → possíveis A
```

---

# 221. TESTS

Criar testes para:

```text
Outcome → required inputs
Outcome → recommended inputs
Outcome → complementary inputs
Available data → possible outcomes
Missing required data → outcome blocked
Missing recommended data → warning
Wrong period → outcome unavailable
Wrong legal entity → outcome unavailable
Unauthorized source → outcome unavailable
Automatic discovery updates guidance status
```

---

# 222. CLIENT COMMUNICATION RULE

Nunca dizer apenas:

```text
“Faltam dados.”
```

Dizer:

```text
“Para produzir [A], ainda falta [B].
Pode fornecer [B] desta forma ou ligar [fonte autorizada].”
```

---

# 223. COMMERCIAL UX PRINCIPLE

A orientação deve responder sempre a:

```text
1. O que vou receber?
2. O que preciso entregar?
3. O que a plataforma já encontrou?
4. O que ainda falta?
5. O que acontece se eu não fornecer?
```

---

# 224. BIDIRECTIONAL PRODUCT LOGIC

A plataforma deve suportar ambos os caminhos:

```text
A → B
“Quero este resultado. O que preciso disponibilizar?”
```

e:

```text
B → A
“Tenho estes dados. O que consigo produzir?”
```

---

# 225. UNIFIED CLIENT FLOW

```text
RESULTADO DESEJADO
↓
INFORMAÇÃO NECESSÁRIA
↓
INFORMAÇÃO JÁ DISPONÍVEL
↓
INFORMAÇÃO EM FALTA
↓
VALIDAÇÃO
↓
READY
↓
AI EMPLOYEE TRABALHA
↓
RESULTADO
```

---

# 226. PRINCÍPIO DE TRANSPARÊNCIA COMERCIAL

O cliente deve conhecer, antes de contratar ou executar:

```text
what the Employee can deliver
what information is minimally required
what additional information improves the outcome
what systems can supply it automatically
what limitations arise if data is missing
```

---

# 227. PRINCÍPIO DE VERDADE DA DIRECTRIZ

Nunca confundir:

```text
EMPLOYEE OFFERS OUTCOME
!=
ORGANIZATION IS READY FOR OUTCOME

CLIENT HAS FILES
!=
CLIENT HAS REQUIRED EVIDENCE

OUTCOME LISTED
!=
OUTCOME READY TO PRODUCE

RECOMMENDED INPUT MISSING
!=
REQUIRED INPUT MISSING
```

---

# 228. PRINCÍPIO FINAL


A plataforma deve ser capaz de responder antes de qualquer trabalho:

```text
“TENHO INFORMAÇÃO SUFICIENTE PARA PRODUZIR ESTE RESULTADO CORRECTAMENTE?”
```

Se:

```text
YES
→ EXECUTE

NO
→ SAY EXACTLY WHAT IS MISSING

CONFLICT
→ EXPLAIN THE CONFLICT

STALE
→ REQUEST CURRENT DATA

AMBIGUOUS
→ ASK FOR CONFIRMATION

UNAUTHORIZED
→ BLOCK
```

O resultado final deve ser uma plataforma em que o cliente não precisa conhecer tecnicamente todos os inputs necessários. Cada AI Employee deve saber o que precisa, procurar automaticamente nas fontes autorizadas, validar a informação recebida, detectar lacunas e conflitos, pedir apenas o que falta e só executar quando existir evidência suficiente para produzir um trabalho profissional e confiável.
