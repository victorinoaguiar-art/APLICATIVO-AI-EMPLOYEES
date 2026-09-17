# Prompt — Micro-Patch Final de SHA, Planos Forenses e Recibos de CI

## Contexto

Repositório: `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

O patch anterior implementou Ajv estrito, comparação entre SQLite, `receipt_json`, ficheiros físicos e manifesto, reforçou a proveniência dos recibos e tornou os testes temporários mais determinísticos. A verificação local passou, mas a auditoria independente identificou quatro lacunas finais.

Este trabalho deve ser um **micro-patch correctivo e estritamente limitado**. Não criar novos módulos funcionais, novos motores, novas funcionalidades comerciais nem novas classificações de produção.

## Objectivo

Eliminar os últimos pontos de ambiguidade forense e produzir uma cadeia verificável em que:

1. nenhum teste aceite um SHA fixo ou inventado;
2. cada plano de verdade exista e seja validado de forma independente;
3. o relatório identifique inequivocamente o SHA final auditado;
4. as declarações sobre GitHub Actions sejam sustentadas por respostas físicas e verificáveis da API para esse mesmo SHA.

## Correcções obrigatórias

### 1. Eliminar o fallback fixo de SHA da suite

- Remover de `pilotStrictAjvSqliteProvenance.test.ts` e de qualquer outro teste ou script todo fallback para um SHA hard-coded, incluindo:

```text
dba1cbdcb0fc25cb44d0da7d26dc995a6729ca7c
```

- Resolver o SHA exclusivamente pela seguinte ordem:
  1. `GITHUB_SHA`, quando executado no GitHub Actions;
  2. `GIT_COMMIT_SHA`, quando explicitamente injectado;
  3. `git rev-parse HEAD`, quando existir um checkout Git válido.
- Validar que o valor obtido contém exactamente 40 caracteres hexadecimais.
- Se nenhuma fonte produzir um SHA válido, terminar imediatamente com erro. Não usar SHA vazio, fictício, anterior ou de exemplo.
- Não permitir que uma variável inválida seja silenciosamente substituída por outra fonte. Se `GITHUB_SHA` ou `GIT_COMMIT_SHA` estiver definida mas for inválida, a execução deve falhar.
- Adicionar testes negativos para:
  - SHA ausente sem checkout Git;
  - `GITHUB_SHA` inválido;
  - `GIT_COMMIT_SHA` inválido;
  - SHA com comprimento diferente de 40;
  - SHA com caracteres não hexadecimais;
  - divergência entre o SHA esperado da execução e o SHA gravado nas evidências.

### 2. Fazer os leitores forenses falharem quando um plano independente estiver ausente

- Tratar como planos de verdade distintos e obrigatórios:
  1. colunas relacionais do SQLite;
  2. `receipt_json` bruto persistido no SQLite;
  3. ficheiro físico exportado;
  4. entrada correspondente no manifesto;
  5. BLOB físico, quando aplicável.
- Os métodos forenses devem devolver os valores brutos realmente persistidos.
- Proibir reconstruções ou preenchimentos como:
  - gerar `receipt_json` a partir das colunas;
  - preencher uma coluna ausente usando `parsedReceipt`;
  - inferir `PASS` a partir de outro campo;
  - substituir hash, versão, tenant, piloto, revisão ou SHA ausente por valores de outro plano.
- Se `receipt_json` estiver ausente, vazio ou inválido, falhar explicitamente.
- Se uma coluna independente obrigatória estiver ausente ou nula, falhar explicitamente.
- Se o ficheiro físico ou a entrada do manifesto não existir, falhar explicitamente.
- Não normalizar diferenças antes da comparação, excepto conversões documentadas e não destrutivas de representação SQLite, como `0/1` para booleano, mantendo também o valor bruto disponível para auditoria.
- Comparar campo a campo, no mínimo:
  - identificadores;
  - tenant e piloto;
  - tarefa e versão documental;
  - `commit_sha`;
  - hashes;
  - revisão e desafio;
  - decisão e estado;
  - destino e canal de entrega;
  - timestamps;
  - tamanho e MIME type, quando aplicável.
- Adicionar testes negativos que removam ou adulterem apenas um plano de cada vez, sem alterar os restantes.

### 3. Ligar o relatório ao SHA final

- Actualizar o relatório para distinguir explicitamente:
  - `base_sha`;
  - `implementation_sha`;
  - `final_audited_sha`.
- `final_audited_sha` deve ser o SHA exacto do código, testes, schemas e workflows efectivamente auditados.
- O relatório não pode declarar como final o SHA do commit anterior.
- Toda métrica, resultado ou recibo citado deve indicar o SHA ao qual pertence.
- Se o relatório precisar de ser alterado depois do commit técnico, não criar uma cadeia infinita de commits documentais. Usar uma das seguintes estratégias:
  - gerar o relatório final como artefacto do workflow ligado ao SHA técnico; ou
  - preparar código e relatório no mesmo commit final antes de executar a CI.
- Não declarar “CI verde”, “GitHub Actions aprovado”, “compatibilidade plena” ou expressão equivalente sem os recibos exigidos no ponto 4.

### 4. Anexar recibos verificáveis dos workflows no mesmo SHA

- Executar no `final_audited_sha` todos os workflows obrigatórios do projecto, incluindo no mínimo:
  1. CI principal;
  2. verificação remota de evidências;
  3. atestação final.
- Preservar as respostas JSON brutas da API do GitHub para cada execução.
- Cada resposta deve comprovar directamente:
  - `id`;
  - `name` ou `workflow_id`;
  - `repository.full_name`;
  - `head_sha`;
  - `event`;
  - `run_attempt`;
  - `status: completed`;
  - `conclusion: success`;
  - `created_at`;
  - `run_started_at`;
  - `updated_at`;
  - `html_url`.
- Preservar também, quando aplicável:
  - resposta da API dos jobs;
  - lista e metadados dos artefactos;
  - hashes SHA-256 dos ficheiros descarregados;
  - relação entre workflow principal, verificação remota e atestação final.
- Criar um verificador read-only que:
  - leia os JSON físicos preservados;
  - rejeite ficheiros ausentes, inválidos ou reconstruídos;
  - exija `status === "completed"`;
  - exija `conclusion === "success"`;
  - exija o mesmo `head_sha` em todos os workflows e no relatório;
  - valide repositório, workflow, run ID e `run_attempt`;
  - confirme que URLs e IDs pertencem às respostas preservadas;
  - valide os hashes dos artefactos físicos;
  - rejeite qualquer fallback `success`, `PASS`, `run_attempt || 1` ou valor equivalente.
- Os recibos devem ser produzidos como artefactos não versionados da execução, preferencialmente em `.artifacts/evidence/`. Não versionar índices que apontem para ficheiros ausentes.

## Testes mínimos obrigatórios

Adicionar ou actualizar testes que comprovem:

1. ausência total de SHA hard-coded no caminho de execução e teste;
2. falha perante variável de SHA presente mas inválida;
3. falha quando `receipt_json` está ausente, vazio ou corrompido;
4. falha quando uma coluna obrigatória está ausente ou nula;
5. falha quando o leitor tenta depender de outro plano para preencher um valor;
6. falha perante ficheiro físico ausente;
7. falha perante entrada de manifesto ausente;
8. falha perante BLOB ausente ou hash divergente;
9. falha quando qualquer workflow pertence a outro SHA;
10. falha quando uma resposta remota não está concluída ou não teve sucesso;
11. falha quando `run_attempt`, repositório, workflow, ID ou URL está ausente;
12. sucesso apenas quando todos os planos e os três workflows são coerentes com o mesmo SHA.

Os testes devem alterar um elemento de cada vez e provar que a cadeia falha de modo fechado.

## Comandos de verificação

Executar num checkout limpo do SHA final:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
npm run verify
git status --short
```

