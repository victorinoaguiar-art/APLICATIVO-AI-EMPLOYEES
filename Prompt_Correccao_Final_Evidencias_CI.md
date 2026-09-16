# Prompt de Correcção Final — Evidências, CI e Protecção do Branch

## Papel

Actue como engenheiro sénior de software, CI/CD e segurança de cadeia de fornecimento. Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Analise primeiro o estado físico do `master`, o SHA actual, os workflows e o relatório mais recente. Depois implemente somente as correcções descritas neste documento.

## Contexto confirmado

O patch anterior produziu avanços materiais:

- `npm ci` passa num checkout limpo;
- `npm audit --omit=dev` termina com zero vulnerabilidades;
- `npm run verify` termina com exit code `0`;
- os 415 testes passam sem ignorados ou cancelados;
- a CI principal e o workflow remoto de evidências estão verdes;
- as evidências são geradas em `.artifacts/evidence/`;
- o antigo directório versionado `evidence/` foi removido;
- a integração AGT permaneceu fora deste patch.

Contudo, a classificação `PATCH_VERIFIED_AND_CI_ENFORCED` ainda não está integralmente sustentada pelo comportamento do verificador. O gate remoto aceita estados nos quais a protecção do branch não foi comprovada, e não valida de forma suficientemente rigorosa quais checks estão realmente configurados como obrigatórios.

## Objectivo

Executar um patch pequeno e estritamente correctivo que transforme a protecção do branch e os checks obrigatórios em condições realmente bloqueantes, corrija os pequenos problemas de caminhos e mensagens e produza evidência ligada ao SHA final.

Não criar novos módulos funcionais, motores, catálogos, empregados, integrações externas ou funcionalidades comerciais.

## Correcções obrigatórias

### 1. Tornar a protecção do branch obrigatória no gate remoto

No modo remoto final, o verificador deve aceitar como sucesso apenas quando:

- `branch_protection_status` for exactamente `CONFIGURED`;
- `http_status` for exactamente `200`;
- existir uma resposta física válida da API do GitHub;
- `response_sha256` corresponder aos bytes físicos dessa resposta;
- a resposta se referir ao repositório e branch esperados;
- o recibo e a resposta estiverem associados ao mesmo SHA auditado, quando esse campo for aplicável.

Os seguintes estados devem falhar fechados no modo remoto:

- `NOT_CONFIGURED`;
- `API_UNAUTHORIZED`;
- `API_FORBIDDEN`;
- `API_UNAVAILABLE`;
- qualquer estado desconhecido, vazio ou contraditório.

Esses estados podem continuar a ser registados como diagnóstico, mas nunca podem produzir um resultado remoto verde nem permitir a classificação `CI_ENFORCED`.

### 2. Validar os checks obrigatórios da protecção do branch

Extrair da resposta real da API os checks obrigatórios configurados no branch protegido. O gate deve validar pelo menos:

- o job de verificação local em checkout limpo;
- o job principal de build, typecheck, lint, testes, auditoria e evidências;
- o check remoto de evidências, caso o desenho técnico do `workflow_run` permita que ele seja exigido directamente na protecção do branch.

Não usar nomes inventados. Descobrir os nomes exactos publicados pelo GitHub Actions e compará-los com a resposta física da API.

Se o workflow remoto baseado em `workflow_run` não puder funcionar como check obrigatório pré-merge, não declarar que ele é obrigatório. Nesse caso:

1. documentar a limitação com precisão;
2. manter o workflow remoto como verificação posterior;
3. exigir como obrigatórios todos os checks tecnicamente disponíveis antes do merge;
4. classificar separadamente `REQUIRED_PRE_MERGE_CHECKS` e `POST_CI_REMOTE_EVIDENCE_GATE`.

O gate deve falhar se qualquer check pré-merge esperado estiver ausente, desactivado, ignorado ou com nome divergente.

### 3. Validar regras materiais da protecção

Além da existência da protecção, verificar e registar, a partir da resposta real da API:

- exigência de pull request antes do merge;
- número mínimo de aprovações, quando configurado;
- bloqueio de force-push;
- bloqueio de eliminação do branch;
- exigência de resolução de conversas, quando aplicável;
- aplicação das regras aos administradores, ou uma justificação explícita quando não for possível;
- lista exacta dos checks obrigatórios.

Não considerar `HTTP 200` suficiente para provar que a configuração é adequada.

### 4. Corrigir a validação dos caminhos de evidência

Substituir verificações baseadas apenas em:

```js
targetDir.startsWith(ROOT_DIR)
```

por uma validação segura baseada em `path.relative()`.

O caminho deve ser rejeitado quando:

- for igual à raiz do repositório;
- resolver para fora da raiz;
- o resultado relativo começar por `..`;
- o resultado relativo for absoluto;
- estiver vazio quando `--output` for fornecido.

Aplicar a mesma regra a todos os scripts que resolvem o directório de evidências, incluindo pelo menos:

- `scripts/generate-evidence.mjs`;
- `scripts/record-npm-ci.mjs`;
- outros scripts equivalentes encontrados durante a auditoria.

Adicionar testes negativos para uma pasta irmã com prefixo semelhante ao nome do repositório.

### 5. Corrigir mensagens de destino dos logs

Eliminar mensagens hard-coded como:

```text
Log written to evidence/npm-ci.log
```

Cada script deve imprimir o caminho real calculado, preferencialmente relativo à raiz do repositório. O texto não pode afirmar que o ficheiro está em `evidence/` quando foi escrito em `.artifacts/evidence/` ou noutro destino autorizado.

### 6. Fixar as GitHub Actions por SHA imutável

Substituir referências móveis, como:

- `actions/checkout@v4`;
- `actions/setup-node@v4`;
- `actions/upload-artifact@v4`;
- `actions/download-artifact@v4`;

por SHAs integrais e imutáveis de releases oficiais verificadas.

Manter um comentário curto ao lado de cada SHA com a versão humana correspondente. Não utilizar forks, Actions desconhecidas ou SHAs não comprovados.

### 7. Actualizar o relatório para o SHA final

O relatório final deve distinguir claramente:

- SHA inicial auditado;
- SHA do patch técnico;
- SHA final que contém o relatório;
- execução da CI principal desse SHA;
- execução remota correspondente ao mesmo SHA;
- estado real da protecção do branch;
- checks pré-merge efectivamente obrigatórios;
- estado do gate remoto posterior à CI.

Não reutilizar execuções de commits anteriores como prova do SHA final. Não escrever `CI_ENFORCED` se a API não comprovar fisicamente os checks obrigatórios.

### 8. Regenerar as evidências sem as versionar

Gerar o pacote final exclusivamente em:

```text
.artifacts/evidence/
```

O pacote deve conter, no mínimo:

- `commit_sha` coerente nos recibos relevantes;
- identificação do repositório e branch;
- ID e URL da execução principal;
- ID e URL da execução remota;
- conclusão real das execuções;
- resposta física da API de branch protection;
- hash SHA-256 da resposta;
- regras materiais extraídas;
- checks obrigatórios extraídos;
- índice completo dos ficheiros físicos;
- hashes recalculados depois de qualquer enriquecimento remoto.

Não versionar `.artifacts/`, logs temporários ou índices que referenciem ficheiros ausentes.

## Testes negativos obrigatórios

Adicionar ou actualizar testes que demonstrem que o gate remoto falha quando:

1. a protecção não está configurada;
2. a API devolve `401`, `403`, `404`, `5xx` ou fica indisponível;
3. o estado declarado é `CONFIGURED`, mas o HTTP não é `200`;
4. o hash da resposta da API diverge;
5. um check pré-merge obrigatório está ausente;
6. o nome de um check obrigatório diverge;
7. um check obrigatório aparece como ignorado;
8. a resposta pertence a outro repositório ou branch;
9. o SHA das evidências diverge do SHA da execução;
10. o directório de saída resolve para fora do repositório;
11. uma pasta irmã partilha apenas o prefixo da raiz do repositório;
12. o relatório tenta promover `CI_ENFORCED` sem prova física suficiente.

