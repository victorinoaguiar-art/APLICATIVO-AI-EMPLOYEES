# PROMPT DE EXECUÇÃO — MICRO-PATCH FINAL DE QUATRO PONTOS AETF-500

## 1. Missão

Actue como engenheiro principal de software, segurança de identidade, testes multiplataforma, validação de evidências e DevSecOps.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Parta do commit mais recente da branch principal e execute um micro-patch estritamente limitado aos quatro pontos definidos neste documento.

Não criar novos módulos funcionais. Não alterar pagamentos, catálogos, motores, dashboards, conhecimentos profissionais ou funcionalidades comerciais, salvo se uma alteração mínima for indispensável para manter build ou tipos depois das quatro correcções.

## 2. Estado inicial obrigatório

Antes de editar, registar:

```bash
git rev-parse HEAD
git status --porcelain
node --version
npm --version
npm ci
npm audit --omit=dev
npm run verify
```

Guardar outputs e exit codes brutos. A baseline deve reconhecer que `npm run verify` falha no teste de base de identidade inacessível em Linux.

## 3. Regras de integridade

É proibido:

- remover, ignorar ou enfraquecer testes;
- converter falhas em warnings;
- usar caminhos cuja invalidade dependa apenas do Windows;
- esconder resíduos por meio de `.gitignore`;
- considerar fonte ausente como prova física de contagem zero;
- usar `continue-on-error`, `|| true`, `ignoreBuildErrors` ou `ignoreDuringBuilds`;
- afirmar `PASS` antes da execução completa da CI;
- alterar relatórios para mascarar resultados reais.

## 4. Correcções obrigatórias

### P1 — Teste de base inacessível verdadeiramente multiplataforma

Corrigir o teste `P5: Unreachable identity database halts startup in production (fail-closed)`.

O caminho actual semelhante a `Z:\impossible_nonexistent_drive_folder\auth.db` não é inválido em Linux. É interpretado como nome de ficheiro relativo e cria um resíduo dentro de `packages/runtime/`.

Implementação exigida:

1. permitir injecção de uma factory ou adaptador de base de dados no `TokenService`;
2. no teste, injectar uma implementação que lança erro conhecido durante a inicialização;
3. verificar que, em produção, o erro se torna `FATAL_DATABASE_INIT_FAILURE`;
4. confirmar que nenhum ficheiro é criado.

Alternativamente, usar fixture temporária portável que provoque erro em Windows, Linux e macOS sem depender de letras de drive ou caminhos exclusivos de um sistema.

Limpeza obrigatória:

- remover qualquer ficheiro residual como `packages/runtime/Z:\...\auth.db`;
- verificar resíduos antes e depois do teste;
- usar `try/finally` para limpar recursos temporários;
- não adicionar o resíduo ao `.gitignore`.

Testes mínimos:

- Linux, Windows e macOS produzem a mesma falha controlada;
- desenvolvimento/teste usa apenas fixture isolada expressamente autorizada;
- produção nunca degrada silenciosamente para memória;
- nenhum ficheiro `.db` residual permanece no workspace.

### P2 — Consultas de identidade e revogação fail-closed

Fazer `isRevoked()` e todas as consultas de identidade falharem fechadas em produção quando a persistência estiver indisponível ou lançar erro.

Auditar pelo menos:

- `initDatabase()`;
- `isRevoked()`;
- `revokeToken()`;
- `getAccount()`;
- `upsertAccount()`;
- middleware de autenticação e autorização;
- carregamento das revogações no arranque.

Em produção:

- erro ao abrir a base interrompe o arranque;
- erro numa consulta de revogação rejeita o token;
- erro na consulta da conta rejeita o pedido;
- utilizador ausente é rejeitado;
- falha ao persistir revogação não retorna sucesso;
- conta, tenant, funções e permissões persistentes prevalecem sobre claims;
- nenhuma excepção é convertida em `false`, `null`, memória local ou acesso permitido.

Usar erros claros, por exemplo:

```text
FATAL_DATABASE_INIT_FAILURE
IDENTITY_STORE_UNAVAILABLE
REVOCATION_CHECK_UNAVAILABLE
REVOCATION_PERSISTENCE_FAILURE
USER_NOT_REGISTERED
```

O middleware deve responder de forma segura sem expor caminhos, queries, segredos ou detalhes internos.

Testes mínimos:

- base indisponível no arranque bloqueia produção;
- base que falha depois do arranque bloqueia `isRevoked()`;
- falha na consulta de conta bloqueia autenticação;
- token revogado é rejeitado após restart;
- utilizador inexistente é rejeitado;
- papel administrativo apenas no token não concede acesso;
- erro de persistência impede confirmação falsa de revogação.

### P3 — Fontes físicas ausentes ou inválidas devem bloquear cardinalidades

Corrigir os calculadores e `scripts/validate-manifests.mjs` para distinguir:

```text
FONTE PRESENTE E VAZIA = zero fisicamente comprovado
FONTE AUSENTE = NOT_EVALUABLE / FAIL
FONTE INVÁLIDA = FAIL
```

As fontes actualmente esperadas incluem:

```text
data/live_tasks.json
data/legal_contracts.json
data/external_audits.json
```

Implementação exigida:

- definir schema Ajv versionado para cada fonte;
- criar ficheiros canónicos apenas se forem fontes legítimas do domínio;
- se a contagem legítima for zero, versionar estrutura vazia válida com metadata, escopo, versão e data;
- fonte obrigatória ausente retorna `MISSING_SOURCE` e bloqueia;
- JSON inválido retorna `INVALID_JSON` e bloqueia;
- schema inválido retorna `INVALID_SCHEMA` e bloqueia;
- hash ausente ou impossível de calcular bloqueia;
- duplicados, IDs ausentes e referências contraditórias bloqueiam;
- não confundir tenant técnico, demonstração, piloto e contrato de produção;
- não contar recibo interno como evidência externa;
- comparar `declared = physical = unique = schema_valid = evidence_valid`.

