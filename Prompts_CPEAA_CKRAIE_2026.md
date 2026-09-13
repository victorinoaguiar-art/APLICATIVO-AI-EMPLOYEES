# Melhorias da AI Employees Platform — CPEAA + CKRAIE-2026

Este documento contém dois prompts de implementação:

1. **CPEAA — Client Policy, Enterprise Alignment & Adaptation Engine**
2. **CKRAIE-2026 — Compliance Knowledge, Regulatory & Approval Intelligence Engine**

Os dois componentes devem integrar-se na arquitectura existente dos **500 AI Employees**, sem criar uma plataforma paralela.

---

# PROMPT 1 — CPEAA  
## Client Policy, Enterprise Alignment & Adaptation Engine

## MISSÃO

Actue como:

- arquitecto sénior de sistemas de IA;
- engenheiro de conhecimento;
- especialista em RAG;
- especialista em gestão documental;
- especialista em segurança da informação;
- especialista em compliance;
- especialista em gestão de políticas internas;
- engenheiro de dados;
- especialista em sistemas multi-tenant;
- especialista em governance de IA.

Implemente na plataforma dos 500 AI Employees um módulo denominado:

```text
CPEAA
Client Policy, Enterprise Alignment & Adaptation Engine
```

O objectivo do CPEAA é permitir que cada empresa cliente carregue os seus:

- manuais internos;
- políticas;
- regulamentos;
- procedimentos;
- instruções de trabalho;
- matrizes de aprovação;
- normas internas;
- organogramas;
- regras de alçada;
- políticas financeiras;
- políticas de compras;
- políticas de RH;
- políticas de segurança;
- políticas de compliance;
- códigos de conduta;
- procedimentos operacionais;
- templates;
- guias internos;
- documentos de governação;

para que os AI Employees possam trabalhar de acordo com a realidade operacional de cada cliente.

---

## 1. PRINCÍPIO CENTRAL

O conhecimento do AI Employee deve ser composto por camadas.

Implementar a hierarquia:

```text
GLOBAL KNOWLEDGE
        ↓
JURISDICTION KNOWLEDGE
        ↓
REGULATORY KNOWLEDGE
        ↓
INDUSTRY KNOWLEDGE
        ↓
CLIENT KNOWLEDGE
        ↓
DEPARTMENT KNOWLEDGE
        ↓
EMPLOYEE-SPECIFIC KNOWLEDGE
```

As políticas internas do cliente nunca devem substituir legislação ou regulamentação superior.

---

## 2. HIERARQUIA DE AUTORIDADE

Implementar o seguinte princípio:

```text
LEI / REGULAMENTO
        ↓
NORMA SECTORIAL
        ↓
CONTRATO / OBRIGAÇÃO EXTERNA
        ↓
POLÍTICA INTERNA
        ↓
PROCEDIMENTO
        ↓
INSTRUÇÃO OPERACIONAL
        ↓
PREFERÊNCIA
```

Quando uma regra inferior contradizer uma superior:

```text
POLICY_CONFLICT_DETECTED
```

O sistema deve:

1. identificar o conflito;
2. explicar as duas regras;
3. indicar a fonte superior;
4. impedir aplicação automática da regra inferior;
5. gerar alerta;
6. solicitar revisão humana quando necessário;
7. deixar evidência no Audit Trail.

---

## 3. ISOLAMENTO POR CLIENTE

A plataforma é multi-tenant.

O conhecimento específico do Cliente A nunca pode contaminar:

- Cliente B;
- Cliente C;
- outro tenant;
- conhecimento global da plataforma.

Implementar isolamento lógico e de segurança por:

```text
tenant_id
```

Toda consulta de conhecimento interno deve respeitar:

```text
tenant_id
+
user_permissions
+
employee_permissions
+
department_scope
+
document_access_level
```

---

## 4. TIPOS DE DOCUMENTOS

Permitir onboarding de:

```text
POLICY
PROCEDURE
MANUAL
INTERNAL_REGULATION
WORK_INSTRUCTION
APPROVAL_MATRIX
ORGANIZATION_CHART
CODE_OF_CONDUCT
FINANCIAL_POLICY
PROCUREMENT_POLICY
HR_POLICY
SECURITY_POLICY
COMPLIANCE_POLICY
RISK_POLICY
ACCOUNTING_POLICY
TAX_POLICY
TREASURY_POLICY
AUDIT_POLICY
DATA_POLICY
IT_POLICY
TEMPLATE
CHECKLIST
GUIDELINE
OTHER
```

---

## 5. METADADOS OBRIGATÓRIOS

Cada documento deve conter:

```text
document_id
tenant_id
title
document_type
department
jurisdiction
industry
version
status
effective_date
expiration_date
approved_by
owner
confidentiality_level
applicable_employees
applicable_roles
supersedes
superseded_by
uploaded_at
validated_at
last_reviewed_at
next_review_date
source
hash
```

---

## 6. ESTADOS DO DOCUMENTO

Implementar:

```text
DRAFT
PENDING_REVIEW
APPROVED
ACTIVE
SUPERSEDED
EXPIRED
REVOKED
ARCHIVED
```

Apenas documentos:

```text
APPROVED
+
ACTIVE
```

podem orientar decisões operacionais de um AI Employee.

---

## 7. PROCESSO DE ONBOARDING

Pipeline:

```text
DOCUMENT_UPLOAD
        ↓
FILE_VALIDATION
        ↓
MALWARE_SCAN
        ↓
TEXT_EXTRACTION
        ↓
STRUCTURE_ANALYSIS
        ↓
METADATA_EXTRACTION
        ↓
CLASSIFICATION
        ↓
SEMANTIC_CHUNKING
        ↓
POLICY_EXTRACTION
        ↓
CONFLICT_CHECK
        ↓
HUMAN_VALIDATION
        ↓
KNOWLEDGE_INDEXING
        ↓
EMPLOYEE_MAPPING
        ↓
ACTIVATION
```

---

## 8. MOTOR DE EXTRAÇÃO DE REGRAS

O sistema deve conseguir extrair de documentos internos:

- obrigações;
- proibições;
- limites;
- valores;
- prazos;
- responsabilidades;
- níveis de aprovação;
- excepções;
- condições;
- workflows;
- departamentos envolvidos;
- funções responsáveis;
- documentos obrigatórios;
- riscos;
- sanções internas.

Transformar regras identificadas em objectos estruturados:

```text
PolicyRule
```

Campos:

```text
rule_id
tenant_id
document_id
rule_type
subject
condition
action
threshold
currency
approval_level
exception
effective_from
effective_to
risk_level
source_reference
status
```

---

## 9. EXEMPLO — POLÍTICA DE COMPRAS

Documento interno:

```text
Compras acima de 2.000.000 AOA devem possuir pelo menos 3 cotações.
Compras acima de 10.000.000 AOA exigem aprovação da Direcção.
```

Converter para:

```text
RULE 1
TYPE: PROCUREMENT
THRESHOLD: 2,000,000 AOA
REQUIREMENT: 3 QUOTATIONS

RULE 2
TYPE: PROCUREMENT
THRESHOLD: 10,000,000 AOA
REQUIREMENT: BOARD_APPROVAL
```

O Employee de Compras deve verificar estas regras automaticamente.

---

## 10. EMPLOYEE MAPPING

Criar relação:

```text
PolicyRule
→ Department
→ Role
→ Employee
→ Workflow
```

Exemplo:

```text
Procurement Policy
→ Compras
→ Procurement Manager
→ AI Employee 102
→ Purchase Approval Workflow
```

---

## 11. CLIENT KNOWLEDGE PROFILE

Para cada cliente criar:

```text
ClientKnowledgeProfile
```

com:

```text
tenant_id
active_documents
active_policies
departments
mapped_employees
policy_conflicts
expired_documents
pending_reviews
critical_rules
knowledge_version
last_updated_at
```

---

## 12. KNOWLEDGE VERSIONING

Criar releases específicas por cliente:

```text
CKR-{tenant}-{date}-{version}
```

Exemplo:

```text
CKR-ACME-2026.09.11-v1
CKR-ACME-2026.10.03-v2
```

Nunca sobrescrever versões anteriores.

