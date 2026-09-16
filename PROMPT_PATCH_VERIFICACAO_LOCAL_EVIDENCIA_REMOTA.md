# PROMPT DE EXECUÇÃO
## AETF-500 — Patch mínimo de separação entre verificação local e evidência remota

Actue como engenheiro sénior de software, auditor de CI/CD e especialista em Node.js, Git, GitHub Actions, cadeias de evidência e integridade criptográfica.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Commit de referência auditado:

`a5a0816006b613c9563e2503a249aa2c499693d9`

Execução de referência:

`https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/35099235528`

## 1. Missão

Executar um patch correctivo pequeno, limitado e auditável para separar correctamente:

```text
VERIFICAÇÃO LOCAL DO CÓDIGO
≠
GERAÇÃO DO PACOTE DE EVIDÊNCIAS
≠
VALIDAÇÃO REMOTA DA EXECUÇÃO CONCLUÍDA
```

O patch deve corrigir exclusivamente:

1. separação entre `verify:local` e `verify:evidence-artifact`;
2. funcionamento de `npm run verify` num checkout limpo;
3. geração de evidências fora da árvore versionada;
4. eliminação de índices que referenciam ficheiros ausentes;
5. validação remota num segundo workflow;
6. reconciliação da protecção do branch;
7. proveniência verificável de `branch-protection.json`;
8. remoção da limpeza artificial da pasta de evidências;
9. correcção do relatório técnico;
10. exclusão expressa da integração AGT deste patch.

Não criar novos módulos funcionais, engines, employees, conectores, dashboards, funcionalidades comerciais ou integrações externas.

## 2. Estado inicial que deve ser reproduzido

Antes de modificar o código:

1. Criar um checkout limpo do SHA de referência.
2. Registar:
   - SHA;
   - branch;
   - sistema operativo;
   - versão do Node.js;
   - versão do npm;
   - data e hora UTC.
3. Executar:

```bash
git status --short
npm ci
npm audit --omit=dev
npm run verify
```

4. Confirmar a falha actual:

```text
EVIDENCE_FILE_MISSING:
Required evidence file missing: npm-ci.log
```

5. Confirmar que os seguintes componentes passam antes dessa falha:

```text
typecheck
build:packages
build:web
lint
test
validate:manifests
verify:hashes
verify:security
verify:payments
verify:auth
```

6. Guardar o output integral e os códigos de saída.

Não corrigir apenas o relatório. Corrigir a estrutura responsável pela divergência.

## 3. Regras inegociáveis

- `npm run verify` deve funcionar num clone limpo.
- A verificação local não pode depender de logs produzidos apenas pela CI.
- Evidências geradas não devem alterar ficheiros versionados.
- O workflow não pode limpar alterações para simular uma árvore limpa.
- A validação remota não pode declarar uma execução concluída antes de ela terminar.
- O estado da protecção do branch deve vir da API do GitHub.
- Nenhum recibo pode conter estado inventado ou manualmente predefinido.
- Não utilizar `|| true` para esconder falhas.
- Não remover testes ou gates para obter resultado verde.
- Não implementar qualquer integração com a AGT neste patch.

## 4. Escopo obrigatório

### P1 — Separar `verify:local` de `verify:evidence-artifact`

Reorganizar os scripts do `package.json`.

Estrutura mínima recomendada:

```json
{
  "scripts": {
    "verify:local": "npm run clean && npm run typecheck && npm run build:packages && npm run build:web && npm run lint && npm test && npm run validate:manifests && npm run verify:hashes && npm run verify:security && npm run verify:payments && npm run verify:auth",
    "verify": "npm run verify:local",
    "evidence:generate": "node scripts/generate-evidence.mjs",
    "verify:evidence-artifact": "node scripts/verify-evidence-coherence.mjs",
    "verify:evidence-remote": "node scripts/verify-evidence-coherence.mjs --remote"
  }
}
```

Requisitos:

- `npm run verify` deve ser sinónimo da verificação local completa;
- `verify` não deve exigir `npm-ci.log`, recibo remoto ou artefacto da CI;
- `verify:evidence-artifact` deve operar sobre um directório fornecido explicitamente;
- `verify:evidence-remote` deve validar o recibo da execução já concluída;
- comandos locais e remotos devem ter responsabilidades distintas.

### P2 — Fazer `npm run verify` passar num checkout limpo

Num checkout novo, executar:

```bash
npm ci
npm run verify
```

