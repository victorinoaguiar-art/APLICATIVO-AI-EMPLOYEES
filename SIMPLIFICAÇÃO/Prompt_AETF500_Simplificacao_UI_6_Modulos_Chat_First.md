# PROMPT MESTRE DE IMPLEMENTAÇÃO
## AETF-500 Simplified Product Experience, 6-Module Frontend, Chat-First Workbench & Knowledge Self-Service
### Redução radical da complexidade visível sem remover os motores técnicos, de segurança, conhecimento, qualidade, certificação, billing e auditoria

---

# 0. PAPEL DA IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Arquitecto SaaS multi-tenant;
- Arquitecto de Sistemas Multiagente;
- Product Designer sénior;
- UX Architect;
- UX Researcher B2B;
- Engenheiro Frontend;
- Engenheiro Backend;
- Engenheiro de Dados;
- Engenheiro de Integrações;
- Engenheiro de Segurança;
- Engenheiro de Reliability;
- Engenheiro QA/Test Automation;
- Especialista em Knowledge Systems/RAG;
- Especialista em LLM Runtime e Model Routing;
- Especialista em Human-in-the-Loop;
- Especialista em Billing/Metering;
- Especialista em Audit, Lineage e Evidence;
- Especialista em Change Management e migração de sistemas.

A missão é **simplificar profundamente a experiência de utilização da AI Employee Platform sem eliminar as capacidades internas já especificadas nos 33 prompts**.

A plataforma deve evoluir de uma estrutura com muitos módulos técnicos expostos para uma experiência centrada no cliente, com apenas seis módulos principais visíveis.

---

# 1. PROBLEMA A RESOLVER

A arquitectura AETF-500 acumulou motores e áreas como:

```text
Runtime
Model Router
MNCA
ORDKS
Knowledge Center
Knowledge Necessity
Competency Passport
EREMS
CAQRS
EMVTCS
OTCTEC
Enterprise Pilot
Evidence Gate
Remote Command
Document Service
Regulatory Watch
Billing
Omnichannel
Audit
...
```

Esses componentes têm valor técnico.

O problema é **expor cada engine como módulo de navegação**, criando uma aplicação difícil de compreender, ensinar e operar.

O cliente não deve precisar saber:

```text
qual engine está a trabalhar
qual pipeline está activo
qual teste técnico correu
qual registry foi consultado
qual serviço interno seleccionou chunks
```

O cliente precisa responder apenas a:

```text
1. Quem são os meus AI Employees?
2. O que quero que façam?
3. Que informação ou conhecimento devo fornecer?
4. O trabalho está pronto?
5. Preciso aprovar alguma coisa?
6. Quanto estou a usar/pagar?
```

---

# 2. DECISÃO DE PRODUTO NÃO NEGOCIÁVEL

Adoptar:

```text
COMPLEXIDADE NO BACKEND
+
SIMPLICIDADE NO FRONTEND
```

e:

```text
1 ACÇÃO DO UTILIZADOR
→ N SERVIÇOS INTERNOS AUTOMÁTICOS
```

Exemplo:

```text
[ Adicionar Conhecimento ]
```

não deve obrigar o utilizador a visitar:

```text
MNCA
ORDKS
Knowledge Mapping
Knowledge Necessity
Impact Analysis
Retest
Publication
```

O backend executa essas operações automaticamente.

---

# 3. NOVA NAVEGAÇÃO PRINCIPAL

O frontend normal deve apresentar apenas:

```text
1. INÍCIO
2. AI EMPLOYEES
3. TRABALHO
4. CONHECIMENTO
5. COMUNICAÇÕES & INTEGRAÇÕES
6. EMPRESA & ADMINISTRAÇÃO
```

Não adicionar outro módulo principal sem aprovação arquitectural formal.

---

# 4. MÓDULO 1 - INÍCIO

Objectivo:

Dar ao utilizador a visão do que precisa de atenção **agora**.

Deve incluir:

```text
Resumo do dia
Employees activos
Tarefas em andamento
Tarefas concluídas
Aprovações pendentes
Problemas de conhecimento
Problemas de integração
Alertas críticos
Uso/custo resumido
Briefing executivo
```

Botões principais:

```text
[ Novo Pedido ]
[ Abrir AI Employee ]
[ Adicionar Conhecimento ]
[ Ver Aprovações ]
[ Ver Alertas ]
```

Não expor engine names.

---

# 5. MÓDULO 2 - AI EMPLOYEES

Agrupar aqui:

```text
Marketplace
Employees contratados
Employee Instances
Equipas
Departamentos
Role summary
Competências resumidas
Readiness resumido
Fiabilidade resumida
Configuração do Employee
```

Subáreas visíveis:

```text
Catálogo
Meus Employees
Equipas
```

Um Employee deve apresentar apenas cinco abas normais:

```text
1. Resumo
2. Trabalho
3. Conhecimento
4. Configuração
5. Histórico
```

Não apresentar por defeito abas separadas de:

```text
MNCA
EREMS
Certification
Model Router
Runtime
Evidence Gate
```

Esses dados podem aparecer dentro de:

```text
Resumo
Configuração
Histórico
```

ou no modo avançado.

---

