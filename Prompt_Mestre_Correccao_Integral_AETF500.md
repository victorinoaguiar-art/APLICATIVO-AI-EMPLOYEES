# PROMPT MESTRE — CORRECÇÃO INTEGRAL DO REPOSITÓRIO, EVIDÊNCIAS E PRONTIDÃO PARA PRODUÇÃO

## 1. Missão

Actue como arquitecto sénior de software, engenheiro principal TypeScript/Node.js, especialista em monorepositórios, engenheiro DevSecOps, auditor forense de software, especialista em integridade criptográfica, engenheiro de qualidade, especialista em SaaS multi-tenant e auditor de pagamentos e evidências digitais.

Analise e corrija integralmente o repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Ponto de partida:

```text
Commit: b5b3129feaba04efe9637c3ed9bc88e33e826fd2
Título: feat: synchronize complete project codebase, engines, test suites, and manifests
```

O objectivo é transformar a versão actual numa baseline compilável, testável, segura, auditável, reproduzível e preparada para piloto controlado. Não declare prontidão para produção, CERT-L3, receita real, cliente real, integração real ou evidência externa sem prova suficiente.

## 2. Princípio central

Aplicar rigorosamente:

```text
DESIGNED ≠ IMPLEMENTED
IMPLEMENTED ≠ TESTED
TESTED ≠ PASSED
GENERATED ≠ EXECUTED
SIMULATED ≠ REAL
SANDBOX ≠ PRODUCTION
INTERNAL ≠ EXTERNAL
HASH-LIKE STRING ≠ SHA-256
CHECKOUT CREATED ≠ PAYMENT RECEIVED
INVOICE GENERATED ≠ INVOICE PAID
TENANT DECLARED IN CODE ≠ AUTHORIZED CUSTOMER
AGGREGATE COUNT ≠ TASK-LEVEL EVIDENCE
COMMIT SYNCHRONIZED ≠ PRODUCTION READY
```

Nenhum `PASS` poderá resultar apenas de constantes, fórmulas, valores por defeito, dados inseridos no código ou manifestos produzidos pelo próprio motor avaliado.

## 3. Preservação do histórico

Não apagar, sobrescrever ou ocultar manifestos, relatórios, hashes, testes ou decisões anteriores. Para cada correcção material, criar um `AuditReconciliationEvent` com:

```text
event_id
artifact_id
previous_version
new_version
claim
old_value
new_value
reason
evidence_reference
changed_at
changed_by
verification_status
```

## 4. Fase 1 — Reprodução forense

Antes de alterar o código:

1. Criar checkout limpo do commit indicado.
2. Registar sistema operativo, arquitectura, Node.js, npm, SHA e hora UTC.
3. Executar `npm install`, `npm test` e `npm run build`.
4. Capturar stdout, stderr, exit code, duração e hash dos logs.
5. Produzir inventário completo das falhas.
6. Não corrigir silenciosamente o resultado original.

Gerar:

```text
generated/repository_truth/01_Clean_Checkout_Reproduction.json
generated/repository_truth/02_Original_Build_Log.txt
generated/repository_truth/03_Original_Test_Log.txt
generated/repository_truth/04_Original_Failure_Inventory.json
```

## 5. Fase 2 — Corrigir o monorepositório

- Definir Node.js LTS em `.nvmrc`, `.node-version` e `package.json#engines`.
- Criar e versionar `package-lock.json`.
- Adoptar `npm ci` para instalações determinísticas.
- Corrigir referências TypeScript e ordem de compilação.
- Compilar: shared → packages básicos → policies → permissions → approvals → tool-sdk → rolepack → marketplace-billing → runtime → evaluation-sdk → API → web.
- Criar `tsconfig.json` raiz com project references e usar `tsc -b` quando apropriado.
- Corrigir todos os erros `TS6305`, imports não resolvidos e `implicit any`.
- Corrigir o comando Next.js para funcionar com workspaces e dependências hoisted.
- Remover do controlo de versão `*.tsbuildinfo`, `dist` e artefactos compilados dentro de `src`, salvo necessidade documentada.
- Garantir que o build não depende de ficheiros previamente gerados.

