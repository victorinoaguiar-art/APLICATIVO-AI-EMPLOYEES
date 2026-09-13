# Prompt 2 — AI Employee Continuous Knowledge, Regulation & API Intelligence Engine

## MISSÃO

Actue como arquitecto principal, engenheiro sénior de software, engenheiro de conhecimento, engenheiro de dados, especialista em MLOps, especialista em governance de IA, especialista em compliance e auditor de sistemas.

Implemente na plataforma dos 500 AI Employees uma camada denominada:

# AI Employee Continuous Knowledge, Regulation & API Intelligence Engine

A solução deve transformar a baseline de conhecimento:

```text
2026.09.11
```

num sistema permanente, automatizado, rastreável e controlado de actualização.

---

## 1. PRINCÍPIO

Os AI Employees não podem possuir conhecimento estático.

Cada Employee deve saber:

- quais fontes sustentam o seu conhecimento;
- qual versão está a utilizar;
- quando essa informação foi verificada;
- se surgiu uma alteração posterior;
- se a alteração lhe é aplicável;
- se os seus conhecimentos já foram actualizados;
- se passou nos respectivos testes;
- se existe revisão humana pendente.

Implementar:

```text
500 AI Employees
+
Source Registry
+
Knowledge Registry
+
Regulatory Watch
+
API Version Watch
+
Change Detection Engine
+
Change Impact Engine
+
Employee Dependency Graph
+
Knowledge Update Orchestrator
+
Automated Regression Testing
+
Evidence & Audit Trail
```

---

## 2. SOURCE REGISTRY

Criar um registo central das fontes monitorizadas.

Entidade:

```text
Source
```

Campos mínimos:

```text
id
name
organization
source_type
jurisdiction
domain
url
authority_level
official
monitoring_method
monitoring_frequency
last_checked_at
last_changed_at
status
terms_or_access_notes
```

Tipos:

```text
LAW
REGULATION
CIRCULAR
OFFICIAL_GUIDANCE
TAX_CALENDAR
PROFESSIONAL_STANDARD
TECHNICAL_STANDARD
API_DOCUMENTATION
CHANGELOG
RELEASE_NOTES
SECURITY_ADVISORY
POLICY
PRODUCT_DOCUMENTATION
OTHER
```

---

## 3. KNOWLEDGE REGISTRY

Criar registo central versionado de conhecimento.

Entidades principais:

```text
KnowledgeItem
KnowledgeVersion
KnowledgeSource
EmployeeKnowledge
```

Cada `KnowledgeItem` deve conter:

```text
knowledge_id
title
domain
subdomain
jurisdiction
content
rule_type
valid_from
valid_to
supersedes
superseded_by
status
confidence
risk_level
created_at
updated_at
```

Cada versão deve ter fonte verificável.

---

## 4. EMPLOYEE KNOWLEDGE PROFILE

Para cada um dos 500 Employees manter:

```text
employee_id
knowledge_domains
knowledge_items
regulations
professional_standards
software_dependencies
api_dependencies
data_dependencies
jurisdictions
last_full_review
last_incremental_review
baseline_version
current_knowledge_version
freshness_status
critical_gaps
```

Todos os 500 Employees são prioritários.

Não criar classes de prioridade que deixem Employees em estado secundário ou sem actualização.

---

## 5. EMPLOYEE DEPENDENCY GRAPH

Construir grafo que permita responder:

> Se esta norma, API, lei ou software mudar, quais Employees são afectados?

Exemplos:

```text
AGT rule
→ Fiscal Employee
→ Accounting Employee
→ Payroll Employee
→ Audit Employee
→ Primavera Employee
```

ou:

```text
LinkedIn API version
→ Social Media Employee
→ Digital Marketing Employee
→ Campaign Analytics Employee
→ Lead Generation Employee
```

Tipos de relações:

```text
DEPENDS_ON
USES
REGULATED_BY
IMPLEMENTS
CALCULATES_FROM
REPORTS_TO
INTEGRATES_WITH
SUPERSEDES
AFFECTS
TESTED_BY
```

---

## 6. REGULATORY WATCH

Implementar monitorização de fontes legais e regulatórias relevantes.

O sistema deve:

1. verificar fontes autorizadas;
2. detectar novo documento;
3. detectar versão modificada;
4. guardar snapshot;
5. comparar com versão anterior;
6. identificar alterações materiais;
7. extrair datas importantes;
8. identificar jurisdição;
9. classificar domínio;
10. enviar a mudança ao `Change Impact Engine`.

