# Prompt — Remote Command, Offline Queue, Deferred Execution & Cloud/Local Connectivity Engine

## MISSÃO

Actue como:

- arquitecto sénior de sistemas distribuídos;
- engenheiro de software;
- especialista em cloud computing;
- especialista em aplicações móveis;
- especialista em sistemas multi-tenant;
- especialista em automação;
- especialista em agentes de IA;
- especialista em segurança da informação;
- especialista em execução remota;
- especialista em filas distribuídas e schedulers;
- especialista em integração cloud/local;
- especialista em armazenamento cloud e local;
- especialista em auditoria e observabilidade.

Implemente na plataforma dos **500 AI Employees** um módulo denominado:

```text
Remote Command, Offline Queue, Deferred Execution & Cloud/Local Connectivity Engine
```

O módulo deve permitir que um utilizador envie comandos através do telemóvel, aplicação web, API ou outro canal autorizado, mesmo quando o computador local estiver desligado.

O sistema deve decidir automaticamente:

```text
Onde estão os dados?
+
Onde está a aplicação necessária?
+
O dispositivo está online?
+
A tarefa pode executar na cloud?
+
Precisa de sistema local?
+
Pode ser dividida entre cloud e local?
        ↓
CLOUD / LOCAL / HYBRID / WAIT / BLOCKED
```

---

# 1. PRINCÍPIO FUNDAMENTAL

Implementar explicitamente a regra:

```text
STORAGE LOCATION ≠ EXECUTION LOCATION
```

Guardar um ficheiro no Google Drive, OneDrive ou SharePoint não significa que o AI Employee esteja a executar nesses serviços.

Distinguir sempre:

```text
1. CLOUD EXECUTION
2. CLOUD STORAGE
3. LOCAL EXECUTION
4. LOCAL STORAGE
```

---

# 2. CAMADAS DA ARQUITECTURA

## 2.1 CLOUD EXECUTION

Ambiente onde os AI Employees executam tarefas remotamente.

Pode incluir:

```text
AI Employee Platform
Cloud Workers
Containers
Serverless Workers
Background Jobs
Task Orchestrator
Workflow Engine
AI Models
RAG Services
API Workers
```

A Cloud Execution Layer deve funcionar mesmo quando o computador do utilizador estiver desligado.

---

## 2.2 CLOUD STORAGE / CONNECTED STORAGE

Implementar conectores para:

```text
Google Drive
OneDrive
SharePoint
Dropbox
Amazon S3
Azure Blob Storage
Google Cloud Storage
Box
outros serviços autorizados
```

Tratar estes serviços como:

```text
CLOUD_DATA_SOURCE
CLOUD_STORAGE
CONNECTED_STORAGE
```

e não como motor de execução.

---

## 2.3 LOCAL EXECUTION

Executar localmente quando a tarefa depender de:

```text
PRIMAVERA
Excel Desktop
software interno
browser autenticado localmente
certificado digital
impressora
scanner
software legado
hardware local
aplicações sem API cloud
```

A execução deve ocorrer através de:

```text
AI Employees Local Agent
```

---

## 2.4 LOCAL STORAGE

Suportar:

```text
C:\
D:\
pastas locais
servidores locais
NAS
pastas de rede
SMB shares
network drives
file servers
```

Quando o armazenamento estiver inacessível porque o dispositivo ou rede local está offline:

```text
WAITING_FOR_DEVICE
```

---

# 3. EXECUTION LOCATION RESOLVER

Criar componente:

```text
Execution Location Resolver
```

Responsabilidades:

1. identificar onde estão os dados;
2. identificar onde está a aplicação necessária;
3. detectar se existe API cloud;
4. detectar se o recurso local está online;
5. verificar capacidades do dispositivo;
6. verificar permissões;
7. avaliar risco;
8. escolher modo de execução;
9. dividir tarefas quando necessário.

Resultado:

```text
CLOUD
LOCAL
HYBRID
WAIT
BLOCKED
```

---

# 4. EXECUTION DECISION

Criar entidade:

```text
ExecutionDecision
```

Campos:

```text
decision_id
task_id
data_location
application_location
required_capabilities
available_cloud_connectors
available_local_devices
selected_execution_mode
selected_device
reason
risk_level
policy_result
created_at
```

