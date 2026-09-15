# PROMPT DE EXECUÇÃO
## AETF-500 — Patch correctivo mínimo de schemas, fontes físicas, cardinalidades e CI

Actue como engenheiro sénior de software, auditor de código e especialista em Node.js, TypeScript, Ajv, Next.js, ESLint e GitHub Actions.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

## 1. Missão

Executar um patch correctivo pequeno, restrito, reproduzível e auditável para resolver exclusivamente os seguintes bloqueadores:

1. schemas Ajv físicos ausentes;
2. fontes canónicas de cardinalidade ausentes ou incorrectamente referenciadas;
3. validações que falham abertas;
4. caminhos dependentes do directório de execução;
5. relatório técnico com afirmações não reproduzíveis;
6. `npm run verify` com resultado negativo;
7. ausência de prova de CI verde e obrigatória;
8. desalinhamento entre Next.js, `eslint-config-next` e `@next/eslint-plugin-next`.

Não criar novos módulos funcionais, engines, dashboards, employees, catálogos, funcionalidades comerciais ou arquitecturas paralelas.

## 2. Regras inegociáveis

- Não inventar tarefas, contratos, auditorias, certificações, recibos, hashes ou resultados.
- Não alterar testes apenas para transformar uma falha real em `PASS`.
- Não substituir fontes físicas por constantes hard-coded.
- Não utilizar fixtures ou dados de demonstração como prova de produção.
- Não fazer Ajv, schema ou fonte ausente resultar em sucesso.
- Não omitir etapas falhadas do relatório final.
- Não declarar produção pronta sem CI verde no mesmo commit verificado.
- Preservar alterações legítimas já existentes e evitar refactors fora do escopo.
- Manter o patch pequeno e facilmente revisável.

## 3. Diagnóstico inicial obrigatório

Antes de alterar qualquer ficheiro:

1. Criar um checkout limpo do branch principal.
2. Registar:
   - nome do repositório;
   - branch;
   - SHA completo;
   - data e hora UTC;
   - sistema operativo;
   - versão do Node.js;
   - versão do npm.
3. Executar:

```bash
git status --short
node --version
npm --version
npm ci
npm audit --omit=dev
npm run verify
```

4. Guardar o output integral e o código de saída de cada comando.
5. Confirmar especificamente as falhas relacionadas com:
   - `INVALID_SCHEMA`;
   - `MISSING_SOURCE`;
   - schemas em `schemas/data/`;
   - fontes físicas em `data/`;
   - testes de cardinalidade.
6. Identificar o ficheiro e a linha responsáveis por cada falha.

Se o estado actual for diferente do esperado, documentar a diferença antes de continuar. Não assumir que um relatório anterior representa o estado físico do checkout.

## 4. Escopo obrigatório do patch

### P1 — Adicionar e versionar os schemas Ajv reais

Criar e adicionar ao controlo de versões:

```text
schemas/data/liveTasks.schema.json
schemas/data/legalContracts.schema.json
schemas/data/externalAudits.schema.json
```

Cada schema deve:

- ser JSON válido;
- declarar explicitamente a versão de JSON Schema utilizada;
- utilizar uma versão suportada pelo Ajv instalado;
- definir o tipo do documento raiz;
- definir os campos obrigatórios;
- definir os tipos de todas as propriedades;
- validar a estrutura dos arrays e respectivos itens;
- validar campos mínimos de identificação e proveniência;
- definir `additionalProperties` de forma consciente;
- aceitar cardinalidade zero somente quando a estrutura física válida representar legitimamente esse estado;
- rejeitar documentos vazios, incompletos ou estruturalmente inválidos quando aplicável.

Não criar schemas excessivamente permissivos apenas para fazer os testes passarem.

### P2 — Estabelecer fontes físicas canónicas

Identificar primeiro se o repositório já contém fontes físicas autoritativas para:

1. tarefas reais;
2. contratos legais;
3. auditorias externas ou certificações equivalentes.

Se existirem:

- reutilizar essas fontes;
- documentar a localização;
- evitar duplicação de dados;
- apontar os calculadores para elas;
- garantir que as cardinalidades sejam derivadas dos registos físicos.

Se não existirem, criar fontes canónicas mínimas e válidas em:

```text
data/liveTasks.json
data/legalContracts.json
data/externalAudits.json
```

Cada fonte deve:

- obedecer ao schema correspondente;
- incluir identificação e metadados de proveniência;
- distinguir dados reais de simulações, fixtures e demonstrações;
- permitir uma cardinalidade legítima de zero;
- não reproduzir totais históricos sem os respectivos registos físicos;
- ser validada antes de qualquer contagem;
- permanecer imutável durante os testes.

Uma contagem igual a zero somente pode ser considerada válida quando a fonte existir, passar no schema e declarar explicitamente esse estado. Fonte ausente não equivale a zero.

### P3 — Eliminar completamente o comportamento fail-open

Corrigir a validação em:

```text
scripts/lib/cardinalityCalculators.mjs
```

Ajv ou schema ausente nunca pode produzir algo equivalente a:

```js
{ valid: true, skipped: true }
```

Implementar comportamento fail-closed, com códigos de erro explícitos e estáveis, incluindo:

```text
AJV_UNAVAILABLE
SCHEMA_NOT_FOUND
SCHEMA_INVALID
SOURCE_NOT_FOUND
SOURCE_INVALID_JSON
SOURCE_SCHEMA_MISMATCH
CARDINALITY_UNVERIFIABLE
```

Comportamento obrigatório:

| Condição | Resultado obrigatório |
|---|---|
| Ajv indisponível | Falha |
| Schema ausente | Falha |
| Schema com JSON inválido | Falha |
| Schema não compilável | Falha |
| Fonte ausente | Falha |
| Fonte com JSON inválido | Falha |
| Fonte incompatível com o schema | Falha |
| Registos sem proveniência obrigatória | Falha |
| Fonte válida com zero registos | `OK`, cardinalidade `0` |
| Fonte válida com registos | `OK`, contagem física derivada |

Não utilizar `skip`, valores predefinidos, contagens hard-coded ou capturas genéricas de excepções que convertam falhas em sucesso.

### P4 — Tornar todos os caminhos determinísticos

Eliminar dependências do directório corrente do processo.

Resolver os caminhos a partir de uma origem estável, como:

- localização do próprio módulo;
- raiz do repositório determinada explicitamente;
- configuração injectada e validada.

Os verificadores e testes devem funcionar:

1. na raiz do repositório;
2. a partir de outro directório;
3. na CI;
4. quando o script for invocado directamente;
5. em Linux e Windows.

Não utilizar:

- caminhos absolutos locais;
- letras de disco;
- `$HOME`;
- directórios temporários fixos;
- concatenação manual incompatível entre plataformas;
- pressupostos sobre o computador do programador.

Utilizar as APIs de caminhos do Node.js e resolver qualquer entrada externa antes de abrir ficheiros.

### P5 — Corrigir as afirmações incorrectas do relatório

Localizar o relatório que afirma, sem prova reproduzível:

- `npm run verify` com sucesso;
- 369 testes aprovados;
- criação dos schemas e fontes canónicas;
- CI verde;
- conclusão integral dos quatro pontos anteriores;
- `PRODUCTION_READY_CERTIFIED_L3` ou classificação equivalente.

Corrigir o documento com base apenas nas evidências obtidas no SHA final.

O relatório corrigido deve apresentar:

- SHA inicial e SHA final;
- comandos executados;
- códigos de saída;
- contagens reais de testes;
- ficheiros físicos verificados;
- hashes SHA-256 dos schemas e fontes;
- resultado real da CI;
- limitações remanescentes;
- classificação tecnicamente defensável.

Não apagar silenciosamente o histórico da divergência. Registar que as afirmações anteriores foram rectificadas porque não eram reproduzíveis no checkout físico.

### P6 — Alinhar Next.js e ESLint

Verificar as versões efectivamente instaladas de:

```text
next
eslint
eslint-config-next
@next/eslint-plugin-next
```

