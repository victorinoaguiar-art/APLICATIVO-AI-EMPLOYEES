import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CertL3AuthenticityFreezeEngine } from '../aetf/CertL3AuthenticityFreezeEngine.js';

describe('AETF-500 Final Corrections & Production Baseline Freeze Test Suite', () => {
  const engine = CertL3AuthenticityFreezeEngine.getInstance();
  const summary = engine.runAuthenticityFreezeAudit();

  it('1. SHA-256 Real Digest & Internal Authenticity Classification', () => {
    assert.strictEqual(summary.artifact_id, 'AETF500_CERTL3_PRODUCTION_FREEZE_2026_09_11');
    assert.strictEqual(summary.baseline_id, 'AETF-500-CERTL3-PRODUCTION-BASELINE-2026.09.11');
    assert.strictEqual(summary.hash_algorithm, 'SHA-256');
    assert.strictEqual(summary.internal_authenticity_audit, 'PASS');
    assert.strictEqual(summary.norma_interna, 'Norma Interna de Certificação AETF-500 v2.0');
    assert.strictEqual(summary.integrity_hash.length, 64);
    assert.strictEqual(summary.freeze_manifest_sha256.length, 64);
  });

  it('2. Security Metrics with Denominators Verification', () => {
    const sec = summary.security_metrics;

    assert.strictEqual(sec.cross_tenant_attempts, 500);
    assert.strictEqual(sec.successful_cross_tenant_breaches, 0);
    assert.strictEqual(sec.credential_attack_attempts, 500);
    assert.strictEqual(sec.successful_credential_leaks, 0);
    assert.strictEqual(sec.privilege_escalation_attempts, 500);
    assert.strictEqual(sec.successful_privilege_escalations, 0);
    assert.strictEqual(sec.prompt_injection_attempts, 500);
    assert.strictEqual(sec.successful_prompt_injections, 0);
    assert.strictEqual(sec.approval_bypass_attempts, 500);
    assert.strictEqual(sec.successful_approval_bypasses, 0);
    assert.strictEqual(sec.unsafe_attempts, 38);
    assert.strictEqual(sec.unsafe_attempts_blocked, 38);
    assert.strictEqual(sec.unsafe_executed_actions, 0);
  });

  it('3. Primavera ERP Strict Block & Canonical Restricted List Enforcement', () => {
    const records = engine.generateScopedAuthorizationRecords();
    const restrictedRecords = records.filter((r: any) => r.cert_l3_status === 'CERT_L3_WITH_RESTRICTIONS');
    const canonicalList = engine.getCanonicalRestrictedEmployeeList();

    assert.strictEqual(restrictedRecords.length, 10);
    assert.strictEqual(canonicalList.length, 10);

    for (const r of restrictedRecords) {
      assert.strictEqual(r.hitl_scope.primavera_write_blocked, true);
      assert.strictEqual(r.workflow_scope.includes('full_business_execution'), false);
      assert.strictEqual(r.workflow_scope.includes('document_analysis'), true);
      assert.ok(r.restrictions.some((res: string) => res.includes('PRIMAVERA_WRITE = BLOCKED')));
    }

    for (const c of canonicalList) {
      assert.strictEqual(c.restriction, 'PRIMAVERA_WRITE = BLOCKED');
      assert.strictEqual(c.hitl_override_allowed, false);
    }
  });

  it('4. Wave Operational Grouping & Scoped Production Records', () => {
    const records = engine.generateScopedAuthorizationRecords();

    assert.strictEqual(records.length, 500);
    const waveA = records.filter((r: any) => r.wave_group === 'WAVE-A');
    const waveB = records.filter((r: any) => r.wave_group === 'WAVE-B');
    const waveC = records.filter((r: any) => r.wave_group === 'WAVE-C');
    const waveD = records.filter((r: any) => r.wave_group === 'WAVE-D');

    assert.strictEqual(waveA.length, 100);
    assert.strictEqual(waveB.length, 150);
    assert.strictEqual(waveC.length, 150);
    assert.strictEqual(waveD.length, 100);

    const waveDFull = waveD.filter((r: any) => r.cert_l3_status === 'CERT_L3_APPROVED');
    const waveDRestricted = waveD.filter((r: any) => r.cert_l3_status === 'CERT_L3_WITH_RESTRICTIONS');
    assert.strictEqual(waveDFull.length, 90);
    assert.strictEqual(waveDRestricted.length, 10);

    for (const r of records) {
      assert.ok(r.tenant_scope.length > 0);
      assert.ok(r.workflow_scope.length > 0);
      assert.ok(r.integrity_hash.length === 64);
    }
  });

  it('5. Verified Tenant Authorization Record Structure & Financial Profile Calculation', () => {
    const auths = engine.getVerifiedTenantAuthorizations();
    const finProfileRestricted = engine.getFinancialAuthorizationProfile('495');
    const finProfileWaveA = engine.getFinancialAuthorizationProfile('10');

    assert.strictEqual(auths.length, 3);
    for (const a of auths) {
      assert.strictEqual(a.verification_status, 'EXTERNALLY_VERIFIED');
      assert.ok(a.regulatory_license_reference.length > 0);
      assert.ok(a.authorized_signatory.length > 0);
    }

    assert.strictEqual(finProfileRestricted.financial_permission, 'READ_ONLY');
    assert.strictEqual(finProfileRestricted.max_transaction_amount_kwanza, 0);

    assert.strictEqual(finProfileWaveA.financial_permission, 'EXECUTE_WITH_HITL');
    assert.strictEqual(finProfileWaveA.max_transaction_amount_kwanza, 10000000);
  });
});
