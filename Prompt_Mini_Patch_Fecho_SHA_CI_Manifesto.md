# Prompt — Mini-Patch de Fecho do SHA, CI e Manifesto Forense

## Repositório e referência

- **Repositório:** `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`
- **Commit actualmente auditado:** `fdae2af81c3fa106d489e91080b08bc67832d8b0`
- **Classificação máxima actualmente permitida:**

```text
MICRO_PATCH_LOCALLY_VERIFIED — THREE_REMOTE_WORKFLOWS_CONFIRMED_SUCCESS_ON_SAME_SHA — FINAL_REPORT_SHA_LINKAGE_INCOMPLETE — CI_RECEIPT_VERIFIER_NOT_ENFORCED_BY_PIPELINE — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

## Finalidade

Executar um mini-patch de fecho, sem criar novos módulos funcionais, para corrigir exclusivamente as lacunas remanescentes de proveniência, integração dos verificadores na CI e coerência do manifesto.

O patch deve encerrar a validação do micro-patch anterior sem iniciar outra cadeia infinita de commits documentais.

## Correcções obrigatórias

### 1. Ligar o relatório ao SHA final sem criar outro commit documental posterior

O relatório actual ainda contém valores como:

```text
implementation_sha: A ser gerado no commit unificado deste micro-patch
final_audited_sha: A ser gerado no commit unificado deste micro-patch
```

Corrigir o processo da seguinte forma:

1. O relatório versionado deve identificar claramente:
   - `base_sha`: `3a6d5c75e14d7d5eb4694f9a4124b56f22dfc113`;
   - `implementation_sha`: o commit que introduziu a implementação anterior, `fdae2af81c3fa106d489e91080b08bc67832d8b0`;
   - `closure_patch_sha`: o SHA do presente mini-patch;
   - `final_audited_sha`: o mesmo SHA usado pelos workflows finais.
2. Como o SHA do commit só existe depois do commit, não inserir manualmente um placeholder que permaneça no relatório final.
3. Produzir o relatório final resolvido como artefacto da CI, a partir de um modelo versionado, substituindo os campos apenas durante a execução do workflow.
4. O relatório final gerado deve preservar os bytes e publicar o respectivo SHA-256.
5. O verificador deve falhar se o relatório final:
   - não contiver `final_audited_sha`;
   - contiver texto como `A ser gerado`, `PENDING`, `UNKNOWN`, SHA fictício ou placeholder;
   - contiver SHA diferente do `head_sha` comprovado pelos workflows;
   - declarar sucesso remoto sem recibos físicos válidos.
6. Não criar um commit posterior exclusivamente para escrever o SHA do commit anterior no relatório.

### 2. Integrar obrigatoriamente a suite de recibos de CI no `npm run verify`

O ficheiro abaixo existe, mas a sua suite não está incluída no comando normal de testes do runtime:

```text
packages/runtime/src/test/ciWorkflowReceiptsVerifier.test.ts
```

Corrigir para que:

1. `npm run test:runtime` execute explicitamente `dist/test/ciWorkflowReceiptsVerifier.test.js`.
2. Consequentemente, `npm run verify` execute essa suite em todo checkout limpo.
3. A CI principal execute `npm run verify` sem comandos paralelos que ignorem essa suite.
4. Uma verificação automatizada falhe caso o ficheiro de teste exista, mas deixe de estar incluído no comando oficial.
5. Não aceitar execução manual separada como substituição da integração no gate principal.

### 3. Validar a identidade exacta dos três workflows

O verificador não pode aceitar apenas um campo `name` não vazio. Implementar uma correspondência exacta e fail-closed:

| Ficheiro físico | Nome exacto obrigatório | Workflow esperado |
|---|---|---|
| `workflow-run-ci-readiness.json` | `CI / Production Readiness & Audit Gate` | `.github/workflows/ci.yml` |
| `workflow-run-evidence-remote.json` | `Evidence Remote Verification` | `.github/workflows/evidence-remote-verification.yml` |
| `workflow-run-final-forensic.json` | `Final Forensic Attestation & Audit Verification` | `.github/workflows/final-attestation.yml` |

Para cada recibo, validar directamente da resposta física da API:

- `id`;
- `name`;
- `workflow_id` e/ou `path`;
- `repository.full_name`;
- `head_sha`;
- `head_branch`;
- `event`;
- `run_attempt`;
- `status` exactamente `completed`;
- `conclusion` exactamente `success`;
- `created_at`;
- `run_started_at`;
- `updated_at`;
- `html_url` coerente com repositório e ID.

O verificador deve rejeitar:

- workflows trocados entre os três nomes de ficheiro;
- nomes abreviados como `CI`, `Remote` ou `Forensic`;
- três cópias do mesmo workflow;
- workflow de outro repositório, branch ou SHA;
- `workflow_id`, `path`, ID, URL ou `run_attempt` ausente;
- estado ou conclusão reconstruído, presumido ou obtido por fallback.

### 4. Integrar a recolha e a verificação dos recibos no fluxo remoto

Os scripts abaixo já existem:

```text
scripts/fetch-ci-workflow-receipts.mjs
scripts/verify-ci-workflow-receipts.mjs
```

Não basta deixá-los como procedimento manual. Integrá-los num processo remoto automático que ocorra depois da conclusão dos três workflows.

#### Regra temporal obrigatória

O workflow de atestação final não pode declarar a sua própria conclusão enquanto ainda está em execução. Portanto:

1. manter os três workflows actuais;
2. criar apenas um workflow técnico de fecho pós-conclusão, sem funcionalidade de negócio, activado por `workflow_run` após a conclusão de `Final Forensic Attestation & Audit Verification`; ou utilizar mecanismo equivalente que só execute depois dessa conclusão;
3. exigir que a execução final anterior tenha `status: completed` e `conclusion: success`;
4. consultar pela API as três execuções ligadas ao mesmo `head_sha`;
5. preservar as três respostas JSON brutas;
6. executar o verificador read-only sobre esses bytes;
7. gerar o relatório final resolvido e a matriz de evidências;
8. publicar tudo num único artefacto final de fecho.

O workflow técnico de fecho deve falhar se qualquer recibo:

- estiver ausente;
- ainda estiver em execução;
- tiver conclusão diferente de `success`;
- pertencer a outro SHA;
- não possuir identidade exacta do workflow;
- não corresponder à cadeia temporal esperada;
- possuir campos obrigatórios ausentes;
- não corresponder ao relatório final.

### 5. Tornar obrigatória a correspondência entre relatório e recibos

Quando `reportPath` ou `--report` for fornecido:

1. `final_audited_sha` deve existir obrigatoriamente.
2. O valor deve ser um SHA Git completo de 40 caracteres hexadecimais.
3. O valor deve coincidir com:
   - o `expectedSha` fornecido ao verificador;
   - o `head_sha` dos três recibos;
   - o SHA usado para checkout pelos workflows;
   - o SHA constante na matriz final de evidências.
4. Ausência, placeholder ou formato inválido deve resultar em exit code diferente de zero.
5. Não tratar a verificação do relatório como opcional depois de `--report` ser indicado.

### 6. Restaurar a verificação do tenant no manifesto

Repor no verificador do manifesto a validação directa:

```text
parsedManifest.tenant_id === pilot.tenant_id
```

Manter simultaneamente as novas verificações de:

- `commit_sha`;
- `pilot_id`;
- `tenant_id`;
- `total_files`;
- presença bidireccional de todos os ficheiros;
- hashes SHA-256;
- tamanho físico;
- MIME type;
- origem, tarefa, versão e relações aplicáveis;
- rejeição de symlinks.

Adicionar teste negativo que altere apenas o `tenant_id` do manifesto, recalcule o hash do próprio ficheiro se necessário e confirme que a verificação continua a falhar pela divergência semântica do tenant.

## Recibos reais já identificados

Os seguintes dados podem servir apenas como referência histórica da execução anterior. Não devem ser copiados nem reutilizados como prova do novo SHA final:

| Workflow | Run ID anterior | SHA anterior | Resultado |
|---|---:|---|---|
| CI principal | `35288710597` | `fdae2af81c3fa106d489e91080b08bc67832d8b0` | `completed/success` |
| Evidence Remote Verification | `35289043023` | `fdae2af81c3fa106d489e91080b08bc67832d8b0` | `completed/success` |
| Final Forensic Attestation | `35289070743` | `fdae2af81c3fa106d489e91080b08bc67832d8b0` | `completed/success` |

O mini-patch deve produzir recibos novos para o seu próprio `final_audited_sha`.

## Testes negativos obrigatórios

Adicionar testes que comprovem falha perante:

1. relatório sem `final_audited_sha`;
2. relatório com `A ser gerado`, `PENDING` ou `UNKNOWN`;
3. relatório com SHA diferente dos recibos;
4. workflow correcto guardado no nome de ficheiro errado;
5. nome de workflow abreviado ou arbitrário;
6. três recibos do mesmo workflow;
7. `workflow_id` ou `path` ausente;
8. branch diferente de `master`, quando aplicável ao fecho;
9. recibo final consultado antes de `status: completed`;
10. `conclusion` ausente ou diferente de `success`;
11. divergência de `head_sha` entre qualquer par de workflows;
12. `run_attempt` ausente, zero, textual ou inferido;
13. URL incompatível com o repositório ou run ID;
14. artefacto associado a outro workflow ou SHA;
15. `tenant_id` do manifesto diferente do tenant do piloto;
16. suite do verificador existente, mas ausente do comando oficial do runtime.

Adicionar também um teste positivo integral usando três recibos de fixtures claramente marcados como teste, com nomes, caminhos e IDs distintos. Essas fixtures não podem ser apresentadas como prova de CI real.

## Artefacto final obrigatório

O workflow pós-conclusão deve publicar um único artefacto, por exemplo:

```text
aetf-mini-patch-closure-<final_audited_sha>
```

O artefacto deve conter, no mínimo:

```text
workflow-run-ci-readiness.json
workflow-run-evidence-remote.json
workflow-run-final-forensic.json
workflow-jobs-ci-readiness.json
workflow-jobs-evidence-remote.json
workflow-jobs-final-forensic.json
workflow-artifacts-ci-readiness.json
workflow-artifacts-evidence-remote.json
workflow-artifacts-final-forensic.json
final-resolved-report.md
requirement-test-evidence-sha-matrix.json
files.sha256
closure-verification-result.json
```

`files.sha256` deve ser calculado sobre os bytes físicos de todos os restantes ficheiros do artefacto. O verificador deve recomputar os hashes e falhar perante qualquer divergência.

## Execução local obrigatória

Num checkout limpo do commit técnico final:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
npm run verify
git status --short
```

