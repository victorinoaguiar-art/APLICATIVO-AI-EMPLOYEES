# PROMPT MESTRE DE IMPLEMENTAÇÃO
## 500 AI Employees Operational Role Packs, Task Catalog & SOP Engine
### Missão, Tarefas, Procedimentos, Inputs, Outputs, Ferramentas, Qualidade, Limites e Escalação para os 500 AI Employees

---

# 0. OBJECTIVO

Implementar na plataforma AETF-500 um **Operational Role Packs, Task Catalog & SOP Engine** que transforme cada um dos 500 AI Employees em profissionais operacionais claramente definidos, com:

- missão;
- objectivos;
- responsabilidades;
- tarefas permitidas;
- tarefas proibidas;
- procedimentos operacionais;
- inputs necessários;
- outputs esperados;
- ferramentas autorizadas;
- fontes de conhecimento;
- critérios de qualidade;
- regras de validação;
- limites de autonomia;
- regras de aprovação;
- condições de bloqueio;
- regras de escalação;
- KPIs;
- testes;
- evidência de execução.

O objectivo é eliminar Employees vagos ou genéricos.

Cada Employee deve conseguir responder, de forma estruturada e auditável:

> Quem sou?

> Qual é a minha missão?

> O que faço?

> O que não faço?

> Como executo cada tarefa?

> Que informação preciso receber?

> Que ferramentas posso utilizar?

> Que conhecimento devo consultar?

> Que resultado devo entregar?

> Como sei que o trabalho ficou correcto?

> Quando devo pedir esclarecimentos?

> Quando devo pedir aprovação?

> Quando devo parar?

> Quando devo escalar para humano ou outro Employee?

---

# 1. PRINCÍPIO ESTRUTURAL

Adoptar:

```text
AI EMPLOYEE
=
ROLE PROFILE
+
TASK CATALOG
+
SOP LIBRARY
+
COMPETENCY MAP
+
KNOWLEDGE BINDINGS
+
TOOLS
+
PERMISSIONS
+
QUALITY RULES
+
ESCALATION RULES
+
TESTS
+
RUNTIME
```

O Employee não deve depender apenas de:

```text
role_name
+
generic_prompt
```

para executar trabalho profissional.

---

# 2. REGRA FUNDAMENTAL

Cada Employee deve possuir quatro camadas operacionais obrigatórias:

```text
WHO AM I?
→ ROLE PROFILE

WHAT DO I DO?
→ TASK CATALOG

HOW DO I DO IT?
→ SOP / PROCEDURE

WHEN MUST I STOP OR ESCALATE?
→ LIMITS / HITL / ESCALATION
```

---

# 3. NÃO CRIAR 500 PROMPTS SOLTOS

Não implementar 500 prompts independentes e desestruturados.

Criar uma arquitectura comum com:

```text
ROLE PACK SCHEMA
TASK SCHEMA
SOP SCHEMA
QUALITY SCHEMA
ESCALATION SCHEMA
TEST SCHEMA
```

e depois preencher para os 500 Employees.

---

# 4. ROLE PACK

Cada Employee deve possuir um:

```text
OPERATIONAL_ROLE_PACK
```

Campos mínimos:

```text
employee_id
role_key
role_name
department
subdepartment
mission

primary_objectives
secondary_objectives

responsibilities
non_responsibilities

allowed_task_types
restricted_task_types
prohibited_task_types

required_competencies
required_knowledge_modes
required_tools

risk_level
autonomy_level

human_supervision_rules
approval_requirements

quality_profile
escalation_profile

kpis
tests

version
status
created_at
updated_at
```

---

# 5. EXEMPLO DE ROLE PACK

Exemplo:

```text
EMP-042
Contabilista Sénior
```

```text
MISSION:
Garantir registo, reconciliação, análise e controlo contabilístico da empresa cliente.

PRIMARY OBJECTIVES:
- registo correcto de operações
- reconciliação bancária
- controlo de contas
- análise de balancetes
- preparação de relatórios contabilísticos

NON-RESPONSIBILITIES:
- aconselhamento jurídico
- aprovação final de pagamentos
- submissão fiscal sem autorização
```

---

# 6. TASK CATALOG

Criar:

```text
GLOBAL_TASK_CATALOG
```

e:

```text
EMPLOYEE_TASK_ASSIGNMENTS
```

Cada tarefa deve possuir:

```text
task_type_id
task_name
description
domain
risk_level
source_criticality

required_competencies
required_inputs
required_tools
required_sources

default_output_formats

requires_sop
requires_hitl
requires_approval

eligible_roles
status
version
```

---

