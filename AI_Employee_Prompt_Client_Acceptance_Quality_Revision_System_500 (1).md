# PROMPT MESTRE COMPLEMENTAR — CLIENT ACCEPTANCE, QUALITY & REVISION SYSTEM
## Aceitação do Cliente, Qualidade Percebida, Revisões, Preferências e Aprendizagem Controlada para os 500 AI Employees

**Sigla:** CAQRS  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program  
**Objectivo:** criar uma camada transversal que permita medir se o trabalho produzido pelos AI Employees foi aceite pelo cliente, distinguir erro objectivo de preferência subjectiva, gerir revisões, aprender padrões de preferência de cada organização de forma controlada e melhorar continuamente a qualidade percebida sem comprometer segurança, factualidade, legislação, políticas ou controlos.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Arquitecto de Produto;
- Arquitecto de UX;
- Engenheiro Backend;
- Engenheiro Frontend;
- Engenheiro de Dados;
- Especialista em Quality Management;
- Especialista em Customer Experience;
- Especialista em Human-in-the-Loop;
- Especialista em AI Evaluation;
- Especialista em Reliability Engineering;
- Especialista em Document Systems;
- Especialista em Workflow;
- Especialista em Segurança;
- Especialista em Auditoria;
- Especialista em Compliance;
- Especialista em Knowledge Systems;
- Especialistas humanos por domínio profissional.

Implemente o:

# **CLIENT ACCEPTANCE, QUALITY & REVISION SYSTEM — CAQRS**

para todos os 500 AI Employees.

O sistema deve responder:

```text
O TRABALHO ESTÁ TECNICAMENTE CORRECTO?
O TRABALHO ESTÁ COMPLETO?
CUMPRE O PEDIDO?
CUMPRE AS REGRAS?
ESTÁ NO FORMATO CERTO?
ESTÁ ALINHADO ÀS PREFERÊNCIAS DA ORGANIZAÇÃO?
O CLIENTE ACEITOU?
SE NÃO ACEITOU, PORQUÊ?
É ERRO?
É PREFERÊNCIA?
É ALTERAÇÃO DE ESCOPO?
É NOVA EXIGÊNCIA?
É PROBLEMA DE FORMATO?
É PROBLEMA DE TOM?
É PROBLEMA DE CONTEÚDO?
É NECESSÁRIA REVISÃO?
QUE PARTE DEVE SER PRESERVADA?
QUE PARTE DEVE MUDAR?
A ALTERAÇÃO PODE SER APRENDIDA?
EM QUE ESCOPO?
```

---

# 1. PRINCÍPIO FUNDAMENTAL

NÃO assumir que:

```text
CLIENTE NÃO GOSTOU
=
EMPLOYEE ERROU
```

Separar obrigatoriamente:

```text
TECHNICAL CORRECTNESS
CLIENT EXPECTATION
CLIENT PREFERENCE
SCOPE CHANGE
NEW REQUIREMENT
STYLE / FORMAT
CONTENT QUALITY
POLICY / LEGAL CONSTRAINT
```

---

# 2. OBJECTIVO DO SISTEMA

Transformar:

```text
“o cliente não gostou”
```

em dados estruturados e accionáveis:

```text
why
what changed
whether it was an error
whether it affects reliability
whether it should update organization preferences
whether it requires rework
whether it requires approval
whether it becomes a regression case
```

---

# 3. ARQUITECTURA

```text
AI EMPLOYEE
↓
WORK PRODUCT
↓
TECHNICAL VALIDATION
↓
CLIENT DELIVERY
↓
ACCEPTANCE DECISION
↓
FEEDBACK CLASSIFICATION
↓
REVISION PLAN
↓
REVISION
↓
DIFF
↓
REVALIDATION
↓
REDELIVERY
↓
FINAL ACCEPTANCE
↓
QUALITY / PREFERENCE / RELIABILITY UPDATE
```

---

# 4. ACCEPTANCE STATES

Criar:

```text
NOT_DELIVERED
DELIVERED
AWAITING_REVIEW
ACCEPTED
ACCEPTED_WITH_MINOR_CHANGES
REVISION_REQUIRED
REJECTED
ESCALATED
WITHDRAWN
SUPERSEDED
```

---

# 5. FEEDBACK TAXONOMY

Criar:

```text
OBJECTIVE_ERROR
MATERIAL_ERROR
INCOMPLETE_WORK
INSTRUCTION_MISS
CLIENT_PREFERENCE
STYLE_PREFERENCE
FORMAT_PREFERENCE
TONE_PREFERENCE
LENGTH_PREFERENCE
LAYOUT_PREFERENCE
TEMPLATE_MISMATCH
BRANDING_MISMATCH
AUDIENCE_MISMATCH
LANGUAGE_MISMATCH
DETAIL_LEVEL_MISMATCH
NEW_REQUIREMENT
SCOPE_CHANGE
CLIENT_CHANGED_MIND
LATE_REQUIREMENT
POLICY_CONFLICT
LEGAL_CONSTRAINT
UNSUPPORTED_REQUEST
DATA_CHANGED
SOURCE_CHANGED
SYSTEM_CHANGED
OTHER
```

---

# 6. NÃO PENALIZAR PREFERÊNCIA COMO ERRO

Exemplo:

```text
“Quero a carta mais curta.”
```

classificar:

```text
LENGTH_PREFERENCE
```

