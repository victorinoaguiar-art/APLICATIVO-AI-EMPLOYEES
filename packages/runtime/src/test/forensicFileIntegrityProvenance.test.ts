import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500ForensicFileIntegrityProvenanceClosureEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Forensic File Integrity & Provenance Closure v1.0', () => {
  const engine = new AETF500ForensicFileIntegrityProvenanceClosureEngineV10();

  it('executes forensic verification program on actual bytes and passes FORENSIC-FINAL-GATE-01', () => {
    const result = engine.executeForensicFileIntegrityProvenanceClosureV10();

    assert.equal(result.program_id, 'AETF500_FORENSIC_FILE_INTEGRITY_PROVENANCE_CLOSURE_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.forensic_artifact_01, 'PGC Decreto 82/01 PDF');
    assert.equal(result.forensic_artifact_01_size_bytes, 5188378);
    assert.equal(result.forensic_artifact_01_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');

    assert.equal(result.forensic_artifact_02, 'Decreto Presidencial 180/19 PDF');
    assert.equal(result.forensic_artifact_02_size_bytes, 1571244);
    assert.equal(result.forensic_artifact_02_sha256, '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c');

    assert.equal(result.forensic_artifact_03, 'PGCAccountingEngineV114.ts');
    assert.equal(result.forensic_artifact_03_size_bytes, 274866);
    assert.equal(result.forensic_artifact_03_sha256, '8a3627a456d6db1d431c75408f4e936a13763e41b7d1d339c1bcc8cf40ac4fc0');

    assert.equal(result.pgc_pdf_equals_iva_pdf_hash, false);
    assert.equal(result.pgc_pdf_equals_typescript_hash, false);
    assert.equal(result.iva_pdf_equals_typescript_hash, false);

    assert.equal(result.all_file_sizes_verified_from_filesystem, true);
    assert.equal(result.all_hashes_recomputed_from_actual_bytes, true);
    assert.equal(result.independent_hash_methods_match, true);
    assert.equal(result.historical_hash_errors_found, true);
    assert.equal(result.historical_size_errors_found, true);
    assert.equal(result.hash_registry_errors_remaining, 0);

    assert.equal(result.content_errors_found, false);
    assert.equal(result.provenance_only_errors_found, true);
    assert.equal(result.forensic_final_gate_01, 'PASS');
    assert.equal(result.material_provenance_gaps, 0);
    assert.equal(result.final_patch_status, 'PASS');
    assert.equal(
      result.final_multi_jurisdiction_architecture_status,
      'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
    );
  });

  it('verifies forensic file integrity register and double hash consistency', () => {
    const reg = engine.getForensicFileIntegrityRegisterV10();
    assert.equal(reg.length, 3);

    const f1 = reg.find((a) => a.artifact_id === 'FORENSIC-ARTIFACT-01');
    const f2 = reg.find((a) => a.artifact_id === 'FORENSIC-ARTIFACT-02');
    const f3 = reg.find((a) => a.artifact_id === 'FORENSIC-ARTIFACT-03');

    assert.ok(f1 && f1.file_size_bytes === 5188378 && f1.methods_match && f1.sha256 === '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.ok(f2 && f2.file_size_bytes === 1571244 && f2.methods_match && f2.sha256 === '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c');
    assert.ok(f3 && f3.file_size_bytes === 274866 && f3.methods_match && f3.sha256 === '8a3627a456d6db1d431c75408f4e936a13763e41b7d1d339c1bcc8cf40ac4fc0');
  });

  it('documents historical corrections in correction register', () => {
    const corr = engine.getHistoricalHashCorrectionRegisterV10();
    assert.equal(corr.length, 2);

    const c1 = corr.find((c) => c.correction_id === 'CORR-001');
    const c2 = corr.find((c) => c.correction_id === 'CORR-002');

    assert.ok(c1 && c1.error_type === 'ROUNDED_FILE_SIZE_ERROR' && c1.correction_applied);
    assert.ok(c2 && c2.error_type === 'COPIED_HASH_ERROR' && c2.correction_applied);
  });
});
