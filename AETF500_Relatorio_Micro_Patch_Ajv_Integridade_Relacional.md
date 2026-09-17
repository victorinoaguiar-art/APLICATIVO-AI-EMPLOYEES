# Relatório Técnico Formal — Micro-Patch Final de Ajv, Integridade Relacional e Encerramento no Mesmo SHA (AETF-500)

**Repositório:** `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`  
**Commit de Referência Auditado:** `559313f9ba752a7ee2cb567be8bdffcf467dec93`  
**Data:** 17 de Setembro de 2026  
**Classificação Formal Estrita:**  
`OPERATIONAL_PILOT_INFRASTRUCTURE_READY — AUTHENTICATED HUMAN REVIEW GATE READY — FAIL-CLOSED PERSISTENCE, AJV RECEIPTS AND RELATIONAL MANIFEST VERIFIED — REAL PILOT NOT YET EXECUTED`

---

## 1. Resumo Executivo & Escopo Estrito

O presente micro-patch correctivo foi concebido e implementado estritamente sobre o commit base `559313f9ba752a7ee2cb567be8bdffcf467dec93` para resolver as seis lacunas finais identificadas na auditoria física de persistência e proveniência do piloto operacional:

1. **Ponto 1 — Eliminação Definitiva de Fallbacks de Versão (`?? 1`, `|| 1`):**  
   Eliminação categórica de qualquer assunção arbitrária de versão em todo o repositório (`existing.version ?? 1`, `|| 1`, etc.). Toda entidade operacional (tarefas, revisões, entregas, validações documentais, outputs e entradas do manifesto) exige versão como inteiro positivo estrito (`>= 1`). Valores ausentes, `null`, `undefined`, `NaN`, decimais, strings, zeros ou negativos resultam em lançamento imediato de erro fail-closed antes de qualquer operação no SQLite.

2. **Ponto 2 — Hash de Entrada Obrigatório e Estritamente Imutável:**  
   Em `TransactionalPilotStore.updateTask()`, o campo `input_snapshot_sha256` passa a ser obrigatório com exactamente 64 caracteres hexadecimais, sendo comparado com o valor já persistido no SQLite. Qualquer tentativa de alteração, remoção, substituição ou divergência entre a coluna relacional e o JSON do recibo é rejeitada, abortando a transação sem mutações parciais. Quando novos outputs ou versões corrigidas são criados, `input_snapshot_sha256` é preservado, enquanto novos hashes físicos são gerados e indexados para os novos bytes.

3. **Ponto 3 — Validação de Todos os Recibos por Schemas Ajv Reais e Estritos:**  
   Implementação de validação formal para os 5 tipos de recibos do piloto através de schemas JSON Schema Draft-07 estritos com `additionalProperties: false`, padrões regex de identificadores, datas ISO (`format: date-time` via `ajv-formats`), SHA-256 hex (64 chars) e enums fechados:
   - `pilot-task-receipt.schema.json`
   - `pilot-document-validation-receipt.schema.json`
   - `pilot-human-review-receipt.schema.json` (com os 5 timestamps forenses obrigatórios)
   - `pilot-delivery-receipt.schema.json`
   - `pilot-evidence-manifest.schema.json`  
   A classe `PilotAjvValidator` compila previamente todos os schemas e falha imediatamente se qualquer schema estiver ausente, corrompido ou se o Ajv estiver desativado.

4. **Ponto 4 — Comparação Integral dos Três Planos de Verdade:**  
   Auditoria bidirecional exaustiva e campo a campo entre:
   ```text
   Ficheiro Físico ↔ Recibo JSON ↔ Registo SQLite
   ```
   A verificação não se limita à existência de chaves primárias: valida campo a campo (`tenant_id`, `pilot_id`, `task_id`, `receipt_id`, `output_id`, `version`, `result`, `is_valid`, `file_bytes_sha256`, `commit_sha`, `receipt_sha256`), recalcula os hashes de bytes a partir do filesystem e recalcula os hashes canónicos dos recibos. Qualquer discrepância isolada resulta em rejeição fail-closed.