---

## 13. CONFLITOS ENTRE DOCUMENTOS INTERNOS

Quando dois documentos internos divergirem:

verificar:

1. versão;
2. data;
3. status;
4. documento que substitui o anterior;
5. autoridade aprovadora;
6. departamento;
7. escopo.

Se o conflito persistir:

```text
INTERNAL_POLICY_CONFLICT
```

e exigir revisão humana.

---

## 14. RAG E RECUPERAÇÃO

O motor de recuperação deve considerar:

```text
tenant_id
+
employee_id
+
role
+
department
+
jurisdiction
+
document_status
+
effective_date
```

Nunca recuperar documentos expirados ou revogados como regra vigente.

Pode recuperar documentos históricos apenas quando a pergunta for histórica.

---

## 15. SEGURANÇA

Implementar:

- tenant isolation;
- RBAC;
- ABAC quando necessário;
- encryption at rest;
- encryption in transit;
- secure file storage;
- malware scanning;
- document hashing;
- immutable audit trail;
- access logging;
- permission inheritance;
- least privilege;
- confidential document segregation;
- secret management.

---

## 16. CONFIDENCIALIDADE

Criar níveis:

```text
PUBLIC_INTERNAL
INTERNAL
RESTRICTED
CONFIDENTIAL
HIGHLY_CONFIDENTIAL
```

Um AI Employee só pode utilizar conteúdo dentro do seu nível autorizado.

---

## 17. CLIENT ADMIN CONSOLE

Criar interface:

```text
Client Knowledge Center
```

Secções:

1. Documents
2. Policies
3. Procedures
4. Rules
5. Departments
6. Employee Mapping
7. Conflicts
8. Versions
9. Approvals
10. Expirations
11. Audit Trail
12. Access Control

---

## 18. ALERTAS

Gerar alertas para:

- política prestes a expirar;
- documento sem aprovação;
- conflito;
- documento substituído;
- política crítica alterada;
- regra sem responsável;
- regra sem Employee associado;
- documento não revisto dentro do prazo;
- tentativa de acesso sem permissão.

---

## 19. INTEGRAÇÃO COM OS 500 AI EMPLOYEES

Cada AI Employee deve ter acesso a:

```text
GLOBAL KNOWLEDGE
+
REGULATORY KNOWLEDGE
+
CLIENT KNOWLEDGE
```

mas apenas quando aplicável.

Adicionar ao perfil:

```text
tenant_policy_dependencies
client_knowledge_version
client_policy_status
policy_conflicts
```

---

## 20. EXPLAINABILITY

Quando um AI Employee tomar uma decisão com base em política interna, deve ser possível mostrar:

```text
Decision
Policy
Document
Version
Clause
Effective Date
Approval
```

---

## 21. AUDIT TRAIL

Registar:

```text
who
action
document
version
rule
timestamp
employee
workflow
decision
old_value
new_value
reason
```

---

## 22. CRITÉRIOS DE ACEITAÇÃO

Demonstrar:

1. upload de manual;
2. extracção automática;
3. classificação;
4. extracção de regras;
5. validação humana;
6. detecção de conflito;
7. indexação;
8. associação aos Employees;
9. execução de uma decisão usando a política;
10. apresentação da evidência;
11. isolamento correcto entre tenants;
12. substituição segura por versão nova;
13. rollback.

---

## RESULTADO FINAL

Implementar o CPEAA como camada de personalização empresarial dos 500 AI Employees.

O sistema deve permitir responder:

> Quais políticas internas este Employee conhece?

> Qual versão está activa?

> Qual documento originou esta regra?

> A regra ainda está vigente?

> Existe conflito com legislação?

> Esta política pertence a qual cliente?

> Quem aprovou?

> Quais Employees são afectados?

---

# PROMPT 2 — CKRAIE-2026  
## Compliance Knowledge, Regulatory & Approval Intelligence Engine

## MISSÃO

Actue como:

- arquitecto sénior de sistemas;
- especialista em compliance;
- especialista em regulação financeira;
- especialista em fiscalidade;
- especialista em governance;
- engenheiro de conhecimento;
- especialista em workflow;
- engenheiro de testes;
- especialista em auditoria;
- especialista em segurança.

