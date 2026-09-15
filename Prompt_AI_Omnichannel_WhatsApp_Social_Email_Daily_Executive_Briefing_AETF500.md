# PROMPT MESTRE DE IMPLEMENTAÇÃO
## AI Omnichannel Communications, Social Media Operations, WhatsApp Command, Email Intelligence & Daily Executive Briefing Engine
### AETF-500 — Operação Real de WhatsApp, Redes Sociais, Emails, Ficheiros, Leads, Aprovações, Relatórios e Supervisão Executiva

---

# 0. OBJECTIVO

Implementar na plataforma AETF-500 um motor omnicanal que permita aos 500 AI Employees:

- receber comandos por WhatsApp;
- receber e tratar emails;
- actuar em redes sociais autorizadas;
- receber e processar ficheiros e anexos;
- responder mensagens dentro das permissões da empresa;
- criar tarefas a partir de mensagens, comentários, emails e eventos;
- gerar respostas, documentos e outros outputs;
- escalar reclamações, riscos e assuntos sensíveis;
- colaborar entre si;
- criar leads e oportunidades;
- produzir relatórios diários;
- gerar um briefing executivo todas as manhãs;
- apresentar um resumo consolidado de WhatsApp, emails, redes sociais, tarefas, ficheiros, aprovações, erros, pendências e resultados;
- funcionar mesmo quando o computador local estiver desligado, sempre que a execução puder ocorrer em cloud;
- colocar tarefas em fila quando dependerem de recursos locais indisponíveis;
- preservar isolamento por empresa e tenant;
- registar evidência completa de cada evento e execução.

O módulo deve ser transversal a todos os 500 AI Employees.

---

# 1. PRINCÍPIO CENTRAL

Os canais de comunicação não são o local onde o AI Employee “vive”.

WhatsApp, email e redes sociais são:

```text
INPUT / OUTPUT CHANNELS
```

O Employee vive no runtime operacional da plataforma.

Arquitectura:

```text
WHATSAPP
EMAIL
SOCIAL MEDIA
        ↓
OMNICHANNEL GATEWAY
        ↓
IDENTITY / COMPANY / TENANT RESOLUTION
        ↓
MESSAGE / EVENT NORMALIZATION
        ↓
COMMAND / INTENT / TASK ROUTER
        ↓
AI EMPLOYEE INSTANCE
        ↓
ROLE PACK
        ↓
TASK CATALOG
        ↓
SOP
        ↓
KNOWLEDGE
        ↓
TOOLS
        ↓
OPENAI / GEMINI / CLAUDE
        ↓
APPROVAL / ESCALATION
        ↓
OUTPUT
        ↓
CHANNEL RESPONSE
        ↓
AUDIT / EVIDENCE
```

---

# 2. MÓDULO PRINCIPAL

Criar ou consolidar:

```text
AI_OMNICHANNEL_COMMUNICATIONS_ENGINE
```

Submódulos:

```text
WhatsApp Business Connector
Email Connector Hub
Social Media Connector Hub
Message Normalizer
Identity Resolver
Intent & Command Router
Attachment & Media Handler
Task Creation Engine
Outbound Response Dispatcher
Approval Center
Lead Capture Engine
Complaint & Escalation Engine
Social Listening
Email Intelligence Engine
Daily Operations Digest
Executive Briefing Engine
Audit & Evidence Store
```

---

# 3. REUTILIZAÇÃO OBRIGATÓRIA

Antes de criar código novo, auditar o projecto e localizar:

```text
Task Engine
Employee Runtime
Remote Command
Offline Queue
Deferred Execution
Document Generator
Knowledge Resolver
Company/Tenant Registry
Permissions
Approvals
Audit
Connectors
Billing
Notifications
Scheduler
```

Não duplicar módulos existentes.

Gerar primeiro:

```text
OMNICHANNEL_EXISTING_COMPONENT_AUDIT
```

com:

```text
component
path
status
reusable
missing
action
```

---

# 4. CANAIS SUPORTADOS

Arquitectura preparada para:

```text
WHATSAPP
EMAIL
FACEBOOK
INSTAGRAM
LINKEDIN
TIKTOK
X
YOUTUBE
```

e futura expansão.

Não assumir que todas as plataformas suportam as mesmas APIs ou permissões.

Criar abstração por capacidades.

---

# 5. CHANNEL CAPABILITY REGISTRY

Criar:

```text
CHANNEL_CAPABILITY_REGISTRY
```

Campos:

```text
channel
account_id
company_id
tenant_id

can_read_messages
can_send_messages
can_read_comments
can_reply_comments
can_publish
can_schedule
can_read_analytics
can_manage_ads
can_receive_webhooks

status
permissions
last_verified_at
```

---

# 6. COMPANY-OWNED CONNECTION MODEL

Os canais pertencem à empresa:

```text
COMPANY
↓
CHANNEL CONNECTION
↓
EMPLOYEE PERMISSION
```

Nunca:

```text
GLOBAL EMPLOYEE
→ owns credential
```

---

# 7. SECRETS

Credenciais devem ficar num:

```text
SECRETS VAULT
```

Nunca enviar ao modelo:

```text
password
api_secret
refresh_token
access_token
private_key
```

O modelo pede acção.

O backend executa.

---

# 8. WHATSAPP BUSINESS CONNECTOR

Criar:

```text
WhatsAppBusinessConnector
```

Responsabilidades:

```text
receive inbound messages
receive attachments
receive delivery events
send outbound messages
send approved documents
resolve message thread
persist message IDs
verify webhook authenticity
```

---

# 9. WHATSAPP INBOUND

Cada mensagem deve gerar registo:

```text
whatsapp_message_id
sender_phone
received_at
message_type
text
attachments
reply_to
company_id
tenant_id
resolved_user_id
```

---

# 10. WHATSAPP IDENTITY BINDING

Implementar:

```text
PHONE
↓
USER
↓
COMPANY
↓
TENANT
↓
PERMISSIONS
```

Exemplo:

```text
+244...
↓
Victorino
↓
MARVINE, LDA
↓
TNT-962837
↓
AUTHORIZED
```

Número não autorizado:

```text
UNAUTHORIZED_SENDER
```

Não executar tarefa.

---

# 11. WHATSAPP COMMAND ROUTER

Exemplos aceites:

```text
"Contabilista, reconcilie o extracto do BAI."
"RH, prepare a folha de salários."
"Fiscalista, analise esta notificação."
"Marketing, publique esta campanha."
```

Resolver:

```text
employee_alias
role
employee_instance_id
task_type
```

---

# 12. EMPLOYEE ALIASES

Permitir aliases:

```text
"Contabilista"
→ AEI-000042

"RH"
→ AEI-000151

"Marketing"
→ AEI-000310
```

Opcionalmente permitir nomes personalizados:

```text
"João"
→ AEI-000042
```

---

# 13. AMBIGUIDADE

Se mais de um Employee for elegível:

```text
AMBIGUOUS_EMPLOYEE_SELECTION
```

Responder:

```text
"Encontrei dois Employees compatíveis. Qual pretende utilizar?"
```

---

# 14. WHATSAPP ATTACHMENTS

Suportar:

```text
PDF
DOCX
XLSX
CSV
JPG
PNG
ZIP
AUDIO
VIDEO
```

sujeito às capacidades do canal e políticas.

---

# 15. VOICE NOTES

Fluxo:

```text
VOICE NOTE
↓
TRANSCRIPTION
↓
COMMAND UNDERSTANDING
↓
TASK
```

Guardar:

```text
original_audio
transcription
confidence
task_id
```

---

# 16. OFFLINE / DEFERRED EXECUTION

Se tarefa puder executar em cloud:

```text
EXECUTE_NOW
```

Se depender de recurso local offline:

```text
WAITING_LOCAL_CONNECTOR
```

Exemplo:

```text
Primavera local offline
```

Fluxo:

```text
WhatsApp Command
↓
Task Created
↓
Offline Queue
↓
Local Agent Connects
↓
Task Resumes
```

---

# 17. WHATSAPP OUTBOUND

O sistema pode enviar:

```text
task acknowledgements
results
alerts
approval requests
file links
documents
error notices
daily briefings
```

---

# 18. WHATSAPP AUDIT

Guardar:

```text
message_id
sender
recipient
company_id
tenant_id
employee_instance_id
task_id
execution_id
reply_message_id
delivery_status
read_status
timestamp
```

---

# 19. EMAIL CONNECTOR HUB

Criar:

```text
EmailConnectorHub
```

Arquitectura preparada para provedores autorizados.

Capacidades:

```text
read inbound email
read thread
read attachments
draft reply
send reply
forward
label/classify
archive
create task
request approval
track outbound
```

---

# 20. EMAIL ACCOUNT MODEL

Email pertence à empresa:

```text
COMPANY
↓
MAILBOX
↓
EMPLOYEE PERMISSION
```

Exemplo:

