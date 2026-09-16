# PROMPT DE EXECUÇÃO
## AETF-500 — Patch mínimo de coerência das evidências, vinculação ao SHA e protecção da CI

Actue como engenheiro sénior de software, auditor técnico e especialista em Git, GitHub Actions, Node.js, integridade criptográfica e cadeias de evidência reproduzíveis.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Estado de referência:

```text
Commit técnico corrigido:
8ee734881335456b0cd6c7c2a1efaa8dbb504cac

Commit mais recente:
649cad6144ee3e6ae9d8ce943dc44770ce2df393

GitHub Actions do commit mais recente:
Run ID: 35038501562
Status: completed
Conclusion: success
URL:
https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/35038501562
```

## 1. Missão

Executar um patch final pequeno e estritamente limitado à coerência das evidências e à obrigatoriedade da CI.

Corrigir somente:

1. regeneração das evidências;
2. vinculação explícita ao commit validado;
3. recibo real do GitHub Actions;
4. comportamento fail-closed do gerador;
5. prova de instalação limpa;
6. gate de coerência entre evidências;
7. hashes físicos dos recibos;
8. protecção do branch.

Não criar:

- novos módulos funcionais;
- novas engines;
- novos employees;
- novas funcionalidades comerciais;
- novos manifestos de produção;
- novas métricas operacionais;
- novos dados de clientes;
- novas alegações de certificação.

## 2. Regra essencial sobre o SHA

Um ficheiro versionado dentro de um commit não pode conter antecipadamente o SHA desse mesmo commit sem criar uma dependência circular.

Não tentar resolver este problema com:

- alteração artificial do SHA;
- reescrita repetida do commit;
- hashes sintéticos;
- placeholders apresentados como recibos finais;
- commits sucessivos alegando que o último valida a si próprio.

Adoptar a seguinte separação:

```text
SOURCE_SHA
= commit exacto cujo código foi executado e validado

EVIDENCE_PRODUCER
= workflow que gera os recibos depois de fazer checkout do SOURCE_SHA

EVIDENCE_ARTIFACT
= pacote produzido pela CI, fora da árvore Git validada

DOCUMENTATION_SHA
= eventual commit posterior que apenas referencia a evidência
```

A prova principal deve ser produzida pela CI depois do checkout do SHA alvo e publicada como artefacto imutável da execução.

O SHA técnico inicialmente indicado é:

```text
649cad6144ee3e6ae9d8ce943dc44770ce2df393
```

Se este patch alterar código, scripts ou workflow, o SHA alvo passa a ser o novo commit técnico. Toda a validação deve ser executada novamente sobre esse novo SHA.

## 3. Diagnóstico inicial

Antes das alterações:

1. Criar um checkout limpo.
2. Registar:

```text
repository
branch
HEAD SHA
remote origin
Node.js version
npm version
operating system
UTC timestamp
```

3. Executar:

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/master
npm ci
npm audit --omit=dev
npm run verify
```

4. Inspeccionar os SHAs presentes em:

```text
evidence/environment.json
evidence/test-summary.json
evidence/test-results.json
evidence/cardinality-results.json
evidence/schema-validation-results.json
evidence/github-actions-receipt.json
```

5. Confirmar e documentar as divergências existentes:

```text
environment.json              -> 40c46c4...
test-summary.json             -> 40c46c4...
test-results.json             -> 40c46c4...
github-actions-receipt.json   -> 8ee7348...
HEAD anteriormente auditado   -> 649cad6...
```

Não corrigir apenas o texto do relatório. Corrigir a origem e a geração dos recibos.

## 4. Escopo obrigatório

### P1 — Regenerar as evidências para o SHA alvo

A CI deve gerar novamente, depois do checkout do SHA alvo:

```text
evidence/environment.json
evidence/cardinality-results.json
evidence/schema-validation-results.json
evidence/test-results.json
evidence/test-summary.json
evidence/canonical-source-hashes.sha256
evidence/file-hashes.sha256
evidence/github-actions-receipt.json
```

Também deve gerar os logs reais:

```text
evidence/npm-ci.log
evidence/npm-audit-production.log
evidence/typecheck.log
evidence/build-packages.log
evidence/build-web.log
evidence/lint.log
evidence/tests.log
evidence/validate-manifests.log
evidence/verify-hashes.log
evidence/verify-security.log
evidence/verify-payments.log
evidence/verify-auth.log
evidence/verify.log
```

Todos devem ser produzidos durante a mesma execução ou por jobs vinculados ao mesmo:

```text
repository
workflow run ID
workflow run attempt
SOURCE_SHA
```

Publicar o directório como artefacto do GitHub Actions.

Não fazer commit automático desses ficheiros no branch principal.

### P2 — Incluir `commit_sha` em cardinalidades e schemas

Adicionar obrigatoriamente aos recibos:

```json
{
  "repository": "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES",
  "branch": "master",
  "commit_sha": "SHA_REAL",
  "generated_at": "ISO-8601",
  "generator": "scripts/generate-evidence.mjs"
}
```

Aplicar, no mínimo, a:

```text
cardinality-results.json
schema-validation-results.json
test-results.json
test-summary.json
environment.json
github-actions-receipt.json
```

O `commit_sha` deve ser obtido por:

```bash
git rev-parse HEAD
```

Na CI, confirmar também:

```text
commit_sha = GITHUB_SHA
```

Se forem diferentes, falhar imediatamente com:

```text
SOURCE_SHA_MISMATCH
```

### P3 — Registar a CI real do SHA validado

Consultar a API ou CLI do GitHub e registar a execução real.

Para o estado auditado:

```text
SOURCE_SHA:
649cad6144ee3e6ae9d8ce943dc44770ce2df393

