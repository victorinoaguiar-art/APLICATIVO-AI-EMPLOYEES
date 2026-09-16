# Prompt — Micro-Patch de Fecho Forense da CI e Protecção do Branch

## Papel

Actue como engenheiro sénior de software, segurança, GitHub Actions e auditoria forense. Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Analise o `master` e implemente somente as correcções indicadas neste prompt. Não criar módulos funcionais, motores, integrações externas, catálogos ou novas funcionalidades de negócio.

## Estado inicial confirmado

O estado anteriormente auditado foi:

- SHA: `f7623ae19cc33390045c633fe1d71daad5e4f249`;
- CI principal: `35117991094`, conclusão `success`;
- verificação remota: `35118294581`, conclusão `success`;
- `npm ci`: exit code `0`;
- `npm audit --omit=dev`: zero vulnerabilidades;
- `npm run verify`: exit code `0`;
- 422 testes aprovados, sem falhas, ignorados ou cancelados.

O patch anterior resolveu a maior parte dos problemas de CI, protecção do branch, caminhos e evidências. Este novo patch deve ser pequeno e corrigir apenas as lacunas forenses remanescentes.

## Objectivo

Fechar a diferença entre:

1. dados apenas declarados nos recibos;
2. dados realmente derivados da resposta física da API;
3. condições efectivamente obrigatórias para a classificação `PATCH_VERIFIED_AND_CI_ENFORCED`.

## Correcções obrigatórias

### 1. Tornar `response_sha256` obrigatório

No modo remoto, o gate deve falhar quando `branch-protection.json` não contiver um `response_sha256` válido.

Exigir que:

- o campo exista;
- seja uma string hexadecimal SHA-256 com exactamente 64 caracteres;
- corresponda aos bytes físicos de `branch-protection-api-response.json`;
- seja recalculado depois de qualquer enriquecimento ou alteração remota.

Não manter lógica opcional como:

```js
if (bpData.response_sha256 && computedSha !== bpData.response_sha256)
```

O campo ausente, vazio, malformado ou divergente deve produzir falha.

### 2. Exigir origem verificável da resposta de branch protection

Não aceitar validação condicional baseada num campo `url` opcional.

O gate deve confirmar obrigatoriamente:

- repositório exacto;
- branch exacto;
- endpoint exacto consultado;
- origem `GITHUB_REST_API`;
- data e hora da consulta;
- actor ou identidade técnica da consulta;
- SHA auditado ao qual o recibo se refere.

Validar pelo menos estes campos de `branch-protection.json`:

```text
repository
branch
source
api_endpoint
queried_at
query_actor
source_sha
http_status
branch_protection_status
response_sha256
```

O repositório, branch, endpoint ou SHA ausente ou divergente deve bloquear o gate remoto.

Se a resposta bruta da API não incluir uma URL de origem, não inventar uma. A origem deve ser comprovada pelo recibo da consulta, pelo comando fixo executado e pelos metadados verificáveis da execução.

### 3. Recalcular todos os campos derivados a partir da resposta bruta

Durante a verificação, extrair novamente de `branch-protection-api-response.json`:

- checks obrigatórios;
- modo estrito de actualização;
- exigência de pull request;
- número mínimo de aprovações;
- descarte de aprovações antigas;
- revisão de proprietários do código;
- aplicação aos administradores;
- force-push permitido ou bloqueado;
- eliminação do branch permitida ou bloqueada;
- exigência de resolução de conversas.

Comparar os valores recalculados com os campos resumidos de `branch-protection.json`.

Qualquer divergência deve produzir um erro determinístico, por exemplo:

```text
BRANCH_PROTECTION_RECEIPT_MISMATCH
```

Não confiar nos campos resumidos sem os confrontar com a resposta física.

### 4. Transformar as regras declaradas em condições bloqueantes

Para permitir `PATCH_VERIFIED_AND_CI_ENFORCED`, exigir:

- `branch_protection_status === "CONFIGURED"`;
- `http_status === 200`;
- pull request obrigatório;
- pelo menos uma aprovação obrigatória;
- checks obrigatórios em modo estrito, quando esta for a política declarada;
- force-push bloqueado;
- eliminação do branch bloqueada;
- os dois checks pré-merge esperados presentes com nomes exactos.

Checks esperados:

```text
Clean Checkout Local Verification (22.x)
Deterministic Build, Typecheck, Test & Audit (22.x)
```

Registar separadamente:

```text
REQUIRED_PRE_MERGE_CHECKS
POST_CI_REMOTE_EVIDENCE_GATE
```

Não apresentar o workflow baseado em `workflow_run` como check pré-merge se ele apenas executar depois da CI principal.

### 5. Derivar passos ignorados dos jobs reais

Não depender apenas de um campo declarativo `skipped_required_steps` inserido manualmente.

O sincronizador deve analisar fisicamente:

```text
receipt.jobs[].steps[]
```

Para cada job obrigatório, verificar:

- nome exacto;
- conclusão do job;
- presença dos passos obrigatórios;
- conclusão de cada passo obrigatório;
- inexistência de `skipped`, `cancelled`, `failure` ou estado vazio.

O sincronizador deve gerar `skipped_required_steps` a partir dos dados reais. O verificador deve igualmente inspeccionar os jobs e passos, sem confiar apenas nesse resumo.

Um job verde não deve ocultar um passo obrigatório ignorado.

### 6. Resolver o bypass dos administradores

Aplicar uma das duas opções abaixo, sem mascarar a situação.

#### Opção preferida

