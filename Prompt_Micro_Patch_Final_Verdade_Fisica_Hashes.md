# Prompt — Micro-Patch Final de Verdade Física dos Hashes

## Contexto

Repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Commit de partida auditado:

```text
9b880b97baf4a678660dc8c0417bb9947aa287e8
```

O Subprompt 2 corrigiu satisfatoriamente a identidade canónica dos runs e introduziu validação estrita do formato SHA-256. Contudo, a auditoria concluiu que a reconciliação actual ainda demonstra sobretudo igualdade entre valores declarados, sem provar integralmente que cada valor deriva dos bytes físicos correctos e de uma fonte autenticada pelo índice aplicável.

Classificação actual:

```text
SUBPROMPT_2_PARTIALLY_VALIDATED
IDENTIDADE_CANONICA_VALIDATED
HASH_FORMAT_VALIDATED
HASH_FORENSIC_PROVENANCE_INCOMPLETE
SAME_SHA_VALIDATION_NOT_YET_AUTHORISED
REAL_PILOT_BLOCKED
```

Não aumente a arquitectura e não altere a solução de identidade canónica já aprovada. Aplique apenas o micro-patch forense descrito abaixo.

---

## 1. Escopo estrito

Corrigir exclusivamente a verdade física e a proveniência dos hashes utilizados pelo verificador:

```text
scripts/verify-operational-pilot-closure-chain.mjs
```

e acrescentar os testes correspondentes em:

```text
packages/runtime/src/test/microPatchFinalCoherenceProtectionReview.test.ts
```

Só altere outro ficheiro se for tecnicamente indispensável. Nesse caso, explique no relatório final por que a alteração foi necessária.

Não altere:

- classificações DEMO;
- regras de identidade canónica já aprovadas;
- workflows;
- modos de execução;
- configuração de protecção do ambiente;
- lógica de revisão humana;
- `package.json`;
- arquitectura geral da cadeia.

---

## 2. Autenticar pelo índice todas as fontes dos hashes

Cada ficheiro utilizado como fonte de um hash do Intake, Etapa A ou Etapa B deve ser autenticado pelo índice SHA-256 aplicável ao respectivo pacote.

Isto abrange, quando presentes ou exigidos pela etapa:

```text
input-package.sha256
original-package.sha256
consumed-stage-a.json
outros ficheiros JSON de linkage que forneçam hashes
```

Para cada fonte, o verificador deve demonstrar:

1. o caminho relativo canónico exacto do ficheiro dentro do pacote;
2. a existência desse caminho exacto no índice aplicável;
3. o hash esperado registado no índice;
4. o hash SHA-256 recalculado a partir dos bytes físicos da fonte;
5. a igualdade entre o hash esperado e o hash físico observado.

Utilize as funções de produção existentes:

```javascript
loadPackageIndexMap(extractDir)
verifyFileAgainstPackageIndex(extractDir, fullFilePath, indexMap)
```

Não crie uma segunda implementação mais permissiva.

É proibido autenticar uma fonte por:

- basename;
- procura parcial;
- sufixo do caminho;
- existência física sem entrada no índice;
- hash calculado no momento sem uma referência independente preservada;
- fallback entre raiz e `evidence/` sem resolver e autenticar o caminho exacto realmente utilizado.

Se uma fonte estiver presente mas não estiver indexada pelo caminho canónico exacto, encerre com erro.

---

## 3. Verificar fisicamente os ficheiros referidos pelos `.sha256`

Cada ficheiro `.sha256` utilizado na reconciliação deve conter, no formato adoptado pelo projecto:

```text
<sha256>  <caminho-relativo-canónico-do-ficheiro>
```

O verificador deve exigir simultaneamente:

- exactamente um hash SHA-256 válido;
- nome ou caminho do ficheiro referido;
- caminho relativo, canónico e sem escape;
- existência do ficheiro físico referido;
- permanência do ficheiro dentro do directório extraído;
- correspondência exacta entre o caminho declarado e o ficheiro validado;
- recálculo SHA-256 dos bytes físicos do ficheiro referido;
- igualdade entre o hash declarado e o hash físico observado.

Devem falhar:

- `.sha256` ausente;
- `.sha256` vazio;
- linha malformada;
- mais de uma entrada quando apenas uma é permitida;
- hash ausente ou malformado;
- caminho ausente;
- caminho absoluto;
- caminho com `..`;
- ficheiro referido ausente;
- caminho declarado diferente do caminho físico;
- bytes físicos adulterados;
- hash declarado correspondente a outro ficheiro.

Não basta extrair o primeiro campo do `.sha256` e compará-lo com os valores das outras etapas.

---

## 4. Rejeitar fontes JSON inválidas ou não autenticadas

