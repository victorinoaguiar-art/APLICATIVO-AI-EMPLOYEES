# PROMPT DE IMPLEMENTAÇÃO
## Central de Trabalho & Execução de Tarefas dos AI Employees

### Objectivo

Implementar na AI Employee Platform uma área operacional única onde utilizadores humanos autorizados possam:

- seleccionar um AI Employee já contratado;
- solicitar uma tarefa;
- anexar documentos e dados;
- definir prioridade e prazo;
- acompanhar a execução;
- responder a pedidos de esclarecimento;
- aprovar operações sensíveis;
- receber resultados;
- consultar evidências e histórico da execução.

Esta funcionalidade deve operar sobre as **instâncias privadas dos AI Employees já associadas à empresa**.

Não executar tarefas directamente sobre o Employee global do catálogo.

---

# 1. PRINCÍPIO FUNDAMENTAL

O fluxo operacional deve ser:

```text
Empresa
→ Workforce
→ AI Employee Instance
→ Solicitar Tarefa
→ Validar Pedido
→ Criar Work Order
→ Executar
→ Aprovação Humana, quando necessária
→ Resultado
→ Evidência
→ Histórico
```

Exemplo:

```text
MARVINE, LDA
CMP-486564
TNT-962837
        ↓
AEI-000001
Contabilista Sénior
        ↓
Nova Tarefa
        ↓
TASK-000001
        ↓
Execução
        ↓
Resultado
```

---

# 2. NÃO UTILIZAR O EMPLOYEE GLOBAL

Proibido executar directamente:

```text
EMP-042 → tarefa
```

O objecto:

```text
EMP-042
```

representa apenas o Employee global do catálogo.

A execução deve ocorrer através da instância:

```text
AEI-000001
```

associada a:

```text
company_id
tenant_id
```

Portanto:

```text
EMP-042
   ↓ contratação
AEI-000001
   ↓
TASK-000001
```

---

# 3. CRIAR OU REUTILIZAR ÁREA OPERACIONAL

Antes de desenvolver nova funcionalidade, pesquisar no código existente por módulos equivalentes a:

- Tasks
- Jobs
- Work Orders
- Commands
- Execution
- Employee Console
- Operations
- Remote Command
- Offline Queue
- Deferred Execution
- Work Contracts

Se já existir estrutura compatível, **REUTILIZAR e integrar**.

Não criar sistema paralelo desnecessariamente.

Se não existir interface operacional adequada, criar no menu lateral:

# Trabalho & Tarefas

ou:

# Central de Trabalho IA

---

# 4. ACESSO A PARTIR DO WORKFORCE

Na página:

```text
Gerir Workforce
```

cada AI Employee deve possuir:

```text
[ Abrir Employee ]
[ Solicitar Tarefa ]
```

Exemplo:

```text
EMP-042 — Contabilista Sénior
AEI-000001
ACTIVE

[ Abrir Employee ]
[ + Solicitar Tarefa ]
```

---

# 5. ACESSO DENTRO DO EMPLOYEE

Na página individual da instância, adicionar separadores:

```text
Visão Geral
Tarefas
Permissões
Integrações
Conhecimento
Readiness
Actividade
Auditoria
```

E um botão principal:

```text
[ + Nova Tarefa ]
```

---

# 6. CENTRAL DE TRABALHO GLOBAL DA EMPRESA

Criar também uma visão consolidada:

```text
Trabalho & Tarefas
```

onde seja possível visualizar tarefas de todos os Employees da empresa activa.

Exemplo:

```text
Empresa:
MARVINE, LDA

Tarefas:
- Em execução
- Em fila
- Aguardando aprovação
- Concluídas
- Com erro
- Canceladas

[ + Nova Tarefa ]
```

---

# 7. FORMULÁRIO “NOVA TAREFA”

Ao clicar em:

```text
+ Nova Tarefa
```

abrir:

# SOLICITAR TAREFA

## Empresa

Preenchida automaticamente:

```text
MARVINE, LDA
CMP-486564
TNT-962837
```

## AI Employee

Se o pedido começou dentro do Employee:

```text
AEI-000001
Contabilista Sénior
```

Se começou pela Central de Trabalho:

```text
[ Seleccionar AI Employee ]
```

Mostrar apenas Employees:

- pertencentes à empresa activa;
- pertencentes ao tenant activo;
- com estado operacional permitido.

