# PROMPT DE EXECUÇÃO — PATCH FINAL RESTRITO A SEIS BLOQUEADORES AETF-500

## 1. Missão

Actue como engenheiro principal de software, segurança, DevSecOps, identidade multi-tenant, pagamentos e auditoria de evidências.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Parta do commit mais recente da branch principal. Execute um patch pequeno e estritamente limitado aos seis bloqueadores definidos neste documento.

O objectivo é fazer a implementação física, os testes e a CI concordarem entre si. Não corrija apenas relatórios, comentários, recibos ou estados declarados.

## 2. Limites de escopo

Não criar módulos funcionais, motores, dashboards, catálogos ou novas funcionalidades comerciais.

É permitido apenas:

- corrigir a baseline e a verificação física de hashes;
- corrigir testes, build e pipeline de verificação;
- actualizar dependências afectadas;
- ligar correctamente os adaptadores existentes ao gateway;
- endurecer a persistência de identidade e autorização;
- substituir cardinalidades fixas por cálculos físicos;
- actualizar documentação directamente afectada pelas correcções.

É proibido:

- eliminar, ignorar ou enfraquecer um teste para obter `PASS`;
- usar `ignoreBuildErrors`, `ignoreDuringBuilds`, `continue-on-error` ou equivalentes;
- aceitar hashes alternativos para o mesmo artefacto;
- fabricar sessões, URLs ou identificadores de provedores;
- apresentar Stripe ou ExpressPay como integrados sem comunicação externa real;
- chamar uma constante hard-coded de contagem dinâmica;
- alterar recibos ou relatórios para esconder uma falha;
- declarar produção pronta sem CI verde no mesmo commit.

## 3. Baseline obrigatória antes das alterações

Registar:

```bash
git rev-parse HEAD
git status --porcelain
node --version
npm --version
npm ci
npm audit --omit=dev
npm run verify
```

Guardar outputs brutos e exit codes. Não usar relatórios anteriores como substitutos destes resultados.

## 4. Correcções obrigatórias

### P1 — Corrigir definitivamente o hash físico

O artefacto `generated/repository_truth/02_Original_Build_Log.txt` deve possuir uma única identidade criptográfica canónica.

Procedimento obrigatório:

1. efectuar um checkout limpo no mesmo sistema utilizado pela CI;
2. confirmar os atributos Git aplicados ao ficheiro;
3. calcular o SHA-256 directamente dos bytes físicos;
4. comparar o hash com o blob armazenado no Git;
5. escolher como baseline o hash efectivamente reproduzível no checkout limpo;
6. actualizar o registo de reprodução e o evento de migração de maneira coerente;
7. remover definitivamente qualquer `alternative_sha256` ou tolerância equivalente;
8. garantir que o verificador aceita exactamente um hash;
9. preservar `.gitattributes` de forma compatível com Linux e Windows.

Testes mínimos:

- o ficheiro intacto deve passar;
- uma alteração de um byte deve falhar;
- o hash histórico substituído deve falhar;
- checkout limpo Linux deve produzir o mesmo hash da baseline;
- o teste não pode modificar o artefacto original.

Não alterar artificialmente o ficheiro apenas para coincidir com um hash previamente escolhido.

### P2 — Fazer `npm run verify` passar sem ignorar testes

Corrigir todas as causas reais de falha do pipeline.

Requisitos:

- todos os testes existentes e os novos testes negativos devem ser executados;
- restaurar validação TypeScript do Next.js;
- restaurar lint ou criar um comando de lint obrigatório separado;
- remover de `next.config.js`:
  - `typescript.ignoreBuildErrors: true`;
  - `eslint.ignoreDuringBuilds: true`;
- não usar filtros para excluir testes falhados;
- não converter falhas em warnings;
- verificadores devem gravar resultados apenas em directório temporário ou de artifacts;
- depois da verificação, a árvore Git deve permanecer limpa.

Critérios:

```bash
npm run verify
git status --porcelain
git diff --exit-code
```

Os três comandos devem terminar correctamente, e `git status --porcelain` deve produzir saída vazia.

### P3 — Actualizar Next.js e eliminar a falha do `npm audit`