Alinhar `eslint-config-next` e `@next/eslint-plugin-next` com a versão efectiva do Next.js.

Requisitos:

- evitar mistura incompatível entre Next.js 15 e configuração da versão 16;
- não realizar uma actualização principal do Next.js sem necessidade;
- manter o flat config;
- manter as regras recomendadas e Core Web Vitals do Next.js;
- manter o comando:

```bash
eslint . --max-warnings=0
```

- eliminar warnings de incompatibilidade, configuração ou plugins duplicados;
- actualizar o lockfile apenas através do gestor de pacotes.

## 5. Testes obrigatórios

Adicionar ou ajustar somente os testes necessários para provar o comportamento correcto.

Cobrir, no mínimo:

1. schema presente e válido;
2. schema ausente;
3. schema com JSON inválido;
4. schema não compilável pelo Ajv;
5. fonte presente e válida;
6. fonte ausente;
7. fonte com JSON inválido;
8. fonte incompatível com o schema;
9. fonte válida com zero registos;
10. cardinalidade derivada dos registos físicos;
11. execução a partir de outro directório;
12. caminhos compatíveis com Linux e Windows;
13. impossibilidade de substituir a contagem por uma constante;
14. ausência de mutação dos ficheiros canónicos;
15. erro de leitura da fonte;
16. formato de erro determinístico;
17. correspondência entre o resultado e a fonte realmente lida.

Para simular indisponibilidade do Ajv, utilizar injecção de dependência, adaptação controlada ou outra técnica determinística. Não desinstalar dependências nem corromper o ambiente global.

Os testes devem utilizar directórios temporários isolados e ser read-only relativamente aos ficheiros canónicos do repositório.

## 6. Integração no verificador principal

Confirmar que `npm run verify` executa, sem omissões:

1. build dos pacotes;
2. build web;
3. lint;
4. testes;
5. validação dos schemas;
6. validação das fontes físicas;
7. cálculo de cardinalidades;
8. validação de manifestos e recibos relevantes.

Uma falha em qualquer etapa deve terminar o comando com código diferente de zero.

Não utilizar:

```text
|| true
continue-on-error
--force
--legacy-peer-deps
test.skip
describe.skip
it.skip
.only
expectedFailure
```

Não remover verificações existentes para obter um pipeline verde.

## 7. Verificação final num checkout limpo

Depois de implementar o patch:

1. Rever o diff completo.
2. Confirmar que somente ficheiros necessários foram alterados.
3. Fazer commit das alterações.
4. Obter o SHA completo do commit.
5. Criar um novo checkout limpo desse SHA.
6. Executar, pela ordem indicada:

```bash
git status --short
npm ci
npm audit --omit=dev
npm run lint
npm run build:web
npm run verify
git status --short
```

Critérios obrigatórios:

| Verificação | Resultado exigido |
|---|---:|
| Checkout inicial | Limpo |
| `npm ci` | Exit code 0 |
| `npm audit --omit=dev` | Exit code 0 |
| `npm run lint` | Exit code 0 |
| `npm run build:web` | Exit code 0 |
| `npm run verify` | Exit code 0 |
| Testes falhados | 0 |
| Testes ignorados | 0, salvo justificação formal |
| Alterações depois da verificação | Nenhuma |
| Ficheiros residuais | Nenhum |
| Warnings críticos | 0 |

Se a execução modificar fontes, schemas, recibos versionados ou bases de dados de produção, considerar o patch falhado até eliminar essa mutação.

## 8. GitHub Actions e protecção do branch

Executar a CI no GitHub sobre o mesmo SHA validado localmente.

A CI deve executar explicitamente:

1. checkout do SHA;
2. instalação limpa;
3. auditoria das dependências de produção;
4. lint;
5. build dos pacotes;
6. build web;
7. testes;
8. verificadores de schemas;
9. verificadores de cardinalidade;
10. `npm run verify`.

Confirmar e registar:

- SHA executado;
- nome do workflow;
- ID da execução;
- URL da execução;
- estado final;
- duração;
- checks executados;
- ausência de etapas ignoradas;
- correspondência entre o SHA local e o SHA da CI.

Configurar o branch principal para exigir o check da CI antes do merge.

Se não houver permissão administrativa para configurar a protecção:

- não declarar a tarefa integralmente concluída;
- registar `BRANCH_PROTECTION_NOT_CONFIGURED`;
- apresentar instruções exactas para o administrador;
- documentar a limitação encontrada.

A presença de `.github/workflows/ci.yml` não é prova de CI verde. Uma CI verde noutro commit também não é válida como evidência deste patch.

## 9. Evidências obrigatórias

Produzir evidências derivadas das execuções reais:

```text
evidence/
├── environment.json
├── changed-files.txt
├── clean-checkout.txt
├── npm-ci.log
├── npm-audit-production.log
├── lint.log
├── build-web.log
├── verify.log
├── test-summary.json
├── cardinality-results.json
├── schema-validation-results.json
├── file-hashes.sha256
├── git-status-after-verification.txt
└── github-actions-receipt.json
```

Cada recibo deve indicar:

- SHA do commit;
- comando executado;
- data e hora UTC;
- ambiente;
- directório de execução;
- código de saída;
- resultado;
- hash SHA-256 do próprio ficheiro, quando a arquitectura de evidências já suportar esse mecanismo sem produzir auto-referência inválida.

Não criar recibos manualmente com resultados previamente definidos. Os estados devem ser derivados dos processos realmente executados.

Não versionar logs com segredos, tokens, credenciais, dados pessoais ou informação financeira sensível.

## 10. Condições de conclusão

O patch somente pode receber `PASS` quando todas estas condições forem verdadeiras:

```text
SCHEMAS_PRESENT = true
SCHEMAS_VALID = true
CANONICAL_SOURCES_PRESENT = true
CANONICAL_SOURCES_VALID = true
VALIDATION_FAIL_CLOSED = true
CARDINALITIES_PHYSICALLY_DERIVED = true
PATHS_EXECUTION_INDEPENDENT = true
TESTS_READ_ONLY_AND_DETERMINISTIC = true
REPORT_RECONCILED = true
NEXT_ESLINT_ALIGNED = true
NPM_CI_PASS = true
NPM_AUDIT_PRODUCTION_PASS = true
LINT_PASS = true
WEB_BUILD_PASS = true
VERIFY_PASS = true
CLEAN_TREE_AFTER_VERIFY = true
GITHUB_CI_PASS = true
BRANCH_PROTECTION_REQUIRED = true
```

Se uma condição falhar, a classificação final deve ser `FAIL` ou `BLOCKED`, acompanhada da causa exacta.

## 11. Formato da entrega final

Apresentar um relatório final conciso, factual e verificável com:

1. SHA inicial e SHA final;
2. resumo executivo;
3. ficheiros alterados;
4. causa técnica de cada problema;
5. correcção aplicada;
6. testes adicionados ou ajustados;
7. comandos executados;
8. códigos de saída;
9. número exacto de testes aprovados, falhados e ignorados;
10. estado do `npm audit --omit=dev`;
11. estado do lint;
12. estado do build web;
13. resultado do `npm run verify`;
14. URL e resultado da CI;
15. estado da protecção do branch;
16. limitações remanescentes;
17. classificação final.

Utilizar apenas uma destas classificações:

```text
PATCH_VERIFIED_AND_CI_ENFORCED
PATCH_VERIFIED_CI_NOT_ENFORCED
PATCH_PARTIALLY_VERIFIED
PATCH_FAILED
PATCH_BLOCKED
```

## 12. Regra final de classificação

Não declarar:

```text
PRODUCTION_READY
CERTIFIED
CERTIFIED_L3
CI_VERIFIED
FULL_PASS
```

sem evidência física, reproduzível e vinculada exactamente ao mesmo commit.

O objectivo não é produzir um relatório favorável. O objectivo é fazer com que código, fontes físicas, schemas, testes, hashes, recibos e CI apresentem a mesma verdade técnica.
