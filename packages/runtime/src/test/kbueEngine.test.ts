import test from 'node:test';
import assert from 'node:assert/strict';
import { KBUEEngine } from '../kbue/KBUEEngine.js';

test('KBUE-500 v1.0 — Knowledge Baseline Update Engine 2026.09.11 Test Suite', async (t) => {
  const engine = KBUEEngine.getInstance();

  await t.test('1. 500/500 Knowledge Baseline Seeding — verifies all 500 rolepacks have 2026.09.11 inventories', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_employees, 500, 'Must have baseline inventories for all 500 employees');
    assert.equal(summary.baseline_version, '2026.09.11', 'Baseline version must be 2026.09.11');
    assert.equal(summary.cutoff_date, '2026-09-11', 'Cutoff date must be 2026-09-11');
  });

  await t.test('2. Primary Source Hierarchy — verifies Level 1 Primary official sources for CEO Assistant #001', () => {
    const inv = engine.getInventory('001');
    assert.ok(inv, 'CEO Assistant inventory must exist');
    assert.equal(inv.knowledge_baseline_version, '2026.09.11', 'Must be version 2026.09.11');

    const primarySource = inv.knowledge_sources.find(s => s.level === 'LEVEL_1_PRIMARY');
    assert.ok(primarySource, 'Must contain Level 1 Primary official source');
    assert.equal(primarySource.verification_status, 'VERIFIED', 'Level 1 source must be VERIFIED');
  });

  await t.test('3. Knowledge Diff Registration & Taxonomy — registers change and updates state', () => {
    const inv = engine.registerDiff('001', {
      domain: 'Strategy',
      subdomain: 'Planos de Negócio 2026',
      old_knowledge: 'Modelos de análise de mercado 2025',
      current_evidence_at_2026_09_11: 'Novas métricas de viabilidade económica OGE 2026',
      difference: 'Atualização das taxas de juro de referência BNA',
      category: 'TAX',
      impact: 'HIGH',
      action_required: 'Atualizar fórmulas de cálculo financeiro',
      source_id: 'src_agt_ao_001',
      verified: true
    });

    assert.equal(inv.state, 'CHANGE_DETECTED', 'State must transition to CHANGE_DETECTED');
    assert.ok(inv.diffs.length >= 2, 'Diffs list must contain registered change');
  });

  await t.test('4. Critical Gap Locking & Freshness Engine — blocks employee on unverified CRITICAL diff', () => {
    const inv = engine.registerDiff('027', {
      domain: 'Marketing',
      subdomain: 'Conformidade de Redes Sociais 2026',
      old_knowledge: 'Políticas de anúncios 2025',
      current_evidence_at_2026_09_11: 'Nova regulamentação de comunicação digital em Angola 2026',
      difference: 'Requisito de consentimento prévio não verificado',
      category: 'LEGAL',
      impact: 'CRITICAL',
      action_required: 'Obter parecer jurídico formal sobre a norma',
      source_id: 'src_dr_ao_027',
      verified: false
    });

    assert.equal(inv.critical_gap_locked, true, 'Critical gap lock must be active');
    assert.equal(inv.state, 'BLOCKED', 'State must be set to BLOCKED');

    const freshness = engine.calculateFreshness('027');
    assert.equal(freshness.critical_gap_locked, true, 'Freshness metrics must report critical gap lock');
    assert.ok(freshness.critical_gaps >= 1, 'Must report at least 1 critical gap');
  });

  await t.test('5. State Machine Transition Protection — blocks READY_FOR_TEST transition when locked', () => {
    assert.throws(
      () => {
        engine.transitionState('027', 'READY_FOR_TEST');
      },
      /Transição para READY_FOR_TEST bloqueada/,
      'Must throw when attempting READY_FOR_TEST on a critical-gap-locked employee'
    );
  });

  await t.test('6. Evidence Package Generation — generates SHA256 package for baseline audit', () => {
    const pkg = engine.generateEvidencePackage('001');
    assert.ok(pkg.package_hash, 'Must contain SHA256 package hash');
    assert.equal(pkg.package_hash.length, 64, 'SHA256 hash must be 64 hexadecimal characters');
    assert.equal(pkg.baseline_version, '2026.09.11', 'Baseline version must be 2026.09.11');
    assert.ok(pkg.package_path.includes('/knowledge-baseline/2026-09-11/001/'), 'Package path must follow spec structure');
  });

  await t.test('7. Global Baseline Summary — evaluates metrics across 500 AI Employees', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_employees, 500, 'Total employees must be 500');
    assert.ok(summary.average_freshness_score > 0, 'Average freshness score must be calculated');
    assert.ok(summary.ready_for_test_count > 0, 'Must have employees ready for test');
  });
});
