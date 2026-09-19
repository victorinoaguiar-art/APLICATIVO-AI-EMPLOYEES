# Prompt: micro-patch final de endurecimento do verificador forense da CI

## Contexto

A execução anterior foi bem-sucedida e corrigiu os problemas principais. Os quatro workflows terminaram com `status: completed` e `conclusion: success` no mesmo commit:

`3f2746aacd0d1016457cab67b6f1b3041c44f14e`

Não criar novos módulos, relatórios, arquitecturas, cadeias de atestação ou commits exclusivamente documentais. Fazer somente um micro-patch de endurecimento do verificador existente.

## Objectivo

Fechar as quatro lacunas remanescentes para que a verificação seja integralmente *fail-closed*, semanticamente rigorosa e incapaz de passar quando faltarem recibos, associações, estados válidos ou ficheiros no manifesto.

## Correcções obrigatórias

### 1. Tornar obrigatórios os nove recibos físicos

- Activar explicitamente `requireNineFiles: true` no CLI e em todos os pontos de entrada usados pela CI.
- Exigir sempre os três recibos de execução, os três recibos de jobs e os três recibos de artefactos.
- Falhar se qualquer um dos nove ficheiros estiver ausente, vazio, ilegível, malformado ou incompatível com o SHA esperado.
- Não permitir que a ausência conjunta dos seis recibos de jobs e artefactos desactive silenciosamente a validação semântica.

### 2. Tornar obrigatória a associação completa dos artefactos

Em cada recibo de artefactos, exigir e validar:

- `workflow_run.id`;
- `workflow_run.head_sha`;
- `workflow_run.head_branch`;
- `workflow_run.repository_id`;
- `workflow_run.head_repository_id`;
- repositório e proprietário esperados;
- `created_at` e `updated_at` válidos;
- correspondência exacta entre workflow, run ID, SHA, branch, repositório e artefacto esperado.

A ausência de `workflow_run` ou de qualquer campo obrigatório deve terminar com erro. Não condicionar a validação à existência opcional do objecto.

### 3. Validar rigorosamente jobs e steps

- Exigir que cada job material esteja concluído com `status: completed` e `conclusion: success`.
- Exigir o mesmo para todos os steps materiais.
- Rejeitar explicitamente `failure`, `cancelled`, `timed_out`, `action_required`, `stale`, `startup_failure`, `null`, estados desconhecidos ou steps ainda não concluídos.
- Se algum step puder legitimamente ser `skipped`, criar uma lista explícita e mínima baseada no nome ou identificador exacto do step, acompanhada de teste próprio. Não aceitar `skipped` genericamente.
- Falhar perante jobs ou steps ausentes, duplicados ou não relacionados com o workflow esperado.

### 4. Tornar `files.sha256` integral e bidireccional

- Descobrir fisicamente todos os ficheiros que devem integrar o pacote final, aplicando uma regra canónica e determinística de inclusão e exclusão.
- Exigir que cada ficheiro físico esperado tenha exactamente uma entrada em `files.sha256`.
- Exigir que cada entrada do manifesto corresponda a exactamente um ficheiro físico regular.
- Rejeitar entradas duplicadas, caminhos absolutos, travessias `..`, symlinks, ficheiros ausentes, ficheiros adicionais não indexados e hashes divergentes.
- Excluir o próprio `files.sha256` por regra explícita, evitando auto-referência.
- Ordenar o manifesto de forma determinística.

## Testes mínimos obrigatórios

Adicionar testes negativos que comprovem falha quando:

1. qualquer um dos nove recibos é removido;
2. `workflow_run` é removido do recibo de artefactos;
3. qualquer ID de repositório, SHA, branch, run ID ou timestamp diverge;
4. um job ou step apresenta conclusão diferente de `success`;
5. um job ou step material está ausente, duplicado ou incompleto;
6. uma linha válida é removida de `files.sha256`;
7. existe ficheiro físico adicional sem entrada no manifesto;
8. existe entrada sem ficheiro físico correspondente;
9. há duplicação, symlink, caminho absoluto, travessia de directório ou hash incorrecto.

Manter também um teste positivo com os nove recibos completos, associações coerentes e cobertura integral do manifesto.

## Verificação obrigatória

Num checkout limpo do SHA final, executar:

```bash
npm ci
npm audit --omit=dev
npm run verify
git diff --check
git status --short
```

Critérios obrigatórios:

- todos os comandos terminam com exit code `0`;
- `npm audit --omit=dev` não apresenta vulnerabilidades;
- todos os testes positivos e negativos passam;
- `npm run verify` utiliza efectivamente o modo obrigatório dos nove recibos;
- a árvore permanece limpa após a verificação;
- os workflows relevantes são executados no mesmo SHA final e terminam com `completed/success`;
- o artefacto de fecho é publicado e validado pelo verificador endurecido.

## Restrições

- Não criar novos módulos funcionais.
- Não criar nova arquitectura de evidências.
- Não gerar outro relatório de fecho no repositório.
- Não introduzir fallbacks, valores sintéticos, estados presumidos ou tolerância silenciosa.
- Não alterar o SHA esperado dentro de fixtures para fabricar aprovação.
- Não declarar piloto operacional real, prontidão de produção ou conclusão além do que os recibos físicos comprovarem.
- Não criar um commit documental posterior ao commit de código validado.

## Entrega esperada

Entregar somente:

1. o diff do micro-patch;
2. os testes acrescentados ou corrigidos;
3. o SHA final;
4. os IDs e URLs dos workflows executados nesse SHA;
5. o nome, ID e hash do artefacto final;
6. os exit codes dos cinco comandos de verificação;
7. uma declaração curta indicando se os quatro requisitos deste prompt foram comprovados.

## Classificação permitida após aprovação

Somente se todos os critérios forem comprovados no mesmo SHA final:

`FORENSIC_VERIFIER_HARDENING_COMPLETE — NINE_RECEIPTS_REQUIRED — SEMANTIC_JOBS_AND_ARTIFACTS_VALIDATED — HASH_MANIFEST_FULLY_COVERED — CI_GREEN_ON_FINAL_SHA`

Esta classificação comprova o endurecimento do verificador e da cadeia de evidências. Não comprova, por si só, execução operacional real do piloto nem prontidão geral para produção.