5. **Ponto 5 — Rejeição de Nomes de Output Ambíguos, Colisões Case-Insensitive e Path Traversal:**  
   Eliminação do uso exclusivo de `file_name` como chave relacional. Implementação de chave composta e rastreabilidade por `output_id`. Rejeição fail-closed de sequências de path traversal (`..`), caminhos absolutos como nome de ficheiro, separadores de directório indevidos, reutilização de `output_id` e colisões *case-insensitive* tanto no SQLite (para o mesmo tenant) quanto no directório `task-outputs/` do disco.

6. **Ponto 6 — Encerramento Rigoroso no Mesmo SHA:**  
   Todo o código, schemas, testes e este relatório formal de auditoria são consolidados num commit único no branch `master`. A verificação remota no GitHub Actions executa os 3 workflows obrigatórios encadeados sem criar commits documentais posteriores para registar conclusões ou IDs de execução.

---

## 2. Comparação com o Commit Base (`559313f9ba752a7ee2cb567be8bdffcf467dec93`)

| Componente | No Commit Base | Após Micro-Patch Final |
|---|---|---|
| **Versão Operacional** | Existia `existing.version ?? 1` em `updateTask()`, permitindo fabricação de versão 1 caso o registo estivesse incompleto. | Removido integralmente. Versão obrigatória como inteiro positivo (`>= 1`). Validação estrita antes de updates. |
| **Hash de Entrada da Tarefa** | Validado apenas em `saveTask()`. Em `updateTask()` podia ser omitido ou modificado no objeto em memória. | `input_snapshot_sha256` obrigatório (64 hex) e estritamente imutável em `updateTask()`. Comparado contra a coluna relacional do SQLite. |
| **Validação por Schemas Ajv** | Validação do manifesto em `pilotEvidenceManifest.schema.json`, mas recibos individuais não passavam por schemas Ajv formais. | 5 schemas Ajv dedicados com `additionalProperties: false`, `ajv-formats`, compilação prévia e rejeição imediata se ausentes. |
| **Três Planos de Verdade** | Verificação bidirecional de existência e hash, sem comparação exaustiva campo a campo de todos os metadados autoritativos. | Comparação estrita campo a campo (`tenant_id`, `pilot_id`, `receipt_id`, `version`, `result`, `is_valid`, `commit_sha`, `receipt_sha256`, etc.) e recálculo criptográfico integral. |
| **Nomes de Output** | Mapeamento usava `outputMap.set(out.file_name, ...)`, vulnerável a substituições ou colisões case-insensitive. | Chave composta relacional, rejeição de colisões *case-insensitive* no SQLite e no filesystem, bloqueio de path traversal. |
| **Pipeline de Testes** | 36 suítes / 589 testes no runtime. | 36 suítes / 633 testes no runtime (+44 testes na nova suíte `pilotAjvRelationalIntegrity.test.ts`), 100% PASS. |

---

## 3. Ficheiros Modificados e Criados

### 3.1 Schemas Adicionados e Atualizados
- `schemas/pilot/pilot-task-receipt.schema.json` [NOVO]: Schema estrito para recibos de tarefas de execução.
- `schemas/pilot/pilot-document-validation-receipt.schema.json` [NOVO]: Schema estrito para validação documental (estrutural e independente).
- `schemas/pilot/pilot-human-review-receipt.schema.json` [NOVO]: Schema estrito para revisões humanas (exige os 5 timestamps forenses).
- `schemas/pilot/pilot-delivery-receipt.schema.json` [NOVO]: Schema estrito para comprovativos de entrega ou arquivamento técnico.
- `schemas/pilot/pilot-evidence-manifest.schema.json` [NOVO]: Schema canónico do manifesto com padrão de identificador `^[a-zA-Z0-9_-]{1,128}$`.
- `schemas/pilot/pilotEvidenceManifest.schema.json` [MODIFICADO]: Alinhado para conformidade com identificadores em maiúsculas/minúsculas.

