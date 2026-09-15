# AETF-500 - Estrutura Simplificada de Tabelas, Catálogos e Formulários
## Nova arquitectura de produto com 6 módulos visíveis, 16 ecrãs principais e Chatbox central

**Versão:** 2.0 simplificada  
**Data:** 14 de Setembro de 2026  
**Objectivo:** reduzir drasticamente a complexidade visível mantendo os motores técnicos no backend.

> Esta estrutura substitui a proposta de navegação excessivamente modular por uma fachada de produto simples. Os motores internos permanecem activos, mas deixam de ser módulos principais para o cliente.

## 1. Princípio de design

```text
COMPLEXIDADE NO BACKEND
+
SIMPLICIDADE NO FRONTEND
```

```text
1 acção do utilizador
→ vários serviços internos automáticos
```

## 2. Nova navegação principal

### MOD-01 - Início
Resumo diário, alertas, aprovações, problemas, briefing e atalhos.

**Ecrãs:**
- HOME-01 Início

### MOD-02 - AI Employees
Catálogo, Employees contratados, equipas e configuração simplificada.

**Ecrãs:**
- EMP-01 Catálogo
- EMP-02 Meus AI Employees
- EMP-03 Detalhe do Employee
- EMP-04 Equipas

### MOD-03 - Trabalho
Chat, tarefas, resultados e aprovações no contexto do trabalho.

**Ecrãs:**
- WORK-01 Chat com Employee
- WORK-02 Tarefas
- WORK-03 Detalhe da Tarefa / Resultado

### MOD-04 - Conhecimento
Upload, biblioteca, actualizações e problemas de conhecimento.

**Ecrãs:**
- KNOW-01 Knowledge Center
- KNOW-02 Detalhe da Fonte

### MOD-05 - Comunicações & Integrações
Inbox omnicanal e ligações a sistemas/canais.

**Ecrãs:**
- COMM-01 Inbox
- COMM-02 Integrações

### MOD-06 - Empresa & Administração
Empresa, utilizadores, permissões, plano, segurança, auditoria e configurações.

**Ecrãs:**
- ADMIN-01 Empresa
- ADMIN-02 Utilizadores & Permissões
- ADMIN-03 Plano & Facturação
- ADMIN-04 Segurança & Auditoria
- ADMIN-05 Configurações

## 3. Ecrãs principais

| ID | Ecrã | Finalidade | Botões principais | Tabs/áreas |
|---|---|---|---|---|
| HOME-01 | Início | Resumo do dia, tarefas, aprovações, alertas, Employees e atalhos. | Novo Pedido, Adicionar Conhecimento, Contratar Employee, Ver Aprovações | Resumo, Needs Your Attention, Actividade, Briefing |
| EMP-01 | Catálogo | Pesquisar e comparar as 500 funções do catálogo global. | Ver Employee, Contratar, Iniciar Piloto | Todos, Por Área, Recomendados |
| EMP-02 | Meus AI Employees | Lista das instâncias privadas da empresa. | Novo Employee, Abrir Chat, Configurar, Pausar | Todos, Equipas, Estado |
| EMP-03 | Detalhe do Employee | Visão simples do Employee, sem expor engines técnicos. | Abrir Chat, Configurar, Pausar, Ver Histórico | Resumo, Trabalho, Conhecimento, Configuração, Histórico |
| EMP-04 | Equipas | Organização de Employees por departamento/equipa. | Criar Equipa, Adicionar Employee, Definir Supervisor | Equipas, Departamentos |
| WORK-01 | Chat com Employee | Workspace principal para pedir, clarificar, anexar, executar e receber resultados. | Enviar, Anexar, Fonte, Agendar, Executar | Conversa, Contexto |
| WORK-02 | Tarefas | Fila de trabalho por Employee, estado, prazo e prioridade. | Nova Tarefa, Abrir, Reatribuir, Cancelar | Minhas, Equipa, Agendadas, Concluídas |
| WORK-03 | Detalhe da Tarefa / Resultado | Inputs, execução, output, revisão, aprovação e evidência. | Fornecer Dados, Pedir Revisão, Aprovar, Entregar, Ver Evidência | Resumo, Inputs, Resultado, Aprovação, Histórico |
| KNOW-01 | Knowledge Center | Upload e biblioteca simples de fontes da empresa. | Adicionar Conhecimento, Nova Versão, Resolver Problema | Biblioteca, Actualizações, Problemas |
| KNOW-02 | Detalhe da Fonte | Versão, integridade, impacto, uso e histórico da fonte. | Nova Versão, Revogar, Resolver Problema, Ver Evidência | Resumo, Versões, Impacto, Histórico |
| COMM-01 | Inbox de Comunicações | WhatsApp, email e social numa inbox única. | Responder, Criar Tarefa, Aprovar, Criar Lead | Todos, WhatsApp, Email, Social |
| COMM-02 | Integrações | Conectores cloud/local, providers de IA e canais. | Ligar, Configurar, Testar, Revogar | Sistemas, Canais, IA, Dispositivos |
| ADMIN-01 | Empresa | Dados legais, departamentos, branding e preferências. | Editar Empresa, Branding, Preferências | Dados, Estrutura, Branding |
| ADMIN-02 | Utilizadores & Permissões | Utilizadores, perfis e acessos. | Convidar Utilizador, Editar Permissões, Suspender | Utilizadores, Perfis, Aprovações |
| ADMIN-03 | Plano & Facturação | Plano, uso, invoices e payments. | Alterar Plano, Ver Facturas, Registar Pagamento | Subscrição, Uso, Facturas, Pagamentos |
| ADMIN-04 | Segurança & Auditoria | Segurança, incidentes, kill switch e evidência. | Exportar Evidência, Pausar/Parar, Ver Incidentes | Segurança, Auditoria, Evidência |
| ADMIN-05 | Configurações | Notificações, canais preferidos e modo avançado. | Notificações, Provider IA, Modo Avançado | Geral, Notificações, IA, Avançado |