Critérios locais:

- todos os comandos terminam com exit code `0`;
- `npm audit --omit=dev` retorna zero vulnerabilidades;
- os testes de recibos de CI aparecem dentro da saída normal de `npm run verify`;
- as duas execuções de `verify` terminam com árvore limpa;
- nenhum ficheiro temporário ou recibo remoto é escrito em directório versionado;
- nenhum teste é ignorado ou transformado artificialmente em sucesso.

## Execução remota obrigatória

Depois do push do mini-patch:

1. executar a CI principal no SHA final;
2. aguardar a verificação remota;
3. aguardar a atestação forense final;
4. aguardar o workflow técnico pós-conclusão;
5. comprovar que todos terminaram com sucesso;
6. descarregar e verificar o artefacto final de fecho;
7. confirmar que relatório, recibos, jobs, artefactos e matriz indicam o mesmo SHA.

## Critérios de aceitação final

O mini-patch só está concluído quando:

- o relatório final resolvido contém o SHA exacto auditado;
- não permanece nenhum placeholder de SHA no relatório final;
- a suite de recibos integra efectivamente `npm run verify`;
- cada ficheiro de recibo exige o nome e identidade exactos do workflow correspondente;
- os três recibos são obtidos apenas depois da conclusão real dos workflows;
- o verificador rejeita relatório sem SHA, em vez de ignorar a ausência;
- a validação de `tenant_id` do manifesto está restaurada;
- os quatro workflows do novo SHA terminam com sucesso;
- o artefacto final contém os bytes físicos e hashes verificáveis;
- a árvore Git permanece limpa após duas verificações completas;
- não é criado um novo commit documental após a emissão do artefacto final.