# 6. MÓDULO 3 - TRABALHO

Este deve tornar-se o **centro operacional do produto**.

Subáreas:

```text
Chat
Tarefas
Resultados
Aprovações
```

O Chat com o AI Employee deve ser o principal ponto de entrada.

Fluxo:

```text
UTILIZADOR
↓
SELECCIONA EMPLOYEE
↓
ESCREVE PEDIDO
↓
EMPLOYEE PEDE DADOS EM FALTA
↓
UTILIZADOR ANEXA / AUTORIZA FONTES
↓
BACKEND CRIA OU ACTUALIZA TASK
↓
EXECUÇÃO
↓
RESULTADO
↓
APROVAÇÃO SE NECESSÁRIA
↓
ENTREGA
↓
AUDIT / RECEIPT
```

---

# 7. CHAT-FIRST WORKBENCH

Criar um workspace persistente:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ AI Employee | Estado | Empresa | Conversa | Nova conversa          │
├───────────────┬────────────────────────────────┬────────────────────┤
│ Conversas     │ Chat                           │ Contexto            │
│ Employees     │ mensagens                     │ Task                │
│ Favoritos     │ anexos                        │ ficheiros           │
│               │ cards de execução             │ fontes              │
│               │ approvals                     │ conhecimento        │
│               │ outputs                       │ approval            │
│               │                               │ output/evidence     │
├───────────────┴────────────────────────────────┴────────────────────┤
│ + Anexar | Voz | Fonte | Prazo | prioridade | [ Enviar ]           │
└─────────────────────────────────────────────────────────────────────┘
```

O utilizador deve poder pedir:

```text
"Prepare a reconciliação bancária de Agosto."
```

O Employee pode responder:

```text
"Preciso do extracto bancário e do balancete."
```

com acções inline:

```text
[ Anexar Ficheiros ]
[ Procurar no Drive ]
[ Usar Primavera ]
```

Quando os inputs estiverem completos:

```text
[ Executar ]
```

Ao concluir:

```text
[ Ver Resultado ]
[ Gerar Excel ]
[ Gerar PDF ]
[ Pedir Revisão ]
[ Aprovar ]
```

---

# 8. REGRA DE CRIAÇÃO DE TASK A PARTIR DO CHAT

Nem toda mensagem precisa criar uma task.

Mas todo **pedido operacional executável** deve possuir:

```text
task_id
company_id
tenant_id
employee_instance_id
conversation_id
```

Implementar:

```text
Conversation
→ Intent Detection
→ Work Intent?
   NO → normal conversation
   YES → create/update Task
```

Nunca executar trabalho material externo sem `task_id`.

---

# 9. MÓDULO 4 - CONHECIMENTO

A interface deve ser radicalmente simples.

Mostrar apenas:

```text
[ Adicionar Conhecimento ]
[ Biblioteca ]
[ Actualizações ]
[ Problemas ]
```

Tipos de entrada:

```text
Ficheiro
URL/Fonte
Procedimento
Política
Template
Manual
Fonte Oficial
Conteúdo Interno
Nova Versão
```

---

# 10. KNOWLEDGE LIFECYCLE ENGINE

No backend, unificar o pipeline sob:

```text
KnowledgeLifecycleEngine
```

Este serviço coordena, sem necessariamente substituir fisicamente os motores já existentes:

```text
Upload
Validation
Source Registration
Hash
Classification
Extraction
Chunking
Knowledge Objects
Competency Mapping
Employee Mapping
Task Mapping
Native Capability Comparison
Novelty/Overlap
Conflict Detection
Source Criticality
Knowledge Necessity
Impact Analysis
Retest
Review
Publication
Runtime Availability
Revocation
Audit
```

O utilizador não precisa navegar entre esses motores.

---

# 11. RESULTADO DO UPLOAD DE CONHECIMENTO

Após upload, mostrar uma única ficha simples:

```text
Fonte:
Manual Primavera v10

Estado:
VALIDADO

Tipo:
Manual técnico

Employees afectados:
37

Conhecimento novo:
Relevante

Uso:
Disponível quando necessário

Problemas:
0
```

Botões:

```text
[ Ver Detalhes ]
[ Nova Versão ]
[ Revogar ]
```

Apenas em casos excepcionais mostrar:

```text
[ Resolver Conflito ]
[ Aprovar Publicação ]
[ Fornecer Fonte Actual ]
```

---

# 12. NÃO CONFUNDIR DISPONIBILIDADE COM INJECÇÃO

Manter:

```text
PUBLISHED
!=
ALWAYS_INJECTED
```

O Knowledge Necessity Engine continua activo no backend.

Regra:

```text
MODEL_NATIVE_SUFFICIENT
→ não injectar fonte desnecessária

REINFORCEMENT_REQUIRED
→ injectar apenas os Knowledge Objects necessários

SOURCE_REQUIRED
→ fonte verificada obrigatória

