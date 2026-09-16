# Prompt — Último micro-patch de atestação fail-closed

## Repositório

Trabalhar exclusivamente em:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

## Estado confirmado

- Branch: `master`.
- SHA auditado: `83fb1e462f7a16ce9bb1d5a77ffad46b1653184c`.
- CI principal: execução `35158616025`, conclusão `success`.
- Verificação remota: execução `35158862255`, conclusão `success`.
- Bundle remoto: artefacto `10472385471`.
- Atestação publicada: artefacto `10472098725`.
- Checkout limpo: `npm ci`, `npm audit --omit=dev` e `npm run verify` terminaram com exit code `0`.
- Testes: 480 aprovados, zero falhas, ignorados ou cancelados.
- Classificação: `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`.
- Estado operacional: `PRE-PRODUCTION / L2 HARDENED`.

## Objectivo

Não criar outro grande patch nem alterar funcionalidades do produto. Corrigir somente as cinco lacunas finais de proveniência e atestação:

1. remover fallbacks que fabricam `success`, `PASS` ou tentativa `1`;
2. exigir `head_sha`, `run_attempt`, repositório e workflow na resposta remota;
3. registar `remote_synced_at` somente depois de concluídas as consultas;
4. criar um verificador específico para `final-attestation.json`;
5. não declarar a conclusão da execução remota antes de ela realmente terminar.

---

## 1. Eliminar todos os fallbacks materiais

Remover de `scripts/generate-final-attestation.mjs`, `scripts/sync-remote-ci-receipt.mjs` e verificadores relacionados qualquer comportamento equivalente a:

```javascript
receipt.conclusion || 'success'
remote_conclusion: 'success'
status: 'PASS'
remoteApiData.run_attempt || 1
process.env.EXPECTED_QUERY_ACTOR || 'actor-fixo'
```

### Regras obrigatórias

- Ausência de conclusão, actor, tentativa, SHA, ID, URL, repositório, workflow ou data deve causar falha fechada.
- Não converter campo ausente em valor aparentemente válido.
- `run_attempt` deve existir, ser inteiro e ser maior ou igual a `1`.
- `status` e `conclusion` devem resultar de evidências verificadas, nunca de constantes usadas como prova.
- A classificação e o estado operacional podem ser valores de política explicitamente fornecidos, mas devem ser validados contra listas canónicas.

---

## 2. Fortalecer a resposta autoritativa da execução remota

Em `scripts/sync-remote-ci-receipt.mjs`, exigir que a resposta física da API contenha:

- `id`;
- `run_attempt`;
- `head_sha`;
- `head_branch`;
- `status`;
- `run_started_at`;
- `created_at`;
- `updated_at`;
- `html_url`;
- `actor.login` ou `triggering_actor.login`;
- `repository.full_name`;
- identificação inequívoca do workflow, através de `name`, `workflow_id` e/ou `path`.

### Validações obrigatórias

O verificador deve recalcular e comprovar, a partir de `remote-workflow-run-api-response.json`, que:

- `repository.full_name === "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES"`;
- `head_branch === "master"`;
- `head_sha` coincide exactamente com o SHA validado;
- `id` coincide com `remote_verification_run_id` e `query_run_id`;
- `run_attempt` coincide com o recibo e não foi preenchido por fallback;
- `html_url` corresponde ao repositório e ao ID exactos;
- o workflow é `Evidence Remote Verification` e corresponde ao ficheiro esperado;
- o actor coincide com `remote_actor`, `query_actor` e `EXPECTED_QUERY_ACTOR`;
- o hash SHA-256 da resposta corresponde aos bytes físicos preservados.

Qualquer campo ausente ou divergente deve bloquear o gate.

---

## 3. Corrigir `remote_synced_at`

Actualmente `remote_synced_at` é atribuído antes das consultas. Corrigir a ordem:

1. consultar a CI principal;
2. consultar a execução remota;
3. preservar a resposta bruta;
4. consultar os jobs exigidos;
5. consultar a protecção do branch;
6. escrever os recibos e recalcular os hashes;
7. somente então atribuir `remote_synced_at` imediatamente antes da gravação final do recibo e do índice.

Validar obrigatoriamente:

```text
remote_started_at - 60 segundos <= queried_at <= remote_synced_at + 60 segundos
```

Também exigir:

```text
remote_started_at <= remote_synced_at
created_at <= updated_at
```

Datas ausentes, inválidas ou cronologicamente impossíveis devem causar falha.

---

## 4. Criar um verificador específico da atestação

Criar:

```text
scripts/verify-final-attestation.mjs
```

O script deve receber argumentos explícitos, por exemplo:

```bash
node scripts/verify-final-attestation.mjs \
  --attestation .artifacts/attestation/final-attestation.json \
  --evidence-dir .artifacts/evidence \
  --sha "$EXPECTED_SHA" \
  --primary-run-id "$PRIMARY_RUN_ID" \
  --remote-run-id "$REMOTE_RUN_ID" \
  --artifact-id "$EVIDENCE_ARTIFACT_ID" \
  --expected-actor "$EXPECTED_ACTOR"
```

### O verificador deve comprovar

- ficheiro presente e JSON válido;
- schema Ajv próprio com `additionalProperties: false`;
- todos os campos obrigatórios presentes;
- SHA com 40 caracteres hexadecimais e igual ao SHA esperado;
- repositório e branch exactos;
- IDs inteiros positivos e correspondentes às execuções reais;
- `primary_run_id !== remote_verification_run_id`;
- `query_run_id === remote_verification_run_id`;
- actor coerente com a resposta remota e o actor esperado;
- `primary_conclusion === "success"` obtido da resposta física da API da CI principal;
- `remote_conclusion === "success"` obtido somente depois da conclusão remota;
- artefacto existente, não expirado, associado ao mesmo SHA e à execução remota correcta;
- nome do artefacto igual ao padrão canónico;
- `evidence_index_sha256` igual ao hash físico de `evidence-files.sha256`;
- classificação pertencente à lista canónica;
- estado operacional exactamente `PRE-PRODUCTION / L2 HARDENED`;
- `status === "PASS"` somente quando todos os gates anteriores forem aprovados;
- atestação e artefactos não estão versionados no Git.

O verificador deve terminar com exit code diferente de zero diante de qualquer ausência, divergência ou valor não comprovado.

Adicionar a execução explícita deste verificador ao workflow final antes do upload definitivo da atestação.

---

## 5. Declarar a conclusão remota somente depois do encerramento real

Uma execução não pode certificar a própria conclusão enquanto ainda está em curso. Implementar um workflow finalizador separado, disparado por `workflow_run` após a conclusão de `Evidence Remote Verification`.

Nome recomendado:

```text
.github/workflows/final-attestation.yml
```

### Fluxo obrigatório

```text
CI principal concluída com success
        ↓
Evidence Remote Verification concluída com success
        ↓
Final Attestation workflow consulta ambas as execuções pela API
        ↓
Descarrega e verifica o bundle remoto
        ↓
Gera final-attestation.json com dados concluídos
        ↓
Executa verify-final-attestation.mjs
        ↓
Publica a atestação e o Job Summary
```

### Condições obrigatórias

- O workflow finalizador só deve executar quando a verificação remota tiver `status: completed` e `conclusion: success`.
- Mesmo com a condição do workflow, deve consultar a API e preservar a resposta física final da execução remota.
- Deve obter o SHA e o ID da CI principal a partir de recibos verificados, nunca por aproximação.
- Deve identificar o bundle remoto real pela API e rejeitar artefacto ausente, expirado, duplicado ou associado a outro SHA/run.
- Deve gerar a atestação apenas depois de validar todas essas provas.
- Não deve efectuar commits no repositório.
- Não deve disparar recursivamente outro workflow de atestação.
- O artefacto final deve ter nome determinístico:

  ```text
  aetf-final-attestation-${SHA}
  ```