Implemente uma camada denominada:

```text
CKRAIE-2026
Compliance Knowledge, Regulatory & Approval Intelligence Engine
```

O CKRAIE-2026 deve funcionar integrado ao:

```text
Knowledge Control Center
```

e permitir que a equipa de Compliance:

- visualize alterações;
- compreenda impacto;
- veja evidências;
- analise testes;
- aprove;
- rejeite;
- peça revisão;
- programe entrada em vigor;
- acompanhe implementação;

de mudanças fiscais, regulatórias, normativas e técnicas.

---

## 1. PRINCÍPIO

Nenhuma mudança crítica deve ser aplicada silenciosamente.

Pipeline:

```text
SOURCE_CHANGE
        ↓
VERIFICATION
        ↓
SEMANTIC_DIFF
        ↓
IMPACT_ANALYSIS
        ↓
RISK_CLASSIFICATION
        ↓
TESTING
        ↓
APPROVAL
        ↓
ACTIVATION
        ↓
AUDIT
```

---

## 2. FONTES

Monitorizar fontes oficiais aplicáveis, incluindo quando relevante:

- AGT;
- BNA;
- Ministério das Finanças;
- INSS;
- ARSEG;
- CMC;
- Diário da República;
- reguladores sectoriais;
- IFRS Foundation;
- ISO;
- NIST;
- fornecedores de software;
- developer portals;
- APIs;
- changelogs oficiais;
- security advisories.

---

## 3. CHANGE CARD

Cada alteração deve gerar um:

```text
RegulatoryChangeCard
```

Campos:

```text
change_id
source
authority
title
jurisdiction
domain
publication_date
effective_date
detected_at
old_rule
new_rule
semantic_difference
severity
employees_affected
clients_affected
workflows_affected
systems_affected
tests_affected
financial_impact
compliance_impact
recommended_action
verification_status
```

---

## 4. APPROVAL CARD

Antes do botão Aprovar, mostrar obrigatoriamente:

```text
SOURCE
OLD RULE
NEW RULE
EFFECTIVE DATE
IMPACT
EMPLOYEES AFFECTED
CLIENTS AFFECTED
WORKFLOWS AFFECTED
TEST RESULTS
RISKS
RECOMMENDED ACTION
```

Nunca permitir aprovação cega.

---

## 5. BOTÕES DE DECISÃO

Disponibilizar:

```text
APPROVE
REJECT
REQUEST_REVIEW
SCHEDULE_EFFECTIVE_DATE
ESCALATE
VIEW_SOURCE
VIEW_DIFF
VIEW_TESTS
VIEW_IMPACT
```

---

## 6. APROVAÇÃO POR RISCO

Implementar:

### INFORMATIONAL

```text
AUTO_ACCEPTABLE
```

quando não altera comportamento.

### LOW

```text
AUTO_UPDATE
```

quando seguro.

### MEDIUM

```text
AUTO_UPDATE + TEST + NOTIFY
```

### HIGH

```text
HUMAN_APPROVAL_REQUIRED
```

### CRITICAL

```text
DUAL_APPROVAL_REQUIRED
```

---

## 7. SEGREGAÇÃO DE FUNÇÕES

Para mudanças críticas:

```text
Reviewer ≠ Approver
```

e, quando necessário:

```text
Approver 1 ≠ Approver 2
```

Perfis possíveis:

```text
COMPLIANCE_ANALYST
COMPLIANCE_MANAGER
TAX_MANAGER
LEGAL_REVIEWER
IT_SECURITY
BUSINESS_OWNER
SYSTEM_ADMIN
AUDITOR
```

---

## 8. EXEMPLO — ALTERAÇÃO FISCAL

Exemplo de apresentação:

```text
SOURCE:
AGT

CHANGE:
Regra fiscal X alterada

OLD VALUE:
7%

NEW VALUE:
5%

EFFECTIVE DATE:
01/10/2026

EMPLOYEES AFFECTED:
12

CLIENTS AFFECTED:
84

WORKFLOWS AFFECTED:
IVA
Facturação
ERP
Declarações
Compliance

TESTS:
38/38 PASS

SEVERITY:
HIGH

ACTION:
HUMAN APPROVAL REQUIRED
```

