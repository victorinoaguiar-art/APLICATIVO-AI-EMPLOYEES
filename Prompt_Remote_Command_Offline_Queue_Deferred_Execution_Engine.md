# Prompt — Remote Command, Offline Queue & Deferred Execution Engine

## MISSÃO

Actue como:

- arquitecto sénior de sistemas distribuídos;
- engenheiro de software;
- especialista em cloud computing;
- especialista em aplicações móveis;
- especialista em sistemas multi-tenant;
- especialista em automação de processos;
- especialista em agentes de IA;
- especialista em segurança da informação;
- especialista em execução remota;
- especialista em filas distribuídas e schedulers;
- especialista em integração com sistemas locais;
- especialista em auditoria e observabilidade.

Implemente na plataforma dos **500 AI Employees** um módulo denominado:

```text
Remote Command, Offline Queue & Deferred Execution Engine
```

O objectivo deste módulo é permitir que um utilizador envie comandos para qualquer AI Employee através do telemóvel, aplicação web, API ou outro canal autorizado, mesmo quando o computador do utilizador estiver desligado.

O sistema deve:

- executar imediatamente tarefas que possam ser realizadas na cloud;
- colocar em espera tarefas que dependam de um computador ou sistema local indisponível;
- executar automaticamente essas tarefas quando o dispositivo necessário ficar disponível;
- permitir tarefas programadas e condicionais;
- manter segurança, controlo de permissões, aprovações e auditoria;
- notificar o utilizador sobre execução, conclusão, falha ou necessidade de intervenção.

---

# 1. PRINCÍPIO CENTRAL

O AI Employee não deve depender de um computador individual para existir.

A arquitectura deve separar:

```text
AI EMPLOYEE
        ↓
CLOUD EXECUTION LAYER
        ↓
LOCAL EXECUTION LAYER
```

O AI Employee deve permanecer disponível na cloud mesmo quando o computador local estiver desligado.

---

# 2. ARQUITECTURA GERAL

Implementar:

```text
Mobile Command Center
+
Web Command Center
+
Remote Command API
+
Authentication & Authorization
+
Command Parser
+
Intent Classification
+
Task Orchestrator
+
Durable Job Queue
+
Deferred Execution Engine
+
Trigger Engine
+
Device Registry
+
Device Heartbeat
+
Local Agent
+
Cloud Execution Workers
+
Approval Engine
+
Execution Receipts
+
Notification Engine
+
Evidence & Audit Trail
```

Fluxo principal:

```text
UTILIZADOR
   ↓
TELEMÓVEL / WEB / API
   ↓
REMOTE COMMAND GATEWAY
   ↓
AUTHENTICATION
   ↓
AUTHORIZATION
   ↓
COMMAND INTERPRETATION
   ↓
RISK & POLICY CHECK
   ↓
TASK ORCHESTRATOR
   ↓
┌─────────────────────────────┐
│ Pode executar na cloud?     │
└─────────────────────────────┘
       ↓              ↓
      SIM            NÃO
       ↓              ↓
CLOUD WORKER      LOCAL DEVICE REQUIRED
       ↓              ↓
EXECUTE          OFFLINE QUEUE
       ↓              ↓
RESULT            WAITING_FOR_DEVICE
                      ↓
                 DEVICE ONLINE
                      ↓
                 LOCAL AGENT
                      ↓
                 EXECUTE
                      ↓
                 RESULT
```

---

# 3. CANAIS DE COMANDO

Permitir envio de comandos por:

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

Canais externos só podem ser activados após configuração segura e autenticação adequada.

---

# 4. MOBILE COMMAND CENTER

Criar uma interface móvel denominada:

```text
AI Workforce Command Center
```

Permitir:

- pesquisar Employees;
- seleccionar Employee;
- enviar comando;
- ditar comando por voz;
- anexar documento;
- escolher cliente;
- escolher empresa;
- seleccionar dispositivo;
- definir prioridade;
- definir prazo;
- definir condição;
- acompanhar estado;
- aprovar tarefas;
- cancelar tarefas;
- ver resultados;
- receber notificações.

---

# 5. MODELO DE COMANDO

Criar entidade:

```text
RemoteCommand
```

Campos mínimos:

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

# 6. ESTADOS DO COMANDO

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

# 7. TIPOS DE EXECUÇÃO

Definir:

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

# 8. CLOUD EXECUTION

Executar na cloud quando a tarefa não depender de software ou dados exclusivamente locais.

Exemplos:

- analisar documentos existentes na cloud;
- preparar relatórios;
- conciliar dados cloud;
- gerar ficheiros;
- analisar legislação;
- preparar emails;
- gerar dashboards;
- actualizar conhecimento;
- executar workflows SaaS;
- consultar sistemas com API;
- preparar documentos contabilísticos.

---

# 9. LOCAL EXECUTION

Quando a tarefa depender de:

- PRIMAVERA local;
- Excel desktop;
- ficheiros locais;
- software proprietário;
- navegador autenticado localmente;
- impressora;
- certificados locais;
- dispositivos físicos;
- pastas de rede locais;

o sistema deve utilizar:

```text
AI Employees Local Agent
```

---

# 10. AI EMPLOYEES LOCAL AGENT

Criar um agente local instalado em Windows e, quando aplicável, macOS/Linux.

O agente deve:

- iniciar automaticamente com o sistema;
- autenticar-se na plataforma;
- enviar heartbeat;
- consultar tarefas pendentes;
- executar apenas tarefas autorizadas;
- comunicar resultados;
- suportar actualização segura;
- proteger credenciais;
- registar logs;
- bloquear comandos proibidos.

---

# 11. DEVICE REGISTRY

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

# 12. DEVICE HEARTBEAT

O Local Agent deve enviar heartbeat periódico.

Registar:

```text
device_id
timestamp
status
agent_version
network_state
available_capabilities
running_jobs
security_state
```

---

# 13. OFFLINE QUEUE

Se o dispositivo estiver offline:

```text
WAITING_FOR_DEVICE
```

A tarefa deve permanecer numa fila durável.

A fila deve sobreviver a:

- reinício do servidor;
- reinício do agente;
- perda de ligação;
- falha temporária;
- manutenção.

---

# 14. DEFERRED EXECUTION

Quando o dispositivo voltar a ficar online:

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

# 15. TRIGGER ENGINE

Permitir tarefas condicionais.

Tipos de trigger:

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

# 16. EXEMPLOS DE COMANDOS

### Exemplo 1

```text
"Quando o PC do escritório ligar, importe os lançamentos no PRIMAVERA."
```

Converter para:

```text
TRIGGER: DEVICE_ONLINE
DEVICE: OFFICE-PC-01
EMPLOYEE: PRIMAVERA_EMPLOYEE
ACTION: IMPORT_ACCOUNTING_ENTRIES
```

### Exemplo 2

```text
"Assim que aparecer um ficheiro bancário na pasta Bancos, faça a conciliação."
```

Converter para:

```text
TRIGGER: FILE_CREATED
PATH: /Bancos/
EMPLOYEE: BANK_RECONCILIATION_EMPLOYEE
ACTION: RECONCILE_BANK
```

### Exemplo 3

```text
"Prepare o fluxo de caixa ainda hoje."
```

Converter para:

```text
EXECUTION_MODE: CLOUD_ONLY
DEADLINE: TODAY
EMPLOYEE: FINANCE_EMPLOYEE
ACTION: PREPARE_CASHFLOW
```

---

# 17. TASK ORCHESTRATOR

Criar entidade:

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

# 18. JOB DEPENDENCIES

Permitir workflows compostos.

Exemplo:

```text
1. Extract bank statement
2. Validate data
3. Reconcile
4. Generate exceptions
5. Prepare report
6. Notify user
```

Executar etapas com dependências.

---

# 19. IDEMPOTÊNCIA

Evitar duplicação de execução.

Cada tarefa sensível deve possuir:

```text
idempotency_key
```

O sistema deve impedir:

- importação duplicada;
- pagamento duplicado;
- envio duplicado;
- submissão duplicada;
- lançamento contabilístico duplicado.

---

# 20. RETRIES

Implementar retries controlados.

Exemplo:

```text
MAX_RETRIES = 3
```

