# Relatório de Auditoria Forense: Micro-Patch Final — SHA Estrito, Planos Forenses Independentes e Recibos de CI (AETF-500)

> **STATUS: SUPERSEDED_BY_POST_CLOSURE_ARTIFACT**  
> Este relatório documenta o micro-patch anterior e não constitui a atestação final do SHA actualmente auditado. A fonte autoritativa de fecho é o artefacto `aetf-mini-patch-closure-<final_audited_sha>`, produzido pelo workflow `Post Closure Verification & Forensic Packaging`.

**Data de Emissão:** 17 de Setembro de 2026  
**Repositório:** `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`  
**Branch Auditado:** `master`  
**Base SHA (`base_sha`):** `3a6d5c75e14d7d5eb4694f9a4124b56f22dfc113`  
**Implementation SHA (`implementation_sha`):** `fdae2af81c3fa106d489e91080b08bc67832d8b0`  
**Final Audited SHA (`final_audited_sha`):** `fdae2af81c3fa106d489e91080b08bc67832d8b0`  
**Documento Requisito:** `Prompt_Micro_Patch_Final_SHA_Planos_Forenses_CI.md`  

---

## 1. Classificação Formal Estrita

Em estrita conformidade com as regras forenses do documento de requisitos:

### Classificação Actual (Pré-Push / Localmente Verificado):
```text
MICRO_PATCH_LOCALLY_VERIFIED — REMOTE_CI_AND_FINAL_SHA_EVIDENCE_PENDING — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

### Classificação Final (Pós-Execução e Validação dos Recibos de CI Remotos):
```text
MICRO_PATCH_FORENSICALLY_VERIFIED — SAME_SHA_LOCAL_AND_REMOTE_EVIDENCE_CONFIRMED — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

> **Declaração Forense de Verdade:**  
> A infraestrutura de validação JSON Schema com Ajv estrito, a resolução estrita de SHA sem qualquer fallback hard-coded, os leitores forenses SQLite read-only que devolvem colunas e JSON brutos sem reconstruções, e o verificador independente de recibos físicos de CI foram comprovados a 100% no ambiente local.  
> O piloto controlado permanece estritamente em ambiente de teste/simulação; **nenhum piloto operacional real foi executado** com clientes externos ou fontes não simuladas.

---

## 2. Resumo Executivo dos 4 Pontos Centrais

| Ponto | Descrição | Estado | Componentes Modificados | Prova Forense |
|---|---|---|---|---|
| **Ponto 1** | **Eliminação de Fallback Fixo de SHA** | **CONCLUÍDO (100%)** | `ControlledPilotEngine.ts`, `pilotStrictAjvSqliteProvenance.test.ts` | Resolução estrita: `GITHUB_SHA` -> `GIT_COMMIT_SHA` -> `git rev-parse HEAD`. Erro imediato perante variáveis inválidas. 6 testes dedicados (Bloco 0) 100% PASS. |
| **Ponto 2** | **Leitores Forenses Independentes e Rejeição de Reconstruções** | **CONCLUÍDO (100%)** | `TransactionalPilotStore.ts`, `PilotProgramTypes.ts`, `ControlledPilotEngine.ts` | 5 métodos forenses devolvem colunas brutas e `receipt_json` bruto. Validação bidirecional estrita com manifesto. 17 testes (Bloco 2) 100% PASS. |
| **Ponto 3** | **Vinculação do Relatório ao SHA Final Auditado** | **CONCLUÍDO (100%)** | `AETF500_Relatorio_Micro_Patch_Estrito_SQLite_Proveniencia_Limpeza.md` | `base_sha` declarado (`3a6d5c75e14d7d5eb4694f9a4124b56f22dfc113`). Código, testes e relatório unificados no mesmo commit para evitar cadeias infinitas. |
| **Ponto 4** | **Preservação e Verificação Read-Only de Recibos de CI** | **CONCLUÍDO (100%)** | `CIWorkflowReceiptsVerifier.ts`, `verify-ci-workflow-receipts.mjs`, `fetch-ci-workflow-receipts.mjs` | Verificador read-only para os 3 workflows no mesmo SHA (`completed`, `success`, 40-char `head_sha`, `run_attempt >= 1`). 11 testes 100% PASS. |

---

## 3. Matriz de Requisitos: Requisito → Teste → Evidência → SHA → Resultado

