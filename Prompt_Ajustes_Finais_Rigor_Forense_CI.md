# Prompt — Pequenos Ajustes Finais de Rigor Forense da CI

## Contexto

- **Repositório:** `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`
- **SHA actualmente auditado:** `287343975ab258d7ba535577c00735572c86cb1d`
- **Estado comprovado:** os quatro workflows do mini-patch terminaram com `status: completed` e `conclusion: success` no mesmo SHA.
- **Limite do trabalho:** micro-patch estritamente forense. Não criar módulos funcionais, novas funcionalidades de negócio ou outra cadeia de commits documentais.

## Objectivo

Corrigir somente quatro detalhes finais:

1. eliminar o fallback de `run_attempt`;
2. impedir que o workflow pós-conclusão declare antecipadamente o próprio sucesso;
3. validar semanticamente os recibos físicos de jobs e artefactos;
4. marcar o relatório histórico versionado como substituído pelo relatório final resolvido.

## 1. Eliminar integralmente o fallback de `run_attempt`

Em `scripts/generate-resolved-report.mjs`, remover padrões equivalentes a:

```javascript
Number(closureRunAttempt) || 1
```

Implementar validação fail-closed:

- `closureRunAttempt` deve existir;
- deve ser um valor numérico integral;
- deve ser maior ou igual a `1`;
- não pode ser uma string vazia, `null`, `undefined`, zero, negativo, decimal ou texto não numérico;
- não pode ser substituído por `1` ou por qualquer outro valor presumido.

Aplicar a mesma regra a todos os `run_attempt` lidos ou gerados neste fluxo.

Adicionar testes negativos para:

- valor ausente;
- string vazia;
- zero;
- número negativo;
- decimal;
- texto não numérico;
- `NaN`;
- fallback explícito ou implícito.

Adicionar um teste positivo com um valor real inteiro maior ou igual a `1`.

## 2. Corrigir a declaração prematura do quarto workflow

O workflow `Post Closure Verification & Forensic Packaging` não pode declarar, dentro do artefacto que está a gerar, que ele próprio já terminou com sucesso.

Durante a sua execução, o relatório e o recibo devem usar uma classificação verdadeira, por exemplo:

```text
THREE_PRECEDING_WORKFLOWS_VERIFIED — POST_CLOSURE_PACKAGING_EXECUTING_ON_SAME_SHA — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

O relatório preservado no artefacto deve afirmar apenas que:

- os três workflows anteriores foram fisicamente verificados;
- o workflow pós-conclusão está a executar o empacotamento no mesmo SHA;
- o resultado definitivo do quarto workflow deve ser confirmado externamente pela resposta da API após a conclusão.

Não criar um quinto workflow apenas para atestar o quarto. Isso iniciaria outra cadeia sem fim.

Depois da conclusão, a classificação externa defensável pode ser:

```text
MINI_PATCH_CLOSURE_OPERATIONALLY_COMPLETED — FOUR_GITHUB_WORKFLOWS_CONFIRMED_SUCCESS_ON_SAME_SHA — FINAL_CLOSURE_ARTIFACT_PUBLISHED — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

Esta classificação externa não deve ser pré-gravada como facto consumado dentro do próprio workflow ainda em execução.

### Conteúdo do registo do quarto workflow

No `closure-verification-result.json`, o objecto `post_closure` deve conter somente factos conhecidos naquele momento:

- `id`;
- `run_attempt` validado sem fallback;
- `head_sha`;
- `repository`;
- `workflow_name`;
- `workflow_path`;
- `url`;
- `state_at_artifact_generation: "IN_PROGRESS"` ou designação semanticamente equivalente.

Não gravar `status: completed` nem `conclusion: success` antes de esses valores existirem numa resposta física pós-conclusão.

## 3. Validar semanticamente jobs e artefactos