RUN_ID:
35038501562

RUN_URL:
https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/35038501562

STATUS:
completed

CONCLUSION:
success
```

Se o patch produzir um novo SHA, não reutilizar esta execução. Aguardar e registar a execução correspondente ao novo SHA.

O recibo deve conter:

```json
{
  "repository": "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES",
  "branch": "master",
  "commit_sha": "SHA_REAL",
  "workflow_name": "CI / Production Readiness & Audit Gate",
  "run_id": 0,
  "run_attempt": 1,
  "run_url": "URL_REAL",
  "status": "completed",
  "conclusion": "success",
  "started_at": "ISO-8601",
  "completed_at": "ISO-8601",
  "jobs": [],
  "required_steps": [],
  "skipped_required_steps": []
}
```

A informação deve vir da API ou CLI do GitHub. Não preencher manualmente estado, conclusão, ID ou URL.

Validar:

```text
RECEIPT_COMMIT_SHA = SOURCE_SHA
RECEIPT_RUN_ID = ACTUAL_RUN_ID
RECEIPT_CONCLUSION = success
SKIPPED_REQUIRED_STEPS = 0
```

### P4 — Fazer o gerador falhar em qualquer erro

Corrigir `scripts/generate-evidence.mjs`.

Cada comando obrigatório deve produzir:

```js
{
  command,
  startedAt,
  completedAt,
  exitCode,
  stdout,
  stderr,
  success
}
```

Se `exitCode !== 0`:

1. gravar o log da falha;
2. marcar o pacote como falhado;
3. impedir classificação positiva;
4. terminar o processo com código diferente de zero.

Não aceitar apenas:

```js
console.warn("failure detected");
```

O gerador deve lançar erro ou definir:

```js
process.exitCode = 1;
```

A mensagem:

```text
All required evidence files generated successfully
```

somente pode aparecer se todos os comandos obrigatórios tiverem exit code 0.

Caso contrário:

```text
EVIDENCE_GENERATION_FAILED
```

Adicionar testes negativos que injectem uma falha e comprovem:

```text
generator exit code != 0
classification != PASS
success message absent
```

### P5 — Substituir `npm ci --dry-run`

Remover:

```bash
npm ci --dry-run
```

como prova de instalação.

A prova deve vir de um checkout limpo real:

```bash
npm ci
```

O recibo deve indicar:

```text
command: npm ci
exit_code: 0
package_lock_sha256
node_version
npm_version
started_at
completed_at
```

Fluxo recomendado:

1. checkout limpo;
2. `npm ci`;
3. guardar o log;
4. executar os restantes gates;
5. gerar o índice de evidências.

O gerador pode receber o caminho do log real, mas deve verificar:

- existência;
- SHA alvo;
- código de saída;
- hash do log;
- correspondência com a execução actual.

Não aceitar um ficheiro manual com a frase “npm ci passou”.

### P6 — Criar o gate de coerência dos SHAs

Criar um verificador pequeno:

```text
scripts/verify-evidence-coherence.mjs
```

Este é apenas um gate técnico, não um novo módulo funcional.

O gate deve:

1. obter o SHA esperado;
2. abrir todos os recibos obrigatórios;
3. verificar o `commit_sha`;
4. verificar o repositório;
5. verificar o workflow run ID;
6. verificar a conclusão;
7. verificar a presença dos ficheiros;
8. verificar os hashes;
9. rejeitar recibos sem SHA;
10. rejeitar recibos de commits diferentes.

Códigos de erro mínimos:

```text
EVIDENCE_FILE_MISSING
EVIDENCE_INVALID_JSON
EVIDENCE_COMMIT_SHA_MISSING
EVIDENCE_COMMIT_SHA_MISMATCH
EVIDENCE_REPOSITORY_MISMATCH
EVIDENCE_HASH_MISMATCH
CI_RECEIPT_MISSING
CI_RUN_SHA_MISMATCH
CI_RUN_NOT_COMPLETED
CI_RUN_NOT_SUCCESSFUL
REQUIRED_STEP_SKIPPED
EVIDENCE_INDEX_INVALID
```

Integrar na CI:

```bash
npm run verify:evidence-coherence
```

Não fazer o `verify` local depender de um recibo remoto que ainda não existe antes do push.

Separar:

```text
LOCAL_VERIFY
REMOTE_EVIDENCE_VERIFY
```

### P7 — Verificar hashes físicos

Criar:

```text
evidence/evidence-files.sha256
```

O índice deve conter o SHA-256 dos bytes físicos de cada evidência.

Não incluir o próprio índice na lista, evitando auto-referência.

Exemplo:

```text
<sha256>  environment.json
<sha256>  test-summary.json
<sha256>  test-results.json
<sha256>  cardinality-results.json
<sha256>  schema-validation-results.json
<sha256>  github-actions-receipt.json
<sha256>  verify.log
```

Regras:

- recalcular hashes a partir dos bytes;
- rejeitar hashes sem ficheiro físico;
- rejeitar ficheiros sem entrada no índice;
- rejeitar alteração de um byte;
- utilizar caminhos relativos normalizados;
- rejeitar entradas duplicadas;
- rejeitar caminhos fora de `evidence/`;
- aceitar somente SHA-256.

Adicionar teste negativo que altere um byte e obtenha:

```text
EVIDENCE_HASH_MISMATCH
```

### P8 — Configurar a protecção do branch

Configurar a branch `master` para exigir:

```text
Require a pull request before merging
Require status checks to pass before merging
Require branches to be up to date before merging
```

Checks obrigatórios:

```text
Deterministic Build, Typecheck, Test & Audit (22.x)
Evidence Coherence & Same-SHA Gate
```

Consultar a configuração pela API do GitHub e guardar:

```json
{
  "branch_protection_status": "CONFIGURED",
  "required_status_checks": [
    "Deterministic Build, Typecheck, Test & Audit (22.x)",
    "Evidence Coherence & Same-SHA Gate"
  ],
  "pull_request_required": true,
  "strict_up_to_date_required": true,
  "verified_at": "ISO-8601"
}
```

Se não houver permissão administrativa:

```text
BRANCH_PROTECTION_NOT_CONFIGURED
```

Nesse caso:

- não declarar `PATCH_VERIFIED_AND_CI_ENFORCED`;
- apresentar a resposta real da API;
- fornecer instruções ao administrador;
- usar `PATCH_VERIFIED_CI_NOT_ENFORCED` apenas se todos os outros gates passarem.

## 5. Fluxo recomendado da CI

```text
1. Checkout do SOURCE_SHA
2. Confirmar git rev-parse HEAD = GITHUB_SHA
3. Setup Node.js
4. npm ci
5. npm audit --omit=dev
6. npm run typecheck
7. npm run build:packages
8. npm run build:web
9. npm run lint
10. npm test
11. npm run validate:manifests
12. npm run verify:hashes
13. npm run verify:security
14. npm run verify:payments
15. npm run verify:auth
16. npm run verify
17. Gerar recibos
18. Consultar metadados da execução
19. Gerar índice SHA-256
20. Verificar coerência do mesmo SHA
21. Publicar pacote como artefacto
22. Confirmar árvore Git limpa
```

Não fazer commit automático dos recibos no branch validado.

## 6. Verificação local

Num checkout limpo do novo commit técnico:

```bash
git status --short
npm ci
npm audit --omit=dev
npm run typecheck
npm run build:packages
npm run build:web
npm run lint
npm test
npm run validate:manifests
npm run verify:hashes
npm run verify:security
npm run verify:payments
npm run verify:auth
npm run verify
git status --short
```

Resultados exigidos:

| Verificação | Resultado |
|---|---:|
| Checkout inicial | Limpo |
| `npm ci` | Exit code 0 |
| `npm audit --omit=dev` | Exit code 0 |
| Typecheck | Exit code 0 |
| Build dos pacotes | Exit code 0 |
| Build web | Exit code 0 |
| Lint | Exit code 0 |
| Testes | Zero falhas |
| Verificadores | Exit code 0 |
| `npm run verify` | Exit code 0 |
| Checkout final | Limpo |

## 7. Testes negativos obrigatórios

Adicionar testes que comprovem a rejeição de:

1. recibo sem `commit_sha`;
2. recibo com SHA diferente;
3. recibo com SHA inválido;
4. CI de outro commit;
5. CI ainda em execução;
6. CI com conclusão `failure`;
7. step obrigatório ignorado;
8. ficheiro ausente;
9. JSON inválido;
10. hash divergente;
11. alteração de um byte;
12. entrada duplicada no índice;
13. caminho fora do directório permitido;
14. falha de `npm ci`;
15. falha de testes;
16. falha de build;
17. indisponibilidade da API do GitHub;
18. tentativa de usar `npm ci --dry-run` como prova real.

## 8. Critérios de aceitação

```text
ALL_EVIDENCE_FILES_PRESENT = true
ALL_EVIDENCE_COMMIT_SHAS_EQUAL = true
EVIDENCE_COMMIT_SHA = SOURCE_SHA
GITHUB_ACTIONS_SHA = SOURCE_SHA
GITHUB_ACTIONS_STATUS = completed
GITHUB_ACTIONS_CONCLUSION = success
SKIPPED_REQUIRED_STEPS = 0
NPM_CI_REAL_EXECUTION = true
NPM_CI_DRY_RUN_USED_AS_PROOF = false
TEST_FAILURES = 0
COMMAND_FAILURES = 0
EVIDENCE_HASHES_VALID = true
EVIDENCE_GENERATOR_FAILS_CLOSED = true
LOCAL_VERIFY_EXIT_CODE = 0
WORKING_TREE_CLEAN = true
```

Para a classificação máxima:

```text
BRANCH_PROTECTION_CONFIGURED = true
REQUIRED_STATUS_CHECKS_CONFIGURED = true
```

## 9. Classificações permitidas

```text
PATCH_VERIFIED_AND_CI_ENFORCED
PATCH_VERIFIED_CI_NOT_ENFORCED
PATCH_PARTIALLY_VERIFIED
PATCH_FAILED
PATCH_BLOCKED
```

Regras:

```text
CI verde + coerência completa + branch protegido
= PATCH_VERIFIED_AND_CI_ENFORCED