não:

```text
OBJECTIVE_ERROR
```

---

# 7. ERRO OBJECTIVO

Exemplo:

```text
NIF incorrecto
```

classificar:

```text
OBJECTIVE_ERROR
```

e alimentar:

```text
Employee Reliability & Error Measurement System
```

---

# 8. ERRO MATERIAL

Exemplo:

```text
valor financeiro incorrecto
prazo legal incorrecto
classificação contabilística material incorrecta
```

classificar:

```text
MATERIAL_ERROR
```

e alimentar:

```text
EREMS
+
Regression
+
Certification Review
```

---

# 9. NOVA EXIGÊNCIA

Exemplo:

```text
cliente inicialmente pediu relatório de 3 páginas
depois pede também anexos detalhados
```

classificar:

```text
NEW_REQUIREMENT
```

Não penalizar Employee.

---

# 10. ALTERAÇÃO DE ESCOPO

Exemplo:

```text
cliente pede carta
depois pede contrato completo
```

classificar:

```text
SCOPE_CHANGE
```

---

# 11. CLIENTE MUDOU DE IDEIA

Permitir:

```text
CLIENT_CHANGED_MIND
```

como categoria explícita.

---

# 12. POLÍTICA DE VERDADE

O sistema deve sempre distinguir:

```text
ERROR
vs
PREFERENCE
vs
SCOPE CHANGE
vs
NEW REQUIREMENT
```

---

# 13. WORK ACCEPTANCE CRITERIA

Antes da execução, quando útil, criar:

`WorkAcceptanceCriteria`

Campos:

```text
objective
audience
deliverable_type
format
language
locale
currency
tone
length
detail_level
template
branding
deadline
destination
mandatory_sections
forbidden_content
review_required
approval_required
```

---

# 14. NÃO BUROCRATIZAR PEDIDOS SIMPLES

Se o pedido for claro:

```text
“Faça uma carta simples para o banco.”
```

não exigir questionário extenso.

Usar defaults organizacionais e padrões seguros.

---

# 15. INTENT NORMALIZATION

Converter pedido em:

```text
normalized intent
+
acceptance criteria
+
constraints
```

---

# 16. ACCEPTANCE CRITERIA SNAPSHOT

Guardar o critério exacto utilizado na execução.

Assim pode-se comparar:

```text
pedido original
vs
trabalho entregue
```

---

# 17. DELIVERABLE FIT

Criar métrica:

```text
Deliverable Fit Score
```

por dimensões, não como nota vaga.

---

# 18. DIMENSÕES DE DELIVERABLE FIT

```text
objective_fit
audience_fit
format_fit
tone_fit
length_fit
detail_fit
template_fit
branding_fit
instruction_adherence
```

---

# 19. CLIENT ACCEPTANCE DECISION

Após entrega, permitir:

```text
ACEITAR
ACEITAR COM PEQUENAS ALTERAÇÕES
PEDIR REVISÃO
REJEITAR
ESCALAR
```

---

# 20. QUICK FEEDBACK

Permitir feedback simples:

```text
Muito longo
Muito curto
Tom inadequado
Formato inadequado
Layout inadequado
Informação incorrecta
Informação incompleta
Não seguiu o pedido
Não seguiu o modelo
Quero outra abordagem
Outro
```

---

# 21. NATURAL LANGUAGE FEEDBACK

Permitir:

```text
“Quero algo mais simples e com uma tabela comparativa.”
```

Normalizar para categorias estruturadas.

---

# 22. REVISION REQUEST

Criar:

`RevisionRequest`

Campos:

```text
revision_id
work_product_id
document_id
organization_id
requested_by
feedback_types[]
client_comment
severity
preserve[]
change[]
add[]
remove[]
constraints[]
requested_deadline
approval_required
created_at
status
```

---

# 23. REVISION SEVERITY

```text
RVS0 — COSMETIC
RVS1 — MINOR
RVS2 — SUBSTANTIVE
RVS3 — MATERIAL
RVS4 — CRITICAL
```

---

# 24. PRESERVE / CHANGE MODEL

Toda revisão deve permitir:

```text
PRESERVE
CHANGE
ADD
REMOVE
```

---

# 25. NÃO REFAZER TUDO SEM NECESSIDADE

Se conteúdo está aprovado e apenas layout muda:

```text
PRESERVE CONTENT
CHANGE PRESENTATION
```

---

# 26. CONTENT / PRESENTATION / FORMAT / DELIVERY

Manter separação:

```text
CONTENT
!=
PRESENTATION
!=
FORMAT
!=
DELIVERY
```

---

# 27. REVISION ENGINE

Criar:

```text
Original Work Product
+
Revision Request
+
Preserve Rules
+
Change Rules
+
Applicable Policies
↓
Revision Plan
↓
Revised Work Product
```

---

# 28. REVISION PLAN

Campos:

```text
revision_id
affected_sections[]
preserved_sections[]
recomputed_sections[]
rerendered_formats[]
required_tools[]
required_revalidation[]
approval_impact
estimated_change_scope
```

---

# 29. REVISION DIFF

Gerar:

```text
before
after
change type
reason
source
reviewer
```

---

# 30. CLIENT-VISIBLE DIFF

Para documentos e outputs estruturados, permitir:

```text
“Ver alterações”
```

---

# 31. VERSIONING