Usar exponential backoff quando apropriado.

Não repetir automaticamente operações financeiras ou irreversíveis sem política explícita.

---

# 21. RISK ENGINE

Classificar comandos:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Exemplos:

### LOW

- gerar relatório;
- analisar ficheiro;
- preparar draft.

### MEDIUM

- actualizar spreadsheet;
- importar informação reversível;
- criar documento.

### HIGH

- enviar informação para terceiro;
- alterar ERP;
- submeter informação oficial.

### CRITICAL

- pagamentos;
- transferências;
- submissões fiscais irreversíveis;
- alterações de segurança;
- eliminação de dados;
- alteração de permissões.

---

# 22. APPROVAL ENGINE

Criar políticas de aprovação.

Exemplos:

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

# 23. APPROVAL CARD

Antes de aprovar mostrar:

```text
Employee
Command
Action
Target
Device
Data affected
Financial impact
Risk
Reversibility
Dependencies
Audit reference
```

Botões:

```text
APPROVE
REJECT
REQUEST_CHANGE
CANCEL
```

---

# 24. MFA

Exigir MFA para:

- operações críticas;
- pagamentos;
- submissões oficiais;
- alteração de permissões;
- execução em sistemas sensíveis.

---

# 25. EXECUTION RECEIPT

Após execução gerar:

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

# 26. RESULT CENTER

Criar área:

```text
Task Results
```

Mostrar:

- tarefa;
- Employee;
- estado;
- início;
- fim;
- dispositivo;
- documentos produzidos;
- operações realizadas;
- erros;
- avisos;
- evidências;
- links para resultados.

---

# 27. NOTIFICAÇÕES

Enviar notificações quando:

- comando recebido;
- tarefa iniciada;
- dispositivo necessário offline;
- dispositivo voltou online;
- aprovação necessária;
- tarefa concluída;
- tarefa falhou;
- prazo próximo;
- tarefa expirada.

Canais:

```text
MOBILE_PUSH
EMAIL
SMS
WHATSAPP
IN_APP
WEB
```

---

# 28. MOBILE WORKFORCE STATUS

Mostrar:

```text
MY DIGITAL WORKFORCE
```

Exemplo:

```text
Total Employees: 500

Cloud Available: 487
Waiting for Device: 8
Executing: 3
Waiting Approval: 2

Tasks Today: 91
Completed: 77
Executing: 5
Scheduled: 6
Attention Required: 3
```

---

# 29. EMPLOYEE STATUS

Cada Employee pode estar:

```text
AVAILABLE
EXECUTING
WAITING_FOR_DEVICE
WAITING_FOR_APPROVAL
SCHEDULED
BLOCKED
ERROR
```

---

# 30. SEGURANÇA

Implementar:

- RBAC;
- ABAC;
- least privilege;
- device trust;
- MFA;
- secure tokens;
- short-lived credentials;
- encrypted communication;
- encrypted storage;
- command signing;
- device attestation quando possível;
- secret management;
- network restrictions;
- IP/device controls;
- audit logs;
- revocation;
- session management.

---

# 31. ZERO TRUST

Aplicar:

```text
NEVER TRUST
ALWAYS VERIFY
```

Cada execução deve validar novamente:

- utilizador;
- Employee;
- tenant;
- dispositivo;
- permissão;
- risco;
- estado da política.

---

# 32. LOCAL CREDENTIALS

Nunca enviar passwords em texto simples.

Utilizar:

- secure vault;
- OS credential manager;
- secret references;
- tokens temporários;
- delegated authentication.

---

# 33. COMMAND SIGNING

Assinar comandos críticos.

Campos:

```text
command_id
tenant_id
user_id
device_id
issued_at
expires_at
signature
```

---

# 34. COMMAND EXPIRATION

Permitir:

```text
expires_at
```

Exemplo:

Uma tarefa enviada às 18h para executar "hoje" não deve ser executada automaticamente dois dias depois.

---

# 35. LOCAL EXECUTION SANDBOX

Quando possível:

- limitar permissões do Local Agent;
- isolar processos;
- controlar filesystem;
- restringir comandos shell;
- bloquear operações não permitidas;
- usar allowlists de aplicações.