---

# 8. CAMPO PRINCIPAL DE PEDIDO

Criar campo:

## O que pretende que o Employee faça?

Campo grande de texto livre.

Exemplo:

```text
Faça a reconciliação bancária do mês de Agosto de 2026 utilizando o extracto bancário e o razão contabilístico anexados. Identifique diferenças e produza relatório em Excel e PDF.
```

Permitir instruções detalhadas.

---

# 9. ANEXOS

Permitir anexar:

- PDF;
- Excel;
- Word;
- CSV;
- imagens;
- ZIP;
- TXT;
- JSON;
- outros formatos autorizados.

Mostrar:

```text
[ + Adicionar Ficheiros ]
```

Cada ficheiro deve ser ligado à tarefa e ao tenant correcto.

---

# 10. FONTES DE DADOS

Permitir seleccionar fontes já autorizadas da empresa:

```text
Google Drive
OneDrive
Primavera
Excel
Banco
Email
SQL Server
PostgreSQL
Portal AGT
Outros conectores
```

Exemplo:

```text
Fontes autorizadas para esta tarefa:

☑ Google Drive
☑ Primavera
☑ Banco - Read Only
☐ Email
```

O Employee só pode utilizar fontes para as quais a sua instância possua permissão.

---

# 11. PRIORIDADE

Adicionar:

```text
Prioridade:

LOW
NORMAL
HIGH
URGENT
```

Por defeito:

```text
NORMAL
```

---

# 12. PRAZO

Adicionar:

```text
Prazo:

- Sem prazo
- Hoje
- Amanhã
- Data/Hora específica
```

Guardar:

```text
due_at
```

---

# 13. RESULTADO DESEJADO

Permitir seleccionar:

```text
Texto
PDF
DOCX
XLSX
PPTX
JSON
CSV
```

Permitir múltiplos formatos.

Exemplo:

```text
Resultado:
☑ Excel
☑ PDF
```

---

# 14. NÍVEL DE AUTONOMIA DA TAREFA

Mostrar claramente como a tarefa será executada.

Exemplo:

```text
Modo:

○ Apenas analisar
○ Preparar e aguardar aprovação
○ Executar dentro das permissões autorizadas
```

Não permitir que uma tarefa ultrapasse:

```text
autonomy_level da instância
```

ou:

```text
permissions da instância
```

---

# 15. APROVAÇÃO HUMANA

Permitir identificar operações que exigem HITL.

Exemplos:

- envio de email externo;
- submissão fiscal;
- pagamento;
- eliminação de documento;
- alteração de ERP;
- assinatura;
- comunicação formal;
- transacção bancária.

Se a tarefa atingir uma dessas operações:

```text
status = WAITING_APPROVAL
```

Mostrar:

```text
Employee solicita autorização:

“Submeter declaração no Portal AGT?”

[ Aprovar ]
[ Rejeitar ]
[ Solicitar Alteração ]
```

---

# 16. BOTÃO DE ENVIO

No formulário mostrar:

```text
[ Guardar Rascunho ]
[ Cancelar ]
[ Enviar Tarefa ]
```

Ao enviar:

criar:

```text
TASK_ID
```

Exemplo:

```text
TASK-000001
```

---

# 17. ENTIDADE TASK / WORK ORDER

Criar ou reutilizar entidade equivalente a:

```text
ai_employee_tasks
```

Campos mínimos:

```text
task_id

company_id
tenant_id

instance_id
catalog_employee_id

requester_user_id

title
instruction

priority
due_at

status

input_files
data_sources

requested_output_formats

autonomy_mode

created_at
submitted_at
started_at
completed_at

result
error
```

---

# 18. CONTEXTO OBRIGATÓRIO

Toda tarefa deve possuir:

```text
task_id
company_id
tenant_id
instance_id
```

Nenhuma execução deve começar sem estes quatro elementos.

---

# 19. ESTADOS DA TAREFA

Implementar lifecycle:

```text
DRAFT
↓
SUBMITTED
↓
VALIDATING
↓
QUEUED
↓
RUNNING
↓
COMPLETED
```

Estados adicionais:

```text
WAITING_USER_INPUT
WAITING_APPROVAL
PAUSED
BLOCKED
FAILED
CANCELLED
```

---

