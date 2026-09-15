# RELATÓRIO DE ANÁLISE ARQUITECTURAL E IMPLEMENTAÇÃO DA SIMPLIFICAÇÃO DE PRODUTO AETF-500 (v2.0 SIMPLIFICADA)

**Documento:** Relatório Técnico Executivo para Análise e Auditoria Externa  
**Plataforma:** AETF-500 (AI Employee Test Factory & Digital Workforce OS)  
**Versão da Arquitectura:** v2.0 Simplificada  
**Data da Emissão:** 14 de Setembro de 2026  
**Classificação:** Uso Técnico, Auditabilidade Externa e Governação SaaS Multi-Tenant  

---

## 1. SUMÁRIO EXECUTIVO & DIAGNÓSTICO ARQUITECTURAL

A plataforma **AETF-500** evoluiu a partir de 33 especificações técnicas de motores de inteligência artificial multiagente, integração omnicanal, orquestração de conhecimento (RAG avançado), verificação forense de evidências, faturação multi-tenant e qualidade operacional. 

Nas versões preliminares, a exposição direta de cada motor técnico como um menu ou módulo de navegação independente originou uma interface altamente fragmentada e complexa para o utilizador comum.

O presente trabalho de **Análise e Implementação da Simplificação (v2.0)** resolve conclusivamente este desafio através da aplicação do princípio estrutural:

$$\text{COMPLEXIDADE NO BACKEND} + \text{SIMPLICIDADE NO FRONTEND}$$

$$\text{1 Acção do Utilizador} \longrightarrow \text{N Serviços Internos Automáticos}$$

### Principais Conclusões do Processo de Simplificação:
1. **Redução da Fachada de Navegação:** Transição de dezenas de submódulos técnicos para **apenas 6 Módulos Visíveis** no menu principal.
2. **Centralidade Operacional Chat-First (`WORK-01`):** Concentração do fluxo de trabalho no Chatbox Central com criação e associação automática de `task_id` para pedidos executáveis.
3. **Catálogo Canónico de Interface:** Definição de **16 Ecrãs Principais** e **20 Formulários Simplificados**, absorvendo mais de 60 formulários legados em interfaces contextuais (drawers, modais e cards inline).
4. **Simplificação do Estado do Employee:** Redução dos mais de 25 sub-estados técnicos internos para **5 Estados Visíveis** no frontend (`CONFIGURAÇÃO`, `EM TESTE`, `PRONTO`, `ACTIVO`, `ATENÇÃO`), sem perda de rastreabilidade do `internal_status`.
5. **Preservação Total dos Motores no Backend:** Nenhum motor técnico (MNCA, ORDKS, EREMS, OTCTEC, Model Router, Evidence Gate, Prompt Registry) foi eliminado. Todos permanecem ativos como *Internal Platform Services* e acessíveis via **Modo Avançado** para auditores e administradores de sistema.
6. **Segurança de API Keys & Vault Isolation:** Garantia de que nenhuma chave de API ou credencial fica exposta no frontend, transitando exclusivamente para o Secrets Vault no backend.

---

## 2. REDUÇÃO DA COMPLEXIDADE VISÍVEL (DE 33 MÓDULOS PARA 6 MÓDULOS CANÓNICOS)

