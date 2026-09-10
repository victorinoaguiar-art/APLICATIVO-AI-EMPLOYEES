# PROMPT MESTRE — AI EMPLOYEE ENTERPRISE PILOT TESTING & OMNICHANNEL WORK DELIVERY SYSTEM
## Teste Controlado em Empresa Real, Pré-visualização, Revisão, Aprovação, Impressão, Email, WhatsApp, Download, Arquivo e Entrega Segura dos Trabalhos dos 500 AI Employees

**Sigla:** EPTOWDS  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program  
**Integrações obrigatórias:** EMVTCS, APCATOS, ATCCRS, AESSRE, EREMS, CAQRS, ORDKS, CLBGS, Document Generation Service, Runtime Orchestrator, Enterprise Data Gateway, Connector SDK, Approval Engine, Delivery Router, Audit, Observability, Organization Readiness e Shadow Mode.  
**Objectivo:** permitir que qualquer um dos 500 AI Employees seja testado dentro de uma empresa real, inicialmente com risco controlado, dados e permissões limitados, supervisão humana e outputs sujeitos a revisão; e permitir que os trabalhos aprovados sejam pré-visualizados, impressos, descarregados, enviados por email, enviados por WhatsApp/serviço de mensagens autorizado, guardados em Drive/DMS ou encaminhados para outro Employee.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por Arquitecto Principal de Software, Arquitecto SaaS Multi-Tenant, Arquitecto de Segurança Zero Trust, Engenheiros Backend/Frontend/Mobile/Integrações/Document Systems/Test Automation, especialistas em Human-in-the-Loop, Reliability, Email Delivery, Business Messaging, Impressão Empresarial, IAM, Audit, Data Protection, Customer Acceptance e Enterprise Onboarding.

Implemente o **AI Employee Enterprise Pilot Testing & Omnichannel Work Delivery System — EPTOWDS** como extensão oficial das camadas já existentes.

Não crie um segundo runtime, segundo approval engine, segundo delivery router ou segundo sistema de documentos. Reutilize os componentes canónicos existentes.

---

# 1. PRINCÍPIO CENTRAL

O primeiro teste real de um Employee numa empresa deve seguir:

```text
SELECT EMPLOYEE
↓
CREATE PILOT INSTANCE
↓
ASSIGN SUPERVISOR
↓
LOAD CONTROLLED ORGANIZATION CONTEXT
↓
CONNECT READ-ONLY DATA SOURCES
↓
SET LOW AUTONOMY
↓
SET HUMAN REVIEW
↓
RUN KNOWN TASK
↓
PREVIEW
↓
COMPARE
↓
REVISE
↓
APPROVE
↓
DELIVER
↓
MEASURE
↓
IMPROVE
```

---

# 2. NÃO TESTAR EM PRODUÇÃO TOTAL NO PRIMEIRO DIA

Nunca iniciar com:

```text
FULL WRITE ACCESS
FULL AUTONOMY
AUTO SEND
AUTO POST
AUTO SUBMIT
AUTO PAY
```

O default inicial deve ser:

```text
READ FIRST
PREPARE FIRST
HUMAN REVIEW FIRST
WRITE LATER
```

---

# 3. MODOS DE TESTE EMPRESARIAL

Distinguir:

```text
ENTERPRISE PILOT
SHADOW MODE
CONTROLLED ACTIVE
FULL PRODUCTION
```

`ENTERPRISE_PILOT` não equivale a produção autónoma.

---

# 4. PILOT INSTANCE

Criar uma instância dedicada:

```text
EMP-ORG-PILOT-{ROLE_ID}-{SEQ}
```

Campos mínimos:

```text
organization_id
tenant_id
role_id
supervisor_id
pilot_scope
allowed_inputs
allowed_tools
allowed_connections
allowed_outputs
autonomy_limit
supervision_level
approval_policy
```

---

# 5. PASSO 1 — ESCOLHER UM EMPLOYEE

A interface deve permitir:

```text
Select Employee
Select Role
Select Department
Select Pilot Objective
```

Não testar “tudo” de uma vez. Escolher uma função concreta.

Exemplo:

```text
#73 Management Reporting
Task:
Prepare management report for August
```

---

# 6. PASSO 2 — DEFINIR O OBJECTIVO DO PILOTO

Guardar:

```text
objective
expected_business_outcome
scope
out_of_scope
deadline
reviewer
```

Definir critérios de sucesso antes da execução.

Exemplo:

```text
no material numerical error
all mandatory sections present
correct sources used
correct escalation
correct document format
human acceptance required
```

---

# 7. PASSO 3 — DESIGNAR SUPERVISOR

Todo primeiro piloto deve ter:

```text
human_supervisor != null
```

Default recomendado:

```text
Autonomy     L1 or L2
Supervision  H3 or H4
```

conforme Role e risco.

---

# 8. PASSO 4 — PREPARAR DADOS

Suportar:

```text
MANUAL_UPLOAD
READ_ONLY_CONNECTION
APPROVED_SAMPLE_DATA
SANDBOX_DATA
```

Para o primeiro teste, preferir upload manual de cópias controladas:

```text
XLSX
CSV
PDF
DOCX
images
forms
```

---

# 9. PROGRESSIVE CONNECTION MODEL

Adoptar:

```text
Phase 1 → Manual Upload
Phase 2 → Read-only API/ERP
Phase 3 → Prepare Write Action
Phase 4 → Write With Approval
Phase 5 → Higher Autonomy if Certified
```

---

# 10. ORGANIZATION PACK MÍNIMO

Antes do piloto carregar:

```text
legal name
tax id/NIF
industry
currency
timezone
department
supervisor
core policies
templates
brand pack
approval matrix
```

Criar snapshot versionado do contexto utilizado no teste.

---

# 11. PASSO 5 — CONFIGURAR ACESSOS

Default:

```text
Excel          READ ✓
PDF            READ ✓
ERP            READ ✓
Bank           READ ✓
ERP WRITE      ✗
Payment        ✗
Delete         ✗
Submit         ✗
```

A regra é:

```text
READ FIRST
WRITE LATER
```

---

# 12. FORBIDDEN DEFAULT ACTIONS

No primeiro piloto bloquear por defeito:

```text
payments
bank transfers
tax submissions
binding legal commitments
employee terminations
irreversible ERP postings
external mass messaging
deletions
```

---

# 13. PASSO 6 — CONFIGURAR OUTPUTS

Antes da execução definir:

```text
allowed_output_formats
allowed_delivery_channels
delivery_approval_policy
```

Exemplo:

```text
OUTPUTS
Dashboard        ✓
DOCX             ✓
PDF              ✓
XLSX             ✓

DELIVERY
Preview          ✓
Download         ✓
Print            ✓
Email            approval required
WhatsApp         approval required
```

Produzir ≠ enviar.

---

# 14. PASSO 7 — ESCOLHER CASO DE RESULTADO CONHECIDO

Permitir associar:

```text
benchmark_artifact
ground_truth
human_reference
```

O Employee não deve receber a solução humana antes de produzir o resultado.

---

# 15. PASSO 8 — EXECUTAR EM TEST MODE

Fluxo:

```text
TASK CREATED
↓
EMPLOYEE RUN
↓
DRAFT
↓
TECHNICAL VALIDATION
↓
READY_FOR_REVIEW
↓
HUMAN REVIEW
↓
REVISION OR APPROVAL
↓
DELIVERY
```

---

# 16. PILOT TASK STATES

```text
CREATED
RUNNING
WAITING_DATA
WAITING_TOOL
WAITING_APPROVAL
DRAFT_READY
READY_FOR_REVIEW
REVISION_REQUIRED
APPROVED
READY_FOR_DELIVERY
DELIVERED
REJECTED
FAILED
CANCELLED
```

---

# 17. NO AUTO-DELIVERY DURING FIRST PILOT

Por defeito:

```text
auto_delivery = false
```

---

# 18. PASSO 9 — PRÉ-VISUALIZAR

Qualquer output material deve poder ser pré-visualizado antes da entrega.

Mostrar:

```text
title
task
version
content
sources
attachments
generated files
validation status
approval status
```

---

# 19. DOCUMENT PREVIEW

Suportar:

```text
PDF Preview
DOCX Preview
XLSX Preview
PPTX Preview
```

Para DOCX, manter download editável. Para XLSX, mostrar sheets/tables/formulas/charts relevantes sem executar macros. Para PPTX, mostrar slides.

---

# 20. PAPEL TIMBRADO

Integrar CLBGS.

Digital Letterhead Preview deve mostrar:

```text
logo
header
footer
legal identity
content
signature area
```

Preprinted Stationery Preview:

```text
digital body
+
virtual stationery overlay
```

---

# 21. PRINT COLLISION CHECK

Detectar:

```text
text overlaps logo
text overlaps footer
text overlaps signature
text outside safe area
```

Resultado:

```text
PASS
FAIL
WARNING
```

---

# 22. PASSO 10 — REVISÃO HUMANA

Supervisor/reviewer pode:

```text
ACCEPT
ACCEPT_WITH_MINOR_CHANGES
REQUEST_REVISION
REJECT
ESCALATE
```

---

# 23. CAQRS INTEGRATION

Classificar feedback:

```text
OBJECTIVE_ERROR
MATERIAL_ERROR
INCOMPLETE_WORK
INSTRUCTION_MISS
CLIENT_PREFERENCE
STYLE_PREFERENCE
FORMAT_PREFERENCE
TEMPLATE_MISMATCH
BRANDING_MISMATCH
NEW_REQUIREMENT
SCOPE_CHANGE
```

Não confundir preferência com erro técnico.

---

# 24. REVISION REQUEST

Criar `RevisionRequest` com:

```text
PRESERVE
CHANGE
ADD
REMOVE
```

Nunca sobrescrever silenciosamente:

```text
v1
v2
v3
```

---

# 25. VERSION DIFF

Mostrar:

```text
content changes
data changes
format changes
template changes
```

---

# 26. APPROVAL SNAPSHOT

Aprovar exactamente:

```text
content_hash
document_hash
template_version
brand_version
attachments
delivery_targets
```

Se mudar depois:

```text
APPROVAL_SNAPSHOT_MISMATCH
→ BLOCK DELIVERY
```

---

# 27. READY_FOR_DELIVERY

Só depois de:

```text
validation PASS
+
required approvals PASS
```

---

# 28. DELIVERY ROUTER

Reutilizar o Delivery Router canónico.

Canais:

```text
DOWNLOAD
PRINT
EMAIL
WHATSAPP / AUTHORIZED BUSINESS MESSAGING
DRIVE
SHAREPOINT
DMS
API
WEBHOOK
SFTP
OTHER EMPLOYEE
```

---

# 29. DELIVERY PERMISSION

Cada saída valida:

```text
channel permission
recipient permission
document permission
risk permission
```

---

# 30. DOWNLOAD

Permitir:

```text
PDF
DOCX
XLSX
PPTX
CSV
ZIP
```

conforme o output.

---

# 31. IMPRESSÃO

Suportar três modos:

```text
LOCAL_DOWNLOAD_PRINT
BROWSER_PRINT
MANAGED_ENTERPRISE_PRINT
```

---

# 32. LOCAL DOWNLOAD PRINT

```text
Download PDF/DOCX
↓
User prints locally
```

---

# 33. BROWSER PRINT

Criar versão print-friendly.

---

# 34. MANAGED ENTERPRISE PRINT

Fluxo:

```text
Platform
↓
Enterprise Data Gateway
↓
Authorized Printer
```

---

# 35. PRINTER PROFILE

Criar:

```text
printer_id
organization_id
location
paper_size
paper_tray
stationery_profile
color_mode
duplex
offsets
status
```

---

# 36. PRINT JOB

Criar `PrintJob`.

Estados:

```text
QUEUED
AUTHORIZED
PRINTING
PRINTED
FAILED
CANCELLED
```

---

# 37. PRINT RECEIPT

Guardar:

```text
printer
document version
pages
user
timestamp
status
```

---

# 38. EMAIL CONNECTOR

Criar/adaptar `EmailConnector` provider-neutral.

O cliente liga uma caixa autorizada.

---

# 39. EMAIL DRAFT MODE

