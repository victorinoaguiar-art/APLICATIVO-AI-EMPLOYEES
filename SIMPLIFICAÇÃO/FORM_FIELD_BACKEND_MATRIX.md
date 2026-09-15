# MATRIZ DE CAMPOS E LIGAÇÃO AO BACKEND (FORM_FIELD_BACKEND_MATRIX)
## AETF-500 — Mapeamento dos Campos de Formulário para os Modelos de Dados e Serviços

### 1. Resumo Executivo
Esta matriz estabelece a correspondência directa entre cada campo visível dos formulários da interface e a respectiva entidade/tabela de backend, demonstrando que a humanização da UI mantém a rastreabilidade e a integridade do sistema multi-tenant.

---

### 2. Mapeamento Campo a Campo por Formulário

#### Formulário 01: Criar Empresa (`CompanyWizard`)
| Campo Visível na UI | Campo Backend / BD | Tipo de Dado | Validação Frontend | Serviço Backend |
| :--- | :--- | :--- | :--- | :--- |
| Razão Social | `organizations.legal_name` | `VARCHAR(180)` | Obrigatório, min 2 | `OrganizationService.create()` |
| Nome Comercial | `organizations.trade_name` | `VARCHAR(180)` | Opcional | `OrganizationService.create()` |
| Forma Jurídica | `organizations.legal_form` | `ENUM` | Obrigatório | `OrganizationService.create()` |
| NIF / ID Fiscal | `organizations.tax_id` | `VARCHAR(32)` | Obrigatório, normalizado | `TaxValidationService.validate()` |
| País | `organizations.country` | `VARCHAR(64)` | Obrigatório | `OrganizationService.create()` |
| Província / Cidade | `organizations.city` | `VARCHAR(64)` | Opcional | `OrganizationService.create()` |
| Sector de Actividade | `organizations.industry_sector`| `VARCHAR(100)` | Obrigatório | `OrganizationService.create()` |
| Email Institucional | `organizations.billing_email` | `VARCHAR(120)` | Obrigatório, formato email | `OrganizationService.create()` |
| Administrador (Nome) | `users.full_name` | `VARCHAR(120)` | Obrigatório | `UserService.createAdmin()` |
| Administrador (Email)| `users.email` | `VARCHAR(120)` | Obrigatório, formato email | `UserService.createAdmin()` |
| Administrador (Cargo)| `memberships.role_title` | `VARCHAR(80)` | Opcional | `MembershipService.assign()` |
| Moeda de Conta | `tenants.currency` | `VARCHAR(3)` | Obrigatório (AOA, EUR, USD) | `TenantService.provision()` |
| Fuso Horário | `tenants.timezone` | `VARCHAR(40)` | Obrigatório (WAT, WET) | `TenantService.provision()` |
| Jurisdição Fiscal | `tenants.fiscal_regime` | `VARCHAR(50)` | Obrigatório (AGT/PGC, AT/SNC) | `TenantService.provision()` |

---

#### Formulário 03: Contratar AI Employee (`HireEmployeeModal`)
| Campo Visível na UI | Campo Backend / BD | Tipo de Dado | Validação Frontend | Serviço Backend |
| :--- | :--- | :--- | :--- | :--- |
| Função / Role | `rolepack.role_key` | `VARCHAR(64)` | Obrigatório | `EmployeeService.hire()` |
| Empresa Alvo | `tenants.tenant_id` | `UUID` | Herdado da sessão ativa | `EmployeeService.hire()` |
| Autonomia | `employee_instances.autonomy_level` | `ENUM (L1-L4)` | Pré-definido L3 | `PolicyEngine.setAutonomy()` |
| Salário Digital | `billing_subscriptions.unit_price` | `DECIMAL(10,2)` | Fixo por catálogo | `BillingEngine.subscribe()` |

---

#### Formulário 05: Nova Tarefa (`CreateTaskModal` & Chatbox)
| Campo Visível na UI | Campo Backend / BD | Tipo de Dado | Validação Frontend | Serviço Backend |
| :--- | :--- | :--- | :--- | :--- |
| Título da Tarefa | `tasks.title` | `VARCHAR(200)` | Obrigatório | `TaskEngine.createTask()` |
| AI Employee | `tasks.assigned_role_key` | `VARCHAR(64)` | Obrigatório | `TaskEngine.assign()` |
| Prioridade | `tasks.priority` | `ENUM (LOW, MEDIUM, HIGH, CRITICAL)` | Obrigatório | `TaskEngine.setPriority()` |
| Instruções / SOP | `tasks.user_prompt` | `TEXT` | Opcional | `Runtime.initExecution()` |

---

#### Formulário 09: Adicionar Conhecimento (`KnowledgeUploadModal`)
| Campo Visível na UI | Campo Backend / BD | Tipo de Dado | Validação Frontend | Serviço Backend |
| :--- | :--- | :--- | :--- | :--- |
| Título do Documento | `knowledge_sources.title` | `VARCHAR(255)` | Obrigatório | `KnowledgeService.ingest()` |
| Categoria | `knowledge_sources.category` | `VARCHAR(100)` | Obrigatório | `KnowledgeService.classify()` |
| Âmbito / Visibilidade | `knowledge_sources.scope` | `ENUM (GLOBAL, DEPT, RESTRICTED)` | Obrigatório | `PermissionEngine.setScope()` |
| Ficheiro / Hash | `knowledge_sources.sha256_hash` | `CHAR(64)` | Obrigatório, SHA-256 | `AuditEngine.sealHash()` |

---

#### Formulário 18: Pausar e Retomar (`ContextualStateModals`)
| Campo Visível na UI | Campo Backend / BD | Tipo de Dado | Validação Frontend | Serviço Backend |
| :--- | :--- | :--- | :--- | :--- |
| Motivo da Pausa | `employee_events.pause_reason` | `TEXT` | Obrigatório | `EmployeeService.pause()` |
| Confirmação de Retoma | `employee_events.resumed_by` | `UUID` | ID do utilizador ativo | `EmployeeService.resume()` |

---

### 3. Garantias de Integridade
A separação entre a camada de apresentação (amigável e intuitiva) e os contratos da API garante que nenhum dado técnico de integridade, isolamento multi-tenant ou auditoria se perca durante a transição.