CLIENT_SOURCE_REQUIRED
→ fonte do tenant obrigatória
```

---

# 13. MÓDULO 5 - COMUNICAÇÕES & INTEGRAÇÕES

Agrupar:

```text
WhatsApp
Email
Redes Sociais
Drive
OneDrive
Primavera
Excel
Bancos
APIs
Dispositivos locais
```

Subáreas normais:

```text
Comunicações
Integrações
```

Não mostrar:

```text
UTCEG
RCODE
Omnichannel Router
Channel Capability Registry
```

como módulos separados.

São serviços internos.

---

# 14. COMUNICAÇÕES

Uma única Inbox deve poder filtrar:

```text
Todos
WhatsApp
Email
Social
```

Cada evento pode gerar:

```text
conversa
task
lead
approval
output
```

preservando tenant isolation.

---

# 15. INTEGRAÇÕES

Mostrar cards:

```text
Google Drive     Ligado
OneDrive         Não ligado
Primavera v10    Ligado
Excel            Ligado
Banco             Leitura apenas
WhatsApp          Ligado
OpenAI            Ligado
Gemini            Não ligado
Claude            Ligado
```

Acções:

```text
[ Ligar ]
[ Configurar ]
[ Testar ]
[ Revogar ]
```

As chaves de API nunca devem ficar no frontend.

Usar:

```text
Frontend
↓
Backend
↓
Secrets Vault
↓
Provider
```

---

# 16. MÓDULO 6 - EMPRESA & ADMINISTRAÇÃO

Agrupar:

```text
Dados da empresa
Utilizadores
Departamentos
Permissões
Subscrição
Uso
Facturação
Custos
Notificações
Segurança
Auditoria
Configuração avançada
```

Subáreas sugeridas:

```text
Empresa
Utilizadores & Permissões
Plano & Facturação
Segurança & Auditoria
Configurações
```

---

# 17. REDUZIR ESTADOS VISÍVEIS DO EMPLOYEE

Preservar state machine técnica internamente.

Frontend normal deve apresentar apenas:

```text
CONFIGURAÇÃO
EM TESTE
PRONTO
ACTIVO
ATENÇÃO
```

Mapeamento conceptual:

```text
REGISTERED / SPECIFIED / IMPLEMENTED /
KNOWLEDGE_PREPARED / INTEGRATION_MAPPED /
TESTS_DEFINED / STRUCTURALLY_READY
→ CONFIGURAÇÃO

READY_FOR_TEST / IN_TESTING / CONNECTED /
FUNCTIONAL_TESTED / E2E_TESTED /
SHADOW_MODE / SHADOW_VALIDATED
→ EM TESTE

HUMAN_BENCHMARKED / SECURITY_VALIDATED /
PLATFORM_CERTIFIED
→ PRONTO

ORGANIZATION_READY / ACTIVE
→ ACTIVO

WAITING_DATA / WAITING_CONNECTION /
WAITING_APPROVAL / NEEDS_IMPROVEMENT /
BLOCKED / DEGRADED / SUSPENDED / PAUSED
→ ATENÇÃO
```

Guardar também:

```text
attention_reason
internal_status
```

---

# 18. NÃO ELIMINAR MOTORES INTERNOS

Não apagar:

```text
Runtime
Model Router
MNCA
ORDKS
Knowledge Necessity
Competency Passport
EREMS
CAQRS
EMVTCS
OTCTEC
Document Generation
Evidence Gate
Regulatory Watch
Remote Queue
Billing Engine
Audit
```

Eles tornam-se:

```text
INTERNAL_PLATFORM_SERVICES
```

e não módulos principais de navegação.

---

# 19. MODO AVANÇADO

Criar:

```text
Modo Avançado
```

apenas para:

```text
Platform Admin
Technical Admin
Auditor autorizado
Support Engineer
```

Pode mostrar:

```text
Runtime
Model routing
MNCA baselines
Knowledge decisions
Reliability
Certification evidence
Connector diagnostics
Raw receipts
Prompt Registry
```

Não expor ao utilizador comum.

---

# 20. NOVA ESTRUTURA DE ECRÃS

Meta:

```text
6 módulos principais
15-18 ecrãs principais
1 Chatbox central
1 Knowledge Center
1 Approval experience integrada
```

Ecrãs canónicos:

```text
HOME-01   Início

EMP-01    Catálogo
EMP-02    Meus AI Employees
EMP-03    Detalhe do Employee
EMP-04    Equipas

WORK-01   Chat com Employee
WORK-02   Tarefas
WORK-03   Detalhe da Tarefa / Resultado

KNOW-01   Knowledge Center
KNOW-02   Detalhe da Fonte

COMM-01   Inbox de Comunicações
COMM-02   Integrações