```text
financeiro@empresa.com
fiscal@empresa.com
rh@empresa.com
geral@empresa.com
```

---

# 21. EMAIL NORMALIZATION

Cada email deve ser convertido para:

```text
email_id
thread_id
mailbox_id
sender
recipients
cc
bcc
subject
body_text
body_html
attachments
received_at
importance
labels
company_id
tenant_id
```

---

# 22. EMAIL INTENT CLASSIFICATION

Classificar:

```text
INVOICE
CUSTOMER_REQUEST
SUPPLIER_REQUEST
BANKING
TAX
HR
LEGAL
SALES_LEAD
COMPLAINT
INTERNAL
SPAM
PHISHING_SUSPECTED
OTHER
```

---

# 23. EMAIL ROUTING

Exemplo:

```text
Invoice email
→ Accounting Employee

Tax notice
→ Tax Employee

CV
→ HR Employee

Lead
→ Sales Employee

Complaint
→ Customer Support Employee
```

---

# 24. EMAIL TASK CREATION

Se email exigir trabalho:

```text
EMAIL
↓
TASK
↓
EMPLOYEE
```

Guardar ligação bidireccional:

```text
email_id
task_id
execution_id
```

---

# 25. EMAIL ATTACHMENTS

Anexos devem passar por:

```text
security validation
file classification
tenant binding
document intake
```

Depois podem alimentar:

```text
classification
accounting
tax analysis
HR
contracts
reports
```

---

# 26. EMAIL DRAFTS

Por defeito, para mensagens externas sensíveis:

```text
DRAFT
↓
APPROVAL
↓
SEND
```

---

# 27. EMAIL AUTO-SEND

Só quando:

```text
policy allows
risk low
recipient trusted
content within approved template
employee authorized
```

---

# 28. EMAIL HIGH-RISK

Exemplos:

```text
legal admission
tax position
payment instruction
bank details change
termination
contract commitment
public statement
```

Exigir:

```text
HITL
```

---

# 29. EMAIL SECURITY

Detectar e marcar:

```text
suspicious links
spoofed sender
unexpected attachments
bank account change request
credential request
phishing patterns
```

Resultado:

```text
PHISHING_SUSPECTED
```

Não executar automaticamente acções de risco.

---

# 30. EMAIL DAILY REPORT

Criar relatório diário sobre emails.

Incluir:

```text
emails received
emails sent
emails awaiting reply
emails converted to tasks
emails with attachments
emails flagged high priority
emails flagged suspicious
emails awaiting approval
unanswered emails
failed sends
```

---

# 31. EMAIL EXECUTIVE SUMMARY

Exemplo:

```text
EMAILS — ÚLTIMAS 24H

Recebidos: 84
Enviados: 39
Convertidos em tarefas: 27
Aguardam resposta: 12
Aguardam aprovação: 4
Com anexos: 31
Suspeitos: 2
Falhas de envio: 1
```

---

# 32. EMAIL ATTENTION LIST

Gerar:

```text
NEEDS YOUR ATTENTION
```

Exemplo:

```text
1. Banco solicita confirmação de dados.
2. AGT enviou notificação.
3. Cliente reclama factura em falta.
4. Fornecedor alterou IBAN.
5. Email suspeito detectado.
```

---

# 33. EMAIL FILE REPORT

Mostrar ficheiros relevantes recebidos e gerados.

Exemplo:

```text
RECEIVED:
- Extracto_BAI_Agosto.pdf
- Notificacao_AGT.pdf
- Folha_Salarial.xlsx

GENERATED:
- Resposta_AGT.docx
- Reconciliacao_BAI.xlsx
- Relatorio_Financeiro.pdf
```

---

# 34. SOCIAL MEDIA CONNECTOR HUB

Criar:

```text
SocialMediaConnectorHub
```

---

# 35. SOCIAL ACCOUNT CONNECTIONS

Cada empresa pode ligar:

```text
Facebook
Instagram
LinkedIn
TikTok
X
YouTube
```

por conectores oficiais/autorizados.

---

# 36. SOCIAL PERMISSIONS

Por Employee:

```text
READ
WRITE
PUBLISH
COMMENT
DM
ANALYTICS
ADS_DRAFT
ADS_EXECUTE
```

---

# 37. AI SOCIAL MEDIA MANAGER

Funções:

```text
content calendar
post creation
scheduling
publishing
campaign coordination
performance analysis
```

---

# 38. AI COPYWRITER

Funções:

```text
captions
titles
post copy
CTA
email/social variants
```

---