---

# 5. MODOS DE EXECUÇÃO

Suportar:

```text
CLOUD_ONLY
LOCAL_ONLY
HYBRID
ANY_AVAILABLE
DEFERRED
SCHEDULED
CONDITIONAL
```

---

# 6. REMOTE COMMAND CENTER

Permitir comandos por:

```text
MOBILE_APP
WEB_APP
DESKTOP_APP
REST_API
VOICE
WHATSAPP_BUSINESS
TELEGRAM
SMS_LIMITED
EMAIL_COMMANDS
INTERNAL_CHAT
```

Cada canal deve ser configurável por tenant.

---

# 7. MODELO DE COMANDO

Criar entidade:

```text
RemoteCommand
```

Campos:

```text
command_id
tenant_id
user_id
employee_id
channel
command_text
normalized_intent
attachments
created_at
priority
deadline
target_device
execution_mode
risk_level
approval_required
status
correlation_id
```

---

# 8. ESTADOS DO COMANDO

Implementar:

```text
RECEIVED
AUTHENTICATING
AUTHORIZED
REJECTED
PARSED
VALIDATING
QUEUED
WAITING_FOR_DEVICE
WAITING_FOR_APPROVAL
SCHEDULED
EXECUTING
PARTIALLY_COMPLETED
COMPLETED
FAILED
CANCELLED
EXPIRED
```

---

# 9. EXEMPLO — GOOGLE DRIVE

Comando:

```text
"Analise as facturas da pasta Agosto no Google Drive."
```

Fluxo:

```text
Mobile Command
↓
AI Employee Cloud
↓
Google Drive Connector
↓
Read Files
↓
Process in Cloud
↓
Generate Result
↓
Save Result
↓
Notify User
```

O computador local pode estar desligado.

---

# 10. EXEMPLO — ONEDRIVE

Comando:

```text
"Prepare o relatório financeiro usando os ficheiros do OneDrive."
```

Fluxo:

```text
OneDrive
↓
Cloud Connector
↓
AI Employee Cloud
↓
Processing
↓
Report
```

Não exigir computador local quando todos os dados e capacidades estiverem disponíveis na cloud.

---

# 11. EXEMPLO — FICHEIRO CLOUD + PRIMAVERA LOCAL

Comando:

```text
"Pegue no ficheiro de lançamentos do Google Drive e importe no PRIMAVERA."
```

Fluxo:

```text
Google Drive
↓
Cloud Worker
↓
Validate File
↓
Prepare Import
↓
Office PC offline?
       ↓
      YES
       ↓
WAITING_FOR_DEVICE
       ↓
PC ONLINE
       ↓
Local Agent
       ↓
PRIMAVERA
       ↓
Import
       ↓
Validate
       ↓
Upload Result
       ↓
Notify User
```

Este é um caso:

```text
HYBRID
```

---

# 12. EXEMPLO — FICHEIRO LOCAL

Comando:

```text
"Faça a conciliação usando os extractos em C:\Bancos\Agosto."
```

Se o PC estiver desligado:

```text
WAITING_FOR_DEVICE
```

Quando ligar:

```text
PC ONLINE
↓
Local Agent
↓
Read Local Files
↓
Execute Task
↓
Return Result
```

---

# 13. CLOUD STORAGE CONNECTIVITY LAYER

Criar uma camada:

```text
Cloud & Connected Storage Layer
```

Responsabilidades:

- autenticação;
- autorização;
- pesquisa;
- leitura;
- escrita;
- upload;
- download;
- sincronização;
- versionamento;
- metadata;
- permissões;
- auditoria.

Conectores iniciais:

```text
Google Drive
OneDrive
SharePoint
Dropbox
S3
Azure Blob
Google Cloud Storage
```

---

# 14. LOCAL STORAGE CONNECTIVITY LAYER

Criar:

```text
Local Storage Connector
```

Suportar:

```text
LocalFolders
NetworkShares
NAS
SMB
MountedDrives
FileServers
```

Aplicar permissões mínimas necessárias.

---

# 15. AI EMPLOYEES LOCAL AGENT

Criar programa local responsável por:

- iniciar com o sistema operativo;
- autenticar-se na plataforma;
- enviar heartbeat;
- detectar capacidades;
- consultar tarefas pendentes;
- executar tarefas autorizadas;
- comunicar resultados;
- proteger credenciais;
- actualizar-se com segurança;
- guardar logs;
- bloquear comandos não autorizados.

---

# 16. DEVICE REGISTRY

Criar entidade:

```text
Device
```

Campos:

```text
device_id
tenant_id
name
device_type
operating_system
agent_version
owner
location_label
last_seen_at
status
capabilities
installed_apps
security_posture
trusted
```

Estados:

```text
ONLINE
OFFLINE
BUSY
UNTRUSTED
DISABLED
UPDATING
ERROR
```

---

# 17. DEVICE CAPABILITY DISCOVERY

Detectar:

```text
PRIMAVERA_AVAILABLE
EXCEL_AVAILABLE
BROWSER_AVAILABLE
LOCAL_FILES_AVAILABLE
NETWORK_SHARE_AVAILABLE
PRINTER_AVAILABLE
SCANNER_AVAILABLE
CERTIFICATE_AVAILABLE
```

---

# 18. OFFLINE QUEUE

Se dispositivo necessário estiver offline:

```text
WAITING_FOR_DEVICE
```

A fila deve ser durável e sobreviver a:

- reinícios;
- quedas de ligação;
- falhas temporárias;
- actualizações;
- manutenção.

---

# 19. DEFERRED EXECUTION

Quando o dispositivo voltar online:

```text
DEVICE_ONLINE
↓
FETCH_PENDING_JOBS
↓
VALIDATE_PERMISSIONS
↓
VALIDATE_EXPIRATION
↓
VALIDATE_PRECONDITIONS
↓
EXECUTE
↓
UPLOAD_RESULT
```

---

# 20. TASK ORCHESTRATOR

Criar:

```text
ExecutionTask
```

Campos:

```text
task_id
command_id
tenant_id
employee_id
task_type
execution_mode
required_capabilities
required_device
dependencies
priority
deadline
status
attempt_count
max_attempts
created_at
started_at
completed_at
```

---

# 21. HYBRID EXECUTION

Permitir dividir uma tarefa:

```text
Cloud
→ analisar
→ validar
→ preparar

Local
→ executar no software instalado

Cloud
→ validar resultado
→ gerar relatório
→ notificar
```

---

# 22. TRIGGER ENGINE

Suportar:

```text
DEVICE_ONLINE
FILE_CREATED
FILE_UPDATED
EMAIL_RECEIVED
DOCUMENT_UPLOADED
BANK_FILE_AVAILABLE
DATE_TIME
API_EVENT
WEBHOOK
APP_AVAILABLE
USER_LOGIN
APPROVAL_GRANTED
REGULATORY_CHANGE
CUSTOM_EVENT
```

---

# 23. SCHEDULER

Permitir:

```text
RUN_AT
RUN_AFTER
RUN_BEFORE
RECURRING
ON_EVENT
```

---

# 24. RISK ENGINE

Classificar comandos:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Exemplos:

```text
LOW
→ gerar relatório

MEDIUM
→ actualizar ficheiro

HIGH
→ alterar ERP ou enviar informação externa

CRITICAL
→ pagamento, submissão oficial, alteração de segurança
```

---

# 25. APPROVAL ENGINE

Política base:

```text
LOW
→ AUTO_EXECUTE

MEDIUM
→ AUTO_EXECUTE + LOG

HIGH
→ HUMAN_APPROVAL_REQUIRED

CRITICAL
→ DUAL_APPROVAL + MFA
```

---

# 26. IDEMPOTÊNCIA

Cada tarefa sensível deve possuir:

```text
idempotency_key
```

Evitar:

- importação duplicada;
- submissão duplicada;
- pagamento duplicado;
- lançamento contabilístico duplicado;
- envio duplicado.

---

# 27. RETRIES

Implementar retries controlados.

Não repetir automaticamente operações irreversíveis ou financeiras sem política explícita.

---

# 28. EXECUTION RECEIPT

Criar:

```text
ExecutionReceipt
```

Campos:

```text
receipt_id
task_id
command_id
employee_id
executed_at
device_id
action
result
files_created
records_affected
warnings
errors
evidence
duration
status
```

---

# 29. RESULT CENTER

Mostrar:

- tarefa;
- Employee;
- modo de execução;
- origem dos dados;
- destino;
- dispositivo;
- início;
- fim;
- documentos;
- operações;
- avisos;
- erros;
- evidências.

---

# 30. SEGURANÇA

Implementar:

```text
RBAC
ABAC
Least Privilege
MFA
Device Trust
Encryption
Secret Management
Short-lived Tokens
Command Signing
Audit Logs
Tenant Isolation
Session Controls
Revocation
```

---

# 31. ZERO TRUST

Aplicar:

```text
NEVER TRUST
ALWAYS VERIFY
```

Validar em cada execução:

- utilizador;
- tenant;
- Employee;
- dispositivo;
- permissão;
- política;
- risco;
- estado da tarefa.

---

# 32. COMMAND EXPIRATION

Suportar:

```text
expires_at
```

Uma tarefa vencida não deve executar automaticamente quando o dispositivo voltar online.

---

# 33. COMPUTER USE

Quando API não existir:

```text
Local Agent
↓
Computer Use Worker
↓
Application
↓
Action
↓
Verification
```

Guardar evidência quando necessário.

---

# 34. CLOUD-FIRST PRINCIPLE

Aplicar:

```text
CLOUD_EXECUTION > LOCAL_EXECUTION
```

sempre que cloud for segura, permitida e funcionalmente suficiente.

---

# 35. FAILOVER

Se vários dispositivos forem compatíveis:

```text
Preferred Device unavailable
↓
Policy permits failover?
↓
YES
↓
Alternative Device
```

---

# 36. WAKE-ON-LAN

Suportar opcionalmente:

```text
WAKE_ON_LAN
```

Nunca depender deste mecanismo como arquitectura principal.

---

# 37. MULTI-TENANT

Todos os objectos devem possuir:

```text
tenant_id
```

Garantir isolamento completo entre empresas.

---

# 38. INTEGRAÇÃO COM CPEAA

Antes de executar:

```text
Command
↓
CPEAA Policy Check
↓
Allowed?
```

As políticas internas do cliente podem:

- permitir;
- limitar;
- exigir aprovação;
- bloquear.

---

# 39. INTEGRAÇÃO COM CKRAIE-2026

Para tarefas reguladas:

```text
Employee Knowledge Status
→ CURRENT?
```

Se:

```text
STALE
REVIEW_PENDING
BLOCKED
```

o sistema deve aplicar política de bloqueio ou escalonamento.

---

# 40. KNOWLEDGE & CAPABILITY TRACEABILITY

Registar por tarefa:

```text
knowledge_version_used
capability_version_used
policy_version_used
connector_version_used
```

---

# 41. OBSERVABILIDADE

Monitorizar:

```text
commands_received
commands_authorized
commands_rejected
jobs_queued
jobs_waiting_for_device
jobs_waiting_for_approval
jobs_executing
jobs_completed
jobs_failed
average_wait_time
device_online_rate
execution_latency
approval_latency
retry_rate
cloud_execution_rate
local_execution_rate
hybrid_execution_rate
```

---

# 42. AUDIT TRAIL

Registar:

```text
user
command
employee
tenant
device
data_source
storage_location
execution_location
action
approval
execution
result
timestamp
risk_level
evidence
```

---

# 43. DATA MODEL

Criar ou adaptar:

```text
remote_commands
execution_tasks
execution_decisions
task_dependencies
task_events
devices
device_capabilities
device_heartbeats
local_agents
cloud_connectors
storage_connections
job_queue
triggers
schedules
approvals
execution_receipts
notifications
audit_events
```

---

# 44. INTERNAL APIs

Implementar, adaptando à arquitectura existente:

```text
POST /remote-commands
GET /remote-commands/{id}

GET /tasks
GET /tasks/{id}
POST /tasks/{id}/cancel

GET /execution-decisions/{task_id}

GET /devices
GET /devices/{id}
GET /devices/{id}/status

GET /storage-connections
POST /storage-connections

POST /approvals/{id}/approve
POST /approvals/{id}/reject

GET /execution-receipts/{id}

POST /triggers
GET /triggers

POST /schedules
GET /schedules
```

