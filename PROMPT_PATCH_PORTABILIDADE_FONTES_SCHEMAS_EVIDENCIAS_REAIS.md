# PROMPT DE EXECUÇÃO
## AETF-500 — Patch curto de portabilidade, fontes canónicas, schemas e evidências reais

Actue como engenheiro sénior de software, auditor técnico e especialista em Node.js, TypeScript, Ajv, Next.js, testes multiplataforma e GitHub Actions.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Commit de referência auditado:

`40c46c42b90fe4c3c37a66cc57e140653e906e34`

## 1. Missão

Executar um patch correctivo pequeno, limitado e reproduzível para resolver exclusivamente os dez pontos definidos neste documento.

Não criar:

- novos módulos;
- novas engines;
- novos employees;
- novas funcionalidades comerciais;
- novos dashboards;
- novas camadas de arquitectura;
- novos manifestos de certificação;
- novos números de produção sem evidência física.

O objectivo é corrigir portabilidade, fontes canónicas, schemas, geração de evidências, relatório técnico e CI.

## 2. Regras inegociáveis

- Não inventar testes, execuções, hashes, recibos ou resultados.
- Não alterar expectativas apenas para fazer uma falha desaparecer.
- Não ignorar testes.
- Não remover gates existentes.
- Não usar números hard-coded como resultado de execução.
- Não utilizar fixtures como prova de produção.
- Não transformar ausência de evidência em sucesso.
- Não declarar CI verde sem consultar a execução real do GitHub.
- Não fazer alterações funcionais fora deste escopo.
- Preservar o histórico das divergências encontradas.

## 3. Estado inicial que deve ser reproduzido

Antes de alterar qualquer ficheiro:

1. Criar um checkout limpo do branch principal.
2. Confirmar e registar:
   - repositório;
   - branch;
   - SHA inicial completo;
   - data e hora UTC;
   - sistema operativo;
   - versão do Node.js;
   - versão do npm.
3. Executar sequencialmente:

```bash
git status --short
node --version
npm --version
npm ci
npm audit --omit=dev
npm run verify
```

4. Guardar os outputs e códigos de saída.
5. Confirmar a falha actual do teste:

```text
Caminhos suportam separadores Linux e Windows sem alterar hashing
```

6. Confirmar se o resultado reproduzido é:

```text
Runtime tests: 355
Passed: 354
Failed: 1
npm run verify: exit code 1
```

Se o resultado for diferente, documentar a diferença antes de continuar.

## 4. Escopo obrigatório

### P1 — Corrigir o teste multiplataforma

Corrigir o teste que actualmente transforma um caminho Linux real num caminho com barras invertidas e espera que continue fisicamente acessível no Linux.

Esse comportamento não representa portabilidade real.

Utilizar adequadamente:

```js
path.posix
path.win32
```

O teste deve verificar separadamente:

1. construção de caminhos POSIX;
2. construção de caminhos Windows;
3. normalização lógica de caminhos;
4. resolução da raiz do repositório;
5. independência relativamente ao directório de execução;
6. utilização das APIs de caminho do Node.js;
7. inexistência de caminhos absolutos hard-coded.

Não exigir que um caminho Windows seja fisicamente aberto num executor Linux nem que um caminho POSIX seja fisicamente aberto num executor Windows.

Quando for necessário testar leitura física, utilizar um caminho válido para o sistema operativo que executa o teste.

O mesmo código deve passar:

- localmente em Linux;
- localmente em Windows;
- no GitHub Actions com Ubuntu;
- no GitHub Actions com Windows, caso seja criada uma matriz mínima de portabilidade.

Não remover o teste. Corrigir a sua semântica.

### P2 — Fazer `npm run verify` passar legitimamente

Depois da correcção, executar:

```bash
npm run verify
```

O comando deve terminar com:

```text
exit code 0
```

Requisitos:

- zero testes falhados;
- nenhum teste ignorado para esconder falhas;
- nenhuma etapa removida;
- nenhuma utilização de `|| true`;
- nenhuma utilização de `continue-on-error`;
- nenhuma redução artificial da cobertura;
- nenhum resultado inserido manualmente.

Confirmar que `verify` continua a executar:

1. limpeza;
2. typecheck;
3. build dos pacotes;
4. build web;
5. lint;
6. todas as suites de testes;
7. validação dos manifestos;
8. validação de hashes;
9. verificações de segurança;
10. pagamentos;
11. autenticação e autorização.

