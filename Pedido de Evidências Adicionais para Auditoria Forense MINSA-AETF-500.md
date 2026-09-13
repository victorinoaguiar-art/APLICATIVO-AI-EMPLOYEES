# PEDIDO DE EVIDÊNCIAS ADICIONAIS — AUDITORIA FORENSE AETF-500 / MINSA

A documentação recebida permite compreender a arquitectura declarada, mas ainda não contém evidência física suficiente para validar as afirmações de proveniência, integridade, reconstrução das regras e execução real.

**Não produzir um novo relatório-resumo neste momento.**

Enviar os **ficheiros brutos existentes no sistema/repositório**, sem os regenerar, corrigir ou substituir.

Solicita-se especificamente:

1. **Country Pack Angola completo**
   - pasta, ZIP ou estrutura integral de `AETF-COUNTRY-AO`;
   - esclarecer e provar qual é a versão real actualmente utilizada:
     - `v1.0.0`;
     - `v3.0.0`;
     - ou outra;
   - incluir histórico/migration manifest entre versões.

2. **Source Registry Angola completo**
   - as 45 fontes declaradas para Angola;
   - IDs individuais;
   - títulos;
   - diplomas;
   - entidades emissoras;
   - URLs/origens;
   - caminhos físicos;
   - versões;
   - datas;
   - SHA-256.

3. **MINSA_REPAIRED_REGISTRY**
   - ficheiro integral;
   - caminho físico;
   - versão;
   - SHA-256;
   - código/configuração que o carrega.

4. **Definição integral de `SRC-MINSA-001`**
   - registo completo;
   - documento físico associado;
   - caminho;
   - URL/origem oficial;
   - SHA-256;
   - data de aquisição;
   - versão jurídica.

5. **Documentos jurídicos físicos MINSA**
   - principalmente o ficheiro efectivamente utilizado para representar a `Lei n.º 21-B/92`;
   - PDFs ou outros formatos originais;
   - não enviar apenas transcrições produzidas pelo sistema.

6. **Chunks MINSA**
   - todos os `CHK-DR-*`;
   - obrigatoriamente:
     - `CHK-DR-001-01`;
     - `CHK-DR-011-01`;
     - `CHK-DR-021-01`;
   - texto integral de cada chunk;
   - source_id;
   - documento;
   - artigo;
   - página;
   - hash.

7. **Regras `DR-*`**
   - todas as regras de `DR-001` até `DR-032`, caso esse seja o intervalo real;
   - incluir:
     - texto da regra;
     - requisito;
     - documento;
     - artigo;
     - chunk;
     - fonte;
     - lógica/derivação;
     - Employees consumidores.

8. **Manifesto real de hashes**
   - não apenas declaração de que os hashes existem;
   - enviar o ficheiro que contenha os valores SHA-256 individuais;
   - incluir ficheiro/caminho correspondente a cada hash.

9. **Mapa de proveniência/lineage**
   - qualquer artefacto que permita provar:
     `physical_file → source_id → document_id → chunk_id → rule_id → employee_id`.

10. **Logs de ingestão e indexação**
    - leitura dos documentos;
    - extracção do texto;
    - chunking;
    - embeddings;
    - indexação;
    - criação/actualização das regras.

11. **Código/configuração do Knowledge Router**
    - implementação de:
      - `CLASSIFY_JURISDICTION`;
      - `SELECT_REGISTRY`;
      - `RESOLVE_DOCUMENT_IDENTITY`;
    - incluir regras de fallback.

12. **Configuração de caminhos e fontes**
    - referências a:
      - `C:\`;
      - OneDrive;
      - Google Drive;
      - pastas locais;
      - `knowledge_path`;
      - `registry_path`;
      - `legal_sources_path`;
      - fallback directories.

13. **Código que gera `PASS_EXACT_RAW_RUNTIME_RECEIPT`**
    - função/classe/ficheiro;
    - condições de PASS;
    - asserts;
    - validações;
    - tratamento de falhas.

14. **Test runner**
    - código;
    - comando executado;
    - configuração;
    - workers/threads/processos;
    - logs brutos;
    - exit codes.

15. **Todos os recibos `EXEC-MINSA-IDENTITY-*`**
    - não enviar apenas exemplos seleccionados;
    - enviar a população completa disponível.

16. **Reconciliação do inventário de conhecimento**
    Existe actualmente a seguinte equação declarada:

    `415 + 230 - 20 - 15 = 615`

    Matematicamente, o resultado é `610`.

    Enviar os ficheiros que permitam explicar os **5 objectos de diferença**, incluindo:
    - inventário pré-migração;
    - objectos adicionados;
    - objectos substituídos;
    - duplicados eliminados;
    - inventário final de 615 objectos.

## Regra de preservação

Não corrigir os artefactos antes do envio.

Se um ficheiro solicitado não existir, responder explicitamente:

`EVIDENCE_NOT_FOUND`

Se existir mas não estiver acessível:

`EVIDENCE_EXISTS_BUT_NOT_ACCESSIBLE`

Se a informação existir apenas num relatório e não num artefacto técnico subjacente:

`DECLARATION_ONLY_NO_RAW_EVIDENCE`

## Objectivo

A próxima auditoria precisa conseguir reconstruir directamente dos artefactos:

**fonte física → hash → documento → texto legal → artigo → chunk → regra → índice → Employee → consulta → resposta → recibo runtime**

Nenhuma destas relações deve ser inferida apenas a partir de um relatório de conclusão.