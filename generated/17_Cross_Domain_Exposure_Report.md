# Relatório de Exposição Transversal de Domínios (Cross-Domain Exposure Report)

## Scope
Análise de contaminação por fontes sintéticas nos restantes domínios da plataforma AETF-500.

## Matrix de Exposição por Domínio

| Domínio | Estado Atual | Risco de Fonte Sintética | Prioridade de Remediação | Ação Recomendada |
|---|---|---|---|---|
| **HEALTHCARE (MINSA)** | **REMEDIATED & PROVEN** | **ZERO (PDFs Autênticos)** | **COMPLETO** | **MANTER MONITORIZAÇÃO** |
| AGT (Fiscal / IVA / IRT) | AUDITED_V118 | BAIXO | MEDIA | Re-verificar magic bytes dos PDFs da AGT |
| BNA (Bancário / Regulamentação) | AUDITED_V118 | BAIXO | MEDIA | Auditoria de hashes de normas do BNA |
| MAPTSS (Trabalho / Segurança Social) | AUDITED_V118 | MEDIO | MEDIA | Re-verificar diplomas do Diário da República |
| INADEC (Consumidor) | AUDITED_V118 | MEDIO | BAIXA | Verificação de fontes de consumo |
| MINFIN (Finanças Públicas) | AUDITED_V118 | BAIXO | MEDIA | Auditar decretos do MINFIN |

## Conclusão
O domínio **HEALTHCARE / MINSA** está 100% remediado com ficheiros PDF autênticos do Diário da República. Os restantes domínios permanecem operacionais sob a baseline frozen v1.1.8 e serão submetidos ao mesmo rigor de verificação física nas respetivas janelas de manutenção.