# 20. VALIDAÇÃO PRÉ-EXECUÇÃO

Antes de colocar em fila verificar:

```text
company exists

tenant exists

instance exists

instance belongs to company

instance belongs to tenant

instance status = ACTIVE

requester has permission

task is compatible with employee capabilities

required connectors available

required permissions available

subscription valid

security policy valid
```

---

# 21. EMPLOYEE NÃO ACTIVO

Se:

```text
instance.status != ACTIVE
```

bloquear execução.

Mostrar:

```text
EMPLOYEE_NOT_ACTIVE
```

Mensagem:

```text
O AI Employee ainda não está activo para executar tarefas.
```

---

# 22. TASK ROUTING

A tarefa deve ser enviada exactamente para:

```text
instance_id
```

e nunca apenas para:

```text
catalog_employee_id
```

Exemplo correcto:

```text
TASK-000001
→ AEI-000001
→ CMP-486564
→ TNT-962837
```

---

# 23. EXECUTION ID

Cada tentativa de execução deve criar:

```text
EXECUTION_ID
```

Exemplo:

```text
EXEC-TASK-000001-001
```

Se houver retry:

```text
EXEC-TASK-000001-002
```

Não sobrescrever a execução anterior.

---

# 24. PAINEL DA TAREFA

Ao abrir uma tarefa mostrar:

```text
TASK-000001

Employee:
Contabilista Sénior
AEI-000001

Empresa:
MARVINE, LDA

Solicitado por:
Victorino Aguiar

Estado:
RUNNING

Prioridade:
NORMAL

Criada:
...

Iniciada:
...

Prazo:
...
```

---

# 25. TIMELINE

Mostrar timeline:

```text
22:10 — Tarefa criada
22:11 — Validação concluída
22:11 — Enviada para fila
22:12 — Employee iniciou execução
22:14 — Ficheiros analisados
22:16 — Aguardando aprovação
22:18 — Aprovação concedida
22:20 — Execução concluída
```

---

# 26. OUTPUT / RESULTADO

Quando concluída, apresentar:

# Resultado da Tarefa

```text
Resumo:
...

Ficheiros produzidos:

Relatorio_Reconciliacao.pdf
Reconciliacao_Agosto.xlsx

[ Visualizar ]
[ Descarregar ]
[ Enviar ]
[ Guardar no Drive ]
```

---

# 27. EVIDÊNCIA DA EXECUÇÃO

Adicionar área:

# Evidência

Mostrar:

```text
task_id
execution_id
instance_id
company_id
tenant_id

started_at
completed_at

inputs used
sources accessed
connectors used
rules applied

approvals
outputs
errors
audit events
```

---

# 28. CHAT DA TAREFA

Cada tarefa deve permitir diálogo contextual.

Exemplo:

```text
Utilizador:
“Use apenas o extracto do Banco BAI.”

Employee:
“Foi detectada uma diferença de 175.000 AOA. Pretende que eu investigue os lançamentos?”

Utilizador:
“Sim.”
```

Toda mensagem deve permanecer associada:

```text
task_id
```

Não criar conversas soltas sem contexto operacional.

---

# 29. PEDIDO DE ESCLARECIMENTO

Se o Employee não possuir informação suficiente:

```text
status = WAITING_USER_INPUT
```

Mostrar:

```text
Preciso do extracto bancário correspondente ao período de 01/08/2026 a 31/08/2026.
```

Depois da resposta:

```text
WAITING_USER_INPUT
→ QUEUED
→ RUNNING
```

---

# 30. CANCELAMENTO

Enquanto permitido:

```text
[ Cancelar Tarefa ]
```

Alterar:

```text
status = CANCELLED
```

Registar:

```text
cancelled_by
cancelled_at
reason
```

---

# 31. RETRY

Em caso de falha:

```text
status = FAILED
```

Mostrar:

```text
[ Tentar Novamente ]
```

Cada retry cria novo `execution_id`.

Não sobrescrever evidência anterior.

---

# 32. TAREFAS RECORRENTES

Preparar arquitectura para:

- diária;
- semanal;
- mensal;
- data específica;
- condição futura.

Exemplo:

```text
Todos os dias úteis às 17h faça reconciliação de caixa.
```

Criar schedule associado à empresa e Employee.

Se já existir motor de automações, reutilizar.

---

# 33. REMOTE COMMAND

