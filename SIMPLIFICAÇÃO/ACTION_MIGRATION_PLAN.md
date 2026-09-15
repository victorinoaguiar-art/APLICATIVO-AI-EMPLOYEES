# PLANO DE MIGRAÇÃO DE ACÇÕES (ACTION_MIGRATION_PLAN)
## AETF-500 — Cronograma e Validação da Transição de Handlers

### 1. Resumo Executivo
O `ACTION_MIGRATION_PLAN` descreve o plano executado para migrar todas as acções da plataforma do modelo legado (fallback universal) para a arquitectura baseada em `ActionRouter` e `classifyAction`.

---

### 2. Tabela de Migração por Componente

| Componente | Acções Migradas | Handler Anterior | Handler Actual | Estado da Migração |
| :--- | :--- | :--- | :--- | :--- |
| `DesignSystem.tsx` | Botões genéricos sem `onClick` | `openGenericModal()` | `handleButtonClick()` com `classifyAction()` | **CONCLUÍDO** |
| `OrganizationScreens.tsx` | Criar Empresa | Modal de 1 campo | `CompanyWizard` em 3 passos | **CONCLUÍDO** |
| `OverviewScreens.tsx` | Acções de Visão Geral | Modal de execução | Filtering / Toasts contextuais | **CONCLUÍDO** |
| `WorkforceScreens.tsx` | Retomar / Pausar | Modal de execução | Modais contextuais de estado | **CONCLUÍDO** |
| `KnowledgeScreens.tsx` | Ingestão / Exportação | Modal genérico | Wizards / Downloads directos | **CONCLUÍDO** |

---

### 3. Validação da Migração
- [x] Nenhuma dependência restante de `GenericExecutionForm` em acções de UI.
- [x] Nenhuma falha em tempo de compilação ou execução (`npm run build` OK).
- [x] Preservação de IDs técnicos no backend e ledger imutável para tarefas reais.
