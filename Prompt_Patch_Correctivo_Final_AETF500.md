# PROMPT MESTRE — PATCH CORRECTIVO FINAL DE VERDADE TÉCNICA E PRONTIDÃO CONTROLADA

## 1. Missão

Execute um patch correctivo rigorosamente limitado aos sete bloqueios identificados na auditoria independente do repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Commit auditado:

```text
62a8e497791281d3d283dd0963e5599fcb1acf57
```

Não criar outro grande módulo, ampliar o produto, adicionar áreas funcionais nem alterar a arquitectura central sem necessidade directa.

O objectivo exclusivo é corrigir:

1. build web;
2. gates hard-coded;
3. autenticação e autorização multi-tenant;
4. webhooks e persistência de pagamentos;
5. manifestos contraditórios;
6. validação física de hashes e schemas;
7. CI e protecção do ramo principal.

## 2. Estado inicial obrigatório

Preservar:

```text
DEVELOPMENT BASELINE
INTERNAL TEST SUITE PASS
CONTROLLED PILOT READINESS NOT YET PROVEN
GENERAL PRODUCTION BLOCKED
CERT-L3 = 0
```

Não elevar esta classificação antes da conclusão comprovada de todos os gates.

## 3. Princípios obrigatórios

```text
DECLARED PASS ≠ VERIFIED PASS
UNIT TEST PASS ≠ FULL BUILD PASS
GATE CONSTANT ≠ GATE EVALUATION
HEADER TENANT ID ≠ AUTHENTICATED TENANT
HASH FUNCTION EXISTS ≠ PHYSICAL HASH VERIFIED
WEBHOOK SECRET PROVIDED BY REQUEST ≠ TRUSTED SECRET
MANIFEST PRESENT ≠ MANIFEST VALID
WORKFLOW FILE EXISTS ≠ CI EXECUTED
SIMULATION ≠ REAL PAYMENT
RECONCILIATION REPORT ≠ SOURCE CORRECTED
```

Nenhum gate pode concluir `PASS` com base apenas em constante, teste circular, relatório do próprio motor, manifesto sem validação física, recibo inexistente ou execução de outro commit.

## 4. Escopo fechado

Limitar alterações a:

```text
package.json
tsconfig.json
tsconfig.base.json
apps/web
apps/api
packages/shared
packages/rolepack
packages/runtime/src/aetf
packages/marketplace-billing
packages/tool-sdk
generated
scripts/verification
.github/workflows
```

Qualquer alteração fora deste escopo deve conter justificação explícita ligada a um dos sete bloqueios.

## 5. Correcção 1 — Build web e `npm run verify`

### Problema

O bundle web recebe `node:crypto` através de:

```text
node:crypto
→ packages/shared
→ packages/rolepack
→ apps/web
```

Além disso, `npm run verify` não executa `build:web`.

### Acções

1. Separar módulos server-side e browser-safe.
2. Remover imports directos ou indirectos de `node:crypto` do cliente.
3. Criar entradas distintas, quando necessário:

```text
@ai-employee/shared
@ai-employee/shared/server
@ai-employee/shared/browser
```

4. Não substituir SHA-256 por pseudo-hash.
5. Usar Node Crypto no servidor e Web Crypto API no browser, quando necessário.
6. Actualizar `npm run verify` para executar:

```text
clean
→ typecheck
→ build:packages
→ build:web
→ unit tests
→ integration tests
→ security tests
→ manifest validation
→ physical evidence validation
```

7. Actualizar o Next.js para versão corrigida e compatível, após avaliar breaking changes.

### Aceitação

Num checkout limpo:

```bash
npm ci
npm run verify
npm run build
git status --short
```

Resultados:

```text
npm ci = PASS
npm run verify = PASS
npm run build = PASS
web build = PASS
exit_code = 0
working tree = CLEAN
```

## 6. Correcção 2 — Remover gates hard-coded