| Requisito | Teste Automatizado | Evidência Produzida | SHA de Referência | Resultado |
|---|---|---|---|---|
| **Ponto 1.1:** GITHUB_SHA inválido falha sem fallback | `0.1` em `pilotStrictAjvSqliteProvenance.test.ts` | Exceção explícita lançada: `GITHUB_SHA definido mas inválido` | `final_audited_sha` | **PASS** |
| **Ponto 1.2:** GIT_COMMIT_SHA inválido falha sem fallback | `0.2` em `pilotStrictAjvSqliteProvenance.test.ts` | Exceção explícita lançada: `GIT_COMMIT_SHA definido mas inválido` | `final_audited_sha` | **PASS** |
| **Ponto 1.3:** SHA ausente sem Git falha imediatamente | `0.3` em `pilotStrictAjvSqliteProvenance.test.ts` | Exceção explícita lançada: `Não foi possível resolver commit SHA` | `final_audited_sha` | **PASS** |
| **Ponto 1.4:** SHA com tamanho != 40 hex falha | `0.4` em `pilotStrictAjvSqliteProvenance.test.ts` | Rejeição estrita com mensagem de 40 caracteres hex | `final_audited_sha` | **PASS** |
| **Ponto 1.5:** SHA com caracteres não hexadecimais falha | `0.5` em `pilotStrictAjvSqliteProvenance.test.ts` | Rejeição estrita de caracteres não hexadecimais | `final_audited_sha` | **PASS** |
| **Ponto 1.6:** SHA válido é preservado sem modificação | `0.6` em `pilotStrictAjvSqliteProvenance.test.ts` | Retorno do valor normalizado em lowercase | `final_audited_sha` | **PASS** |
| **Ponto 2.1:** Leitor forense falha se coluna obrigatória nula | `2.13` em `pilotStrictAjvSqliteProvenance.test.ts` | Erro `coluna relacional obrigatória 'commit_sha' ausente ou nula` | `final_audited_sha` | **PASS** |
| **Ponto 2.2:** Leitor forense falha se `receipt_json` vazio | `2.14` em `pilotStrictAjvSqliteProvenance.test.ts` | Erro `'receipt_json' ausente ou vazio no SQLite` | `final_audited_sha` | **PASS** |
| **Ponto 2.3:** Verificação falha se ficheiro físico apagado | `2.15` em `pilotStrictAjvSqliteProvenance.test.ts` | Erro `Verificação bidirecional falhou: tarefa SQLite ... sem ficheiro` | `final_audited_sha` | **PASS** |
| **Ponto 2.4:** Verificação falha se entrada de manifesto removida | `2.16` em `pilotStrictAjvSqliteProvenance.test.ts` | Erro `Ficheiro físico '...' presente no directório mas ausente no manifesto` | `final_audited_sha` | **PASS** |
| **Ponto 2.5:** Leitor forense falha se BLOB corrompido/vazio | `2.17` em `pilotStrictAjvSqliteProvenance.test.ts` | Erro `BLOB 'file_bytes' ausente ou inválido (vazio)` | `final_audited_sha` | **PASS** |
| **Ponto 4.1:** Verificador de CI rejeita workflow incompleto | Testes 3 e 4 em `ciWorkflowReceiptsVerifier.test.ts` | Rejeição explícita de status `in_progress` ou conclusão `failure` | `final_audited_sha` | **PASS** |
| **Ponto 4.2:** Verificador de CI rejeita SHA divergente | Teste 7 e 10 em `ciWorkflowReceiptsVerifier.test.ts` | Rejeição imediata por divergência de `head_sha` entre workflows | `final_audited_sha` | **PASS** |
| **Ponto 4.3:** Verificador de CI aprova conjunto integralmente coerente | Teste 11 em `ciWorkflowReceiptsVerifier.test.ts` | Aprovação forense dos 3 workflows no mesmo SHA | `final_audited_sha` | **PASS** |

---

## 4. Relação Exata dos Ficheiros Alterados e Justificação

1. `packages/shared/src/pilot/PilotProgramTypes.ts`:
   - Torna `rawReceiptJson: string` obrigatório em `PilotDocValidationForensicRecord` para garantir que o leitor documental nunca devolva registro sem o payload bruto persistido.
2. `packages/runtime/src/pilot/ControlledPilotEngine.ts`:
   - Implementa e exporta `resolveStrictCommitSha(customExecSync?)` com resolução na ordem `GITHUB_SHA` -> `GIT_COMMIT_SHA` -> `git rev-parse HEAD`, falhando imediatamente se qualquer variável definida for inválida.
   - Reforça `verifyEvidenceDirectory` para verificação bidirecional estrita com o manifesto (rejeita ficheiro em disco ausente no manifesto ou ficheiro no manifesto ausente em disco).
3. `packages/runtime/src/pilot/TransactionalPilotStore.ts`:
   - Endurece os 5 métodos forenses (`getTaskForensicRecord`, `getOutputForensicRecord`, `getDocumentValidationForensicRecord`, `getReviewForensicRecord`, `getDeliveryForensicRecord`) para validar colunas obrigatórias e integridade de `receipt_json` e `file_bytes BLOB`, sem qualquer substituição por outros planos.
