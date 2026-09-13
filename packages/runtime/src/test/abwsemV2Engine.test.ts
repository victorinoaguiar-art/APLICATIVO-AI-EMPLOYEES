import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ABWSEMV2Engine } from '../abwsem/ABWSEMV2Engine.js';

describe('ABWSEM v2.0 Engine — 48 Áreas Comerciais & Digital Workforce Layer', () => {
  const engine = ABWSEMV2Engine.getInstance();
  const orgId = 'org-test-v2';

  it('1. Deve carregar as 48 Áreas Comerciais (28 Funcionais + 20 Sectoriais) + 1 Camada de Plataforma P01', () => {
    const areas = engine.getCommercialAreasV2();
    assert.strictEqual(areas.length, 49); // 28 + 20 + 1

    const functional = areas.filter(a => a.type === 'FUNCTIONAL_AREA');
    const sectoral = areas.filter(a => a.type === 'SECTOR_AREA');
    const platform = areas.filter(a => a.type === 'PLATFORM_LAYER');

    assert.strictEqual(functional.length, 28);
    assert.strictEqual(sectoral.length, 20);
    assert.strictEqual(platform.length, 1);
  });

  it('2. Deve verificar que Marketing (A08) é uma Área autónoma independente de Vendas (A07)', () => {
    const mkt = engine.getCommercialAreaV2('A08');
    assert.ok(mkt);
    assert.strictEqual(mkt.name, 'Marketing');
    assert.strictEqual(mkt.type, 'FUNCTIONAL_AREA');

    const ait = engine.evaluateAreaIndependence('A08');
    assert.strictEqual(ait.is_standalone_valid, true);
    assert.strictEqual(ait.passed_criteria_count, 7);
  });

  it('3. Deve validar o mapeamento completo dos 500 Role Packs (490 comerciais + 10 em P01)', () => {
    const summary = engine.getGlobalSummaryV2(orgId);
    assert.strictEqual(summary.total_rolepacks_accounted, 500);
    assert.strictEqual(summary.total_commercial_home_rolepacks, 490);
    assert.strictEqual(summary.total_platform_rolepacks, 10);
  });

  it('4. Ao subscrever uma Área (ex: A03 Finanças), os Employees ficam AVAILABLE e não ACTIVE', () => {
    const sub = engine.subscribeAreaV2(orgId, 'A03', 'SINGLE_AREA');
    assert.strictEqual(sub.status, 'ACTIVE');
    assert.strictEqual(sub.commercial_area_code, 'A03');

    const entitlements = engine.getOrganizationEntitlementsV2(orgId);
    const finEntitlements = entitlements.filter(e => e.commercial_area_code === 'A03');
    assert.ok(finEntitlements.length > 0);

    // All should be AVAILABLE, none automatically ACTIVE
    const allAvailable = finEntitlements.every(e => e.employee_status === 'AVAILABLE');
    assert.strictEqual(allAvailable, true);
  });

  it('5. O Activation Gate deve bloquear activações se faltarem verificações obrigatórias', () => {
    // Try to activate rolepack #41 in A03 without subscriptions/checks
    assert.throws(() => {
      engine.activateEmployeeV2('org-unsubscribed', 'A03', 41, {
        gate_checks: { platform_certified: false }
      });
    }, /Activation Gate falhou/);
  });

  it('6. O Activation Gate deve ativar o Employee com sucesso quando todas as 7 condições forem satisfeitas', () => {
    // Subscribed orgId has entitlement to A03
    const activation = engine.activateEmployeeV2(orgId, 'A03', 41, {
      supervisor_email: 'cfo@empresa.ao',
      autonomy_level: 'HUMAN_APPROVAL_REQUIRED',
      risk_policy_code: 'RISK_POL_FINANCE_STRICT'
    });

    assert.strictEqual(activation.activation_status, 'ACTIVE');
    assert.strictEqual(activation.rolepack_id, 41);
    assert.strictEqual(activation.gate_evaluation.passed_all, true);

    const entitlements = engine.getOrganizationEntitlementsV2(orgId);
    const activeEmp = entitlements.find(e => e.rolepack_id === 41 && e.commercial_area_code === 'A03');
    assert.strictEqual(activeEmp?.employee_status, 'ACTIVE');
  });

  it('7. Deve pausar um Employee activo com sucesso', () => {
    const paused = engine.pauseEmployeeV2(orgId, 'A03', 41);
    assert.strictEqual(paused, true);

    const entitlements = engine.getOrganizationEntitlementsV2(orgId);
    const activeEmp = entitlements.find(e => e.rolepack_id === 41 && e.commercial_area_code === 'A03');
    assert.strictEqual(activeEmp?.employee_status, 'PAUSED');
  });

  it('8. Deve gerar recomendações inteligentes A -> B baseadas na necessidade do negócio', () => {
    const recs = engine.generateAreaRecommendationsV2(orgId, 'Preciso de lançar uma nova campanha de marketing nas redes sociais');
    assert.ok(recs.length > 0);
    const mktRec = recs.find(r => r.recommended_area_code === 'A08');
    assert.ok(mktRec);
    assert.strictEqual(mktRec.recommended_area_name, 'Marketing');
    assert.strictEqual(mktRec.action, 'SUBSCRIBE_COMMERCIAL_AREA');
  });
});