ADMIN-01  Empresa
ADMIN-02  Utilizadores & Permissões
ADMIN-03  Plano & Facturação
ADMIN-04  Segurança & Auditoria
ADMIN-05  Configurações
```

Total:

```text
16 ecrãs principais
```

---

# 21. NOVA SIDEBAR

Mostrar:

```text
Início
AI Employees
Trabalho
Conhecimento
Comunicações & Integrações
Empresa & Administração
```

Rodapé:

```text
Ajuda
Configurações
Perfil
```

---

# 22. ATALHOS GLOBAIS

Disponibilizar em qualquer ecrã:

```text
[ + Novo Pedido ]
[ + Adicionar Conhecimento ]
[ + Contratar Employee ]
```

e:

```text
Command Palette
```

---

# 23. TABELAS DE DADOS - PRINCÍPIO

Não manter dezenas de tabelas duplicadas apenas porque cada prompt definiu uma entidade.

Antes de criar novas tabelas:

```text
AUDIT EXISTING SCHEMA
↓
IDENTIFY DUPLICATES
↓
CANONICALIZE
↓
MIGRATE / VIEW / ADAPTER
```

Não fazer destructive migration sem plano de rollback.

---

# 24. TABELAS CANÓNICAS - ORGANIZAÇÃO

Manter/criar:

```text
organizations
tenants
users
organization_memberships
departments
```

---

# 25. TABELAS CANÓNICAS - WORKFORCE

```text
role_catalog
employee_instances
employee_assignments
employee_runtime_profiles
employee_status_events
```

---

# 26. TABELAS CANÓNICAS - CHAT & WORK

```text
conversations
conversation_participants
messages
message_attachments

tasks
task_files
task_events
task_outputs