## 4. Chatbox central

O `WORK-01 Chat com Employee` é o centro operacional do produto.

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Employee | Estado | Empresa | Conversa | Nova conversa             │
├───────────────┬────────────────────────────────┬────────────────────┤
│ Conversas     │ Chat                           │ Contexto            │
│ Employees     │ Mensagens                     │ Task                │
│ Favoritos     │ Anexos                        │ Ficheiros           │
│               │ Execução                      │ Fontes              │
│               │ Aprovações                    │ Conhecimento        │
│               │ Resultados                    │ Output/Evidence     │
├───────────────┴────────────────────────────────┴────────────────────┤
│ + Anexar | Voz | Fonte | Prazo | Prioridade | [ Enviar ]          │
└─────────────────────────────────────────────────────────────────────┘
```

### Regras do Chat
- Conversa simples pode permanecer sem task.
- Pedido operacional executável cria/associa `task_id` automaticamente.
- O Employee pode pedir dados em falta antes de executar.
- Aprovações aparecem inline.
- Outputs aparecem inline com preview, download/entrega e evidence.
- O utilizador não escolhe manualmente MNCA, Runtime, Knowledge Necessity ou Evidence Gate.

## 5. Tabelas visíveis no frontend

| ID | Tabela | Colunas visíveis |
|---|---|---|
| TBL-01 | Meus AI Employees | Employee; Função; Departamento; Estado; Tarefa actual; Fiabilidade; Última actividade; Ações |
| TBL-02 | Tarefas | Tarefa; Employee; Estado; Prioridade; Prazo; Aprovação; Última actualização; Ações |
| TBL-03 | Conhecimento | Fonte; Tipo; Âmbito; Versão; Estado; Employees afectados; Última actualização; Ações |
| TBL-04 | Problemas de Conhecimento | Problema; Fonte; Impacto; Employees; Severidade; Estado; Ação necessária |
| TBL-05 | Integrações | Sistema; Conta; Modo; Estado; Última sincronização; Permissões; Ações |
| TBL-06 | Utilizadores | Nome; Email; Perfil; Departamento; Estado; Último acesso; Ações |
| TBL-07 | Subscrição & Uso | Item; Plano; Quantidade; Uso; Custo; Período; Estado |
| TBL-08 | Auditoria | Data; Utilizador/Employee; Evento; Objecto; Resultado; Risco; Evidence |

## 6. Estrutura canónica de tabelas de base de dados

### Organização

| Tabela | Função | Campos principais |
|---|---|---|
| `organizations` | Empresa/entidade legal | `organization_id, legal_name, trade_name, tax_id, country, currency, timezone, status` |
| `tenants` | Fronteira técnica multi-tenant | `tenant_id, organization_id, status, region, created_at` |
| `users` | Identidades humanas | `user_id, name, email, status` |
| `organization_memberships` | Associação utilizador-empresa | `membership_id, organization_id, tenant_id, user_id, role, status` |
| `departments` | Departamentos da empresa | `department_id, organization_id, name, parent_id, manager_user_id` |

### Workforce

| Tabela | Função | Campos principais |
|---|---|---|
| `role_catalog` | Catálogo global dos 500 Role Packs | `role_id, role_key, display_name, area_code, department_code, risk_class, role_pack_version` |
| `employee_instances` | Instâncias privadas contratadas | `instance_id, role_id, organization_id, tenant_id, department_id, supervisor_user_id, client_status, internal_status` |
| `employee_assignments` | Supervisores/equipas/escopo | `assignment_id, instance_id, department_id, supervisor_user_id, valid_from, valid_to` |
| `employee_runtime_profiles` | Modelo, autonomia e defaults runtime | `profile_id, instance_id, model_policy, autonomy_level, risk_level, output_defaults` |
| `employee_status_events` | Histórico de estados | `event_id, instance_id, client_status, internal_status, reason, created_at` |

### Chat & Trabalho

| Tabela | Função | Campos principais |
|---|---|---|
| `conversations` | Conversa persistente com Employee | `conversation_id, organization_id, tenant_id, instance_id, title, status, last_message_at` |
| `conversation_participants` | Participantes autorizados | `participant_id, conversation_id, participant_type, participant_id_ref` |
| `messages` | Mensagens do chat | `message_id, conversation_id, sender_type, sender_id, message_type, content, task_id` |
| `message_attachments` | Anexos | `attachment_id, message_id, file_id, filename, mime_type, sha256, status` |
| `tasks` | Pedido operacional formal | `task_id, organization_id, tenant_id, conversation_id, instance_id, task_type_id, title, instruction, priority, status, due_at` |
| `task_files` | Ficheiros usados pela task | `task_file_id, task_id, file_id, role, source_channel` |
| `task_events` | Timeline de execução | `event_id, task_id, event_type, status, summary, created_at` |
| `task_outputs` | Resultados/versionamento | `output_id, task_id, execution_id, output_type, file_id, version, approval_status, delivery_status` |
| `approvals` | Aprovações HITL | `approval_id, task_id, requested_action, risk_level, status, snapshot_ref, assigned_to, decision` |

### Conhecimento

| Tabela | Função | Campos principais |
|---|---|---|
| `knowledge_sources` | Fonte lógica | `source_id, organization_id, tenant_id, scope, source_type, title, authority, jurisdiction, criticality, status` |
| `knowledge_source_versions` | Versões físicas | `version_id, source_id, version_label, file_id, source_url, declared_sha256, physical_sha256, effective_date, next_review_date` |
| `knowledge_objects` | Unidades de conhecimento | `knowledge_object_id, source_version_id, object_type, title, content_ref, status` |
| `knowledge_bindings` | Mapeamento reutilizável | `binding_id, knowledge_object_id, competency_id, task_type_id, role_id, instance_id, tenant_id, binding_type` |
| `knowledge_runtime_decisions` | Decisão de uso por task/model | `decision_id, task_id, instance_id, provider, model_id, competency_id, source_id, decision, runtime_required, reason` |
| `knowledge_issues` | Conflitos/lacunas/revisões | `issue_id, source_id, issue_type, severity, status, affected_scope, assigned_to` |

### Integrações & Canais

| Tabela | Função | Campos principais |
|---|---|---|
| `connector_catalog` | Capacidades conhecidas por conector | `connector_key, display_name, category, supports_read, supports_write, auth_type, risk_class` |
| `connector_accounts` | Ligação da empresa ao serviço | `connection_id, organization_id, tenant_id, connector_key, secret_ref, mode, status` |
| `connector_permissions` | Escopos por Employee/utilizador | `permission_id, connection_id, subject_type, subject_id, capability, status` |
| `channel_connections` | WhatsApp/email/social | `channel_connection_id, organization_id, tenant_id, channel_type, account_ref, status` |
| `remote_commands` | Comandos diferidos/offline | `command_id, tenant_id, instance_id, channel, execution_mode, risk_level, status, device_id` |

### Comercial

| Tabela | Função | Campos principais |
|---|---|---|
| `plans` | Planos comerciais | `plan_id, name, billing_cycle, currency, status` |
| `subscriptions` | Subscrição por empresa | `subscription_id, organization_id, plan_id, status, started_at, renewed_at` |
| `usage_events` | Medição de uso | `usage_event_id, tenant_id, instance_id, task_id, metric, quantity, cost_amount, occurred_at` |
| `invoices` | Facturação | `invoice_id, organization_id, subscription_id, amount, currency, status, issued_at, due_at` |
| `payments` | Pagamentos | `payment_id, invoice_id, amount, currency, status, paid_at, reference` |

### Governação

| Tabela | Função | Campos principais |
|---|---|---|
| `audit_events` | Registo imutável de eventos | `audit_event_id, tenant_id, actor_type, actor_id, action, object_type, object_id, result, created_at` |
| `evidence_receipts` | Receipts de execução/proveniência | `receipt_id, task_id, execution_id, receipt_type, hash, storage_ref, created_at` |
| `notifications` | Notificações operacionais | `notification_id, tenant_id, user_id, type, severity, status, created_at` |
| `user_preferences` | Preferências de UX | `preference_id, user_id, tenant_id, language, timezone, notification_profile` |
| `security_policies` | Políticas de segurança/risco | `policy_id, tenant_id, policy_type, scope, version, status` |

## 7. Catálogos canónicos

| ID | Catálogo | Finalidade | Estrutura / valores |
|---|---|---|---|
| CAT-01 | Role Catalog | 500 funções/Role Packs globais | `role_id, role_key, nome, área, departamento, risco, autonomia, versão` |
| CAT-02 | Department Catalog | Áreas/departamentos canónicos | `department_code, nome, parent_code, ordem` |
| CAT-03 | Task Type Catalog | Tipos de trabalho executável | `task_type_id, role_id, nome, risco, SOP, outputs` |
| CAT-04 | Competency Catalog | Competências/subcompetências | `competency_id, nome, domínio, criticidade` |
| CAT-05 | Connector Catalog | Sistemas e canais ligáveis | `connector_key, categoria, auth, read/write, risco` |
| CAT-06 | Knowledge Type Catalog | Tipos de fonte | `MANUAL, PROCEDIMENTO, POLITICA, TEMPLATE, LEGISLACAO, REGULAMENTO, NORMA, FONTE_OFICIAL, DOCUMENTACAO_TECNICA, CONTEUDO_INTERNO` |
| CAT-07 | Output Format Catalog | Formatos de entrega | `CHAT, DOCX, PDF, XLSX, PPTX, EMAIL, MESSAGE, API_ACTION` |
| CAT-08 | Model Provider Catalog | Providers/modelos autorizados | `provider, model_id, capability_profile, status` |
| CAT-09 | Risk Catalog | Níveis de risco | `LOW, MEDIUM, HIGH, CRITICAL` |
| CAT-10 | Client Status Catalog | Estado simplificado do Employee | `CONFIGURACAO, EM_TESTE, PRONTO, ACTIVO, ATENCAO` |
| CAT-11 | Approval Type Catalog | Tipos de aprovação | `OUTBOUND, FINANCIAL, LEGAL, TAX, PUBLISH, DATA_WRITE, HIGH_RISK` |
| CAT-12 | Plan Catalog | Planos comerciais | `plan_id, nome, entitlements, billing_cycle, limits` |

## 8. Estado simplificado do Employee

| Estado visível | Inclui internamente |
|---|---|
| CONFIGURAÇÃO | REGISTERED, SPECIFIED, IMPLEMENTED, KNOWLEDGE_PREPARED, INTEGRATION_MAPPED, TESTS_DEFINED, STRUCTURALLY_READY |
| EM TESTE | READY_FOR_TEST, IN_TESTING, CONNECTED, FUNCTIONAL_TESTED, E2E_TESTED, SHADOW_MODE, SHADOW_VALIDATED |
| PRONTO | HUMAN_BENCHMARKED, SECURITY_VALIDATED, PLATFORM_CERTIFIED |
| ACTIVO | ORGANIZATION_READY, ACTIVE |
| ATENÇÃO | WAITING_DATA, WAITING_CONNECTION, WAITING_APPROVAL, NEEDS_IMPROVEMENT, BLOCKED, DEGRADED, SUSPENDED, PAUSED |

Guardar sempre `internal_status` e `attention_reason` para não perder granularidade técnica.

## 9. Catálogo simplificado de formulários

### FRM-S-01 - Criar / Editar Empresa
**Apresentação:** Modal grande / drawer

| Campo | Tipo | Obrigatório |
|---|---|---|
| Razão Social | Texto | Sim |
| Nome Comercial | Texto | Não |
| NIF | Texto | Sim |
| País | Select | Sim |
| Província/Região | Texto/Select | Não |
| Sector de Actividade | Select | Sim |
| Moeda | Select | Sim |
| Fuso Horário | Select | Sim |
| Email institucional | Email | Não |
| Telefone | Telefone | Não |
| Morada | Textarea | Não |
| Administrador principal | User/Email | Sim |
| Criar tenant automaticamente | Toggle | Sim - default ON |

**Botões:** `Cancelar` | `Guardar Rascunho` | `Criar/Guardar`

### FRM-S-02 - Convidar Utilizador
**Apresentação:** Modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome | Texto | Sim |
| Email | Email | Sim |
| Função/Cargo | Texto | Não |
| Departamento | Select | Não |
| Perfil de acesso | Select | Sim |
| Empresas autorizadas | Multi-select | Sim |
| Pode aprovar | Toggle | Não |
| Pode gerir Employees | Toggle | Não |
| Pode gerir conhecimento | Toggle | Não |
| Expiração | Data | Não |

**Botões:** `Cancelar` | `Enviar Convite`

### FRM-S-03 - Contratar / Associar AI Employee
**Apresentação:** Wizard curto

| Campo | Tipo | Obrigatório |
|---|---|---|
| Empresa | Select | Sim |
| AI Employee | Search/Select | Sim |
| Nome interno | Texto | Não |
| Departamento | Select | Sim |
| Supervisor | User Select | Sim |
| Plano | Select | Sim |
| Autonomia | Select | Sim |
| Risco | Badge/Select | Sim |
| Permissões iniciais | Multi-select | Não |
| Conhecimento aplicável | Multi-select | Não |
| Integrações autorizadas | Multi-select | Não |

**Botões:** `Cancelar` | `Guardar` | `Contratar e Configurar`

### FRM-S-04 - Configurar AI Employee
**Apresentação:** Drawer com tabs

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome/Departamento/Supervisor | Grupo | Sim |
| Tipos de trabalho permitidos | Multi-select | Sim |
| Conhecimento | Bindings | Não |
| Integrações | Multi-select | Não |
| Autonomia | Select | Sim |
| Modelo principal | Select | Não |
| Fallback | Select | Não |
| Outputs padrão | Multi-select | Não |

**Botões:** `Cancelar` | `Guardar Configuração` | `Executar Readiness`

### FRM-S-05 - Novo Pedido
**Apresentação:** Chat composer expandido

| Campo | Tipo | Obrigatório |
|---|---|---|
| Employee | Select | Sim |
| Pedido | Textarea/Chat | Sim |
| Anexos | Files | Não |
| Prioridade | Select | Não |
| Prazo | Datetime | Não |
| Formato de saída | Multi-select | Não |
| Fonte específica | Select | Não |

**Botões:** `Enviar` | `Agendar`

### FRM-S-06 - Anexar / Fornecer Dados
**Apresentação:** Modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Ficheiros | Files | Sim |
| Descrição | Textarea | Não |
| Tipo de dado | Select | Não |
| Usar só nesta tarefa | Toggle | Não |
| Adicionar também ao Knowledge Center | Toggle | Não |

**Botões:** `Cancelar` | `Adicionar`

### FRM-S-07 - Agendar / Recorrência
**Apresentação:** Modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Tarefa/Prompt | Textarea | Sim |
| Employee | Select | Sim |
| Frequência | Select | Sim |
| Data/Hora | Datetime | Sim |
| Timezone | Select | Sim |
| Data final | Date | Não |
| Canal de notificação | Select | Não |

**Botões:** `Cancelar` | `Agendar`

### FRM-S-08 - Aprovar / Rejeitar
**Apresentação:** Approval card / modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Decisão | Approve/Reject/Modify | Sim |
| Comentário | Textarea | Não |
| Motivo da rejeição | Textarea | Condicional |
| Modificar antes de aprovar | Editor | Condicional |
| Snapshot/Risco/Impacto/Evidência | Read-only | Sim |

**Botões:** `Aprovar` | `Modificar` | `Rejeitar`

### FRM-S-09 - Adicionar Conhecimento
**Apresentação:** Wizard curto

| Campo | Tipo | Obrigatório |
|---|---|---|
| Tipo | Select | Sim |
| Ficheiro / URL / Texto | Dynamic input | Sim |
| Título | Texto | Sim |
| Âmbito | Select | Sim |
| Empresa | Select | Condicional |
| Jurisdição | Select | Não |
| Autoridade/Fonte | Texto | Não |
| Versão | Texto | Não |
| Data efectiva | Date | Não |
| Próxima revisão | Date | Não |
| Criticidade | Select | Sim |

**Botões:** `Cancelar` | `Guardar Rascunho` | `Processar`

### FRM-S-10 - Resolver Problema de Conhecimento
**Apresentação:** Modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Problema | Read-only | Sim |
| Fonte afectada | Read-only | Sim |
| Acção | Select | Sim |
| Nova fonte/versão | File/URL | Não |
| Justificação | Textarea | Sim |
| Aprovador | User Select | Condicional |

**Botões:** `Cancelar` | `Resolver` | `Enviar para Aprovação`

### FRM-S-11 - Ligar Integração
**Apresentação:** Wizard dinâmico

| Campo | Tipo | Obrigatório |
|---|---|---|
| Empresa | Select | Sim |
| Conector | Select | Sim |
| Nome da ligação | Texto | Sim |
| Modo | Read/Write/Both | Sim |
| Conta/Workspace | Dynamic | Condicional |
| Escopos | Multi-select | Sim |
| Credential/OAuth | Secure backend field | Condicional |

**Botões:** `Cancelar` | `Autorizar` | `Testar Ligação`

### FRM-S-12 - Configurar Canal
**Apresentação:** Drawer

| Campo | Tipo | Obrigatório |
|---|---|---|
| Canal | Select | Sim |
| Conta | Select | Sim |
| Empresa | Select | Sim |
| Recepção activa | Toggle | Sim |
| Envio activo | Toggle | Sim |
| Aprovação obrigatória | Toggle | Não |
| Horário | Schedule | Não |
| Assinatura/Identidade | Select | Não |
| Limites | Number/Policy | Não |

**Botões:** `Cancelar` | `Guardar`

### FRM-S-13 - Configurar Provider de IA / API Key
**Apresentação:** Secure modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Provider | Select | Sim |
| Nome da configuração | Texto | Sim |
| Credential/API Key | Password -> backend vault | Sim |
| Modelos permitidos | Multi-select | Não |
| Modelo principal | Select | Sim |
| Fallback | Select | Não |
| Limite mensal | Currency/Number | Não |
| Política de custo | Select | Não |
| Activo | Toggle | Sim |

**Botões:** `Cancelar` | `Guardar com Segurança` | `Testar Ligação`

### FRM-S-14 - Permissões do Utilizador
**Apresentação:** Drawer

| Campo | Tipo | Obrigatório |
|---|---|---|
| Utilizador | Select | Sim |
| Empresa | Select | Sim |
| Perfil | Select | Sim |
| Departamentos | Multi-select | Não |
| Employees permitidos | Multi-select | Não |
| Pode aprovar | Toggle | Não |
| Gerir conhecimento | Toggle | Não |
| Gerir integrações | Toggle | Não |
| Ver custos | Toggle | Não |
| Ver auditoria | Toggle | Não |

**Botões:** `Cancelar` | `Guardar Permissões`

### FRM-S-15 - Plano / Subscrição
**Apresentação:** Modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Plano | Select | Sim |
| Employees incluídos | Read-only/Number | Sim |
| Limites | Read-only | Sim |
| Ciclo de facturação | Select | Sim |
| Moeda | Select | Sim |
| Dados de facturação | Group | Sim |
| Data de início | Date | Sim |

**Botões:** `Cancelar` | `Confirmar Plano`

### FRM-S-16 - Notificações
**Apresentação:** Drawer

| Campo | Tipo | Obrigatório |
|---|---|---|
| Eventos críticos | Toggle | Não |
| Aprovações | Toggle | Não |
| Tarefa concluída | Toggle | Não |
| Tarefa falhou | Toggle | Não |
| Conhecimento desactualizado | Toggle | Não |
| Integração falhou | Toggle | Não |
| Resumo diário | Toggle | Não |
| Canal preferido | Select | Não |
| Hora do briefing | Time | Não |

**Botões:** `Cancelar` | `Guardar Preferências`

### FRM-S-17 - Branding & Outputs
**Apresentação:** Drawer

| Campo | Tipo | Obrigatório |
|---|---|---|
| Logo | Image/File | Não |
| Papel timbrado | File/Template | Não |
| Cores | Color fields | Não |
| Rodapé | Textarea | Não |
| Assinatura | File/Text | Não |
| Signatários | Multi-select | Não |
| Templates padrão | Multi-select | Não |
| Formato preferido | Select | Não |

**Botões:** `Cancelar` | `Guardar Branding`

### FRM-S-18 - Pausar / Parar
**Apresentação:** Confirmation modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Escopo | Select | Sim |
| Motivo | Textarea | Sim |
| Duração | Select/Datetime | Não |
| Cancelar tarefas pendentes | Toggle | Não |
| Preservar fila | Toggle | Não |
| Confirmação forte | Text confirmation | Para Emergency Stop |

**Botões:** `Cancelar` | `Pausar` | `Emergency Stop`

### FRM-S-19 - Auditoria / Exportar Evidência
**Apresentação:** Modal

| Campo | Tipo | Obrigatório |
|---|---|---|
| Empresa | Select | Sim |
| Employee | Select | Não |
| Task | Search | Não |
| Período | Date range | Sim |
| Tipo de evidência | Multi-select | Sim |
| Formato | Select | Sim |
| Incluir hashes | Toggle | Não |
| Incluir approvals | Toggle | Não |
| Incluir knowledge receipts | Toggle | Não |

**Botões:** `Cancelar` | `Gerar Audit Pack`

### FRM-S-20 - Preferências da Empresa
**Apresentação:** Drawer

| Campo | Tipo | Obrigatório |
|---|---|---|
| Idioma | Select | Sim |
| Timezone | Select | Sim |
| Moeda | Select | Sim |
| Formato de data | Select | Sim |
| Canal preferido | Select | Não |
| Aprovação default | Select | Não |
| Autonomia default | Select | Não |
| Retention | Select | Não |
| Briefing diário | Toggle/Time | Não |

**Botões:** `Cancelar` | `Guardar`

## 10. Mapa botão → formulário

| Botão/acção | Abre | Forma | Observação |
|---|---|---|---|
| + Novo Pedido | FRM-S-05 | Modal/Chat | Abre Chat e cria task apenas quando há intenção de trabalho. |
| Contratar Employee | FRM-S-03 | Wizard curto | Depois pode abrir FRM-S-04. |
| Adicionar Conhecimento | FRM-S-09 | Wizard curto | Dispara pipeline automático. |
| Criar Empresa | FRM-S-01 | Modal grande | Cria tenant automaticamente. |
| Convidar Utilizador | FRM-S-02 | Modal | Envia convite. |
| Configurar Employee | FRM-S-04 | Drawer | Configuração simplificada. |
| Anexar | FRM-S-06 | Modal | Pode promover ficheiro ao Knowledge Center. |
| Agendar | FRM-S-07 | Modal | Recorrência e notificações. |
| Aprovar / Rejeitar | FRM-S-08 | Inline/Modal | Mostra snapshot e risco. |
| Resolver Problema | FRM-S-10 | Modal | Somente em excepções. |
| Ligar Sistema | FRM-S-11 | Wizard | Credential nunca volta do backend. |
| Configurar Canal | FRM-S-12 | Drawer | WhatsApp/email/social. |
| Configurar Provider | FRM-S-13 | Secure modal | API key -> backend Secrets Vault. |
| Editar Permissões | FRM-S-14 | Drawer | RBAC/ABAC simplificado. |
| Alterar Plano | FRM-S-15 | Modal | Plano/subscrição. |
| Notificações | FRM-S-16 | Drawer | Preferências. |
| Branding | FRM-S-17 | Drawer | Absorve Brand & Stationery. |
| Pausar / Parar | FRM-S-18 | Confirmação | Emergency Stop com confirmação forte. |
| Exportar Evidência | FRM-S-19 | Modal | Cria Audit Pack. |
| Preferências | FRM-S-20 | Drawer | Defaults da empresa. |

## 11. Módulos técnicos que deixam de aparecer no menu normal

Permanecem no backend ou no Modo Avançado:

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
Prompt Registry
```