Se um ficheiro JSON candidato a fonte canónica estiver fisicamente presente, ele deve ser tratado como prova obrigatória e não pode ser silenciosamente ignorado.

O verificador deve falhar quando o JSON estiver:

- vazio;
- malformado;
- ilegível;
- fora do índice;
- indexado por caminho diferente;
- com hash físico divergente do índice;
- sem os campos mínimos exigidos para a sua função;
- com campos de hash ausentes, nulos ou malformados;
- em contradição com outra fonte válida.

Remova qualquer `catch` que absorva silenciosamente erros de parsing ou validação. O erro deve propagar-se como falha fechada com mensagem identificável.

Uma fonte presente mas inválida não pode ser substituída silenciosamente por outra fonte válida.

---

## 5. Comparar todos os campos de hash presentes

Não utilize selecção permissiva semelhante a:

```javascript
data.input_package_sha ||
data.package_hash ||
data.original_package_sha
```

Recolha separadamente todos os campos de hash reconhecidos que estejam presentes, incluindo pelo menos:

```text
input_package_sha
package_hash
original_package_sha
```

Para cada campo presente:

1. exija uma string SHA-256 válida;
2. normalize apenas letras hexadecimais maiúsculas para minúsculas;
3. preserve a identificação do campo e da fonte;
4. compare-o com todos os outros campos de hash presentes na mesma fonte;
5. compare-o com as demais fontes canónicas da etapa.

Se dois campos presentes tiverem valores diferentes, encerre com erro, mesmo que um deles coincida com o hash seleccionado por prioridade.

Não aceite `null`, string vazia, números, objectos ou arrays como valores de hash.

---

## 6. Remover definitivamente a comparação por basename

A função de produção:

```javascript
verifySidecarHash()
```

não pode validar identidade de ficheiros por:

```javascript
path.basename(...)
```

Compare o caminho relativo canónico exacto declarado no sidecar com o caminho relativo canónico exacto do ficheiro físico dentro da raiz autorizada.

Os seguintes caminhos são distintos e não podem autenticar-se mutuamente:

```text
evidence/api-response.json
archive/api-response.json
```

Mesmo que ambos tenham o basename `api-response.json`.

A função deve receber ou determinar explicitamente a raiz autorizada. Deve rejeitar qualquer ficheiro ou referência que escape dessa raiz.

Preserve a compatibilidade apenas para sidecars que declarem correctamente o caminho canónico exacto esperado. Não introduza fallback por basename.

---

## 7. Reutilizar o carregador estrito do índice

O caminho operacional não deve voltar a analisar manualmente o índice com lógica como:

```javascript
if (parts.length < 2) continue;
```

Reutilize `loadPackageIndexMap()` ou extraia uma única função comum de produção com o mesmo comportamento fail-closed.

Toda linha não vazia e não comentada deve:

- conter hash e caminho;
- ter hash SHA-256 estrito;
- ter caminho relativo canónico válido;
- não duplicar outro caminho canónico;
- referir um ficheiro existente;
- corresponder aos bytes físicos desse ficheiro.

Uma linha malformada nunca pode ser ignorada.

O estado:

```text
evidence_index_hashes_verified
```

só pode ser `true` depois de todas as entradas exigidas terem sido validadas. Não o derive apenas de uma contagem mínima de ficheiros.

---

## 8. Estados derivados obrigatórios

Os estados seguintes devem resultar de verificações físicas concluídas, e não apenas da presença ou do formato dos valores:

```text
intake_package_hash_verified
stage_a_input_hash_verified
stage_b_preserved_hash_verified
cross_stage_package_hash_reconciled
api_response_hashes_verified
evidence_index_hashes_verified
artifact_zip_hashes_computed
```

Em particular:

```text
intake_package_hash_verified
```

só pode ser `true` se a fonte estiver indexada, os seus bytes forem autênticos, o ficheiro referido existir e o hash declarado coincidir com os bytes desse ficheiro. Aplique a mesma regra à Etapa A e à Etapa B.

Depois da prova física individual, demonstre:

```text
hash físico publicado no Intake
= hash físico consumido pela Etapa A
= hash físico preservado ou referenciado pela Etapa B
```

Se qualquer prova for falsa, ausente ou não demonstrável, encerre com código diferente de zero e não produza uma atestação positiva.

---

## 9. Testes obrigatórios

Todos os testes devem importar e executar as funções reais usadas pelo caminho operacional. Não replique a lógica dentro do teste e não fabrique manualmente a excepção esperada.

### 9.1. Testes positivos