Nunca sobrescrever silenciosamente.

```text
v1
↓
revision
↓
v2
↓
revision
↓
v3
```

---

# 32. APPROVED VERSION PROTECTION

Documento aprovado não deve ser modificado in-place.

Criar nova versão.

---

# 33. APPROVAL INVALIDATION

Se revisão alterar conteúdo material:

```text
approval invalidated
```

e nova aprovação será necessária.

---

# 34. APPROVAL SNAPSHOT

Manter:

```text
approved content hash
```

---

# 35. REVISION DOES NOT ALWAYS INVALIDATE APPROVAL

Alteração puramente cosmética pode, se policy permitir, não exigir nova aprovação.

---

# 36. CLIENT PREFERENCE PROFILE

Criar:

`OrganizationPreferenceProfile`

---

# 37. PREFERENCE DIMENSIONS

```text
language
locale
currency
tone
formality
length
detail_level
structure
executive_summary
table_preference
chart_preference
branding
template
document_format
report_style
email_style
presentation_style
```

---

# 38. ORGANIZATION-SCOPED PREFERENCES

Preferências aprendidas devem ser:

```text
organization-scoped
```

por defeito.

---

# 39. USER-SCOPED PREFERENCES

Permitir preferências específicas de utilizador quando apropriado.

---

# 40. ROLE-SCOPED PREFERENCES

Permitir:

```text
Finance Director prefers concise reports
Legal Director prefers detailed clauses
```

---

# 41. TASK-TYPE PREFERENCES

Exemplo:

```text
letters → concise
management reports → executive first
proposals → visual
```

---

# 42. PREFERENCE LEARNING

Fluxo:

```text
Repeated feedback
↓
Preference Candidate
↓
Pattern Detection
↓
Human Confirmation if needed
↓
Organization Preference Update
```

---

# 43. NO DIRECT UNSUPERVISED PREFERENCE LEARNING

Uma única revisão não deve criar automaticamente regra permanente.

---

# 44. PREFERENCE CANDIDATE MODEL

```text
candidate_id
organization_id
user_id
task_type
observed_pattern
supporting_examples[]
confidence
scope
review_status
```

---

# 45. PREFERENCE PROMOTION

Exemplo:

```text
5 similar revisions
↓
candidate
↓
confirm:
“Usar sempre cartas curtas nesta organização?”
```

---

# 46. PREFERENCE PRECEDENCE

Obrigatório:

```text
PLATFORM SAFETY
APPLICABLE LAW
REGULATION
ORGANIZATION POLICY
APPROVAL RULES
ROLE CONSTRAINTS
CLIENT PREFERENCE
```

---

# 47. CLIENT PREFERENCE NEVER OVERRIDES SAFETY

Exemplo:

```text
“Não peça aprovação para pagamentos.”
```

→

```text
REJECT AS PREFERENCE
```

---

# 48. CLIENT PREFERENCE NEVER OVERRIDES LAW

Exemplo:

```text
“Retire a obrigação legal do relatório.”
```

se obrigatório:

```text
POLICY_CONFLICT
```

ou:

```text
LEGAL_CONSTRAINT
```

---

# 49. MANDATORY CONTENT

Criar:

```text
mandatory_content
```

por:

```text
law
policy
document type
risk
```

---

# 50. CLIENT OVERRIDE LIMIT

Cliente pode alterar:

```text
style
tone
layout
optional content
```

mas não pode remover conteúdo obrigatório sem autorização adequada.

---

# 51. FIRST-PASS ACCEPTANCE RATE

Criar:

```text
First-Pass Acceptance Rate
=
accepted_without_revision
/
total_delivered
```

---

# 52. REVISION RATE

```text
Revision Rate
=
work products requiring revision
/
total delivered
```

---

# 53. CLIENT REJECTION RATE

```text
Rejected
/
Total delivered
```

---

# 54. AVERAGE REVISIONS PER TASK

```text
total revisions
/
accepted tasks
```

---

# 55. TIME TO ACCEPTANCE

```text
first delivery timestamp
→ final acceptance timestamp
```

---

# 56. PREFERENCE MATCH RATE

Medir se Employee aplicou preferências activas da organização.

---

# 57. INSTRUCTION ADHERENCE RATE

Medir:

```text
explicit requirements satisfied
/
explicit requirements
```

---

# 58. MATERIAL REWORK RATE

Medir:

```text
tasks requiring material content change
/
tasks delivered
```

---

# 59. CLIENT CORRECTION RATE

Medir correcções factuais/materials feitas pelo cliente.

---

# 60. TECHNICAL RELIABILITY VS CLIENT ACCEPTANCE

Mostrar separadamente:

```text
Technical Reliability
Client Acceptance
First-Pass Acceptance
Revision Rate
```

---

# 61. NÃO CRIAR UMA ÚNICA NOTA

Não mostrar:

```text
Employee Score = 92%
```

sem decomposição.

---

# 62. EXAMPLE QUALITY PROFILE

```text
Technical Reliability       99.2%
First-Pass Acceptance       82.0%
Revision Rate               18.0%
Material Rework              2.1%
Preference Match            94.0%
```

---

# 63. USER SATISFACTION IS NOT TRUTH

Cliente pode preferir resultado incorrecto.

O sistema deve manter:

```text
factuality
law
policy
safety
```

acima de satisfação.

---

