# Causa Raiz Técnica — Erro de Mapeamento da Identidade Jurídica de Fontes Físicas MINSA

## Executive Summary
A auditoria forense identificou como foi possível os ficheiros PDF físicos estarem autênticos em disco com hashes SHA-256 corretos, mas com identidades jurídicas erradamente rotuladas no registo de catálogo (SRC-MINSA-004 como DP 260/23 e SRC-MINSA-005 como DP 248/20).

## 1. Causa Raiz Causal Explícita
1. **Infêrencia de Metadados por Nome de Ficheiro / Importação de Catálogo**:
   Aquando da ingestão original no catálogo de legislação, os ficheiros físicos foram renomeados com marcadores de ano sugeridos por scripts de scraping ou inferência heurística sem validação cruzada do texto do preâmbulo e do Diário da República.
   - SRC-MINSA-004 continha o texto do **Decreto Presidencial n.º 260/10** (19 de Novembro de 2010), mas foi erradamente etiquetado como Decreto Presidencial n.º 260/23 devido a um erro de deslocamento de array no dicionário de importação.
   - SRC-MINSA-005 continha o **Decreto Presidencial n.º 277/20** (26 de Outubro de 2020), mas foi associado ao Decreto Presidencial n.º 248/20 por sobreposição de metadados durante a ingestão do Estatuto Orgânico do MINSA.

2. **Pipeline de Hash Híbrido Cego a Metadados**:
   O pipeline criptográfico calculava o SHA-256 sobre os bytes reais do ficheiro PDF (garantindo que o ficheiro físico não sofria alterações), contudo a atribuição do número de documento era lida da tabela de catálogo sem verificação de correspondência entre o hash e o preâmbulo do diploma.

## 2. Solução Definitiva Aplicada neste Patch
- **Princípio PHYSICAL_TRUTH > PREVIOUS_METADATA**:
  A identidade documental é agora derivada estritamente da inspeção do texto físico do diploma no Diário da República.
- **Auditoria de Histórico**:
  Os registos anteriores foram mantidos como previous_incorrect_legal_identity para rastreabilidade auditável completa.