CI verde + coerência completa + branch não protegido
= PATCH_VERIFIED_CI_NOT_ENFORCED

Evidências incompletas ou SHAs divergentes
= PATCH_PARTIALLY_VERIFIED

Teste, build ou CI falhado
= PATCH_FAILED

Permissão externa necessária e indisponível
= PATCH_BLOCKED
```

## 10. Limite de classificação operacional

Mesmo que este patch passe, não declarar:

```text
PRODUCTION_READY
CERTIFIED_L3
REAL_CUSTOMER_VALIDATED
REAL_REVENUE_VALIDATED
```

As fontes canónicas continuam a indicar:

```text
tarefas reais externas = 0
contratos de produção assinados = 0
auditorias externas elegíveis = 0
```

A conclusão deste patch valida a integridade técnica da cadeia de evidências. Não comprova actividade operacional real.

## 11. Entrega final

Apresentar:

1. SHA técnico validado;
2. SHA documental, se existir;
3. link do commit técnico;
4. run ID e URL da CI;
5. conclusão da CI;
6. número real de testes;
7. códigos de saída;
8. lista das evidências;
9. hash de cada evidência;
10. resultado do gate de coerência;
11. resultado dos testes negativos;
12. estado da protecção do branch;
13. limitações remanescentes;
14. classificação final.

## 12. Regra final

A cadeia somente é válida quando:

```text
SOURCE_SHA
=
LOCAL_VERIFY_SHA
=
TEST_RESULTS_SHA
=
CARDINALITY_RESULTS_SHA
=
SCHEMA_RESULTS_SHA
=
GITHUB_ACTIONS_SHA
=
EVIDENCE_INDEX_SHA_TARGET
```

Todos os recibos devem referir-se ao mesmo código executado. Nenhum relatório pode substituir essa correspondência física.