Resultados obrigatórios:

- todos os comandos com exit code `0`;
- `npm audit --omit=dev` com zero vulnerabilidades;
- as duas execuções de `npm run verify` aprovadas;
- árvore Git limpa depois de cada execução;
- nenhum teste ignorado, silenciado ou convertido artificialmente em sucesso;
- nenhum recibo temporário escrito em directório versionado.

Depois, executar os três workflows no GitHub e validar os respectivos recibos físicos no mesmo `final_audited_sha`.

## Critérios de aceitação

O patch só pode ser declarado concluído quando:

- não existir fallback fixo ou fictício de SHA;
- cada leitor forense exigir todos os planos independentes aplicáveis;
- nenhuma ausência for disfarçada por reconstrução, inferência ou fallback;
- relatório, evidências e workflows indicarem exactamente o mesmo SHA final;
- os três workflows estiverem fisicamente comprovados como `completed/success`;
- os recibos remotos forem validados a partir dos seus bytes preservados;
- `npm run verify` passar duas vezes num checkout limpo, deixando a árvore limpa;
- o relatório final descrever apenas resultados efectivamente comprovados.

## Entregáveis

1. código e testes do micro-patch;
2. schemas corrigidos, apenas se necessário;
3. verificador read-only dos recibos dos workflows;
4. recibos JSON brutos da API e respectivos hashes, como artefactos da CI;
5. relatório final ligado ao `final_audited_sha`;
6. matriz curta `Requisito → Teste → Evidência → SHA → Resultado`;
7. lista exacta dos ficheiros alterados e justificação de cada alteração.

## Restrições

- Não criar módulos funcionais novos.
- Não alterar métricas comerciais nem classificações operacionais fora deste escopo.
- Não usar fixtures como prova de execução remota real.
- Não fabricar recibos, timestamps, URLs, IDs, estados ou conclusões.
- Não introduzir novos fallbacks.
- Não declarar piloto real executado.
- Não promover a classificação de produção.
- Não criar um commit documental posterior que torne o SHA declarado novamente obsoleto.

## Classificação permitida antes da conclusão

Enquanto qualquer critério acima estiver pendente, utilizar apenas:

```text
MICRO_PATCH_LOCALLY_VERIFIED — REMOTE_CI_AND_FINAL_SHA_EVIDENCE_PENDING — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```

Após conclusão integral e comprovação física dos três workflows no mesmo SHA, pode utilizar:

```text
MICRO_PATCH_FORENSICALLY_VERIFIED — SAME_SHA_LOCAL_AND_REMOTE_EVIDENCE_CONFIRMED — REAL_OPERATIONAL_PILOT_NOT_EXECUTED
```
