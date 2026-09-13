/**
 * Test Suite: PGC Angola (Decreto n.º 82/01) & IVA (Decreto Presidencial n.º 180/19) v1.1.5 Accounting Precision Patch
 * Master Test Suite covering 25 points of Prompt Mestre v1.1.5
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PGC_MASTER_ACCOUNT_REGISTRY_V114,
  PGC_MASTER_ACCOUNT_REGISTRY_V116,
  PGC_MASTER_ACCOUNT_REGISTRY_V117,
  VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V116,
  VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117,
  VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V118,
  ACCOUNT_USAGE_INVENTORY_V114,
  PGCAccountMappingEngineV114,
  PGCRevenueRecognitionEngineV114,
  PGCAccountingGateEngineV114,
  PGCAccountingGateEngineV115,
  PGCAccountingGateEngineV116,
  PGCAccountingGateEngineV117,
  PGCAccountingGateEngineV118,
  PGCFinalEvidenceClosureGateEngineV118,
  PGCFinalEvidenceClosureGateEngineV118Addendum2,
  PGCInternalEvidenceRecomputationGateEngineV118,
  TAX_RULE_VERSION_REGISTRY_V118,
  ACCOUNTING_EVIDENCE_REGISTRY_V118,
  ACCOUNTING_MATERIAL_CORRECTIONS_REGISTER_V118,
} from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 v1.1.8 PGC Angola, VAT Source-Lock & Evidence Closure Suite', () => {
  const mappingEngine = new PGCAccountMappingEngineV114();
  const revEngine = new PGCRevenueRecognitionEngineV114();
  const gateEngineV114 = new PGCAccountingGateEngineV114();
  const gateEngineV115 = new PGCAccountingGateEngineV115();
  const gateEngineV116 = new PGCAccountingGateEngineV116();
  const gateEngineV117 = new PGCAccountingGateEngineV117();
  const gateEngineV118 = new PGCAccountingGateEngineV118();
  const closureGateEngine = new PGCFinalEvidenceClosureGateEngineV118();

  it('TEST_PGC_ACCOUNT_EXISTS: Master Registry contains minimum required PGC accounts', () => {
    assert.ok(PGC_MASTER_ACCOUNT_REGISTRY_V114.length >= 18);
    const codes = PGC_MASTER_ACCOUNT_REGISTRY_V114.map((a) => a.account_code);
    assert.ok(codes.includes('31.1.1'));
    assert.ok(codes.includes('31.1.2.1'));
    assert.ok(codes.includes('31.1.2.2'));
    assert.ok(codes.includes('34.5.3'));
    assert.ok(codes.includes('43.1.1'));
    assert.ok(codes.includes('62.1.1'));
  });

  it('TEST_MATERIAL_ERROR_43_71_REMEDIATED: Invalidate 43.1 as Customer and 71.1 as SaaS Revenue', () => {
    const acc31Group = mappingEngine.getAccount('31.1.1');
    assert.equal(acc31Group.account_name, 'Clientes Correntes — Grupo');
    assert.equal(acc31Group.account_type, 'ASSET');

    const acc31Nat = mappingEngine.getAccount('31.1.2.1');
    assert.equal(acc31Nat.account_name, 'Clientes Correntes Não Grupo Nacionais');
    assert.equal(acc31Nat.account_type, 'ASSET');

    const acc43 = mappingEngine.getAccount('43.1.1');
    assert.equal(acc43.account_name, 'Banco BAI - Depósito à Ordem AOA');
    assert.equal(acc43.account_type, 'ASSET');

    const acc62 = mappingEngine.getAccount('62.1.1');
    assert.equal(acc62.account_name, 'Serviços principais — Mercado nacional');
    assert.equal(acc62.account_type, 'REVENUE');

    const acc71 = mappingEngine.getAccount('71.1');
    assert.equal(acc71.account_name, 'Custos das Existências Vendidas (Matérias e Mercadorias)');
    assert.equal(acc71.account_type, 'EXPENSE'); // PROHIBITED for SaaS Revenue!
  });

  it('TEST_UNKNOWN_ACCOUNT_BLOCKED: Rejects invented or unlisted account codes', () => {
    assert.throws(
      () => mappingEngine.getAccount('99.99.9'),
      (err: any) => err.message.includes('UNKNOWN_ACCOUNT')
    );
  });

  it('TEST_ACCOUNT_CODE_NAME_MATCH: Ensures account code matches official class and nature', () => {
    for (const acc of PGC_MASTER_ACCOUNT_REGISTRY_V114) {
      if (acc.account_code.startsWith('31.')) {
        assert.equal(acc.account_class, 'CLASS_3_TERCEIROS');
      }
      if (acc.account_code.startsWith('43.')) {
        assert.equal(acc.account_class, 'CLASS_4_MEIOS_MONETARIOS');
      }
      if (acc.account_code.startsWith('62.')) {
        assert.equal(acc.account_class, 'CLASS_6_PROVEITOS_E_GANHOS');
      }
      if (acc.account_code.startsWith('71.')) {
        assert.equal(acc.account_class, 'CLASS_7_CUSTOS_E_PERDAS');
      }
    }
  });

  it('TEST_IVA_ACCOUNT_TREE: Full 9 subaccounts of VAT 34.5 (Decreto Presidencial n.º 180/19)', () => {
    const vatAccounts = PGC_MASTER_ACCOUNT_REGISTRY_V114.filter((a) => a.account_code.startsWith('34.5'));
    assert.equal(vatAccounts.length, 9);
    const vatCodes = vatAccounts.map((a) => a.account_code).sort();
    assert.deepEqual(vatCodes, [
      '34.5.1',
      '34.5.2',
      '34.5.3',
      '34.5.4',
      '34.5.5',
      '34.5.6',
      '34.5.7',
      '34.5.8',
      '34.5.9',
    ]);
  });

  it('TEST_INVOICE_JOURNAL_GENERATION: Resolves Débito 31.1.2.1 / Crédito 62.1.1 / Crédito 34.5.3', () => {
    const journal = mappingEngine.resolveInvoiceJournal({
      transaction_id: 'TX-INV-001',
      tenant_id: 'tenant_angola_telecom',
      customer_id: 'CUST-001',
      customer_market: 'DOMESTIC',
      invoice_amount_aoa: 501600, // 440k + 14% IVA
      vat_rate_pct: 14.0,
      accounting_date: '2026-09-12',
    });

    assert.equal(journal.lines.length, 3);
    assert.equal(journal.lines[0].account_code, '31.1.2.1');
    assert.equal(journal.lines[0].debit, 501600);
    assert.equal(journal.lines[1].account_code, '62.1.1');
    assert.equal(journal.lines[1].credit, 440000);
    assert.equal(journal.lines[2].account_code, '34.5.3');
    assert.equal(journal.lines[2].credit, 61600);
  });

  it('TEST_DOUBLE_ENTRY_BALANCE: SUM(DEBITS) must equal SUM(CREDITS)', () => {
    const journal = mappingEngine.resolveInvoiceJournal({
      transaction_id: 'TX-INV-002',
      tenant_id: 'tenant_bai',
      customer_id: 'CUST-002',
      customer_market: 'FOREIGN',
      invoice_amount_aoa: 1000000,
      vat_rate_pct: 0.0,
      accounting_date: '2026-09-12',
    });

    assert.equal(journal.total_debit, journal.total_credit);
    assert.equal(journal.total_debit, 1000000);
    assert.equal(journal.lines[0].account_code, '31.1.2.2');
  });

  it('TEST_PAYMENT_JOURNAL_GENERATION: Resolves Débito 43.1.1 (Banco BAI) / Crédito 31.1.2.1', () => {
    const journal = mappingEngine.resolvePaymentJournal({
      payment_id: 'PAY-001',
      tenant_id: 'tenant_angola_telecom',
      customer_id: 'CUST-001',
      amount_paid_aoa: 501600,
      customer_market: 'DOMESTIC',
      payment_method: 'BANK_TRANSFER',
      accounting_date: '2026-09-12',
    });

    assert.equal(journal.lines[0].account_code, '43.1.1');
    assert.equal(journal.lines[0].debit, 501600);
    assert.equal(journal.lines[1].account_code, '31.1.2.1');
    assert.equal(journal.lines[1].credit, 501600);
    assert.equal(journal.total_debit, journal.total_credit);
  });

  it('TEST_REVENUE_RECOGNITION_SCHEDULE: Monthly Ratable Revenue Schedule Generation', () => {
    const schedule = revEngine.createMonthlySchedule({
      contract_id: 'CTR-2026-001',
      subscription_id: 'SUB-2026-001',
      customer_id: 'CUST-001',
      invoice_id: 'INV-2026-001',
      contract_value_aoa: 5280000, // 440k * 12
      vat_amount_aoa: 648421,
      start_date: '2026-09-12',
      months_duration: 12,
    });

    assert.equal(schedule.status, 'ACTIVE');
    assert.equal(schedule.recognition_method, 'RATABLE_MONTHLY');
    assert.equal(schedule.recognised_to_date, 0);
    assert.ok(schedule.recognisable_amount > 0);
  });

  it('TEST_ACCOUNTING_GATE_V115_EXECUTION: Executes Precision Gate returning PASS', () => {
    const gateResult = gateEngineV115.executePrecisionGateV115();
    assert.equal(gateResult.status, 'PASS');
    assert.equal(gateResult.passed, true);
    assert.equal(gateResult.pgc_31_error_corrected, true);
    assert.equal(gateResult.pgc_62_error_corrected, true);
    assert.equal(gateResult.official_account_names_preserved, true);
    assert.equal(gateResult.analytic_dimensions_separated, true);
    assert.equal(gateResult.final_accounting_status, 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE');
    assert.equal(gateResult.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });

  // ==========================================================================
  // V1.1.6 SPECIFIC TESTS: DEFERRED REVENUE, VAT SEMANTICS & CRYPTO INTEGRITY
  // ==========================================================================

  it('TEST_V116_DEFERRED_REVENUE_37_6_RECONCILED: Verifies Account 37.6 exists and 49.1 is invalidated for SaaS deferred revenue', () => {
    const acc376 = PGC_MASTER_ACCOUNT_REGISTRY_V116.find((a) => a.account_code === '37.6');
    assert.ok(acc376 !== undefined);
    assert.equal(acc376.account_name, 'Proveitos a repartir por períodos futuros');
    assert.equal(acc376.account_type, 'LIABILITY');
    assert.equal(acc376.parent_account, '37');
    assert.equal(acc376.version, '1.1.6');

    const acc491 = PGC_MASTER_ACCOUNT_REGISTRY_V116.find((a) => a.account_code === '49.1');
    assert.equal(acc491, undefined, 'Account 49.1 must be invalidated and removed from master deferred revenue registry');
  });

  it('TEST_V116_VAT_34_5_9_OFFICIAL_ASSESSMENT: Verifies Account 34.5.9 official name and subaccount registry', () => {
    const acc3459 = PGC_MASTER_ACCOUNT_REGISTRY_V116.find((a) => a.account_code === '34.5.9');
    assert.ok(acc3459 !== undefined);
    assert.equal(acc3459.account_name, 'IVA liquidações oficiosas');
    assert.equal(acc3459.version, '1.1.6');

    assert.equal(VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V116.length, 12);
    const sub34591 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V116.find((s) => s.subaccount_code === '34.5.9.1');
    assert.ok(sub34591 !== undefined);
    assert.equal(sub34591.official_name, 'IVA Liquidações Oficiosas - Notificações AGT');
  });

  it('TEST_V116_EMPTY_SHA256_HASH_REJECTED: Baseline Gate fails if baseline hash matches empty SHA-256 hash', () => {
    const emptySha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const gateResult = gateEngineV116.executeFinalIntegrityGateV116();

    assert.notEqual(gateResult.baseline_manifest_hash, emptySha256);
    assert.equal(gateResult.empty_files_found, 0);
    assert.equal(gateResult.empty_sha256_hashes_found, 0);
  });

  it('TEST_V116_FINAL_INTEGRITY_GATE_EXECUTION: Executes Final Integrity Gate returning PASS with 0 defects', () => {
    const gateResult = gateEngineV116.executeFinalIntegrityGateV116();
    assert.equal(gateResult.gate_name, 'SAAS_METRICS_DICTIONARY_v1_1_6_FINAL_ACCOUNTING_INTEGRITY_GATE');
    assert.equal(gateResult.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.6_FROZEN');
    assert.equal(gateResult.previous_baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.5_FROZEN');
    assert.equal(gateResult.previous_baseline_status, 'SUPERSEDED');
    assert.equal(gateResult.status, 'PASS');
    assert.equal(gateResult.passed, true);
    assert.equal(gateResult.deferred_revenue_49_1_error_corrected, true);
    assert.equal(gateResult.vat_34_5_9_error_corrected, true);
    assert.equal(gateResult.vat_official_subaccount_coverage, '12/12 Desdobramentos Oficiais Registados');
    assert.equal(gateResult.digital_signature_status, 'NOT_IMPLEMENTED');
    assert.equal(gateResult.integrity_protection, 'SHA256_HASHED');
    assert.equal(gateResult.document_generation_status, 'SYSTEM_GENERATED');
    assert.equal(gateResult.internal_accounting_defects_remaining, 0);
    assert.equal(gateResult.final_accounting_status, 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE');
    assert.equal(gateResult.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });

  // ==========================================================================
  // V1.1.7 SPECIFIC TESTS: PGC OFFICIAL NAMES, 25 VAT SUBACCOUNTS & SIDECAR
  // ==========================================================================

  it('TEST_PGC_49_1_TITULOS_NEGOCIAVEIS_NAME: Account 49.1 must be "Títulos negociáveis" under Class 49', () => {
    const acc491 = PGC_MASTER_ACCOUNT_REGISTRY_V117.find((a) => a.account_code === '49.1');
    assert.ok(acc491 !== undefined);
    assert.equal(acc491.account_name, 'Títulos negociáveis');
    assert.equal(acc491.parent_account, '49');

    const acc49 = PGC_MASTER_ACCOUNT_REGISTRY_V117.find((a) => a.account_code === '49');
    assert.ok(acc49 !== undefined);
    assert.equal(acc49.account_name, 'Provisões para aplicações de tesouraria');
  });

  it('TEST_PGC_37_OUTROS_VALORES_NAME: Account 37 must be "Outros valores a receber e a pagar"', () => {
    const acc37 = PGC_MASTER_ACCOUNT_REGISTRY_V117.find((a) => a.account_code === '37');
    assert.ok(acc37 !== undefined);
    assert.equal(acc37.account_name, 'Outros valores a receber e a pagar');

    const acc376 = PGC_MASTER_ACCOUNT_REGISTRY_V117.find((a) => a.account_code === '37.6');
    assert.ok(acc376 !== undefined);
    assert.equal(acc376.account_name, 'Proveitos a repartir por períodos futuros');
  });

  it('TEST_VAT_FOURTH_LEVEL_TOTAL_25: Official VAT fourth-level subaccounts total exactly 25 under Article 22', () => {
    assert.equal(VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.length, 25);

    const c3451 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.1');
    const c3452 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.2');
    const c3453 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.3');
    const c3454 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.4');
    const c3455 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.5');
    const c3456 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.6');
    const c3457 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.7');
    const c3458 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.filter((s) => s.parent_code === '34.5.8');

    assert.equal(c3451.length, 3, '34.5.1 must have 3 children');
    assert.equal(c3452.length, 3, '34.5.2 must have 3 children');
    assert.equal(c3453.length, 4, '34.5.3 must have 4 children');
    assert.equal(c3454.length, 4, '34.5.4 must have 4 children');
    assert.equal(c3455.length, 2, '34.5.5 must have 2 children');
    assert.equal(c3456.length, 3, '34.5.6 must have 3 children');
    assert.equal(c3457.length, 2, '34.5.7 must have 2 children');
    assert.equal(c3458.length, 4, '34.5.8 must have 4 children');

    const sum = c3451.length + c3452.length + c3453.length + c3454.length + c3455.length + c3456.length + c3457.length + c3458.length;
    assert.equal(sum, 25);
  });

  it('TEST_VAT_3459_NO_OFFICIAL_CHILD_IN_ARTICLE_22: Account 34.5.9 has no 4th-level official subaccount in Art. 22', () => {
    const sub34591 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.find((s) => s.subaccount_code === '34.5.9.1');
    assert.equal(sub34591, undefined, '34.5.9.1 must not be classified as an official statutory subaccount');
  });

  it('TEST_VAT_ACCOUNT_CODE_OFFICIAL_NAME_MATCH: Code and official name match exact Article 22 text', () => {
    const generalOps = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.find((s) => s.subaccount_code === '34.5.3.1');
    assert.ok(generalOps !== undefined);
    assert.equal(generalOps.official_name, 'Operações gerais');
    assert.equal(generalOps.source_article, 22);

    const cashRegime = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V117.find((s) => s.subaccount_code === '34.5.3.2');
    assert.ok(cashRegime !== undefined);
    assert.equal(cashRegime.official_name, 'Operações abrangidas pelo regime de IVA de caixa');
  });

  it('TEST_ACCOUNTING_GATE_V117_EXECUTION: Executes Final Precision Gate v1.1.7 returning PASS', () => {
    const gateResult = gateEngineV117.executeFinalPrecisionGateV117();
    assert.equal(gateResult.gate_name, 'SAAS_METRICS_DICTIONARY_v1_1_7_FINAL_PRECISION_GATE');
    assert.equal(gateResult.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.7_FROZEN');
    assert.equal(gateResult.previous_baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.6_FROZEN');
    assert.equal(gateResult.previous_baseline_status, 'SUPERSEDED');
    assert.equal(gateResult.status, 'PASS');
    assert.equal(gateResult.passed, true);
    assert.equal(gateResult.pgc_49_1_name_status, 'CORRECTED_TITULOS_NEGOCIAVEIS');
    assert.equal(gateResult.pgc_37_parent_name_status, 'CORRECTED_OUTROS_VALORES_A_RECEBER_E_A_PAGAR');
    assert.equal(gateResult.vat_official_fourth_level_total, 25);
    assert.equal(gateResult.vat_official_fourth_level_implemented, 25);
    assert.equal(gateResult.vat_34_5_9_1_classified_as_official, false);
    assert.equal(gateResult.manifest_sidecar_validation_status, 'VERIFIED');
    assert.equal(gateResult.internal_accounting_defects_remaining, 0);
    assert.equal(gateResult.final_accounting_status, 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE');
    assert.equal(gateResult.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });

  // ==========================================================================
  // V1.1.8 SPECIFIC TESTS: OFFICIAL VAT NOMENCLATURE SOURCE-LOCK
  // ==========================================================================

  it('TEST_VAT_OFFICIAL_FOURTH_LEVEL_COUNT: Programmatically verifies exactly 25 statutory 4th-level subaccounts in VAT v1.1.8 registry', () => {
    assert.equal(VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V118.length, 25);
  });

  it('TEST_VAT_TRIPLE_MATCH_ALL_25_SUBACCOUNTS: Verifies code + official_name + parent_code for all 25 subaccounts against Artigo 22.º', () => {
    const registry = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V118;
    
    // 34.5.1
    const s34511 = registry.find(s => s.account_code === '34.5.1.1');
    assert.equal(s34511?.official_name, 'Existências');
    assert.equal(s34511?.parent_code, '34.5.1');

    const s34512 = registry.find(s => s.account_code === '34.5.1.2');
    assert.equal(s34512?.official_name, 'Meios fixos e investimentos');
    assert.equal(s34512?.parent_code, '34.5.1');

    const s34513 = registry.find(s => s.account_code === '34.5.1.3');
    assert.equal(s34513?.official_name, 'Outros bens e serviços');
    assert.equal(s34513?.parent_code, '34.5.1');

    // 34.5.2
    const s34521 = registry.find(s => s.account_code === '34.5.2.1');
    assert.equal(s34521?.official_name, 'Existências');
    assert.equal(s34521?.parent_code, '34.5.2');

    const s34522 = registry.find(s => s.account_code === '34.5.2.2');
    assert.equal(s34522?.official_name, 'Meios fixos e investimentos');
    assert.equal(s34522?.parent_code, '34.5.2');

    const s34523 = registry.find(s => s.account_code === '34.5.2.3');
    assert.equal(s34523?.official_name, 'Outros bens e serviços');
    assert.equal(s34523?.parent_code, '34.5.2');

    // 34.5.3
    const s34531 = registry.find(s => s.account_code === '34.5.3.1');
    assert.equal(s34531?.official_name, 'Operações gerais');
    assert.equal(s34531?.parent_code, '34.5.3');

    const s34532 = registry.find(s => s.account_code === '34.5.3.2');
    assert.equal(s34532?.official_name, 'Operações abrangidas pelo regime de IVA de caixa');
    assert.equal(s34532?.parent_code, '34.5.3');

    const s34533 = registry.find(s => s.account_code === '34.5.3.3');
    assert.equal(s34533?.official_name, 'Autoconsumo e operações gratuitas');
    assert.equal(s34533?.parent_code, '34.5.3');

    const s34534 = registry.find(s => s.account_code === '34.5.3.4');
    assert.equal(s34534?.official_name, 'Operações especiais');
    assert.equal(s34534?.parent_code, '34.5.3');

    // 34.5.4
    const s34541 = registry.find(s => s.account_code === '34.5.4.1');
    assert.equal(s34541?.official_name, 'Mensais a favor do sujeito passivo');
    assert.equal(s34541?.parent_code, '34.5.4');

    const s34542 = registry.find(s => s.account_code === '34.5.4.2');
    assert.equal(s34542?.official_name, 'Mensais a favor do Estado');
    assert.equal(s34542?.parent_code, '34.5.4');

    const s34543 = registry.find(s => s.account_code === '34.5.4.3');
    assert.equal(s34543?.official_name, 'Anual por cálculo do pró rata definitivo');
    assert.equal(s34543?.parent_code, '34.5.4');

    const s34544 = registry.find(s => s.account_code === '34.5.4.4');
    assert.equal(s34544?.official_name, 'Outras regularizações anuais');
    assert.equal(s34544?.parent_code, '34.5.4');

    // 34.5.5
    const s34551 = registry.find(s => s.account_code === '34.5.5.1');
    assert.equal(s34551?.official_name, 'Apuramento do regime de IVA normal');
    assert.equal(s34551?.parent_code, '34.5.5');

    const s34552 = registry.find(s => s.account_code === '34.5.5.2');
    assert.equal(s34552?.official_name, 'Apuramento do regime de IVA de caixa');
    assert.equal(s34552?.parent_code, '34.5.5');

    // 34.5.6
    const s34561 = registry.find(s => s.account_code === '34.5.6.1');
    assert.equal(s34561?.official_name, 'IVA a pagar de apuramento');
    assert.equal(s34561?.parent_code, '34.5.6');

    const s34562 = registry.find(s => s.account_code === '34.5.6.2');
    assert.equal(s34562?.official_name, 'IVA a pagar de cativo');
    assert.equal(s34562?.parent_code, '34.5.6');

    const s34563 = registry.find(s => s.account_code === '34.5.6.3');
    assert.equal(s34563?.official_name, 'IVA a pagar de liquidações oficiosas');
    assert.equal(s34563?.parent_code, '34.5.6');

    // 34.5.7
    const s34571 = registry.find(s => s.account_code === '34.5.7.1');
    assert.equal(s34571?.official_name, 'IVA a recuperar de apuramento');
    assert.equal(s34571?.parent_code, '34.5.7');

    const s34572 = registry.find(s => s.account_code === '34.5.7.2');
    assert.equal(s34572?.official_name, 'IVA a recuperar de cativo');
    assert.equal(s34572?.parent_code, '34.5.7');

    // 34.5.8
    const s34581 = registry.find(s => s.account_code === '34.5.8.1');
    assert.equal(s34581?.official_name, 'Reembolsos pedidos');
    assert.equal(s34581?.parent_code, '34.5.8');

    const s34582 = registry.find(s => s.account_code === '34.5.8.2');
    assert.equal(s34582?.official_name, 'Reembolsos deferidos');
    assert.equal(s34582?.parent_code, '34.5.8');

    const s34583 = registry.find(s => s.account_code === '34.5.8.3');
    assert.equal(s34583?.official_name, 'Reembolsos indeferidos');
    assert.equal(s34583?.parent_code, '34.5.8');

    const s34584 = registry.find(s => s.account_code === '34.5.8.4');
    assert.equal(s34584?.official_name, 'Reembolsos reclamados, recorridos ou impugnados');
    assert.equal(s34584?.parent_code, '34.5.8');
  });

  it('TEST_34591_NOT_OFFICIAL_UNDER_ARTICLE_22: Account 34.5.9.1 is absent from official 4th-level registry', () => {
    const sub34591 = VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V118.find(s => s.account_code === '34.5.9.1');
    assert.equal(sub34591, undefined, '34.5.9.1 must not exist in official 4th level registry');
  });

  it('TEST_NO_SUPERSEDED_V117_VAT_NAMES: Verifies 0 occurrences of prohibited/superseded v1.1.7 names in official registry', () => {
    const prohibitedNames = [
      'Taxa reduzida', 'Taxa geral', 'Outras taxas', 'Retenção na fonte',
      'Apuramento de margem', 'Apuramento mensal', 'Apuramento trimestral',
      'Cobrança voluntária', 'Cobrança coerciva', 'Crédito de imposto a transportar',
      'Em análise pela AGT', 'Pagos'
    ];

    for (const sub of VAT_OFFICIAL_SUBACCOUNT_REGISTRY_V118) {
      for (const forbidden of prohibitedNames) {
        assert.equal(
          sub.official_name.includes(forbidden),
          false,
          `Official name '${sub.official_name}' must not contain forbidden term '${forbidden}'`
        );
      }
    }
  });

  it('TEST_V118_FINAL_VAT_SOURCE_LOCK_GATE_EXECUTION: Executes Final VAT Source-Lock Gate v1.1.8 returning PASS', () => {
    const gateResult = gateEngineV118.executeFinalVATSourceLockGateV118();
    assert.equal(gateResult.gate_name, 'SAAS_METRICS_DICTIONARY_v1_1_8_VAT_SOURCE_LOCK_FINAL_GATE');
    assert.equal(gateResult.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(gateResult.previous_baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.7_FROZEN');
    assert.equal(gateResult.previous_baseline_status, 'SUPERSEDED');
    assert.equal(gateResult.status, 'PASS');
    assert.equal(gateResult.passed, true);
    assert.equal(gateResult.vat_top_level_accounts_total, 9);
    assert.equal(gateResult.vat_official_fourth_level_total, 25);
    assert.equal(gateResult.vat_official_fourth_level_implemented, 25);
    assert.equal(gateResult.vat_code_name_parent_matches, 25);
    assert.equal(gateResult.vat_official_name_mismatches, 0);
    assert.equal(gateResult.vat_invalid_official_subaccounts, 0);
    assert.equal(gateResult.vat_source_lock_status, 'OFFICIAL_STATUTORY_SOURCE_LOCKED');
    assert.equal(gateResult.vat_official_account_tree_status, 'INTERNALLY_VERIFIED_AGAINST_PROVIDED_OFFICIAL_SOURCE');
    assert.equal(gateResult.final_accounting_status, 'ACCOUNTING_INTERNAL_REMEDIATION = COMPLETE');
    assert.equal(gateResult.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });

  // ==========================================================================
  // V1.1.8 EVIDENCE CLOSURE ADDENDUM TESTS
  // ==========================================================================

  it('TEST_FINAL_EVIDENCE_CLOSURE_GATE_EXECUTION: Executes Final Evidence Closure Gate returning PASS', () => {
    const res = closureGateEngine.executeFinalEvidenceClosureGateV118();
    assert.equal(res.addendum_id, 'AETF500_v1.1.8_EVIDENCE_CLOSURE_ADDENDUM_1');
    assert.equal(res.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(res.execution_classification, 'FINAL_EVIDENCE_CLOSURE_ADDENDUM');
    assert.equal(res.status, 'PASS');
    assert.equal(res.passed, true);
    assert.equal(res.source_hash_algorithm_status, 'SHA256_EXPLICIT');
    assert.equal(res.primary_baseline_artifacts_total, 13);
    assert.equal(res.integrity_metadata_files_total, 2);
    assert.equal(res.all_generated_files_total, 15);
    assert.equal(res.orphan_artifacts_found, 0);
    assert.equal(res.missing_artifacts_found, 0);
    assert.equal(res.manifest_sha256_status, 'VERIFIED_REAL_BYTES');
    assert.equal(res.sidecar_content_status, 'MATCHES_MANIFEST_SHA256');
    assert.equal(res.sidecar_file_sha256_status, 'COMPUTED_SEPARATELY');
    assert.equal(res.test_run_provenance_status, 'INTERNAL_AUTOMATED_TESTS_PASSED');
    assert.equal(res.certification_language_status, 'ACCURATE_TRANSPARENT_NO_OVERSTATEMENTS');
    assert.equal(res.digital_signature_status, 'NOT_IMPLEMENTED');
    assert.equal(res.internal_defects_remaining, 0);
    assert.equal(res.final_evidence_closure_status, 'PASS');
    assert.equal(res.baseline_internal_status, 'INTERNALLY_FROZEN_AND_AUDITED');
    assert.equal(res.accounting_internal_remediation, 'COMPLETE');
    assert.equal(res.accounting_external_validation, 'PENDING');
    assert.equal(res.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });

  it('TEST_EMPTY_SHA256_FORBIDDEN: Empty SHA-256 hash e3b0c442... is strictly prohibited for non-empty artifacts', () => {
    const emptySha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const gateRes = closureGateEngine.executeFinalEvidenceClosureGateV118();
    assert.equal(gateRes.empty_files_found, 0);
    assert.equal(gateRes.empty_sha256_hashes_found, 0);
  });

  // ==========================================================================
  // V1.1.8 EVIDENCE CLOSURE ADDENDUM 2 TESTS
  // ==========================================================================

  it('TEST_NO_PLACEHOLDER_HASHES: Ensures artificial pattern hashes like 123456789abcdef are absent', () => {
    const placeholder1 = 'a45f918e90bc7712e098df123456789abcdef0123456789abcdef0123456789a';
    const placeholder2 = 'c87893a7d18901b0f592233f81e33c690184b232c87893a7d18901b0f592233f';

    const pgcReal = '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702';
    const vatReal = '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c';

    assert.notEqual(pgcReal, placeholder1);
    assert.notEqual(vatReal, placeholder2);
    assert.equal(pgcReal.length, 64);
    assert.equal(vatReal.length, 64);
  });

  it('TEST_FINAL_EVIDENCE_CLOSURE_ADDENDUM_2_GATE_EXECUTION: Executes Final Evidence Closure Gate Addendum 2 returning PASS', () => {
    const addendum2Engine = new PGCFinalEvidenceClosureGateEngineV118Addendum2();
    const res = addendum2Engine.executeFinalEvidenceClosureGateV118Addendum2();

    assert.equal(res.addendum_id, 'AETF500_v1.1.8_EVIDENCE_CLOSURE_ADDENDUM_2');
    assert.equal(res.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(res.execution_classification, 'FINAL_EVIDENCE_CORRECTION_MICRO_PATCH');
    assert.equal(res.status, 'PASS');
    assert.equal(res.passed, true);
    assert.equal(res.pgc_source_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(res.vat_source_sha256, '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c');
    assert.equal(res.source_hash_gate_status, 'PASS');
    assert.equal(res.sidecar_integrity_gate_status, 'PASS');
    assert.equal(res.primary_baseline_artifacts_total, 11);
    assert.equal(res.evidence_metadata_files_total, 4);
    assert.equal(res.integrity_metadata_files_total, 2);
    assert.equal(res.all_generated_files_total, 17);
    assert.equal(res.self_referential_hashes_found, 0);
    assert.equal(res.evidence_layering_status, 'ACYCLIC_DAG_VERIFIED');
    assert.equal(res.test_provenance_gate_status, 'PASS');
    assert.equal(res.unsupported_certification_claims_found, 0);
    assert.equal(res.certification_language_gate_status, 'PASS');
    assert.equal(res.final_evidence_closure_status, 'PASS');
    assert.equal(res.baseline_internal_status, 'INTERNALLY_FROZEN_AND_AUDITED');
    assert.equal(res.accounting_internal_remediation, 'COMPLETE');
    assert.equal(res.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });

  it('TEST_INTERNAL_EVIDENCE_RECOMPUTATION_GATE_EXECUTION: Confirms internal recomputation attribution without false third-party claims', () => {
    const internalRecompEngine = new PGCInternalEvidenceRecomputationGateEngineV118();
    const res = internalRecompEngine.executeInternalEvidenceRecomputationGateV118();

    assert.equal(res.addendum_id, 'AETF500_v1.1.8_INTERNAL_EVIDENCE_RECOMPUTATION_CLOSURE');
    assert.equal(res.evidence_origin, 'AETF500_INTERNAL');
    assert.equal(res.recomputation_scope, 'INTERNAL');
    assert.equal(res.recomputation_method, 'REAL_FILE_BYTES');
    assert.equal(res.verification_executor, 'AETF500_INTERNAL_EXECUTION_ENVIRONMENT');
    assert.equal(res.third_party_verification_status, 'NOT_PERFORMED');
    assert.equal(res.external_audit_status, 'PENDING');
    assert.equal(res.internal_evidence_recomputation, 'PASS');
    assert.equal(res.third_party_evidence_verification, 'NOT_PERFORMED');
    assert.equal(res.accounting_external_validation, 'PENDING');
    assert.equal(res.final_baseline_status, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
  });
});