- Se for necessário distinguir a atestação anterior ainda não final, renomeá-la como `provisional-attestation` ou removê-la do workflow remoto. Apenas o workflow finalizador pode publicar a atestação com estado final `PASS`.

---

## Testes negativos obrigatórios

Adicionar testes determinísticos para provar falha quando:

1. `run_attempt` está ausente;
2. `head_sha` está ausente;
3. repositório está ausente ou divergente;
4. workflow está ausente ou divergente;
5. `remote_synced_at` antecede `remote_started_at`;
6. `remote_conclusion` está ausente;
7. `remote_conclusion` ainda é `null`, `in_progress`, `queued`, `failure` ou `cancelled`;
8. `primary_conclusion` não é `success`;
9. `status: PASS` aparece sem todos os gates aprovados;
10. SHA, actor ou IDs da atestação divergem das respostas físicas;
11. artefacto está ausente, expirado ou ligado a outro SHA;
12. hash do índice diverge dos bytes físicos;
13. atestação contém propriedade não permitida pelo schema;
14. verificador é chamado com argumento obrigatório ausente;
15. tentativa de usar fallback `success`, `PASS`, actor fixo ou tentativa `1` é detectada;
16. o workflow finalizador é activado por execução remota não concluída ou não aprovada.

Incluir testes da interface CLI real com `spawnSync`, além dos testes unitários.

---

## Execução obrigatória

Num checkout limpo do SHA final:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
```

Depois executar a cadeia real no GitHub:

1. CI principal;
2. verificação remota;
3. workflow finalizador;
4. verificação da atestação final;
5. publicação dos artefactos.

Registar, sem novo commit documental:

- SHA validado;
- ID, URL, estado e conclusão da CI principal;
- ID, URL, estado, conclusão e tentativa da verificação remota;
- ID, URL e conclusão do workflow finalizador;
- IDs, nomes, tamanhos, hashes e estado de expiração dos artefactos;
- actor validado;
- horários autoritativos;
- hash físico do índice;
- resultado do verificador da atestação.

---

## Critérios de aceitação

O micro-patch só está concluído quando:

- não existem fallbacks materiais para `success`, `PASS`, actor ou tentativa;
- todos os campos obrigatórios da resposta remota são exigidos e validados;
- `remote_synced_at` é gravado depois das consultas;
- existe um schema e um verificador específico da atestação;
- a atestação final é gerada somente após a execução remota estar concluída com sucesso;
- o verificador da atestação passa no caminho positivo e falha em todos os cenários negativos;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` terminam com exit code `0`;
- os três workflows terminam com `success` no mesmo SHA;
- os artefactos físicos podem ser descarregados e verificados;
- `.artifacts/` continua não versionado;
- não é criado outro commit apenas para inserir resultados da própria CI;
- a classificação permanece `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`;
- o estado permanece `PRE-PRODUCTION / L2 HARDENED`.

## Restrições

- Não criar módulos funcionais.
- Não alterar autenticação, pagamentos, interface, employees ou integração AGT.
- Não promover o projecto para produção.
- Não fabricar conclusões, datas, actores, IDs, hashes ou resultados.
- Não usar tolerâncias para ocultar ordem temporal incorrecta.
- Não aceitar falha de API como sucesso.
- Não versionar logs, bundles ou atestações de execução.
- Não criar uma cadeia infinita de commits documentais.

## Entrega esperada

Apresentar um resumo curto contendo:

- ficheiros alterados;
- SHA final;
- testes adicionados;
- resultados dos comandos locais;
- IDs e URLs dos três workflows;
- IDs e nomes dos artefactos;
- resultado de `verify-final-attestation.mjs`;
- confirmação de ausência dos fallbacks proibidos;
- confirmação de que a atestação foi emitida somente após a conclusão remota;
- classificação e estado operacional mantidos.