# 7. EXEMPLO DE TASK TYPE

```text
TASK-ACC-001
BANK_RECONCILIATION
```

Campos:

```text
Name:
Reconciliação Bancária

Domain:
Accounting

Risk:
MEDIUM

Required Competencies:
- Accounting
- Bank Reconciliation
- Excel

Required Inputs:
- bank statement
- general ledger
- period

Outputs:
- reconciliation file
- exception list
- management summary

Requires SOP:
YES
```

---

# 8. CATÁLOGO DE TAREFAS POR EMPLOYEE

Cada Employee deve ter lista explícita:

```text
EMP-042
├── TASK-ACC-001 Reconciliação Bancária
├── TASK-ACC-002 Classificação Documental
├── TASK-ACC-003 Análise de Balancete
├── TASK-ACC-004 Fecho Mensal
└── TASK-ACC-005 Relatório Contabilístico
```

---

# 9. SOP ENGINE

Criar:

```text
SOP_ENGINE
```

Cada tarefa de risco médio, alto ou crítico deve possuir procedimento aprovado.

---

# 10. SOP SCHEMA

Cada SOP deve conter:

```text
sop_id
task_type_id
title
purpose

preconditions

required_inputs
required_documents
required_tools
required_knowledge

steps

decision_points
validation_points
approval_points

error_handling
exception_handling

stop_conditions
escalation_conditions

outputs
quality_checks

audit_requirements

version
status
owner
approved_by
approved_at
```

---

# 11. EXEMPLO DE SOP — CARTA EMPRESARIAL

```text
SOP-ADM-001
CREATE_BUSINESS_LETTER
```

Procedimento:

```text
1. Identificar empresa remetente.
2. Identificar destinatário.
3. Identificar objectivo da carta.
4. Confirmar se todos os dados necessários estão disponíveis.
5. Identificar template aprovado da empresa.
6. Verificar se a carta contém conteúdo regulatório.
7. Se conteúdo regulatório:
   - exigir fonte oficial válida.
8. Redigir conteúdo.
9. Rever nomes, datas, valores, NIF, referências.
10. Validar tom, clareza e coerência.
11. Aplicar papel timbrado.
12. Gerar DOCX e/ou PDF.
13. Se envio externo exigir aprovação:
   - WAITING_APPROVAL.
14. Guardar output.
15. Registar auditoria.
```

---

# 12. EXEMPLO DE SOP — RECONCILIAÇÃO BANCÁRIA

```text
SOP-ACC-001
BANK_RECONCILIATION
```

Passos:

```text
1. Confirmar período.
2. Confirmar conta bancária.
3. Carregar extracto.
4. Carregar razão.
5. Normalizar datas e valores.
6. Comparar movimentos.
7. Identificar correspondências.
8. Identificar diferenças.
9. Classificar diferenças:
   - timing
   - duplicate
   - missing entry
   - fee
   - transfer
   - unknown
10. Preparar mapa de reconciliação.
11. Preparar excepções.
12. Escalar diferenças críticas.
13. Produzir output.
14. Registar evidência.
```

---

# 13. SOP NÃO DEVE SER INVENTADO EM RUNTIME

Se existir SOP aprovado:

```text
USE_APPROVED_SOP = true
```

O modelo não deve substituir o procedimento por outro improvisado.

---

# 14. TAREFA SEM SOP

Se:

```text
requires_sop = true
```

e:

```text
approved_sop = missing
```

resultado:

```text
TASK_BLOCKED_NO_APPROVED_SOP
```

Para baixo risco:

```text
MODEL_NATIVE_PROCEDURE_ALLOWED
```

apenas se política permitir.

---

# 15. INPUT CONTRACT

Cada tarefa deve declarar explicitamente os inputs esperados.

Exemplo:

```text
TASK:
CREATE_BUSINESS_LETTER

INPUTS:
- company
- recipient
- purpose
- facts
- date
- signatory
```

---

# 16. INPUT STATUS

Para cada input:

```text
REQUIRED
OPTIONAL
CONDITIONAL
```

---

# 17. INPUT VALIDATION

Antes de executar:

```text
validateRequiredInputs()
```

Se faltar informação:

```text
WAITING_USER_INPUT
```

Não inventar dados.

---

# 18. OUTPUT CONTRACT

Cada tarefa deve declarar o output esperado.

Exemplo:

```text
TASK:
CREATE_BUSINESS_LETTER

OUTPUT:
- content
- DOCX
- PDF
```

Outro:

```text
TASK:
BANK_RECONCILIATION

OUTPUT:
- reconciliation XLSX
- exception report
- summary PDF
```