Durante piloto:

```text
Employee drafts email
but does not send
```

---

# 40. EMAIL PREVIEW

Mostrar:

```text
From
To
CC
BCC
Subject
Body
Attachments
```

---

# 41. EMAIL SEND GATE

Só enviar depois de:

```text
approved snapshot
+
recipient validation
+
connector authorization
+
policy check
```

---

# 42. EMAIL DELIVERY RECEIPT

Guardar:

```text
message_id
sender
recipients
attachments
document versions
timestamp
provider result
```

---

# 43. EMAIL SECURITY

Validar:

```text
recipient domain
external recipient
sensitive attachment
malware
data classification
DLP policy
```

Conteúdo confidencial com falha de policy:

```text
BLOCK SEND
```

---

# 44. WHATSAPP / BUSINESS MESSAGING

Criar `BusinessMessagingConnector` provider-neutral.

Usar integração empresarial autorizada/provedor compatível. Não depender do WhatsApp pessoal de um trabalhador.

---

# 45. BUSINESS MESSAGING CONNECTION PROFILE

Guardar:

```text
organization_id
business_account_ref
sender_ref
provider
status
credential_ref
```

Nunca enviar raw credentials ao LLM.

---

# 46. WHATSAPP DRAFT

Employee prepara:

```text
message
attachment
recipient
```

mas não envia em piloto sem aprovação quando policy exigir.

---

# 47. WHATSAPP PREVIEW

Mostrar:

```text
recipient
message
attachment
document version
```

---

# 48. RECIPIENT VALIDATION

Validar contacto por:

```text
authorized contact
customer record
manual confirmation
```

---

# 49. WHATSAPP SEND GATE

```text
message approved
+
recipient approved
+
connector authorized
+
provider policy satisfied
```

---

# 50. MESSAGE TYPES

Quando o provider suportar:

```text
text
document
image
secure link
```

---

# 51. SENSITIVE DOCUMENT DELIVERY

Para conteúdo sensível preferir:

```text
notification
+
secure authenticated link
```

em vez de anexo directo.

---

# 52. SECURE LINK

Criar:

```text
signed temporary link
authentication requirement
expiry
access audit
```

---

# 53. BUSINESS MESSAGING RECEIPT

Guardar:

```text
provider_message_id
recipient
document_version
timestamp
delivery_status
```

---

# 54. PROVIDER POLICY ADAPTER

Regras específicas do fornecedor devem ficar no connector/policy adapter, não hardcoded no Role Pack.

---

# 55. DRIVE / SHAREPOINT / DMS

Guardar sempre a versão exacta aprovada.

---

# 56. ARCHIVE DESTINATION

Definir routes por:

```text
organization
department
document type
```

---

# 57. FILE NAMING POLICY

Exemplo:

```text
{DocumentType}_{Period}_{Organization}_{Version}.pdf
```

---

# 58. EMPLOYEE-TO-EMPLOYEE HANDOFF

Permitir:

```text
Employee A
↓
approved Work Product
↓
Employee B
```

Guardar:

```text
source_instance
target_instance
artifact
version
task_context
permission
```

---

# 59. DELIVERY INTENT

Toda saída externa cria `DeliveryIntent`.

Pipeline:

```text
User/Employee requests delivery
↓
Identity
↓
Tenant
↓
Permission
↓
Policy
↓
Risk
↓
Approval
↓
Snapshot verification
↓
Connector
↓
Receipt
```

---

# 60. DELIVERY RECEIPT

Criar `DeliveryReceipt` com:

```text
delivery_id
task_id
work_product_id
document_id
version
channel
destination
initiated_by
approved_by
timestamp
provider_reference
status
```

---

# 61. DELIVERY STATES

```text
PENDING
AUTHORIZED
SENDING
DELIVERED
FAILED
BOUNCED
REJECTED
CANCELLED
```

---

# 62. RETRY

Retry deve ser:

```text
idempotent
bounded
observable
```

Nunca duplicar envio.

---

# 63. DELIVERY FAILURE ≠ WORK FAILURE

Separar:

```text
Work Quality
vs
Delivery Success
```

---

# 64. DELIVERY ERROR TAXONOMY