Para tenants, calcular separadamente:

- tenants técnicos;
- tenants de demonstração;
- tenants com contrato físico;
- tenants autorizados para produção;
- tenants únicos e válidos.

Para certificações, distinguir:

- registos internos;
- evidência externa elegível;
- certificações declaradas;
- certificações fisicamente comprovadas.

O recibo deve incluir para cada fonte: caminho, SHA-256, schema e versão, estado, número declarado, físico, único e válido, exclusões e razões.

Testes mínimos:

- fonte ausente, JSON inválido ou schema inválido produz `FAIL`;
- ficheiro canónico vazio válido produz zero com `PASS`;
- um registo válido produz um;
- duplicado é rejeitado;
- demonstração não conta como execução real;
- contrato sem assinatura ou hash não autoriza tenant;
- evidência interna não fecha certificação externa;
- alteração de um byte muda o hash e invalida o recibo.

### P4 — ESLint real do Next.js e gate explícito na CI

Configurar ESLint para usar efectivamente as regras recomendadas do Next.js, e não apenas `typescript-eslint`.

Implementação exigida:

- alinhar versões de Next.js, `eslint`, `eslint-config-next` e `typescript-eslint`;
- configurar Flat Config compatível;
- activar regras equivalentes a `next/core-web-vitals` e `next/typescript`;
- manter regras TypeScript relevantes;
- remover configuração instalada mas não utilizada;
- eliminar o warning `The Next.js plugin was not detected`;
- migrar de `next lint` para execução directa do ESLint;
- usar `eslint . --max-warnings=0`;
- corrigir erros reais sem desactivar regras em massa;
- não desligar genericamente `no-unused-vars` ou `no-explicit-any` sem justificação localizada.

Adicionar etapa explícita e bloqueante à CI:

```yaml
- name: Next.js ESLint
  run: npm run lint
```

Testes mínimos:

- `npm run lint` retorna exit code 0;
- zero warnings;
- plugin Next.js detectado;
- fixture temporária com violação Next.js conhecida é detectada;
- CI falha quando lint falha;
- build mantém validação TypeScript activa.

## 5. Sequência obrigatória

1. remover o ficheiro residual;
2. corrigir o teste multiplataforma;
3. corrigir fail-closed de identidade e revogação;
4. corrigir fontes e gates de cardinalidade;
5. configurar ESLint real do Next.js;
6. adicionar lint explicitamente à CI;
7. executar verificação completa num checkout limpo;
8. executar CI no GitHub no mesmo SHA;
9. actualizar relatório somente com resultados observados.

## 6. Comandos obrigatórios

Executar e apresentar outputs e exit codes:

```bash
git rev-parse HEAD
node --version
npm --version
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
git status --porcelain
git diff --exit-code
```

Executar também pesquisa de resíduos multiplataforma por nomes inesperados e bases temporárias dentro do repositório. Um resíduo encontrado deve falhar a validação, não ser ignorado.

## 7. Critérios de aceitação

O micro-patch só estará concluído quando:

- o teste de base inacessível passar em Linux e Windows;
- nenhum ficheiro residual for criado;
- todas as consultas de identidade falharem fechadas em produção;
- fonte ausente ou inválida bloquear o gate;
- zero válido depender de fonte canónica presente, válida e com hash;
- tenants e certificações reconciliem dados declarados e físicos;
- ESLint carregar regras reais do Next.js;
- `npm run lint` terminar sem erros nem warnings;
- CI executar lint explicitamente;
- `npm audit --omit=dev` retornar zero vulnerabilidades;
- `npm run verify` retornar exit code 0;
- árvore Git permanecer limpa;
- GitHub Actions do mesmo SHA estiver verde.

Se qualquer critério falhar:

```text
MICRO_PATCH_INCOMPLETE
VERIFY_FAILED
CI_NOT_APPROVED
PRODUCTION_BLOCKED
```

## 8. Entregáveis

Entregar:

1. SHA inicial e SHA final;
2. ficheiros alterados e motivo;
3. matriz `Ponto → Causa → Correcção → Teste → Evidência → Estado`;
4. prova de remoção do resíduo;
5. matriz de testes Linux/Windows;
6. testes de fail-closed da identidade;
7. inventário das fontes físicas e hashes;
8. cardinalidades declaradas e físicas;
9. configuração final do ESLint;
10. output integral do lint;
11. outputs e exit codes obrigatórios;
12. prova de árvore Git limpa;
13. URL e ID do GitHub Actions;
14. riscos residuais;
15. classificação final.

## 9. Formato do relatório final

Usar:

1. `Resumo executivo`;
2. `Resultado dos quatro pontos`;
3. `Testes e verificações`;
4. `Evidências físicas`;
5. `CI do mesmo commit`;
6. `Riscos residuais`;
7. `Classificação final`;
8. `Próxima acção exacta`.

Não afirmar “100% resolvido”, “produção pronta”, “zero warnings” ou “CI aprovada” sem outputs físicos correspondentes.

## 10. Classificação inicial

Até todos os critérios serem satisfeitos:

```text
PATCH_P1_P6_PARTIALLY_COMPLETED
VERIFY_FAILED
CI_NOT_PROVEN
PRODUCTION_BLOCKED
```