---

# 36. COMPUTER USE

Quando a integração directa por API não existir, permitir execução via interface gráfica controlada.

Fluxo:

```text
Local Agent
→ Computer Use Worker
→ Application
→ Action
→ Verification
```

Exigir captura de evidência para operações relevantes.

---

# 37. PRIMAVERA EXAMPLE

Fluxo:

```text
Mobile Command
↓
Employee PRIMAVERA
↓
Task Orchestrator
↓
Office PC offline
↓
WAITING_FOR_DEVICE
↓
PC starts
↓
Local Agent online
↓
PRIMAVERA detected
↓
Import file
↓
Validate totals
↓
Generate receipt
↓
Notify user
```

---

# 38. CLOUD-FIRST PRINCIPLE

Sempre que possível:

```text
CLOUD_EXECUTION > LOCAL_EXECUTION
```

Utilizar local apenas quando necessário.

---

# 39. HYBRID EXECUTION

Permitir dividir tarefa.

Exemplo:

```text
Cloud:
- analisar ficheiro
- validar dados
- preparar import

Local:
- importar no PRIMAVERA

Cloud:
- validar resultado
- gerar relatório
```

---

# 40. DEVICE CAPABILITY DISCOVERY

O Local Agent deve informar:

```text
PRIMAVERA_AVAILABLE
EXCEL_AVAILABLE
BROWSER_AVAILABLE
PRINTER_AVAILABLE
LOCAL_FILES_AVAILABLE
CERTIFICATE_AVAILABLE
```

O Task Orchestrator deve utilizar estas capacidades.

---

# 41. DEVICE SELECTION

Permitir:

```text
TARGET_DEVICE
ANY_COMPATIBLE_DEVICE
PREFERRED_DEVICE
```

---

# 42. FAILOVER

Se uma tarefa puder executar em vários dispositivos:

```text
Device A offline
→ Device B available
→ execute on Device B
```

Somente se política permitir.

---

# 43. WAKE-ON-LAN

Suportar opcionalmente:

```text
WAKE_ON_LAN
```

Mas nunca depender desta funcionalidade como arquitectura principal.

Activação apenas quando:

- hardware suportar;
- rede suportar;
- política permitir;
- segurança estiver configurada.

---

# 44. SCHEDULER

Permitir:

```text
RUN_AT
RUN_AFTER
RUN_BEFORE
RECURRING
ON_EVENT
```

Exemplo:

```text
Todos os dias às 07:00:
Employee Financeiro → preparar posição de tesouraria
```

---

# 45. TIME ZONES

Toda tarefa deve registar:

```text
timezone
```

Nunca assumir UTC quando o utilizador definiu outra zona.

---

# 46. OFFLINE-FIRST MOBILE

A aplicação móvel deve permitir criar comandos mesmo com ligação móvel instável.

Quando a ligação regressar:

```text
LOCAL_COMMAND_QUEUE
→ SYNC
→ REMOTE_COMMAND_GATEWAY
```

---

# 47. OBSERVABILIDADE

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
```

---

# 48. AUDIT TRAIL

Registar:

```text
user
command
employee
tenant
device
action
approval
execution
result
timestamp
source_channel
risk_level
evidence
```

---

# 49. IMMUTABLE EVIDENCE

Para operações relevantes guardar:

- hashes;
- timestamps;
- command version;
- approval evidence;
- execution receipt;
- before/after state;
- screenshots quando necessário;
- API response references;
- logs.

---

# 50. DATA MODEL

Criar ou adaptar:

```text
remote_commands
execution_tasks
task_dependencies
task_events
devices
device_capabilities
device_heartbeats
local_agents
job_queue
triggers
schedules
approvals
execution_receipts
notifications
audit_events
```

---

# 51. INTERNAL APIs

Implementar, adaptando à arquitectura existente:

```text
POST /remote-commands
GET /remote-commands/{id}

GET /tasks
GET /tasks/{id}
POST /tasks/{id}/cancel

GET /devices
GET /devices/{id}
GET /devices/{id}/status

GET /employees/{id}/execution-status

POST /approvals/{id}/approve
POST /approvals/{id}/reject