# 39. AI COMMUNITY MANAGER

Funções:

```text
comments
direct messages
customer questions
complaints
community moderation
```

---

# 40. AI MARKETING ANALYST

Funções:

```text
reach
engagement
leads
conversions
campaign performance
recommendations
```

---

# 41. SOCIAL CONTENT FLOW

```text
TASK
↓
Brand Profile
↓
Marketing SOP
↓
Model
↓
Draft
↓
Approval
↓
Publish
↓
Analytics
```

---

# 42. BRAND PROFILE

Cada empresa deve possuir:

```text
BRAND_PROFILE
```

Campos:

```text
brand_name
tone
logo
colors
products
services
approved_prices
target_audience
preferred_terms
prohibited_terms
approved_claims
templates
visual_guidelines
```

---

# 43. CONTENT APPROVAL LEVELS

Suportar:

```text
A1 = suggestion only
A2 = draft only
A3 = schedule with approval
A4 = auto-publish approved content types
A5 = autonomous within policy
```

---

# 44. SOCIAL COMMENTS

Evento:

```text
NEW_COMMENT
```

Fluxo:

```text
comment
↓
intent
↓
risk
↓
employee
↓
response
```

---

# 45. SOCIAL DIRECT MESSAGES

Mensagem:

```text
"Quero contratar."
```

Classificar:

```text
SALES_LEAD
```

Criar:

```text
LEAD
```

e encaminhar para Sales Employee.

---

# 46. COMPLAINTS

Se reclamação:

```text
COMPLAINT_DETECTED
```

Fluxo:

```text
Customer Support SOP
↓
CRM lookup
↓
safe response
↓
task/escalation
```

---

# 47. SOCIAL CRISIS DETECTION

Detectar:

```text
legal accusation
fraud allegation
viral negative content
political controversy
accident
health issue
public safety
serious complaint
```

Resultado:

```text
SOCIAL_CRISIS_DETECTED
```

Acção:

```text
AUTO_REPLY_DISABLED
HUMAN_ESCALATION
```

---

# 48. PAID ADS

Employees podem:

```text
draft campaign
prepare copy
prepare creative
suggest audience
suggest budget
analyse results
```

Execução de gasto deve obedecer a thresholds.

Exemplo:

```text
<= 10,000 AOA
policy-defined

10,001–100,000 AOA
manager approval

> 100,000 AOA
senior approval
```

Valores devem ser configuráveis por empresa.

---

# 49. SOCIAL LISTENING

Capturar quando disponível:

```text
mentions
comments
messages
engagement spikes
negative sentiment signals
lead signals
```

Não fazer inferências sensíveis indevidas sobre pessoas.

---

# 50. LEAD CAPTURE ENGINE

Criar:

```text
LeadCaptureEngine
```

Fontes:

```text
WhatsApp
Email
Instagram
Facebook
LinkedIn
TikTok
Website
```

---

# 51. LEAD RECORD

Campos:

```text
lead_id
source_channel
source_event_id
company_id
tenant_id
name
contact
interest
status
assigned_employee
created_at
```

---

# 52. CROSS-CHANNEL THREADING

Quando tecnicamente possível, ligar:

```text
email
whatsapp
social DM
task
customer
```

sem misturar tenants.

---

# 53. OMNICHANNEL EVENT STORE

Criar:

```text
OMNICHANNEL_EVENT_STORE
```

Cada evento:

```text
event_id
channel
event_type
company_id
tenant_id
user/customer
employee_instance_id
task_id
execution_id
timestamp
status
risk
```

---

# 54. ATTACHMENT REGISTRY

Criar:

```text
ATTACHMENT_REGISTRY
```

Campos:

```text
file_id
source_channel
source_event_id
company_id
tenant_id
filename
mime_type
size
hash
storage_location
classification
task_id
```

---

# 55. GENERATED FILE REGISTRY

Criar:

```text
GENERATED_FILE_REGISTRY
```

Campos:

```text
output_id
filename
format
task_id
execution_id
employee_instance_id
company_id
tenant_id
created_at
storage_location
delivery_channels
```

---

# 56. DAILY EXECUTIVE BRIEFING

Criar:

```text
DAILY_EXECUTIVE_BRIEFING_ENGINE
```

Objectivo:

Todos os dias, gerar resumo consolidado de:

```text
WhatsApp
Email
Social Media
Tasks
Employees
Files
Approvals
Errors
Risks
Costs
Leads
Complaints
```

---

# 57. AI OPERATIONS SUPERVISOR

Criar Role Pack específico:

```text
AI_OPERATIONS_SUPERVISOR
```

Missão:

```text
Monitorizar o fluxo operacional dos AI Employees e produzir briefing executivo diário.
```

---

# 58. DAILY BRIEF CONTENT

Estrutura recomendada:

```text
1. Executive Summary
2. WhatsApp
3. Emails
4. Social Media
5. Tasks
6. Files Received
7. Files Generated
8. Approvals
9. Leads
10. Complaints
11. Errors
12. Risks
13. API / Connector Health
14. AI Cost
15. Needs Your Attention
```

---

# 59. WHATSAPP DAILY REPORT

Exemplo:

```text
WHATSAPP

Messages received: 38
Commands detected: 24
Tasks created: 19
Completed: 15
In progress: 2
Waiting approval: 2
Attachments received: 7
```

---

# 60. EMAIL DAILY REPORT

Exemplo:

```text
EMAIL

Received: 84
Sent: 39
Tasks created: 27
Awaiting reply: 12
Awaiting approval: 4
Attachments received: 31
Suspicious: 2
Failed sends: 1
```

---

# 61. SOCIAL DAILY REPORT

Exemplo:

```text
SOCIAL MEDIA

Posts published: 4
Posts awaiting approval: 3
Comments: 64
DMs: 37
Leads: 8
Complaints: 2
Critical incidents: 0
```

---

# 62. TASK DAILY REPORT

Mostrar:

```text
tasks_created
tasks_completed
tasks_failed
tasks_waiting_input
tasks_waiting_approval
tasks_blocked
tasks_in_progress
```

---

# 63. EMPLOYEE ACTIVITY REPORT

Exemplo:

```text
Contabilista Sénior
6 tasks
5 completed
1 pending

Assistente Administrativo
8 tasks
8 completed

Técnico Fiscal
3 tasks
2 completed
1 waiting source
```

---

# 64. FILES RECEIVED

Listar:

```text
filename
source
sender
task
employee
status
```

---

# 65. FILES GENERATED

Listar:

```text
filename
task
employee
format
delivery
```

---

# 66. NEEDS YOUR ATTENTION

Esta secção deve ser prioritária.

Exemplo:

```text
1. Aprovar resposta à AGT.
2. Rever diferença bancária de 850.000 AOA.
3. Fornecer factura em falta.
4. Aprovar carta ao BAI.
5. Primavera local está offline.
6. Email suspeito recebido.
7. Reclamação social de alto impacto.
```

---

# 67. EXECUTIVE PRIORITIZATION

Classificar:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

---

# 68. DAILY DELIVERY

Permitir envio por:

```text
WhatsApp
Email
In-App
Push
```

---

# 69. DEFAULT DELIVERY

Configuração por utilizador:

```text
preferred_channel
preferred_time
preferred_companies
preferred_detail_level
```

---

# 70. MULTI-COMPANY SUMMARY

Permitir:

```text
GLOBAL SUMMARY
```

e:

```text
PER COMPANY
```

---

# 71. PER-DEPARTMENT SUMMARY

Permitir:

```text
Finance
Accounting
Tax
HR
Administration
Marketing
Sales
Operations
```

---

# 72. SCHEDULER

Criar ou reutilizar scheduler.

Exemplo:

```text
07:00
Collect events

07:01
Aggregate tasks

07:02
Aggregate files

07:03
Identify risks

07:04
Generate summary

07:05
Deliver briefing
```

Horário configurável.

---

# 73. CLOUD VS LOCAL

Se informação estiver em cloud:

```text
INCLUDED
```

Se depender de local offline:

```text
PENDING_LOCAL_SYNC
```

Briefing deve informar:

```text
"2 operações não puderam ser consolidadas porque o conector local está offline."
```

---

# 74. APPROVAL CENTER

Unificar aprovações de:

```text
WhatsApp actions
Email sends
Social posts
Ad spend
Financial actions
External documents
```

---

# 75. APPROVAL RECORD

Campos:

```text
approval_id
action_type
task_id
execution_id
requester_employee
approver_user
status
requested_at
approved_at
rejected_at
```

---

# 76. HITL RULES

Exigir aprovação para:

```text
bank payment
tax submission
legal commitment
external sensitive email
social crisis response
high-budget ads
contract changes
destructive actions
```

---

# 77. COMMAND RISK ENGINE

Criar:

```text
COMMAND_RISK_ENGINE
```

Classificar:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 78. EXAMPLE — WHATSAPP BANK COMMAND

Mensagem:

```text
"Pague 5.000.000 AOA ao fornecedor."
```

Fluxo:

```text
WhatsApp
↓
Financial Employee
↓
CRITICAL
↓
Payment Proposal
↓
WAITING_APPROVAL
```

Nunca executar directamente sem política e aprovação.

---

# 79. EXAMPLE — EMAIL AGT

Email:

```text
AGT Notification
```

Fluxo:

```text
Email Connector
↓
Tax Intent
↓
Tax Employee
↓
Source-Critical Knowledge
↓
Draft Response
↓
Approval
↓
Send
```

---

# 80. EXAMPLE — SOCIAL LEAD

Instagram DM:

```text
"Quero contratar contabilidade."
```

Fluxo:

```text
Lead Detected
↓
Lead Record
↓
Sales Employee
↓
Follow-up
```

---

# 81. EXAMPLE — FILE FROM WHATSAPP

Mensagem:

```text
"Contabilista, contabilize isto."
```

Anexo:

```text
invoice.pdf
```

Fluxo:

```text
WhatsApp
↓
Document Intake
↓
Classification
↓
Accounting Employee
↓
SOP
↓
Task
↓
Result
```

---

# 82. EXAMPLE — MORNING BRIEF

Mensagem enviada às 07:05:

```text
RESUMO OPERACIONAL — MARVINE, LDA

WhatsApp:
38 mensagens
24 comandos
19 tarefas

Email:
84 recebidos
12 aguardam resposta
4 aguardam aprovação

Social:
4 posts
8 leads
2 reclamações

Tasks:
31 completed
4 pending
1 blocked

Files:
14 received
19 generated

Needs Your Attention:
5 items

Critical Incidents:
0
```

---

# 83. LINKED ACTIONS

No briefing permitir:

```text
[Open Task]
[Open File]
[Approve]
[Reply]
[View Evidence]
```

---

# 84. AUDITABILITY

Cada acção deve responder:

```text
Who?
What?
When?
Which Company?
Which Tenant?
Which Employee?
Which Task?
Which Model?
Which Tool?
Which Channel?
Which Output?
```

---

# 85. SOCIAL AUDIT

Guardar:

```text
social_event_id
platform
account_id
company_id
tenant_id
employee_instance_id
task_id
execution_id
post_id
comment_id
message_id
action
approval_id
timestamp
```

---

# 86. EMAIL AUDIT

Guardar:

```text
email_id
thread_id
mailbox_id
company_id
tenant_id
employee_instance_id
task_id
execution_id
action
approval_id
timestamp
```

---

# 87. CHANNEL EXECUTION MODE

Integrar com:

```text
EXECUTION_MODE = MOCK
EXECUTION_MODE = REAL_API
```

Toda chamada real a connector deve ser distinguida de mock.

---

# 88. CONNECTOR EVIDENCE

Guardar:

```text
connector_name
connector_request_id
connector_response_id
execution_mode
latency
status
```

quando disponível.

---

# 89. NO HIDDEN MOCKS

Em produção:

```text
MOCK_CONNECTOR = false
```

por defeito.

---

# 90. ERROR HANDLING

Categorias:

```text
AUTH_ERROR
RATE_LIMIT
NETWORK
WEBHOOK_ERROR
PERMISSION_DENIED
INVALID_PAYLOAD
CONNECTOR_DOWN
LOCAL_AGENT_OFFLINE
```

---

# 91. RETRIES

Retry apenas em erros transitórios.

Não retry automático em:

```text
permission denied
approval rejected
invalid recipient
security block
```

---

# 92. IDEMPOTENCY

Evitar:

```text
duplicate post
duplicate email
duplicate WhatsApp reply
duplicate payment
duplicate task
```

---

# 93. DUPLICATE MESSAGE PROTECTION

Usar:

```text
source_message_id
idempotency_key
```

---

# 94. RATE LIMITING

Aplicar limites:

```text
per user
per channel
per company
per employee
```

---

# 95. CONTENT SAFETY & POLICY

Antes de publicar externamente:

```text
brand policy
company policy
legal constraints
channel constraints
risk checks
```

---

# 96. SENSITIVE CONTENT

Escalar conteúdo:

```text
legal
medical
financial advice
public accusations
crisis
politics
high-impact claims
```

conforme política da empresa.

---

# 97. TENANT ISOLATION

Toda operação deve incluir:

```text
company_id
tenant_id
```

Bloquear:

```text
cross-tenant message
cross-tenant attachment
cross-tenant file
cross-tenant account
cross-tenant lead
```