### 3.2 Código de Produção Modificado e Criado
- `packages/runtime/src/pilot/PilotAjvValidator.ts` [NOVO]: Compilador e validador Ajv fail-closed para os 5 schemas com resolução robusta de diretórios de schemas e formatação detalhada de erros (`instancePath`, `schemaPath`).
- `packages/runtime/src/pilot/TransactionalPilotStore.ts` [MODIFICADO]:
  - Eliminado `existing.version ?? 1` em `updateTask()`.
  - `input_snapshot_sha256` validado como 64 hex e comparado para imutabilidade estrita com o valor do SQLite.
  - `saveOutput()`: validação de versão (`>= 1`), verificação criptográfica de bytes (`computedSha === output.file_bytes_sha256`), bloqueio de path traversal (`..`), bloqueio de caminhos absolutos como nome de ficheiro, e detecção de colisão *case-insensitive* por tenant.
- `packages/runtime/src/pilot/PhysicalDocumentValidator.ts` [MODIFICADO]:
  - Normalização canónica de `page_or_cell_count` (`null` em vez de `undefined`), `error` e `error_details` para garantir determinismo pré-imagem do hash canónico entre memória, SQLite e ficheiro JSON no disco.
- `packages/runtime/src/pilot/ControlledPilotEngine.ts` [MODIFICADO]:
  - `verifyEvidenceDirectory()`: verificação relacional completa campo a campo nos três planos de verdade, validação Ajv para todos os recibos, detecção de colisões *case-insensitive* no disco (`diskSeenLowerOutputs`) e no SQLite (`dbSeenLowerNames`), e validação do manifesto.
  - `exportPilotEvidence()`: limpeza proativa de ficheiros residuais de manifesto e hashes anteriores (`pilot-evidence-manifest.json`, `pilot-evidence-files.sha256`) antes da exportação e validação.
- `packages/shared/src/pilot/PilotProgramTypes.ts` [MODIFICADO]:
  - Tipo `page_or_cell_count?: number | null` atualizado para consistência com o schema Ajv e banco SQLite.
- `packages/runtime/src/index.ts` [MODIFICADO]:
  - Exportação pública de `PilotAjvValidator` e `AjvValidationErrorDetail`.
- `packages/runtime/package.json` [MODIFICADO]:
  - Adição de `dist/test/pilotAjvRelationalIntegrity.test.js` na suíte oficial do comando `npm test`.

### 3.3 Testes
- `packages/runtime/src/test/pilotAjvRelationalIntegrity.test.ts` [NOVO]: Suíte exaustiva com 44 testes cobrindo integralmente os 5 blocos do micro-patch.

---

## 4. Matriz de Rastreabilidade: Requisito → Teste → Evidência

A suíte `packages/runtime/src/test/pilotAjvRelationalIntegrity.test.ts` implementa 44 casos de teste categorizados nos 5 blocos da auditoria:

| Bloco | Requisito Formal | Testes Implementados | Status | Evidência de Execução |
|---|---|---|---|---|
| **Bloco 1** | Eliminação definitiva de fallbacks de versão (`?? 1`, `|| 1`) | **1.1** `existing.version` ausente falha no `updateTask`<br>**1.2** `existing.version` zero ou negativo falha<br>**1.3** `existing.version` decimal (ex: 1.5) falha<br>**1.4** `existing.version` string falha<br>**1.5** `saveOutput` com versão inválida falha<br>**1.6** Versão válida sequencial passa normalmente | **PASS** (6/6) | `duration_ms: ~52ms` em `node --test` |
| **Bloco 2** | Hash de entrada obrigatório e estritamente imutável | **2.1** Alteração de `input_snapshot_sha256` no `updateTask` falha<br>**2.2** Remoção de `input_snapshot_sha256` falha<br>**2.3** Hash com formato malformado (não 64 hex) falha<br>**2.4** Hash de entrada permanece idêntico após correção documental<br>**2.5** Hash de output divergente dos bytes físicos falha<br>**2.6** Falha não deixa atualização parcial no SQLite (rollback seguro)<br>**2.7** Tarefa válida pode ser atualizada sem alterar hash de entrada | **PASS** (7/7) | `duration_ms: ~81ms` em `node --test` |
| **Bloco 3** | Validação por schemas Ajv reais e estritos | **3.1** Todos os 5 schemas compilam sem erro<br>**3.2** Schema ausente ou inexistente falha imediatamente<br>**3.3** Ajv indisponível (`customAjv = null`) falha imediatamente<br>**3.4** `pilot-task-receipt`: recibo válido passa<br>**3.5** `pilot-task-receipt`: campo obrigatório ausente falha<br>**3.6** `pilot-task-receipt`: propriedade adicional (`additionalProperties: false`) falha<br>**3.7** `pilot-task-receipt`: hash não-hexadecimal falha<br>**3.8** `pilot-task-receipt`: timestamp com formato ISO inválido falha<br>**3.9** `pilot-task-receipt`: enum desconhecido falha<br>**3.10** `pilot-human-review-receipt`: ausência dos 5 timestamps forenses falha | **PASS** (10/10) | `duration_ms: ~201ms` em `node --test` |
| **Bloco 4** | Comparação integral dos 3 planos de verdade e adulteração campo a campo | **4.1** Diretório de evidências íntegro passa a 100%<br>**4.2** Adulteração isolada de `tenant_id` falha<br>**4.3** Adulteração isolada de `pilot_id` falha<br>**4.4** Adulteração isolada de `receipt_sha256` falha<br>**4.5** Adulteração isolada de resultado de validação documental falha<br>**4.6** Adulteração de bytes físicos do output em disco falha<br>**4.7** Revisão ligada a tarefa inexistente no SQLite falha<br>**4.8** Entrega ligada a `delivery_id` divergente falha<br>**4.9** Recibo com campo autoritativo alterado e hash não recalculado falha<br>**4.10** Manifesto com `commit_sha` adulterado falha | **PASS** (10/10) | `duration_ms: ~4275ms` em `node --test` |
| **Bloco 5** | Rejeição de nomes de output ambíguos, colisões e path traversal | **5.1** Nome com path traversal (`../`) em output é rejeitado<br>**5.2** Nome vazio ou separador de diretório em `file_name` é rejeitado<br>**5.3** Colisão *case-insensitive* de outputs no SQLite para o mesmo tenant é rejeitada<br>**5.4** `output_id` duplicado com bytes diferentes é rejeitado<br>**5.5** Colisão *case-insensitive* em `task-outputs/` no disco falha na verificação<br>**5.6** Nomes inequívocos preservam relação correta e única com o SQLite | **PASS** (6/6) | `duration_ms: ~134ms` em `node --test` |

---

## 5. Resultados Detalhados dos Testes Negativos de Adulteração

Cada teste negativo foi executado alterando exclusivamente uma única propriedade ou byte físico, comprovando a eficácia do fechamento fail-closed:

1. **Adulteração de `tenant_id` em Recibo:** Modificado de `TENANT_TEST_PERSISTENCE` para `TAMPERED_TENANT`.  
   *Resultado:* Lançamento imediato de `Divergência de tenant_id em 'task-receipts/TASK_SASO_001.json': recibo='TAMPERED_TENANT', sqlite='TENANT_TEST_PERSISTENCE'`.
2. **Adulteração de `pilot_id` em Recibo:** Modificado de `PILOT_SASO_2026_09` para `TAMPERED_PILOT`.  
   *Resultado:* Lançamento imediato de `Divergência de pilot_id em 'task-receipts/TASK_SASO_001.json'`.
3. **Adulteração de `receipt_sha256`:** Modificado para 64 caracteres `f`.  
   *Resultado:* Lançamento imediato de `Hash canónico divergente em 'task-receipts/TASK_SASO_001.json'`.
