# Prompt — Patch Final de Ligação dos Gates e Preservação da Evidência Remota

## Papel

Actue como engenheiro sénior de software, GitHub Actions, segurança e auditoria forense. Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Analise primeiro o estado físico do `master` e implemente somente as correcções descritas neste documento.

## Estado inicial confirmado

O último estado auditado foi:

- SHA: `d4b811ce3d343068ae081881ed1469ee2793bc16`;
- patch técnico anterior: `d7fcce03bfa81bac51ab63a495f38a3beb85b5c8`;
- CI principal do SHA actual: execução `35128964822`, conclusão `success`;
- verificação remota do mesmo SHA: execução `35129325215`, conclusão `success`;
- `npm ci`: exit code `0`;
- `npm audit --omit=dev`: zero vulnerabilidades;
- `npm run verify`: exit code `0`;
- 438 testes aprovados, sem falhas, ignorados ou cancelados.

O código já contém verificações para classificação, relatório, hashes, branch protection, jobs e passos. Porém, dois controlos dependem de opções chamadas directamente nos testes e ainda não estão ligados à interface real executada pelo workflow. Além disso, o workflow remoto conserva apenas um recibo, embora altere vários ficheiros do pacote final.

## Objectivo

Executar um micro-patch final que:

1. ligue os controlos existentes à interface de linha de comandos e ao workflow real;
2. preserve integralmente o pacote remoto depois do enriquecimento e da verificação;
3. actualize o relatório para o SHA documental e execuções correspondentes;
4. fortaleça a validação temporal e de identidade da consulta;
5. descreva correctamente o bypass administrativo.

Não criar novos módulos funcionais ou alterar funcionalidades de negócio.

## Correcções obrigatórias

### 1. Ligar `targetClassification` e `reportPath` à interface real

Actualizar a interface de `scripts/verify-evidence-coherence.mjs` para reconhecer explicitamente:

```text
--classification <valor>
--report <caminho>
```

Os argumentos devem ser validados e passados à função:

```js
verifyEvidenceCoherence({
  targetSha,
  enforceRemoteCi,
  evidenceDir,
  targetClassification,
  reportPath
})
```

Requisitos:

- argumento fornecido sem valor deve falhar;
- classificação desconhecida deve falhar;
- relatório ausente deve falhar;
- caminho do relatório deve resolver dentro do repositório;
- ligações `file:///` no relatório devem bloquear a execução;
- `PATCH_VERIFIED_AND_CI_ENFORCED` deve falhar quando `enforce_admins === false`;
- com `enforce_admins === false`, a classificação máxima permitida deve ser `PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS`.

No modo remoto, `--classification` e `--report` devem ser obrigatórios, não opcionais.

### 2. Executar os controlos no workflow remoto

Actualizar `.github/workflows/evidence-remote-verification.yml` para executar o gate com valores reais, por exemplo:

```bash
npm run verify:evidence-remote -- \
  --dir .artifacts/evidence \
  --sha "${{ github.event.workflow_run.head_sha }}" \
  --classification PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS \
  --report AETF500_Relatorio_Correccao_Final_Evidencias_CI.md
```

Usar a classificação compatível com o estado físico obtido da API. Não fixar uma classificação superior ao estado real.

O workflow deve falhar quando:

- a classificação não estiver presente;
- o relatório não estiver presente;
- a classificação exceder a protecção comprovada;
- o relatório contiver ligação local;
- qualquer outro gate remoto falhar.

### 3. Preservar o pacote remoto integral

Depois de `sync-remote-ci-receipt.mjs`, são alterados pelo menos:

```text
github-actions-receipt.json
branch-protection.json
branch-protection-api-response.json
evidence-files.sha256
```

Depois da aprovação do gate remoto, publicar todo o directório:

```text
.artifacts/evidence/
```

O artefacto final deve ter nome inequivocamente diferente do artefacto da CI principal, por exemplo:

```text
aetf-verified-remote-evidence-bundle-${SHA}
```

Não publicar apenas `github-actions-receipt.json`.

Configurar:

```yaml
if-no-files-found: error
retention-days: 30
```

Antes do envio, executar novamente a verificação do índice e confirmar que todos os ficheiros físicos, excepto o próprio índice quando aplicável, estão catalogados e têm hash correcto.

### 4. Validar a consistência do artefacto remoto final

Adicionar um passo final que confirme:

- todos os ficheiros obrigatórios existem;
- `evidence-files.sha256` corresponde aos bytes finais;
- não existem ficheiros estranhos não indexados;
- `commit_sha` corresponde ao SHA da execução principal;
- o recibo aponta para o run principal correcto;
- o pacote foi verificado depois, e não antes, do enriquecimento remoto.

O artefacto só pode ser enviado depois dessa verificação.

### 5. Fortalecer `queried_at` e `query_actor`

Não aceitar apenas qualquer data parseável ou qualquer string não vazia.

Exigir que:

- `queried_at` seja timestamp ISO-8601 em UTC;
- esteja dentro do intervalo da execução remota ou dentro de tolerância máxima explicitamente definida;
- não seja futuro para além da tolerância permitida;
- não seja anterior à execução principal;
- `query_actor` corresponda ao actor real fornecido pelo ambiente do GitHub Actions;
- actor, run ID e SHA sejam registados no recibo de origem.

Se a arquitectura não permitir confrontar directamente o actor, registar uma identidade técnica verificável do workflow e documentar a limitação. Não aceitar texto arbitrário como prova suficiente.

