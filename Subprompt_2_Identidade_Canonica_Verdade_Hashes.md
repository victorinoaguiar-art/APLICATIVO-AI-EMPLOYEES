# Subprompt 2 — Identidade Canónica do Repositório e Verdade dos Hashes

## Repositório

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

## Baseline obrigatória

```text
4753e094e778e20a8903b7766b8af40823bc817a
```

Confirme que `master` continua exatamente neste SHA. Se tiver avançado, interrompa a execução e reporte o novo SHA antes de alterar qualquer ficheiro.

---

## Objetivo restrito

Aplicar exclusivamente estas duas correções:

1. tornar `repository.id` e `head_repository.id` obrigatórios e iguais ao repositório canónico em todos os runs da cadeia;
2. rejeitar qualquer hash obrigatório ausente, malformado ou divergente.

Não altere:

- descoberta e vinculação dos runs já concluída no Subprompt 1;
- seleção exata dos artefactos;
- classificação final;
- derivação do modo de execução;
- workflows;
- configuração externa do GitHub;
- arquitetura do sistema.

Não execute Intake, Etapa A, Etapa B ou a atestação completa. Execute apenas build, typecheck, testes e CI.

---

## 1. Identidade canónica obrigatória

### Repositório canónico

```text
repository.full_name = victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
repository.id = 1363667011
head_repository.id = 1363667011
```

### Problema atual

Ainda existem condições permissivas como:

```javascript
run.repository?.id === CANONICAL_REPO_ID || !run.repository
```

e:

```javascript
run.head_repository?.id === CANONICAL_REPO_ID || !run.head_repository
```

Essas expressões aceitam a ausência da prova de identidade.

### Correção obrigatória

Crie ou utilize uma função única de produção que valide cada run:

```text
CI
Intake
Etapa A
Etapa B
```

Para cada run, exija simultaneamente:

```javascript
run.repository.id === 1363667011
run.head_repository.id === 1363667011
run.repository.full_name === 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES'
run.head_repository.full_name === 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES'
```

Se a resposta real da API não fornecer `full_name` em `head_repository`, não invente o campo. Nesse caso, interrompa e reporte a incompatibilidade antes de reduzir o requisito. Não introduza fallback silencioso.

Devem falhar:

- `repository` ausente;
- `repository.id` ausente;
- `repository.id` nulo, textual, zero ou diferente;
- `repository.full_name` ausente ou divergente;
- `head_repository` ausente;
- `head_repository.id` ausente;
- `head_repository.id` nulo, textual, zero ou diferente;
- `head_repository.full_name` ausente ou divergente;
- run proveniente de fork;
- combinação em que apenas um dos dois IDs é canónico.

Remova totalmente fallbacks como:

```text
|| !run.repository
|| !run.head_repository
?? CANONICAL_REPO_ID
```

Não aceite valores derivados de inputs, constantes substitutivas ou metadados de outro run.

### Resultado derivado

Os estados devem ser calculados por run:

```text
ci_repository_identity_verified
intake_repository_identity_verified
stage_a_repository_identity_verified
stage_b_repository_identity_verified
```

E o estado agregado:

```text
canonical_repository_chain_verified
```

somente pode ser `true` se os quatro runs passarem.

---

## 2. Verdade obrigatória dos hashes

### Problema atual

Não é aceitável lógica permissiva como:

```javascript
!intakePackageSha ||
!stageAInputSha ||
intakePackageSha === stageAInputSha
```

Essa expressão considera a reconciliação bem-sucedida quando qualquer hash está ausente.

### Formato obrigatório

Todo hash SHA-256 deve satisfazer:

```regex
^[a-f0-9]{64}$
```

Normalize apenas letras hexadecimais maiúsculas para minúsculas se essa compatibilidade já estiver prevista. Não remova espaços internos, prefixos, sufixos ou caracteres inválidos para fazer o valor passar.

### Hashes mínimos obrigatórios

Valide, quando aplicável ao pacote e à etapa:

1. hash físico do ZIP do Intake;
2. hash físico do ZIP da Etapa A;
3. hash físico do ZIP da Etapa B;
4. `input-package.sha256` do Intake;
5. `original-package.sha256` do Intake, quando for a fonte canónica declarada;
6. `input-package.sha256` transportado pela Etapa A;
7. hash do pacote original preservado na Etapa A;
8. hash do pacote/entrada preservado na Etapa B;
9. hashes das respostas individuais da API;
10. hashes dos ficheiros de linkage já validados pelo índice;
11. hashes dos ficheiros enumerados no índice de evidências.

Não crie um hash esperado a partir dos próprios bytes que estão a ser validados e depois use-o como se fosse uma fonte independente. Diferencie:

```text
hash observado
hash esperado preservado
resultado da comparação
```

### Reconciliação Intake → Etapa A → Etapa B

O verificador deve provar:

```text
hash do pacote publicado no Intake
= hash do pacote consumido pela Etapa A
= hash do pacote preservado ou referenciado pela Etapa B
```

Cada valor deve:

- existir;
- estar no formato SHA-256 estrito;
- vir de uma fonte física identificada;
- ter a fonte autenticada pelo índice aplicável;
- coincidir com os restantes valores da cadeia.

Devem falhar:

- ficheiro `.sha256` ausente;
- ficheiro vazio;
- linha sem nome de ficheiro, quando o formato usado exige nome;
- hash com menos ou mais de 64 caracteres;
- caracteres não hexadecimais;
- valor `null` ou `undefined`;
- hash esperado ausente;
- hash observado ausente;
- hash divergente;
- duas fontes canónicas com hashes diferentes;
- ficheiro referido pelo sidecar ausente;
- sidecar cujo nome não corresponde ao ficheiro físico;
- hash válido no formato, mas correspondente a outros bytes.

### Resultado derivado

Produza estados calculados, sem constantes:

```text
intake_package_hash_verified
stage_a_input_hash_verified
stage_b_preserved_hash_verified
cross_stage_package_hash_reconciled
api_response_hashes_verified
evidence_index_hashes_verified
artifact_zip_hashes_computed
```

Se qualquer estado obrigatório for falso, ausente ou não demonstrável, encerre com código diferente de zero.

---

## 3. Testes positivos obrigatórios

Todos os testes devem chamar funções reais usadas pelo caminho operacional.

### Identidade

1. CI com os dois IDs e os dois nomes canónicos passa;
2. Intake com identidade canónica passa;
3. Etapa A com identidade canónica passa;
4. Etapa B com identidade canónica passa;
5. cadeia com os quatro runs canónicos produz `canonical_repository_chain_verified: true`.

### Hashes

6. SHA-256 estrito válido passa;
7. bytes físicos coincidentes com o sidecar passam;
8. Intake, Etapa A e Etapa B com o mesmo hash do pacote passam;
9. índice completo com todos os hashes físicos coincidentes passa;
10. respostas individuais da API com sidecars corretos passam.

---

## 4. Testes negativos obrigatórios

### Identidade

1. `repository` ausente;
2. `repository.id` ausente;
3. `repository.id` divergente;
4. `repository.full_name` ausente;
5. `repository.full_name` divergente;
6. `head_repository` ausente;
7. `head_repository.id` ausente;
8. `head_repository.id` divergente;
9. `head_repository.full_name` ausente;
10. `head_repository.full_name` divergente;
11. `repository.id` correto e `head_repository.id` incorreto;
12. run de fork rejeitado.

### Hashes

13. hash ausente;
14. hash vazio;
15. hash curto;
16. hash longo;
17. carácter não hexadecimal;
18. sidecar ausente;
19. ficheiro físico ausente;
20. nome do ficheiro divergente no sidecar;
21. hash esperado diferente do hash físico;
22. hash do Intake ausente;
23. hash da Etapa A ausente;
24. hash da Etapa B ausente;
25. Intake e Etapa A divergentes;
26. Etapa A e Etapa B divergentes;
27. duas fontes canónicas contraditórias.