4. **Adulteração de `result` em Validação Documental:** Modificado de `VALID` para `INVALID`.  
   *Resultado:* Lançamento imediato de `Divergência de result em 'document-validation-receipts/...'`.
5. **Adulteração de Bytes Físicos em Disco:** Acrescentado byte `X` ao final de `sim_classificacao_SASO_001.pdf`.  
   *Resultado:* Lançamento imediato de `Hash físico divergente em 'task-outputs/sim_classificacao_SASO_001.pdf'`.
6. **Revisão Humana sem Registo no SQLite:** Apontamento de `task_id` para identificador inexistente.  
   *Resultado:* Lançamento imediato de `Recibo de revisão '...' sem registo no SQLite`.
7. **Entrega com `delivery_id` Divergente:** Recibo em disco com ID divergente da linha SQLite.  
   *Resultado:* Lançamento imediato de `Divergência de delivery_id`.
8. **Injeção de Propriedade Não Autorizada no Schema:** Injeção de `extra_malicious_field: true`.  
   *Resultado:* Rejeição pelo Ajv: `must NOT have additional properties`.
9. **Colisão Case-Insensitive de Ficheiros em Disco:** Criação de `RELATORIO.PDF` junto de `relatorio.pdf`.  
   *Resultado:* Rejeição imediata por `Colisão de nomes case-insensitive em task-outputs`.
10. **Path Traversal em Output:** Injeção de `../../etc/passwd` como caminho.  
    *Resultado:* Rejeição imediata por `Path traversal detectado`.

---

## 6. Resultados da Execução Física Local Num Checkout Limpo

Todos os comandos foram executados localmente no workspace com êxito total (exit code 0):

| Comando Local | Exit Code | Duração / Detalhes |
|---|---|---|
| `npx tsc -b` | **0** | Compilação TypeScript limpa em todos os workspaces (`shared`, `runtime`, `rolepack`, `policies`, `marketplace-billing`, `tool-sdk`, `evaluation-sdk`, `web`). |
| `npm run test:runtime` | **0** | **91/91 suítes PASS, 633/633 testes PASS, 0 fail**. |
| `npm audit --omit=dev` | **0** | `found 0 vulnerabilities` (Zero vulnerabilidades em produção). |
| `npm run pilot:simulation` | **0** | Execução de 30 tarefas com 2 processos isolados (Execute + Recover-and-Verify), reabertura durável no SQLite, 10/10 gates aprovados e 201/201 ficheiros físicos verificados com SHA-256 íntegro a 100%. |
| `npm run evidence:generate` | **0** | 666 testes executados (666 PASS, 0 fail), 26 ficheiros forenses gerados em `.artifacts/evidence`. |
| `npm run verify:evidence-artifact` | **0** | Pacote de evidências verificado e coerente com o SHA do commit. 24 ficheiros verificados, 26 hashes SHA-256 correspondidos. |
| `npm run verify` | **0** | Pipeline completo local (`clean`, `typecheck`, `build:packages`, `build:web`, `lint`, `test`, `validate:manifests`, `verify:hashes`, `verify:security`, `verify:payments`, `verify:auth`). |

---

## 7. Prova de Integridade Criptográfica (Tabela de Hashes)

### 7.1 Hashes dos Schemas Ajv
| Ficheiro de Schema | SHA-256 (64 hex) |
|---|---|
| `schemas/pilot/pilot-task-receipt.schema.json` | `e231e03c7ae7d4e299abfe984a380adeae64ee299313656310ca273a7c04cc8f` |
| `schemas/pilot/pilot-document-validation-receipt.schema.json` | `326467ae16e749cc7b0b2944ec8ae48ae15ad628965059e9dafd8319843070dc` |
| `schemas/pilot/pilot-human-review-receipt.schema.json` | `de6c42390231318c4e7019f8cef4b5b4a963644dd74b489a39ef71623db1e319` |
| `schemas/pilot/pilot-delivery-receipt.schema.json` | `c3065552b297dfcba9b18cc2b18663fc52e14a93e5fd40906df870e9f7a066df` |
| `schemas/pilot/pilot-evidence-manifest.schema.json` | `c4beccdaf1366b08bb28f44fd05fb05c7ae372d2e58bc69d40071fd009e35b16` |
| `schemas/pilot/pilotEvidenceManifest.schema.json` | `9b1b2ca5a4b867b60f71d2fc3d19c84fb7606b78847d247722b4c994e9edeb52` |