approvals
```

---

# 27. TABELAS CANÓNICAS - KNOWLEDGE

```text
knowledge_sources
knowledge_source_versions
knowledge_objects
knowledge_bindings
knowledge_runtime_decisions
knowledge_issues
```

Não apagar tabelas técnicas existentes se forem necessárias.

Criar adapters/views para convergir para esta API canónica.

---

# 28. TABELAS CANÓNICAS - INTEGRAÇÕES

```text
connector_catalog
connector_accounts
connector_permissions
channel_connections
remote_commands
```

---

# 29. TABELAS CANÓNICAS - COMERCIAL

```text
plans
subscriptions
usage_events
invoices
payments
```

Entidades financeiras auxiliares podem permanecer internamente quando necessárias:

```text
billing_ledger
usage_ledger
cost_events
revenue_snapshots
```

mas não devem criar módulos visíveis.

---

# 30. TABELAS CANÓNICAS - GOVERNANCE

```text
audit_events
evidence_receipts
notifications
user_preferences
security_policies
```

---

# 31. REGRA DE IDENTIDADE

Todas as entidades tenant-owned devem carregar:

```text
company_id
tenant_id
```

conforme aplicável.

Hard rule:

```text
TENANT A
→ TENANT B DATA
= DENIED
```

---

# 32. ROLE CATALOG

O catálogo dos 500 Employees permanece global.

Tabela:

```text
role_catalog
```

Campos mínimos:

```text
role_id
role_key
display_name
department_code
area_code
mission
summary
risk_class
default_autonomy
availability_status
commercial_status
role_pack_version
created_at
updated_at
```

Não duplicar Role Pack por empresa.

---

# 33. EMPLOYEE INSTANCE

Tabela:

```text
employee_instances
```

Campos mínimos:

```text
instance_id
role_id
company_id
tenant_id
display_name
department_id
supervisor_user_id
plan_id
client_status
internal_status
attention_reason
autonomy_level
risk_level
primary_model_profile_id
status
activated_at
paused_at
created_at
updated_at
```

---

# 34. CHAT DATA MODEL

## conversations

```text
conversation_id
company_id
tenant_id
employee_instance_id
title
status
last_message_at
created_by
created_at
updated_at
```

## messages

```text
message_id
conversation_id
company_id
tenant_id
sender_type
sender_id
message_type
content
task_id nullable
reply_to_message_id
created_at
```

## message_attachments

```text
attachment_id
message_id
file_id
mime_type
filename
sha256
status
created_at
```

---

# 35. TASK DATA MODEL

## tasks

```text
task_id
company_id
tenant_id
conversation_id
employee_instance_id
task_type_id
title
instruction
priority
risk_level
status
due_at
autonomy_mode
approval_required
created_by
created_at
updated_at
completed_at
```

## task_events

```text
event_id
task_id
event_type
status
summary
metadata_ref
created_at
```

## task_outputs

```text
output_id
task_id
execution_id
output_type
title
file_id nullable
content_ref nullable
version
approval_status
delivery_status
created_at
```

---

# 36. APPROVAL DATA MODEL

Tabela:

```text
approvals
```

Campos:

```text
approval_id
company_id
tenant_id
task_id
requested_action
risk_level
status
snapshot_ref
snapshot_hash
requested_by
assigned_to
decision
decision_reason
created_at
decided_at
```

Aprovação deve ocorrer no contexto:

```text
Task
Chat
Output
```

não obrigatoriamente num módulo isolado.

---

# 37. KNOWLEDGE SOURCE DATA MODEL

## knowledge_sources

```text
source_id
company_id nullable
tenant_id nullable
scope
source_type
title
authority
jurisdiction
criticality
status
current_version_id
created_by
created_at
updated_at
```

## knowledge_source_versions

```text
version_id
source_id
version_label
file_id
source_url nullable
declared_sha256
physical_sha256
effective_date
expiry_date
next_review_date
supersedes_version_id
validation_status
publication_status
created_at
```

---

# 38. KNOWLEDGE OBJECTS

```text
knowledge_object_id
source_version_id
object_type
title
content_ref
embedding_ref nullable
jurisdiction
valid_from
valid_to
status
created_at
```

---

# 39. KNOWLEDGE BINDINGS

```text
binding_id
knowledge_object_id
competency_id nullable
task_type_id nullable
role_id nullable
employee_instance_id nullable
company_id nullable
tenant_id nullable
binding_type
priority
created_at
```

---

# 40. KNOWLEDGE RUNTIME DECISIONS

Preservar:

```text
knowledge_runtime_decisions
```

Campos:

```text
decision_id
task_id
execution_id nullable
employee_instance_id
provider
model_id
competency_id
source_id nullable
decision
runtime_required
reason
token_budget
created_at
```

Esta tabela serve os motores internos.

Não precisa aparecer como menu.

---

# 41. CATÁLOGOS CANÓNICOS

Manter como registries/catálogos:

```text
role_catalog
department_catalog
task_type_catalog
competency_catalog
connector_catalog
knowledge_type_catalog
output_format_catalog
model_provider_catalog
risk_catalog
client_status_catalog
approval_type_catalog
plan_catalog
```

---

# 42. CATÁLOGO DE STATUS DO CLIENTE

Valores:

```text
CONFIGURACAO
EM_TESTE
PRONTO
ACTIVO
ATENCAO
```

Campos:

```text
status_code
display_name
description
ui_color
sort_order
```

---

# 43. CATÁLOGO DE CONHECIMENTO

Tipos visíveis:

```text
MANUAL
PROCEDIMENTO
POLITICA
TEMPLATE
LEGISLACAO
REGULAMENTO
NORMA
FONTE_OFICIAL
DOCUMENTACAO_TECNICA
CONTEUDO_INTERNO
OUTRO
```

---

# 44. CATÁLOGO DE CONECTORES

Campos:

```text
connector_key
display_name
category
supports_read
supports_write
supports_webhooks
supports_files
supports_oauth
supports_api_key
supports_local_agent
risk_class
status
```

---

# 45. FORMULÁRIOS - PRINCÍPIO

Reduzir o número de formulários visíveis.

Vários formulários antigos devem ser:

```text
MERGED
INLINE
AUTO
ADVANCED_ONLY
```

A aplicação simplificada deve possuir aproximadamente 20 formulários principais.

---

# 46. FRM-S-01 - CRIAR / EDITAR EMPRESA

Campos:

```text
Razão Social *
Nome Comercial
NIF *
País *
Província/Região
Sector de Actividade *
Moeda *
Fuso Horário *
Email institucional
Telefone
Morada
Administrador principal *
Criar tenant automaticamente [sim]
```

Botões:

```text
[ Cancelar ]
[ Guardar Rascunho ]
[ Criar Empresa ]
```

Backend:

```text
create organization
create tenant
create membership
create default settings
create audit event
```

---

# 47. FRM-S-02 - CONVIDAR UTILIZADOR

Campos:

```text
Nome *
Email *
Função/Cargo
Departamento
Perfil de acesso *
Empresas autorizadas
Pode aprovar?
Pode gerir Employees?
Pode gerir conhecimento?
Data de expiração opcional
```

---

# 48. FRM-S-03 - CONTRATAR / ASSOCIAR AI EMPLOYEE

Campos:

```text
Empresa *
AI Employee *
Nome interno opcional
Departamento *
Supervisor *
Plano *
Autonomia
Risco
Permissões iniciais
Conhecimento da empresa aplicável
Integrações autorizadas
```

Botões:

```text
[ Cancelar ]
[ Guardar ]
[ Contratar e Configurar ]
```

---

# 49. FRM-S-04 - CONFIGURAR AI EMPLOYEE

Agrupar em:

```text
Geral
Trabalho
Conhecimento
Integrações
Autonomia
Modelo
```

Não mostrar configuração técnica profunda por defeito.

---

# 50. FRM-S-05 - NOVO PEDIDO

Idealmente executado pelo Chat.

Campos opcionais:

```text
Employee *
Pedido *
Anexos
Prioridade
Prazo
Formato de saída
Fonte específica opcional
```

O resto é inferido pelo backend.

---

# 51. FRM-S-06 - ANEXAR / FORNECER DADOS

Campos:

```text
Ficheiros
Descrição
Tipo de dado opcional
Usar apenas nesta tarefa?
Adicionar também ao Knowledge Center?
```

Se marcar Knowledge Center, abrir confirmação e intake adequado.

---

# 52. FRM-S-07 - AGENDAR / RECORRÊNCIA

Campos:

```text
Tarefa/Prompt
Employee
Frequência
Data/hora
Timezone
Data final opcional
Canal de notificação
```

---

# 53. FRM-S-08 - APROVAR / REJEITAR

Campos:

```text
Decisão *
Comentário
Modificar antes de aprovar?
Motivo da rejeição
```

Exibir:

```text
snapshot
risk
recipient
impact
evidence
```

---

# 54. FRM-S-09 - ADICIONAR CONHECIMENTO

Campos:

```text
Tipo *
Ficheiro / URL / Texto *
Título *
Âmbito:
  Global
  Jurisdição
  Sector
  Empresa