O processo já preserva nove respostas físicas:

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
```

Expandir o verificador read-only para validar também os seis ficheiros de jobs e artefactos.

### 3.1 Validação obrigatória dos jobs

Para cada resposta de jobs:

- o ficheiro deve existir e conter JSON válido;
- `total_count` deve corresponder ao número físico de elementos em `jobs`;
- deve existir pelo menos um job;
- cada job deve ter ID inteiro positivo e único;
- `status` deve ser exactamente `completed`;
- `conclusion` deve ser exactamente `success`;
- `started_at` e `completed_at` devem ser timestamps válidos;
- `completed_at` não pode ser anterior a `started_at`;
- cada job deve pertencer ao run ID esperado, quando esse campo estiver disponível;
- todos os passos materiais devem terminar com sucesso;
- passos omitidos, cancelados, ignorados ou com conclusão nula devem ser tratados de forma explícita, nunca convertidos silenciosamente em sucesso.

Validar os nomes mínimos esperados:

| Workflow | Jobs obrigatórios |
|---|---|
| CI principal | `Clean Checkout Local Verification (22.x)` e `Deterministic Build, Typecheck, Test & Audit (22.x)` |
| Evidence Remote | `Remote Evidence Verification Gate` |
| Final Forensic | `Final Forensic Attestation Gate` |

### 3.2 Validação obrigatória dos artefactos

Para cada resposta de artefactos:

- o ficheiro deve existir e conter JSON válido;
- `total_count` deve corresponder ao número de elementos em `artifacts`;
- cada artefacto deve possuir ID inteiro positivo e único;
- `name` deve corresponder ao padrão exacto esperado;
- `expired` deve ser `false`;
- `size_in_bytes` deve ser inteiro positivo;
- `workflow_run.id` deve coincidir com o run correspondente;
- `workflow_run.head_sha` deve coincidir com o SHA final auditado;
- `workflow_run.head_branch` deve ser `master`;
- `repository_id` e `head_repository_id` devem estar presentes e ser coerentes;
- datas de criação e actualização devem ser válidas.

Exigir, no mínimo:

| Workflow | Artefacto obrigatório |
|---|---|
| CI principal | `aetf-evidence-bundle-<SHA>` |
| Evidence Remote | `aetf-verified-remote-evidence-bundle-<SHA>` |
| Final Forensic | `aetf-final-attestation-<SHA>` |

Outros artefactos podem existir, mas não podem substituir os obrigatórios.

### 3.3 Coerência cruzada

O verificador deve comparar, sem fallbacks:

- run ID do recibo principal com jobs e artefactos;
- SHA dos três runs com os artefactos;
- branch e repositório;
- identidade exacta do workflow;
- nomes dos artefactos com o SHA;
- contagens declaradas com os arrays físicos;
- hashes constantes em `files.sha256` com os bytes físicos de todos os ficheiros preservados.

O resultado só pode ser `verified: true` se runs, jobs, artefactos, relatório e manifesto de hashes forem integralmente coerentes.

## 4. Corrigir a posição do relatório histórico

O ficheiro versionado:

```text
AETF500_Relatorio_Micro_Patch_Estrito_SQLite_Proveniencia_Limpeza.md
```

continua ligado ao SHA anterior `fdae2af81c3fa106d489e91080b08bc67832d8b0`. Não substituir esse SHA pelo SHA do novo commit, pois isso criaria novamente uma referência obsoleta.

Adicionar apenas uma nota estática no início do documento:

```text
STATUS: SUPERSEDED_BY_POST_CLOSURE_ARTIFACT