Integrar, quando existente, com:

```text
Remote Command
Offline Queue
Deferred Execution
```

Exemplo:

Comando enviado pelo telemóvel:

```text
Prepare o relatório financeiro de hoje.
```

Mesmo que o computador/local connector esteja offline:

```text
task status = QUEUED_OFFLINE
```

Quando conexão regressar:

```text
QUEUED_OFFLINE
→ QUEUED
→ RUNNING
```

---

# 34. OFFLINE QUEUE

Mostrar estado:

```text
Aguardando conexão
```

Não declarar:

```text
COMPLETED
```

enquanto a execução real não tiver ocorrido.

---

# 35. NOTIFICAÇÕES

Notificar utilizador quando:

- tarefa iniciar;
- Employee pedir dados;
- Employee pedir aprovação;
- tarefa concluir;
- tarefa falhar;
- prazo estiver em risco.

---

# 36. DASHBOARD OPERACIONAL

Na Central de Trabalho mostrar:

```text
Total de Tarefas

Em execução

Na fila

Aguardando aprovação

Aguardando utilizador

Concluídas

Falhadas
```

---

# 37. FILTROS

Permitir filtrar por:

```text
Employee
Departamento
Estado
Prioridade
Solicitante
Data
Empresa
Tipo de tarefa
```

---

# 38. PESQUISA

Pesquisar por:

```text
TASK-ID

Employee

palavra-chave

ficheiro

resultado

solicitante
```

---

# 39. HISTÓRICO DO EMPLOYEE

Dentro da instância:

```text
AEI-000001
```

mostrar:

```text
Tarefas executadas
Tarefas activas
Tarefas falhadas
Taxa de sucesso
Tempo médio
Aprovações
Outputs produzidos
```

---

# 40. ISOLAMENTO POR TENANT

Uma tarefa de:

```text
TNT-962837
```

não pode utilizar:

```text
documentos
memória
credenciais
conectores
políticas
logs
```

de outro tenant.

Implementar no backend.

---

# 41. SEGURANÇA

Nunca confiar apenas no `company_id` recebido do frontend.

Validar:

```text
authenticated user
→ company membership
→ tenant access
→ instance access
→ task permission
```

---

# 42. PERMISSÕES HUMANAS

Exemplos:

```text
CREATE_TASK
VIEW_TASK
CANCEL_TASK
APPROVE_TASK
VIEW_EXECUTION_EVIDENCE
DOWNLOAD_OUTPUT
RETRY_TASK
```

Aplicar IAM existente.

---

# 43. PERMISSÕES DO EMPLOYEE

Antes da execução:

```text
task requested action
```

deve ser comparada com:

```text
employee permissions
employee autonomy
connector permissions
risk policy
```

Se ultrapassar:

```text
TASK_BLOCKED_BY_POLICY
```

---

# 44. AUDITORIA

Registar eventos:

```text
task_created
task_submitted
task_validated
task_queued
task_started
task_user_input_requested
task_approval_requested
task_approved
task_rejected
task_completed
task_failed
task_cancelled
task_retried
```

Cada evento:

```text
event_id
task_id
execution_id
company_id
tenant_id
instance_id
actor
timestamp
result
```

---

# 45. INTERFACE RECOMENDADA

Menu lateral:

```text
Trabalho & Tarefas
```

Página:

# CENTRAL DE TRABALHO IA

```text
Empresa:
MARVINE, LDA

[ + Nova Tarefa ]

--------------------------------

Em Execução        3
Na Fila            2
Aprovação          1
Concluídas        28
Falhadas           1

--------------------------------

TASK-000125
Contabilista Sénior
Reconciliação Bancária Agosto
RUNNING

TASK-000124
Especialista Fiscal
Preparar IVA Agosto
WAITING_APPROVAL

TASK-000123
Gestor Financeiro
Fluxo de Caixa
COMPLETED
```

---

# 46. INTERFACE DO EMPLOYEE

Exemplo:

```text
Contabilista Sénior
AEI-000001
ACTIVE

[ + Solicitar Tarefa ]

Tarefas Activas: 2
Concluídas: 35
Falhadas: 1
```

Separadores:

```text
Visão Geral
Tarefas
Permissões
Integrações
Conhecimento
Readiness
Auditoria
```

---

# 47. CASO DE TESTE MARVINE