```text
RECIPIENT_INVALID
CONNECTOR_DOWN
AUTH_EXPIRED
POLICY_BLOCK
APPROVAL_MISSING
ATTACHMENT_TOO_LARGE
PROVIDER_REJECTED
TIMEOUT
DUPLICATE_BLOCKED
```

---

# 65. DOCUMENT CLASSIFICATION BEFORE DELIVERY

Quando aplicável classificar:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
```

---

# 66. DLP POLICY

Aplicar prevenção de fuga de dados.

Exemplo:

```text
CONFIDENTIAL
→ external email requires approval
→ messaging prefers secure link
```

---

# 67. AUTHORIZED CONTACT DIRECTORY

Criar contactos autorizados:

```text
contact_id
organization
name
email
phone
relationship
approved_channels
status
```

---

# 68. AD-HOC RECIPIENT

Pode exigir confirmação adicional.

---

# 69. ACTION BAR DO WORK PRODUCT

Depois de um trabalho:

```text
[ Pré-visualizar ]
[ Pedir revisão ]
[ Aprovar ]
[ Baixar ]
[ Imprimir ]
[ Enviar por Email ]
[ Enviar por WhatsApp ]
[ Guardar ]
[ Entregar a outro Employee ]
```

---

# 70. DYNAMIC BUTTON VISIBILITY

Botões dependem de:

```text
user permission
channel availability
document status
approval state
risk
policy
```

Backend deve revalidar; esconder botão não é controlo de segurança.

---

# 71. PASSO 11 — TESTAR EXCEPÇÕES

Depois do caso normal, testar:

```text
incomplete Excel
conflicting information
missing date
wrong NIF
duplicate statement
empty file
wrong period
out-of-scope request
connection outage
```

O Employee deve poder responder com:

```text
ASK
ESCALATE
WAITING_DATA
INSUFFICIENT_EVIDENCE
OUT_OF_SCOPE
SAFE_BLOCK
```

---

# 72. PASSO 12 — EREMS

Medir:

```text
Task Success Rate
Material Error Rate
Critical Error Rate
UMER
Correct Escalation Rate
Human Correction Rate
```

---

# 73. PASSO 13 — CAQRS

Medir:

```text
First-Pass Acceptance Rate
Revision Rate
Preference Match
Instruction Adherence
```

---

# 74. PASSO 14 — REMEDIATION

Fluxo:

```text
Issue
↓
Root Cause
↓
Fix
↓
Regression Case
↓
Retest
↓
Pilot Resume
```

---

# 75. PASSO 15 — SHADOW MODE

Usar trabalho real, mas:

```text
Employee prepares
↓
Human reviews
↓
Only then deliver
```

---

# 76. PASSO 16 — MEDIR VALOR EMPRESARIAL

Quando aplicável:

```text
cycle time
tasks completed
manual steps reduced
human review time
documents produced
cost per task
```

Não inventar “horas poupadas” sem metodologia.

---

# 77. PASSO 17 — DECISÃO DO PILOTO

```text
PASS
PASS_WITH_RESTRICTIONS
REMEDIATION_REQUIRED
RETEST_REQUIRED
FAIL
```

---

# 78. PASSO 18 — EXPANDIR AUTONOMIA PROGRESSIVAMENTE

```text
L1
↓
L2
↓
L3
↓
L4 only if certified/authorized
```

---

# 79. WRITE ACCESS EXPANSION

```text
READ
↓
PREPARE_WRITE
↓
WRITE_WITH_APPROVAL
↓
LIMITED_WRITE_AUTONOMY
```

---

# 80. DELIVERY AUTONOMY EXPANSION

```text
PREVIEW_ONLY
↓
SEND_WITH_APPROVAL
↓
SEND_WITH_POLICY
```

---

# 81. HIGH-RISK CONTROL

R4/R5 não ganham envio/execução autónoma apenas porque o cliente comprou plano superior.

---

# 82. PILOT CENTER UI

Criar:

```text
Overview
Select Employee
Pilot Setup
Data Sources
Permissions
Connections
Tasks
Preview
Review
Metrics
Decision
```

---

# 83. PILOT SETUP WIZARD

```text
1 Select Employee
2 Define Pilot Objective
3 Assign Supervisor
4 Select Data
5 Connect Systems
6 Set Permissions
7 Set Autonomy
8 Set Output Formats
9 Set Delivery Channels
10 Define Success Criteria
11 Run Test
```

---

# 84. PILOT LIVE VIEW

Mostrar:

```text
Loading data
Analyzing
Waiting for tool
Waiting for data
Drafting
Validating
Ready for review
```

---

# 85. DECISION TRACE

Mostrar explicação operacional:

```text
sources used
policies applied
approvals required
actions attempted
```

Não expor chain-of-thought privado.

---

# 86. SOURCE TRACEABILITY

Mostrar fontes utilizadas.

---

# 87. RESULT COMPARISON

Quando benchmark existir:

```text
AI output
vs
reference output
```

Destacar divergências materiais.

---

# 88. PILOT PERFORMANCE DASHBOARD

Mostrar:

```text
Tasks Run
Drafts
Approved
Revisions
Errors
Deliveries
Delivery Failures
Print Jobs
Emails
Messages
```

---

# 89. PILOT PERFORMANCE METRICS

```text
Task Success Rate
Material Error Rate
UMER
Correct Escalation Rate
Human Correction Rate
First-Pass Acceptance Rate
Revision Rate
Average Review Time
Average Delivery Time
Cost per Task
```

---

# 90. DATABASE ENTITIES

Criar/reutilizar:

```text
enterprise_pilots
pilot_instances
pilot_objectives
pilot_success_criteria
pilot_tasks
pilot_benchmark_refs
work_products
work_product_versions
revision_requests
approval_snapshots
delivery_intents
delivery_receipts
print_jobs
email_delivery_records
business_message_delivery_records
secure_links
authorized_contacts
pilot_metrics
pilot_decisions
```

---

# 91. SCHEMAS

Criar:

```text
enterprise-pilot.schema.json
pilot-task.schema.json
pilot-success-criteria.schema.json
work-product-version.schema.json
delivery-intent.schema.json
delivery-receipt.schema.json
print-job.schema.json
email-delivery.schema.json
business-message-delivery.schema.json
secure-link.schema.json
```

---

# 92. APIs — PILOT

```text
POST /organizations/{orgId}/pilots
GET  /pilots/{id}
POST /pilots/{id}/start
POST /pilots/{id}/complete
POST /pilots/{id}/decision
```

---

# 93. APIs — WORK PRODUCT

```text
GET  /work-products/{id}
GET  /work-products/{id}/preview
GET  /work-products/{id}/versions
POST /work-products/{id}/revision
POST /work-products/{id}/approve
```

---

# 94. APIs — DOWNLOAD

```text
GET /work-products/{id}/download?format=pdf
GET /work-products/{id}/download?format=docx
GET /work-products/{id}/download?format=xlsx
```

---

# 95. APIs — PRINT

```text
POST /work-products/{id}/print-preview
POST /work-products/{id}/print
GET  /print-jobs/{id}
```

---

# 96. APIs — EMAIL

```text
POST /work-products/{id}/email-preview
POST /work-products/{id}/email
GET  /email-deliveries/{id}
```

---

# 97. APIs — BUSINESS MESSAGING

```text
POST /work-products/{id}/message-preview
POST /work-products/{id}/message
GET  /message-deliveries/{id}
```

---

# 98. APIs — ARCHIVE / HANDOFF

```text
POST /work-products/{id}/archive
POST /work-products/{id}/handoff
```

---

# 99. CONNECTOR ABSTRACTION

Criar interfaces:

```text
EmailDeliveryAdapter
BusinessMessagingAdapter
PrintAdapter
StorageDeliveryAdapter
```

---

# 100. CONNECTOR READINESS STATES

```text
NOT_CONFIGURED
AUTHENTICATED
TESTED
ACTIVE
DEGRADED
REVOKED
```

Botão de envio só deve ficar operacional se o connector estiver efectivamente configurado e testado.

---

# 101. PROVIDER CAPABILITY DISCOVERY

Adapter informa:

```text
supports_text
supports_document
supports_image
supports_delivery_receipt
supports_template_message
```

---

# 102. SECURITY TESTS

Testar:

```text
send to unauthorized recipient
cross-tenant attachment
tampered approved document
expired approval
duplicate send
secret leakage
email spoofing
message recipient swap
print to unauthorized printer
secure link replay
```

---

# 103. HARD NO-GO

Bloquear:

```text
cross-tenant delivery
unauthorized recipient
approval snapshot mismatch
revoked connector
unauthorized signature
restricted document sent without controls
```

---

# 104. TESTS — PREVIEW

1. Preview reflecte versão actual exacta.
2. Versão antiga não substitui silenciosamente versão aprovada.
3. PDF preview corresponde ao PDF final.
4. Preprinted overlay detecta colisões.
5. Sensitivity classification é mostrada.

---

# 105. TESTS — PRINT

1. Print preview funciona.
2. Printer authorization funciona.
3. Wrong stationery é bloqueado.
4. Duplicate print job policy funciona.
5. Print receipt é registado.

---

# 106. TESTS — EMAIL

1. Draft-only pilot funciona.
2. Sender authorization funciona.
3. Recipient validation funciona.
4. Attachment version fica bloqueada.
5. Approval é exigida conforme policy.
6. Duplicate send é impedido.
7. Provider failure não é marcado como delivered.

---

# 107. TESTS — WHATSAPP/BUSINESS MESSAGING

1. Authorized business connection required.
2. Recipient validation funciona.
3. Preview funciona.
4. Approval funciona.
5. Attachment/secure-link routing funciona.
6. Duplicate send é bloqueado.
7. Provider failure é registado correctamente.

---

# 108. TESTS — PILOT

1. Pilot instance isolada.
2. Default read-only funciona.
3. Default low autonomy funciona.
4. Auto-delivery desactivada inicialmente.
5. Known-result comparison funciona.
6. Exception handling é capturado.
7. CAQRS feedback é capturado.
8. EREMS error é capturado.
9. Remediation/retest funciona.
10. Pilot decision é emitida.

---

# 109. GENERATED FILES

Gerar:

```text
generated/enterprise_pilot_profiles_500.json
generated/pilot_default_permissions_500.json
generated/pilot_output_profiles_500.json
generated/pilot_delivery_policies_500.json
generated/pilot_success_criteria_500.json

