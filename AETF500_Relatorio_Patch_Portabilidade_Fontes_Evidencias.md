# AETF-500 — Relatório Técnico de Execução do Patch de Portabilidade, Fontes Canónicas, Schemas e Evidências Reais

## 1. Identificação Forense e Controlo de Versão

| Atributo | Valor Registado |
|---|---|
| **Repositório** | `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES` |
| **Branch** | `master` |
| **Commit Inicial Auditado** | `40c46c42b90fe4c3c37a66cc57e140653e906e34` |
| **Commit Final Validado** | `8ee734881335456b0cd6c7c2a1efaa8dbb504cac` |
| **Link do Commit Final** | [Commit 8ee7348](https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/commit/8ee734881335456b0cd6c7c2a1efaa8dbb504cac) |
| **GitHub Actions Run ID** | `35038264400` |
| **Link da Execução de CI** | [GitHub Actions Run 35038264400](https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/35038264400) |
| **Estado e Conclusão da CI** | `status: completed` \| `conclusion: success` |
| **Data UTC de Conclusão** | `2026-09-16T00:03:31Z` |
| **Ambiente Local** | Windows 10/11 x64, Node.js `v22.23.0`, npm `10.9.8` |
| **Ambiente de CI** | GitHub Actions (`ubuntu-latest`, Node.js `22.x`) |
| **Workflow** | `CI / Production Readiness & Audit Gate` (`.github/workflows/ci.yml`) |
| **Classificação Final** | **`PATCH_VERIFIED_CI_NOT_ENFORCED`** |

---

## 2. Diagnóstico Inicial e Reprodução do Problema (Secção 3)

