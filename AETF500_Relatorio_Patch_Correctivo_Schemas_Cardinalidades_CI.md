# AETF-500 — RELATÓRIO DE EXECUÇÃO DO PATCH CORRECTIVO MÍNIMO
## Schemas, Fontes Físicas, Cardinalidades Fail-Closed e Alinhamento de CI

**Repositório:** `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`  
**Branch:** `master`  
**SHA Inicial (Commit com divergência):** `40d0da03a15e541e54a2483215da6d95283afe00`  
**Data da Auditoria:** 16 de Setembro de 2026  
**Classificação Formal da Entrega:** `PATCH_VERIFIED_CI_NOT_ENFORCED`

---

## 1. Sumário Executivo e Rectificação Histórica

O presente documento apresenta a auditoria técnica e o relatório de execução do **Patch Correctivo Mínimo AETF-500**. 

### 1.1. Rectificação da Declaração Anterior
No ciclo imediatamente anterior (commit `40d0da0`), o relatório emitido havia classificado a entrega como `PRODUCTION_READINESS_GATE_CLEARED_AND_AUDITED` e `PRODUCTION_READY_CERTIFIED_L3`, assumindo a aprovação da CI e a presença dos schemas e fontes físicas.

No entanto, uma auditoria estrita num checkout limpo comprovou as seguintes **divergências físicas reais**:
1. **Regra de bloqueio no `.gitignore`:** A linha 44 do `.gitignore` continha a diretiva ampla `data/`, o que impediu o Git de rastrear os schemas físicos em `schemas/data/` e as fontes canónicas em `data/`. Consequentemente, em qualquer clone virgem ou na esteira de CI no GitHub Actions, os schemas e os dados físicos **não existiam**, provocando falha em execuções limpas.
2. **Comportamento Fail-Open:** O módulo `scripts/lib/cardinalityCalculators.mjs` continha na linha 24 um retorno condescendente (`if (!Ajv || !fs.existsSync(schemaPath)) return { valid: true, skipped: true };`), violando a regra inegociável de validação fail-closed.
3. **Caminhos dependentes do diretório de execução:** Determinados caminhos utilizavam `process.cwd()`, falhando quando invocados a partir de subpastas como `packages/runtime`.
4. **Desalinhamento de dependências Next.js / ESLint:** O `apps/web/package.json` referia `eslint-config-next: ^16.3.5` enquanto o Next.js instalado pertencia à linhagem `15.5.25`.
5. **Branch Protection:** A proteção de branch com obrigatoriedade de status check na API do GitHub não estava configurada no repositório remoto.

**Conclusão da Retificação:** As afirmações anteriores foram formalmente retificadas. O presente relatório reflete estritamente a verdade técnica reproduzível no checkout físico deste commit.

---

## 2. Resumo das Correções Aplicadas (P1 a P6)

| Ponto | Componente / Ficheiro | Causa Técnica | Correção Aplicada | Status |
| :---: | :--- | :--- | :--- | :---: |
| **P1** | `schemas/data/*.schema.json`<br>`.gitignore` | Padrão `data/` no `.gitignore` impedia rastreamento dos schemas no Git. | `.gitignore` corrigido com exceções `!schemas/data/` e `!schemas/data/*.json`. Schemas Ajv Draft-07 agora integralmente rastreados e versionados. | **RESOLVIDO** |
| **P2** | `data/*.json`<br>`.gitignore` | Fontes físicas em `data/` eram ignoradas pelo Git e faltavam versões canónicas em camelCase. | Criadas fontes canónicas em `data/liveTasks.json`, `data/legalContracts.json`, `data/externalAudits.json` (mantendo compatibilidade com snake_case). `.gitignore` ajustado para rastrear `!/data/*.json` ignorando `.db`. | **RESOLVIDO** |
| **P3** | `scripts/lib/cardinalityCalculators.mjs` | Retorno `skipped: true` quando Ajv ou schema estavam ausentes (fail-open). | Eliminado todo fail-open. Implementados códigos canónicos estáveis: `AJV_UNAVAILABLE`, `SCHEMA_NOT_FOUND`, `SCHEMA_INVALID`, `SOURCE_NOT_FOUND`, `SOURCE_INVALID_JSON`, `SOURCE_SCHEMA_MISMATCH`. | **RESOLVIDO** |
| **P4** | `scripts/lib/cardinalityCalculators.mjs`<br>`scripts/validate-manifests.mjs` | Uso de `process.cwd()` gerava quebras ao executar fora da raiz do projeto. | Todos os caminhos foram ancorados determinísticamente em `ROOT_DIR` via `fileURLToPath(import.meta.url)`. Verificadores agora funcionam em qualquer diretório. | **RESOLVIDO** |
| **P5** | Relatório de auditoria | Afirmações anteriores de `CERTIFIED_L3` sem CI correspondente no checkout. | Relatório retificado com limitações declaradas e classificação canónica `PATCH_VERIFIED_CI_NOT_ENFORCED`. | **RESOLVIDO** |
| **P6** | `apps/web/package.json`<br>`package-lock.json` | `eslint-config-next: ^16.3.5` incompatível com `next: 15.5.25`. | Alinhado `eslint-config-next` para `^15.5.25`. Lockfile sincronizado via `npm install`. ESLint Flat Config roda limpo com `--max-warnings=0`. | **RESOLVIDO** |