## Restrições

- Não criar outro grande módulo.
- Não alterar funcionalidades de negócio sem necessidade directa.
- Não adicionar integração AGT, facturação electrónica AGT ou acesso ao Portal do Contribuinte.
- Não introduzir segredos, tokens ou respostas privadas da API no Git.
- Não usar mocks como prova de configuração real do GitHub.
- Não transformar falhas de autorização ou indisponibilidade da API em sucesso.
- Não usar `|| true`, testes ignorados, limpeza artificial da árvore ou alteração manual de recibos.
- Não reduzir a cobertura ou remover testes existentes para obter verde.
- Não declarar produção pronta com base apenas em testes internos.

## Sequência de execução obrigatória

1. Registar o SHA inicial e confirmar árvore limpa.
2. Inspeccionar os workflows, scripts, testes e relatório existentes.
3. Implementar somente as correcções deste prompt.
4. Executar num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
```

5. Confirmar exit code `0` em todos os comandos.
6. Confirmar que nenhum teste foi ignorado ou cancelado.
7. Confirmar que a árvore Git não foi artificialmente limpa.
8. Fazer commit do patch técnico.
9. Executar a CI principal no GitHub para esse SHA.
10. Executar e concluir o workflow remoto correspondente ao mesmo SHA.
11. Consultar a protecção do branch pela API oficial.
12. Regenerar e validar o pacote final de evidências.
13. Actualizar o relatório apenas com dados reais dessas execuções.
14. Se o relatório exigir um commit adicional, executar novamente a CI no SHA final ou declarar claramente que o commit documental ainda não foi validado.

## Critérios de aceitação

O patch só pode ser considerado concluído quando:

- `npm ci` terminar com exit code `0` num checkout limpo;
- `npm audit --omit=dev` terminar com exit code `0`;
- `npm run verify` terminar com exit code `0`;
- todos os testes passarem sem ignorados ou cancelados;
- o gate remoto falhar fechadamente sem prova HTTP 200 da protecção;
- os checks pré-merge esperados forem comparados com a resposta física da API;
- os caminhos de saída forem validados com `path.relative()`;
- as mensagens indicarem os destinos físicos correctos;
- as Actions estiverem fixadas por SHA integral;
- a CI principal estiver verde no SHA final;
- a verificação remota estiver verde para o mesmo SHA;
- a árvore Git permanecer limpa depois das verificações;
- nenhuma evidência temporária estiver versionada;
- o relatório não contiver afirmações superiores à evidência disponível.

## Classificação permitida

Aplicar uma destas classificações, sem promover automaticamente:

- `PATCH_FAILED`: qualquer comando, teste ou workflow obrigatório falhou.
- `PATCH_VERIFIED_LOCALLY`: validação local passou, mas não existe CI completa do mesmo SHA.
- `PATCH_VERIFIED_AND_CI_GREEN`: validação local e workflows passaram, mas a protecção ou os checks obrigatórios não foram comprovados.
- `PATCH_VERIFIED_AND_CI_ENFORCED`: somente quando a API comprovar protecção activa, regras materiais adequadas e todos os checks pré-merge esperados como obrigatórios.

O workflow remoto posterior não deve ser descrito como check obrigatório pré-merge se a arquitectura do GitHub não permitir essa condição.

## Entregáveis

Entregar num único patch:

1. código corrigido;
2. testes positivos e negativos;
3. workflows actualizados;
4. pacote de evidências não versionado;
5. relatório técnico final em Markdown;
6. matriz curta `Requisito → Implementação → Teste → Evidência`;
7. lista dos ficheiros alterados;
8. SHA final;
9. IDs e URLs das execuções reais;
10. classificação final tecnicamente defensável.

No resumo final, separar claramente:

- o que foi corrigido;
- o que foi comprovado;
- o que continua pendente;
- o que permanece fora de escopo.