Resultado obrigatório:

```text
npm ci = exit code 0
npm run verify = exit code 0
failed tests = 0
skipped tests = 0
working tree = clean
```

Não preparar manualmente a pasta de evidências antes de executar `verify`.

Adicionar um teste ou job específico denominado, por exemplo:

```text
Clean Checkout Local Verification
```

Este job deve demonstrar que a verificação local funciona sem artefactos anteriores.

### P3 — Gerar evidências num directório não versionado

Alterar o destino da geração para:

```text
.artifacts/evidence/
```

ou outro directório temporário explicitamente não versionado.

Adicionar ao `.gitignore`:

```gitignore
.artifacts/
```

O gerador deve aceitar o destino por argumento ou variável:

```bash
node scripts/generate-evidence.mjs --output .artifacts/evidence
```

ou:

```bash
EVIDENCE_OUTPUT_DIR=.artifacts/evidence node scripts/generate-evidence.mjs
```

Requisitos:

- rejeitar destino vazio;
- rejeitar a raiz do repositório;
- rejeitar caminhos fora do workspace;
- não sobrescrever fontes do projecto;
- criar o directório de forma determinística;
- não depender de recibos antigos em `evidence/`.

### P4 — Não versionar índices de ficheiros ausentes

Remover do controlo de versões qualquer índice que dependa de logs temporários inexistentes no checkout.

O ficheiro:

```text
evidence/evidence-files.sha256
```

não deve permanecer como recibo activo se referencia ficheiros não versionados.

O índice deve ser criado apenas dentro do pacote gerado:

```text
.artifacts/evidence/evidence-files.sha256
```

Antes de publicar o pacote, executar:

```bash
cd .artifacts/evidence
sha256sum -c evidence-files.sha256
```

Critérios:

- zero ficheiros ausentes;
- zero hashes divergentes;
- zero entradas duplicadas;
- zero caminhos externos;
- zero ficheiros não indexados, salvo o próprio índice;
- nenhuma auto-referência.

### P5 — Criar um segundo workflow para validação remota

A execução principal não pode confirmar a sua própria conclusão antes de terminar.

Manter o workflow principal responsável por:

```text
checkout
npm ci
audit
build
lint
testes
verificadores
geração do pacote
verificação física do pacote
upload do artefacto
```

Criar um segundo workflow, por exemplo:

```text
.github/workflows/evidence-remote-verification.yml
```

Utilizar:

```yaml
on:
  workflow_run:
    workflows:
      - "CI / Production Readiness & Audit Gate"
    types:
      - completed
```

O segundo workflow deve:

1. rejeitar execução principal diferente de `success`;
2. obter o `head_sha` real;
3. obter o run ID e run attempt;
4. descarregar o artefacto produzido por essa execução;
5. consultar os jobs e steps pela API;
6. criar ou completar o recibo remoto;
7. confirmar que nenhum step obrigatório foi ignorado;
8. executar `verify:evidence-remote`;
9. publicar um recibo final separado;
10. terminar com falha se a execução ou evidência forem inconsistentes.

Utilizar apenas permissões mínimas:

```yaml
permissions:
  actions: read
  contents: read
```

Não executar código não confiável de pull requests com credenciais privilegiadas.

### P6 — Unificar o estado da protecção do branch

Actualmente existe contradição entre:

```text
branch-protection.json:
CONFIGURED

github-actions-receipt.json:
BRANCH_PROTECTION_NOT_CONFIGURED
```

Eliminar esta divergência.

Definir uma única fonte de verdade:

```text
branch-protection.json
```

O recibo da CI deve referenciar esse resultado ou incorporar uma cópia exacta do mesmo estado.

O gate deve falhar quando os dois estados divergirem:

```text
BRANCH_PROTECTION_STATUS_MISMATCH
```

### P7 — Tornar `branch-protection.json` verificável

Gerar este recibo exclusivamente a partir da API autenticada do GitHub.

Estrutura mínima:

```json
{
  "repository": "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES",
  "branch": "master",
  "source": "GITHUB_REST_API",
  "api_endpoint": "repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection",
  "queried_at": "ISO-8601",
  "query_actor": "GitHub Actions",
  "source_sha": "SHA_VALIDADO",
  "http_status": 200,
  "branch_protection_status": "CONFIGURED",
  "required_status_checks": [],
  "pull_request_required": true,
  "strict_up_to_date_required": true,
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "response_sha256": "SHA256_DA_RESPOSTA_NORMALIZADA"
}
```