Substituir `status: 'PASS'` declarado directamente no `MasterTruthReconciliationEngine` por verificadores independentes baseados em recibos.

Criar:

```typescript
interface GateReceipt {
  receiptId: string;
  gateName: string;
  command?: string;
  sourceCommitSha: string;
  environment: string;
  startedAt: string;
  completedAt: string;
  exitCode?: number;
  evidencePaths: string[];
  evidenceHashes: Record<string, string>;
  verifierName: string;
  verifierVersion: string;
  result: 'PASS' | 'FAIL' | 'PASS_WITH_RESTRICTIONS';
  findings: string[];
}
```

Implementar verificadores para:

```text
CLEAN_BUILD_GATE
TEST_PASS_GATE
TYPE_SAFETY_GATE
SECURITY_GATE
TENANT_ISOLATION_GATE
PAYMENT_TRUTH_GATE
REVENUE_TRUTH_GATE
MANIFEST_SCHEMA_GATE
MANIFEST_CARDINALITY_GATE
PHYSICAL_HASH_GATE
TASK_EVIDENCE_GATE
EXTERNAL_AUTHORIZATION_GATE
REGULATORY_SOURCE_GATE
CONNECTOR_REALITY_GATE
PRODUCTION_CONFIGURATION_GATE
CI_EXECUTION_GATE
```

Regras:

- gate sem recibo válido = `FAIL`;
- recibo de outro commit = `FAIL`;
- hash divergente = `FAIL`;
- evidência ausente = `FAIL`;
- exit code diferente de zero = `FAIL`;
- resultado antigo não certifica commit novo;
- testes devem validar evidência, não constantes do motor.

Eliminar o SHA antigo hard-coded. Obter o SHA do ambiente CI ou do Git durante a verificação.

## 7. Correcção 3 — Autenticação e autorização multi-tenant

O header `x-tenant-id` não representa identidade autenticada.

Implementar:

1. autenticação por token assinado ou sessão segura;
2. validação de emissor, audiência, assinatura, expiração, `not-before`, subject, tenants, roles e scopes;
3. resolução do tenant a partir da identidade autenticada;
4. validação do `x-tenant-id` contra tenants autorizados no token;
5. fluxo central:

```text
authenticate
→ resolveIdentity
→ resolveTenant
→ authorizeAction
→ validateRequest
→ execute
→ audit
```

6. RBAC/ABAC para leitura, escrita, aprovações, pagamentos, facturação, administração, conectores, kill switch e baseline;
7. `401` para falta de autenticação e `403` para falta de autorização;
8. rate limiting;
9. CORS fail-closed em produção, sem `*`;
10. processamento do body antes de verificações que dele dependam;
11. limites de body por endpoint;
12. bloqueio real do `MockEmailConnector` no ponto de execução em produção.

Testes negativos:

- token ausente, inválido ou expirado;
- audiência incorrecta;
- tenant adulterado;
- acesso entre tenants;
- scope insuficiente;
- self-approval;
- administração indevida;
- rate limit;
- origem CORS não autorizada;
- mock em produção.

## 8. Correcção 4 — Webhooks e persistência de pagamentos

Nunca aceitar `webhookSecret` fornecido pelo pedido.

Implementar:

1. segredo obtido exclusivamente do servidor ou secret manager;
2. raw body capturado antes do parser JSON;
3. assinatura oficial por prestador;
4. `createHmac()` e `timingSafeEqual()` para HMAC genérico;
5. adaptadores separados:

```text
StripeWebhookVerifier
ExpressPayWebhookVerifier
SandboxPaymentVerifier
```

6. validar event ID, transaction ID, invoice ID, tenant, montante, moeda, timestamp, tolerância temporal, assinatura, estado e idempotência;
7. rejeitar replay;
8. persistir facturas, eventos, idempotency keys e settlements em base transaccional;
9. proibir `Map` e `Set` como armazenamento de produção;
10. implementar transacção atómica:

```text
verify event
→ acquire idempotency lock
→ load invoice
→ validate
→ persist payment
→ update invoice
→ create accounting event
→ commit
```

Somente após confirmação válida permitir `PAID`.

Sandbox permanece:

```text
SIMULATED
NOT_REAL_REVENUE
ACCOUNTING_POSTING_BLOCKED
TAX_DOCUMENT_NOT_ISSUED
```

Testar assinatura falsa, payload alterado, replay, duplicação, tenant/moeda/montante errados, factura inexistente, evento expirado, concorrência e rollback.

## 9. Correcção 5 — Manifestos contraditórios

Inventariar todas as ocorrências de:

```text
68,500 VERIFIED_REAL_LIVE_TASKS
VERIFIED_REAL_TENANT
ACTIVE_PILOT_PRODUCTION
CERT_L3_APPROVED
```

Para cada uma:

1. identificar o produtor;
2. corrigir o produtor canónico, não apenas o relatório;
3. preservar o histórico;
4. criar `SupersededManifestRegister`;
5. marcar versões antigas:

```text
SUPERSEDED
INVALIDATED_BY_FORENSIC_RECONCILIATION
NOT_FOR_PRODUCTION_DECISION
```

6. gerar versões activas reconciliadas com zero tarefas live, zero tenants externos e CERT-L3 zero, salvo prova física;
7. bloquear motores que regenerem alegações invalidadas;
8. actualizar API e dashboard para lerem apenas manifestos activos;
9. criar teste que falhe perante afirmações contraditórias activas.

Precedência:

```text
ACTIVE_RECONCILED_MANIFEST
>
SUPERSEDED_HISTORICAL_MANIFEST
```

## 10. Correcção 6 — Hashes físicos, schemas e cardinalidade

Criar verificador global para todos os artefactos activos.

Por ficheiro:

```text
physical_path
exists
byte_length
recorded_sha256
calculated_sha256
match
hash_subject
canonicalization
```

Resolver a divergência do log de build:

```text
hash registado:
712de5212d40c7b4aabe702815e889bc3f956042b486631db875a5d99bf73298

hash físico observado:
afdee24f1a7b60424a832f569db6ddf3ab15c139c74ba3cce9af2e7dc8827954
```

Localizar também o ficheiro referido mas ausente:

```text
02_Original_Install_Log.txt
```

Sem ficheiro físico, o gate deve falhar.

Criar JSON Schemas para live tasks, production freeze, certificação, tenant authorization, pagamentos, CI, build, testes, hashes e reconciliation events. Validar com Ajv ou equivalente.

Cardinalidade:

```text
declared_total
= physical_records
= unique_ids
= valid_schema_records
= records_with_valid_hash
```

Verificar os 500 Employees individualmente. A validação do catálogo não prova os restantes manifestos.

Gerar:

```text
generated/verification/PhysicalHashVerificationReceipt.json
generated/verification/ManifestSchemaVerificationReceipt.json
generated/verification/ManifestCardinalityReceipt.json
generated/verification/ContradictoryClaimsScan.json
```

## 11. Correcção 7 — CI real e protecção do ramo

O workflow deve executar:

```text
npm ci
npm run clean
npm run typecheck
npm run build:packages
npm run build:web
npm test
npm run validate:manifests
npm run verify:hashes
npm run verify:evidence
npm run verify:security
git diff --exit-code
```

Remover a falsa verificação que apenas calcula o hash da palavra `AETF500`. Substituí-la pela validação física dos artefactos activos.

Os testes devem escrever em directório temporário, limpar os seus artefactos e não modificar ficheiros rastreados.

Gerar recibos CI com SHA, workflow run ID, job ID, timestamps, conclusão, comandos, exit codes, artefactos e hashes.

Exigir checks antes de merge:

```text
clean-build
web-build
tests
security
manifest-validation
physical-hash-validation
evidence-validation
repository-cleanliness
```