Actualizar o Next.js para uma versão suportada que corrija as vulnerabilidades aplicáveis. Actualizar React, React DOM, tipos e configuração apenas na medida necessária para manter compatibilidade.

Requisitos:

- analisar breaking changes antes da actualização;
- não executar `npm audit fix --force` de forma cega;
- corrigir código e configuração incompatíveis;
- confirmar que `postcss`, `express`, `qs` e restantes dependências de produção ficam em versões seguras;
- executar build e testes de regressão depois da actualização;
- manter a aplicação compatível com o runtime oficial do projecto;
- executar `npm audit --omit=dev` como gate bloqueante na CI.

Critério mínimo:

```text
npm audit --omit=dev = exit code 0
critical = 0
high = 0
```

Uma avaliação manual de “não aplicável” não substitui este critério enquanto a CI executar directamente `npm audit` como gate.

### P4 — Ligar os adaptadores ao `PaymentGatewayManager`

Integrar os adaptadores existentes na execução real do `PaymentGatewayManager`.

Requisitos:

- pedidos AOA reais devem ser encaminhados ao adaptador ExpressPay;
- pedidos USD/EUR reais devem ser encaminhados ao adaptador Stripe;
- pedidos sandbox devem continuar claramente separados;
- o manager deve devolver o resultado exacto do adaptador, devidamente normalizado;
- não cair em `SANDBOX_CHECKOUT` depois de um pedido real;
- usar valores em unidades monetárias inteiras mínimas;
- validar allowlist das URLs de retorno;
- aplicar timeout, idempotência e correlação;
- não criar IDs ou URLs que pareçam ter vindo do provedor.

Enquanto não houver API, credenciais, documentação oficial ou sandbox externo verificado:

```text
STRIPE = NOT_IMPLEMENTED ou NOT_CONFIGURED
EXPRESSPAY = NOT_IMPLEMENTED ou NOT_CONFIGURED
REAL_PAYMENT = BLOCKED
REAL_REVENUE = NOT_PROVEN
```

É aceitável manter os provedores bloqueados. Não é aceitável declarar integração real.

Testes mínimos:

- pedido real sem configuração falha fechado;
- pedido real nunca retorna sessão sandbox;
- resultado do adaptador é propagado pelo manager;
- erro, timeout e resposta inválida não produzem factura paga;
- sandbox é recusado em produção;
- nenhuma URL ou session ID é fabricada.

### P5 — Fazer identidade e autorização falharem fechadas

A indisponibilidade da persistência de identidade não pode ser convertida silenciosamente em funcionamento em memória em produção.

Requisitos:

- remover `catch` silencioso da inicialização SQLite;
- em produção, falha da base de identidade deve interromper o arranque;
- se a consulta de identidade falhar durante um pedido, rejeitar o acesso;
- utilizador ausente no registo persistente deve ser rejeitado em produção;
- validar estado da conta, tenant, funções e permissões persistentes;
- não confiar apenas nas funções e permissões presentes no token;
- revogações devem sobreviver a restart;
- erro de persistência da revogação deve impedir confirmação falsa de sucesso;
- definir migrações e restrições da base de identidade;
- usar IDs e associações multi-tenant consistentes;
- preservar o bloqueio dos emissores públicos e de teste em produção.

Testes mínimos:

- base indisponível impede arranque em produção;
- erro de consulta retorna acesso negado;
- utilizador inexistente é rejeitado;
- conta suspensa ou revogada é rejeitada;
- tenant divergente é rejeitado;
- função declarada apenas no token não concede acesso;
- revogação continua activa após restart;
- desenvolvimento/teste continuam isolados de produção.

### P6 — Substituir quatro cardinalidades hard-coded por contagens físicas

Remover do verificador valores fixos usados como se fossem resultados calculados, incluindo:

```text
physicalLiveTasksInStorage = 0
legallyAuthorizedTenantsCount = 0
eligiblePhysicalEvidenceCount = 0
controlled_pilot_ready_count = 470
hitl_mandatory_count = 30
```

Criar funções puras e testáveis que leiam os registos físicos canónicos e calculem:

1. tarefas live comprovadas;
2. tenants legalmente autorizados;
3. evidências elegíveis para certificação;
4. empregados `CONTROLLED_PILOT_READY` e `HITL_MANDATORY`.