GET /execution-receipts/{id}

POST /triggers
GET /triggers

POST /schedules
GET /schedules
```

---

# 52. EVENT BUS

Publicar eventos:

```text
COMMAND_RECEIVED
COMMAND_AUTHORIZED
TASK_QUEUED
DEVICE_OFFLINE
DEVICE_ONLINE
TASK_STARTED
TASK_COMPLETED
TASK_FAILED
APPROVAL_REQUIRED
APPROVAL_GRANTED
APPROVAL_REJECTED
```

---

# 53. MULTI-TENANT

Todo objecto deve possuir:

```text
tenant_id
```

Garantir isolamento completo entre empresas.

---

# 54. INTEGRAÇÃO COM CPEAA

Antes de executar:

```text
Command
↓
CPEAA Policy Check
↓
Allowed?
```

Exemplo:

Uma política interna pode impedir que determinada operação seja executada fora do horário ou acima de determinado valor.

---

# 55. INTEGRAÇÃO COM CKRAIE-2026

Antes de executar uma tarefa regulada:

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

o sistema pode impedir execução dependendo do risco.

---

# 56. INTEGRAÇÃO COM KNOWLEDGE REGISTRY

Cada tarefa deve registar:

```text
knowledge_version_used
capability_version_used
policy_version_used
```

---

# 57. INTEGRAÇÃO COM EMPLOYEE CAPABILITY PROFILE

Antes de atribuir tarefa verificar:

```text
Does Employee have required capability?
```

Se não:

```text
CAPABILITY_NOT_AVAILABLE
```

---

# 58. CRITÉRIOS DE ACEITAÇÃO

Demonstrar:

1. envio de comando pelo telemóvel;
2. autenticação;
3. associação ao Employee correcto;
4. execução imediata de uma tarefa cloud;
5. criação de tarefa local;
6. dispositivo offline;
7. estado WAITING_FOR_DEVICE;
8. dispositivo online;
9. Local Agent conecta;
10. tarefa executada;
11. resultado devolvido;
12. utilizador notificado;
13. aprovação de tarefa HIGH;
14. dual approval de tarefa CRITICAL;
15. execução condicionada por trigger;
16. tarefa programada;
17. prevenção de duplicação;
18. retry controlado;
19. rollback quando aplicável;
20. Audit Trail completo.

---

# 59. TESTES OBRIGATÓRIOS

Testar:

```text
DEVICE_OFFLINE
DEVICE_ONLINE
NETWORK_INTERRUPTION
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
ROLLBACK
TENANT_ISOLATION
```

---

# 60. NÃO CRIAR UMA PLATAFORMA PARALELA

Integrar com:

- autenticação existente;
- utilizadores;
- tenants;
- Employees;
- Knowledge Registry;
- CPEAA;
- CKRAIE-2026;
- Audit Trail;
- notifications;
- scheduler;
- event bus;
- observabilidade.

Reutilizar componentes existentes sempre que adequado.

---

# RESULTADO FINAL

Entregar um módulo operacional em que o utilizador possa:

```text
ENVIAR COMANDO PELO TELEFONE
        ↓
AI EMPLOYEE RECEBE
        ↓
EXECUTA NA CLOUD
OU
AGUARDA DISPOSITIVO
        ↓
COMPUTADOR LIGA
        ↓
LOCAL AGENT CONECTA
        ↓
TAREFA EXECUTA
        ↓
RESULTADO FICA DISPONÍVEL
        ↓
UTILIZADOR É NOTIFICADO
```

O sistema deve conseguir responder, a qualquer momento:

> Quem enviou o comando?

> Qual Employee recebeu?

> A tarefa pode executar na cloud?

> Precisa de dispositivo local?

> Qual dispositivo?

> O dispositivo está online?

> A tarefa está em fila?

> Está aguardando aprovação?

> Foi executada?

> Qual versão de conhecimento foi utilizada?

> Que operações foram realizadas?

> Onde está o resultado?

> Existe evidência auditável?

O objectivo final é transformar os 500 AI Employees numa **força de trabalho digital remota, persistente, controlada e disponível mesmo quando os computadores locais estão desligados**.
