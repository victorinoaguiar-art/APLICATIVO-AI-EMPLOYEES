# Prompt — Fecho final de proveniência e atestação do SHA

## Repositório

Trabalhar exclusivamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

## Estado inicial confirmado

- Branch: `master`.
- SHA mais recente: `e189abee8fb073e21bd89ad43d1a632411c33e51`.
- CI principal do SHA mais recente: execução `35153948404`, conclusão `success`.
- Verificação remota do mesmo SHA: execução `35154177451`, conclusão `success`.
- Artefacto remoto do mesmo SHA: ID `10470860594`, nome `aetf-verified-remote-evidence-bundle-e189abee8fb073e21bd89ad43d1a632411c33e51`.
- `npm ci`: exit code `0`.
- `npm audit --omit=dev`: exit code `0`, zero vulnerabilidades.
- `npm run verify`: exit code `0`, com 464 testes aprovados e zero falhas, testes ignorados ou cancelados.
- Estado operacional mantido: `PRE-PRODUCTION / L2 HARDENED`.
- Classificação mantida: `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`.

## Objectivo

Não criar outro módulo nem efectuar alterações funcionais. Restam exactamente duas correcções pequenas:

1. obter pela API do GitHub o início real da execução remota e validar a janela temporal da consulta;
2. emitir uma atestação final ligada ao SHA `e189abee8fb073e21bd89ad43d1a632411c33e51`, sem criar uma sequência infinita de commits documentais.

---

## 1. Obter e validar o início real da execução remota

### Problema actual

O verificador procura `receipt.remote_started_at`, mas `scripts/sync-remote-ci-receipt.mjs` não obtém nem grava esse campo a partir da API do GitHub. Assim, a comparação com o início efectivo da execução remota não é obrigatória na prática.

### Implementação obrigatória

1. Em `scripts/sync-remote-ci-receipt.mjs`, consultar a própria execução remota através da API do GitHub, usando o ID autoritativo disponível em:

   ```text
   GITHUB_RUN_ID
   ```

2. Obter pelo menos estes campos da execução remota:

   - `id` ou `databaseId`;
   - `run_attempt`;
   - `head_sha`;
   - `status`;
   - `conclusion`, quando disponível;
   - `run_started_at` ou o campo temporal autoritativo equivalente;
   - `created_at`;
   - `updated_at`;
   - `html_url`;
   - actor da execução.

3. Gravar no recibo, sem valores inventados:

   ```json
   {
     "remote_verification_run_id": 35154177451,
     "remote_run_attempt": 1,
     "remote_started_at": "<valor obtido da API>",
     "remote_created_at": "<valor obtido da API>",
     "remote_updated_at": "<valor obtido da API>",
     "remote_run_url": "<URL obtida da API>",
     "remote_actor": "<actor obtido da API>"
   }
   ```

4. Não preencher `remote_started_at` com `new Date()`, `remote_synced_at`, horário da CI principal ou outro valor local. O campo deve vir da resposta física da API referente a `GITHUB_RUN_ID`.

5. Preservar no bundle a resposta bruta da API utilizada para consultar a execução remota, por exemplo:

   ```text
   remote-workflow-run-api-response.json
   ```

6. Calcular o SHA-256 físico dessa resposta e guardar o hash no recibo:

   ```json
   {
     "remote_run_response_sha256": "<64 caracteres hexadecimais>"
   }
   ```

7. Incluir a resposta bruta e o recibo actualizado em `evidence-files.sha256`. O verificador deve recalcular os hashes a partir dos bytes físicos.

8. Fazer `scripts/verify-evidence-coherence.mjs` falhar em modo remoto se qualquer destes campos estiver ausente, inválido ou contraditório:

   - `remote_verification_run_id`;
   - `remote_run_attempt`;
   - `remote_started_at`;
   - `remote_run_url`;
   - `remote_actor`;
   - `remote_run_response_sha256`;
   - resposta bruta da API.

