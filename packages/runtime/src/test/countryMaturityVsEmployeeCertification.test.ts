import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { AETF500CountryMaturityVsEmployeeCertificationEngineV10 } from '../commerce/PGCAccountingEngineV114';

describe('AETF-500 Country Maturity vs Employee×Country Certification Semantic Closure v1.0', () => {
  const engine = new AETF500CountryMaturityVsEmployeeCertificationEngineV10();

  it('1. TEST-CERT-SEM-001 — COUNTRY_STATUS_MUST_NOT_AUTO_CERTIFY_ALL_EMPLOYEES', () => {
    const dict = engine.getSemanticDictionary();
    const empCertItem = dict.find(item => item.field_name === 'employee_country_certification_status');

    assert.ok(empCertItem);
    assert.strictEqual(empCertItem.automatic_propagation_allowed, false);
    assert.strictEqual(empCertItem.entity_level, 'EMPLOYEE_COUNTRY');
  });

  it('2. TEST-CERT-SEM-002 — MATURITY_LEVEL_MUST_BE_SINGLE_VALUED', () => {
    const summaries = engine.getCountrySummaries();

    summaries.forEach(summary => {
      // Must be a single value enum like L6_PRODUCTION_CERTIFIED (no L4/L5 dual values)
      assert.match(summary.country_pack_maturity_level, /^L[0-6](_[A-Z_]+)?$/);
      assert.strictEqual(summary.country_pack_maturity_level.includes('/'), false);
    });
  });

  it('3. TEST-CERT-SEM-003 — POSITIVE_CERTIFICATION_COUNT_FROM_DISTINCT_EMPLOYEE_COUNTRY_RECORDS', () => {
    const summaries = engine.getCountrySummaries();
    const totalPositives = summaries.reduce((acc, curr) => acc + curr.employee_positive_certification_records, 0);

    // AO(500) + PT(500) + MZ(500) = 1500 individual employee x country records
    assert.strictEqual(totalPositives, 1500);

    const gate = engine.executeCountryCertificationGateV10();
    assert.strictEqual(gate.positive_certification_count_recomputed_from_individual_records, true);
    assert.strictEqual(gate.country_status_auto_propagation_used, false);
  });

  it('4. TEST-CERT-SEM-004 — EMPLOYEE_COUNTRY_STATUS_DISTRIBUTION_SUM', () => {
    const summaries = engine.getCountrySummaries();
    const totalRecords = summaries.reduce((acc, curr) => acc + curr.employee_country_records_total, 0);

    assert.strictEqual(totalRecords, 3000);
  });

  it('5. TEST-CERT-SEM-005 — NO_DOUBLE_COUNTED_EMPLOYEE_COUNTRY_STATUS', () => {
    const gate = engine.executeCountryCertificationGateV10();

    assert.strictEqual(gate.double_counted_employee_country_records, 0);
    assert.strictEqual(gate.subgates.country_maturity_single_value_gate, 'PASS');
    assert.strictEqual(gate.subgates.country_operational_status_separation_gate, 'PASS');
    assert.strictEqual(gate.subgates.employee_country_certification_recomputation_gate, 'PASS');
    assert.strictEqual(gate.country_certification_semantic_gate_01, 'PASS');
    assert.strictEqual(gate.material_country_certification_semantic_gaps, 0);
    assert.strictEqual(gate.final_country_certification_semantic_status, 'PASS');
  });
});
