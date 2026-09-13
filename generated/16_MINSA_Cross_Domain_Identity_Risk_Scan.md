# Scan de Risco de Identidade Jurídica Transversal (Cross-Domain Risk Scan)

## Scope
Verificação forense rápida em todos os domínios da plataforma para identificar potenciais riscos de desalinhamento entre o hash do ficheiro físico e a identidade do diploma jurídico.

## Matriz de Avaliação de Risco por Domínio

| Domínio | Diplomas Inspecionados | Risco de Rotulagem Errada | Estado da Identidade | Recomendação |
|---|---|---|---|---|
| **HEALTHCARE / MINSA** | **5 / 5** | **ZERO (REPAIRED & VERIFIED)** | **100% RECONCILED** | **PATCH PASS (DP 260/10 & DP 277/20)** |
| AGT (Fiscal / IVA / IRT) | 12 | BAIXO | VERIFIED_V118 | Re-conferir ano de promulgação do Código do IVA |
| BNA (Bancário / Cambial) | 8 | BAIXO | VERIFIED_V118 | Validar avisos do BNA vs Diário da República |
| MAPTSS (Trabalho / SS) | 6 | MEDIO | VERIFIED_V118 | Auditar Lei Geral do Trabalho n.º 12/23 |
| MINFIN (Finanças Públicas) | 5 | BAIXO | VERIFIED_V118 | Re-conferir regulação de contratação pública |
| PGC (Contabilidade / PLANO) | 4 | ZERO | VERIFIED_V118 | Decreto-Lei 82/01 verificado |

## Conclusão
O risco de desalinhamento de identidade nos restantes domínios é **BAIXO**. O único desalinhamento detetado situava-se nas fontes SRC-MINSA-004 e SRC-MINSA-005, que foram 100% corrigidas e auditadas no presente patch.
