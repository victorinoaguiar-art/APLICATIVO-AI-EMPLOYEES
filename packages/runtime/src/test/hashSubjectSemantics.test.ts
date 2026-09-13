import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  PGCAccountMappingEngineV114,
  AETF500KnowledgeGapFillingForensicMatrixEngineV10,
  AETF500MultiJurisdictionEvidenceIntegrityFinalPatchEngineV10,
  AETF500CryptographicSha256RemediationEngineV10,
  recomputePaymentEvidenceHash,
  recomputeInvoiceEvidenceHash,
} from '../commerce/PGCAccountingEngineV114.js';
import {
  ForensicGapAuditRecord,
  ForensicEvidenceManifestItem,
} from '@ai-employee/shared';

describe('AETF-500 Hash Subject Semantics & Evidence Recomputability Final Micro-Patch v1.0', () => {
  const mappingEngine = new PGCAccountMappingEngineV114();
  const matrixEngine = new AETF500KnowledgeGapFillingForensicMatrixEngineV10();
  const integrityEngine = new AETF500MultiJurisdictionEvidenceIntegrityFinalPatchEngineV10();
  const cryptoEngine = new AETF500CryptographicSha256RemediationEngineV10();

  it('TEST-HASH-SUBJECT-001: SOURCE_ID_HASH_NOT_ACCEPTED_AS_FILE_HASH', () => {
    const gaps: ForensicGapAuditRecord[] = matrixEngine.getForensicGapAuditRecords();
    gaps.forEach((g: ForensicGapAuditRecord) => {
      g.sources.forEach((s) => {
        // Must never present synthetic hash of source_id string as file sha256
        assert.notStrictEqual(s.sha256, `sha256_of_${s.source_id}`);
        if (s.verification_status === 'SOURCE_FILE_NOT_AVAILABLE') {
          assert.strictEqual(s.sha256, null);
          assert.strictEqual(s.hash_subject, 'PHYSICAL_FILE_BYTES');
        }
      });
    });
  });

  it('TEST-HASH-SUBJECT-002: REAL_SOURCE_FILE_BYTES_SHA256', () => {
    const verify = integrityEngine.getSrcHc001PrimaryByteVerificationV10();
    assert.strictEqual(verify.hash_match, true);
    assert.strictEqual(verify.document_identity_match, true);
    assert.strictEqual(verify.verification_status, 'VERIFIED_FROM_ACTUAL_BYTES');
  });

  it('TEST-HASH-SUBJECT-003: SOURCE_FILE_NOT_AVAILABLE_FAILS_CLOSED', () => {
    const gaps: ForensicGapAuditRecord[] = matrixEngine.getForensicGapAuditRecords();
    const missingSource = gaps[0].sources[0];
    assert.strictEqual(missingSource.sha256, null);
    assert.strictEqual(missingSource.verification_status, 'SOURCE_FILE_NOT_AVAILABLE');
    assert.strictEqual(missingSource.hash_subject, 'PHYSICAL_FILE_BYTES');
  });

  it('TEST-MANIFEST-001: MANIFEST_HASH_FROM_ACTUAL_BYTES', () => {
    const manifest: ForensicEvidenceManifestItem[] = matrixEngine.getForensicEvidenceManifest();
    const invItem = manifest.find((i: ForensicEvidenceManifestItem) => i.artifact_id === 'ART-EVID-INVENTORY');
    assert.notStrictEqual(invItem, undefined);
    if (invItem && invItem.status === 'VERIFIED_FROM_REAL_FILE_BYTES') {
      assert.strictEqual(typeof invItem.sha256, 'string');
      assert.strictEqual(invItem.sha256!.length, 64);
      assert.strictEqual(invItem.hash_subject, 'PHYSICAL_FILE_BYTES');
    }
  });

  it('TEST-MANIFEST-002: LOGICAL_LABEL_HASH_REJECTED', () => {
    const manifest: ForensicEvidenceManifestItem[] = matrixEngine.getForensicEvidenceManifest();
    manifest.forEach((item: ForensicEvidenceManifestItem) => {
      if (item.artifact_id.startsWith('ART-EVID-GAP-')) {
        if (item.status === 'FILE_NOT_FOUND') {
          assert.strictEqual(item.sha256, null);
          assert.strictEqual(item.size_bytes, null);
        }
      }
    });
  });

  it('TEST-MANIFEST-003: SELF_HASH_USES_SIDECAR', () => {
    const manifest: ForensicEvidenceManifestItem[] = matrixEngine.getForensicEvidenceManifest();
    const selfItem = manifest.find((i: ForensicEvidenceManifestItem) => i.artifact_id === 'ART-EVID-MANIFEST-FILE');
    assert.notStrictEqual(selfItem, undefined);
    if (selfItem) {
      assert.strictEqual(selfItem.sha256, null);
      assert.strictEqual(selfItem.hash_subject, 'MANIFEST_FILE_BYTES_VIA_SIDECAR');
      assert.strictEqual(selfItem.status, 'SIDECAR_SHA256_VERIFIED');
    }
  });

  it('TEST-EVIDENCE-001: VALID_PAYMENT_HASH_RECOMPUTATION_PASS', () => {
    const payJournal = mappingEngine.resolvePaymentJournal({
      payment_id: 'PAY-TEST-001',
      tenant_id: 'TNT-001',
      customer_id: 'CUST-001',
      amount_paid_aoa: 100000,
      customer_market: 'DOMESTIC',
      payment_method: 'BANK_TRANSFER',
      accounting_date: '2026-09-12',
    });

    const recomputed = recomputePaymentEvidenceHash({
      payment_id: payJournal.transaction_id,
      lines: payJournal.lines,
      totalDebit: payJournal.total_debit,
      totalCredit: payJournal.total_credit,
    });

    assert.strictEqual(payJournal.evidence_hash, recomputed);
    assert.strictEqual(/^[a-f0-9]{64}$/i.test(payJournal.evidence_hash), true);
  });

  it('TEST-EVIDENCE-002: FAKE_64_CHAR_HASH_FAIL', () => {
    const payJournal = mappingEngine.resolvePaymentJournal({
      payment_id: 'PAY-TEST-002',
      tenant_id: 'TNT-001',
      customer_id: 'CUST-001',
      amount_paid_aoa: 100000,
      customer_market: 'DOMESTIC',
      payment_method: 'BANK_TRANSFER',
      accounting_date: '2026-09-12',
    });

    // Replace evidence_hash with fake 64-character hash
    payJournal.evidence_hash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    const recomputed = recomputePaymentEvidenceHash({
      payment_id: payJournal.transaction_id,
      lines: payJournal.lines,
      totalDebit: payJournal.total_debit,
      totalCredit: payJournal.total_credit,
    });

    const matches = payJournal.evidence_hash === recomputed;
    assert.strictEqual(matches, false);
  });

  it('TEST-EVIDENCE-003: ONE_FIELD_TAMPER_FAIL', () => {
    const payJournal = mappingEngine.resolvePaymentJournal({
      payment_id: 'PAY-TEST-003',
      tenant_id: 'TNT-001',
      customer_id: 'CUST-001',
      amount_paid_aoa: 100000,
      customer_market: 'DOMESTIC',
      payment_method: 'BANK_TRANSFER',
      accounting_date: '2026-09-12',
    });

    // Tamper single field: modify debit amount in line 0 without updating evidence_hash
    payJournal.lines[0].debit = 100001;

    const recomputed = recomputePaymentEvidenceHash({
      payment_id: payJournal.transaction_id,
      lines: payJournal.lines,
      totalDebit: payJournal.total_debit,
      totalCredit: payJournal.total_credit,
    });

    const matches = payJournal.evidence_hash === recomputed;
    assert.strictEqual(matches, false);
  });

  it('TEST-EVIDENCE-004: VALID_INVOICE_HASH_RECOMPUTATION_PASS', () => {
    const invJournal = mappingEngine.resolveInvoiceJournal({
      transaction_id: 'TX-INV-001',
      tenant_id: 'TNT-001',
      customer_id: 'CUST-001',
      invoice_amount_aoa: 500000,
      customer_market: 'DOMESTIC',
      vat_rate_pct: 14,
      accounting_date: '2026-09-12',
    });

    const recomputed = recomputeInvoiceEvidenceHash({
      transaction_id: invJournal.transaction_id,
      lines: invJournal.lines,
      totalDebit: invJournal.total_debit,
      totalCredit: invJournal.total_credit,
    });

    assert.strictEqual(invJournal.evidence_hash, recomputed);
  });

  it('TEST-GATE-FINAL: executeHashSubjectFinalGateV10', () => {
    const gateResult = cryptoEngine.executeHashSubjectFinalGateV10();
    assert.strictEqual(gateResult.program_id, 'AETF500_HASH_SUBJECT_SEMANTICS_EVIDENCE_RECOMPUTABILITY_FINAL_MICRO_PATCH_v1.0');
    assert.strictEqual(gateResult.baseline_mutation_allowed, false);
    assert.strictEqual(gateResult.source_file_hash_semantics_gate, 'PASS_WITH_PHYSICAL_SOURCE_FILES_PENDING');
    assert.strictEqual(gateResult.forensic_manifest_file_hash_gate, 'PASS');
    assert.strictEqual(gateResult.accounting_evidence_recomputation_gate, 'PASS');
    assert.strictEqual(gateResult.hash_subject_final_gate_01, 'PASS_WITH_PHYSICAL_SOURCE_FILES_PENDING');
    assert.strictEqual(gateResult.total_material_hash_semantics_gaps, 0);
  });
});
