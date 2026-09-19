# Prompt: último ajuste *fail-closed* do verificador forense da CI

## Contexto

O micro-patch anterior foi executado no commit:

`e25232a6acbd32f64e6cf176472e568a69621cea`

Os quatro workflows terminaram com `status: completed` e `conclusion: success` no mesmo SHA. A execução corrigiu os problemas principais, tornou obrigatórios por omissão os nove recibos, reforçou a validação semântica de jobs e artefactos e implementou a cobertura bidireccional de `files.sha256`.

O projecto pode avançar. Antes disso, executar somente este último ajuste curto para eliminar quatro tolerâncias residuais. Não criar módulos, relatórios, arquitecturas, novas cadeias de atestação ou commits exclusivamente documentais.

## Objectivo

Tornar impossível desactivar a validação dos nove recibos, exigir a associação física de cada job à execução correcta, vincular os artefactos ao ID canónico do repositório e comprovar estas regras com quatro testes negativos específicos.

## Correcções obrigatórias

### 1. Remover as opções de desactivação dos nove recibos

Eliminar completamente do CLI e do código:

```text
--allow-fewer-receipts
--no-require-nine-files
```

Requisitos:

- os nove recibos devem ser obrigatórios em todos os pontos de entrada;
- não aceitar argumento, opção interna, variável ou configuração que permita reduzir esta exigência;
- remover o modo permissivo `requireNineFiles: false` do caminho operacional;
- se a API interna ainda necessitar de compatibilidade para testes unitários antigos, substituir esses testes por fixtures completas, em vez de manter uma via de desactivação;
- argumentos desconhecidos relacionados com a redução de recibos devem causar erro explícito e exit code diferente de zero.

### 2. Tornar `job.run_id` obrigatório

Para cada job de cada recibo:

- exigir a presença de `run_id`;
- exigir inteiro positivo seguro;
- exigir igualdade exacta com o ID da execução correspondente;
- rejeitar `undefined`, `null`, string, zero, negativo, decimal ou valor divergente;
- remover qualquer validação condicional baseada em `job.run_id !== undefined`.

A regra deve ser equivalente a:

```text
job.run_id existe, é inteiro positivo e é exactamente igual a expectedRunId
```

### 3. Fixar o ID canónico do repositório

Definir uma constante única e explícita:

```text
EXPECTED_REPOSITORY_ID = 1363667011
```

Em cada `workflow_run` de artefacto, exigir:

```text
repository_id      === 1363667011
head_repository_id === 1363667011
```

Não basta verificar que ambos são positivos e iguais entre si. Dois IDs falsos, mesmo quando iguais, devem falhar.

Manter também a validação do nome canónico:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

O ID deve ser definido num único ponto e reutilizado pelos verificadores JavaScript e TypeScript, evitando números duplicados sem controlo.

### 4. Acrescentar quatro testes negativos específicos

Adicionar exactamente a cobertura necessária para comprovar:

1. **Opções permissivas removidas:** executar o CLI com `--allow-fewer-receipts` e com `--no-require-nine-files` deve falhar explicitamente.
2. **`job.run_id` ausente ou inválido:** remover o campo e testar também `null`, string, zero, negativo, decimal e ID divergente; todos devem falhar.
3. **IDs canónicos divergentes:** usar `repository_id` e `head_repository_id` falsos, inclusive quando ambos contêm o mesmo valor positivo; deve falhar.
4. **Symlink no pacote:** criar um symlink dentro do directório de recibos ou do pacote de fecho; a verificação deve falhar antes de calcular ou aceitar o manifesto.

Manter o teste positivo integral com:

- nove recibos físicos completos;
- `job.run_id` correcto em todos os jobs;
- IDs canónicos do repositório;
- manifesto bidireccional completo;
- ausência de symlinks;
- SHA único e coerente.

## Regras de implementação

- Aplicar as mesmas regras em:
  - `scripts/verify-ci-workflow-receipts.mjs`;
  - `packages/runtime/src/pilot/CIWorkflowReceiptsVerifier.ts`.
- Evitar divergência entre as duas implementações.
- Não introduzir fallback, modo legado silencioso ou opção de compatibilidade permissiva.
- Não alterar fixtures apenas para fabricar aprovação.
- Não modificar workflows que já estejam correctos, salvo o mínimo necessário para assegurar que utilizam o verificador endurecido.
- Não gerar nem versionar evidências temporárias.

## Verificação obrigatória

Executar num checkout limpo do SHA final:

```bash
npm ci
npm audit --omit=dev
npm run verify
git diff --check
git status --short
```

Confirmar adicionalmente:

```bash
node scripts/verify-ci-workflow-receipts.mjs --allow-fewer-receipts
node scripts/verify-ci-workflow-receipts.mjs --no-require-nine-files
```

Os dois últimos comandos devem falhar com exit code diferente de zero e mensagem de argumento proibido ou desconhecido.

## Critérios de aceitação

O ajuste só pode ser considerado concluído quando:

1. não existir qualquer opção que permita validar menos de nove recibos;
2. todo job possuir `run_id` inteiro positivo e igual ao run esperado;
3. ambos os IDs de repositório forem exactamente `1363667011`;
4. os quatro testes negativos passarem;
5. o teste positivo integral continuar a passar;
6. `npm audit --omit=dev` apresentar zero vulnerabilidades;
7. `npm run verify` terminar com exit code `0`;
8. a árvore Git permanecer limpa;
9. os quatro workflows terminarem com `completed/success` no mesmo SHA final;
10. o artefacto final for publicado e associado ao mesmo SHA.

## Entrega esperada

Entregar somente:

1. o diff do ajuste;
2. a identificação dos quatro testes negativos acrescentados;
3. o SHA final;
4. os IDs e URLs dos quatro workflows nesse SHA;
5. o ID, nome, tamanho e SHA associado do artefacto final;
6. os exit codes dos comandos de verificação;
7. confirmação de árvore limpa;
8. uma declaração curta indicando se os dez critérios de aceitação foram cumpridos.

## Restrições finais

- Não criar novo módulo funcional.
- Não criar novo relatório no repositório.
- Não criar nova arquitectura de evidências.
- Não criar outro commit apenas para actualizar documentação ou declarar conclusão.
- Não promover o piloto de simulação para piloto operacional real.
- Não declarar prontidão geral para produção com base apenas nesta cadeia forense.
- Depois da aprovação deste ajuste, encerrar esta cadeia e avançar para a fase seguinte do projecto.

## Classificação permitida após aprovação

Somente se todos os critérios forem comprovados no mesmo SHA final:

`FORENSIC_VERIFIER_CHAIN_CLOSED — NINE_RECEIPTS_UNCONDITIONALLY_REQUIRED — JOB_RUN_LINKAGE_ENFORCED — CANONICAL_REPOSITORY_ID_LOCKED — NEGATIVE_TESTS_CONFIRMED — FOUR_WORKFLOWS_GREEN_ON_FINAL_SHA`

Esta classificação confirma apenas o encerramento técnico da cadeia de verificação forense da CI. Não comprova, isoladamente, piloto operacional real ou prontidão integral para produção.
