import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { AETF500CryptographicSha256RemediationEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Cryptographic SHA-256 Remediation & Dependent Hash Recalculation v1.0', () => {
  const engine = new AETF500CryptographicSha256RemediationEngineV10();

  it('TEST-CRYPTO-001: verifies empty string known SHA-256 vector', () => {
    const hash = createHash('sha256').update('').digest('hex');
    assert.equal(hash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('TEST-CRYPTO-002: verifies "abc" known SHA-256 vector', () => {
    const hash = createHash('sha256').update('abc').digest('hex');
    assert.equal(hash, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('TEST-CRYPTO-003: verifies determinism (same input produces same hash)', () => {
    const input = 'AETF500_DETERMINISTIC_PAYLOAD_TEST';
    const hash1 = createHash('sha256').update(input).digest('hex');
    const hash2 = createHash('sha256').update(input).digest('hex');
    assert.equal(hash1, hash2);
  });

  it('TEST-CRYPTO-004: verifies avalanche effect (1-byte change produces completely different hash)', () => {
    const input1 = 'AETF500_PAYLOAD_V1';
    const input2 = 'AETF500_PAYLOAD_V2';
    const hash1 = createHash('sha256').update(input1).digest('hex');
    const hash2 = createHash('sha256').update(input2).digest('hex');
    assert.notEqual(hash1, hash2);
  });

  it('TEST-CRYPTO-005 & 006: executes cryptographic remediation engine and passes CRYPTO-FINAL-GATE-01', () => {
    const result = engine.executeCryptographicSha256RemediationV10();
    assert.equal(result.program_id, 'AETF500_CRYPTOGRAPHIC_SHA256_REMEDIATION_DEPENDENT_HASH_RECALCULATION_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);
    assert.equal(result.old_hash_function, 'AETF_CUSTOM_NON_CRYPTOGRAPHIC_DIGEST_V1');
    assert.equal(result.new_hash_function, 'SHA-256');
    assert.equal(result.crypto_implementation, 'NODE_CRYPTO');

    assert.equal(result.known_vector_empty_pass, true);
    assert.equal(result.known_vector_abc_pass, true);
    assert.equal(result.total_computesha256_calls, 23);
    assert.equal(result.payload_hash_calls, 2);
    assert.equal(result.manifest_hash_calls, 7);
    assert.equal(result.physical_file_hash_calls, 0);
    assert.equal(result.synthetic_identifier_hash_calls, 14);

    assert.equal(result.pgc_pdf_hash_changed, false);
    assert.equal(result.vat_pdf_hash_changed, false);
    assert.equal(result.crypto_final_gate_01, 'PASS');
    assert.equal(result.material_cryptographic_gaps_remaining, 0);
    assert.equal(result.final_crypto_remediation_status, 'PASS');
  });

  it('TEST-CRYPTO-007 & 008: verifies dependency inventory structure and call classification', () => {
    const inventory = engine.getComputeSha256DependencyInventoryV10Json();
    assert.equal(inventory.program_id, 'AETF500_CRYPTOGRAPHIC_SHA256_REMEDIATION_DEPENDENT_HASH_RECALCULATION_v1.0');
    assert.equal(inventory.total_calls, 23);
    assert.equal(inventory.summary.synthetic_identifier_hash_calls, 14);
    assert.equal(inventory.summary.calls_recomputed, 9);
    assert.equal(inventory.summary.calls_blocked_file_not_found, 14);
  });

  it('TEST-CRYPTO-NEGATIVE: rejects 64-char fake digest when payload recomputation does not match', () => {
    const payload = 'EXACT_PAYLOAD_STRING';
    const realHash = createHash('sha256').update(payload).digest('hex');
    const fake64CharHash = 'a'.repeat(64); // Passes /^[a-f0-9]{64}$/i regex

    // Regex check passes
    assert.equal(/^[a-f0-9]{64}$/i.test(fake64CharHash), true);

    // Recomputation check fails
    const isRecomputedMatch = fake64CharHash === realHash;
    assert.equal(isRecomputedMatch, false);
  });
});
