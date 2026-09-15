# UI_LABEL_RENAME_MAP — Mapeamento de Renomeação de Rótulos de UI

**Documento:** Matriz de Equivalência Visual (Jargão Técnico → Linguagem de Produto)  
**Projeto:** AETF-500  
**Data:** 14 de Setembro de 2026  

---

## 1. MÓDULOS E CATEGORIAS DA SIDEBAR

| Rótulo Anterior (Técnico) | Novo Rótulo Purificado (Produto) | Razão de UX |
|---|---|---|
| `MOD-01 Início` | `Início` | Eliminar código de módulo desnecessário ao utilizador. |
| `MOD-02 AI Employees` | `AI Employees` | Manter o nome claro da categoria. |
| `MOD-03 Trabalho` | `Trabalho` | Foco na ação operacional do utilizador. |
| `MOD-04 Conhecimento` | `Conhecimento` | Linguagem direta de negócio. |
| `MOD-05 Comunicações & Integrações` | `Comunicações & Integrações` | Identificação clara dos canais e conectores. |
| `MOD-06 Empresa & Administração` | `Empresa & Administração` | Agrupamento administrativo consolidado. |

---

## 2. ECRÃS PRINCIPAIS

| Código Técnico Interno | Nome Anterior | Novo Nome Purificado na UI |
|---|---|---|
| `HOME-01` / `APP-01` | Dashboard Executivo | Painel do Dia |
| `EMP-01` / `WF-02` | Marketplace AI Employees (500) | Catálogo de AI Employees |
| `EMP-02` / `WF-01` | Centro de Comando Workforce | Meus AI Employees |
| `EMP-03` / `WF-03` | Detalhe do AI Employee 360 | Detalhe do AI Employee |
| `EMP-04` / `WF-04` | Role Packs & SOPs | Equipas & Perfis |
| `WORK-01` / `TASK-01` | Central de Trabalho (Atribuição) | Conversas |
| `WORK-02` / `TASK-02` | Detalhe da Tarefa & Kanban | Tarefas |
| `WORK-03` / `TASK-06` | Centro de Aprovações HITL | Resultados & Aprovações |
| `KNOW-01` / `KNO-01` | Knowledge Center & RAG | Biblioteca de Conhecimento |
| `KNOW-02` / `KNO-03` | Physical Source Explorer | Detalhe da Fonte |
| `COMM-01` / `COM-01` | Omnichannel Operations | Comunicações |
| `COMM-02` / `INT-01` | Integrações & Conectores | Integrações |
| `ADMIN-01` / `ORG-01` | Empresas & Tenants | Empresa |
| `ADMIN-02` / `INT-02` | Segurança & Permissões | Utilizadores & Permissões |
| `ADMIN-03` / `COMMERCE-01`| Planos & Subscrições | Plano & Facturação |
| `ADMIN-04` / `INT-03` | Audit & Evidence Receipts | Segurança & Auditoria |
| `ADMIN-05` / `INT-04` | Configurações & Scheduler | Configurações |

---

## 3. TERMOS E CONCEITOS DO SISTEMA

| Termo Técnico Legado | Substituto na UI Normal | Destino do Termo Técnico |
|---|---|---|
| `Tenant` | `Empresa` ou `Ambiente Privado` | Mantido em `tenant_id` no backend e logs. |
| `Provisioning` | `Configuração Inicial` | Mantido em `provisioning_status` no backend. |
| `Readiness` | `Prontidão` ou `Estado` | Mantido em `readiness_score` no backend. |
| `RolePack` | `Perfil da Função` | Mantido no package `@ai-employee/rolepack`. |
| `Runtime Engine` | `Execução` | Mantido no motor de runtime no backend. |
| `Model Router` | `Selecção de IA` | Mantido no serviço de routing de modelos. |
| `Evidence Gate` | `Verificação de Execução` | Mantido na emissão de selos digitais. |
| `Knowledge Object` | `Conteúdo Processado` | Mantido na estrutura de índices RAG. |