1. fonte `.sha256` indexada pelo caminho canónico exacto, apontando para ficheiro físico íntegro, passa;
2. fonte JSON válida, indexada e fisicamente íntegra passa;
3. JSON com dois ou três campos de hash iguais passa;
4. dois ficheiros com o mesmo basename em directórios diferentes são distinguidos pelos caminhos canónicos;
5. índice completo, sem linhas inválidas e com todos os bytes coincidentes, passa;
6. Intake, Etapa A e Etapa B com fontes autenticadas e o mesmo hash físico produzem reconciliação positiva.

### 9.2. Testes negativos

1. `.sha256` presente, mas não indexado;
2. `.sha256` indexado por caminho diferente;
3. `.sha256` apontando para ficheiro inexistente;
4. `.sha256` apontando para caminho absoluto;
5. `.sha256` apontando para caminho com `..`;
6. `.sha256` com caminho correcto, mas bytes físicos adulterados;
7. `.sha256` contendo hash válido de outro ficheiro;
8. dois caminhos diferentes com o mesmo basename;
9. fonte JSON presente, mas não indexada;
10. fonte JSON malformada coexistindo com um `.sha256` válido;
11. fonte JSON com hash físico divergente do índice;
12. JSON com `input_package_sha` e `package_hash` divergentes;
13. JSON com `package_hash` e `original_package_sha` divergentes;
14. campo de hash presente com valor `null`;
15. campo de hash presente com formato inválido;
16. duas fontes canónicas autenticadas, mas contraditórias;
17. linha não vazia do índice sem caminho;
18. linha não vazia do índice sem hash;
19. entrada duplicada para o mesmo caminho canónico;
20. ficheiro enumerado no índice ausente;
21. ficheiro enumerado no índice com bytes divergentes;
22. Intake, Etapa A e Etapa B com valores declarados iguais, mas bytes físicos diferentes;
23. qualquer estado obrigatório falso impede atestação positiva.

Inclua pelo menos um teste integrado que execute o mesmo encadeamento de funções utilizado operacionalmente para as três etapas.

---

## 10. Execução autorizada

Está autorizado a:

1. aplicar apenas este micro-patch;
2. executar verificação sintáctica;
3. executar build e typecheck;
4. executar a bateria de testes;
5. criar um único commit;
6. fazer push;
7. aguardar e reportar a CI do commit.

Não execute:

```text
Operational Pilot - Intake de Pacote Externo
Operational Pilot - Etapa A
Operational Pilot - Etapa B
Operational Pilot - Atestação Independente da Cadeia
```

Não reutilize artefactos antigos como prova de que o novo código operacional funciona.

---

## 11. Critérios de aceitação

```text
[ ] cada fonte de hash está autenticada pelo índice aplicável
[ ] a autenticação usa o caminho canónico exacto
[ ] nenhum basename é usado como prova de identidade
[ ] cada .sha256 aponta para o ficheiro físico exacto
[ ] os bytes do ficheiro referido são recalculados
[ ] o hash declarado coincide com os bytes físicos
[ ] JSON presente e malformado provoca falha
[ ] JSON presente e não indexado provoca falha
[ ] todos os campos de hash presentes são validados e comparados
[ ] campos contraditórios na mesma fonte provocam falha
[ ] fontes canónicas contraditórias provocam falha
[ ] nenhuma linha malformada do índice é ignorada
[ ] loadPackageIndexMap é reutilizado no caminho operacional
[ ] todas as entradas exigidas do índice são verificadas fisicamente
[ ] estados de verificação resultam de provas físicas
[ ] igualdade declarada sem igualdade física provoca falha
[ ] testes positivos passam
[ ] todos os testes negativos obrigatórios passam
[ ] build e typecheck passam
[ ] CI termina em completed/success
[ ] nenhum workflow operacional da cadeia é iniciado
```

---

## 12. Relatório final obrigatório

No final, apresente:

1. SHA completo do novo commit;
2. lista exacta dos ficheiros alterados;
3. explicação curta de cada alteração;
4. funções de produção criadas, eliminadas ou modificadas;
5. número de testes executados, aprovados e falhados;
6. link e estado da CI;
7. confirmação explícita de que nenhum workflow operacional foi iniciado;
8. matriz resumida `requisito → função de produção → teste → resultado`;
9. declaração expressa de que a execução same-SHA e o piloto real continuam bloqueados até nova auditoria externa.

Não declare o piloto real autorizado e não utilize classificações superiores às provas efectivamente produzidas.

## Resultado esperado desta execução

Se todos os critérios forem comprovados:

```text
FINAL_PHYSICAL_HASH_TRUTH_MICRO_PATCH_IMPLEMENTED
READY_FOR_EXTERNAL_REAUDIT
SAME_SHA_VALIDATION_NOT_YET_EXECUTED
REAL_PILOT_BLOCKED
```
