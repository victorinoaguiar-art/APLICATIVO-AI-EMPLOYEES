# AETF-500 Metric Provenance Protocol v1.1

**Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN`  
**Protocol Version**: `v1.1`  
**Hash Engine**: Deterministic SHA-256 Canonical Serialization

---

## 1. Escopo & Objetivos de Rastreabilidade

O **Metric Provenance Protocol v1.1** estabelece as regras de auditabilidade criptográfica para todas as métricas financeiras, operacionais e de clientes calculadas pela plataforma **AI Employee App**.

---

## 2. Serialização Canónica de Payloads (Canonical JSON)

Para garantir que o mesmo conjunto de dados produza identicamente o mesmo hash SHA-256 em qualquer nó do sistema:

1. Todas as chaves do objeto JSON são ordenadas alfabeticamente em ordem léxica Unicode (`ASCII / UTF-8`).
2. Espaços em branco insignificantes e quebras de linha são totalmente removidos.
3. Valores numéricos são serializados sem formato flutuante ambíguo (ex.: `100000` em vez de `100000.00`).
4. Arrays mantêm a sua ordem ordinal estrita, com elementos filhos ordenados pelo mesmo protocolo.

---

## 3. Proteção contra Criptografia de Payload Vazio (`SHA256_EMPTY`)

- **Hash de String Vazia**:
  ```
  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  ```
- **Regra de Validação**:
  Se `payload_size_bytes > 0` e `hash_sha256 == SHA256_EMPTY`, o sistema rejeita imediatamente o registro emitindo o erro crítico:
  `PROVENANCE_INTEGRITY_FAILURE: Hash de proveniente vazio detetado em payload não nulo`.

---

## 4. Estrutura do Envelope de Proveniência v1.1

```json
{
  "provenance_id": "PROV-MRR-2026-09-01",
  "metric_id": "SUBSCRIPTION_MRR",
  "source_environment": "REAL_PRODUCTION",
  "source_system": "BillingLedgerEngine",
  "source_record_id": "REC-2026-09-01-TRIO",
  "canonicalization_version": "v1.1",
  "canonical_payload_size_bytes": 1024,
  "hash_algorithm": "SHA-256",
  "content_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
  "formula_id": "FORMULA-MRR-SUB-01",
  "formula_version": "v1.1",
  "data_source": "REAL_PRODUCTION",
  "calculation_type": "DIRECT_OBSERVATION",
  "temporal_maturity": "PERIOD_OBSERVED",
  "assurance_level": "INTERNALLY_AUDITED",
  "measurement_window_start": "2026-09-01T00:00:00.000Z",
  "measurement_window_end": "2026-09-30T23:59:59.999Z",
  "created_at": "2026-09-12T00:00:00.000Z",
  "verified_at": "2026-09-12T00:00:00.000Z",
  "verified_by": "AETF500_AuditEngine_v1.1",
  "status": "VALID",
  "audit_trail": [
    "2026-09-12T00:00:00.000Z - Extraction completed from BillingLedger",
    "2026-09-12T00:00:00.000Z - Canonical SHA-256 generated and verified",
    "2026-09-12T00:00:00.000Z - Internally audited against bank settlement"
  ]
}
```
