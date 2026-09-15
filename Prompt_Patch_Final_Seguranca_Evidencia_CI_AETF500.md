# PROMPT MESTRE — PATCH FINAL DE SEGURANÇA, EVIDÊNCIA E CI DO AETF-500

## 1. Missão

Actue como arquitecto principal de software, engenheiro de segurança, especialista em autenticação multi-tenant, engenheiro de pagamentos, auditor forense de evidências digitais, especialista TypeScript/Node.js e engenheiro DevSecOps.

Execute um patch correctivo pequeno e fechado no repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Baseline auditada:

```text
b5612c25a9749e39013d0bcf24675f2a085f1b5a
```

O patch deve corrigir exclusivamente os dez bloqueios abaixo. Não criar outro grande módulo, novas áreas de negócio, novas funcionalidades comerciais ou nova arquitectura paralela.

## 2. Estado inicial obrigatório

Preservar até prova contrária:

```text
DEVELOPMENT BASELINE
FULL BUILD = PASS
AUTOMATED TESTS = PASS
FINAL VERIFICATION PIPELINE = FAIL
CONTROLLED PILOT READINESS = NOT YET PROVEN
GENERAL PRODUCTION = BLOCKED
CERT-L3 = 0
VERIFIED LIVE TASKS = 0
EXTERNALLY VERIFIED TENANTS = 0
VERIFIED REAL PAYMENTS = 0
```

Não elevar estes estados por declaração do código ou do relatório.

## 3. Princípios

```text
PUBLIC TOKEN ISSUER ≠ AUTHENTICATION
SELF-DECLARED ROLE ≠ AUTHORIZED ROLE
FALLBACK SECRET ≠ SECURE CONFIGURATION
FILE RENAME ≠ DATABASE TRANSACTION
LOCAL CHECKOUT URL ≠ PROVIDER SESSION
STATIC STRING CHECK ≠ SECURITY AUDIT
JSON PARSE PASS ≠ JSON SCHEMA PASS
ROLEPACK COUNT ≠ DOMAIN CARDINALITY
RECEIPT IN GIT ≠ REPRODUCIBLE RECEIPT
CI YAML EXISTS ≠ CI EXECUTED
```

É proibido fabricar, editar manualmente ou ajustar recibos para produzir `PASS`.

## 4. Correcção 1 — Eliminar emissão pública e arbitrária de tokens

### Vulnerabilidade

O endpoint público `/api/v1/auth/token` aceita `tenantId`, `userId`, `roles` e `permissions` fornecidos pelo cliente e emite token assinado. Isto permite solicitar `SUPER_ADMIN` para qualquer tenant.

### Acções

1. Remover o endpoint público de emissão arbitrária.
2. Nunca aceitar roles, permissions ou tenant como autoridade final do pedido.
3. Integrar um fornecedor de identidade real ou um fluxo interno autenticado.
4. Resolver utilizador, tenant, roles e scopes numa fonte de autoridade persistente.
5. Em desenvolvimento, permitir tokens de teste apenas se:

```text
NODE_ENV = test ou development
ALLOW_TEST_TOKEN_ISSUER = true
```

6. Compilação ou inicialização de produção deve bloquear o emissor de teste.
7. Adicionar `sub`, `iss`, `aud`, `exp`, `iat`, `nbf`, `jti` e `kid`.
8. Validar algoritmo permitido e rejeitar `none` ou algoritmos inesperados.
9. Implementar revogação, rotação de chaves e expiração curta.
10. Associar o tenant autenticado à requisição e ignorar tenant não autorizado enviado no body.

### Testes negativos

- emissão sem autenticação;
- pedido de `SUPER_ADMIN`;
- tenant diferente;
- token adulterado;
- algoritmo diferente;
- issuer e audience incorrectos;
- token expirado ou antes do `nbf`;
- `jti` revogado;
- chave antiga após rotação.

## 5. Correcção 2 — Fail-fast sem segredos reais em produção

Eliminar todos os segredos fallback conhecidos, incluindo:

```text
aetf-500-hardened-cryptographic-token-secret-2026
test_webhook_secret_stripe_2026
test_webhook_secret_expresspay_2026
```

Criar validação de ambiente na inicialização.

Em produção, ausência ou fraqueza de qualquer segredo deve provocar:

```text
STARTUP_CONFIG_GATE = FAIL
PROCESS EXIT != 0
SERVER NOT STARTED
```

Validar, no mínimo:

- segredo/chave de autenticação;
- issuer e audience;
- credenciais da base de dados;
- webhook secret de cada prestador activo;
- chaves API de prestadores;
- origens CORS permitidas;
- ambiente e região;
- política de logs e redacção.

Nunca imprimir segredos nos logs ou recibos.

## 6. Correcção 3 — Corrigir hash divergente sem manipular o recibo

Existe divergência física em `02_Original_Build_Log.txt`:

```text
expected_sha256:
712de5212d40c7b4aabe702815e889bc3f956042b486631db875a5d99bf73298

computed_sha256:
afdee24f1a7b60424a832f569db6ddf3ab15c139c74ba3cce9af2e7dc8827954
```

### Procedimento obrigatório

1. Não substituir simplesmente o valor esperado pelo calculado.
2. Determinar qual ficheiro corresponde à execução original.
3. Comparar tamanho, conteúdo, terminadores de linha, encoding e origem.
4. Verificar se o ficheiro foi normalizado por Git, editor ou sistema operativo.
5. Se os bytes originais forem recuperáveis, restaurá-los e confirmar o hash.
6. Se não forem recuperáveis, declarar o recibo histórico inválido.
7. Criar `EvidenceReconciliationEvent` com causa, impacto e nova classificação.
8. Preservar o ficheiro e recibo anteriores como históricos.
9. Gerar nova reprodução limpa para o commit actual, com novos logs e hashes.
10. Usar ficheiros binários ou configuração apropriada para preservar bytes quando necessário.

O gate só passa quando o hash for reproduzível a partir dos bytes físicos, sem edição manual do recibo.

## 7. Correcção 4 — Testes e verificadores read-only ou determinísticos

Actualmente, a execução modifica recibos e manifestos versionados.

### Implementar

1. Testes devem escrever em directório temporário criado por execução.
2. Não escrever em `generated/` versionado durante testes comuns.
3. Separar:

```text
fixtures/        → entradas imutáveis
expected/        → golden files versionados
test-output/     → saída temporária ignorada
release-output/  → artefactos gerados apenas por comando explícito
```

4. Injectar relógio determinístico nos testes.
5. Injectar gerador de IDs determinístico.
6. Não usar `Date.now()` e `Math.random()` em golden files.
7. Criar comando explícito para actualizar baselines, proibido na CI normal.
8. Comparar saída calculada com baseline sem substituir o original.
9. No final da CI, executar:

```bash
git status --porcelain
git diff --exit-code
```

10. Qualquer alteração em ficheiro rastreado deve falhar o gate.

## 8. Correcção 5 — Persistência financeira transaccional real

Substituir `FileTransactionalStore`, `Map` e `Set` como armazenamento de produção.

### Implementar

1. Base de dados transaccional suportada, preferencialmente PostgreSQL.
2. Migrações versionadas para:
   - invoices;
   - payment_events;
   - settlements;
   - idempotency_keys;
   - accounting_events;
   - webhook_receipts;
   - refunds.
3. Chaves únicas para event ID, provider transaction ID e idempotency key.
4. Foreign keys entre invoice, tenant, payment e accounting event.
5. Lock transaccional ou operação atómica contra concorrência.
6. Estados com transições validadas.
7. Outbox pattern para efeitos posteriores.
8. Rollback completo em falhas.
9. Persistência separada por tenant.
10. Redacção de dados sensíveis.

Fluxo:

```text
BEGIN
→ reserve event ID
→ load and lock invoice
→ validate provider event
→ validate tenant, currency and amount
→ persist payment
→ transition invoice
→ create accounting outbox event
→ COMMIT
```

Testar concorrência, replay, deadlock, rollback, restart, isolamento de tenant e indisponibilidade da base de dados.

## 9. Correcção 6 — Integração real Stripe e ExpressPay

### Proibições

- não fabricar session IDs;
- não construir checkout URLs localmente;
- não usar segredos fallback;
- não aceitar sandbox como pagamento real;
- não marcar `PAID` sem evento confirmado;
- não aceitar assinatura genérica como prova universal do prestador.

### Stripe

1. Usar SDK/API oficial.
2. Criar a sessão por chamada real.
3. Guardar o session ID devolvido pelo prestador.
4. Validar o webhook com o método oficial e raw body.
5. Validar tolerância temporal.
6. Confirmar o tipo de evento e estado de pagamento.

### ExpressPay

1. Implementar segundo a documentação oficial e contrato disponível.
2. Não inventar endpoint, formato de assinatura ou semântica.
3. Se a documentação/credenciais não estiverem disponíveis:

```text
EXPRESSPAY_CONNECTOR = NOT_CONFIGURED
AOA_REAL_PAYMENT = BLOCKED_BY_EXTERNAL_DEPENDENCY
```

4. Exigir sandbox ou homologação real antes de produção.

### Estados

```text
CREATED
PENDING_PROVIDER
AUTHORIZED
PAID
FAILED
EXPIRED
CANCELLED
REFUNDED
SIMULATED
```

Somente o prestador validado pode originar transição para `PAID`.

## 10. Correcção 7 — JSON Schemas Ajv e cardinalidade por domínio

O verificador actual apenas analisa algumas chaves genéricas. Substituí-lo por validação Ajv real.

Criar schemas versionados para:

- Production Freeze Manifest;
- Live Sample Manifest;
- Certification Manifest;
- Tenant Authorization Manifest;
- Payment Evidence Manifest;
- Build Receipt;
- Test Receipt;
- CI Receipt;
- Physical Hash Receipt;
- Reconciliation Event;
- Superseded Manifest Register.

Configurar:

```text
additionalProperties = false
required = [...] 
format validation = active
strict mode = active
```

### Cardinalidade por domínio

Validar separadamente:

```text
employees_declared = employees_physical = employees_unique
tasks_declared = tasks_physical = tasks_valid
receipts_declared = receipts_physical = receipts_hashed
tenants_declared = tenants_authorized
payments_declared = provider_events_valid
certifications_declared = evidence_eligible_records
```

Não usar `CANONICAL_500_ROLES.length === 500` como prova universal.

Criar testes com manifesto truncado, ID duplicado, referência órfã, hash ausente, campo extra e total incorrecto.

## 11. Correcção 8 — Todos os gates baseados em recibos do mesmo commit

Converter os gates restantes:

```text
CLEAN_BUILD_GATE
TEST_PASS_GATE
TYPE_SAFETY_GATE
AUTHENTICATION_GATE
TENANT_ISOLATION_GATE
SECURITY_GATE
PAYMENT_TRUTH_GATE
PAYMENT_PERSISTENCE_GATE
REVENUE_TRUTH_GATE
MANIFEST_SCHEMA_GATE
MANIFEST_CARDINALITY_GATE
PHYSICAL_HASH_GATE
CI_EXECUTION_GATE
REPOSITORY_CLEANLINESS_GATE
```

Cada `GateReceipt` deve conter:

```text
receipt_id
gate_name
source_commit_sha
working_tree_state
command
environment
started_at
completed_at
exit_code
evidence_paths
evidence_sha256
verifier_name
verifier_version
status
findings
```

Regras:

- SHA diferente do commit actual = `FAIL`;
- working tree dirty = `FAIL` para certificação;
- evidência inexistente = `FAIL`;
- recibo produzido pelo próprio motor de decisão sem verificador independente = `FAIL`;
- recibo antigo = `STALE`, não `PASS`;
- gate não executado = `NOT_RUN`, tratado como bloqueante.

O `MasterTruthReconciliationEngine` deve apenas agregar recibos válidos. Não pode declarar directamente `PASS`.

## 12. Correcção 9 — Actualizar Next.js

Actualizar `next@14.2.15` para uma versão corrigida e compatível.

Procedimento:

1. identificar a versão segura suportada;
2. actualizar lockfile;
3. executar auditoria de dependências;
4. compilar packages e web;
5. executar testes;
6. realizar smoke test das rotas;
7. verificar rendering, navegação, SSR/SSG e bundles;
8. registar breaking changes e correcções.

Não ignorar o aviso de vulnerabilidade e não usar `--force` sem análise.

## 13. Correcção 10 — Executar e comprovar CI

Actualizar `.github/workflows/ci.yml` para executar:

```text
npm ci
npm run clean
npm run typecheck
npm run build:packages
npm run build:web
npm test
npm run validate:manifests
npm run verify:hashes
npm run verify:security
npm run verify:payments
npm run verify:auth
git diff --exit-code
```

Exigir checks:

```text
clean-build
web-build
tests
auth-security
tenant-isolation
payment-integrity
manifest-validation
physical-hash-validation
repository-cleanliness
```

Depois de push:

1. aguardar execução real;
2. obter workflow run ID e commit SHA;
3. verificar todos os jobs;
4. guardar logs e artefactos;
5. confirmar que os recibos pertencem ao mesmo SHA;
6. comprovar branch protection;
7. não declarar `CI PASS` com checks ausentes.

