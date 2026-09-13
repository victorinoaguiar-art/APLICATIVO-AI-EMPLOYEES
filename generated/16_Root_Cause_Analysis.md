# Análise de Causa Raiz (Root Cause Analysis) — Ingestão de Fontes Sintéticas

## Executive Summary
A auditoria forense identificou como foi possível ao sistema gerar estados de "PASS" em verificações anteriores com base em fontes declarativas sintéticas.

## 1. Vulnerabilidades Identificadas
1. **Metadata Trust vs. Physical Verification**: A plataforma confiava em cabeçalhos declarados ("mime_type: application/pdf") em vez de inspecionar os magic bytes físicos ("%PDF-") do ficheiro no disco.
2. **Self-Contained Hashing Pipeline**: O pipeline de hashing calculava o SHA-256 de strings estáticas personalizadas ("SOURCE_BYTE_STREAM_...") sem ler os bytes reais do ficheiro em disco.
3. **Synthetic Test Fixtures as Production Knowledge**: Ficheiros criados para testes unitários foram ingeridos pelo índice regulamentar como se fossem legislação oficial publicada no Diário da República.

## 2. Medidas de Correção Definitivas Aplicadas
- **Ingestão Obrigatória de PDFs Físicos**: Substituição imediata por ficheiros PDF autênticos do Diário da República e Ministério da Saúde de Angola em "packages/runtime/src/knowledge/minsa/".
- **Validação Estrita de Magic Bytes**: Aplicação da regra "starts_with = %PDF-". Ficheiros com conteúdo sintético ou texto sem estrutura PDF são imediatamente classificados como "SYNTHETIC_PLACEHOLDER" e bloqueados.
- **Hashing em Runtime sobre Bytes Físicos**: O SHA-256 é calculado exclusivamente por leitura directa dos bytes do ficheiro no disco.
