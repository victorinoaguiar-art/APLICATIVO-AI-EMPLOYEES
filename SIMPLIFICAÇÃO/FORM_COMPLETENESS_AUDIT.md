# AUDITORIA DE COMPLETUDE DOS FORMULÁRIOS (FORM_COMPLETENESS_AUDIT)
## AETF-500 — Estado de Implementação dos 20 Formulários Canónicos

### 1. Resumo Executivo
Esta auditoria analisa a conformidade e o nível de completude de cada um dos 20 formulários canónicos exigidos pela especificação `Prompt_AETF500_Remover_Prefixos_UI_e_Completar_Formularios.md`.

---

### 2. Matriz dos 20 Formulários Canónicos

| Nº | Formulário Canónico | Componente / Localização | Estado Actual na UI | Nível de Completude |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Criar / Editar Empresa** | `OrganizationScreens.tsx` (`CompaniesTenantsScreen`) | **Wizard 3 Passos Interativo** (Identificação, Contactos & Admin com "Usar os meus dados", Configuração Inicial) | **100% COMPLETO** |
| **02** | **Convidar Utilizador** | `OrganizationScreens.tsx` / `PlatformScreens.tsx` | Formulário contextual com perfis RBAC (Admin, Gestor, Aprovador, etc.) | **MAPEADO NO REGISTRY** |
| **03** | **Contratar AI Employee** | `WorkforceScreens.tsx` (`MarketplaceScreen`) | **Modal Interativo Dedicado** (Seleção de 500 Roles, Missão, Autonomia L3, Custo, Provisionamento) | **100% COMPLETO** |
| **04** | **Configurar AI Employee** | `WorkforceScreens.tsx` (`CompanyDetail360Screen`) | Abas de configuração (Trabalho, Conhecimento, Integrações, Autonomia) | **MAPEADO NO REGISTRY** |
| **05** | **Novo Pedido / Tarefa** | `WorkScreens.tsx` (`WorkCenterScreen` & Chatbox) | **Chatbox Central Interativo + Modal de Tarefa** com seleção de Role, prioridade e SOP | **100% COMPLETO** |
| **06** | **Anexar / Fornecer Dados** | `WorkScreens.tsx` / Chatbox Workspace | Upload contextual no chat e formulário de tarefas | **100% COMPLETO** |
| **07** | **Agendar / Recorrência** | `WorkScreens.tsx` / `SettingsSchedulerScreen` | Gestão de recorrências e horários de execução | **MAPEADO NO REGISTRY** |
| **08** | **Aprovar / Rejeitar** | `WorkScreens.tsx` (`ApprovalScreens`) | Decisioning card com níveis de risco e feedback | **MAPEADO NO REGISTRY** |
| **09** | **Adicionar Conhecimento** | `KnowledgeScreens.tsx` (`KnowledgeCenterScreen`) | **Modal Interativo Dedicado** (Título, Categoria, Âmbito, Upload com Hash SHA-256) | **100% COMPLETO** |
| **10** | **Resolver Problema de Conhecimento** | `KnowledgeScreens.tsx` | Painel de lacunas e saneamento de fontes | **MAPEADO NO REGISTRY** |
| **11** | **Ligar Integração** | `PlatformScreens.tsx` (`IntegrationsConnectorsScreen`) | Catálogo de conectores (WhatsApp, Email, Drive, ERP, Bancos) | **MAPEADO NO REGISTRY** |
| **12** | **Configurar Canal** | `CommunicationScreens.tsx` (`OmnichannelScreen`) | Configurações de canal e roteamento de mensagens | **MAPEADO NO REGISTRY** |
| **13** | **Configurar Provider de IA** | `PlatformScreens.tsx` (`SettingsSchedulerScreen`) | Configuração de modelos (Gemini, Claude, GPT, Fallback) | **MAPEADO NO REGISTRY** |
| **14** | **Permissões do Utilizador** | `PlatformScreens.tsx` (`SecurityPermissionsScreen`) | RBAC/ABAC com isolamento multi-tenant | **MAPEADO NO REGISTRY** |
| **15** | **Plano / Subscrição** | `OverviewScreens.tsx` / `PlatformScreens.tsx` | Gestão de planos SaaS e faturação | **MAPEADO NO REGISTRY** |
| **16** | **Notificações** | `PlatformScreens.tsx` (`SettingsSchedulerScreen`) | Canais de alerta (Email, WhatsApp, Push) | **MAPEADO NO REGISTRY** |
| **17** | **Branding & Outputs** | `PlatformScreens.tsx` | Personalização de logótipo, cores e comprovativos | **MAPEADO NO REGISTRY** |
| **18** | **Pausar / Retomar Employee** | `DesignSystem.tsx` (`ScreenLayout`) | **Modais Contextuais Dedicados** (Motivo de pausa obrigatório, retoma limpa) | **100% COMPLETO** |
| **19** | **Auditoria / Exportar Evidência**| `PlatformScreens.tsx` (`AuditEvidenceReceiptsScreen`) | Exportação de receipts e audit packs selados criptograficamente | **100% COMPLETO** |
| **20** | **Preferências da Empresa** | `OrganizationScreens.tsx` | Moeda, fuso horário, jurisdição fiscal e dados institucionais | **100% COMPLETO** |

---

### 3. Conclusão da Auditoria
- **Formulários Críticos Operacionais**: Todos os formulários primários de fluxo de utilizador (Criar Empresa, Contratar AI Employee, Criar Tarefa via Chat/Modal, Ingestão de Conhecimento, Pausar e Retomar) encontram-se **100% completos, interactivos e validados**.
- **Erradicação de Formulários Fantasmas**: Nenhum formulário abre o antigo modal genérico com termos técnicos de backend expostos.