---

# 19. OUTPUT QUALITY RULES

Cada output deve possuir validações próprias.

Exemplo para carta:

```text
recipient_present
subject_present
body_present
signature_present
no invented facts
company template applied
spelling checked
```

---

# 20. TOOL PROFILE

Cada Employee deve possuir:

```text
EMPLOYEE_TOOL_PROFILE
```

Exemplo:

```text
EMP-042

Excel
Primavera
Document Generator
Google Drive
Email
Bank Read-Only
```

---

# 21. TOOL REQUIREMENTS POR TAREFA

Exemplo:

```text
BANK_RECONCILIATION
requires:
- spreadsheet tool
- bank source
- ledger source
```

---

# 22. TOOL PERMISSION

Separar:

```text
TOOL AVAILABLE
```

de:

```text
TOOL AUTHORIZED FOR THIS EMPLOYEE
```

---

# 23. KNOWLEDGE PROFILE

Cada tarefa deve declarar:

```text
knowledge_mode
```

Valores:

```text
MODEL_NATIVE_SUFFICIENT
MODEL_NATIVE_PLUS_CURATED
SOURCE_CRITICAL
CLIENT_SOURCE_REQUIRED
```

---

# 24. KNOWLEDGE BINDING

Exemplo:

```text
CREATE_BUSINESS_LETTER
→ Business Writing

AGT_LETTER
→ Business Writing
+ Angola Tax
+ AGT Correspondence
```

---

# 25. QUALITY PROFILE

Criar:

```text
QUALITY_PROFILE
```

por Employee e por task type.

Campos:

```text
quality_profile_id
criteria
weights
thresholds
critical_failures
review_policy
```

---

# 26. EXEMPLO DE QUALIDADE — CARTA

```text
Structure = 15%
Clarity = 15%
Language = 15%
Tone = 10%
Recipient Fit = 10%
Factual Accuracy = 15%
No Fabrication = 10%
Formatting = 5%
Closing = 5%
```

---

# 27. CRITICAL FAILURES

Definir por tarefa.

Exemplo:

```text
invented NIF
invented legal citation
wrong company
wrong tenant
wrong amount
wrong recipient
unauthorized submission
```

---

# 28. AUTONOMY LEVEL

Cada Employee deve possuir:

```text
A1
A2
A3
A4
A5
A6
```

ou escala existente.

---

# 29. AUTONOMY POR TAREFA

O Employee pode ter autonomia diferente por task type.

Exemplo:

```text
Create Business Letter:
A4

Send External Letter:
A2

Submit AGT Filing:
A1
```

---

# 30. APPROVAL RULES

Criar:

```text
APPROVAL_RULES
```

Exemplo:

```text
draft internal document
→ no approval

send external document
→ approval required

submit tax declaration
→ approval required

bank payment
→ approval required
```

---

# 31. ESCALATION ENGINE

Criar:

```text
ESCALATION_ENGINE
```

---

# 32. ESCALATION CONDITIONS

Exemplos:

```text
missing data
conflicting data
high-risk decision
legal uncertainty
source missing
tool unavailable
critical exception
amount above threshold
policy conflict
```

---

# 33. ESCALATION TARGET

Pode ser:

```text
HUMAN SUPERVISOR
SENIOR AI EMPLOYEE
SPECIALIST AI EMPLOYEE
COMPLIANCE
LEGAL
ADMINISTRATOR
```

---

# 34. EXEMPLO DE ESCALAÇÃO

```text
Contabilista
↓
detects tax uncertainty
↓
Escalate to Fiscal Specialist
```

---

# 35. STOP CONDITIONS

Cada SOP deve indicar:

```text
STOP_IF
```

Exemplos:

```text
source missing
permission denied
conflicting customer data
unverified legal basis
sensitive action without approval
```

---

# 36. ROLE BOUNDARIES

Cada Employee deve declarar:

```text
DO
DO_NOT
MAY_WITH_APPROVAL
MUST_ESCALATE
```

---

# 37. ROLE COLLISION DETECTION

Evitar dois Employees com tarefas idênticas sem regra clara.

Criar:

```text
ROLE_OVERLAP_MATRIX
```

---

# 38. OVERLAP CLASSIFICATION

```text
VALID_OVERLAP
SPECIALIZATION
DUPLICATION
CONFLICT
```

---

# 39. TASK OWNERSHIP

Cada task type deve ter:

```text
primary_role
secondary_role
review_role
```

---

# 40. EXEMPLO

```text
BANK_RECONCILIATION

Primary:
Accountant

Secondary:
Finance Analyst

Review:
Senior Accountant
```