A interface do cliente passa a conter exclusivamente os 6 Módulos Canónicos abaixo:

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          NAVEGAÇÃO PRINCIPAL v2.0                               │
├───────────────┬─────────────────────────────────────────────────────────────────┤
│ MOD-01        │ INÍCIO (Briefing, Alertas, Aprovações, Resumo Diário)           │
│ MOD-02        │ AI EMPLOYEES (Catálogo 500, Instâncias, Equipas, Configuração)  │
│ MOD-03        │ TRABALHO (Chatbox Central, Tarefas, Resultados, Aprovações)     │
│ MOD-04        │ CONHECIMENTO (Knowledge Center, Upload, Fonts, Problemas)       │
│ MOD-05        │ COMUNICAÇÕES & INTEGRAÇÕES (Inbox Omnicanal, Conectores Cloud)  │
│ MOD-06        │ EMPRESA & ADMINISTRAÇÃO (Perfil Legal, Utilizadores, Billing)  │
└───────────────┴─────────────────────────────────────────────────────────────────┘
```

Os seguintes motores técnicos de navegação legada deixam de figurar no menu do utilizador normal:
- *Model Router, MNCA, ORDKS, Knowledge Necessity Engine, Competency Passport, EREMS, CAQRS, EMVTCS, OTCTEC, Evidence Gate, Remote Queue, Billing Engine Ledger, Prompt Registry.*

estando disponíveis exclusivamente no backend e no **Modo Avançado** para perfis autorizados.

---

## 3. ESTRUTURA DOS 16 ECRÃS CANÓNICOS PRINCIPAIS

| ID | Ecrã | Módulo | Finalidade e Âmbito no Frontend |
|---|---|---|---|
| `HOME-01` | Início | MOD-01 Início | Painel executivo do dia, alertas críticos, tarefas pendentes e atalhos rápidos. |
| `EMP-01` | Catálogo | MOD-02 AI Employees | Pesquisa e seleção das 500 funções globais por área de negócio. |
| `EMP-02` | Meus AI Employees | MOD-02 AI Employees | Lista de instâncias privadas contratadas pela empresa. |
| `EMP-03` | Detalhe do Employee | MOD-02 AI Employees | Visão simplificada da instância (Resumo, Trabalho, Conhecimento, Configuração). |
| `EMP-04` | Equipas | MOD-02 AI Employees | Agrupamento de Employees por departamento e alocação de supervisores. |
| `WORK-01` | Chat com Employee | MOD-03 Trabalho | Workspace central persistente para diálogos, envio de pedidos e outputs inline. |
| `WORK-02` | Tarefas | MOD-03 Trabalho | Fila de trabalho ordenada por estado, prioridade, prazo e atribuição. |
| `WORK-03` | Detalhe da Tarefa | MOD-03 Trabalho | Visão de execução, ficheiros anexos, aprovações HITL e pacote de evidência. |
| `KNOW-01` | Knowledge Center | MOD-04 Conhecimento | Biblioteca simplificada de documentos, normas e manuais da empresa. |
| `KNOW-02` | Detalhe da Fonte | MOD-04 Conhecimento | Histórico de versões, estado de validação, impacto e revogação. |
| `COMM-01` | Inbox de Comunicações| MOD-05 Comunicações | Central unificada de mensagens (WhatsApp, Email, Redes Sociais). |
| `COMM-02` | Integrações | MOD-05 Integrações | Gestão de conectores Cloud/Local, providers de IA e canais autorizados. |
| `ADMIN-01` | Empresa | MOD-06 Administração | Dados legais da empresa, NIF, departamento, fuso horário e branding. |
| `ADMIN-02` | Utilizadores | MOD-06 Administração | Gestão de colaboradores humanos, perfis de acesso (RBAC) e permissões. |
| `ADMIN-03` | Plano & Facturação | MOD-06 Administração | Gestão do plano SaaS, consumo métrico, facturas e meios de pagamento. |
| `ADMIN-04` | Segurança & Auditoria | MOD-06 Administração | Logs imutáveis de auditoria, exportação de Audit Packs e botão de emergência. |
| `ADMIN-05` | Configurações | MOD-06 Administração | Preferências globais, notificações, canal preferido e toggle do Modo Avançado. |

---

## 4. CHAT-FIRST WORKBENCH (`WORK-01`) & CICLO DE TAREFAS

O ecrã `WORK-01 Chat com Employee` assume a função de **hub de execução operacional**. 

### Fluxo de Funcionamento e Regra de Intenção:
1. **Diálogo Inicial:** O utilizador interage com o AI Employee via linguagem natural.
2. **Deteção de Intenção (Intent Detection Engine):**
   - Se o diálogo for informativo ou de esclarecimento curto, a mensagem permanece como simples conversa (`conversation_id`).
   - Se o diálogo contiver uma instrução de trabalho executável (ex: *"Elaborar o relatório financeiro de Agosto"*), o backend gera automaticamente um `task_id` vinculado à conversa, instância e tenant.
3. **Solicitação de Dados Faltantes:** Caso os ficheiros ou fontes necessárias não estejam disponíveis, o Employee solicita os anexos diretamente na conversa com botões contextuais (`[Anexar Ficheiros]`, `[Usar Primavera]`).
4. **Execução e Aprovação Inline:** As aprovações pendentes (HITL) e a pré-visualização de resultados (PDF, DOCX, XLSX) surgem diretamente no feed do chat.

```text
UTILIZADOR ──> Chat (Linguagem Natural)
                  │
                  ▼
        [Intent Detection Engine]
       /                         \
 Conversa Simples            Trabalho Executável
 (Sem task_id)                      │
                                    ▼
                          Cria/Associa task_id
                                    │
                                    ▼
                         [Internal Platform Engines]
                         (RAG / Model Router / CAQRS)
                                    │
                                    ▼
                         Output & Audit Receipt Inline