# 64. DISAGREEMENT HANDLING

Se cliente rejeitar conteúdo obrigatório:

```text
CLIENT_DISAGREEMENT_WITH_REQUIRED_CONTENT
```

---

# 65. HUMAN ESCALATION

Quando conflito persistir:

```text
HUMAN_REVIEW_REQUIRED
```

---

# 66. CLIENT ACCEPTANCE IS NOT CERTIFICATION

Um trabalho aceite não prova reliability global.

---

# 67. CLIENT REJECTION IS NOT AUTOMATIC ERROR

Um trabalho rejeitado não reduz EREMS automaticamente.

---

# 68. INTEGRATION WITH EREMS

Mapear:

```text
OBJECTIVE_ERROR
MATERIAL_ERROR
INCOMPLETE_WORK when objective
INSTRUCTION_MISS when material
```

para EREMS conforme policy.

---

# 69. NON-ERROR FEEDBACK DOES NOT AFFECT ERROR RATE

Categorias como:

```text
STYLE_PREFERENCE
FORMAT_PREFERENCE
CLIENT_CHANGED_MIND
NEW_REQUIREMENT
SCOPE_CHANGE
```

não alteram error rate.

---

# 70. ERROR FEEDBACK BECOMES RELIABILITY EVENT

```text
objective client correction
↓
review
↓
confirmed error
↓
EREMS error event
```

---

# 71. CONFIRM BEFORE RELIABILITY PENALTY

Feedback do cliente sozinho não basta para classificar erro material.

Validar quando necessário.

---

# 72. DISPUTED FEEDBACK

Criar:

```text
FEEDBACK_DISPUTED
```

---

# 73. FEEDBACK REVIEW WORKFLOW

```text
Client Feedback
↓
Classification
↓
Auto-resolution or Reviewer
↓
Confirmed Category
↓
Revision
↓
Metrics Update
```

---

# 74. CLIENT FEEDBACK CONFIDENCE

Guardar confiança da classificação de feedback.

---

# 75. FEEDBACK SOURCE

```text
client_user
internal_reviewer
domain_expert
automated_validator
system
```

---

# 76. MULTI-REVIEWER CONFLICT

Se cliente e especialista discordarem:

```text
FEEDBACK_CONFLICT
```

---

# 77. RESOLUTION AUTHORITY

Resolver conforme:

```text
domain
risk
law
policy
contract
```

---

# 78. CONTRACTUAL ACCEPTANCE

Suportar critérios contratuais quando aplicável.

---

# 79. SLA FOR REVISIONS

Definir:

```text
revision SLA
```

por plano/contrato/task type.

---

# 80. REVISION PRIORITY

```text
LOW
NORMAL
HIGH
URGENT
```

---

# 81. REVISION QUEUE

Criar:

```text
Revision Queue
```

---

# 82. REVISION QUEUE FIELDS

```text
revision_id
employee_id
organization_id
work_product_id
severity
priority
owner
status
deadline
```

---

# 83. REVISION STATUS

```text
REQUESTED
CLASSIFYING
PLANNED
IN_REVISION
REVALIDATING
AWAITING_APPROVAL
READY_FOR_REDELIVERY
REDELIVERED
ACCEPTED
REJECTED
CANCELLED
```

---

# 84. REVISION OWNERSHIP

Pode ser:

```text
same Employee
specialist Employee
reviewer Employee
human
```

---

# 85. SPECIALIST HANDOFF

Exemplo:

```text
#261 Document Creator
↓
legal issue found
↓
#267 Legal Document Employee
```

---

# 86. REVIEWER HANDOFF

Exemplo:

```text
#265 Report Employee
↓
#281 Document Reviewer
```

---

# 87. DOCUMENT-SPECIFIC REVISION

Para documentos:

```text
content
format
layout
template
branding
language
signature
```

como dimensões separadas.

---

# 88. SPREADSHEET-SPECIFIC REVISION

```text
data
formula
table
chart
format
sheet structure
```

---

# 89. PRESENTATION-SPECIFIC REVISION

```text
storyline
slide count
visual density
charts
text
branding
```

---

# 90. EMAIL / MESSAGE REVISION

```text
tone
length
call-to-action
formality
```

---

# 91. REPORT REVISION

```text
executive summary
detail
KPIs
variance analysis
recommendations
appendices
```

---

# 92. CONTRACT REVISION

```text
clause
obligation
term
jurisdiction
risk
approval
```

---

# 93. REVISION MATERIALITY

Mudanças legais, fiscais, financeiras ou contratuais devem ser classificadas por materialidade.

---

# 94. REVALIDATION

Toda revisão material deve passar novamente por:

```text
validation
policy
risk
approval
```

---

# 95. SOURCE LINEAGE PRESERVATION

Revisão não pode perder lineage.

---

# 96. CLIENT REQUEST TRACEABILITY

Guardar:

```text
original request
acceptance criteria
delivered output
feedback
revision
final acceptance
```

---

# 97. ACCEPTANCE RECEIPT

Criar:

`AcceptanceReceipt`

Campos:

```text
acceptance_id
work_product_id
organization_id
accepted_by
accepted_at
accepted_version
status
comments
conditions[]
```

---

# 98. FINAL ACCEPTANCE

`ACCEPTED` deve apontar para uma versão exacta.

---

# 99. ACCEPTED WITH CONDITIONS

Permitir:

```text
ACCEPTED_WITH_CONDITIONS
```

---

# 100. CLIENT SIGN-OFF

Para outputs materiais, permitir sign-off explícito.

---

# 101. AUDIT TRAIL

Guardar:

```text
who requested
who delivered
who reviewed
who revised
who accepted
when
what changed
why
```

---

# 102. ORGANIZATION PREFERENCE HISTORY

Versionar preferências.

---

# 103. PREFERENCE EFFECTIVE DATE

Guardar:

```text
effective_from
effective_until
```

---

# 104. PREFERENCE CONFLICT

Exemplo:

```text
CEO prefers short
CFO prefers detailed
```

Resolver por:

```text
task audience
role
organization policy
specificity
```

---

# 105. PREFERENCE SCOPE

```text
GLOBAL_ORG
DEPARTMENT
ROLE
USER
TASK_TYPE
DOCUMENT_TYPE
```

---

# 106. PREFERENCE SPECIFICITY

Mais específico vence, respeitando policy.

---

# 107. PREFERENCE CONFIDENCE

Guardar:

```text
explicit
inferred
confirmed
```

---

# 108. EXPLICIT PREFERENCE

Preferência explicitamente declarada tem prioridade sobre inferida.

---

# 109. INFERRED PREFERENCE

Só usar se confiança suficiente.

---

# 110. PREFERENCE EXPIRY

Permitir expiração para preferências temporárias.

---

# 111. FEEDBACK ANALYTICS

Dashboard por:

```text
Employee
Department
Organization
Task Type
Document Type
Feedback Category
Revision Severity
```

---

# 112. MOST COMMON REVISIONS

Mostrar:

```text
too long
too detailed
wrong tone
template mismatch
missing section
etc.
```

---

# 113. ROOT CAUSE OF REVISION

Classificar:

```text
bad acceptance criteria
Employee execution
template issue
organization preference missing
new requirement
client mind change
data change
```

---

# 114. REDUCE AVOIDABLE REVISIONS

Objectivo:

```text
reduce preventable revision rate
```

---

# 115. PREVENTABLE VS NON-PREVENTABLE REVISION

Criar:

```text
PREVENTABLE
NON_PREVENTABLE
UNKNOWN
```

---

# 116. PREVENTABLE REVISION EXAMPLES

```text
ignored explicit instruction
wrong template
known preference not applied
```

---

# 117. NON-PREVENTABLE REVISION EXAMPLES

```text
new requirement
client changed mind
source data changed
```

---

# 118. FIRST-PASS ACCEPTANCE TARGETS

Definir por role/task type.

Não usar target universal.

---

# 119. CLIENT ACCEPTANCE THRESHOLDS

Podem variar por:

```text
task type
organization
risk
document type
```

---

# 120. EREMS + CAQRS COMBINED VIEW

Mostrar:

```text
Technical Reliability
Material Error Rate
UMER
First-Pass Acceptance
Revision Rate
Preference Match
Human Correction Rate
```

---

# 121. NO GAMIFIED SATISFACTION RANKING

Não criar ranking simplista de “melhor Employee”.

---

# 122. NO MANIPULATIVE UX

Não pressionar cliente a aceitar.

---

# 123. REJECT WITHOUT PENALTY

Cliente pode rejeitar e pedir revisão sem fricção.

---

# 124. FEEDBACK QUALITY

Permitir pedir esclarecimento apenas quando necessário.

---

# 125. LOW-FRICTION FEEDBACK

Para trabalhos simples:

```text
Accept
Revise
```

deve ser suficiente.

---

# 126. HIGH-RISK FEEDBACK

Para trabalhos materiais, pedir categoria e comentário quando rejeitado.

---

# 127. ORGANIZATION LEARNING

Aprender:

```text
style
format
structure
tone
preferred templates
preferred level of detail
```

---

# 128. NO POLICY LEARNING FROM PREFERENCE

Nunca aprender:

```text
approval bypass
security bypass
legal bypass
permission bypass
```

como preferência.

---

# 129. FEEDBACK POISONING DEFENSE

Testar:

```text
malicious feedback
attempt to weaken controls
prompt injection in comments
fake preference
cross-tenant preference leakage
```

---

# 130. TENANT ISOLATION

Preferências de Org A nunca entram em Org B.

---

# 131. USER IDENTITY

Todo feedback persistente deve estar associado a identidade autenticada quando aplicável.

---

# 132. AUTHORITY TO SET ORG PREFERENCES

Nem todo utilizador pode criar preferências globais.

---

# 133. PREFERENCE APPROVAL

Preferências organizacionais materiais podem exigir aprovação de responsável.

---

# 134. SECURITY CLASSIFICATION

Feedback pode conter dados sensíveis.

Aplicar classificação.

---

# 135. DATA RETENTION

Aplicar retention policy a:

```text
feedback
revisions
accepted versions
preferences
```

---

# 136. PRIVACY

Não usar feedback de uma organização para treinar comportamento global sem autorização/processo apropriado.

---

# 137. CROSS-ORGANIZATION LEARNING

Apenas padrões abstractos e aprovados podem eventualmente beneficiar Core.

---

# 138. LEARNING CANDIDATE

Feedback recorrente pode gerar:

```text
Learning Candidate
```

---

# 139. LEARNING PIPELINE