Cada teste deve confirmar uma exceção produzida pelo código de produção ou `exit code != 0`. O próprio teste não pode fabricar manualmente a exceção esperada.

---

## 5. Ficheiros autorizados

Limite preferencialmente as alterações a:

```text
scripts/verify-operational-pilot-closure-chain.mjs
packages/runtime/src/test/microPatchFinalCoherenceProtectionReview.test.ts
```

Se precisar de reutilizar uma função comum existente em `scripts/lib/`, explique a necessidade no relatório. Não altere workflows, `package.json`, classificações ou modos de execução.

---

## 6. Execução autorizada

Está autorizado a:

1. implementar apenas os dois blocos deste subprompt;
2. executar build, typecheck e testes;
3. criar um único commit;
4. fazer push;
5. aguardar e reportar a CI.

Não inicie:

```text
Operational Pilot - Intake de Pacote Externo
Operational Pilot - Etapa A
Operational Pilot - Etapa B
Operational Pilot - Atestação Independente da Cadeia
```

---

## 7. Critérios de aceitação

```text
[ ] repository.id é obrigatório nos quatro runs
[ ] head_repository.id é obrigatório nos quatro runs
[ ] repository.full_name é obrigatório nos quatro runs
[ ] head_repository.full_name é obrigatório nos quatro runs
[ ] nenhum fallback de identidade permanece
[ ] fork ou repositório divergente falha
[ ] todos os hashes obrigatórios existem
[ ] todos os hashes têm formato SHA-256 estrito
[ ] todos os sidecars apontam para o ficheiro físico correto
[ ] hashes físicos são recalculados
[ ] ausência de qualquer hash obrigatório falha
[ ] divergência de qualquer hash obrigatório falha
[ ] reconciliação Intake → Etapa A → Etapa B é fail-closed
[ ] estados de identidade e hash são calculados
[ ] testes positivos passam
[ ] testes negativos passam
[ ] build e typecheck passam
[ ] CI termina em completed/success
[ ] nenhum workflow da cadeia operacional é iniciado
```

Qualquer item não comprovado deve ser declarado:

```text
NOT_PROVEN
```

---

## 8. Relatório final obrigatório

Apresente:

1. SHA inicial e SHA final;
2. ficheiros alterados;
3. funções de produção criadas ou modificadas;
4. ocorrências permissivas removidas;
5. lista dos hashes obrigatórios e respetivas fontes;
6. testes positivos;
7. testes negativos;
8. resultado de build, typecheck e testes;
9. contagem real dos testes;
10. ID e URL da CI;
11. confirmação de que a cadeia operacional não foi iniciada;
12. matriz preenchida.

| Requisito | Função de produção | Teste positivo | Teste negativo | Resultado | Evidência |
|---|---|---|---|---|---|
| `repository.id` |  |  |  |  |  |
| `head_repository.id` |  |  |  |  |  |
| `repository.full_name` |  |  |  |  |  |
| `head_repository.full_name` |  |  |  |  |  |
| SHA-256 estrito |  |  |  |  |  |
| Sidecar físico |  |  |  |  |  |
| Hash do Intake |  |  |  |  |  |
| Hash da Etapa A |  |  |  |  |  |
| Hash da Etapa B |  |  |  |  |  |
| Reconciliação transversal |  |  |  |  |  |
| CI oficial |  |  |  |  |  |

---

## 9. Classificação permitida

Somente se todos os critérios forem demonstrados:

```text
SUBPROMPT_2_CANONICAL_REPOSITORY_IDENTITY_IMPLEMENTED
SUBPROMPT_2_HASH_TRUTH_IMPLEMENTED
CI_VALIDATED
FULL_CHAIN_EXECUTION_NOT_YET_AUTHORISED
REAL_PILOT_BLOCKED
```

Não declare ainda:

```text
SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED
OPERATIONAL_PILOT_VALIDATED
REAL_PILOT_AUTHORISED
```