No commit de referência `40c46c42b90fe4c3c37a66cc57e140653e906e34`, a execução no Linux/Ubuntu (GitHub Actions Run `35034764403`) falhou com `exit code 1` durante `npm test`:
- **Suite falhada:** `cardinalityCalculators.test.ts` (Teste 12: *"Caminhos suportam separadores Linux e Windows sem alterar hashing"*)
- **Causa raiz:** O teste substituía barras normais `/` por barras invertidas `\` num caminho absoluto Linux (`\home\runner\work\...`). No Linux, `\` é um carácter comum de nome de ficheiro e não um separador de diretórios, disparando `ENOENT` no `fs.readFileSync` e gerando hash `null`.
- **Resultado reproduzido na CI:**
  ```text
  Runtime tests: 355
  Passed: 354
  Failed: 1
  npm run verify: exit code 1
  ```
- **Outras inconformidades identificadas:**
  - Presença de contagens de testes hard-coded (`total_tests: 388, passed_tests: 388`) em `scripts/generate-evidence.mjs`.
  - Duplicação de fontes canónicas em `data/` (`live_tasks.json`, `legal_contracts.json`, `external_audits.json`).
  - Fallback silencioso entre `camelCase` e `snake_case` em `resolveDeterministicPath()`.
  - Schemas Ajv sem `"additionalProperties": false`, sem validação rigorosa de `date-time`, sem padrões SHA-256 e sem proveniência formal.
  - Associação de entidades reais angolanas em dados de demonstração sem autorização física (`data/legalContracts.json`).

---

## 3. Implementação das Correcções (P1 a P8)

### P1 — Semântica Rigorosa do Teste Multiplataforma
- Ficheiro alterado: `packages/runtime/src/test/cardinalityCalculators.test.ts`.
- Foi refatorado o Teste 12 para validar separadamente:
  1. Construção de caminhos POSIX via `path.posix.join('data', 'liveTasks.json')`.
  2. Construção de caminhos Windows via `path.win32.join('data', 'liveTasks.json')`.
  3. Normalização lógica via `path.posix.normalize` e `path.win32.normalize`.
  4. Resolução determinística da raiz do monorepo (`ROOT_DIR`).
  5. Independência do diretório de execução (`cwd`).
  6. Utilização das APIs padrão do Node.js sem caminhos hardcoded.
  7. Leitura física no SO anfitrião em runtime utilizando caminhos canónicos válidos.

### P2 — `npm run verify` com Exit Code 0 Legítimo
- Todos os 11 gates de verificação foram executados e validados:
  1. `npm run clean`: Sucesso.
  2. `npm run typecheck`: Sucesso (`tsc -b`).
  3. `npm run build:packages`: Sucesso.
  4. `npm run build:web`: Sucesso.
  5. `npm run lint`: Sucesso.
  6. `npm test`: **392 testes executados, 392 aprovados, 0 falhas**.
  7. `npm run validate:manifests`: Sucesso (Ajv Schema: PASS, Cardinalidades: PASS, Integridade Canónica: PASS).
  8. `npm run verify:hashes`: Sucesso (3 ficheiros históricos auditados com integridade estrita).
  9. `npm run verify:security`: Sucesso (12 testes de Red Team aprovados).
  10. `npm run verify:payments`: Sucesso (5 testes de faturamento e ledgers aprovados).
  11. `npm run verify:auth`: Sucesso (26 testes de autorização e fail-closed aprovados).
- Código de saída final: **0**.

### P3 — Eliminação Integral de Contagens Hard-coded
- Ficheiro alterado: `scripts/generate-evidence.mjs`.
- Foram removidas quaisquer estruturas de contagens estáticas (`total_tests: 388`, etc.).
- Foi adicionado o teste automatizado 21 em `cardinalityCalculators.test.ts` que analisa o ficheiro `scripts/generate-evidence.mjs` e falha se forem detectadas contagens manuais fixas.

### P4 — Resumo Dinâmico Derivado da Execução Real dos Testes
- `scripts/generate-evidence.mjs` executa cada suite de testes individualmente (`rolepack`, `runtime`, `policies`, `marketplace_billing`, `tool_sdk`, `evaluation_sdk`), captura o output TAP completo e extrai estruturadamente:
  - `total_tests`
  - `passed_tests`
  - `failed_tests`
  - `cancelled_tests`
  - `skipped_tests`
  - `todo_tests`
  - `exit_code`
  - `breakdown` discriminado por suite com início e fim em UTC.
- Gera os ficheiros físicos `evidence/test-summary.json` e `evidence/test-results.json` (111 itens individuais mapeados).

### P5 — Unificação e Exclusividade das Fontes Canónicas
- Adotadas como únicas fontes autoritativas do repositório:
  - `data/liveTasks.json`
  - `data/legalContracts.json`
  - `data/externalAudits.json`
- Eliminadas permanentemente as 3 variantes redundantes em `snake_case`:
  - `data/live_tasks.json`
  - `data/legal_contracts.json`
  - `data/external_audits.json`
- Adicionada verificação no gate de validação (`scripts/validate-manifests.mjs`) que rejeita a execução (`FAIL`) caso qualquer fonte alternativa seja recriada.

### P6 — Remoção do Fallback Silencioso de Nomes
- Ficheiro alterado: `scripts/lib/cardinalityCalculators.mjs`.
- Eliminada qualquer lógica heurística de substituição automática entre `camelCase` e `snake_case`. O caminho solicitado é resolvido estritamente em relação a `ROOT_DIR` e, caso não exista, retorna `SOURCE_NOT_FOUND`.
- Adicionado teste negativo comprovando que resolver `data/live_tasks.json` não redireciona silenciosamente para `data/liveTasks.json`.

### P7 — Schemas Ajv Estritos e Validação com ajv-formats
- Ficheiros reforçados:
  - `schemas/data/liveTasks.schema.json`
  - `schemas/data/legalContracts.schema.json`
  - `schemas/data/externalAudits.schema.json`
- Regras aplicadas:
  - `"additionalProperties": false` na raiz, metadados e registos.
  - `format: "date-time"` para todas as datas (`updated_at`, `collection_date`, `execution_date`, `audit_date`, `effective_date`).
  - Regex SHA-256 (`^[a-f0-9]{64}$`) para integridade de documentos e contratos.
  - Metadados de proveniência obrigatórios: `source_id`, `collection_date`, `origin`, `verification_status`.
  - `oneOf` separando pilotos de demonstração de contratos de produção assinados.
  - `oneOf` separando auditorias independentes de terceiros de recibos internos.
  - Testes negativos cobrindo propriedades inesperadas, datas malformadas, hashes inválidos e tentativas de promoção de dados de demonstração ou auditorias internas.

### P8 — Desvinculação de Empresas Reais Angolanas em Dados de Demonstração
- Ficheiro alterado: `data/legalContracts.json` e `apps/api/src/server.ts`.
- Substituídos os nomes corporativos reais de demonstração por entidades inequivocamente fictícias:
  - `Empresa Demonstração Alfa, Lda` (`tenant_demo_alfa`)
  - `Empresa Demonstração Beta, S.A.` (`tenant_demo_beta`)
  - `Empresa Demonstração Gama, Lda` (`tenant_demo_gama`)
- Adicionadas as marcações explícitas de dados fictícios de demonstração:
  ```json
  {
    "fictional_entity": true,
    "authorization_type": "DEMONSTRATION",
    "is_pilot_demonstration": true
  }
  ```

---

## 4. Resultados da Execução dos Testes

| Suite | Comando | Suítes | Testes | Passados | Falhados | Cancelados |
|---|---|---:|---:|---:|---:|---:|
| **Rolepack** | `npm run test:catalog` | 0 | 2 | 2 | 0 | 0 |
| **Runtime** | `npm run test:runtime` | 29 | 359 | 359 | 0 | 0 |
| **Policies (Red Team)** | `npm run test:security` | 0 | 12 | 12 | 0 | 0 |
| **Marketplace & Billing** | `npm run test:billing` | 1 | 5 | 5 | 0 | 0 |
| **Tool SDK** | `npm run test:tools` | 1 | 4 | 4 | 0 | 0 |
| **Evaluation SDK** | `npm run eval:catalog` | 0 | 10 | 10 | 0 | 0 |
| **TOTAL** | `npm test` | **31** | **392** | **392** | **0** | **0** |

---

## 5. Inventário das Evidências Obrigatórias Geradas

Todos os 20 artefactos foram gerados na pasta `evidence/`:
1. `evidence/environment.json`: Metadados do nó, OS, versões de Node.js e npm.
2. `evidence/changed-files.txt`: Registo das modificações.
3. `evidence/clean-checkout.txt`: Estado da árvore Git.
4. `evidence/npm-ci.log`: Validação de instalação determinística.
5. `evidence/npm-audit-production.log`: Auditoria de 0 vulnerabilidades em dependências de produção.
6. `evidence/typecheck.log`: Compilação de tipos TypeScript sem erros.
7. `evidence/build-packages.log`: Build de pacotes monorepo.
8. `evidence/build-web.log`: Build estático Next.js.
9. `evidence/lint.log`: Validação ESLint.
10. `evidence/test-results.json`: 111 resultados atómicos de testes extraídos de TAP.
11. `evidence/test-summary.json`: Resumo computado com 392 testes, 0 falhas, exit code 0.
12. `evidence/validate-manifests.log`: Log de validação Ajv e integridade de fontes canónicas.
13. `evidence/verify-hashes.log`: Log de verificação criptográfica SHA-256.
14. `evidence/verify-security.log`: Validação dos 12 controlos Red Team.
15. `evidence/verify-payments.log`: Validação do motor financeiro.
16. `evidence/verify-auth.log`: Validação dos 26 cenários de autenticação/autorização multi-tenant.
17. `evidence/verify.log`: Execução completa do gate `npm run verify` com código 0.
18. `evidence/canonical-source-hashes.sha256`: Hashes SHA-256 das fontes e schemas canónicos.
19. `evidence/git-status-after-verification.txt`: Estado final da árvore.
20. `evidence/github-actions-receipt.json`: Recibo estruturado de CI.

---

## 6. Estado da Protecção de Branch e Instruções ao Administrador

A verificação via GitHub API (`gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection`) retornou:
```text
BRANCH_PROTECTION_NOT_CONFIGURED (HTTP 404)
```

### Instruções para Ativação pelo Administrador do Repositório:
1. Aceda a: `https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/settings/branches`
2. Clique em **"Add branch ruleset"** (ou "Add rule") para a branch `master`.
3. Active a opção **"Require status checks to pass before merging"**.
4. Adicione como check obrigatório: **`Deterministic Build, Typecheck, Test & Audit (22.x)`**.
5. Active a opção **"Require a pull request before merging"**.
6. Guarde as alterações.

---

## 7. Critérios de Aceitação (Secção 8)

```text
CROSS_PLATFORM_TEST_FIXED = true
VERIFY_EXIT_CODE = 0
HARDCODED_TEST_COUNTS = 0
TEST_SUMMARY_EXECUTION_DERIVED = true
ONE_CANONICAL_SOURCE_PER_DOMAIN = true
SILENT_FILENAME_FALLBACK_REMOVED = true
SCHEMAS_STRICT = true
UNAUTHORIZED_REAL_COMPANY_NAMES = 0
GITHUB_ACTIONS_RUN_RECORDED = true
REPORT_MATCHES_PHYSICAL_RESULTS = true
WORKING_TREE_CLEAN = true
```

---

## 8. Limitações Remanescentes e Classificação Final

- **Limitações:**
  - A protecção de branch ainda não está configurada no GitHub (requer privilégio de administrador na UI).
  - A plataforma opera em regime de demonstração e baseline controlado, com cardinalidade comprovada de zero tarefas reais externas e zero contratos de produção assinados.
- **Classificação Formal Autorizada:**
  **`PATCH_VERIFIED_CI_NOT_ENFORCED`**