Critério:

```text
npm ci = PASS
npm run build = PASS
exit_code = 0
```

## 6. Fase 3 — Testes e regressão

Criar um comando único:

```text
npm run verify
```

Fluxo:

```text
clean → typecheck → build → unit tests → integration tests → security tests → manifest validation → evidence validation
```

Separar testes unitários, integração, contratos, segurança, tenant isolation, regressão, evidência, manifestos, pagamentos, API, web e smoke tests.

Testar obrigatoriamente:

- isolamento entre tenants;
- bypass de aprovação e escalada de privilégios;
- idempotência e repetição de pedidos;
- duplicação de pagamentos e webhooks falsos;
- hash adulterado e manifesto incompleto;
- recibos e referências ausentes;
- ligação tarefa → execução → efeito → evidência;
- bloqueios PRIMAVERA;
- conectores simulados;
- rollback, kill switch, filas, retries e DLQ;
- concorrência, limites financeiros e entradas malformadas.

Mostrar sempre `passed/total`, `failed/total`, `skipped/total`, duração, SHA e ambiente. Proibir testes que apenas confirmem constantes do próprio motor.

## 7. Fase 4 — CI/CD

Criar GitHub Actions para instalação determinística, typecheck, build, testes, análise de dependências, secret scanning, validação de manifestos, hashes, SBOM, logs, artefactos e smoke tests.

Configurar checks obrigatórios e protecção do ramo principal. Nenhuma baseline pode ser aprovada sem todos os checks críticos em `PASS`.

## 8. Fase 5 — Integridade criptográfica

Eliminar pseudo-hashes. É proibido chamar SHA-256 a uma função personalizada de 32 bits.

Usar:

```typescript
import { createHash } from 'node:crypto';

export function sha256Bytes(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}
```

Para cada digest, registar algoritmo, objecto, tipo, caminho físico, tamanho, canonicalização, hash calculado, hash registado, resultado e data.

Não criar hash auto-referencial circular. Usar ficheiro `.digest`, assinatura detached, manifesto superior ou conteúdo canónico que exclua o campo do próprio digest.

Localizar e reclassificar valores `certl3_*`, strings repetidas, concatenações, pseudo-hashes e valores que não correspondam aos bytes físicos.

## 9. Fase 6 — Reconstrução dos manifestos

Criar JSON Schemas versionados. Todo manifesto crítico deve incluir schema, versão, artefacto, gerador, commit de origem, ambiente, classificação, registos, resumo e integridade.

Validar campos, tipos, enums, unicidade, cardinalidade, referências, existência física, hashes, datas, denominadores e compatibilidade de versões.

Regra:

```text
summary.total_records
= physical_records_count
= valid_unique_record_ids
= records_referenced_by_evidence
```

Qualquer divergência deve resultar em `MANIFEST_CARDINALITY_GATE = FAIL`. Não guardar apenas 50 Employees quando a afirmação abrange 500.

## 10. Fase 7 — Reconciliar as 68.500 tarefas

Suspender a afirmação `68,500 VERIFIED_REAL_LIVE_TASKS` até existir evidência física.

Proibir o motor de copiar `required_tasks` para `executed_tasks`, definir gap zero e conceder CERT-L3 automaticamente.

Separar:

```text
required_tasks
scheduled_tasks
generated_test_cases
executed_tasks
verified_tasks
externally_verified_tasks
rejected_tasks
duplicate_tasks
simulated_tasks
live_tasks
```

Cada tarefa real deve possuir `task_id`, Employee, tenant, workflow, autorização, trigger, input hash, timestamps, ambiente, tool calls, target system, before/action/after, recibo externo, aprovação, efeito, validação, evidence bundle e hashes.

Classificar cada execução como:

```text
VERIFIED_REAL_LIVE
INTERNALLY_VERIFIED_LIVE
AUTHORIZED_PILOT
SANDBOX
STAGING
EMULATOR
CONTROLLED_SIMULATION
SYNTHETIC
REPLAY
DUPLICATE
INVALID
INSUFFICIENT_EVIDENCE
```

Não fabricar 68.500 registos sintéticos para cumprir a meta. Se faltarem provas, declarar o número comprovado e o gap real.