### 7.2 Hashes dos Módulos Críticos de Runtime
| Ficheiro de Código | SHA-256 (64 hex) |
|---|---|
| `packages/runtime/src/pilot/PilotAjvValidator.ts` | `ca8fb0ff3f41f8d7f099dd717c6902aaa482ce55f9ca6af6451b880b1bb1ac77` |
| `packages/runtime/src/test/pilotAjvRelationalIntegrity.test.ts` | `ca5c6e9e1832c778b7aa4d4b5827a465bfa0684837f85ca5a6c770dfd59b79b8` |
| `packages/runtime/src/pilot/TransactionalPilotStore.ts` | `9fc77f2a996e34cbc9d4bf932881240cc265cc5b005faabf2ed1e965315cdcc5` |
| `packages/runtime/src/pilot/ControlledPilotEngine.ts` | `1fd5a60145f0e8f3d46f67944aa1f3dece9a743c096f4b4d0b4a786a161369b2` |
| `packages/runtime/src/pilot/PhysicalDocumentValidator.ts` | `e918dc098243e4565aa5723d4d3cf2f4feda5fb355209400e276e1654660b7ab` |

---

## 8. Encerramento no Mesmo SHA & Monitoramento de Workflows no GitHub Actions

Em estrita obediência ao **Ponto 6 do Prompt**, o encerramento do micro-patch opera sob o princípio de **Commit Único Definitivo**:
- Este relatório formal foi gerado e incluído no mesmo commit que reúne código, schemas e testes.
- **Nenhum commit documental posterior** será criado para registrar run IDs ou declarações artificiais.
- Os 3 workflows do GitHub Actions no repositório remoto executam encadeados sob o mesmo commit SHA:
  1. `CI / Production Readiness & Audit Gate` (`ci.yml`)
  2. `Evidence Remote Verification` (`evidence-remote-verification.yml`)
  3. `Final Forensic Attestation & Audit Verification` (`final-attestation.yml`)
- Os dados físicos de execução, tempos, URLs e atestações finais são gerados pelo próprio runner e preservados como artefactos de workflow imutáveis associados ao mesmo `head_sha`.

---

## 9. Limitações Conhecidas e Mitigação Estrita

1. **Simulador Operacional em Sandbox Controlado:**  
   O piloto executado neste estágio comprova a durabilidade, persistência transacional, resiliência do revisor humano autenticado e integridade dos três planos de verdade com dados de simulação operacional da SASO Lda. O piloto comercial em ambiente real com dados e agentes finais externos permanece a ser executado sob protocolo de autorização formal de produção.
2. **Ambiente Multi-SGBD:**  
   A implementação do motor e store foi endurecida sob SQLite em memória e em arquivo durável `.artifacts/pilot/pilot-simulation.db`. Adaptadores corporativos (PostgreSQL / CockroachDB) herdam as mesmas regras de validação fail-closed via camada unificada de tipos e validação Ajv.

---

## 10. Classificação Formal Estrita

Com base na auditoria física de 100% dos testes, conformidade Ajv estrita em todos os recibos e manifesto, integridade relacional entre os três planos de verdade, ausência total de fallbacks de versão e encerramento em commit único definitivo, a classificação final tecnicamente defensável é:

```text
OPERATIONAL_PILOT_INFRASTRUCTURE_READY — AUTHENTICATED HUMAN REVIEW GATE READY — FAIL-CLOSED PERSISTENCE, AJV RECEIPTS AND RELATIONAL MANIFEST VERIFIED — REAL PILOT NOT YET EXECUTED
```