---

# 98. USER AUTHORIZATION

Antes de aceitar comando:

```text
authenticated/resolved identity
↓
company membership
↓
channel permission
↓
employee access
↓
task permission
```

---

# 99. CUSTOMER CONTACTS

Contactos externos não devem automaticamente ganhar acesso interno.

Separar:

```text
INTERNAL USER
CUSTOMER
SUPPLIER
PUBLIC USER
UNKNOWN
```

---

# 100. CONTACT RESOLUTION

Criar:

```text
ContactResolver
```

---

# 101. PRIVACY

Aplicar minimização de dados.

Não enviar contexto desnecessário ao modelo.

---

# 102. RETENTION

Definir políticas por:

```text
channel
company
data class
jurisdiction
```

---

# 103. SEARCH & HISTORY

Permitir pesquisar:

```text
messages
emails
posts
comments
tasks
files
approvals
```

por empresa e tenant.

---

# 104. THREAD VIEW

Mostrar relação:

```text
message/email/social event
↓
task
↓
employee
↓
execution
↓
output
```

---

# 105. DASHBOARD OMNICHANNEL

Indicadores:

```text
WhatsApp messages
Emails
Social events
Tasks created
Tasks completed
Leads
Complaints
Approvals
Errors
Files received
Files generated
```

---

# 106. DASHBOARD EMAIL

Indicadores:

```text
Received
Sent
Awaiting Reply
Awaiting Approval
High Priority
Suspicious
Attachments
Tasks Created
```

---

# 107. DASHBOARD SOCIAL

Indicadores:

```text
Posts
Comments
DMs
Leads
Complaints
Engagement
Approvals
Incidents
```

---

# 108. DASHBOARD WHATSAPP

Indicadores:

```text
Messages
Commands
Attachments
Tasks
Approvals
Failures
```

---

# 109. PROVIDER MODEL TRACE

Quando IA é usada, guardar:

```text
provider
model_id
execution_id
```

---

# 110. MODEL ROUTING

Usar router existente:

```text
OpenAI
Gemini
Claude
```

---

# 111. KNOWLEDGE

Cada Employee deve carregar apenas knowledge necessário ao evento/task.

---

# 112. SOURCE-CRITICAL

Para conteúdo regulatório:

```text
verified source required
```

---

# 113. CLIENT KNOWLEDGE

Brand, templates, pricing e policies vêm de:

```text
CLIENT_SOURCE_REQUIRED
```

---

# 114. TASK CREATION RULE

Toda acção de trabalho deve gerar ou associar:

```text
task_id
```

---

# 115. NO UNTRACKED WORK

Não permitir trabalho operacional externo sem task/event record.

---

# 116. QUALITY CHECK

Antes de outbound:

```text
factual check
recipient check
brand check
policy check
format check
risk check
```

---

# 117. CHANNEL-SPECIFIC OUTPUT

Adaptar output para:

```text
WhatsApp
Email
Instagram
LinkedIn
TikTok
Facebook
```

sem mudar factualidade.

---

# 118. SOCIAL CONTENT REUSE

Permitir:

```text
master campaign
↓
channel variants
```

---

# 119. EMAIL + SOCIAL + WHATSAPP CAMPAIGN COORDINATION

Criar:

```text
CAMPAIGN_ORCHESTRATION
```

para coordenar mensagens entre canais.

---

# 120. NO SPAM

Respeitar:

```text
consent
opt-out
frequency caps
channel policy
```

---

# 121. CUSTOMER OPT-OUT

Guardar:

```text
do_not_contact
preferred_channel
```

---

# 122. NOTIFICATION PREFERENCES

Por gestor:

```text
critical only
daily summary
all approvals
email summary
whatsapp summary
```

---

# 123. MORNING BRIEF CONFIGURATION

Campos:

```text
enabled
time
timezone
companies
channels
detail_level
delivery_channel
```

---

# 124. WEEKLY SUMMARY

Preparar arquitectura também para:

```text
WEEKLY_EXECUTIVE_DIGEST
```

sem implementar duplicação.

---

# 125. MONTHLY SUMMARY

Preparar:

```text
MONTHLY_OMNICHANNEL_REPORT
```

---

# 126. COST REPORT

No briefing incluir:

```text
OpenAI cost
Gemini cost
Claude cost
Connector cost
Total AI cost
```

quando disponível.

---

# 127. PERFORMANCE REPORT

Mostrar:

```text
tasks completed
average response time
lead conversion
complaint resolution
email response time
social response time
```

---