---

## 9. IMPACT ENGINE

Determinar automaticamente:

```text
affected_employees
affected_clients
affected_departments
affected_workflows
affected_rules
affected_calculations
affected_reports
affected_integrations
affected_documents
affected_tests
```

---

## 10. KNOWLEDGE RELEASE

Após aprovação, criar:

```text
KnowledgeRelease
```

Exemplo:

```text
KR-2026.09.20
```

Campos:

```text
release_id
change_ids
approved_by
approved_at
effective_at
employees_updated
clients_affected
tests
rollback_reference
status
```

---

## 11. ENTRADA EM VIGOR FUTURA

Se uma norma for publicada hoje mas entrar em vigor no futuro:

não aplicar imediatamente.

Estado:

```text
APPROVED_PENDING_EFFECTIVE_DATE
```

Activar automaticamente na data correcta.

---

## 12. AUTO-UPDATE CONTROLADO

Definir três níveis.

### LEVEL 1 — AUTO_UPDATE

Pode actualizar automaticamente:

- metadados;
- documentação;
- referências;
- versões;
- informação de baixo risco.

### LEVEL 2 — AUTO_UPDATE + TEST

Pode actualizar:

- workflows;
- endpoints;
- fórmulas não críticas;
- integrações;
- regras operacionais;

apenas se os testes passarem.

### LEVEL 3 — HUMAN_APPROVAL_REQUIRED

Exigir aprovação humana para:

- fiscalidade crítica;
- interpretação jurídica;
- pagamentos;
- submissões oficiais;
- decisões financeiras relevantes;
- compliance crítico;
- segurança;
- permissões;
- mudanças com elevado impacto.

---

## 13. TESTES

Antes de aprovação executar:

```text
FACTUAL
REGULATORY
TEMPORAL
CALCULATION
WORKFLOW
API
SECURITY
INTEGRATION
REGRESSION
EDGE_CASE
CONTRADICTION
```

Mostrar resultados no Approval Card.

---

## 14. BLOQUEIO POR FALHA

Se:

```text
TEST_FAILED
```

ou:

```text
SOURCE_UNVERIFIED
```

então:

```text
APPROVAL_BLOCKED
```

excepto se um utilizador autorizado iniciar fluxo de excepção auditado.

---

## 15. AUDIT TRAIL

Registar:

```text
change_id
reviewer
approver
decision
timestamp
source
old_rule
new_rule
tests
impact
reason
release
rollback
```

---

## 16. DASHBOARD CKRAIE-2026

Criar dashboard com:

### Overview

- New Changes
- Critical Changes
- High Changes
- Pending Approval
- Pending Effective Date
- Failed Tests
- Employees Stale
- Clients Affected
- Source Failures

### Filters

```text
regulator
domain
jurisdiction
severity
employee
client
status
date
source
```

---

## 17. COMPLIANCE QUEUE

Criar fila:

```text
Compliance Review Queue
```

Ordenar prioritariamente por:

1. criticidade;
2. data de entrada em vigor;
3. número de Employees afectados;
4. número de clientes afectados;
5. impacto financeiro;
6. risco de incumprimento.

---

## 18. ALERTAS

Gerar alerta quando:

- mudança crítica for detectada;
- data de entrada em vigor estiver próxima;
- aprovação estiver atrasada;
- testes falharem;
- Employee estiver stale;
- fonte estiver indisponível;
- norma revogar regra activa;
- nova versão de API exigir migração;
- alteração afectar cliente específico.

---

## 19. 1-CLICK APPROVAL SEGURO

O sistema pode permitir aprovação com um clique somente depois de mostrar:

```text
SOURCE VERIFIED
+
DIFF REVIEWED
+
IMPACT CALCULATED
+
TESTS PASSED
+
AUTHORIZATION VALID
```

O clique deve gerar:

```text
APPROVAL_EVENT
```

com identidade, data, hora e evidência.

---

## 20. APPROVAL POLICIES

Criar políticas configuráveis por organização.

Exemplo:

```text
Tax change HIGH
→ Compliance Manager

Tax change CRITICAL
→ Compliance Manager + Tax Manager

Security CRITICAL
→ Security + CTO

Legal interpretation
→ Legal Reviewer
```

---

## 21. INTEGRAÇÃO COM O CPEAA

Quando uma mudança regulatória afectar uma política interna do cliente:

```text
Regulatory Change
        ↓
CKRAIE-2026
        ↓
Impact Analysis
        ↓
CPEAA
        ↓
Affected Client Policies
        ↓
POLICY_REVIEW_REQUIRED
```

Exemplo:

```text
Nova regra AGT
→ Política Fiscal Interna do Cliente
→ Procedimento contabilístico
→ Employee Fiscal
→ Employee Contabilidade
→ revisão necessária
```

---

## 22. CLIENT IMPACT

Para cada alteração mostrar:

```text
Clients Affected
Client Policies Affected
Client Workflows Affected
Client Employees Affected
Required Actions
Deadline
```

---

## 23. FAIL-SAFE

Se mudança crítica estiver detectada mas ainda não aprovada:

```text
REVIEW_PENDING
```

Se a regra anterior continuar válida, manter versão anterior.

Se a regra anterior deixar de poder ser utilizada:

```text
BLOCKED_PENDING_REVIEW
```

---

## 24. ROLLBACK

Toda release aprovada deve possuir:

```text
rollback_reference
```

Permitir rollback controlado.

---

## 25. OBSERVABILIDADE

Monitorizar:

```text
changes_detected
changes_approved
changes_rejected
approval_latency
failed_tests
stale_employees
affected_clients
source_failures
time_to_release
rollback_count
```

---

## 26. SEGURANÇA

Implementar:

- RBAC;
- segregation of duties;
- MFA para aprovações críticas;
- audit logs;
- tamper-resistant evidence;
- encryption;
- session controls;
- permission checks;
- approval limits;
- non-repudiation mechanisms quando aplicável.

---

## 27. CRITÉRIOS DE ACEITAÇÃO

Demonstrar:

1. nova alteração detectada;
2. fonte verificada;
3. diff apresentado;
4. impacto calculado;
5. Employees identificados;
6. clientes identificados;
7. testes executados;
8. Approval Card criado;
9. aprovação efectuada;
10. release criada;
11. Employee actualizado;
12. cliente afectado sinalizado;
13. política interna afectada encaminhada ao CPEAA;
14. Audit Trail completo;
15. rollback funcional.

---

# INTEGRAÇÃO DOS DOIS MÓDULOS

A arquitectura combinada deve funcionar assim:

```text
FONTES EXTERNAS
AGT / BNA / ARSEG / CMC / APIs / Standards
                ↓
           CKRAIE-2026
                ↓
      Change Detection
                ↓
      Impact Assessment
                ↓
      Testing + Approval
                ↓
       Knowledge Release
                ↓
        500 AI Employees
                ↓
              CPEAA
                ↓
     Políticas do Cliente
                ↓
     Alinhamento Operacional
```

E também:

```text
Regulatory Change
        ↓
CKRAIE-2026
        ↓
Affected Client Policy
        ↓
CPEAA
        ↓
Policy Review
        ↓
Client Approval
        ↓
Updated Client Knowledge
        ↓
AI Employees
```

---

# RESULTADO FINAL

Com CPEAA + CKRAIE-2026, a plataforma deve conseguir responder:

> O que este AI Employee sabe?

> Que norma externa suporta esse conhecimento?

> Que política interna do cliente também se aplica?

> Qual regra tem prioridade?

> Existe conflito?

> Houve alguma alteração recente?

> Quem aprovou a alteração?

> Quais testes foram executados?

> Quais clientes foram afectados?

> Quais Employees precisam de ser actualizados?

> Qual versão do conhecimento está activa?

> Existe evidência auditável?

O objectivo final é criar uma plataforma em que os 500 AI Employees sejam simultaneamente:

```text
ACTUALIZADOS
+
ALINHADOS AO CLIENTE
+
CONTROLADOS
+
TESTADOS
+
AUDITÁVEIS
```