```text
feedback pattern
↓
candidate
↓
review
↓
evaluation
↓
regression
↓
approval
↓
versioned update
```

---

# 140. IMPROVEMENT SCOPE

Classificar:

```text
GLOBAL
DEPARTMENT
ROLE
TASK_TYPE
ORGANIZATION
USER
DOCUMENT_TYPE
```

---

# 141. VERSION-AWARE METRICS

Não misturar acceptance metrics de versões diferentes sem identificação.

---

# 142. BEFORE / AFTER ANALYSIS

Após melhoria:

```text
before first-pass acceptance
after first-pass acceptance
```

---

# 143. A/B TESTING

Opcionalmente permitir testes controlados de formato/estrutura.

Nunca para contornar regras.

---

# 144. QUALITY TREND

Mostrar:

```text
improving
stable
degrading
insufficient_data
```

---

# 145. CLIENT ACCEPTANCE DRIFT

Se preferências mudarem:

```text
PREFERENCE_DRIFT
```

---

# 146. ORGANIZATION STYLE GUIDE GENERATOR

Gerar Style Guide a partir de preferências aprovadas.

---

# 147. ORGANIZATION STYLE GUIDE

Conteúdo:

```text
language
tone
length
templates
report structure
letter style
presentation style
table style
branding rules
```

---

# 148. STYLE GUIDE VERSIONING

Versionar e effective-date.

---

# 149. ACCEPTANCE CRITERIA TEMPLATES

Criar templates por task type.

---

# 150. DOCUMENT ACCEPTANCE TEMPLATE

Exemplo:

```text
correct data
correct company
correct addressee
correct subject
approved template
correct branding
required signature
requested formats
```

---

# 151. REPORT ACCEPTANCE TEMPLATE

```text
period
KPIs
comparators
executive summary
sources
recommendations
format
```

---

# 152. CONTRACT ACCEPTANCE TEMPLATE

```text
parties
dates
terms
jurisdiction
mandatory clauses
approval
```

---

# 153. SPREADSHEET ACCEPTANCE TEMPLATE

```text
correct data
formulas
totals
sheet structure
filters
format
currency
```

---

# 154. PRESENTATION ACCEPTANCE TEMPLATE

```text
audience
slide count
storyline
charts
branding
detail level
```

---

# 155. UI — ACCEPTANCE BAR

Após entrega mostrar:

```text
Accept
Request Revision
Reject
```

---

# 156. UI — REVISION PANEL

Campos:

```text
What should change?
What should stay?
Comment
Priority
Deadline
```

---

# 157. UI — FEEDBACK CLASSIFICATION

Pode ser automático com confirmação humana.

---

# 158. UI — VERSION HISTORY

Mostrar:

```text
v1
v2
v3
```

com diffs.

---

# 159. UI — ORGANIZATION PREFERENCES

Criar ecrã:

```text
Work Preferences
Document Preferences
Report Preferences
Communication Preferences
Presentation Preferences
```

---

# 160. UI — QUALITY DASHBOARD

Mostrar:

```text
First-Pass Acceptance
Revision Rate
Rejection Rate
Average Revisions
Time to Acceptance
Preference Match
Preventable Revision Rate
```

---

# 161. UI — EMPLOYEE QUALITY TAB

Na ficha do Employee:

```text
Acceptance
Revisions
Feedback Categories
Preventable Rework
Preference Match
Trend
```

---

# 162. UI — ORGANIZATION QUALITY VIEW

Mostrar por organização sem misturar tenants.

---

# 163. EVENTS

Emitir:

```text
EV.acceptance.delivered
EV.acceptance.accepted
EV.acceptance.revision_requested
EV.acceptance.rejected
EV.acceptance.feedback_classified
EV.acceptance.preference_candidate
EV.acceptance.preference_updated
EV.acceptance.final_accepted
```

---

# 164. DATABASE ENTITIES

Criar:

```text
work_acceptance_criteria
work_acceptance_events
acceptance_receipts
client_feedback
feedback_classifications
revision_requests
revision_plans
revision_versions
revision_diffs
organization_preference_profiles
preference_versions
preference_candidates
preference_conflicts
quality_metrics
quality_metric_snapshots
preventable_revision_events
client_acceptance_drift
organization_style_guides
style_guide_versions
```

---

# 165. APIs

Criar:

```text
POST /work-products/{id}/accept
POST /work-products/{id}/revision-request
POST /work-products/{id}/reject

GET  /work-products/{id}/acceptance
GET  /work-products/{id}/revisions
GET  /work-products/{id}/versions
GET  /work-products/{id}/diff

GET  /organizations/{id}/preferences
POST /organizations/{id}/preferences
POST /organizations/{id}/preferences/confirm

GET  /quality/dashboard
GET  /quality/employees/{id}
GET  /quality/organizations/{id}

POST /feedback/{id}/classify
POST /feedback/{id}/review
```

---

# 166. QUALITY CALCULATION SERVICE

Métricas devem ser calculadas deterministicamente.

---

# 167. EREMS BRIDGE

Criar bridge:

```text
CAQRS confirmed objective error
↓
EREMS error event
```

---

# 168. ORDKS BRIDGE

Feedback pode revelar:

```text
knowledge gap
operational reality gap
missing exception
```

e gerar candidate para ORDKS.

---

# 169. WORK CONTRACT BRIDGE

Revision causada por requisito mal capturado pode actualizar Work Contract template.