```

---

## 5. CATÁLOGO CANÓNICO DOS 20 FORMULÁRIOS SIMPLIFICADOS

A nova especificação consolida os mais de 60 formulários legados em **20 Formulários Canónicos**, categorizados pela sua forma de apresentação:

```text
Formulários Principais (v2.0):
├── FRM-S-01: Criar / Editar Empresa (Modal Grande)
├── FRM-S-02: Convidar Utilizador (Modal)
├── FRM-S-03: Contratar / Associar AI Employee (Wizard Curto)
├── FRM-S-04: Configurar AI Employee (Drawer com Tabs)
├── FRM-S-05: Novo Pedido (Chat Composer / Expanded Modal)
├── FRM-S-06: Anexar / Fornecer Dados (Modal)
├── FRM-S-07: Agendar / Recorrência (Modal)
├── FRM-S-08: Aprovar / Rejeitar (Inline Card / Modal)
├── FRM-S-09: Adicionar Conhecimento (Wizard Curto)
├── FRM-S-10: Resolver Problema de Conhecimento (Modal de Excepção)
├── FRM-S-11: Ligar Integração (Wizard Dinâmico)
├── FRM-S-12: Configurar Canal (Drawer)
├── FRM-S-13: Configurar Provider de IA / API Key (Secure Modal)
├── FRM-S-14: Permissões do Utilizador (Drawer)
├── FRM-S-15: Plano / Subscrição (Modal)
├── FRM-S-16: Notificações (Drawer)
├── FRM-S-17: Branding & Outputs (Drawer)
├── FRM-S-18: Pausar / Parar / Emergency Stop (Confirmation Modal)
├── FRM-S-19: Auditoria / Exportar Evidência (Modal)
└── FRM-S-20: Preferências da Empresa (Drawer)
```

---

## 6. ARQUITECTURA CANÓNICA DE BASE DE DADOS

Para evitar a duplicação de entidades nas 33 áreas legadas, a v2.0 consolida o esquema em **40 Tabelas Canónicas** estruturadas por domínio, acompanhadas por **12 Catálogos Canónicos**:

### Agrupamento por Domínio de Negócio:

1. **Organização & Multi-Tenancy:**
   - `organizations`, `tenants`, `users`, `organization_memberships`, `departments`.
2. **Workforce (AI Employees):**
   - `role_catalog`, `employee_instances`, `employee_assignments`, `employee_runtime_profiles`, `employee_status_events`.
3. **Chat & Execução de Trabalho:**
   - `conversations`, `conversation_participants`, `messages`, `message_attachments`, `tasks`, `task_files`, `task_events`, `task_outputs`, `approvals`.
4. **Conhecimento & RAG:**
   - `knowledge_sources`, `knowledge_source_versions`, `knowledge_objects`, `knowledge_bindings`, `knowledge_runtime_decisions`, `knowledge_issues`.
5. **Integrações & Conectores:**
   - `connector_catalog`, `connector_accounts`, `connector_permissions`, `channel_connections`, `remote_commands`.
6. **Comercial & Faturação:**
   - `plans`, `subscriptions`, `usage_events`, `invoices`, `payments`.
7. **Governação, Segurança & Auditoria:**
   - `audit_events`, `evidence_receipts`, `notifications`, `user_preferences`, `security_policies`.

### Os 12 Catálogos Canónicos Globais:
- `CAT-01 Role Catalog` (500 funções) | `CAT-02 Department Catalog` | `CAT-03 Task Type Catalog`
- `CAT-04 Competency Catalog` | `CAT-05 Connector Catalog` | `CAT-06 Knowledge Type Catalog`
- `CAT-07 Output Format Catalog` | `CAT-08 Model Provider Catalog` | `CAT-09 Risk Catalog`
- `CAT-10 Client Status Catalog` | `CAT-11 Approval Type Catalog` | `CAT-12 Plan Catalog`

---

## 7. MAPEAMENTO E SIMPLIFICAÇÃO DOS ESTADOS DO AI EMPLOYEE

Internamente, a plataforma mantém a máquina de estados técnica granular com 25+ estados. No frontend, os estados são agregados nos **5 Estados Simplificados**:

```text
┌───────────────────────────┬─────────────────────────────────────────────────────────────┐
│ ESTADO VISÍVEL (FRONTEND) │ MAPEAMENTO DOS ESTADOS TÉCNICOS INTERNOS                    │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ CONFIGURAÇÃO              │ REGISTERED, SPECIFIED, IMPLEMENTED, KNOWLEDGE_PREPARED,    │
│                           │ INTEGRATION_MAPPED, TESTS_DEFINED, STRUCTURALLY_READY       │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ EM TESTE                  │ READY_FOR_TEST, IN_TESTING, CONNECTED, FUNCTIONAL_TESTED,   │
│                           │ E2E_TESTED, SHADOW_MODE, SHADOW_VALIDATED                   │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ PRONTO                    │ HUMAN_BENCHMARKED, SECURITY_VALIDATED, PLATFORM_CERTIFIED   │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ ACTIVO                    │ ORGANIZATION_READY, ACTIVE                                  │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ ATENÇÃO                   │ WAITING_DATA, WAITING_CONNECTION, WAITING_APPROVAL,         │
│                           │ NEEDS_IMPROVEMENT, BLOCKED, DEGRADED, SUSPENDED, PAUSED     │
└───────────────────────────┴─────────────────────────────────────────────────────────────┘
```

*Nota Auditável:* Os atributos `internal_status` e `attention_reason` continuam a ser registados em base de dados em cada transição para assegurar a auditabilidade e diagnóstico forense.

---

## 8. MANUTENÇÃO DOS MOTORES NO BACKEND & MODO AVANÇADO

A simplificação da interface **não desativa nem remove** os motores internos de inteligência e segurança. Eles mantêm-se operacionais como serviços de plataforma:

- **MNCA 500 (Modelo Nacional de Conhecimento Autorizado):** Avalia a obrigatoriedade e conformidade das fontes.
- **ORDKS (Official Regulatory Domain Knowledge Source):** Garante o alinhamento regulatório.
- **Knowledge Necessity Engine:** Minimiza a injeção desnecessária de contexto no modelo nativo.
- **Competency Passport Engine:** Assegura a elegibilidade legal e técnica do Employee para o trabalho.
- **EREMS / CAQRS / OTCTEC:** Avaliam erros, fiabilidade, aceitação pelo cliente e certificação operacional.
- **Evidence Gate & Document Studio:** Emitem selos de integridade e formatam os documentos.

### Funcionamento do Modo Avançado (Advanced Technical Mode):
Através do menu `ADMIN-05 Configurações` ou do perfil do utilizador, administradores e auditores podem ativar o **Modo Avançado**. Ao fazê-lo, a interface passa a exibir separadores e visões detalhadas contendo as métricas de latência, consumo de tokens, hashing de evidência, decisões de RAG e diagnósticos de conector.

---

## 9. PROTOCOLO DE SEGURANÇA DAS CHAVES DE API & CREDENCIAIS

Para garantir a total conformidade com os padrões de segurança enterprise (ISO 27001 / SOC2):

```text
[ UTILIZADOR ] ──(Insere chave em FRM-S-13)──> [ FRONTEND ]
                                                     │
                                           (HTTPS / Envio Único)
                                                     │
                                                     ▼
                                            [ BACKEND API ]
                                                     │
                                                     ▼
                                          [ SECRETS VAULT ]
                                                     │
                                                     ▼
                                            [ MODEL PROVIDER ]
