# Prompt — Fecho forense das conclusões por respostas físicas da API

## Repositório

Trabalhar exclusivamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

## Estado inicial confirmado

- Branch: `master`.
- SHA actual: `a87892f281f3d1a021c0820ddb06ca7cb30f6546`.
- CI principal: execução `35161857571`, conclusão `success`.
- Verificação remota: execução `35162100923`, conclusão `success`.
- Workflow finalizador: execução `35162135584`, conclusão `success`.
- Bundle remoto verificado: artefacto `10473327725`.
- Atestação final: artefacto `10473905089`.
- `npm ci`: exit code `0`.
- `npm audit --omit=dev`: exit code `0`, zero vulnerabilidades.
- `npm run verify`: exit code `0`, com 497 testes aprovados e zero falhas, testes ignorados ou cancelados.
- Classificação: `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`.
- Estado operacional: `PRE-PRODUCTION / L2 HARDENED`.

## Objectivo único

Não criar outro módulo nem alterar funcionalidades do produto. Resta somente fechar a proveniência física das conclusões:

> Fazer `scripts/verify-final-attestation.mjs` consumir e validar a resposta final da API da execução remota e uma resposta física equivalente da CI principal, comprovando `status: completed` e `conclusion: success` directamente dos ficheiros preservados.

---

## 1. Preservar as duas respostas finais autoritativas

No workflow `.github/workflows/final-attestation.yml`, depois de a verificação remota estar concluída, consultar pela API do GitHub:

1. a CI principal indicada por `primary_run_id`;
2. a execução remota indicada por `github.event.workflow_run.id`.

Preservar as respostas completas, sem reconstrução manual, nos ficheiros:

```text
.artifacts/final-evidence/final-primary-run-api-response.json
.artifacts/final-evidence/final-remote-run-api-response.json
```

Não reutilizar `remote-workflow-run-api-response.json` como prova da conclusão final, porque esse ficheiro foi capturado enquanto a execução remota ainda estava em curso.

### Requisitos dos ficheiros

Cada resposta final deve conter, no mínimo:

- `id`;
- `name` e/ou `path`;
- `head_sha`;
- `head_branch`;
- `run_attempt`;
- `status`;
- `conclusion`;
- `run_started_at`;
- `created_at`;
- `updated_at`;
- `html_url`;
- `actor.login` ou `triggering_actor.login`;
- `repository.full_name`.

Qualquer resposta ausente, vazia, inválida ou incompleta deve interromper o workflow.

---

## 2. Criar um índice físico final

Criar, em `.artifacts/final-evidence/`, o ficheiro:

```text
final-evidence-files.sha256
```

O índice deve conter os hashes SHA-256 físicos de:

```text
final-primary-run-api-response.json
final-remote-run-api-response.json
```

Se a resposta da API dos artefactos for usada pelo verificador, preservá-la também:

```text
final-remote-artifacts-api-response.json
```

e incluí-la no mesmo índice.

Executar antes da geração da atestação:

```bash
cd .artifacts/final-evidence
sha256sum -c final-evidence-files.sha256
```

Os ficheiros devem permanecer fora do Git e ser incluídos no artefacto final da atestação.

---

## 3. Alterar o gerador da atestação

Actualizar `scripts/generate-final-attestation.mjs` para receber explicitamente:

```text
--primary-run-response
--remote-run-response
--final-evidence-index
```

Exemplo:

```bash
node scripts/generate-final-attestation.mjs \
  --dir .artifacts/evidence \
  --output .artifacts/attestation \
  --primary-run-response .artifacts/final-evidence/final-primary-run-api-response.json \
  --remote-run-response .artifacts/final-evidence/final-remote-run-api-response.json \
  --final-evidence-index .artifacts/final-evidence/final-evidence-files.sha256 \
  --sha "$EXPECTED_SHA" \
  --primary-run-id "$PRIMARY_RUN_ID" \
  --remote-run-id "$REMOTE_RUN_ID" \
  --artifact-id "$EVIDENCE_ARTIFACT_ID" \
  --actor "$EXPECTED_ACTOR" \
  --classification PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS
```

### Regras obrigatórias

- Não receber `--primary-conclusion` nem `--remote-conclusion` como fonte autoritativa.
- Derivar ambas as conclusões das respostas físicas finais.
- Derivar também os estados, IDs, URLs, SHAs, tentativas, actores e datas dessas respostas.
- Gerar `status: PASS` somente se as duas respostas demonstrarem `status: completed` e `conclusion: success`, e os restantes campos forem coerentes.
- Não aceitar fallbacks, valores padrão ou dados contraditórios.
- Registar na atestação:

  ```json
  {
    "primary_status": "completed",
    "primary_conclusion": "success",
    "remote_status": "completed",
    "remote_conclusion": "success",
    "primary_response_sha256": "<hash físico>",
    "remote_response_sha256": "<hash físico>",
    "final_evidence_index_sha256": "<hash físico do índice final>"
  }
  ```

Actualizar o schema Ajv com estes campos como obrigatórios e manter `additionalProperties: false`.

---

## 4. Fazer o verificador consumir as respostas finais

Actualizar `scripts/verify-final-attestation.mjs` para exigir:

```text
--primary-run-response
--remote-run-response
--final-evidence-index
```

O verificador deve falhar se qualquer argumento ou ficheiro estiver ausente.

### Validação da resposta final da CI principal

Recalcular directamente do JSON físico:

- `id === primary_run_id`;
- `status === "completed"`;
- `conclusion === "success"`;
- `head_sha === attested_commit_sha`;
- `head_branch === "master"`;
- `repository.full_name === "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES"`;
- workflow igual a `CI / Production Readiness & Audit Gate`;
- `run_attempt` inteiro e maior ou igual a `1`;
- URL ligada ao mesmo repositório e ID;
- actor presente e coerente;
- datas presentes, válidas e cronologicamente coerentes.