schemas/enterprise-pilot.schema.json
schemas/pilot-task.schema.json
schemas/delivery-intent.schema.json
schemas/delivery-receipt.schema.json
schemas/print-job.schema.json
schemas/email-delivery.schema.json
schemas/business-message-delivery.schema.json

packages/enterprise-pilot/
packages/work-product-preview/
packages/review-and-approval/
packages/print-delivery/
packages/email-delivery/
packages/business-messaging-delivery/
packages/secure-delivery-link/
packages/delivery-receipts/

docs/ENTERPRISE_PILOT_GUIDE.md
docs/WORK_PRODUCT_PREVIEW.md
docs/PRINT_DELIVERY.md
docs/EMAIL_DELIVERY.md
docs/BUSINESS_MESSAGING_DELIVERY.md
docs/SECURE_LINK_DELIVERY.md
docs/PILOT_TO_PRODUCTION.md
```

---

# 110. 500/500 PILOT PROFILE COVERAGE

Todos os 500 Employees devem ter:

```text
pilot_allowed
default_pilot_autonomy
default_supervision
required_test_inputs
allowed_output_formats
allowed_delivery_channels
delivery_approval_policy
pilot_success_criteria
```

---

# 111. HIGH-RISK ROLE PILOT

R4/R5:

```text
shadow only
mandatory approval
no autonomous material delivery
```

---

# 112. PILOT COMPLETION GATE

Só marcar `PASS` se:

```text
functional result acceptable
no unresolved material error
security pass
correct escalation
correct delivery controls
review completed
```

---

# 113. DELIVERY READINESS GATE

```text
PREVIEW                     PASS
VERSION LOCK                PASS
APPROVAL                    PASS
RECIPIENT                   PASS
CHANNEL CONNECTOR           PASS
POLICY                      PASS
AUDIT                       PASS
```

---

# 114. BUILD GATE

```text
ENTERPRISE PILOT ENGINE         PASS
PILOT INSTANCE ISOLATION        PASS
PREVIEW ENGINE                  PASS
REVISION ENGINE                 PASS
APPROVAL SNAPSHOT               PASS
DOWNLOAD                        PASS
PRINT                           PASS
EMAIL                           PASS
BUSINESS MESSAGING              PASS
SECURE LINK                     PASS
DELIVERY RECEIPT                PASS
EREMS BRIDGE                    PASS
CAQRS BRIDGE                    PASS
AUDIT                           PASS
TENANT ISOLATION                PASS
SECURITY                        PASS
```

---

# 115. DEFINITION OF DONE — PILOT

```text
✓ one Employee can be selected
✓ pilot instance created
✓ supervisor assigned
✓ controlled data loaded
✓ connections read-only by default
✓ permissions applied
✓ autonomy limited
✓ task executed
✓ result previewed
✓ feedback/revision supported
✓ approval captured
✓ delivery controlled
✓ metrics captured
✓ pilot decision issued
```

---

# 116. DEFINITION OF DONE — OMNICHANNEL DELIVERY

```text
✓ preview
✓ download
✓ print
✓ email
✓ WhatsApp/business messaging
✓ Drive/SharePoint/DMS
✓ secure link
✓ employee-to-employee handoff
✓ delivery receipt
✓ audit
```

---

# 117. PRINCÍPIO DE VERDADE

Nunca confundir:

```text
WORK COMPLETED
!=
WORK APPROVED