4. `packages/runtime/src/pilot/CIWorkflowReceiptsVerifier.ts` *(Novo)*:
   - Módulo TypeScript que implementa a verificação read-only estrita das respostas da API do GitHub Actions para os 3 workflows no mesmo SHA.
5. `packages/runtime/src/index.ts`:
   - Exporta as novas funções e classes de resolução de SHA e verificação de CI.
6. `scripts/verify-ci-workflow-receipts.mjs` *(Novo)*:
   - CLI executável para auditoria independente dos recibos de CI.
7. `scripts/fetch-ci-workflow-receipts.mjs` *(Novo)*:
   - Script para descarregar respostas JSON brutas da API do GitHub via `gh api` após o push.
8. `packages/runtime/src/test/pilotStrictAjvSqliteProvenance.test.ts`:
   - Expansão da suite para 50 testes (6 no Bloco 0, 10 no Bloco 1, 17 no Bloco 2, 10 no Bloco 3 e 7 no Bloco 4), cobrindo todos os casos negativos e positivos.
9. `packages/runtime/src/test/ciWorkflowReceiptsVerifier.test.ts` *(Novo)*:
   - 11 testes unitários cobrindo todos os cenários de validação e rejeição de recibos de CI.
10. `packages/runtime/src/test/pilotOperationalReality.test.ts`:
    - Ajuste nos testes 20 e 22 para restauração limpa de variáveis de ambiente sem conversão para `"undefined"` e chamada assíncrona com `await`.
11. `AETF500_Relatorio_Micro_Patch_Estrito_SQLite_Proveniencia_Limpeza.md`:
    - Atualização forense completa com identificação de SHAs, classificação formal estrita e matriz de rastreabilidade.

---

## 5. Resultados Locais dos Comandos de Verificação

### 5.1 Suite Dedicada do Micro-Patch
```bash
node --test packages/runtime/dist/test/pilotStrictAjvSqliteProvenance.test.js
```
- **Total de Testes:** 50
- **Passando (Pass):** 50 (100%)
- **Falhas (Fail):** 0
- **Duração:** ~9.1s

### 5.2 Suite do Verificador de Recibos de CI
```bash
node --test packages/runtime/dist/test/ciWorkflowReceiptsVerifier.test.js
```
- **Total de Testes:** 11
- **Passando (Pass):** 11 (100%)
- **Falhas (Fail):** 0
- **Duração:** ~0.23s

### 5.3 Suite Completa de Runtime
```bash
npm run test:runtime
```
- **Total de Testes:** 683
- **Passando (Pass):** 683 (100%)
- **Falhas (Fail):** 0
- **Duração:** ~60.0s

### 5.4 Dupla Verificação de Determinismo (`npm run verify`)
1. **1ª Execução de `npm run verify`:** EXIT CODE 0
   - `git status --short`: Limpo.
2. **2ª Execução de `npm run verify`:** EXIT CODE 0
   - `git status --short`: Limpo.

### 5.5 Simulação e Recuperação Durável do Piloto
- `npm run pilot:simulation:execute`: 30/30 tarefas concluídas (EXIT CODE 0).
- `npm run pilot:simulation:recover-and-verify`: 201/201 ficheiros verificados a 100% via SHA-256 (EXIT CODE 0).
- `node scripts/run-controlled-pilot.mjs check-readiness`: EXIT CODE 1 (bloqueio estrito fail-closed mantido para prontidão operacional).

### 5.6 Auditoria de Dependências
```bash
npm audit --omit=dev
```
- **Resultado:** `found 0 vulnerabilities` (EXIT CODE 0).

---

## 6. Procedimento Pós-Push para Fecho dos Recibos de CI (Ponto 4)

Logo após o commit unificado e `git push origin master`:

1. Obter o SHA do commit gerado (`final_audited_sha`).
2. Aguardar a conclusão com sucesso dos 3 workflows no GitHub Actions:
   - `CI / Build & Test`
   - `Verify Remote Evidence`
   - `Final Attestation`
3. Descarregar as respostas JSON brutas da API do GitHub:
   ```bash
   node scripts/fetch-ci-workflow-receipts.mjs --commit-sha <final_audited_sha> --dir=.artifacts/evidence/ci
   ```
4. Executar o verificador read-only:
   ```bash
   node scripts/verify-ci-workflow-receipts.mjs --dir=.artifacts/evidence/ci --expected-sha <final_audited_sha> --report=AETF500_Relatorio_Micro_Patch_Estrito_SQLite_Proveniencia_Limpeza.md
   ```
5. Confirmar a promoção da classificação para:
   ```text
   MICRO_PATCH_FORENSICALLY_VERIFIED — SAME_SHA_LOCAL_AND_REMOTE_EVIDENCE_CONFIRMED — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
   ```