---

# 41. DEPARTMENT STRUCTURE

Mapear os 500 Employees por departamento.

Cada Employee deve possuir:

```text
department
subdepartment
role_family
```

---

# 42. STANDARD ROLE FAMILIES

Exemplos:

```text
Accounting
Finance
Tax
Audit
HR
Administration
Legal
Marketing
Sales
Procurement
Operations
IT
Security
Data
Customer Support
Compliance
```

---

# 43. TASK TAXONOMY

Criar taxonomia hierárquica:

```text
DOMAIN
→ FUNCTION
→ TASK TYPE
→ SUBTASK
```

---

# 44. EXEMPLO

```text
Accounting
→ Reconciliation
→ Bank Reconciliation
→ Exception Classification
```

---

# 45. TASK COMPLEXITY

Classificar:

```text
SIMPLE
STANDARD
COMPLEX
CRITICAL
```

---

# 46. TASK RISK

Separar de complexidade:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 47. MODEL ROUTING INPUT

Task Catalog deve fornecer ao Model Router:

```text
task_type
complexity
risk
required_competencies
source_criticality
```

---

# 48. INPUT → SOP → OUTPUT CONTRACT

Adoptar padrão:

```text
INPUT CONTRACT
↓
SOP
↓
OUTPUT CONTRACT
```

---

# 49. SOP VERSIONING

Todo SOP deve possuir:

```text
version
effective_date
status
```

---

# 50. SOP STATUS

Valores:

```text
DRAFT
REVIEW
APPROVED
DEPRECATED
RETIRED
```

---

# 51. SOP CHANGE IMPACT

Quando SOP muda:

```text
SOP CHANGE
↓
AFFECTED TASK TYPES
↓
AFFECTED EMPLOYEES
↓
RETEST REQUIRED
```

---

# 52. SOP PROVENANCE

Guardar:

```text
author
reviewer
approver
source references
change reason
```

---

# 53. SOP REUSABILITY

Evitar duplicar SOP idêntico.

Permitir:

```text
1 SOP
→ MANY EMPLOYEES
```

---

# 54. BASE SOP + SPECIALIZATION

Exemplo:

```text
BASE:
Create Business Letter

SPECIALIZATION:
Bank Letter

SPECIALIZATION:
AGT Letter

SPECIALIZATION:
Supplier Letter
```

---

# 55. TASK PACK

Criar:

```text
TASK_PACK
```

Agrupa:

```text
task_type
sop
quality_rules
tools
knowledge
tests
```

---

# 56. ROLE PACK COMPOSITION

Cada Role Pack deve referenciar Task Packs.

Exemplo:

```text
EMP-042
Contabilista Sénior

Task Packs:
- TP-ACC-001
- TP-ACC-002
- TP-ACC-003
```

---

# 57. TESTS POR TASK PACK

Cada Task Pack deve possuir testes.

Exemplo:

```text
TEST-TP-ACC-001-001
TEST-TP-ACC-001-002
...
```

---

# 58. TASK CERTIFICATION

Certificar:

```text
EMPLOYEE
+
TASK TYPE
+
MODEL
+
JURISDICTION
```

---

# 59. PASSAPORTE OPERACIONAL

Criar:

```text
OPERATIONAL_PASSPORT
```

Mostrar:

```text
role
task types
certifications
sops
tools
permissions
autonomy
risk
```

---

# 60. UI — ROLE PROFILE

Dentro do Employee:

```text
Missão
Responsabilidades
Tarefas
Procedimentos
Inputs
Outputs
Ferramentas
Conhecimento
Qualidade
Limites
Escalação
Testes
```

---

# 61. UI — TASK CATALOG

Mostrar:

| Task | Status | SOP | Risk | Autonomy | Certification |
|---|---|---|---|---|---|

---

# 62. UI — SOP VIEWER

Ao abrir SOP mostrar:

```text
Purpose
Preconditions
Inputs
Steps
Decision Points
Tools
Sources
Outputs
Quality Checks
Stop Conditions
Escalations
```

---

# 63. UI — TASK ASSIGNMENT

Ao criar tarefa:

```text
Task Type
Employee
Eligibility
SOP
Required Inputs
Required Tools
Expected Output
Approval Requirements
```

---

# 64. DYNAMIC TASK FORM

Formulário deve adaptar-se ao task type.

Exemplo:

```text
Create Business Letter
```

campos:

```text
recipient
subject
purpose
facts
signatory
output format
```

---

# 65. PRE-EXECUTION CHECK

Antes de executar:

```text
TASK TYPE EXISTS
ROLE ELIGIBLE
SOP APPROVED
INPUTS COMPLETE
TOOLS AVAILABLE
PERMISSIONS VALID
KNOWLEDGE READY
MODEL CERTIFIED
```

---

# 66. EXECUTION CONTRACT

Criar:

```text
TASK_EXECUTION_CONTRACT
```

com:

```text
task_id
task_type_id
instance_id
sop_id
model_id
inputs
outputs
tools
knowledge
approval_policy
quality_profile
```

---

# 67. EXECUTION TRACE

Durante execução registar:

```text
step_started
step_completed
decision_taken
tool_used
source_used
approval_requested
exception
escalation
```

---

# 68. SOP STEP TRACEABILITY

Cada runtime step deve apontar para:

```text
sop_step_id
```

---

# 69. SOP DEVIATION

Se o modelo desviar do SOP:

```text
SOP_DEVIATION_DETECTED
```

---

# 70. DEVIATION POLICY

Pode ser:

```text
ALLOW
ALLOW_WITH_REASON
REQUIRE_APPROVAL
BLOCK
```

---

# 71. QUALITY CHECK ENGINE

Depois da execução:

```text
OUTPUT
↓
QUALITY PROFILE
↓
CHECKS
↓
PASS / FAIL
```

---

# 72. AUTO-REVIEW

Para tarefas permitidas, usar review automático.

Para tarefas críticas:

```text
HUMAN REVIEW
```

---

# 73. REWORK LOOP

Se qualidade falhar:

```text
OUTPUT
↓
FAIL
↓
REWORK
↓
RECHECK
```

---

# 74. MAX REWORK

Definir:

```text
max_rework_attempts
```

---

# 75. ESCALAÇÃO APÓS REWORK

Se exceder:

```text
ESCALATE
```

---

# 76. KPI POR ROLE

Cada Role Pack deve ter KPIs.

Exemplo:

```text
task_success_rate
average_completion_time
critical_error_rate
rework_rate
approval_rate
customer_acceptance
cost_per_task
```

---

# 77. KPI POR TASK TYPE

Também medir por tarefa.

---

# 78. LEARNING LOOP

Após tarefas reais:

```text
TASK RESULT
↓
QUALITY
↓
ERROR PATTERN
↓
ROLE PACK IMPROVEMENT
↓
SOP IMPROVEMENT
↓
RETEST
```

---

# 79. NÃO AUTO-ALTERAR SOP CRÍTICO

Sugestões podem ser geradas.

Alterações críticas exigem aprovação humana.

---

# 80. ROLE PACK VERSIONING

Cada Role Pack deve possuir:

```text
version
```

---

# 81. ROLE PACK CHANGE IMPACT

Quando muda:

```text
ROLE PACK
↓
AFFECTED INSTANCES
↓
AFFECTED TASKS
↓
REVALIDATION
```

---

# 82. GLOBAL VS COMPANY-SPECIFIC

Separar:

```text
GLOBAL ROLE PACK
```

de:

```text
COMPANY OVERRIDE
```

---

# 83. EXEMPLO

Global:

```text
Contabilista Sénior
```

MARVINE override:

```text
uses MARVINE chart of accounts
uses MARVINE approval rules
```

---

# 84. COMPANY OVERRIDE LIMITS

Company policy não pode remover controlos obrigatórios da plataforma.

---

# 85. CLIENT POLICY PACK INTEGRATION

Integrar com:

```text
CLIENT_POLICY_PACK
```

---

# 86. JURISDICTION INTEGRATION

Cada task type deve declarar:

```text
jurisdiction_sensitive = true/false
```

---

# 87. SOURCE CRITICALITY

Task regulatória:

```text
SOURCE_CRITICALITY = HIGH / CRITICAL
```

---

# 88. TASK BLOCK

Se fonte obrigatória não existir:

```text
TASK_BLOCKED_MISSING_SOURCE
```

---

# 89. EMPLOYEE SELECTION

Ao criar tarefa, plataforma deve poder sugerir Employee:

```text
Task Type
↓
Eligible Employees
↓
Certified Employees
↓
Available Employees
```

---

# 90. AUTO-ASSIGNMENT OPCIONAL

Se autorizado:

```text
TASK
↓
BEST ELIGIBLE EMPLOYEE
```

---

# 91. LOAD BALANCING

Se múltiplas instâncias:

```text
assign based on
- availability
- cost
- workload
- certification
```

---

# 92. TASK TRANSFER

Permitir transferência:

```text
Employee A
→ Employee B
```

com razão registada.

---

# 93. COLLABORATIVE TASKS

Permitir:

```text
PRIMARY EMPLOYEE
+
REVIEWER
+
SPECIALIST
```

---

# 94. EXEMPLO

```text
Tax Letter

Primary:
Administrative Assistant

Specialist:
Tax Employee

Reviewer:
Senior Accountant
```

---

# 95. TASK ORCHESTRATION

Para tarefas complexas:

```text
PARENT TASK
├── SUBTASK 1
├── SUBTASK 2
└── SUBTASK 3
```

---

# 96. RESPONSIBILITY MATRIX

Criar:

```text
RACI
```

por task type, quando útil.

---

# 97. PROIBITED ACTIONS

Cada Role Pack deve declarar explicitamente:

```text
prohibited_actions
```

---

# 98. EXEMPLO

Contabilista:

```text
cannot approve payment
cannot sign legal contract
cannot submit tax filing without approval
```

---

# 99. FAILURE MODES

Cada SOP deve incluir:

```text
known_failure_modes
```

---

# 100. EXCEPTION PLAYBOOK

Criar procedimentos de excepção.

---

# 101. DOCUMENT GENERATION

Task Packs documentais devem ligar a:

```text
Document Generation Engine
```

---

# 102. DOCUMENT TEMPLATE

Declarar:

```text
template_required
```

---

# 103. TEMPLATE SOURCE

Pode ser:

```text
GLOBAL
COMPANY
JURISDICTION
```

---

# 104. DATA VALIDATION

Antes de usar dados:

```text
validate source
validate tenant
validate freshness
```

---

# 105. TASK DATA PROVENANCE

Guardar:

```text
input source
input file
input record
```

---

# 106. OUTPUT PROVENANCE

Guardar:

```text
output_id
generated_by
task_id
execution_id
sop_id
```

---

# 107. AUDIT EVENTS

Registar:

```text
role_pack_loaded
task_type_resolved
sop_loaded
input_validated
tool_authorized
step_executed
quality_checked
escalation_triggered
task_completed
```

---

# 108. RAW EVIDENCE

Cada execução deve produzir evidência do:

```text
role pack
task pack
sop
inputs
model
tools
sources
outputs
quality
```

---

# 109. MOCK PROTECTION

Em produção:

```text
MOCK_ROLE_PACK = false
MOCK_TASK_EXECUTION = false
```

---

# 110. TESTE — ROLE PROFILE

Verificar que cada Employee tem:

```text
mission
responsibilities
limits
```

---

# 111. TESTE — TASK CATALOG

Verificar que cada Employee possui pelo menos um task type válido.

---

# 112. TESTE — SOP

Para tarefas com `requires_sop=true`:

```text
approved SOP exists
```

---

# 113. TESTE — INPUT CONTRACT

Falta input obrigatório:

```text
WAITING_USER_INPUT
```

---

# 114. TESTE — TOOL AUTHORIZATION

Tool não autorizada:

```text
TOOL_ACCESS_DENIED
```

---

# 115. TESTE — SOURCE-CRITICAL

Sem fonte:

```text
TASK_BLOCKED_MISSING_SOURCE
```

---

# 116. TESTE — SOP DEVIATION

Desvio crítico:

```text
TASK_BLOCKED_SOP_DEVIATION
```

---

# 117. TESTE — QUALITY FAIL

Output abaixo do threshold:

```text
REWORK_REQUIRED
```

---

# 118. TESTE — ESCALATION

Condição crítica:

```text
ESCALATED
```

---

# 119. TESTE — ROLE BOUNDARY

Employee tenta tarefa proibida:

```text
TASK_BLOCKED_ROLE_BOUNDARY
```

---

# 120. TESTE — CROSS-TENANT

Esperado:

```text
DENIED_CROSS_TENANT
```

---

# 121. TESTE — MODEL + SOP

Verificar que modelo recebe:

```text
role
task
sop
company context
```

---

# 122. TESTE — OUTPUT CONTRACT

Output deve cumprir formato exigido.

---

# 123. TESTE — VERSIONING

SOP antigo:

```text
DEPRECATED
```

não pode ser usado quando versão activa obrigatória existir.

---

# 124. TESTE — 500 EMPLOYEES

Auditar:

```text
500/500
```

e garantir:

```text
role pack exists
task catalog exists
operational status exists
```

---

# 125. TEST COVERAGE

Criar:

```text
ROLE_PACK_COVERAGE
TASK_CATALOG_COVERAGE
SOP_COVERAGE
TEST_COVERAGE
```

---

# 126. MINIMUM COVERAGE

Não declarar programa completo se:

```text
role_pack_coverage < 100%
```