9. Recalcular, a partir da resposta bruta, o ID, SHA, actor, tentativa, URL e horário inicial. Não confiar apenas nos campos resumidos do recibo.

10. Validar obrigatoriamente a janela temporal:

    ```text
    remote_started_at - tolerância <= queried_at <= remote_synced_at + tolerância
    ```

    Usar uma tolerância máxima de 60 segundos, documentada e testada.

11. Confirmar também:

    - `query_run_id == remote_verification_run_id`;
    - `query_run_id != primary_run_id`;
    - `remote_actor == query_actor == EXPECTED_QUERY_ACTOR`;
    - o `head_sha` remoto coincide com o SHA que está a ser validado;
    - a URL da execução remota contém o mesmo ID validado;
    - a resposta pertence ao repositório e workflow esperados.

12. Eliminar fallbacks artificiais de proveniência. Em modo remoto, não aceitar:

    - actor fixo;
    - IDs calculados ou incrementados;
    - datas geradas para substituir dados ausentes;
    - valores locais quando a API falhar.

    A API indisponível, resposta inválida ou metadado ausente deve resultar em falha fechada.

### Testes negativos obrigatórios

Adicionar testes determinísticos para provar falha quando:

- `remote_started_at` está ausente;
- `remote_started_at` é auto-gerado ou não coincide com a resposta bruta;
- `queried_at` é anterior ao início remoto além da tolerância;
- `queried_at` é posterior à sincronização além da tolerância;
- o ID remoto diverge da resposta da API;
- o SHA remoto diverge do SHA esperado;
- o actor remoto diverge de `query_actor` ou `EXPECTED_QUERY_ACTOR`;
- o hash da resposta bruta diverge dos bytes físicos;
- a resposta bruta está ausente ou contém JSON inválido;
- `query_run_id` coincide com `primary_run_id`;
- a URL remota não corresponde ao ID validado;
- a consulta da API falha.

Incluir pelo menos um teste de integração da interface CLI real, e não apenas testes directos de funções internas.

---

## 2. Emitir a atestação final sem novo commit documental

### Problema a evitar

Não actualizar novamente um relatório versionado apenas para inserir os IDs da CI gerados depois do commit. Isso criaria outro SHA, exigiria outra CI e reiniciaria indefinidamente a mesma cadeia documental.

### Solução obrigatória

1. Manter o relatório versionado como descrição do estado técnico e da metodologia.

2. Gerar a atestação final durante a execução remota, depois de todos os gates terem passado.

3. A atestação deve ser um ficheiro gerado, não versionado, guardado em:

   ```text
   .artifacts/evidence/final-attestation.json
   ```

   Pode também ser criada uma versão legível:

   ```text
   .artifacts/evidence/final-attestation.md
   ```

4. A atestação deve referir directamente o SHA que iniciou a execução. Para o fecho actual:

   ```text
   e189abee8fb073e21bd89ad43d1a632411c33e51
   ```

5. A atestação deve incluir, no mínimo:

   ```json
   {
     "repository": "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES",
     "branch": "master",
     "attested_commit_sha": "e189abee8fb073e21bd89ad43d1a632411c33e51",
     "primary_run_id": 35153948404,
     "primary_run_url": "<URL verificável>",
     "primary_conclusion": "success",
     "remote_verification_run_id": 35154177451,
     "remote_run_url": "<URL verificável>",
     "remote_conclusion": "success",
     "remote_started_at": "<valor da API>",
     "query_actor": "<actor validado>",
     "query_run_id": 35154177451,
     "artifact_id": 10470860594,
     "artifact_name": "aetf-verified-remote-evidence-bundle-e189abee8fb073e21bd89ad43d1a632411c33e51",
     "classification": "PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS",
     "operational_state": "PRE-PRODUCTION / L2 HARDENED",
     "generated_at": "<data UTC>",
     "evidence_index_sha256": "<hash físico>",
     "status": "PASS"
   }
   ```