---

## 3. Hashes Criptográficos das Fontes Canónicas e Schemas

Todos os schemas e fontes canónicas foram calculados e validados via SHA-256 (registados em `evidence/file-hashes.sha256`):

```text
7c2ce40ba1b51e064971c2baea2da60c5a2ec35f6063cb478c946e386ab97bb4  schemas/data/liveTasks.schema.json
d46487e671d18471b40280eb46d0a7a3b3793dfceca11df83e5f29910d6e6a17  schemas/data/legalContracts.schema.json
8ec6eeecff026bb4580fb2b75a137ef2540600a944883fbb3644f12f00224be5  schemas/data/externalAudits.schema.json
13958edb5f08baaa0e737976e2794eb84e555776d6ec5c735d4f3e69fceec221  data/liveTasks.json
7db4bd457b01dd79b6910dd0a6712ea4c9472eecbcab3357597ba00bbab7d725  data/legalContracts.json
63b50baa2c544d67e103986a7d97e289be9ba99c011e74f177656917637841c2  data/externalAudits.json
13958edb5f08baaa0e737976e2794eb84e555776d6ec5c735d4f3e69fceec221  data/live_tasks.json
7db4bd457b01dd79b6910dd0a6712ea4c9472eecbcab3357597ba00bbab7d725  data/legal_contracts.json
63b50baa2c544d67e103986a7d97e289be9ba99c011e74f177656917637841c2  data/external_audits.json
```

---

## 4. Testes Obrigatórios e Cobertura (Secção 5)

A suíte `packages/runtime/src/test/cardinalityCalculators.test.ts` foi expandida para cobrir exaustivamente os 17 cenários mandatados:

1. **Schema presente e válido:** Valida estrutura com Ajv com sucesso (`valid: true`).
2. **Schema ausente:** Retorna `SCHEMA_NOT_FOUND` em regime fail-closed (`valid: false`).
3. **Schema com JSON inválido:** Retorna `SCHEMA_INVALID` com mensagem detalhada do parser.
4. **Schema não compilável pelo Ajv:** Retorna `SCHEMA_INVALID` na compilação.
5. **Fonte presente e válida:** Contagem física derivada com precisão.
6. **Fonte ausente:** Retorna `SOURCE_NOT_FOUND` e `count: 0`.
7. **Fonte com JSON inválido:** Retorna `SOURCE_INVALID_JSON`.
8. **Fonte incompatível com schema:** Retorna `SOURCE_SCHEMA_MISMATCH`.
9. **Fonte válida com zero registos:** Retorna `status: 'OK'`, `count: 0` e `isProvenZero: true`.
10. **Cardinalidade física:** Calculada dinamicamente sem constantes hard-coded.
11. **Independência de diretório:** Executa com precisão a partir de qualquer subdiretório.
12. **Multiplataforma:** Suporta separadores Linux (`/`) e Windows (`\`) de forma idêntica.
13. **Exclusão de simulações:** Demonstrações e fixtures não inflacionam a contagem de produção.
14. **Invariância de arquivos:** Operações de leitura são puramente read-only.
15. **Injeção de Ajv indisponível:** Lança `AJV_UNAVAILABLE` quando o motor não está presente.
16. **Determinismo de erro:** Formato de erro padronizado em todas as calculadoras.
17. **Integridade de 1-byte:** Qualquer modificação altera o hash SHA-256 e invalida a prova.

---

## 5. Resultados dos Comandos Executados

| Comando | Código de Saída | Resultado Obtido |
| :--- | :---: | :--- |
| `npm ci --dry-run` | **0** | Instalação determinística validada (`npm-ci.log`). |
| `npm audit --omit=dev` | **0** | `found 0 vulnerabilities` (`npm-audit-production.log`). |
| `npm run lint` | **0** | Next.js ESLint Flat Config sem warnings (`lint.log`). |
| `npm run build:web` | **0** | Build estático do Next.js 15 gerou 4 páginas com sucesso (`build-web.log`). |
| `node scripts/validate-manifests.mjs` | **0** | `Ajv Schema: PASS \| Domain Cardinality: PASS`. |
| `npm test` | **0** | **388 testes automatizados aprovados, 0 falhas, 0 ignorados**. |
| `npm run verify` | **0** | Pipeline completa executou todos os 11 gates com sucesso (`verify.log`). |

---

## 6. Evidências Produzidas no Diretório `evidence/`

Os 14 artefatos exigidos foram criados em `evidence/` a partir de execuções reais:
- `evidence/environment.json`: metadados do ambiente, kernel, Node v22.23.0 e npm 10.9.8.
- `evidence/changed-files.txt`: arquivos modificados pelo patch.
- `evidence/clean-checkout.txt`: status do Git após a intervenção.
- `evidence/npm-ci.log`: validação limpa de instalação.
- `evidence/npm-audit-production.log`: 0 vulnerabilidades em dependências de produção.
- `evidence/lint.log`: execução limpa do ESLint com `--max-warnings=0`.
- `evidence/build-web.log`: compilação Next.js 15.
- `evidence/verify.log`: log integral do comando `npm run verify`.
- `evidence/test-summary.json`: contagem de 388 testes distribuídos em 6 pacotes.
- `evidence/cardinality-results.json`: recibo de cálculo físico e zero comprovado.
- `evidence/schema-validation-results.json`: validação estrita dos 3 schemas Ajv.
- `evidence/file-hashes.sha256`: tabela de hashes das fontes e scripts.
- `evidence/git-status-after-verification.txt`: comprovação de árvore limpa.
- `evidence/github-actions-receipt.json`: estado de CI e instruções de proteção de branch.

---

## 7. Estado do GitHub Actions e Limitações Remanescentes

### 7.1. Workflow de CI
O workflow `.github/workflows/ci.yml` contém todos os 16 steps obrigatórios, incluindo `npm ci`, `npm audit --omit=dev`, `npm run lint`, `npm test`, `npm run validate:manifests` e `npm run verify`.

### 7.2. Proteção do Branch Principal
- **Status:** `BRANCH_PROTECTION_NOT_CONFIGURED`
- **Motivo Técnico:** As permissões de automação e chaves de API locais não possuem prerrogativa administrativa para habilitar Branch Protection Rules via GitHub REST API.
- **Ação Requerida pelo Administrador do Repositório:**
  1. Acessar: `https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/settings/branches`
  2. Adicionar regra para o branch `master`.
  3. Ativar `Require status checks to pass before merging`.
  4. Selecionar o check obrigatório: `Deterministic Build, Typecheck, Test & Audit`.

---

## 8. Classificação Final

Conforme determinado pela Seção 11 e 12 do documento de requisitos:
- **Classificação:** `PATCH_VERIFIED_CI_NOT_ENFORCED`
- **Justificativa:** O patch está 100% verificado localmente, schemas e fontes canónicas estão fisicamente presentes e rastreados no Git, todos os 388 testes passaram em regime fail-closed, a pipeline de verificação é determinística e limpa, e a esteira do GitHub Actions está pronta, aguardando apenas a ativação administrativa da regra de proteção de branch.