Este relatório documenta o micro-patch anterior e não constitui a atestação final do SHA actualmente auditado. A fonte autoritativa de fecho é o artefacto `aetf-mini-patch-closure-<final_audited_sha>`, produzido pelo workflow `Post Closure Verification & Forensic Packaging`.
```

Não declarar neste documento o SHA do novo commit de fecho.

O modelo `templates/AETF500_Relatorio_Fecho_Template.md` deve continuar a ser a fonte usada para gerar dinamicamente o relatório do SHA corrente.

## 5. Integridade de `files.sha256`

Garantir que `files.sha256` cobre todos os ficheiros finais do artefacto, excepto o próprio `files.sha256`.

Evitar uma cópia incorporada do manifesto que fique desactualizada dentro de `final-resolved-report.md` após a recomputação do hash desse relatório.

Escolher uma destas soluções:

1. o relatório apenas referencia `files.sha256` como ficheiro externo autoritativo; ou
2. a cópia incorporada exclui explicitamente o hash do próprio relatório e explica essa limitação.

O artefacto final deve passar:

```bash
sha256sum -c files.sha256
```

sem entradas antigas, circulares ou divergentes.

## 6. Testes obrigatórios

Adicionar testes negativos que comprovem falha perante:

1. `run_attempt` ausente ou inválido;
2. declaração antecipada de `completed/success` para o workflow corrente;
3. ficheiro de jobs ausente;
4. `total_count` de jobs divergente;
5. job falhado, cancelado ou ainda em execução;
6. job obrigatório ausente;
7. ficheiro de artefactos ausente;
8. artefacto obrigatório ausente;
9. artefacto expirado;
10. artefacto com zero bytes;
11. artefacto associado a outro run ID;
12. artefacto associado a outro SHA ou branch;
13. nome de artefacto com SHA diferente;
14. hash físico divergente de `files.sha256`;
15. relatório histórico sem a marca `SUPERSEDED_BY_POST_CLOSURE_ARTIFACT`;
16. relatório final que declare prematuramente o sucesso do quarto workflow.

Adicionar um teste positivo integral em directório temporário, usando fixtures identificadas como teste. As fixtures nunca podem ser apresentadas como recibos reais.

## 7. Execução obrigatória

Num checkout limpo do novo SHA:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
npm run verify
git status --short
```

Depois do push:

1. confirmar a CI principal;
2. confirmar Evidence Remote Verification;
3. confirmar Final Forensic Attestation;
4. confirmar Post Closure Verification;
5. confirmar que os quatro usam o mesmo SHA;
6. confirmar a publicação do novo artefacto de fecho;
7. verificar os bytes e hashes do artefacto.

## 8. Critérios de aceitação

O ajuste final só está concluído quando:

- não existir `run_attempt || 1` nem equivalente;
- o quarto workflow não declarar antecipadamente o próprio sucesso;
- jobs e artefactos forem validados semanticamente, não apenas preservados e incluídos no manifesto de hashes;
- o relatório histórico estiver marcado como substituído;
- `files.sha256` cobrir os bytes finais sem inconsistência circular;
- todos os novos testes estiverem integrados no `npm run verify`;
- `npm run verify` passar duas vezes com árvore limpa;
- os quatro workflows do novo SHA terminarem com sucesso;
- nenhum novo commit documental posterior tornar o SHA novamente obsoleto.

## 9. Entregáveis

1. alterações mínimas ao gerador do relatório;
2. verificador expandido para jobs e artefactos;
3. testes positivos e negativos;
4. relatório histórico marcado como substituído;
5. artefacto final de fecho;
6. matriz actualizada `Requisito → Teste → Evidência → SHA → Resultado`;
7. lista exacta dos ficheiros alterados e justificação.

## 10. Restrições

- Não criar módulos funcionais.
- Não criar um quinto workflow de atestação.
- Não fabricar recibos ou conclusões.
- Não usar valores fallback.
- Não reutilizar recibos do SHA anterior como prova do novo SHA.
- Não versionar os recibos temporários.
- Não criar um commit posterior apenas para actualizar o SHA no relatório.
- Não declarar piloto operacional real executado.
- Não promover a aplicação para produção com base neste ajuste.

## Classificação permitida

Antes da conclusão:

```text
FINAL_FORENSIC_ADJUSTMENTS_IN_PROGRESS — NEW_SAME_SHA_REMOTE_EVIDENCE_PENDING — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

Após conclusão e confirmação externa dos quatro workflows:

```text
FINAL_FORENSIC_ADJUSTMENTS_COMPLETED — FOUR_GITHUB_WORKFLOWS_EXTERNALLY_CONFIRMED_SUCCESS_ON_SAME_SHA — CLOSURE_ARTIFACT_VERIFIED — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```