Activar a aplicação das regras de protecção aos administradores:

```text
enforce_admins: true
```

Confirmar a alteração pela API oficial e exigir esse valor no gate.

#### Opção alternativa

Se não for possível activar tecnicamente `enforce_admins`, o gate e o relatório devem usar uma classificação limitada:

```text
PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS
```

Não permitir `PATCH_VERIFIED_AND_CI_ENFORCED` sem ressalvas quando `enforce_admins` for `false`.

Uma frase justificativa no recibo não substitui o controlo técnico.

### 7. Corrigir o relatório técnico

Actualizar `AETF500_Relatorio_Correccao_Final_Evidencias_CI.md` para:

- remover qualquer ligação `file:///c:/Users/...`;
- usar caminhos relativos do GitHub;
- distinguir SHA inicial, SHA técnico e SHA final;
- registar as execuções da CI correspondentes ao mesmo SHA;
- indicar o estado real de `enforce_admins`;
- indicar as regras efectivamente obrigatórias;
- distinguir checks pré-merge do workflow remoto posterior;
- não afirmar que um campo foi validado se apenas foi registado;
- não declarar prontidão de produção.

## Testes negativos obrigatórios

Adicionar testes que comprovem falha quando:

1. `response_sha256` está ausente;
2. `response_sha256` está vazio;
3. `response_sha256` está malformado;
4. o hash não corresponde à resposta física;
5. `repository` está ausente ou divergente;
6. `branch` está ausente ou divergente;
7. `api_endpoint` está ausente ou divergente;
8. `source_sha` diverge do SHA auditado;
9. um campo resumido diverge da resposta bruta;
10. o número de aprovações é zero;
11. o modo estrito exigido está desactivado;
12. um job obrigatório está ausente;
13. um passo obrigatório está ausente;
14. um passo obrigatório está `skipped`;
15. um passo obrigatório está `cancelled` ou `failure`;
16. `enforce_admins` é falso, mas o relatório tenta atribuir classificação sem ressalvas;
17. existe uma ligação local `file:///` no relatório final.

Os testes devem manipular os ficheiros físicos temporários e recalcular o índice quando necessário. Não usar testes que apenas examinem strings sem executar o verificador real.

## Restrições

- Não criar outro grande módulo.
- Não alterar funcionalidades comerciais ou de negócio.
- Não adicionar integração AGT.
- Não adicionar chaves, tokens ou respostas privadas ao Git.
- Não versionar `.artifacts/` ou logs temporários.
- Não usar mocks como prova de configuração real do GitHub.
- Não usar `|| true` para esconder falhas.
- Não ignorar testes nem reduzir cobertura.
- Não editar recibos manualmente para obter `PASS`.
- Não declarar produção pronta.
- Não alterar os 500 empregados, conhecimentos, pagamentos ou autenticação fora do necessário para este patch.

## Execução obrigatória

1. Registar o SHA inicial e confirmar árvore limpa.
2. Implementar somente estas sete correcções.
3. Executar num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
```

4. Confirmar exit code `0` e zero testes ignorados ou cancelados.
5. Fazer commit do patch técnico.
6. Executar a CI principal nesse SHA.
7. Executar o workflow remoto correspondente ao mesmo SHA.
8. Consultar a protecção do branch pela API oficial.
9. Regenerar `.artifacts/evidence/`.
10. Verificar os hashes físicos depois do enriquecimento remoto.
11. Confirmar que a árvore Git permanece limpa.
12. Actualizar o relatório somente com IDs, URLs, SHAs e conclusões reais.
13. Se houver novo commit apenas para o relatório, executar novamente a CI nesse SHA ou explicar claramente a separação entre SHA técnico e documental.

## Critérios de aceitação

O patch só está concluído quando:

- `npm ci` passar num checkout limpo;
- `npm audit --omit=dev` terminar com exit code `0`;
- `npm run verify` terminar com exit code `0`;
- todos os testes passarem sem ignorados ou cancelados;
- o hash da resposta da API for obrigatório e válido;
- origem, repositório, branch, endpoint e SHA forem obrigatórios;
- todos os campos resumidos forem derivados e confrontados com a resposta bruta;
- aprovações, modo estrito e demais regras declaradas forem realmente verificadas;
- jobs e passos obrigatórios forem inspeccionados fisicamente;
- o estado de `enforce_admins` controlar a classificação final;
- a CI principal e a verificação remota estiverem verdes no mesmo SHA;
- o relatório não contiver ligações locais ou afirmações superiores às evidências;
- nenhuma evidência temporária estiver versionada.

## Classificação permitida

Usar somente uma destas classificações:

- `PATCH_FAILED`;
- `PATCH_VERIFIED_LOCALLY`;
- `PATCH_VERIFIED_AND_CI_GREEN`;
- `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`;
- `PATCH_VERIFIED_AND_CI_ENFORCED`.

`PATCH_VERIFIED_AND_CI_ENFORCED` só é permitido quando todas as regras, checks, jobs e passos estiverem comprovados e `enforce_admins === true`.

## Entregáveis

Entregar:

1. código corrigido;
2. testes positivos e negativos;
3. workflows actualizados, se necessário;
4. evidências não versionadas em `.artifacts/evidence/`;
5. relatório final corrigido;
6. matriz `Requisito → Implementação → Teste → Evidência`;
7. lista de ficheiros alterados;
8. SHA final;
9. IDs e URLs das execuções reais;
10. classificação final tecnicamente defensável;
11. lista explícita do que permanece pendente ou fora de escopo.
