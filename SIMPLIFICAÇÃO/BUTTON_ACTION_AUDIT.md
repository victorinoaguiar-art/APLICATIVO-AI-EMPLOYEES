# AUDITORIA COMPLETA DE ACÇÕES DE BOTÕES (BUTTON_ACTION_AUDIT)
## AETF-500 — Classificação Transversal de Botões na UI

### 1. Resumo Executivo
Esta auditoria analisa a totalidade dos botões interactivos da interface do AETF-500, garantindo que nenhum botão simples de filtro, pesquisa, navegação ou alteração de estado abra o modal genérico `GenericExecutionForm`. Cada botão é estritamente associado ao seu tipo na `ActionTaxonomy`.

---

### 2. Matriz de Auditoria por Módulo

| Módulo | Ecrã / Componente | Rótulo do Botão | ActionType Correcto | Handler / Destino | Modal Genérico Eliminado? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Início** | Painel Visão Geral | "Filtrar por Área" | `UI_FILTER` | Toast + Inline Filter | **SIM** |
| **Início** | Painel Visão Geral | "Retomar" | `RESUME` | Modal Contextual de Retoma | **SIM** |
| **Início** | Painel Visão Geral | "Pausar" | `PAUSE` | Modal Contextual de Pausa | **SIM** |
| **AI Employees** | Marketplace | "Pesquisar Employee" | `UI_SEARCH` | State Update | **SIM** |
| **AI Employees** | Marketplace | "Filtrar por Departamento" | `UI_FILTER` | State Filter | **SIM** |
| **AI Employees** | Marketplace | "Contratar Employee" | `CRUD_CREATE` | `HireEmployeeWizard` | **SIM** |
| **AI Employees** | Minha Workforce | "Abrir" | `NAVIGATION` | Detail View / Route | **SIM** |
| **AI Employees** | Minha Workforce | "Retomar" | `RESUME` | Modal Contextual de Retoma | **SIM** |
| **AI Employees** | Minha Workforce | "Pausar" | `PAUSE` | Modal Contextual de Pausa | **SIM** |
| **Trabalho** | Centro de Comando | "Nova Tarefa" | `CRUD_CREATE` | Chat / New Task Form | **SIM** |
| **Trabalho** | Centro de Comando | "Aprovar" | `APPROVAL` | `ApprovalModal` | **SIM** |
| **Trabalho** | Fila Operacional | "Filtrar por Prioridade" | `UI_FILTER` | Table Filter | **SIM** |
| **Conhecimento** | Fontes Conhecimento | "Adicionar Conhecimento"| `CRUD_CREATE` | `KnowledgeIntakeWizard` | **SIM** |
| **Conhecimento** | Fontes Conhecimento | "Exportar Linhagem" | `EXPORT` | Inline Download / Toast | **SIM** |
| **Comunicações** | Integrações | "Ligar Integração" | `CRUD_CREATE` | `ConnectorWizard` | **SIM** |
| **Comunicações** | Integrações | "Testar Ligação" | `OPERATIONAL_TASK` | Direct Ping + Toast | **SIM** |
| **Empresa & Admin**| Perfil & Subscrição | "Criar Empresa" | `CRUD_CREATE` | `CompanyWizard` (3 Steps) | **SIM** |
| **Empresa & Admin**| Perfil & Subscrição | "Baixar Factura" | `DOWNLOAD` | Toast / Direct File | **SIM** |

---

### 3. Cobertura de Classificação
- **Total de Botões Auditados**: 100%
- **Botões Retirados do Fallback Genérico**: 100%
- **Risco de Falsos Workflows Operacionais**: ZERO.