### P3 — Remover contagens hard-coded

Remover do gerador de evidências qualquer estrutura estática semelhante a:

```js
total_tests: 388,
passed_tests: 388,
failed_tests: 0,
exit_code: 0
```

Eliminar também contagens fixas por pacote, suite ou workspace.

Nenhum recibo pode presumir antecipadamente:

- quantidade de testes;
- quantidade de testes aprovados;
- quantidade de falhas;
- código de saída;
- classificação final;
- estado da CI.

Os dados devem ser derivados das execuções reais.

Adicionar um teste que falhe se o gerador voltar a conter contagens de testes codificadas manualmente.

### P4 — Gerar o resumo a partir dos testes reais

Implementar uma recolha determinística dos resultados reais.

Preferir um destes métodos:

1. reporter estruturado do `node:test`;
2. ficheiro JSON produzido directamente pelo test runner;
3. wrapper que execute cada suite, capture o código de saída e interprete uma saída estruturada;
4. outro mecanismo equivalente, desde que não dependa de texto informal ou números declarados manualmente.

O resumo deve conter:

```json
{
  "commit_sha": "SHA_REAL",
  "command": "npm test",
  "started_at": "ISO-8601",
  "completed_at": "ISO-8601",
  "exit_code": 0,
  "total_tests": 0,
  "passed_tests": 0,
  "failed_tests": 0,
  "skipped_tests": 0,
  "cancelled_tests": 0,
  "todo_tests": 0,
  "breakdown": []
}
```

Todos os valores numéricos devem ser calculados a partir da execução.

O gerador deve falhar se:

- não conseguir interpretar o resultado;
- uma suite não for executada;
- houver divergência entre o exit code e as contagens;
- o SHA não corresponder ao checkout;
- existir teste falhado, cancelado ou inesperadamente ignorado.

Não gerar um recibo de sucesso quando a execução falhar.

### P5 — Escolher uma única convenção para as fontes canónicas

Actualmente existem duas variantes de cada fonte:

```text
data/liveTasks.json
data/live_tasks.json

data/legalContracts.json
data/legal_contracts.json

data/externalAudits.json
data/external_audits.json
```

Escolher apenas uma convenção.

Recomendação:

```text
data/liveTasks.json
data/legalContracts.json
data/externalAudits.json
```

Antes de remover as cópias:

1. comparar os hashes;
2. confirmar que o conteúdo é idêntico;
3. procurar todas as referências no código;
4. actualizar os consumidores;
5. executar os testes.

Eliminar as três cópias redundantes.

Adicionar uma verificação que falhe se uma fonte alternativa voltar a ser criada.

Cada domínio deve possuir uma única fonte física autoritativa.

### P6 — Remover o fallback silencioso de nomes

Remover de `resolveDeterministicPath()` qualquer procura automática entre nomes `camelCase` e `snake_case`.

Exemplo de comportamento proibido:

```js
if (camelCase não existe) usar snake_case;
if (snake_case não existe) usar camelCase;
```

O caminho solicitado deve ser exactamente o caminho validado.

Se a fonte esperada não existir, retornar:

```text
SOURCE_NOT_FOUND
```

Não procurar uma fonte alternativa silenciosamente.

A resolução determinística deve:

- resolver caminhos relativos a partir da raiz real do repositório;
- preservar caminhos absolutos válidos;
- não substituir nomes;
- não escolher fontes por aproximação;
- não depender de `process.cwd()`.

Adicionar testes negativos para garantir que um nome alternativo não é aceite.

### P7 — Fortalecer os schemas Ajv

Reforçar:

```text
schemas/data/liveTasks.schema.json
schemas/data/legalContracts.schema.json
schemas/data/externalAudits.schema.json
```

#### Regras comuns

Aplicar:

```json
{
  "additionalProperties": false
}
```

no documento raiz, nos metadados e nos registos, salvo justificação técnica explícita.

Adicionar:

- `minLength` para identificadores;
- `format: "date-time"` para datas;
- padrões para hashes SHA-256;
- enums para estados e categorias;
- limites mínimos e máximos coerentes;
- unicidade dos itens quando aplicável;
- proveniência obrigatória;
- versão do schema;
- identificador da fonte;
- data da recolha;
- origem;
- estado de verificação.

O campo `$schema` dos dados deve aceitar apenas o identificador previsto para o domínio correspondente.

#### Tarefas reais

Uma tarefa considerada real deve exigir, no mínimo:

- `task_id`;
- identificador do tenant;
- data de execução;
- origem;
- confirmação externa verificável;
- estado;
- flags explícitas de teste e demonstração.

Não contar tarefas apenas porque possuem `task_id`.

#### Contratos

Um contrato considerado legalmente autorizado deve exigir:

- `tenant_id`;
- estado permitido;
- tipo de autorização;
- data efectiva;
- signatário;
- hash SHA-256 do documento físico;
- referência de proveniência;
- confirmação de que não é demonstração.

Registos de demonstração não devem exigir documentação jurídica inexistente, mas devem ser claramente separados e nunca contabilizados como autorização real.

#### Auditorias externas

Uma auditoria elegível deve exigir:

- `audit_id`;
- auditor independente;
- organização auditora;
- data;
- escopo;
- veredicto;
- assinatura ou hash documental;
- indicação explícita de que não é recibo interno;
- proveniência verificável.

Um recibo interno nunca pode ser contado como certificação externa.

#### Testes negativos dos schemas

Adicionar testes para rejeitar:

- propriedades inesperadas;
- datas inválidas;
- hashes malformados;
- estados desconhecidos;
- strings vazias;
- registos sem proveniência;
- demonstrações apresentadas como produção;
- recibos internos apresentados como auditorias externas.

### P8 — Remover associações não comprovadas com empresas reais

Rever os registos que utilizam nomes como:

- Angola Telecom;
- Banco Angolano de Investimentos;
- Sonangol Logística;
- qualquer outra entidade real.

Se existir autorização física válida:

1. indicar a referência documental;
2. guardar apenas os metadados permitidos;
3. registar a proveniência;
4. preservar os limites de confidencialidade;
5. não publicar dados sensíveis.

Se não existir autorização comprovável, substituir por nomes inequivocamente fictícios, por exemplo:

```text
Empresa Demonstração Alfa
Empresa Demonstração Beta
Empresa Demonstração Gama
```

Adicionar uma indicação explícita:

```json
{
  "fictional_entity": true,
  "authorization_type": "DEMONSTRATION",
  "is_pilot_demonstration": true
}
```

Nenhuma empresa real deve aparecer como cliente, tenant, piloto ou parceiro sem prova física autorizada.

### P9 — Registar a execução real do GitHub Actions

O recibo de CI não pode ser fabricado localmente.

Depois de criar o commit final:

1. fazer push;
2. executar o workflow;
3. consultar a execução real no GitHub;
4. capturar:
   - repositório;
   - branch;
   - commit SHA;
   - workflow;
   - run ID;
   - URL;
   - data de início;
   - data de conclusão;
   - estado;
   - conclusão;
   - jobs;
   - steps;
   - resultado de cada step.

Estrutura mínima:

```json
{
  "repository": "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES",
  "branch": "master",
  "commit_sha": "SHA_REAL",
  "workflow_name": "CI / Production Readiness & Audit Gate",
  "run_id": 0,
  "run_url": "URL_REAL",
  "status": "completed",
  "conclusion": "success",
  "started_at": "ISO-8601",
  "completed_at": "ISO-8601",
  "jobs": []
}
```

O recibo deve ser obtido da API ou CLI do GitHub.

O gerador local não pode preencher:

```text
status = success
conclusion = success
CI_VERIFIED = true
```

sem resposta real do GitHub.

Se a API não estiver acessível, utilizar:

```text
CI_EVIDENCE_UNAVAILABLE
```

Se a execução falhar, utilizar:

```text
GITHUB_ACTIONS_FAILED
```

Nunca transformar ausência de evidência em sucesso.

### P10 — Corrigir novamente o relatório

Actualizar:

```text
AETF500_Relatorio_Patch_Correctivo_Schemas_Cardinalidades_CI.md
```

O relatório deve reflectir somente resultados reproduzíveis do SHA final.

Remover ou corrigir declarações como:

```text
388 testes passaram
npm run verify = 0
patch 100% verificado
```

se não forem confirmadas pela execução real.

O relatório final deve incluir:

1. SHA inicial;
2. SHA final;
3. ficheiros alterados;
4. duplicados removidos;
5. schemas reforçados;
6. resultados reais dos testes;
7. código de saída de `npm run verify`;
8. estado da árvore Git após a verificação;
9. run ID e URL do GitHub Actions;
10. conclusão da CI;
11. estado da protecção do branch;
12. limitações remanescentes;
13. classificação final.

## 5. Verificação local obrigatória