O ficheiro YAML existir não significa que a CI passou.

## 12. Ordem obrigatória

```text
1. WEB BUILD REPAIR
2. VERIFY PIPELINE REPAIR
3. AUTHENTICATION AND TENANT ISOLATION
4. PAYMENT WEBHOOK AND PERSISTENCE REPAIR
5. MANIFEST PRODUCER RECONCILIATION
6. PHYSICAL HASH AND SCHEMA VALIDATION
7. CI EXECUTION AND BRANCH PROTECTION
8. CLEAN CHECKOUT FINAL RETEST
9. FINAL DECISION
```

Após cada etapa:

```text
CORRECT → TEST → NEGATIVE TEST → RECORD RECEIPT → VERIFY HASH → COMMIT
```

## 13. Gates finais

```text
WEB_BUILD_GATE
VERIFY_COMPLETENESS_GATE
AUTHENTICATION_GATE
TENANT_ISOLATION_GATE
PAYMENT_WEBHOOK_GATE
PAYMENT_PERSISTENCE_GATE
MANIFEST_RECONCILIATION_GATE
PHYSICAL_HASH_GATE
MANIFEST_SCHEMA_GATE
MANIFEST_CARDINALITY_GATE
CI_EXECUTION_GATE
BRANCH_PROTECTION_GATE
REPOSITORY_CLEANLINESS_GATE
```

Se qualquer gate crítico falhar:

```text
FINAL_PATCH_GATE = FAIL
```

## 14. Entregáveis

1. Código corrigido.
2. Lista exacta dos ficheiros alterados.
3. Resultado do clean build.
4. Resultado completo dos testes.
5. Testes negativos de segurança e pagamentos.
6. Recibos físicos dos gates.
7. Manifestos reconciliados.
8. Registo de manifestos substituídos.
9. Relatório global de hashes.
10. Relatório de schemas e cardinalidade.
11. Execução real do GitHub Actions.
12. Estado dos checks obrigatórios.
13. Relatório final do patch.
14. Novo commit SHA.

## 15. Decisão permitida

Até ao fecho comprovado:

```text
DEVELOPMENT BASELINE
INTERNAL TEST SUITE PASS
CONTROLLED PILOT READINESS NOT YET PROVEN
GENERAL PRODUCTION BLOCKED
CERT-L3 = 0
```

Depois, emitir apenas:

```text
PATCH_VERIFIED_CONTROLLED_PILOT_READY
```

ou:

```text
PATCH_FAILED_NOT_READY
```

O primeiro estado exige:

```text
full_build = PASS
web_build = PASS
tests = PASS
security = PASS
tenant_isolation = PASS
payment_truth = PASS
manifest_reconciliation = PASS
physical_hashes = PASS
schemas = PASS
CI = PASS
repository_clean_after_tests = PASS
critical_findings = 0
```

Mesmo com o patch aprovado:

```text
GENERAL PRODUCTION = BLOCKED
CERT-L3 = 0
VERIFIED LIVE TASKS = 0
EXTERNALLY VERIFIED TENANTS = 0
VERIFIED REAL PAYMENTS = 0
```

até existirem evidências externas autênticas.

## 16. Comando final

Execute agora este patch limitado. Não crie outro grande módulo, não adicione funcionalidades comerciais e não altere artificialmente resultados para obter `PASS`.

A execução só termina quando o mesmo commit comprovar:

```text
CLEAN CHECKOUT
→ NPM CI
→ FULL BUILD
→ WEB BUILD
→ ALL TESTS
→ SECURITY NEGATIVE TESTS
→ PAYMENT NEGATIVE TESTS
→ MANIFEST VALIDATION
→ PHYSICAL HASH VALIDATION
→ CI EXECUTION
→ CLEAN WORKTREE
```

Todos os resultados devem estar sustentados por recibos independentes, hashes físicos válidos e evidência verificável.
