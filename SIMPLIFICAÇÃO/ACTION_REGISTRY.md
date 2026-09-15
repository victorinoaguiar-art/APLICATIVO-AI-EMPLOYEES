# REGISTO CENTRAL DE ACÇÕES (ACTION_REGISTRY)
## AETF-500 — Catálogo de Acções e Comportamentos Associados

### 1. Resumo Executivo
O `ACTION_REGISTRY` define a associação única entre cada acção da interface do utilizador, o seu `ActionType`, se necessita de formulário, se requer confirmação de risco e o nível de auditoria aplicável.

---

### 2. Tabela do Registry de Acções

| Key da Acção | Rótulo Visível | ActionType | Requer Form? | Requer Task? | Nível de Auditoria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `marketplace.filter.area` | Filtrar por Área | `UI_FILTER` | Não | Não | `NONE` |
| `marketplace.search` | Pesquisar Employee | `UI_SEARCH` | Não | Não | `NONE` |
| `employee.resume` | Retomar | `RESUME` | Não (Modal Confirmação) | Não | `BUSINESS_EVENT` |
| `employee.pause` | Pausar | `PAUSE` | Não (Modal Motivo) | Não | `BUSINESS_EVENT` |
| `employee.hire` | Contratar Employee | `CRUD_CREATE` | Sim (`HireEmployeeWizard`) | Não | `BUSINESS_EVENT` |
| `company.create` | Criar Empresa | `CRUD_CREATE` | Sim (`CompanyWizard`) | Não | `BUSINESS_EVENT` |
| `knowledge.add` | Adicionar Conhecimento | `CRUD_CREATE` | Sim (`KnowledgeIntakeWizard`)| Não | `BUSINESS_EVENT` |
| `connector.connect` | Ligar Integração | `CRUD_CREATE` | Sim (`ConnectorWizard`) | Não | `SECURITY_EVENT` |
| `task.create` | Nova Tarefa | `CRUD_CREATE` | Sim (Chat / Task Form) | Sim | `OPERATIONAL_EVIDENCE` |
| `task.execute` | Reconciliar Banco | `OPERATIONAL_TASK` | Sim | Sim | `OPERATIONAL_EVIDENCE` |
| `approval.decide` | Aprovar Envio | `APPROVAL` | Sim (`ApprovalModal`) | Não | `OPERATIONAL_EVIDENCE` |
| `system.emergency_stop`| Parar Todos | `SYSTEM_CONTROL` | Sim (Confirmação Forte) | Não | `SECURITY_EVENT` |
| `billing.download_pdf` | Baixar Factura | `DOWNLOAD` | Não | Não | `NONE` |
| `evidence.export` | Exportar Evidência | `EXPORT` | Não | Não | `BUSINESS_EVENT` |

---

### 3. Níveis de Auditoria (`AuditLevel`)
- `NONE` / `ANALYTICS_ONLY`: Acções puras de UI (filtros, pesquisas, ordenações).
- `BUSINESS_EVENT`: Mudanças de estado de negócio (criar empresa, pausar employee).
- `OPERATIONAL_EVIDENCE`: Execuções operacionais com ledger imutável e comprovativo.
- `SECURITY_EVENT`: Alterações de permissões, ligação de conectores e paragem de emergência.