Monitorizar conforme os Employees existentes, incluindo fontes relevantes de Angola e internacionais.

---

## 7. API VERSION WATCH

Criar componente dedicado a software, APIs e integrações.

Monitorizar:

- versão actual;
- release notes;
- changelog;
- endpoints;
- autenticação;
- scopes;
- permissões;
- SDK;
- breaking changes;
- deprecations;
- sunset dates;
- quotas;
- limites;
- políticas de utilização;
- alterações de segurança.

Entidade:

```text
ApiVersion
```

Campos:

```text
provider
product
api
version
release_date
deprecated_at
sunset_at
breaking_changes
migration_required
employees_affected
integration_components_affected
source
status
```

---

## 8. CHANGE DETECTION ENGINE

Quando uma fonte mudar, gerar:

```text
ChangeEvent
```

com:

```text
change_id
source_id
detected_at
old_version
new_version
change_type
summary
effective_date
severity
jurisdiction
domains
evidence
```

Classificações:

```text
LEGAL
REGULATORY
TAX
ACCOUNTING
API
SECURITY
PRODUCT
STANDARD
PROCESS
POLICY
DATA
OTHER
```

Severidade:

```text
CRITICAL
HIGH
MEDIUM
LOW
INFORMATIONAL
```

---

## 9. SEMANTIC DIFF

Não depender apenas de comparação textual.

Detectar alteração semântica.

Exemplos:

- prazo mudou;
- taxa mudou;
- obrigação deixou de existir;
- obrigação passou a existir;
- endpoint foi substituído;
- parâmetro tornou-se obrigatório;
- versão deixou de ser suportada;
- norma entrou em vigor;
- excepção foi introduzida;
- fórmula foi alterada.

Produzir:

```text
BEFORE
AFTER
MATERIAL_DIFFERENCE
EFFECTIVE_DATE
```

---

## 10. CHANGE IMPACT ENGINE

Para cada `ChangeEvent` determinar:

```text
affected_employees
affected_knowledge_items
affected_prompts
affected_workflows
affected_rules
affected_calculations
affected_integrations
affected_tests
affected_clients_or_tenants
```

Gerar:

```text
ImpactAssessment
```

com nível de impacto e justificação.

---

## 11. CHANGE PROPAGATION

Quando uma alteração afectar múltiplos Employees:

não actualizar manualmente a mesma regra várias vezes.

Utilizar conhecimento partilhado e dependências.

Exemplo:

```text
KnowledgeItem X
→ Employee 14
→ Employee 22
→ Employee 64
→ Employee 201
```

Uma alteração de `KnowledgeItem X` deve criar automaticamente tarefas para todos os consumidores afectados.

---

## 12. KNOWLEDGE UPDATE ORCHESTRATOR

Pipeline:

```text
SOURCE_CHANGE_DETECTED
        ↓
CHANGE_CAPTURED
        ↓
CHANGE_VERIFIED
        ↓
IMPACT_ANALYSED
        ↓
UPDATE_PROPOSED
        ↓
KNOWLEDGE_UPDATED
        ↓
TESTS_GENERATED
        ↓
REGRESSION_TESTED
        ↓
APPROVAL
        ↓
RELEASED
        ↓
MONITORED
```

Mudanças críticas não devem entrar silenciosamente em produção.

---

## 13. HUMAN-IN-THE-LOOP

Exigir revisão humana quando:

- interpretação jurídica for necessária;
- existir conflito entre fontes;
- alteração for crítica;
- impacto financeiro for elevado;
- cálculo fiscal mudar;
- decisão puder gerar incumprimento;
- fonte oficial estiver ambígua;
- alteração modificar comportamento sensível do Employee.

Estados:

```text
AUTO_APPROVABLE
HUMAN_REVIEW_REQUIRED
APPROVED
REJECTED
ESCALATED
```

---

## 14. AUTOMATED REGRESSION TESTING

Cada alteração deve identificar testes existentes que possam ser afectados.

Gerar novos testes quando necessário.

Categorias:

```text
KNOWLEDGE
LEGAL
REGULATORY
CALCULATION
API
INTEGRATION
SECURITY
WORKFLOW
TEMPORAL
EDGE_CASE
HALLUCINATION
CONTRADICTION
```

Pipeline:

```text
change
→ affected capabilities
→ affected tests
→ test execution
→ comparison
→ approval/rejection
```

---

## 15. TEMPORAL TESTING

Adicionar testes temporais.

Exemplo:

Perguntar ao mesmo Employee:

> Qual era a regra em 2025?

e:

> Qual é a regra em Setembro de 2026?

O Employee deve conseguir distinguir contextos temporais e não substituir toda a história pela regra actual.

---

## 16. KNOWLEDGE RELEASES

Criar releases:

```text
KR-2026.09.11
KR-2026.09.18
KR-2026.10.01
...
```

Cada release deve indicar:

```text
changes
sources
employees_affected
tests
approvals
deployment
rollback_reference
```

---

## 17. EVIDENCE & AUDIT TRAIL

Toda decisão automática deve deixar rasto.

Registar:

```text
who_or_what
action
timestamp
source
old_value
new_value
reason
change_id
employee_id
knowledge_version
test_results
approval
```

Logs críticos devem ser append-only ou possuir controlo equivalente contra alteração indevida.

---

## 18. SOURCE SNAPSHOTS

Quando legalmente e tecnicamente permitido, guardar evidência suficiente da versão consultada.

Exemplos:

- hash;
- URL;
- título;
- versão;
- data;
- metadata;
- diff;
- extract permitido;
- retrieval timestamp.

Não copiar conteúdo protegido além do permitido.

---

## 19. KNOWLEDGE FRESHNESS DASHBOARD

Criar dashboard com:

```text
Employees current
Employees stale
Employees requiring review
Critical changes
High changes
Pending approvals
Failed tests
Upcoming API sunsets
New regulations
Source failures
```

Filtros:

- Employee;
- departamento;
- domínio;
- jurisdição;
- severity;
- source;
- status;
- período.

---

## 20. EMPLOYEE KNOWLEDGE CARD

Cada Employee deve possuir cartão:

```text
Knowledge Status: CURRENT

Baseline:
2026.09.11

Current Version:
KR-XXXX

Last verified:
datetime

Sources monitored:
N

Pending changes:
N

Critical gaps:
N

Regression tests:
PASS/FAIL

Human review:
NONE/PENDING

Production eligibility:
YES/NO
```

---

## 21. ALERTAS

Gerar alerta quando:

- legislação crítica mudar;
- API anunciar sunset;
- endpoint desaparecer;
- autenticação mudar;
- standard aplicável mudar;
- fonte oficial publicar alteração relevante;
- teste falhar;
- Employee ficar desactualizado;
- monitor deixar de consultar fonte crítica.

Evitar spam.

Agrupar alterações relacionadas.

---

## 22. FREQUÊNCIA

A frequência deve depender da volatilidade.

Exemplos conceptuais:

### APIs muito voláteis

```text
DAILY
```

### Reguladores importantes

```text
DAILY
```

### Outras fontes oficiais

```text
DAILY/WEEKLY
```

### Standards de evolução lenta

```text
WEEKLY/MONTHLY
```

Nunca assumir que a mesma frequência é adequada para todas as fontes.

---

## 23. SOURCE HEALTH

Monitorizar o próprio sistema de monitorização.

Campos:

```text
last_successful_check
failed_checks
http_status
parsing_status
authentication_status
structure_changed
source_available
```

Se uma fonte deixar de poder ser consultada:

```text
SOURCE_MONITORING_FAILURE
```

Isto não significa:

```text
NO_CHANGE
```

---

## 24. SEGURANÇA

Implementar:

- RBAC;
- least privilege;
- secret management;
- encryption;
- audit logs;
- integrity checking;
- input validation;
- safe fetching;
- allowlists quando necessário;
- rate limiting;
- isolation;
- rollback;
- backup.

Conteúdo externo deve ser considerado não confiável.

Prevenir prompt injection proveniente de páginas monitorizadas.

Uma página web nunca pode alterar autonomamente instruções do sistema.

---

## 25. ARQUITECTURA DE DADOS

Criar ou adaptar entidades para:

```text
employees
sources
source_snapshots
knowledge_items
knowledge_versions
employee_knowledge
regulatory_documents
api_products
api_versions
change_events
impact_assessments
update_tasks
knowledge_releases
tests
test_runs
approvals
audit_events
alerts
source_health
```

Usar migrations seguras e reversíveis.

Não quebrar tabelas existentes.

---

## 26. APIs INTERNAS

Implementar, adaptando à stack existente:

```text
GET /knowledge/employees/{id}
GET /knowledge/employees/{id}/freshness

GET /knowledge/sources
POST /knowledge/sources
GET /knowledge/sources/{id}/changes

GET /knowledge/changes
GET /knowledge/changes/{id}

GET /knowledge/changes/{id}/impact

POST /knowledge/changes/{id}/review
POST /knowledge/changes/{id}/approve
POST /knowledge/changes/{id}/reject

GET /knowledge/releases
GET /knowledge/releases/{id}

GET /knowledge/tests
GET /knowledge/test-runs

GET /knowledge/audit
```