### Validação da resposta final remota

Recalcular directamente do JSON físico:

- `id === remote_verification_run_id`;
- `query_run_id === remote_verification_run_id`;
- `status === "completed"`;
- `conclusion === "success"`;
- `head_sha === attested_commit_sha`;
- `head_branch === "master"`;
- `repository.full_name` correcto;
- workflow igual a `Evidence Remote Verification`;
- `run_attempt` inteiro e maior ou igual a `1`;
- URL ligada ao mesmo repositório e ID;
- actor igual a `query_actor` e ao actor esperado;
- datas presentes, válidas e cronologicamente coerentes.

### Validação física

O verificador deve:

- calcular os hashes dos dois ficheiros finais;
- comparar os hashes com `final-evidence-files.sha256`;
- comparar os hashes com os campos da atestação;
- calcular o hash físico do próprio índice final;
- compará-lo com `final_evidence_index_sha256`;
- rejeitar ficheiro extra não indexado quando fizer parte do conjunto canónico final;
- rejeitar alterações de um único byte.

Não considerar válidos os valores de conclusão recebidos por CLI, variáveis de ambiente ou contexto do workflow se não coincidirem com os ficheiros físicos.

---

## 5. Verificar o artefacto a partir da resposta física da API

Se `final-remote-artifacts-api-response.json` for preservado, o verificador deve confirmar directamente dessa resposta:

- existência de exactamente um bundle com o nome esperado;
- ID igual ao `artifact_id` da atestação;
- `expired === false`;
- associação à execução remota correcta;
- SHA igual ao SHA atestado;
- tamanho maior que zero.

Artefacto ausente, duplicado, expirado, vazio ou ligado a outra execução/SHA deve causar falha.

---

## 6. Corrigir o workflow finalizador

O fluxo final deve ser:

```text
Descarregar bundle remoto
        ↓
Validar hashes do bundle
        ↓
Consultar e preservar resposta final da CI principal
        ↓
Consultar e preservar resposta final da execução remota
        ↓
Consultar e preservar metadados do artefacto
        ↓
Gerar final-evidence-files.sha256
        ↓
Validar os hashes finais
        ↓
Gerar final-attestation.json
        ↓
Executar verify-final-attestation.mjs com os ficheiros físicos
        ↓
Publicar atestação e evidências finais no mesmo artefacto
```

O artefacto final deve conter:

```text
final-attestation.json
final-attestation.md
final-primary-run-api-response.json
final-remote-run-api-response.json
final-remote-artifacts-api-response.json
final-evidence-files.sha256
```

Não criar commit documental para registar os IDs produzidos pela execução.

---

## Testes negativos obrigatórios

Adicionar testes determinísticos para provar falha quando:

1. resposta final principal está ausente;
2. resposta final remota está ausente;
3. qualquer resposta contém JSON inválido;
4. `status` principal ou remoto não é `completed`;
5. `conclusion` principal ou remota não é `success`;
6. conclusão presente na atestação diverge da resposta física;
7. ID principal ou remoto diverge;
8. SHA diverge ou está ausente;
9. repositório, branch ou workflow divergem;
10. actor remoto diverge;
11. `run_attempt` está ausente ou inválido;
12. URL não contém o ID e o repositório esperados;
13. datas estão ausentes, inválidas ou invertidas;
14. hash de qualquer resposta diverge;
15. índice final está ausente ou adulterado;
16. alteração de um byte numa resposta final não é detectada;
17. artefacto está ausente, duplicado, expirado, vazio ou ligado a outro SHA/run;
18. conclusões são fornecidas apenas por CLI, sem prova física.

Incluir pelo menos um teste da interface CLI real com `spawnSync`.

---

## Execução obrigatória

Num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
```

Depois executar no GitHub, para o mesmo SHA:

1. CI principal;
2. verificação remota;
3. workflow finalizador;
4. verificador da atestação;
5. upload do artefacto final completo.

## Critérios de aceitação

O fecho só pode ser declarado quando:

- as duas respostas finais da API estão fisicamente preservadas;
- as conclusões são derivadas exclusivamente dessas respostas;
- ambas comprovam `status: completed` e `conclusion: success`;
- hashes, índice final e atestação são coerentes;
- o verificador falha diante de qualquer ausência ou divergência;
- todos os testes negativos passam;
- os três workflows terminam com `success` no mesmo SHA;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` terminam com exit code `0`;
- o artefacto final contém a atestação e todas as respostas físicas;
- `.artifacts/` permanece não versionado;
- não é criado outro commit apenas para documentar resultados da CI;
- a classificação permanece `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`;
- o estado permanece `PRE-PRODUCTION / L2 HARDENED`.

## Restrições

- Não criar módulos funcionais.
- Não alterar autenticação, pagamentos, interface, employees ou integração AGT.
- Não promover o projecto para produção.
- Não confiar apenas no evento `workflow_run`, em variáveis de ambiente ou em argumentos CLI para comprovar conclusões.
- Não fabricar conclusões, IDs, datas, actores ou hashes.
- Não aceitar falha da API como sucesso.
- Não versionar artefactos ou respostas de execução.

## Entrega esperada

Apresentar um resumo curto contendo:

- ficheiros alterados;
- SHA final;
- número de testes adicionados e total aprovado;
- resultados dos comandos locais;
- IDs e URLs dos três workflows;
- ID e nome do artefacto final;
- hashes das duas respostas finais e do índice;
- resultado de `verify-final-attestation.mjs`;
- confirmação de que as conclusões foram derivadas dos ficheiros físicos;
- classificação e estado operacional mantidos.