## 14. Verificador de segurança ampliado

O verificador não pode limitar-se a procurar strings. Deve testar:

- emissor público de tokens;
- segredo fallback;
- issuer/audience/nbf/jti;
- revogação e rotação;
- cross-tenant;
- RBAC e ABAC;
- rate limiting;
- CORS;
- mock em produção;
- segredos em logs;
- webhook replay;
- persistência financeira;
- concorrência e idempotência;
- dependências vulneráveis.

Static string checks podem complementar, mas não substituir testes comportamentais.

## 15. Ordem obrigatória

```text
1. REMOVE PUBLIC TOKEN ISSUER
2. REMOVE FALLBACK SECRETS AND ADD STARTUP FAIL-FAST
3. RECONCILE PHYSICAL HASH EVIDENCE
4. MAKE TESTS READ-ONLY AND DETERMINISTIC
5. IMPLEMENT TRANSACTIONAL FINANCIAL STORAGE
6. IMPLEMENT REAL PROVIDER INTEGRATIONS
7. IMPLEMENT AJV SCHEMAS AND DOMAIN CARDINALITY
8. CONVERT ALL GATES TO SAME-COMMIT RECEIPTS
9. UPDATE NEXT.JS
10. EXECUTE GITHUB CI
11. VERIFY CLEAN CHECKOUT
12. ISSUE FINAL DECISION
```

Após cada etapa:

```text
CORRECT
→ UNIT TEST
→ NEGATIVE TEST
→ INTEGRATION TEST
→ RECORD RECEIPT
→ VERIFY PHYSICAL HASH
```

## 16. Entregáveis

1. Código corrigido.
2. Migrações da base de dados.
3. Configuração segura de ambiente sem segredos.
4. Testes de autenticação e autorização.
5. Testes de pagamentos e concorrência.
6. Integrações reais ou estados `NOT_CONFIGURED`.
7. Schemas Ajv.
8. Relatórios de cardinalidade por domínio.
9. Recibos associados ao commit final.
10. Relatório de reconciliação do hash divergente.
11. Relatório de dependências.
12. GitHub Actions executado.
13. Evidência de branch protection.
14. Resultado de `git diff --exit-code`.
15. Relatório final e SHA do commit.

## 17. Critérios finais

Só permitir:

```text
PATCH_VERIFIED_CONTROLLED_PILOT_READY
```

se:

```text
public_token_issuer_removed = PASS
production_secret_fail_fast = PASS
physical_hash_reconciliation = PASS
tests_read_only = PASS
repository_cleanliness = PASS
transactional_payment_storage = PASS
provider_integration_truth = PASS ou BLOCKED_WITHOUT_FALSE_CLAIMS
ajv_schema_validation = PASS
domain_cardinality = PASS
same_commit_receipts = PASS
next_security_update = PASS
github_ci = PASS
branch_protection = PASS
critical_security_findings = 0
```

Caso contrário:

```text
PATCH_FAILED_NOT_READY
```

Mesmo depois da aprovação deste patch, preservar:

```text
GENERAL PRODUCTION = BLOCKED
CERT-L3 = 0
VERIFIED LIVE TASKS = 0
EXTERNALLY VERIFIED TENANTS = 0
VERIFIED REAL PAYMENTS = 0
```

até existirem provas externas autênticas.

## 18. Comando final

Execute agora este patch pequeno e fechado.

Não crie novo grande módulo. Não fabrique clientes, pagamentos, logs, hashes, autorizações ou recibos. Não corrija evidência mudando apenas o valor esperado. Não use testes circulares. Não declare CI aprovada sem uma execução real do commit final.

A execução só termina quando o mesmo commit demonstrar:

```text
CLEAN CHECKOUT
→ NPM CI
→ FULL BUILD
→ ALL TESTS
→ SECURITY NEGATIVE TESTS
→ PAYMENT INTEGRATION TESTS
→ AJV SCHEMA VALIDATION
→ DOMAIN CARDINALITY VALIDATION
→ PHYSICAL HASH VALIDATION
→ GITHUB CI PASS
→ BRANCH PROTECTION
→ CLEAN WORKTREE
```

Quando um requisito depender de credenciais, contratos ou documentação externa inexistente, classificar como `BLOCKED_BY_EXTERNAL_DEPENDENCY`, preservar o bloqueio operacional e não simular um `PASS`.