## 11. Fase 8 — Empresas e autorizações

Remover classificações automáticas como `VERIFIED_REAL_TENANT`, `EXTERNALLY_VERIFIED` e `ACTIVE_PILOT_PRODUCTION` quando sustentadas apenas por código.

Exigir, por empresa: identidade jurídica, autorização, signatário, poderes, escopos de tenant/Employee/workflow/tool/data, datas, método de assinatura, verificação independente e hash físico.

Sem prova, usar:

```text
DEMONSTRATION_TENANT
CONTROLLED_TEST_TENANT
UNVERIFIED_PILOT_TENANT
NOT_YET_EXTERNALLY_VERIFIED
```

Não apresentar Angola Telecom, Banco BAI, Sonangol ou outra entidade como cliente ou parceiro sem prova independente. Não fabricar documentos, contactos, licenças ou assinaturas.

## 12. Fase 9 — Pagamentos, facturação e receita

Corrigir integralmente o `PaymentGatewayManager`:

- não fabricar URLs de checkout;
- não devolver `PAID` em sandbox;
- não criar `paidAt` sem confirmação;
- não marcar factura como paga na emissão;
- não reconhecer receita simulada;
- não aplicar IVA apenas porque a moeda é AOA.

Estados:

```text
CREATED, PENDING, AWAITING_PROVIDER, AUTHORIZED, PAID, FAILED, EXPIRED, CANCELLED, REFUNDED, SIMULATED
```

Aceitar `PAID` apenas após resposta real, webhook assinado, conferência de referência, montante, moeda, tenant, idempotência e liquidação/confirmação.

Em sandbox:

```text
payment_status = SIMULATED
revenue_status = NOT_REAL_REVENUE
accounting_posting = BLOCKED
tax_document_status = NOT_ISSUED
```

Criar determinação fiscal separada, com jurisdição, natureza, regime, taxa, vigência, fonte legal e aprovação quando necessária.

## 13. Fase 10 — Segurança da API

Implementar autenticação, RBAC/ABAC, tenant obrigatório, isolamento central, validação de pedidos, rate limiting, security headers, CORS restritivo, limites de payload, idempotência, logs, correlation IDs, gestão de erros e segredos.

Proteger aprovações, execução de tarefas, DLQ, pagamentos, facturas, redes sociais, comandos remotos, alterações regulatórias, activação de Employees, operações financeiras, permissões, kill switch e baseline.

Eliminar defaults de produção como `org-demo`, `org_default`, `tenant_demo`, `user@example.com` e `supervisor_user`. Ausência de identidade deve resultar em `401` ou `403`.

## 14. Fase 11 — Conectores

Criar registo central com provider, ambiente, capacidades, autenticação, tenant, verificação, saúde, write access e classificação.

Taxonomia:

```text
REAL_PRODUCTION_CONNECTOR
REAL_SANDBOX_CONNECTOR
AUTHORIZED_PILOT_CONNECTOR
CONNECTOR_EMULATOR
CONTROLLED_SIMULATION
GENERIC_MOCK
NOT_CONFIGURED
```

Aplicar `PRODUCTION + MOCK CONNECTOR = BLOCKED`. O `MockEmailConnector` não pode ser o padrão em produção.

Manter `PRIMAVERA_WRITE = BLOCKED` e `PRIMAVERA_IMPORT = BLOCKED` até existir conector real, ambiente autorizado, execução e validação independente.

## 15. Fase 12 — MINSA e conhecimento regulatório

Para cada fonte jurídica, validar ficheiro, SHA-256, título, número, data, órgão, URL oficial, recolha, vigência, alterações, revogações, aplicabilidade, artigos, regras e revisão.

Se a actualidade não for verificável, classificar `SOURCE_PRESENT_BUT_CURRENTNESS_NOT_VERIFIED`.

Separar:

```text
DOCUMENT EXISTS
DOCUMENT AUTHENTIC
DOCUMENT CURRENT
DOCUMENT APPLICABLE
RULE CORRECTLY DERIVED
RULE CORRECTLY RETRIEVED
RULE CORRECTLY EXECUTED
```