Seguir os padrões já utilizados no projecto.

---

## 27. OBSERVABILIDADE

Instrumentar:

- logs;
- metrics;
- tracing;
- error reporting;
- crawler health;
- processing latency;
- queue depth;
- test failure rate;
- stale knowledge count;
- unverified changes;
- time-to-update.

---

## 28. FAIL-SAFE

Se uma mudança crítica for detectada mas ainda não estiver validada:

o Employee deve continuar a utilizar a versão anteriormente aprovada, salvo se essa versão já não puder ser considerada segura ou legalmente utilizável.

Nessa situação:

```text
KNOWLEDGE_REVIEW_REQUIRED
```

e escalar.

---

## 29. ROLLBACK

Toda actualização de conhecimento deve permitir rollback.

Nunca sobrescrever irreversivelmente uma versão aprovada.

---

## 30. MIGRAÇÃO DA BASELINE

Importar como primeira release:

```text
KR-2026.09.11
```

A baseline produzida pelo Prompt 1 deve constituir o ponto zero.

Preservar:

- fontes;
- versões;
- evidências;
- testes;
- gaps;
- Employee mappings.

---

## 31. INTERFACE DE ADMINISTRAÇÃO

Criar área:

```text
Knowledge Control Center
```

Secções:

1. Overview
2. Employees
3. Knowledge Registry
4. Regulatory Watch
5. API Watch
6. Change Events
7. Impact Analysis
8. Tests
9. Releases
10. Approvals
11. Alerts
12. Sources
13. Audit Trail
14. System Health

---

## 32. REGRA DE PRODUÇÃO

Um Employee só pode ser considerado plenamente actualizado quando:

```text
SOURCE_VERIFIED
+
CHANGE_ANALYSED
+
KNOWLEDGE_UPDATED
+
REGRESSION_TESTED
+
APPROVED
```

Produzir:

```text
CURRENT
```

Caso contrário utilizar estado apropriado:

```text
STALE
UPDATE_PENDING
TEST_PENDING
REVIEW_PENDING
BLOCKED
SOURCE_UNAVAILABLE
```

---

## 33. CRITÉRIOS DE ACEITAÇÃO

A implementação só estará concluída quando for possível demonstrar, num ambiente controlado:

1. uma alteração numa fonte;
2. detecção automática;
3. captura da versão;
4. geração do diff;
5. classificação;
6. identificação dos Employees afectados;
7. criação da proposta de actualização;
8. actualização do conhecimento;
9. execução dos testes;
10. aprovação;
11. criação de Knowledge Release;
12. actualização do estado dos Employees;
13. consulta de toda a evidência no Audit Trail.

Testar também:

- alteração irrelevante;
- source offline;
- source com estrutura modificada;
- conflito entre fontes;
- alteração futura ainda não vigente;
- API com sunset anunciado;
- rollback de release;
- falha de teste;
- revisão rejeitada.

---

## 34. NÃO REESCREVER A PLATAFORMA DESNECESSARIAMENTE

Antes de implementar:

1. inspeccionar a arquitectura existente;
2. reutilizar autenticação existente;
3. reutilizar base de dados;
4. reutilizar event bus, filas e scheduler quando existirem;
5. reutilizar observabilidade;
6. seguir convenções do projecto;
7. utilizar migrations;
8. preservar backward compatibility.

Não criar uma segunda plataforma paralela.

Integrar esta capacidade à plataforma dos 500 AI Employees.

---

# RESULTADO FINAL

Entregar uma arquitectura operacional em que os 500 AI Employees deixem de depender de actualizações manuais esporádicas e passem a possuir um sistema permanente de:

```text
detecção
→ verificação
→ análise de impacto
→ actualização
→ teste
→ aprovação
→ publicação
→ auditoria
```

O sistema deverá conseguir responder, a qualquer momento:

> Que conhecimento utiliza este Employee?

> Qual é a fonte?

> Qual é a versão?

> Quando foi validado?

> Que mudança ocorreu?

> Quais Employees foram afectados?

> O conhecimento já foi actualizado?

> Quem aprovou?

> Quais testes foram executados?

> Há evidência auditável?

Esse é o padrão mínimo para considerar o conhecimento dos 500 AI Employees continuamente governado.