---

# 127. SOP COVERAGE POR RISCO

Exigir:

```text
HIGH = 100%
CRITICAL = 100%
MEDIUM = policy-defined
LOW = optional
```

---

# 128. DASHBOARD

Criar:

# Operational Role Packs

Indicadores:

```text
500 Employees
Role Packs Complete
Tasks Defined
SOPs Approved
SOPs Missing
Employees Blocked
Employees Ready
```

---

# 129. DASHBOARD POR EMPLOYEE

Mostrar:

```text
Role Pack
Task Count
SOP Count
Certification
Operational Readiness
```

---

# 130. DASHBOARD DE LACUNAS

Mostrar:

```text
Employees without task catalog
Tasks without SOP
Tasks without quality rules
Roles with overlap
Roles without escalation path
```

---

# 131. PRIORITY QUEUE

Criar:

```text
OPERATIONAL_GAP_QUEUE
```

---

# 132. GAP TYPES

```text
MISSING_ROLE_PACK
MISSING_TASK
MISSING_SOP
MISSING_INPUT_CONTRACT
MISSING_OUTPUT_CONTRACT
MISSING_TOOL_MAPPING
MISSING_QUALITY_RULE
MISSING_ESCALATION_RULE
```

---

# 133. AUTO-GENERATION ASSISTED

Pode usar IA para sugerir Role Packs e SOPs.

Mas o sistema deve marcar:

```text
AI_GENERATED_DRAFT
```

até aprovação.

---

# 134. HUMAN APPROVAL

Role Packs e SOPs críticos exigem:

```text
APPROVED
```

---

# 135. NO AUTO-PROMOTION

Nunca:

```text
DRAFT
→ APPROVED
```

sem regra formal.

---

# 136. ROLE PACK TEMPLATE

Criar template reutilizável:

```text
Role Identity
Mission
Objectives
Responsibilities
Task Catalog
Competencies
Knowledge
Tools
Permissions
SOPs
Quality
Limits
Escalation
KPIs
Tests
```

---

# 137. TASK PACK TEMPLATE

```text
Task Identity
Purpose
Risk
Inputs
SOP
Tools
Knowledge
Outputs
Quality
Approval
Escalation
Tests
```

---

# 138. SOP TEMPLATE

```text
Purpose
Preconditions
Inputs
Steps
Decisions
Tools
Sources
Validation
Exceptions
Stop Conditions
Escalation
Outputs
Quality
Audit
```

---

# 139. REGRA DE CONSISTÊNCIA

Task Catalog, SOP e Role Pack devem usar IDs relacionais.

---

# 140. EXEMPLO DE RELAÇÃO

```text
EMP-042
↓
TP-ACC-001
↓
TASK-ACC-001
↓
SOP-ACC-001
↓
QP-ACC-001
```

---

# 141. TASK EXECUTION

Quando tarefa chegar:

```text
task_type
↓
employee role
↓
task pack
↓
sop
↓
runtime
```

---

# 142. NO FREEFORM EXECUTION PARA RISCO ALTO

Tarefa HIGH/CRITICAL sem task pack:

```text
BLOCK
```

---

# 143. FREEFORM LOW-RISK

Baixo risco pode permitir:

```text
ad-hoc task
```

com guardrails.

---

# 144. AD-HOC TASK CLASSIFICATION

Antes de executar:

```text
classify task
```

Se corresponder a task type existente:

```text
map to task pack
```

---

# 145. UNKNOWN TASK

Se não corresponder:

```text
UNKNOWN_TASK_TYPE
```

---

# 146. UNKNOWN TASK POLICY

Pode:

```text
LOW RISK → supervised
HIGH RISK → blocked
```

---

# 147. CROSS-ROLE TASK

Se tarefa não pertence ao Employee:

```text
suggest eligible employee
```

---

# 148. TASK REDIRECTION

Exemplo:

```text
Marketing Employee receives tax task
↓
BLOCK
↓
suggest Tax Employee
```

---

# 149. COMPANY-SPECIFIC ROLE OVERRIDES

Permitir:

```text
company task restrictions
company approval thresholds
company templates
```

---

# 150. GLOBAL SAFETY RULES

Company override não pode reduzir:

```text
tenant isolation
security
critical approvals
legal source requirements
```

---

# 151. EMPLOYEE OPERATIONAL CERTIFICATION

Criar:

```text
EMPLOYEE_OPERATIONAL_CERTIFICATION
```

baseada em:

```text
role pack
task catalog
sops
tools
knowledge
tests
runtime
```

---

# 152. CERTIFICATION STATES