Num checkout limpo do SHA final, executar sequencialmente:

```bash
git status --short
npm ci
npm audit --omit=dev
npm run typecheck
npm run build:packages
npm run build:web
npm run lint
npm test
npm run validate:manifests
npm run verify:hashes
npm run verify:security
npm run verify:payments
npm run verify:auth
npm run verify
git status --short
```

Não executar estes comandos críticos em paralelo, pois `clean`, build e testes podem disputar os mesmos artefactos.

Resultados obrigatórios:

| Verificação | Resultado exigido |
|---|---:|
| Checkout inicial | Limpo |
| `npm ci` | Exit code 0 |
| `npm audit --omit=dev` | Exit code 0 |
| Typecheck | Exit code 0 |
| Build dos pacotes | Exit code 0 |
| Build web | Exit code 0 |
| ESLint | Exit code 0 |
| Testes | Zero falhas |
| Manifestos | Exit code 0 |
| Hashes | Exit code 0 |
| Segurança | Exit code 0 |
| Pagamentos | Exit code 0 |
| Autenticação | Exit code 0 |
| `npm run verify` | Exit code 0 |
| Estado final do Git | Limpo |

## 6. Verificação no GitHub

Executar o GitHub Actions no mesmo SHA validado localmente.

Confirmar:

```text
LOCAL_SHA = GITHUB_ACTIONS_SHA
GITHUB_ACTIONS_STATUS = completed
GITHUB_ACTIONS_CONCLUSION = success
SKIPPED_REQUIRED_STEPS = 0
```

Configurar o check como obrigatório antes de merge.

Se não houver permissão para activar a protecção:

```text
BRANCH_PROTECTION_NOT_CONFIGURED
```

e fornecer instruções exactas ao administrador.

Uma execução verde noutro commit não é aceite.

## 7. Evidências obrigatórias

Produzir, a partir das execuções reais:

```text
evidence/
├── environment.json
├── changed-files.txt
├── clean-checkout.txt
├── npm-ci.log
├── npm-audit-production.log
├── typecheck.log
├── build-packages.log
├── build-web.log
├── lint.log
├── test-results.json
├── test-summary.json
├── validate-manifests.log
├── verify-hashes.log
├── verify-security.log
├── verify-payments.log
├── verify-auth.log
├── verify.log
├── canonical-source-hashes.sha256
├── git-status-after-verification.txt
└── github-actions-receipt.json
```

Cada recibo deve indicar, quando aplicável:

- SHA;
- comando;
- início e fim em UTC;
- código de saída;
- sistema operativo;
- versão do Node.js;
- versão do npm;
- resultado real;
- origem da informação.

Não incluir segredos, tokens, credenciais ou dados pessoais nos logs.

## 8. Critérios de aceitação

O patch somente pode receber `PASS` se todas as condições forem verdadeiras:

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
GITHUB_ACTIONS_CONCLUSION = success
REPORT_MATCHES_PHYSICAL_RESULTS = true
WORKING_TREE_CLEAN = true
```

Se qualquer condição falhar, utilizar `FAIL` ou `BLOCKED`.

## 9. Classificações permitidas

Utilizar apenas uma:

```text
PATCH_VERIFIED_AND_CI_ENFORCED
PATCH_VERIFIED_CI_NOT_ENFORCED
PATCH_PARTIALLY_VERIFIED
PATCH_FAILED
PATCH_BLOCKED
```

Não declarar:

```text
PRODUCTION_READY
CERTIFIED
CERTIFIED_L3
FULL_PASS
CI_VERIFIED
```

sem CI verde, recibo real, mesmo SHA e protecção do branch comprovada.

## 10. Formato da entrega final

Entregar:

1. commit SHA inicial e final;
2. link do commit;
3. link da execução do GitHub Actions;
4. lista de ficheiros alterados;
5. lista de fontes duplicadas removidas;
6. resumo das alterações nos schemas;
7. contagem real de testes;
8. outputs e códigos de saída;
9. recibo real da CI;
10. estado da protecção do branch;
11. limitações;
12. classificação final.

## 11. Regra final

O objectivo não é fazer o relatório parecer positivo.

O objectivo é garantir que:

```text
CÓDIGO
=
TESTES
=
FONTES FÍSICAS
=
SCHEMAS
=
EVIDÊNCIAS
=
RELATÓRIO
=
GITHUB ACTIONS
```

Todos devem representar a mesma verdade técnica.