Empresa se aplicável
Jurisdicção
Autoridade/Fonte
Versão
Data efectiva
Próxima revisão
Criticidade
```

Botões:

```text
[ Cancelar ]
[ Guardar Rascunho ]
[ Processar ]
```

O backend executa o pipeline completo.

---

# 55. FRM-S-10 - RESOLVER PROBLEMA DE CONHECIMENTO

Abrir apenas quando necessário.

Tipos:

```text
CONFLICT
OUTDATED
SOURCE_UNVERIFIED
MISSING_SOURCE
LOW_MAPPING_CONFIDENCE
REVIEW_REQUIRED
```

Campos:

```text
Problema
Fonte afectada
Acção
Nova fonte/versão opcional
Justificação
Aprovador
```

---

# 56. FRM-S-11 - LIGAR INTEGRAÇÃO

Campos dinâmicos por connector.

Comuns:

```text
Empresa *
Conector *
Nome da ligação
Modo:
  Leitura
  Escrita
  Ambos

Escopo
Conta/Workspace
Permissões
```

Segredos:

```text
API Key / OAuth
```

sempre enviados ao backend e guardados em Secrets Vault.

Nunca:

```text
localStorage
NEXT_PUBLIC_*
logs
model context
```

---

# 57. FRM-S-12 - CONFIGURAR CANAL

Para:

```text
WhatsApp
Email
Social
```

Campos:

```text
Conta
Empresa
Modo de recepção
Modo de envio
Aprovação obrigatória
Horário
Assinatura/identidade
Limites
```

---

# 58. FRM-S-13 - CONFIGURAR PROVIDER DE IA

Campos:

```text
Provider
Nome da configuração
Credential/API key
Modelos permitidos
Modelo principal
Fallback
Limite mensal
Política de custo
Activo?
```

Regra de segurança:

```text
credential
→ backend
→ secrets vault
```

Frontend só recebe:

```text
secret_ref
masked_value
connection_status
```

---

# 59. FRM-S-14 - PERMISSÕES DO UTILIZADOR

Campos:

```text
Utilizador
Empresa
Perfil
Departamentos
Employees permitidos
Pode aprovar
Pode gerir conhecimento
Pode gerir integrações
Pode ver custos
Pode ver auditoria
```

---

# 60. FRM-S-15 - PLANO / SUBSCRIÇÃO

Campos:

```text
Plano
Employees incluídos
Limites
Billing cycle
Moeda
Dados de facturação
Data de início
```

---

# 61. FRM-S-16 - NOTIFICAÇÕES

Campos:

```text
Eventos críticos
Aprovações
Tarefa concluída
Tarefa falhou
Conhecimento desactualizado
Integração falhou
Resumo diário
Canal preferido
Hora do briefing
```

---

# 62. FRM-S-17 - BRANDING & OUTPUTS

Integrar em Empresa, não criar módulo principal.

Campos:

```text
Logo
Papel timbrado
Cores
Rodapé
Assinatura
Signatários
Templates padrão
Formato preferido
```

---

# 63. FRM-S-18 - PAUSAR / PARAR

Campos:

```text
Escopo:
  Employee
  Equipa
  Integração
  Empresa

Motivo *
Duração
Cancelar tarefas pendentes?
Preservar fila?
```

`EMERGENCY STOP` deve exigir confirmação forte.

---

# 64. FRM-S-19 - AUDITORIA / EXPORTAR EVIDÊNCIA

Campos:

```text
Empresa
Employee
Task
Período
Tipo de evidência
Formato
Incluir hashes?
Incluir approvals?
Incluir knowledge receipts?
```

---

# 65. FRM-S-20 - PREFERÊNCIAS DA EMPRESA

Campos:

```text
Idioma
Timezone
Moeda
Formato de data
Canal preferido
Política de aprovação default
Autonomia default
Retention
Briefing diário
```

---

# 66. TABELAS VISÍVEIS NO FRONTEND

Não confundir com tabelas de base de dados.

## TBL-01 - Meus AI Employees

Colunas:

```text
Employee
Função
Departamento
Estado
Tarefa actual
Fiabilidade
Última actividade
Ações
```

## TBL-02 - Tarefas

```text
Tarefa
Employee
Estado
Prioridade
Prazo
Aprovação
Última actualização
Ações
```

## TBL-03 - Conhecimento

```text
Fonte
Tipo
Âmbito
Versão
Estado
Employees afectados
Última actualização
Ações
```

## TBL-04 - Problemas de Conhecimento

```text
Problema
Fonte
Impacto
Employees
Severidade
Estado
Ação necessária
```

## TBL-05 - Integrações

```text
Sistema
Conta
Modo
Estado
Última sincronização
Permissões
Ações
```

## TBL-06 - Utilizadores

```text
Nome
Email
Perfil
Departamento
Estado
Último acesso
Ações
```

## TBL-07 - Subscrição & Uso

```text
Item
Plano
Quantidade
Uso
Custo
Período
Estado
```

## TBL-08 - Auditoria

```text
Data
Utilizador/Employee
Evento
Objecto
Resultado
Risco
Evidence
```

---

# 67. MIGRAÇÃO DOS MÓDULOS ANTIGOS

Mapear:

```text
Dashboard + Command Center
→ INÍCIO

Marketplace + Workforce + Role Packs
→ AI EMPLOYEES