### 6. Corrigir o relatório para o SHA documental real

Actualizar `AETF500_Relatorio_Correccao_Final_Evidencias_CI.md` para incluir:

- SHA inicial;
- SHA do patch técnico;
- SHA documental actual;
- CI principal do SHA documental;
- workflow remoto do mesmo SHA;
- IDs, URLs, status e conclusão reais;
- nome do artefacto remoto integral;
- classificação realmente passada ao gate;
- estado `enforce_admins: false`;
- distinção entre checks pré-merge e gate remoto posterior.

Eliminar expressões pendentes como:

```text
Commit Documental: Registará a atualização final...
```

Se a actualização do relatório criar novo SHA, executar novamente as duas pipelines nesse SHA ou declarar de forma explícita que o commit documental ainda não está validado. Não reutilizar runs de outro SHA como prova do commit final.

### 7. Corrigir a linguagem sobre o bypass administrativo

Substituir expressões ambíguas como:

```text
admin bypass documentado e controlado tecnicamente
```

por formulação factual:

```text
admin bypass permitido, comprovado pela API e explicitamente reflectido na classificação limitada
```

Não afirmar que o bypass foi impedido, bloqueado ou tecnicamente controlado quando `enforce_admins === false`.

## Testes obrigatórios

Adicionar testes positivos e negativos que comprovem:

1. CLI aceita `--classification` válido;
2. CLI aceita `--report` válido;
3. CLI falha quando `--classification` não tem valor;
4. CLI falha quando `--report` não tem valor;
5. CLI falha com classificação desconhecida;
6. modo remoto falha sem `--classification`;
7. modo remoto falha sem `--report`;
8. classificação sem ressalvas falha com `enforce_admins: false`;
9. classificação limitada passa com `enforce_admins: false`, se todos os outros gates passarem;
10. relatório com `file:///` falha através da CLI real;
11. relatório ausente falha através da CLI real;
12. caminho de relatório fora do repositório falha;
13. `queried_at` anterior à execução falha;
14. `queried_at` demasiado futuro falha;
15. `query_actor` divergente falha;
16. pacote remoto incompleto não pode ser publicado;
17. hash final divergente depois do enriquecimento bloqueia o envio;
18. pacote completo e coerente passa e fica pronto para publicação.

Os testes da CLI devem executar o processo real com `spawnSync` ou equivalente. Não considerar suficiente chamar apenas a função importada.

## Restrições

- Não criar outro grande módulo.
- Não alterar os 500 empregados, catálogos, conhecimentos ou funcionalidades comerciais.
- Não adicionar integração AGT.
- Não activar `enforce_admins: true` sem garantir um fluxo de aprovação praticável.
- Não versionar `.artifacts/`, evidências ou logs temporários.
- Não inserir tokens, segredos ou respostas privadas no Git.
- Não usar `|| true` para esconder falhas.
- Não ignorar testes ou reduzir cobertura.
- Não editar recibos manualmente para obter `PASS`.
- Não declarar produção pronta.
- Não criar uma classificação nova sem necessidade.

## Sequência obrigatória

1. Registar SHA inicial e confirmar árvore limpa.
2. Implementar somente estas correcções.
3. Executar num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
```

4. Executar separadamente os testes reais da CLI.
5. Confirmar zero falhas, ignorados ou cancelados.
6. Fazer commit do patch técnico.
7. Executar a CI principal nesse SHA.
8. Executar o workflow remoto no mesmo SHA.
9. Confirmar que o workflow utilizou `--classification` e `--report`.
10. Confirmar publicação do pacote remoto integral.
11. Descarregar ou inspeccionar o artefacto final e verificar o índice.
12. Actualizar o relatório com dados reais.
13. Executar novamente as pipelines se a documentação gerar novo SHA.
14. Confirmar árvore Git limpa.

## Critérios de aceitação

O patch só pode ser considerado concluído quando:

- `npm ci`, auditoria e `npm run verify` terminarem com exit code `0`;
- todos os testes passarem sem ignorados ou cancelados;
- a CLI real receber e aplicar classificação e relatório;
- o workflow remoto passar explicitamente esses argumentos;
- a classificação sem ressalvas for bloqueada com admin bypass;
- o relatório for fisicamente inspeccionado pelo workflow;
- o pacote remoto integral for preservado;
- o índice corresponder aos bytes finais depois do enriquecimento;
- `queried_at` e `query_actor` forem confrontados com dados reais da execução;
- o relatório identificar o SHA final e runs do mesmo SHA;
- nenhuma evidência temporária estiver versionada.

## Classificação permitida

Enquanto `enforce_admins === false`, a classificação máxima permitida é:

```text
PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS
```

Se os controlos da CLI, o pacote integral ou as execuções do mesmo SHA não forem comprovados, utilizar:

```text
PATCH_VERIFIED_AND_CI_GREEN
```

O estado operacional deve permanecer:

```text
PRE-PRODUCTION / L2 HARDENED
```

## Entregáveis

Entregar:

1. código corrigido;
2. workflow remoto corrigido;
3. testes funcionais e testes reais da CLI;
4. pacote remoto integral não versionado;
5. relatório corrigido;
6. matriz `Requisito → Implementação → Teste → Evidência`;
7. SHA final;
8. IDs e URLs das duas execuções do mesmo SHA;
9. nome e conteúdo do artefacto remoto final;
10. classificação tecnicamente defensável;
11. lista explícita do que permanece pendente ou fora de escopo.
