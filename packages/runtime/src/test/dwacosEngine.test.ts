import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DWACOSEngine } from '../dwacos/DWACOSEngine.js';

describe('DWACOS v1.0 Engine — Digital Workforce Area Commerce & Operations System', () => {
  const engine = DWACOSEngine.getInstance();
  const orgId = 'org-test-dwacos';

  it('1. Deve carregar os Area Solution Packs e Commercial Outcomes registados', () => {
    const packs = engine.getSolutionPacks();
    assert.ok(packs.length > 0);
    const finPacks = engine.getSolutionPacks('A03');
    assert.ok(finPacks.length > 0);

    const outcomes = engine.getCommercialOutcomes();
    assert.ok(outcomes.length > 0);
  });

  it('2. Deve resolver uma necessidade de negócio na porta de entrada "Por Problema"', () => {
    const resolution = engine.resolveBusinessProblem('Tenho um problema de falta de liquidez no banco e fluxo de caixa');
    assert.strictEqual(resolution.resolved_area?.code, 'A03');
    assert.strictEqual(resolution.detected_category, 'TESOURARIA_E_CAIXA');
    assert.ok(resolution.matched_solution_packs.length > 0);
  });

  it('3. Deve realizar a avaliação de prontidão de Área (Area Readiness Assessment) em 10 dimensões', () => {
    const readiness = engine.runAreaReadinessAssessment(orgId, 'A08');
    assert.ok(readiness);
    assert.strictEqual(readiness.commercial_area_code, 'A08');
    assert.ok(readiness.checks.length > 0);
  });

  it('4. Deve executar o assistente guiado de ativação (Area Activation Wizard)', () => {
    const result = engine.executeAreaActivationWizard(orgId, 'A03', 'pack-fin-treasury', {
      supervisorEmail: 'cfo@empresa.ao'
    });
    assert.strictEqual(result.wizard_status, 'COMPLETED');
    assert.ok(result.activated_rolepack_ids.length > 0);
  });

  it('5. Deve obter o grafo de dependências não-forçadas entre áreas (Area Dependency Graph)', () => {
    const edges = engine.getAreaDependencyGraph('A08');
    assert.ok(edges.length > 0);
    const mktSalesEdge = edges.find(e => e.source_area_code === 'A08' && e.target_area_code === 'A07');
    assert.ok(mktSalesEdge);
    assert.strictEqual(mktSalesEdge.is_mandatory, false);
  });

  it('6. Deve encaminhar tarefas via Area Manager Digital sem violar permissões', () => {
    const routing = engine.routeTaskViaAreaManager(orgId, 'A03', 'Executar conciliação da conta 43 do BAI');
    assert.strictEqual(routing.area_code, 'A03');
    assert.ok(routing.assigned_employee_id > 0);
    assert.strictEqual(routing.governance_status, 'PERMISSIONS_VERIFIED');
  });

  it('7. Deve gerar o snapshot de saúde da Área (Area Health Dashboard)', () => {
    const health = engine.getAreaHealthSnapshot(orgId, 'A03');
    assert.strictEqual(health.commercial_area_code, 'A03');
    assert.strictEqual(health.health_state, 'HEALTHY');
    assert.strictEqual(health.umer_rate, 98.5);
  });

  it('8. Deve registar eventos de valor em KWZ no Area Value Ledger sem contagem dupla', () => {
    const valEvent = engine.recordAreaValueEvent(orgId, 'A03', {
      rolepack_id: 41,
      value_type: 'cash_recovered',
      amount_kwz: 1500000,
      hours_saved: 24,
      description: 'Recuperação de pagamentos duplicados na reconciliação bancária'
    });

    assert.ok(valEvent.event_id);
    assert.strictEqual(valEvent.amount_kwz, 1500000);
    assert.strictEqual(valEvent.commercial_area_code, 'A03');

    const health = engine.getAreaHealthSnapshot(orgId, 'A03');
    assert.strictEqual(health.measured_value_kwz, 1500000);
  });
});