Central Work + Runtime + Evidence Gate +
Remote Commands + Approvals + Document Studio
→ TRABALHO

Knowledge Center + MNCA + ORDKS +
Competency Passport + Knowledge Necessity +
Regulatory Watch + Client Policy
→ CONHECIMENTO

WhatsApp + Email + Social + Connectors +
Remote Channel
→ COMUNICAÇÕES & INTEGRAÇÕES

Company Provisioning + Users + Billing +
Security + Audit + Prompt Registry
→ EMPRESA & ADMINISTRAÇÃO
```

---

# 68. NÃO APAGAR ROTAS ANTIGAS DE IMEDIATO

Implementar transição:

```text
OLD ROUTE
→ redirect / alias
→ NEW ROUTE
```

Manter durante janela de compatibilidade.

Exemplo:

```text
/knowledge/mnca
→ /knowledge?advanced=mnca
```

---

# 69. FEATURE FLAG

Implementar:

```text
SIMPLIFIED_UI_V2
```

Permitir:

```text
OFF → interface anterior
ON  → interface simplificada
```

até concluir validação.

---

# 70. ADVANCED ROUTES

Rotas técnicas podem permanecer:

```text
/admin/advanced/runtime
/admin/advanced/mnca
/admin/advanced/reliability
/admin/advanced/certification
/admin/advanced/evidence
/admin/advanced/prompts
```

Apenas para perfis autorizados.

---

# 71. API FACADE

Criar uma API de produto simplificada que orquestre serviços internos.

Exemplos:

```text
POST /product/requests
GET  /product/employees
POST /product/employees/{id}/configure

POST /product/knowledge
GET  /product/knowledge
POST /product/knowledge/{id}/resolve-issue

GET  /product/integrations
POST /product/integrations

GET  /product/admin/summary
```

Internamente pode chamar endpoints existentes.

Não duplicar lógica de negócio.

---

# 72. FRONTEND COMPONENTS REUSÁVEIS

Criar:

```text
AppShell
GlobalActionBar
EmployeePicker
EmployeeStatusBadge
ChatWorkspace
ChatComposer
TaskContextPanel
AttachmentPicker
KnowledgeSourceCard
KnowledgeIssueCard
IntegrationCard
ApprovalCard
OutputPreview
EvidenceDrawer
CompanySettingsForm
UserPermissionForm
SubscriptionSummary
```

---

# 73. UX - PROGRESSIVE DISCLOSURE

Regra:

```text
DEFAULT
→ simple

DETAILS
→ on demand

ADVANCED
→ role gated
```

Nunca começar com campos técnicos que o utilizador não precisa.

---

# 74. UX - SMART DEFAULTS

Preencher automaticamente quando possível:

```text
company
tenant
employee
timezone
currency
supervisor
approved outputs
default model policy
knowledge scope
```

O utilizador deve preencher apenas o que não pode ser inferido.

---

# 75. UX - INLINE ERRORS

Não enviar utilizador para outro módulo para corrigir um problema.

Exemplo no Chat:

```text
Fonte fiscal obrigatória em falta.

[ Adicionar Fonte ]
[ Pedir Ajuda ]
```

---

# 76. UX - APPROVAL INLINE

No Chat/Task:

```text
Aprovação necessária

Acção:
Enviar email ao cliente

Risco:
MEDIUM

[ Aprovar ]
[ Modificar ]
[ Rejeitar ]
```

---

# 77. UX - OUTPUT INLINE

No Chat:

```text
Relatório concluído

[ Pré-visualizar ]
[ PDF ]
[ Excel ]
[ Enviar ]
[ Arquivar ]
```

Document Generation Service continua interno.

---

# 78. UX - KNOWLEDGE INLINE

No Chat:

```text
Conhecimento utilizado:
2 fontes

[ Ver Fontes ]
```

Não mostrar 20 detalhes de retrieval por defeito.

---

# 79. AUDITABILIDADE

Simplificar UI não significa reduzir prova.

Continuar a armazenar:

```text
task_id
execution_id
provider
model
sources used
tools used
approvals
output
delivery
hashes
receipts
cost
```

Expor sob:

```text
[ Ver Evidência ]
```

---

# 80. MOCK VS REAL

Preservar:

```text
MOCK
REAL_API
UNKNOWN
```

Na interface normal, apenas mostrar badge quando relevante.

Nunca usar mock para provar:

```text
capacidade real
custo real
certificação real
connector real
delivery real
```

---

# 81. TESTES DE MIGRAÇÃO

Criar:

```text
TEST-SIMP-01
6 módulos principais visíveis

TEST-SIMP-02
utilizador comum não vê engines técnicos

TEST-SIMP-03
admin avançado vê advanced routes

TEST-SIMP-04
old routes redireccionam correctamente

TEST-SIMP-05
chat cria task para work intent

TEST-SIMP-06
chat simples não cria task desnecessária

TEST-SIMP-07
knowledge upload executa pipeline completo

TEST-SIMP-08
knowledge source-critical continua a bloquear task quando falta

TEST-SIMP-09
client knowledge mantém tenant isolation

TEST-SIMP-10
Employee status mapping preserva internal_status