WORK APPROVED
!=
WORK DELIVERED

DELIVERY REQUESTED
!=
DELIVERY SUCCESSFUL
```

---

# 118. PRINCÍPIO DE SEGURANÇA

Nenhum Employee deve poder enviar um documento externamente apenas porque conseguiu produzi-lo.

---

# 119. PRINCÍPIO DE QUALIDADE

O cliente deve poder:

```text
preview
review
revise
approve
```

antes da entrega.

---

# 120. PRINCÍPIO DE EXPERIÊNCIA

A experiência deve ser simples:

```text
EMPLOYEE TRABALHA
↓
VER
↓
CORRIGIR
↓
APROVAR
↓
IMPRIMIR / EMAIL / WHATSAPP / GUARDAR
```

---

# 121. PROCESSO OPERACIONAL COMPLETO DO PRIMEIRO TESTE

```text
1. Escolher Employee
2. Criar Pilot Instance
3. Definir tarefa concreta
4. Designar supervisor
5. Carregar Organization Pack mínimo
6. Carregar dados de teste controlados
7. Ligar sistemas em read-only
8. Definir permissões
9. Definir autonomia baixa
10. Definir output e delivery policies
11. Associar benchmark/ground truth
12. Executar em Test Mode
13. Pré-visualizar resultado
14. Comparar com referência
15. Classificar erros/preferências
16. Pedir revisão se necessário
17. Aprovar snapshot exacto
18. Imprimir / Email / WhatsApp / Download / Arquivar
19. Registar Delivery Receipt
20. Medir EREMS + CAQRS
21. Corrigir gaps
22. Retestar
23. Executar Shadow Mode
24. Decidir PASS/RESTRICTIONS/REMEDIATION/FAIL
25. Aumentar autonomia apenas se houver evidência
```

---

# 122. PRINCÍPIO FINAL

O sistema deve permitir que um empresário teste um AI Employee real dentro da sua própria empresa e consiga verificar todo o trabalho antes de este sair da plataforma.

O resultado produzido por qualquer um dos 500 AI Employees deve poder seguir:

```text
WORK PRODUCT
↓
VALIDATE
↓
PREVIEW
↓
REVIEW
↓
REVISE
↓
APPROVE
↓
DOWNLOAD / PRINT / EMAIL / WHATSAPP / ARCHIVE / HANDOFF
↓
DELIVERY RECEIPT
↓
AUDIT
```

O objectivo final é garantir que **o Employee trabalha, o humano controla, a plataforma comprova e só depois o trabalho é entregue pelo canal autorizado**.