Utilizar:

```text
MARVINE, LDA

COMPANY_ID:
CMP-486564

TENANT_ID:
TNT-962837
```

Depois seleccionar uma instância real:

```text
AEI-XXXXXX
```

Criar tarefa:

```text
Produza um relatório simples de apresentação da empresa MARVINE e devolva em PDF.
```

Validar fluxo completo.

---

# 48. TESTES OBRIGATÓRIOS

## TEST-01

Criar tarefa para Employee `ACTIVE`.

Esperado:

```text
TASK_CREATED
```

## TEST-02

Criar tarefa para Employee `PROVISIONING`.

Esperado:

```text
EMPLOYEE_NOT_ACTIVE
```

## TEST-03

Tarefa com documento.

Esperado:

```text
FILE_BOUND_TO_TASK
```

## TEST-04

Tarefa que utiliza conector autorizado.

Esperado:

```text
CONNECTOR_ACCESS_ALLOWED
```

## TEST-05

Tarefa tenta utilizar conector não autorizado.

Esperado:

```text
CONNECTOR_ACCESS_DENIED
```

## TEST-06

Tarefa necessita aprovação.

Esperado:

```text
WAITING_APPROVAL
```

## TEST-07

Aprovar.

Esperado:

```text
RUNNING
```

## TEST-08

Concluir.

Esperado:

```text
COMPLETED
```

## TEST-09

Cross-tenant.

Esperado:

```text
DENIED_CROSS_TENANT
```

## TEST-10

Falha e retry.

Esperado:

```text
NEW_EXECUTION_ID
```

---

# 49. NÃO CRIAR RESULTADOS FICTÍCIOS

Não aceitar:

```text
status = COMPLETED
```

sem execução.

Não criar outputs simulados apenas para fazer o fluxo passar.

Guardar evidência real:

```text
input
execution
output
timestamps
logs
approvals
errors
```

---

# 50. REUTILIZAÇÃO DA ARQUITECTURA EXISTENTE

Antes de implementar:

1. procurar Task Engine existente;
2. procurar Command Engine;
3. procurar Work Contract;
4. procurar Remote Command;
5. procurar Offline Queue;
6. procurar Deferred Execution;
7. procurar Execution Logs;
8. procurar Approval Engine;
9. procurar Document Generation;
10. procurar Audit Engine.

Integrar primeiro.

Criar novo componente apenas quando não houver equivalente.

---

# 51. CRITÉRIOS DE ACEITAÇÃO

A funcionalidade só pode ser considerada concluída quando:

```text
✓ utilizador consegue seleccionar Employee associado à empresa;

✓ consegue escrever um pedido real;

✓ consegue anexar ficheiros;

✓ consegue escolher fontes autorizadas;

✓ é criado TASK_ID real;

✓ a tarefa fica ligada a company_id;

✓ fica ligada a tenant_id;

✓ fica ligada a instance_id;

✓ Employee errado não recebe a tarefa;

✓ Employee inactivo não executa;

✓ permissões são verificadas;

✓ aprovações funcionam;

✓ execução possui EXECUTION_ID;

✓ resultado fica associado à tarefa;

✓ histórico é preservado;

✓ cross-tenant é bloqueado;

✓ auditoria é persistida.
```

---

# 52. FLUXO FINAL

```text
EMPRESA ACTIVA
      ↓
WORKFORCE
      ↓
AI EMPLOYEE INSTANCE
      ↓
SOLICITAR TAREFA
      ↓
TASK_ID
      ↓
VALIDATE
      ↓
QUEUE
      ↓
EXECUTE
      ↓
HITL, SE NECESSÁRIO
      ↓
OUTPUT
      ↓
EVIDENCE
      ↓
COMPLETED
```

---

# 53. REGRA FINAL

O AI Employee contratado só produz valor operacional quando existe uma forma simples, segura e auditável de lhe atribuir trabalho.

A relação correcta deve ser:

```text
COMPANY
→ TENANT
→ AI EMPLOYEE INSTANCE
→ TASK
→ EXECUTION
→ OUTPUT
→ AUDIT
```

Nunca:

```text
USER
→ EMPLOYEE GLOBAL
→ RESPOSTA SEM CONTEXTO
```

O sistema deve transformar cada pedido do utilizador numa tarefa formal, rastreável e isolada dentro da empresa.