TEST-SIMP-11
provider secret nunca retorna ao frontend

TEST-SIMP-12
approval funciona inline no Chat/Task

TEST-SIMP-13
output preview e delivery funcionam sem abrir módulo técnico

TEST-SIMP-14
audit/evidence permanece completo

TEST-SIMP-15
billing continua consistente após simplificação

TEST-SIMP-16
mobile/responsive navigation
```

---

# 82. TESTES DE UTILIZAÇÃO

Executar pelo menos cinco cenários:

```text
CENÁRIO A
Criar empresa → contratar Employee → fazer primeiro pedido

CENÁRIO B
Carregar manual → sistema processa → Employee usa quando necessário

CENÁRIO C
Tarefa source-critical sem fonte → bloqueio claro → utilizador adiciona fonte

CENÁRIO D
Pedido via Chat → output PDF → aprovação → email

CENÁRIO E
Integração offline → task fica pendente → retoma automaticamente
```

Meta:

```text
nenhum cenário normal
deve exigir acesso a engine técnico
```

---

# 83. MIGRAÇÃO DE COMPONENTES

Antes de criar novo componente, gerar:

```text
SIMPLIFICATION_EXISTING_COMPONENT_AUDIT
```

Campos:

```text
component
current_path
current_module
new_module
reuse
merge
hide
advanced_only
delete_candidate
dependencies
tests
```

---

# 84. MIGRAÇÃO DE DADOS

Gerar:

```text
SCHEMA_CONSOLIDATION_PLAN
```

Classificar cada tabela actual:

```text
KEEP
MERGE
VIEW
ADAPTER
MIGRATE
ARCHIVE
DROP_CANDIDATE
```

Nunca executar `DROP` sem:

```text
backup
migration proof
rollback
dependency scan
approval
```

---

# 85. NÃO REESCREVER O CORE

Não criar:

```text
segundo runtime
segundo task engine
segundo knowledge engine
segundo approval engine
segundo billing engine
segundo audit engine
```

A simplificação é principalmente:

```text
PRODUCT FACADE
+
NAVIGATION CONSOLIDATION
+
UX ORCHESTRATION
+
SCHEMA CANONICALIZATION
```

---

# 86. CRITÉRIOS DE ACEITAÇÃO

A alteração só pode ser marcada `PASS` quando:

```text
✓ apenas 6 módulos principais aparecem para utilizador comum
✓ chat é o principal canal de pedido
✓ Employee possui apenas 5 abas normais
✓ Knowledge Center possui fluxo simples
✓ upload de conhecimento não exige programador
✓ motores técnicos continuam operacionais no backend
✓ estados técnicos são resumidos em 5 estados cliente
✓ old routes possuem compatibilidade/redirect
✓ tabelas duplicadas possuem plano de consolidação
✓ secrets não aparecem no frontend
✓ source-critical permanece obrigatório
✓ tenant isolation permanece intacto
✓ evidence permanece completa
✓ billing permanece correcto
✓ mock/real continuam distintos
✓ nenhum PASS é fabricado
```

---

# 87. ENTREGÁVEIS DO AGENTE

Produzir:

```text
1. SIMPLIFICATION_EXISTING_COMPONENT_AUDIT.md
2. SIMPLIFICATION_ROUTE_MAP.md
3. SCHEMA_CONSOLIDATION_PLAN.md
4. UI_NAVIGATION_V2.md
5. FORM_CATALOG_V2.md
6. DATA_CATALOG_V2.md
7. MIGRATION_PLAN.md
8. SECURITY_REVIEW.md
9. TEST_REPORT.md
10. IMPLEMENTATION_REPORT.md
```

---

# 88. RELATÓRIO FINAL

O relatório deve declarar separadamente:

```text
IMPLEMENTED
REUSED
MERGED
HIDDEN_FROM_STANDARD_UI
ADVANCED_ONLY
MIGRATED
NOT_IMPLEMENTED
BLOCKED
TESTED
REAL_API_TESTED
MOCK_ONLY
```

Nunca converter:

```text
specification
```

em:

```text
implemented
```

sem evidência.

---

# 89. RESULTADO FINAL PRETENDIDO

O cliente deve perceber a plataforma assim:

```text
INÍCIO
↓
AI EMPLOYEES
↓
TRABALHO
↓
CONHECIMENTO
↓
COMUNICAÇÕES & INTEGRAÇÕES
↓
EMPRESA & ADMINISTRAÇÃO
```

Enquanto internamente:

```text
Runtime
Model Router
MNCA
ORDKS
Knowledge Necessity
Reliability
Quality
Certification
Document Generation
Evidence
Billing
Regulatory Watch
Remote Execution
Audit
```

continuam a trabalhar.

---

# 90. PRINCÍPIO FINAL

A plataforma deve passar de:

```text
"o utilizador aprende a arquitectura"
```

para:

```text
"a arquitectura aprende a servir o utilizador"
```

A complexidade técnica deve permanecer onde é necessária:

```text
BACKEND
```

e desaparecer onde não acrescenta valor:

```text
FRONTEND DO CLIENTE
```

O produto final deve parecer simples mesmo quando a engenharia interna é sofisticada.