## 12. Mapeamento da estrutura antiga para a nova

| Estrutura anterior | Nova localização |
|---|---|
| Dashboard + Command Center | Início |
| Marketplace + Workforce + Role Packs | AI Employees |
| Central Work + Runtime + Evidence + Remote Commands + Approvals + Document Studio | Trabalho |
| Knowledge Center + MNCA + ORDKS + Passport + Necessity + Regulatory Watch + Client Policy | Conhecimento |
| WhatsApp + Email + Social + Connectors + Remote Channel | Comunicações & Integrações |
| Company Provisioning + Users + Billing + Security + Audit + Prompt Registry | Empresa & Administração |

## 13. Consolidação dos formulários anteriores

A simplificação não apaga capacidades. Consolida formulários antigos em superfícies menores:

| Formulários/áreas anteriores | Destino v2 | Tratamento |
|---|---|---|
| Criar/Importar/Editar Empresa | FRM-S-01 | MERGE; importação pode ser opção dentro do mesmo formulário |
| Convidar Utilizador | FRM-S-02 | KEEP simplificado |
| Associar/Contratar Employee | FRM-S-03 | KEEP simplificado |
| Readiness, Activação, Supervisor, Modelo, Runtime Profile | FRM-S-04 | MERGE; detalhes técnicos ficam Advanced |
| Nova Tarefa | FRM-S-05 | CHAT-FIRST; formulário tradicional apenas como modo expandido |
| Anexos/Fornecer Dados | FRM-S-06 | MERGE |
| Agendar/Recorrência | FRM-S-07 | KEEP |
| Approval, Modify, Reject | FRM-S-08 | MERGE e INLINE |
| Upload/Fonte Oficial/Procedimento/Política/Template/Nova Versão | FRM-S-09 | MERGE por tipo dinâmico |
| Review/Conflict/Outdated/Missing Source | FRM-S-10 | MERGE e EXCEPTION-ONLY |
| MNCA, Gap, Knowledge Necessity, Release técnico | Modo Avançado / automático | HIDE do utilizador normal |
| Ligar/Testar/Reautorizar Conector | FRM-S-11 | MERGE |
| WhatsApp/Email/Social config | FRM-S-12 | MERGE por channel type |
| Provider de IA / API Key | FRM-S-13 | KEEP seguro; credential no backend |
| Permissões/Roles | FRM-S-14 | MERGE |
| Planos/Upgrade/Downgrade | FRM-S-15 | MERGE |
| Notificações/Briefing | FRM-S-16 | MERGE |
| Logo/Brand/Template/Signatário | FRM-S-17 | MERGE dentro de Empresa |
| Pause/Stop/Emergency Stop | FRM-S-18 | MERGE com nível de confirmação por risco |
| Evidence Search/Audit Pack | FRM-S-19 | MERGE |
| Preferências gerais | FRM-S-20 | MERGE |
| Training, Reliability, Certification, OTCTEC, Pilot technical forms | Advanced / backend workflow | HIDE ou AUTOMATE; surfacing only when action is required |

## 14. Segurança da API Key

```text
FRONTEND
↓ envia credential uma única vez
BACKEND
↓
SECRETS VAULT
↓
PROVIDER
```

Nunca guardar chaves em `localStorage`, `sessionStorage`, variáveis `NEXT_PUBLIC_*`, logs ou contexto do modelo.

## 15. Métrica de simplificação

- **6 módulos principais visíveis**
- **16 ecrãs principais**
- **20 formulários principais**
- **40 tabelas canónicas agrupadas por domínio**
- **12 catálogos canónicos**
- **8 tabelas principais de interface**
- **1 Chatbox central**
- **5 estados visíveis de Employee**

## 16. Resultado esperado

O utilizador normal deve conseguir criar empresa, contratar Employee, fornecer conhecimento, pedir trabalho, aprovar e receber resultados sem abrir qualquer engine técnico.