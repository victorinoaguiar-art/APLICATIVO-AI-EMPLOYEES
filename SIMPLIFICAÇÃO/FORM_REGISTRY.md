# REGISTO DE FORMULÁRIOS CONTEXTUAIS (FORM_REGISTRY)
## AETF-500 — Mapeamento de Formulários Específicos

### 1. Resumo Executivo
O `FORM_REGISTRY` mapeia cada acção que exige entrada de dados ao seu formulário ou wizard contextual específico, eliminando qualquer recurso a formulários genéricos de execução.

---

### 2. Mapeamento de Formulários

| Chave de Acção | Nome do Formulário / Componente | Descrição / Tipo de UX | Campos Incluídos |
| :--- | :--- | :--- | :--- |
| `company.create` | `CompanyWizard` | Wizard Modal em 3 Passos | Identificação, Contactos & Admin, Configuração |
| `employee.hire` | `HireEmployeeWizard` | Wizard Modal em 2 Passos | Seleção de Role, Atribuição de Empresa & Escopo |
| `knowledge.add` | `KnowledgeIntakeWizard` | Wizard de Ingestão | Upload Ficheiro/URL, Tipo, Escopo de Acesso |
| `connector.connect` | `ConnectorWizard` | Modal de Integração | Tipo de Conector, Credenciais OAuth/API Key |
| `approval.decide` | `ApprovalModal` | Card/Modal de Decisioning | Snapshot, Nível de Risco, Botões Aprovar/Rejeitar |
| `employee.pause` | `PauseConfirmationModal` | Modal Simples | Motivo da Pausa *, Opção de Cancelar Fila |
| `employee.resume` | `ResumeConfirmationModal` | Modal Simples | Resumo de Tarefas Pendentes, Confirmar |
| `evidence.export` | `EvidenceExportModal` | Modal de Exportação | Formato (PDF/JSON/ZIP), Período |

---

### 3. Garantia de Especificidade
Nenhum formulário listado acima exibe os campos desnecessários de `Título / Identificador da Acção`, `Módulo / Ecrã`, `SOP` ou `Ledger Imutável` em modo de utilizador normal.