## Entregáveis

1. alterações mínimas ao código e aos testes;
2. integração da suite no comando oficial de testes;
3. workflow técnico pós-conclusão;
4. verificador read-only corrigido;
5. validação restaurada do tenant no manifesto;
6. artefacto final de fecho;
7. relatório final resolvido;
8. matriz `Requisito → Teste → Evidência → SHA → Resultado`;
9. lista exacta dos ficheiros alterados e motivo de cada alteração.

## Restrições

- Não criar módulos de negócio.
- Não alterar funcionalidades comerciais.
- Não reutilizar recibos do SHA anterior como prova do novo patch.
- Não fabricar respostas da API, estados, conclusões, URLs, IDs ou timestamps.
- Não aceitar nomes genéricos de workflows.
- Não usar fallbacks para SHA, `run_attempt`, estado ou conclusão.
- Não versionar recibos temporários ou índices que apontem para ficheiros ausentes.
- Não declarar execução de piloto operacional real.
- Não promover o projecto para produção com base neste patch.
- Não criar um novo commit apenas para actualizar a documentação depois da CI.

## Classificação permitida

Antes da conclusão integral:

```text
MINI_PATCH_CLOSURE_IN_PROGRESS — SAME_SHA_REMOTE_EVIDENCE_PENDING — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

Depois de todos os critérios estarem fisicamente comprovados:

```text
MINI_PATCH_CLOSURE_FORENSICALLY_VERIFIED — FINAL_REPORT_AND_FOUR_WORKFLOWS_CONFIRMED_ON_SAME_SHA — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```