```text
NOT_READY
READY_FOR_TEST
CERTIFIED_WITH_SUPERVISION
CERTIFIED
BLOCKED
```

---

# 153. PRODUCTION ACTIVATION

Só activar:

```text
ACTIVE
```

se:

```text
Operational Certification = valid
```

---

# 154. ROLE PACK EVIDENCE

Cada Role Pack deve ter:

```text
version
hash
approval
```

quando aplicável.

---

# 155. SOP EVIDENCE

Cada SOP deve ter:

```text
version
hash
approval
```

quando aplicável.

---

# 156. CHANGE CONTROL

Mudança material:

```text
requires retest
```

---

# 157. RUNTIME PROOF

Cada tarefa deve guardar:

```text
role_pack_version
task_pack_version
sop_version
```

---

# 158. EXEMPLO FINAL — CARTA

Pedido:

```text
"Faça uma carta da MARVINE ao Banco BAI solicitando TPA."
```

Fluxo:

```text
Task Classification:
BUSINESS_LETTER

Eligible Employee:
Administrative Assistant

Task Pack:
TP-ADM-LETTER-001

SOP:
SOP-ADM-LETTER-001

Inputs:
company
recipient
purpose
signatory

Knowledge:
Business Writing
MARVINE Template

Tools:
Document Generator

Output:
DOCX + PDF

Quality:
Business Letter Quality Profile

Approval:
Required before external send
```

---

# 159. EXEMPLO FINAL — RECONCILIAÇÃO

Pedido:

```text
"Reconcilie a conta bancária de Agosto."
```

Fluxo:

```text
Task:
BANK_RECONCILIATION

Employee:
Accountant

SOP:
SOP-ACC-001

Inputs:
bank statement
ledger
period

Tools:
Excel
Bank Read
ERP

Output:
XLSX + PDF

Escalation:
unexplained difference > threshold
```

---

# 160. RESULTADO VISUAL DO EMPLOYEE

Exemplo:

```text
EMP-042
Contabilista Sénior

Missão:
...

Tarefas:
12

SOPs:
10

Ferramentas:
6

Competências:
14

Autonomia:
A4

Risco:
R4

Operational Certification:
CERTIFIED
```

---

# 161. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ 500/500 Employees possuem Role Pack
✓ cada Employee possui missão
✓ cada Employee possui responsabilidades
✓ cada Employee possui limites
✓ cada Employee possui Task Catalog
✓ tarefas high/critical possuem SOP
✓ cada tarefa possui input contract
✓ cada tarefa possui output contract
✓ ferramentas estão mapeadas
✓ conhecimento está mapeado
✓ qualidade está definida
✓ escalação está definida
✓ testes existem
✓ runtime carrega Role Pack e SOP
✓ execução regista versões usadas
✓ tarefas fora do papel são bloqueadas
✓ cross-tenant é bloqueado
✓ nenhum Employee depende apenas de prompt genérico
```

---

# 162. FLUXO FINAL

```text
EMPLOYEE
↓
ROLE PACK
↓
TASK CATALOG
↓
TASK PACK
↓
SOP
↓
INPUTS
↓
KNOWLEDGE
↓
TOOLS
↓
PERMISSIONS
↓
MODEL
↓
EXECUTION
↓
QUALITY CHECK
↓
APPROVAL / ESCALATION
↓
OUTPUT
↓
AUDIT
```

---

# 163. REGRA FINAL

“Dar vida” ao Employee resolve:

```text
CAN WORK
```

O Operational Role Pack resolve:

```text
KNOWS WHAT WORK TO DO
```

O Task Catalog resolve:

```text
KNOWS WHICH TASKS BELONG TO THE ROLE
```

O SOP Engine resolve:

```text
KNOWS HOW TO DO EACH TASK
```

As Quality Rules resolvem:

```text
KNOWS WHEN THE WORK IS GOOD
```

As Escalation Rules resolvem:

```text
KNOWS WHEN TO STOP AND ASK FOR HELP
```

---

# 164. OBJECTIVO FINAL

Cada um dos 500 AI Employees deve deixar de ser apenas:

```text
nome
descrição
departamento
```

e passar a ser um profissional operacional com:

```text
MISSÃO
+
TAREFAS
+
PROCEDIMENTOS
+
INPUTS
+
OUTPUTS
+
FERRAMENTAS
+
CONHECIMENTO
+
QUALIDADE
+
LIMITES
+
ESCALAÇÃO
+
TESTES
+
RUNTIME
```

Somente nessa condição o Employee pode ser considerado verdadeiramente preparado para executar trabalho profissional dentro de uma empresa cliente.