---

# 170. DOCUMENT SERVICE BRIDGE

Revisões de formato/layout devem integrar Document Service sem regenerar conteúdo desnecessariamente.

---

# 171. SHADOW MODE BRIDGE

Durante Shadow Mode, também medir:

```text
Would client accept?
```

quando houver benchmark adequado.

---

# 172. CERTIFICATION BRIDGE

Client Acceptance não substitui Reliability.

Mas taxas persistentes de instruction miss ou preventable revision podem afectar certificação de qualidade.

---

# 173. ORGANIZATION READINESS BRIDGE

Antes de activar Employee numa organização, carregar Preference Profile e Style Guide aplicáveis.

---

# 174. TESTING

Testar:

```text
technical error feedback
subjective preference feedback
scope change
new requirement
client changed mind
policy conflict
legal conflict
revision preservation
revision diff
versioning
approval invalidation
preference learning
tenant isolation
feedback poisoning
```

---

# 175. ACCEPTANCE TESTS

Obrigatórios:

1. feedback subjectivo não altera error rate;
2. erro factual confirmado altera EREMS;
3. scope change não penaliza Employee;
4. new requirement não penaliza Employee;
5. approved content pode ser preservado;
6. material revision invalida approval quando aplicável;
7. version history preserva v1/v2/v3;
8. preference profile é tenant-scoped;
9. user preference não vira org preference automaticamente;
10. repeated feedback pode gerar preference candidate;
11. preference nunca contorna safety/policy/law;
12. cross-tenant preference leak é bloqueado;
13. client-visible diff funciona;
14. acceptance receipt aponta para versão exacta;
15. quality metrics são determinísticas;
16. preventable vs non-preventable revision funciona;
17. organization style guide é versionado;
18. feedback poisoning é detectado;
19. EREMS bridge funciona;
20. ORDKS improvement candidate funciona.

---

# 176. BUILD GATE

Executar:

```text
ACCEPTANCE MODEL              PASS
FEEDBACK TAXONOMY             PASS
REVISION ENGINE               PASS
VERSIONING                    PASS
DIFF ENGINE                   PASS
PREFERENCE PROFILE            PASS
PREFERENCE GOVERNANCE         PASS
QUALITY METRICS               PASS
EREMS BRIDGE                  PASS
ORDKS BRIDGE                  PASS
DOCUMENT SERVICE BRIDGE       PASS
TENANT ISOLATION              PASS
AUDIT                         PASS
SECURITY                      PASS
```

---

# 177. QUALITY REPORT

Exemplo:

```text
Employee: #261 Document Creator
Version: 2.1

Deliveries:                  1,200
First-Pass Acceptance:       84.2%
Revision Rate:               15.8%
Preventable Revision Rate:    4.1%
Material Rework Rate:         1.2%
Rejection Rate:               0.9%
Preference Match:            96.0%
Avg Revisions per Accepted:   0.24
Time to Acceptance:           18m

Top Revision Reasons:
1. Too long
2. Template mismatch
3. More tables requested
```

Valores apenas ilustrativos.

---

# 178. COMBINED RELIABILITY + ACCEPTANCE REPORT

Exemplo:

```text
Technical Reliability         99.1%
Material Error Rate            0.12%
UMER                           0.03%

First-Pass Acceptance         84.2%
Revision Rate                 15.8%
Preference Match              96.0%
```

---

# 179. NO FALSE QUALITY CLAIMS

Nunca declarar:

```text
“95% customer satisfaction”
```

sem:

```text
sample size
scope
period
definition
```

---

# 180. QUALITY BY CONTEXT

Medir por:

```text
organization
user
task type
document type
department
industry
jurisdiction
language
template
```

---

# 181. ORGANIZATION-SPECIFIC QUALITY

Employee pode ter:

```text
high acceptance in Org A
lower in Org B
```

por estilos diferentes.

---

# 182. ADAPTATION GOAL

Objectivo:

```text
reduce preventable revisions over time
```

sem reduzir safety/factuality.

---

# 183. CLIENT ACCEPTANCE TREND

Mostrar:

```text
improving
stable
degrading
```

---

# 184. ALERTS

Emitir alerta quando:

```text
revision rate spikes
rejection rate spikes
preventable rework spikes
preference mismatch rises
```

---

# 185. AUTO-SUPERVISION IMPACT

Se instruction miss/material rework aumenta:

```text
increase review
```

conforme policy.

---

# 186. HUMAN REVIEW FOR HIGH-RISK OUTPUTS

Mesmo com cliente satisfeito, outputs R4/R5 continuam sujeitos a controlos.

---

# 187. ACCEPTANCE DOES NOT OVERRIDE APPROVAL

Cliente aceitar não substitui approval required.

---

# 188. CLIENT REVISION LIMITS

Planos comerciais podem definir número de revisões incluídas, mas segurança/erro objectivo não deve ser tratado como “revisão paga”.

---

# 189. BILLING CLASSIFICATION

Distinguir:

```text
ERROR_CORRECTION
CLIENT_REVISION
SCOPE_CHANGE
NEW_REQUEST
```

para billing futuro.

---

# 190. NO BILLING PENALTY FOR CONFIRMED EMPLOYEE ERROR

Permitir policy:

```text
confirmed error correction
→ no revision charge
```

---

# 191. COMMERCIAL PLAN SUPPORT