---

# 45. EVENT BUS

Publicar:

```text
COMMAND_RECEIVED
COMMAND_AUTHORIZED
EXECUTION_LOCATION_RESOLVED
TASK_QUEUED
DEVICE_OFFLINE
DEVICE_ONLINE
TASK_STARTED
TASK_COMPLETED
TASK_FAILED
APPROVAL_REQUIRED
APPROVAL_GRANTED
APPROVAL_REJECTED
STORAGE_CONNECTED
STORAGE_UNAVAILABLE
```

---

# 46. CRITÉRIOS DE ACEITAÇÃO

Demonstrar:

1. comando enviado por telemóvel;
2. tarefa executada integralmente na cloud;
3. ficheiro lido do Google Drive;
4. ficheiro lido do OneDrive;
5. ficheiro lido do SharePoint;
6. tarefa local com PC desligado;
7. estado `WAITING_FOR_DEVICE`;
8. execução automática após PC ligar;
9. tarefa híbrida cloud + PRIMAVERA;
10. acesso a pasta local;
11. acesso a NAS ou pasta de rede;
12. `Execution Location Resolver` a escolher correctamente o modo;
13. aprovação de tarefa de risco elevado;
14. prevenção de duplicação;
15. expiração de comando;
16. Audit Trail completo;
17. isolamento entre tenants;
18. registo da versão de conhecimento usada;
19. geração de Execution Receipt;
20. notificação final ao utilizador.

---

# 47. TESTES OBRIGATÓRIOS

Testar:

```text
CLOUD_STORAGE_AVAILABLE
CLOUD_STORAGE_UNAVAILABLE
DEVICE_OFFLINE
DEVICE_ONLINE
NETWORK_INTERRUPTION
LOCAL_STORAGE_UNAVAILABLE
DUPLICATE_COMMAND
EXPIRED_COMMAND
UNAUTHORIZED_USER
UNTRUSTED_DEVICE
MISSING_CAPABILITY
APPROVAL_DENIED
TASK_TIMEOUT
LOCAL_AGENT_CRASH
CLOUD_WORKER_CRASH
PARTIAL_EXECUTION
RETRY
FAILOVER
TENANT_ISOLATION
HYBRID_EXECUTION
```

---

# 48. NÃO CRIAR PLATAFORMA PARALELA

Integrar com:

- autenticação existente;
- tenants;
- utilizadores;
- Employees;
- Knowledge Registry;
- CPEAA;
- CKRAIE-2026;
- Audit Trail;
- notifications;
- scheduler;
- event bus;
- observabilidade.

Reutilizar componentes existentes sempre que tecnicamente adequado.

---

# RESULTADO FINAL

Entregar arquitectura em que:

```text
COMANDO PELO TELEFONE
        ↓
AI EMPLOYEE
        ↓
EXECUTION LOCATION RESOLVER
        ↓
┌──────────────┬──────────────┬──────────────┐
│ CLOUD        │ LOCAL        │ HYBRID       │
└──────────────┴──────────────┴──────────────┘
        ↓
CLOUD STORAGE / LOCAL STORAGE / APIs / SOFTWARE LOCAL
        ↓
EXECUÇÃO
        ↓
RESULTADO
        ↓
AUDIT TRAIL
        ↓
NOTIFICAÇÃO
```

O sistema deve conseguir responder:

> Onde estavam os dados?

> Onde a tarefa foi executada?

> Foi cloud, local ou híbrida?

> Qual serviço de armazenamento foi usado?

> Qual dispositivo foi usado?

> O computador estava offline?

> A tarefa ficou em espera?

> Qual Employee executou?

> Qual versão de conhecimento foi usada?

> Que política autorizou a execução?

> Qual foi o resultado?

> Existe evidência auditável?

O objectivo final é permitir que os **500 AI Employees** funcionem como uma força de trabalho digital persistente, capaz de operar sobre dados cloud e locais, executar em cloud ou em computadores do cliente, aguardar dispositivos offline e retomar automaticamente quando os recursos necessários estiverem disponíveis.
