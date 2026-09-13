import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AETF500CountryPackMaturityCertificationCeilingEngineV10 } from '../commerce/PGCAccountingEngineV114';
import { EmployeeCountryCertificationCeilingReconciliationRecord } from '@ai-employee/shared';

describe('AETF-500 Country Pack Maturity → Employee Certification Ceiling Micro-Gate v1.0', () => {
  const engine = new AETF500CountryPackMaturityCertificationCeilingEngineV10();

  it('1. TEST-CEILING-001 — NO_EMPLOYEE_CERTIFICATION_ABOVE_COUNTRY_PACK_CEILING', () => {
    const gateResult = engine.executeCertificationCeilingGateV10();
    assert.strictEqual(gateResult.above_ceiling_without_exception, 0);
    assert.strictEqual(gateResult.above_ceiling_with_invalid_exception, 0);
    assert.strictEqual(gateResult.subgates.no_unsupported_above_ceiling_certification_gate, 'PASS');
  });

  it('2. TEST-CEILING-002 — ABOVE_CEILING_REQUIRES_FORMAL_EXCEPTION', () => {
    const gateResult = engine.executeCertificationCeilingGateV10();
    assert.strictEqual(gateResult.above_ceiling_with_valid_exception, 1000);
    assert.strictEqual(gateResult.country_pt_valid_exceptions, 500);
    assert.strictEqual(gateResult.country_mz_valid_exceptions, 500);
    assert.strictEqual(gateResult.subgates.exception_evidence_gate, 'PASS');
  });

  it('3. TEST-CEILING-003 — COUNTRY_OPERATIONAL_STATUS_CANNOT_BYPASS_MATURITY_CEILING', () => {
    const gateResult = engine.executeCertificationCeilingGateV10();
    assert.strictEqual(gateResult.country_operational_status_bypasses_found, 0);
    assert.strictEqual(gateResult.subgates.country_operational_status_non_bypass_gate, 'PASS');
  });

  it('4. TEST-CEILING-004 — PRODUCTION_CERTIFIED_EMPLOYEE_REQUIRES_ALLOWED_CEILING', () => {
    const records = engine.evaluateAllRecords();
    const prodCertRecords = records.filter(r => r.employee_country_certification_status === 'PRODUCTION_CERTIFIED');
    
    // All PRODUCTION_CERTIFIED records must be in AO (L6)
    assert.strictEqual(prodCertRecords.length, 500);
    prodCertRecords.forEach((r: EmployeeCountryCertificationCeilingReconciliationRecord) => {
      assert.strictEqual(r.country_code, 'AO');
      assert.strictEqual(r.country_pack_maturity_level, 'L6_PRODUCTION_CERTIFIED');
    });
  });

  it('5. TEST-CEILING-005 — NO_COUNTRY_LEVEL_AUTO_CERTIFICATION', () => {
    const gateResult = engine.executeCertificationCeilingGateV10();
    assert.strictEqual(gateResult.country_operational_status_bypasses_found, 0);
    assert.strictEqual(gateResult.subgates.country_operational_status_non_bypass_gate, 'PASS');
  });

  it('6. TEST-CEILING-006 — ALL_EMPLOYEE_COUNTRY_RECORDS_EVALUATED', () => {
    const records = engine.evaluateAllRecords();
    assert.strictEqual(records.length, 3000);
    const gateResult = engine.executeCertificationCeilingGateV10();
    assert.strictEqual(gateResult.employee_country_records_evaluated, 3000);
    assert.strictEqual(gateResult.subgates.all_3000_records_evaluated_gate, 'PASS');
  });

  it('7. TEST-CEILING-007 — ONE_CEILING_RESULT_PER_EMPLOYEE_COUNTRY_RECORD', () => {
    const records = engine.evaluateAllRecords();
    const validResults = [
      'WITHIN_CEILING',
      'AT_CEILING',
      'BELOW_CEILING',
      'ABOVE_CEILING_WITH_VALID_EXCEPTION',
      'ABOVE_CEILING_WITH_INVALID_EXCEPTION',
      'ABOVE_CEILING_WITH_NO_EXCEPTION',
      'CEILING_POLICY_UNRESOLVED',
    ];
    records.forEach((r: EmployeeCountryCertificationCeilingReconciliationRecord) => {
      assert.strictEqual(validResults.includes(r.ceiling_result), true);
    });
  });
});
