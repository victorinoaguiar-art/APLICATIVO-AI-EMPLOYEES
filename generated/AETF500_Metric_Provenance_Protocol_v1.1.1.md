# AETF-500 Metric Provenance Protocol v1.1.1

> **Protocol Version**: v1.1.1  
> **Integrity standard**: Cryptographic Lineage & Immutable Audit Chains  

---

## 1. Cryptographic Hash Validation

All evidence logs, metric snapshots, and audit records MUST include a 64-character hexadecimal SHA-256 string matching regex:

```regex
^[a-fA-F0-9]{64}$
```

### Prohibited Digest Patterns
1. Placeholder hashes (e.g., `"0000000000000000000000000000000000000000000000000000000000000000"`, `"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"` as placeholders).
2. Truncated or malformed hashes (length $\neq 64$).
3. Any string triggering `HASH_PLACEHOLDER_DETECTION`.

### Allowed Empty Hash Exemption
The special empty hash constant `SHA256_EMPTY` (`"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"`) is valid ONLY as a root parent hash for genesis records.

---

## 2. Parent Hash Lineage Chaining

Every audit log entry (`MetricCorrectionRecord`, `MetricReclassificationRecord`, `MetricReconciliationRecord`) references:
- `record_id`: Unique UUID v4.
- `timestamp`: ISO-8601 UTC string.
- `parent_record_hash`: SHA-256 digest of the previous state or record.
- `current_record_hash`: SHA-256 digest of the current record payload.

---

## 3. Provenance Verification Algorithm

```typescript
function verifyLineageChain(records: AuditRecord[]): boolean {
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (!/^[a-fA-F0-9]{64}$/.test(rec.current_record_hash)) {
      throw new Error("INVALID_HASH_FORMAT");
    }
    if (i > 0 && rec.parent_record_hash !== records[i - 1].current_record_hash) {
      throw new Error("LINEAGE_CHAIN_BROKEN");
    }
  }
  return true;
}
```