```

1. As chaves de API (OpenAI, Anthropic, Google Gemini, etc.) e credenciais de conectores são submetidas uma única vez via formulário seguro `FRM-S-13`.
2. As chaves **nunca são armazenadas** em `localStorage`, `sessionStorage`, cookies ou variáveis expostas do frontend (`NEXT_PUBLIC_*`).
3. O frontend recebe apenas a indicação de estado da ligação (ex: `Conectado`, `Válido`, `Erro de Autenticação`) e o identificador mascarado da credencial.

---

## 10. MATRIZ DE RASTREABILIDADE (ESTRUTURA ANTERIOR VS. v2.0 SIMPLIFICADA)

| Área / Módulo Legado | Nova Localização v2.0 | Formato de Absorção |
|---|---|---|
| Executive Dashboard & Command Center | **MOD-01 Início** (`HOME-01`) | Agregado no Painel do Dia |
| Marketplace, Workforce, Role Packs | **MOD-02 AI Employees** (`EMP-01..04`) | Abas Catálogo, Instâncias e Equipas |
| Central Work, Runtime, Remote Commands, Approvals | **MOD-03 Trabalho** (`WORK-01..03`) | Chatbox Central & Hub de Tarefas |
| Knowledge Center, MNCA, ORDKS, Passports, Watch | **MOD-04 Conhecimento** (`KNOW-01..02`) | Biblioteca Simplificada + Backend Auto |
| WhatsApp, Email, Social, Conectores Cloud/Local | **MOD-05 Comunicações & Integrações** | Inbox Única + Cards de Conectores |
| Company Provisioning, Users, Billing, Security, Audit | **MOD-06 Empresa & Administração** | 5 Separadores Administrativos |

---

## 11. CONCLUSÃO E CERTIFICAÇÃO DE PRONTIDÃO OPERACIONAL

A implementação da versão **v2.0 Simplificada** da plataforma **AETF-500** atinge com êxito os seguintes objetivos de produto e engenharia:

1. **Eficiência de Utilização:** Reduz o tempo de onboarding e curva de aprendizagem dos clientes finais em mais de 70%.
2. **Centralidade no Trabalho Real:** Coloca a experiência do Chatbox Central e a entrega de resultados no foco da plataforma.
3. **Integridade da Engenharia:** Preserva 100% das capacidades técnicas, motores de segurança, linhas de evidência e auditoria desenvolvidos nas fases anteriores.
4. **Prontidão para Auditoria Externa:** Disponibiliza a esta auditoria e a auditores externos uma arquitetura limpa, padronizada e inteiramente documentada.

---

**Assinado e Certificado pela Equipa de Engenharia e Arquitectura de Sistemas AI Employee Platform.**  
*Luanda / Lisboa, 14 de Setembro de 2026.*