## 16. Fase 13 — Infraestrutura operacional

Implementar configuração por ambiente, `.env.example`, validação de variáveis, Dockerfile, health/readiness checks, graceful shutdown, logs, métricas, tracing, persistência, migrações, backup, recuperação, retenção, filas, retries, DLQ, observabilidade, runbook, incident response e rollback.

Um endpoint `/health` isolado não comprova prontidão para produção.

## 17. Gates bloqueantes

Criar:

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
```

Se qualquer gate crítico falhar:

```text
MASTER_PRODUCTION_READINESS_GATE = FAIL
```

Não converter falhas em `PASS` por fallback, hard-code, exclusão de teste, redução de denominador, reclassificação sem prova ou geração de manifesto pelo próprio componente avaliado.

## 18. Certificação Employee por Employee

Estados permitidos:

```text
DESIGN_COMPLETE
IMPLEMENTED_NOT_TESTED
TEST_FAILED
INTERNAL_TEST_PASS
SIMULATION_PASS
SANDBOX_PASS
CONTROLLED_PILOT_READY
CONTINUE_LIVE_PILOT
CERT_L3_ELIGIBLE
CERT_L3_APPROVED
CERT_L3_WITH_RESTRICTIONS
SUSPENDED
BLOCKED
```

CERT-L3 exige build válido, testes reproduzíveis, evidência suficiente, tenant autorizado, workflows e conectores correctos, efeitos confirmados, segurança, hashes e manifestos válidos.

Recalcular os 500 Employees individualmente. Preservar o histórico das decisões anteriores.

## 19. Entregáveis

Produzir:

1. Relatório de reprodução original.
2. Inventário dos erros.
3. Código corrigido.
4. Build determinístico.
5. Suite de testes.
6. GitHub Actions.
7. Schemas e manifestos reconstruídos.
8. Registo de hashes físicos.
9. Matriz Requirement → Test → Evidence.
10. Matriz Claim → Evidence → Status.
11. Reconciliação das 68.500 tarefas.
12. Registo de tenants e autorizações.
13. Reconciliação de pagamentos e receitas.
14. Relatório de segurança.
15. Relatório de conectores.
16. Relatório MINSA.
17. Eventos de reconciliação.
18. Relatório de regressão.
19. Relatório final de prontidão.

## 20. Decisão final

Emitir exactamente uma decisão:

```text
PRODUCTION_READY
CONTROLLED_PILOT_READY
CONDITIONALLY_READY_WITH_RESTRICTIONS
NOT_PRODUCTION_READY
```

Mostrar:

```text
Decision
Critical gates passed
Critical gates failed
Blocking findings
Restrictions
Verified live task count
Externally verified tenants
Verified real payments
Employees by certification status
Required next action
```

Só declarar `PRODUCTION_READY` quando todos os gates críticos passarem e `critical_blockers = 0`.

## 21. Proibições absolutas

Não fabricar logs, recibos, clientes, autorizações, assinaturas, webhooks, pagamentos, transacções, execuções live ou evidências. Não chamar pseudo-hash de SHA-256, aumentar contagens, marcar facturas como pagas sem confirmação, conceder CERT-L3 por hard-code, excluir testes falhados, reduzir denominadores ou congelar baseline com bloqueios críticos.

## 22. Comando final

Execute agora a correcção integral, começando pela reprodução forense e avançando fase por fase:

```text
DIAGNOSE → CORRECT → TEST → VERIFY → RECORD EVIDENCE → DECIDE
```

Não congele a nova baseline enquanto existir qualquer falha crítica. Quando uma afirmação não puder ser comprovada, classifique-a como `NOT_YET_VERIFIED` e apresente a evidência em falta, responsável, acção, critério de aceitação, impacto na certificação e próximo teste.

O resultado deve tornar o AETF-500:

```text
COMPILÁVEL
TESTÁVEL
REPRODUZÍVEL
SEGURO
AUDITÁVEL
CRYPTOGRAPHICALLY VERIFIABLE
EVIDENCE-BASED
TENANT-SAFE
PAYMENT-TRUTHFUL
PRODUCTION-DEFENSIBLE
```