# 128. EMAIL RESPONSE SLA

Medir:

```text
time_to_first_response
time_to_resolution
```

---

# 129. WHATSAPP RESPONSE SLA

Medir:

```text
time_to_acknowledge
time_to_completion
```

---

# 130. SOCIAL RESPONSE SLA

Medir:

```text
time_to_comment_reply
time_to_dm_reply
```

---

# 131. INCIDENT REPORT

Briefing deve mostrar:

```text
security incidents
connector failures
failed sends
failed posts
duplicate prevention events
cross-tenant blocks
```

---

# 132. TESTES OBRIGATÓRIOS — WHATSAPP

## TEST-WA-01
Authorized number creates task.

## TEST-WA-02
Unauthorized number blocked.

## TEST-WA-03
Attachment creates correct task.

## TEST-WA-04
Offline local dependency enters queue.

## TEST-WA-05
Result delivered back to WhatsApp.

---

# 133. TESTES OBRIGATÓRIOS — EMAIL

## TEST-EM-01
Inbound email classified.

## TEST-EM-02
Attachment mapped to task.

## TEST-EM-03
Draft reply created.

## TEST-EM-04
High-risk email requires approval.

## TEST-EM-05
Suspicious email flagged.

## TEST-EM-06
Email report generated.

---

# 134. TESTES OBRIGATÓRIOS — SOCIAL

## TEST-SM-01
Comment received.

## TEST-SM-02
DM converted to lead.

## TEST-SM-03
Post drafted.

## TEST-SM-04
Post approval required.

## TEST-SM-05
Approved post published.

## TEST-SM-06
Crisis event escalated.

---

# 135. TESTES OBRIGATÓRIOS — DAILY BRIEF

## TEST-DB-01
WhatsApp metrics included.

## TEST-DB-02
Email metrics included.

## TEST-DB-03
Social metrics included.

## TEST-DB-04
Tasks included.

## TEST-DB-05
Files received included.

## TEST-DB-06
Files generated included.

## TEST-DB-07
Approvals included.

## TEST-DB-08
Needs Your Attention included.

## TEST-DB-09
Offline connector status included.

## TEST-DB-10
Delivered to configured channel.

---

# 136. TESTE REAL PILOTO — MARVINE

Usar tenant real da MARVINE.

Executar controladamente:

```text
WhatsApp command
Email inbound
Social DM
Daily brief
```

---

# 137. REAL TASK PROOF

Cada teste real deve produzir:

```text
source event
channel ID
task ID
employee instance
execution ID
provider/model
connector receipt
output
delivery receipt
audit trail
```

---

# 138. NO MOCK PASS AS PRODUCTION PROOF

Mock pode validar lógica.

Não pode validar:

```text
REAL CONNECTOR
REAL API
REAL MESSAGE DELIVERY
REAL PUBLISH
```

---

# 139. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ WhatsApp cria tarefas reais
✓ Email cria tarefas reais
✓ Social events criam tarefas/leads reais
✓ canais estão ligados por empresa/tenant
✓ Employees têm permissões específicas
✓ anexos entram no document intake
✓ outbound passa por policy/approval
✓ daily brief consolida WhatsApp, email e social
✓ relatório de emails existe
✓ relatório de ficheiros recebidos existe
✓ relatório de ficheiros gerados existe
✓ Needs Your Attention existe
✓ offline queue funciona
✓ cross-tenant é bloqueado
✓ connector execution mode é auditável
✓ cada acção externa gera evidência
✓ nenhum secret é exposto ao modelo
```

---

# 140. RESULTADO FINAL

A plataforma deve permitir:

```text
MANAGER
↓
WhatsApp / Email / Social
↓
AI Employees
↓
Tasks
↓
Work
↓
Outputs
↓
Approvals
↓
Results
↓
Daily Executive Brief
```

---

# 141. OBJECTIVO DE NEGÓCIO

Transformar WhatsApp, email e redes sociais em interfaces operacionais reais para os AI Employees.

O utilizador deve conseguir gerir uma parte significativa da empresa sem entrar constantemente no aplicativo.

---

# 142. DEFINIÇÃO FINAL

A implementação será considerada bem-sucedida quando:

```text
WHATSAPP
EMAIL
SOCIAL MEDIA
```

deixarem de ser apenas canais de comunicação e passarem a funcionar como:

```text
COMMAND
+
TASK
+
WORKFLOW
+
OUTPUT
+
AUDIT
+
EXECUTIVE INTELLIGENCE
```

dentro da AETF-500.