Futuramente permitir:

```text
included revisions
premium review
human expert review
priority revision SLA
```

---

# 192. CLIENT TRUST VIEW

Mostrar:

```text
version
sources
approval
review
changes
```

para aumentar transparência.

---

# 193. FINAL ACCEPTED WORK

Criar estado:

```text
FINAL_ACCEPTED
```

---

# 194. FINAL ACCEPTED WORK PRODUCT

Associar:

```text
work_product_id
version
acceptance_receipt
```

---

# 195. ARCHIVE

Arquivar:

```text
original
revisions
final accepted
feedback
acceptance
```

---

# 196. SEARCH

Permitir procurar:

```text
all rejected work
all revised reports
all preference mismatches
all preventable revisions
```

---

# 197. ANALYTICS FOR PRODUCT TEAM

Usar padrões agregados para melhorar UX e defaults.

---

# 198. NO SILENT GLOBAL LEARNING

Nunca usar feedback de um cliente como regra global automática.

---

# 199. QUALITY GOVERNANCE

Criar owners para:

```text
feedback taxonomy
acceptance templates
preference policy
quality metrics
```

---

# 200. CHANGE MANAGEMENT

Mudança material em taxonomy/metrics deve ser versionada.

---

# 201. RELIABILITY + ACCEPTANCE + READINESS

A plataforma deve distinguir:

```text
READINESS
= está preparado?

RELIABILITY
= trabalha correctamente?

ACCEPTANCE
= o cliente aceita o trabalho?

PREFERENCE FIT
= está alinhado ao estilo esperado?
```

---

# 202. FULL QUALITY STACK

```text
Employee Readiness
↓
Reliability
↓
Technical Validation
↓
Client Acceptance
↓
Revision
↓
Preference Learning
↓
Final Accepted Work
```

---

# 203. 500/500 COVERAGE

Todos os 500 Employees devem possuir política de aceitação aplicável:

```text
acceptance_required
acceptance_optional
system_acceptance
human_acceptance
```

---

# 204. ROLE-SPECIFIC ACCEPTANCE

Nem toda função depende de “gosto”.

Exemplo:

```text
bank reconciliation
→ technical acceptance dominates
```

---

# 205. SUBJECTIVE OUTPUTS

Para:

```text
documents
presentations
marketing
strategy
reports
communications
```

client preference tem maior peso.

---

# 206. OBJECTIVE OUTPUTS

Para:

```text
calculations
validation
reconciliation
compliance
```

technical correctness domina.

---

# 207. ACCEPTANCE POLICY PROFILE

Criar por Role:

```yaml
acceptance_policy:
  role_key: document_creator
  client_review: required
  preference_weight: high
  technical_validation: required
  material_change_reapproval: true
```

---

# 208. SYSTEM OUTPUT ACCEPTANCE

Para outputs system-to-system, aceitação pode ser:

```text
schema valid
write success
downstream acknowledgement
```

---

# 209. AUTOMATED ACCEPTANCE

Só usar quando criteria são determinísticos.

---

# 210. HUMAN ACCEPTANCE

Necessária quando qualidade é subjectiva/material.

---

# 211. ACCEPTANCE EVIDENCE

Guardar:

```text
acceptance type
actor
version
timestamp
criteria
```

---

# 212. DEFINITION OF DONE

CAQRS só está implementado quando:

```text
✓ acceptance states existem
✓ feedback taxonomy existe
✓ revision engine existe
✓ versioning existe
✓ diff existe
✓ acceptance receipt existe
✓ organization preference profile existe
✓ preference governance existe
✓ preference learning is controlled
✓ quality metrics existem
✓ preventable/non-preventable revision existe
✓ EREMS bridge existe
✓ ORDKS bridge existe
✓ Work Contract bridge existe
✓ Document Service bridge existe
✓ tenant isolation passa
✓ security tests passam
✓ 500/500 acceptance policies existem
✓ UI existe
✓ APIs existem
✓ audit trail existe
```

---

# 213. PRINCÍPIO FINAL

O sistema deve ser capaz de responder:

```text
O Employee errou?
O trabalho está tecnicamente correcto?
O pedido foi seguido?
O cliente apenas prefere outra abordagem?
O cliente mudou o escopo?
O cliente acrescentou nova exigência?
A revisão é evitável?
A revisão afecta reliability?
A revisão deve actualizar preferências?
A preferência é segura e permitida?
O conteúdo deve ser preservado?
É necessária nova aprovação?
Qual versão foi finalmente aceite?
```

---

# 214. RESULTADO ESPERADO

Depois da implementação:

```text
AI EMPLOYEE
↓
TECHNICALLY CORRECT WORK
↓
CLIENT REVIEW
↓
ACCEPT / REVISE / REJECT
↓
FEEDBACK CLASSIFICATION
↓
SAFE REVISION
↓
PREFERENCE ADAPTATION
↓
FINAL ACCEPTED WORK
↓
QUALITY METRICS
↓
CONTINUOUS IMPROVEMENT
```

O objectivo final é permitir que os 500 Employees não apenas:

```text
“façam o trabalho correctamente”
```

mas também:

```text
“entreguem o trabalho da forma que a organização realmente espera,
aprendam preferências válidas,
reduzam revisões evitáveis,
preservem segurança e factualidade,
e mantenham cada alteração totalmente auditável.”
```
