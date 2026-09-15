# FORM_FIELD_BACKEND_MATRIX — Matriz de Mapeamento Campo → Backend & Base de Dados

**Documento:** Mapeamento Técnico de Dados de Formulário para Tabelas Canónicas  
**Projeto:** AETF-500  
**Data:** 14 de Setembro de 2026  

---

## 1. FORMULÁRIO CRIAR / EDITAR EMPRESA (`FRM-S-01`)

| Campo Visível na UI | Tipo Frontend | Obrigatoriedade | Tabela Alvo na BD | Coluna / Atributo Alvo | Tratamento / Segurança |
|---|---|---|---|---|---|
| Razão Social | Text | Sim | `organizations` | `legal_name` | String Normalizada |
| Nome Comercial | Text | Não | `organizations` | `trade_name` | String |
| Forma Jurídica | Select | Sim | `organizations` | `legal_form` | Enum / Catalog Key |
| NIF / NUIT | Text | Sim | `organizations` | `tax_id` | Unique Index / AGT Verification |
| País | Select | Sim | `organizations` | `country` | ISO 3166-1 alpha-2 |
| Província / Região | Text/Select | Não | `organizations` | `province` | String |
| Sector de Actividade | Select | Sim | `organizations` | `industry_sector` | Industry Catalog Key |
| Email Institucional | Email | Sim | `organizations` | `official_email` | Validated Email Format |
| Telefone | Phone | Não | `organizations` | `phone_number` | E.164 Format |
| Nome do Administrador | Text | Sim | `users` | `name` | Admin Account Creation |
| Email do Administrador | Email | Sim | `users` | `email` | Unique Index / OAuth Identity |
| Idioma | Select | Sim | `user_preferences` | `language` | Default 'pt' |
| Moeda | Select | Sim | `organizations` | `currency` | ISO 4217 (AOA/EUR/USD) |
| Fuso Horário | Select | Sim | `organizations` | `timezone` | IANA Timezone String |
| Criar Ambiente Privado | Backend Auto | Sim (Auto) | `tenants` | `tenant_id` | UUIDv4 Multi-Tenant Boundary |

---

## 2. FORMULÁRIO CONFIGURAR PROVIDER DE IA / API KEY (`FRM-S-13`)

| Campo Visível na UI | Tipo Frontend | Obrigatoriedade | Tabela Alvo na BD | Coluna / Atributo Alvo | Tratamento / Segurança |
|---|---|---|---|---|---|
| Provider | Select | Sim | `model_provider_catalog` | `provider_key` | OpenAI / Anthropic / Gemini |
| Nome da Configuração | Text | Sim | `employee_runtime_profiles`| `profile_name` | String |
| API Key / Credential | Password Input | Sim | **Secrets Vault** | `secret_ref` (KMS Encrypted) | **NUNCA gravado em BD nem retornado à UI** |
| Modelo Principal | Select | Sim | `employee_runtime_profiles`| `primary_model_id` | gpt-4o / claude-3-5 / gemini-1.5 |
| Modelo Fallback | Select | Não | `employee_runtime_profiles`| `fallback_model_id` | Model Provider Catalog |
| Limite Mensal | Number | Não | `subscriptions` | `cost_ceiling_amount` | Currency Ceiling |

---

## 3. FORMULÁRIO NOVO PEDIDO (`FRM-S-05`)

| Campo Visível na UI | Tipo Frontend | Obrigatoriedade | Tabela Alvo na BD | Coluna / Atributo Alvo | Tratamento / Segurança |
|---|---|---|---|---|---|
| AI Employee | Select | Sim | `employee_instances` | `instance_id` | Foreign Key Check |
| Pedido / Instrução | Textarea / Chat | Sim | `tasks` / `messages` | `instruction` / `content` | Intent Detection Processing |
| Prioridade SLA | Select | Não | `tasks` | `priority` | SLA Level (NORMAL/URGENT) |
| Formato de Saída | Select | Não | `task_outputs` | `output_type` | CHAT / DOCX / PDF / XLSX |
