# Prompt — Micro-Patch Final: Fontes Duplicadas, Caminho Exacto e Gate Real

## Contexto

Repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Commit de partida auditado:

```text
cf37964cff8df3a059f5019659f68c10365f5d44
```

O micro-patch de verdade física dos hashes foi maioritariamente implementado e a CI terminou com sucesso. Restam apenas três lacunas específicas:

1. fontes duplicadas entre a raiz e `evidence/` podem ser silenciosamente ignoradas;
2. a verificação operacional do índice da Etapa B ainda usa fallback de localização;
3. o teste 9.2.23 não executa o bloqueio real de produção.

Não aumente a arquitectura. Não reabra pontos já aprovados. Aplique exclusivamente as três correcções abaixo.

---

## 1. Validar todas as fontes duplicadas presentes

### Problema

A lógica actual selecciona apenas a primeira fonte encontrada:

```javascript
const pInput = fs.existsSync(rootInput)
  ? rootInput
  : fs.existsSync(evidenceInput)
    ? evidenceInput
    : null;
```

Este comportamento ignora uma segunda fonte fisicamente presente. Por exemplo:

```text
input-package.sha256
evidence/input-package.sha256
```

Se a fonte da raiz for válida e a fonte em `evidence/` estiver malformada, não indexada, adulterada ou contraditória, a execução pode continuar.

### Correcção obrigatória

Em `extractPackageHashFromBundle()`, recolha todas as fontes candidatas existentes, sem preferência silenciosa entre raiz e `evidence/`.

Aplique isto, pelo menos, a:

```text
input-package.sha256
evidence/input-package.sha256
original-package.sha256
evidence/original-package.sha256
consumed-stage-a.json
evidence/consumed-stage-a.json
```

Inclua também qualquer outra fonte JSON que o código de produção reconheça como fornecedora de hashes da cadeia.

Para cada fonte fisicamente presente, exija:

1. autenticação pelo índice aplicável;
2. caminho relativo canónico exacto;
3. correspondência do hash do índice com os bytes da própria fonte;
4. parsing e estrutura válidos;
5. hashes internos obrigatórios válidos;
6. correspondência com os bytes físicos referidos, quando for `.sha256`;
7. coerência com todas as outras fontes presentes.

Uma fonte presente nunca pode ser ignorada por existir outra fonte válida.

Devem falhar:

- fonte válida na raiz e fonte malformada em `evidence/`;
- fonte válida na raiz e fonte não indexada em `evidence/`;
- fonte válida na raiz e fonte adulterada em `evidence/`;
- duas fontes válidas com hashes diferentes;
- JSON válido na raiz e JSON contraditório em `evidence/`;
- `.sha256` válido na raiz e `.sha256` contraditório em `evidence/`;
- qualquer combinação em que uma fonte presente não possa ser autenticada.

Se as duas fontes forem válidas, autenticadas e coerentes, a execução pode prosseguir. Preserve no resultado interno a lista dos caminhos exactos validados para permitir auditoria.

Não use:

```text
fonteDaRaiz || fonteEvidence
primeira fonte encontrada
fallback silencioso
comparação por basename
```

---

## 2. Remover o fallback `stageBEvidenceBase → stageBExtractDir`

### Problema

Na validação operacional do índice da Etapa B ainda existe lógica semelhante a:

```javascript
const filePath = fs.existsSync(path.join(stageBEvidenceBase, canonicalFile))
  ? path.join(stageBEvidenceBase, canonicalFile)
  : path.join(stageBExtractDir, canonicalFile);
```

Isto permite que uma entrada do índice como:

```text
documento.json
```

seja associada a:

```text
evidence/documento.json
```

apenas porque o segundo ficheiro existe.

### Correcção obrigatória

Depois de carregar o índice relativamente a `stageBExtractDir`, resolva cada entrada unicamente contra essa mesma raiz:

```javascript
const filePath = path.join(stageBExtractDir, canonicalFile);

verifyFileAgainstPackageIndex(
  stageBExtractDir,
  filePath,
  indexMap
);
```

O caminho do índice deve ter correspondência exacta:

```text
documento.json          → <stageBExtractDir>/documento.json
evidence/documento.json → <stageBExtractDir>/evidence/documento.json
```

Não procure o ficheiro noutra base. Não tente primeiro em `stageBEvidenceBase`. Não aceite basename, alias, sufixo ou caminho alternativo.

Reutilize `verifyFileAgainstPackageIndex()` para cada entrada, em vez de repetir manualmente a comparação dos hashes.

O estado:

```text
evidence_index_hashes_verified
```

só pode ser `true` depois de todas as entradas do índice terem sido resolvidas pelo caminho exacto e verificadas pela função de produção.

---

## 3. Fazer o teste 9.2.23 executar o gate real de produção

### Problema

O teste actual cria manualmente um objecto e calcula:

```javascript
Object.values(invalidStates).every(v => v === true)
```

Esse teste não demonstra que o verificador operacional bloqueia uma atestação positiva.

### Correcção obrigatória

Crie ou extraia uma função de produção única, por exemplo:

```javascript
assertMandatoryVerificationStates(states)
```

O nome pode variar, mas a função deve:

1. receber explicitamente todos os estados obrigatórios;
2. exigir que cada estado seja exactamente `true`;
3. rejeitar `false`, `null`, `undefined`, zero, strings ou campos ausentes;
4. identificar na mensagem de erro todos os estados que não foram comprovados;
5. lançar uma excepção fail-closed antes da emissão da atestação positiva;
6. ser chamada efectivamente por `runVerification()` no caminho operacional.

Estados mínimos:

```text
canonical_repository_chain_verified
intake_package_hash_verified
stage_a_input_hash_verified
stage_b_preserved_hash_verified
cross_stage_package_hash_reconciled
api_response_hashes_verified
evidence_index_hashes_verified
artifact_zip_hashes_computed
same_sha_chain_verified
```

Substitua o teste 9.2.23 por um teste que chame essa função real e confirme a excepção quando um estado obrigatório for `false`.

Acrescente também:

- teste positivo em que todos os estados são `true`;
- teste com campo ausente;
- teste com `null`;
- teste com string `"true"`, que deve falhar;
- confirmação de que o gate é chamado antes da gravação de `chain-attestation.json` positiva.

Não replique a lógica do gate dentro dos testes.

---

## 4. Testes obrigatórios adicionais

Todos os testes devem importar e executar funções reais utilizadas no caminho operacional.

### Fontes duplicadas

1. raiz válida + `evidence/` válida e coerente passa;
2. raiz válida + `evidence/` malformada falha;
3. raiz válida + `evidence/` não indexada falha;
4. raiz válida + `evidence/` fisicamente adulterada falha;
5. duas fontes `.sha256` autenticadas mas contraditórias falham;
6. dois JSON autenticados mas contraditórios falham;
7. uma das fontes duplicadas com caminho incorrecto no índice falha.

### Caminho exacto do índice

8. índice contém `documento.json` e apenas o ficheiro da raiz autentica essa entrada;
9. índice contém `evidence/documento.json` e apenas o ficheiro em `evidence/` autentica essa entrada;
10. existem ambos os ficheiros, mas o ficheiro correspondente ao caminho exacto foi adulterado: deve falhar, mesmo que o homónimo esteja íntegro;
11. existem ambos os ficheiros e apenas o homónimo alternativo coincide com o hash: deve falhar.

### Gate de produção

12. todos os estados exactamente `true` passam;
13. um estado `false` falha;
14. estado ausente falha;
15. estado `null` falha;
16. estado textual `"true"` falha;
17. o teste 9.2.23 chama a função real de produção;
18. falha do gate impede a criação de atestação positiva.

---

## 5. Ficheiros autorizados

Limite as alterações a:

```text
scripts/verify-operational-pilot-closure-chain.mjs
packages/runtime/src/test/microPatchFinalCoherenceProtectionReview.test.ts
```

Não altere o prompt já versionado, workflows, `package.json`, classificações ou outros módulos.

---

## 6. Execução autorizada

Está autorizado a:

1. aplicar apenas estas três correcções;
2. executar verificação sintáctica;
3. executar build e typecheck;
4. executar testes;
5. criar um único commit;
6. fazer push;
7. aguardar e reportar a CI.

Não execute:

```text
Operational Pilot - Intake de Pacote Externo
Operational Pilot - Etapa A
Operational Pilot - Etapa B
Operational Pilot - Atestação Independente da Cadeia
```

---

## 7. Critérios de aceitação

```text
[ ] todas as fontes candidatas fisicamente presentes são examinadas
[ ] nenhuma fonte duplicada é ignorada
[ ] cada fonte duplicada é autenticada pelo caminho exacto no índice
[ ] fontes duplicadas coerentes passam
[ ] qualquer fonte duplicada inválida provoca falha
[ ] fontes duplicadas contraditórias provocam falha
[ ] fallback stageBEvidenceBase → stageBExtractDir foi removido
[ ] cada entrada do índice resolve apenas contra stageBExtractDir
[ ] verifyFileAgainstPackageIndex é usado no loop operacional
[ ] homónimos em caminhos diferentes não são intercambiáveis
[ ] existe uma função real de gate dos estados obrigatórios
[ ] runVerification chama o gate antes da atestação positiva
[ ] teste 9.2.23 executa o gate real de produção
[ ] false, null, undefined, string e campo ausente falham
[ ] falha do gate impede chain-attestation.json positiva
[ ] novos testes positivos passam
[ ] novos testes negativos passam
[ ] build e typecheck passam
[ ] CI termina em completed/success
[ ] nenhum workflow operacional da cadeia é iniciado
```

---

## 8. Relatório final obrigatório

Apresente:

1. SHA completo do commit;
2. ficheiros alterados;
3. funções modificadas ou criadas;
4. demonstração de que todas as fontes duplicadas são avaliadas;
5. demonstração de que o fallback de caminho foi removido;
6. indicação da função real chamada pelo teste 9.2.23;
7. testes executados, aprovados e falhados;
8. link e estado da CI;
9. confirmação de que nenhum workflow operacional foi iniciado;
10. matriz `requisito → função de produção → teste → resultado`.

Mantenha estas classificações até nova auditoria:

```text
READY_FOR_EXTERNAL_REAUDIT
SAME_SHA_VALIDATION_NOT_YET_EXECUTED
REAL_PILOT_BLOCKED
```

Não declare o piloto real autorizado.
