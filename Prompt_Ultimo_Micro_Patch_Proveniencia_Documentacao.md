# Prompt — Último micro-patch de proveniência e documentação

## Contexto

Trabalhar no repositório `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`.

O estado confirmado antes deste patch é:

- SHA documental mais recente: `8cb7eacb4e54800e239d41252e2b0e807b9bd666`;
- SHA técnico do patch já validado: `726d9af728291381421837e8e54d7ebe2c334aa2`;
- CI principal: execução `35139315097`, concluída com sucesso;
- verificação remota: execução `35139638915`, concluída com sucesso;
- artefacto remoto: ID `10464203884`, nome `aetf-verified-remote-evidence-bundle-8cb7eacb4e54800e239d41252e2b0e807b9bd666`;
- `npm ci`: exit code `0`;
- `npm audit --omit=dev`: zero vulnerabilidades e exit code `0`;
- `npm run verify`: exit code `0`, com 454 testes aprovados e nenhum teste falhado, ignorado ou cancelado.

Não criar outro módulo nem alterar funcionalidades do produto. Restam apenas duas correcções pequenas: proveniência verificável e documentação coerente.

## 1. Fechar a proveniência da verificação remota

Corrigir o workflow e os verificadores para que a identidade e a execução que produziram a consulta remota sejam comprovadas, e não apenas declaradas.

### Requisitos

1. No workflow remoto, definir explicitamente:

   ```yaml
   EXPECTED_QUERY_ACTOR: ${{ github.actor }}
   ```

   O verificador deve comparar `query_actor` com este valor e falhar se estiver ausente ou divergente.

2. Separar inequivocamente os identificadores:

   - `primary_run_id`: `github.event.workflow_run.id`;
   - `remote_verification_run_id`: `github.run_id`;
   - `query_run_id`: execução na qual a consulta foi efectivamente realizada, normalmente `github.run_id`.

   Não reutilizar o ID da CI principal como `query_run_id`.

3. Registar também `remote_run_attempt` e uma referência verificável à execução remota.

4. Vincular `queried_at` à janela temporal real da execução remota. O verificador deve rejeitar datas:

   - anteriores ao início da execução remota;
   - posteriores à conclusão da execução, salvo uma tolerância pequena e documentada;
   - excessivamente futuras;
   - ausentes ou inválidas.

5. Sempre que possível, obter os dados autoritativos da API do GitHub ou do contexto imutável da execução, evitando aceitar metadados auto-declarados sem comparação externa.

6. Incluir os novos campos no bundle final, no índice e na validação dos hashes físicos.

7. Fazer o caminho real de CLI/workflow transmitir e validar o actor e o ID da execução remota. Não basta testar apenas funções internas.

### Testes negativos obrigatórios

Adicionar testes determinísticos que comprovem falha para:

- `query_actor` diferente de `github.actor`;
- actor esperado ausente;
- `remote_verification_run_id` divergente;
- confusão entre `primary_run_id` e `query_run_id`;
- `queried_at` fora da janela da execução;
- metadados de proveniência ausentes;
- hashes ou índice divergentes após alteração dos novos campos.

## 2. Reconciliar definitivamente o relatório

Actualizar `AETF500_Relatorio_Correccao_Final_Evidencias_CI.md` para reflectir somente factos comprovados pelo código e pelas execuções reais.

### Correcções obrigatórias

1. Distinguir claramente:

   - SHA técnico validado;
   - SHA documental actual;
   - SHA exacto de cada execução de CI e de cada artefacto.

2. Remover a formulação futura `Commit Documental: Registará...` e substituí-la pelo estado efectivamente comprovado.

3. Registar as execuções e o artefacto mais recentes, com ID, URL, SHA, estado, conclusão e data:

   - CI principal `35139315097`;
   - verificação remota `35139638915`;
   - artefacto `10464203884`.

4. Corrigir a lista de classificações aceites para coincidir exactamente com o código. Não afirmar que `AUDIT_PASSED_LOCAL_ONLY` é aceite se o verificador utiliza `PATCH_VERIFIED_AND_CI_GREEN`.

5. Fazer os exemplos de comandos coincidirem exactamente com a interface real de `scripts/verify-evidence-bundle.mjs`. Se a interface actual usa argumentos posicionais, documentá-los como tal; se for alterada para opções nomeadas, actualizar em conjunto código, testes, workflow e relatório.

6. Manter a classificação tecnicamente defensável em:

   - classificação: `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`;
   - estado operacional: `PRE-PRODUCTION / L2 HARDENED`.

7. Não criar autorreferência impossível. O relatório deve declarar com precisão qual SHA foi validado e qual commit contém apenas a actualização documental. Não afirmar que um commit documental posterior foi validado por uma execução anterior.

## Execução obrigatória

Num checkout limpo do SHA final do patch:

```bash
npm ci
npm audit --omit=dev
npm run verify
```

Depois:

1. executar a CI principal no GitHub para esse SHA;
2. aguardar a conclusão do workflow remoto disparado pela CI;
3. confirmar que ambos terminam com `success`;
4. descarregar e verificar o artefacto remoto;
5. confirmar que todos os recibos referenciam os IDs, actores, datas e SHAs correctos;
6. confirmar que os hashes do índice correspondem aos ficheiros físicos.

## Restrições

- Não adicionar módulos funcionais.
- Não alterar autenticação, pagamentos, UI ou integração AGT neste patch.
- Não versionar logs temporários nem artefactos de execução.
- Não fabricar, editar manualmente ou normalizar recibos para fazê-los passar.
- Não aceitar fallbacks silenciosos de actor, execução, SHA, data ou origem.
- Qualquer metadado ausente, contraditório ou não verificável deve causar falha fechada.
- Não promover a classificação para produção.

## Critérios de aceitação

O patch só está concluído quando:

- a comparação real de `query_actor` está activa no workflow;
- os IDs da CI principal, da verificação remota e da consulta estão separados e validados;
- `queried_at` está vinculado à execução remota real;
- os testes negativos de proveniência passam;
- o relatório coincide com o código, os comandos, os SHAs e as execuções reais;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` terminam com exit code `0` num checkout limpo;
- a CI principal e a verificação remota estão verdes no mesmo SHA final;
- o artefacto remoto pode ser descarregado e validado integralmente.

## Entrega

Entregar um resumo curto contendo:

- ficheiros alterados;
- SHA final;
- resultados dos três comandos locais;
- IDs e URLs das duas execuções do GitHub Actions;
- ID, nome e hash do artefacto remoto;
- confirmação dos testes negativos adicionados;
- classificação final mantida, sem promoção indevida.