Guardar também a resposta normalizada da API dentro do artefacto:

```text
branch-protection-api-response.json
```

Remover tokens, cabeçalhos de autorização e dados sensíveis.

Se a consulta devolver `401`, `403` ou `404`, não declarar `CONFIGURED`.

Usar um estado exacto:

```text
API_UNAUTHORIZED
API_FORBIDDEN
NOT_CONFIGURED
CONFIGURED
API_UNAVAILABLE
```

### P8 — Remover a limpeza artificial da árvore Git

Remover do workflow:

```bash
git checkout -- evidence/ || true
git clean -fd evidence/ || true
```

Não substituir por outro reset, checkout, clean ou remoção equivalente.

Como os artefactos serão escritos em `.artifacts/`, que deve estar ignorado, o código e os testes não devem modificar ficheiros versionados.

Depois da execução, verificar directamente:

```bash
git status --porcelain
git diff --exit-code
git diff --cached --exit-code
```

Se houver alteração versionada, falhar com:

```text
TRACKED_WORKTREE_MUTATION
```

### P9 — Corrigir o relatório técnico

Actualizar:

```text
AETF500_Relatorio_Patch_Coerencia_Evidencias_CI.md
```

Corrigir as afirmações de que:

- a verificação local passou no commit anterior;
- o pacote versionado estava completo;
- o modo remoto tinha sido executado;
- a protecção estava coerentemente comprovada;
- `PATCH_VERIFIED_AND_CI_ENFORCED` já estava demonstrado.

O relatório deve diferenciar:

```text
LOCAL_VERIFY_RESULT
PRIMARY_CI_RESULT
REMOTE_EVIDENCE_RESULT
BRANCH_PROTECTION_RESULT
OPERATIONAL_READINESS_RESULT
```

Não apagar silenciosamente a divergência anterior. Registar a rectificação.

### P10 — Manter a integração AGT fora deste patch

Não adicionar neste trabalho:

- conector AGT;
- API de Facturação Electrónica;
- assinatura JWS da AGT;
- chaves públicas ou privadas;
- endpoint de callback;
- webhook da AGT;
- submissão de facturas;
- testes de homologação;
- dados reais de contribuintes.

Adicionar ao relatório:

```text
AGT_ELECTRONIC_INVOICING_CONNECTOR = OUT_OF_SCOPE
```

Qualquer integração AGT deverá ser executada posteriormente num patch próprio, após obtenção da documentação técnica e autorização necessárias.

## 5. Testes obrigatórios

Adicionar ou ajustar testes para comprovar:

1. `npm run verify` passa sem pasta de evidências;
2. `verify:evidence-artifact` falha se o pacote não existir;
3. o gerador escreve apenas em `.artifacts/evidence/`;
4. destino fora do workspace é rejeitado;
5. índice com ficheiro ausente falha;
6. índice com hash divergente falha;
7. ficheiro não indexado falha;
8. recibos com SHAs diferentes falham;
9. CI principal falhada bloqueia o workflow remoto;
10. CI principal ainda em execução não é aceite;
11. artefacto de outro run ID é rejeitado;
12. artefacto de outro SHA é rejeitado;
13. step obrigatório ignorado é rejeitado;
14. protecção contraditória é rejeitada;
15. resposta da API sem HTTP 200 não produz `CONFIGURED`;
16. alteração de ficheiro versionado bloqueia a CI;
17. ausência de credenciais administrativas não produz falso sucesso;
18. inexistência de qualquer código AGT neste patch.

## 6. Fluxo final esperado

```text
DESENVOLVEDOR
    │
    ├── npm ci
    └── npm run verify
            │
            └── PASS sem depender de evidências remotas

CI PRINCIPAL
    │
    ├── valida o código
    ├── gera .artifacts/evidence/
    ├── verifica hashes físicos
    └── publica o artefacto

CI REMOTA PÓS-CONCLUSÃO
    │
    ├── confirma sucesso da CI principal
    ├── descarrega o artefacto correcto
    ├── consulta jobs, steps e branch protection
    ├── valida mesmo SHA
    └── publica recibo remoto final
```

## 7. Verificação local obrigatória

Num checkout limpo do novo SHA:

```bash
git status --short
npm ci
npm audit --omit=dev
npm run verify
git status --short
```

Critérios:

| Verificação | Resultado obrigatório |
|---|---:|
| Checkout inicial | Limpo |
| `npm ci` | Exit code 0 |
| `npm audit --omit=dev` | Exit code 0 |
| `npm run verify` | Exit code 0 |
| Testes falhados | 0 |
| Testes ignorados | 0 |
| Ficheiros temporários exigidos antes do comando | 0 |
| Alterações versionadas depois da execução | 0 |

## 8. Verificação no GitHub

Depois do push:

1. aguardar a conclusão da CI principal;
2. confirmar `conclusion = success`;
3. confirmar que o segundo workflow foi iniciado por `workflow_run`;
4. confirmar que o segundo workflow validou o mesmo `head_sha`;
5. confirmar o download do artefacto correcto;
6. confirmar o modo remoto;
7. confirmar a consulta real da protecção do branch;
8. confirmar que ambos os workflows são checks obrigatórios, se aplicável.

Registar:

```text
SOURCE_SHA
PRIMARY_RUN_ID
PRIMARY_RUN_URL
PRIMARY_CONCLUSION
REMOTE_RUN_ID
REMOTE_RUN_URL
REMOTE_CONCLUSION
ARTIFACT_ID
ARTIFACT_SHA256
BRANCH_PROTECTION_STATUS
```

## 9. Critérios de aceitação

```text
LOCAL_VERIFY_IN_CLEAN_CHECKOUT = PASS
LOCAL_VERIFY_DEPENDS_ON_TEMP_LOGS = false
EVIDENCE_OUTPUT_IS_UNTRACKED = true
VERSIONED_INDEX_REFERENCES_MISSING_FILES = false
PRIMARY_CI = success
REMOTE_EVIDENCE_WORKFLOW = success
REMOTE_GATE_EXECUTED = true
ALL_EVIDENCE_SHAS_EQUAL_SOURCE_SHA = true
EVIDENCE_HASHES_VALID = true
BRANCH_PROTECTION_STATES_CONSISTENT = true
BRANCH_PROTECTION_API_PROVENANCE = true
TRACKED_WORKTREE_MUTATION = false
REPORT_RECONCILED = true
AGT_CONNECTOR_CHANGED = false
```

## 10. Classificações permitidas

Utilizar apenas:

```text
PATCH_VERIFIED_AND_CI_ENFORCED
PATCH_VERIFIED_CI_NOT_ENFORCED
PATCH_PARTIALLY_VERIFIED
PATCH_FAILED
PATCH_BLOCKED
```

Aplicar:

```text
Local PASS + CI principal PASS + remoto PASS + branch protegido
= PATCH_VERIFIED_AND_CI_ENFORCED

Local PASS + CI principal PASS + remoto PASS + branch não protegido
= PATCH_VERIFIED_CI_NOT_ENFORCED

Local PASS, mas evidência remota incompleta
= PATCH_PARTIALLY_VERIFIED

Local, build, testes ou CI falhados
= PATCH_FAILED

Permissão administrativa indispensável e indisponível
= PATCH_BLOCKED
```

## 11. Limite da conclusão

Mesmo com o patch aprovado, não declarar:

```text
PRODUCTION_READY
CERTIFIED_L3
REAL_CUSTOMER_VALIDATED
REAL_REVENUE_VALIDATED
AGT_INTEGRATED
```

As fontes físicas continuam a indicar:

```text
tarefas externas reais = 0
contratos de produção assinados = 0
auditorias externas elegíveis = 0
```

## 12. Entrega final

Apresentar:

1. SHA inicial e final;
2. ficheiros alterados;
3. scripts finais do `package.json`;
4. resultado do checkout limpo;
5. número real de testes;
6. run ID e URL da CI principal;
7. run ID e URL da validação remota;
8. identificação e hash do artefacto;
9. resultado do gate de coerência;
10. resposta verificável da API de protecção;
11. estado da árvore Git;
12. confirmação de que a AGT ficou fora do escopo;
13. limitações remanescentes;
14. classificação final.

## Regra final

O patch somente estará concluído quando:

```text
VERIFICAÇÃO LOCAL
= reproduzível num clone limpo

EVIDÊNCIA
= gerada fora da árvore versionada

CI REMOTA
= validada depois da conclusão da execução principal

PROTECÇÃO DO BRANCH
= comprovada por resposta real da API
```

Nenhum reset, limpeza artificial, recibo histórico ou relatório declarativo pode substituir estas provas.