6. Como o ID definitivo do próprio artefacto pode não existir antes do upload, não inventar nem antecipar esse ID. Adoptar uma destas soluções verificáveis:

   - gerar primeiro o bundle, efectuar o upload e publicar os metadados finais no GitHub Actions Job Summary;
   - usar a API do GitHub após o upload para obter o ID real e gerar uma segunda atestação separada, também como artefacto;
   - publicar uma atestação final numa GitHub Release ou outro objecto não versionado, ligada ao SHA exacto.

7. A solução escolhida deve evitar novo commit apenas para inserir IDs produzidos pela CI.

8. Publicar no GitHub Actions Job Summary:

   - SHA validado;
   - IDs e URLs das duas execuções;
   - conclusão de cada execução;
   - actor validado;
   - ID e nome do artefacto, quando já disponíveis;
   - hash do índice de evidências;
   - classificação limitada;
   - estado operacional.

9. O Job Summary e a atestação devem deixar explícito que são recibos da execução e não ficheiros-fonte do repositório.

10. Adicionar `.artifacts/` ao mecanismo de exclusão aplicável e confirmar que nenhuma atestação gerada é versionada.

11. Incluir `final-attestation.json` no artefacto final e validar o seu conteúdo antes do encerramento do workflow. Se a atestação final que contém o ID do artefacto tiver de ser produzida depois do primeiro upload, usar um segundo artefacto claramente nomeado, sem alterar o primeiro retroactivamente.

### Nome recomendado para a atestação final

```text
aetf-final-attestation-e189abee8fb073e21bd89ad43d1a632411c33e51
```

---

## Execução obrigatória

Num checkout limpo do patch:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
```

Depois:

1. executar a CI principal;
2. aguardar a verificação remota;
3. confirmar que ambas terminaram com `success` no mesmo SHA;
4. descarregar os artefactos;
5. recalcular os hashes físicos;
6. validar a resposta bruta da API da execução remota;
7. validar a atestação final;
8. confirmar que a árvore Git permanece limpa e que `.artifacts/` não foi versionado.

## Critérios de aceitação

O fecho só pode ser declarado quando:

- `remote_started_at` provém da API da execução remota;
- a resposta física da API está preservada e tem hash verificado;
- `queried_at` está comprovadamente dentro da janela remota permitida;
- actor, ID, tentativa, URL e SHA são recalculados da resposta física;
- qualquer ausência ou contradição causa falha fechada;
- todos os testes negativos passam;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` terminam com exit code `0`;
- as duas execuções do GitHub Actions terminam com `success` no mesmo SHA;
- a atestação final está ligada ao SHA validado e é publicada como evidência de execução;
- nenhum novo commit documental é criado apenas para registar os IDs produzidos pela própria CI;
- a classificação continua limitada a `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`;
- o estado continua `PRE-PRODUCTION / L2 HARDENED`.

## Restrições

- Não criar módulos funcionais.
- Não alterar autenticação, pagamentos, interface, employees ou integração AGT.
- Não promover o projecto para produção.
- Não fabricar datas, actores, IDs, URLs, hashes ou resultados.
- Não aceitar fallbacks silenciosos em modo remoto.
- Não versionar artefactos, logs ou atestações de execução.
- Não criar sucessivos commits documentais para tentar documentar o próprio commit.

## Entrega esperada

Apresentar um resumo final curto com:

- ficheiros alterados;
- SHA efectivamente validado;
- origem API de `remote_started_at`;
- resultados dos testes negativos;
- resultados de `npm ci`, `npm audit --omit=dev` e `npm run verify`;
- IDs, URLs e conclusões das duas execuções;
- nome, ID e hash dos artefactos produzidos;
- ligação para o Job Summary ou atestação final;
- confirmação de que nenhum novo commit documental autorreferente foi criado;
- classificação e estado operacional mantidos.