Requisitos:

- definir fontes canónicas explícitas para cada domínio;
- recusar fonte ausente, duplicada, contraditória ou sem schema;
- não inferir autorização legal apenas da existência de um tenant técnico;
- não contar demonstrações como tarefas reais;
- não contar recibos internos como validação externa;
- validar unicidade e referências cruzadas;
- comparar `declarado = físico = único = válido`;
- incluir caminhos e hashes das fontes usadas no recibo;
- falhar quando a contagem física divergir da declarada.

Testes mínimos:

- fonte vazia produz zero calculado;
- inserção de um registo físico válido altera a contagem para um;
- duplicado não aumenta indevidamente a contagem;
- registo sem evidência é rejeitado;
- divergência declarada/física falha o gate;
- alteração de uma fonte muda o hash e invalida o recibo.

## 5. Sequência obrigatória

Executar nesta ordem:

1. corrigir a baseline física do hash;
2. corrigir os testes e remover os bypasses do build;
3. actualizar Next.js e dependências;
4. ligar os adaptadores ao manager sem fingir integração externa;
5. tornar identidade e autorização fail-closed;
6. implementar as cardinalidades físicas;
7. executar a verificação integral num checkout limpo;
8. executar a CI no GitHub no mesmo SHA;
9. comprovar branch protection ou declarar falta de permissão.

Não avançar para uma declaração de conclusão se uma etapa anterior falhar.

## 6. Verificação final obrigatória

Executar e apresentar os outputs e exit codes de:

```bash
git rev-parse HEAD
node --version
npm --version
npm ci
npm audit --omit=dev
npm run typecheck
npm run build:packages
npm run build:web
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

Executar também os testes negativos definidos em cada ponto.

## 7. Critérios de aceitação

O patch só estará concluído quando:

- existir um único hash físico reproduzível;
- os testes do hash passarem num checkout limpo;
- `npm run verify` retornar exit code 0;
- nenhum teste, erro TypeScript ou lint estiver ignorado;
- `npm audit --omit=dev` retornar exit code 0;
- o gateway usar realmente os adaptadores;
- pagamentos externos não implementados permanecerem bloqueados e honestamente classificados;
- identidade e autorização falharem fechadas em produção;
- as quatro cardinalidades forem calculadas dos registos físicos;
- a árvore Git permanecer limpa;
- o GitHub Actions do mesmo SHA estiver verde;
- os checks forem obrigatórios antes de merge.

Se faltar um único critério, usar:

```text
PATCH_INCOMPLETE
CI_NOT_APPROVED
PRODUCTION_BLOCKED
```

## 8. Entregáveis

Entregar:

1. SHA inicial e SHA final;
2. lista dos ficheiros alterados e razão;
3. matriz `Ponto → Causa → Correcção → Teste → Evidência → Estado`;
4. outputs e exit codes dos comandos obrigatórios;
5. hash canónico e caminho do artefacto;
6. resultado integral do `npm audit`;
7. prova de que o manager utiliza os adaptadores;
8. estado honesto de Stripe e ExpressPay;
9. testes de falha fechada de identidade;
10. fontes e cálculos das quatro cardinalidades;
11. prova de árvore Git limpa;
12. URL, run ID e conclusão do GitHub Actions;
13. riscos residuais e dependências externas;
14. classificação final.

## 9. Formato da resposta final

Usar estas secções:

1. `Resumo executivo`;
2. `Resultado dos seis pontos`;
3. `Testes e auditoria de dependências`;
4. `Evidências físicas e CI`;
5. `Integrações externas ainda bloqueadas`;
6. `Riscos residuais`;
7. `Classificação final`;
8. `Próxima acção exacta`.

Não usar expressões como “totalmente seguro”, “completamente auditado”, “integração real” ou “produção pronta” sem prova física correspondente.

## 10. Classificação inicial obrigatória

Até todos os critérios serem satisfeitos, manter:

```text
PATCH_B1_B9_INCOMPLETE
CI_FAILED
PRODUCTION_BLOCKED
CONTROLLED_LOCAL_DEVELOPMENT_ONLY
```
