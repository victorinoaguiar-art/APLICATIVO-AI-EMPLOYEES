import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AIEmployeeCommerceEngine } from '../commerce/AIEmployeeCommerceEngine.js';

describe('AIEmployeeCommerceEngine - Marketplace & Commercial Operations', () => {
  const engine = new AIEmployeeCommerceEngine();

  it('deve carregar os 500 colaboradores do catálogo AETF-500 distribuídos por 18 departamentos', () => {
    const searchResult = engine.searchMarketplace();
    assert.equal(searchResult.total_catalog_items, 500);
    assert.equal(searchResult.filtered_items.length, 500);
    assert.equal(Object.keys(searchResult.department_summary).length, 18);
    assert.equal(searchResult.cert_level_summary['CERT-L3'], 500);
  });

  it('deve filtrar o catálogo por departamento e termo de pesquisa', () => {
    const accountingItems = engine.searchMarketplace({ department: 'Accounting' });
    assert.ok(accountingItems.filtered_items.length >= 27);
    assert.ok(accountingItems.filtered_items.every((i) => i.department === 'Accounting'));

    const searchItems = engine.searchMarketplace({ search: 'Tax' });
    assert.ok(searchItems.filtered_items.length > 0);
  });

  it('deve calcular o preço respeitando o Pricing Floor e aplicar desconto anual', () => {
    const priceMonthly = engine.calculatePrice('EMP-001', 'PROFESSIONAL', 'MONTHLY', 'AOA');
    assert.ok(priceMonthly.is_above_floor);
    assert.equal(priceMonthly.discount_applied_pct, 0);

    const priceAnnual = engine.calculatePrice('EMP-001', 'PROFESSIONAL', 'ANNUAL', 'AOA');
    assert.equal(priceAnnual.discount_applied_pct, 15);
    assert.ok(priceAnnual.final_monthly_price < priceMonthly.final_monthly_price);
  });

  it('deve processar a contratação (Hiring) gerando contrato legal com aviso de ausência de vínculo laboral', () => {
    const hireResult = engine.hireEmployee({
      hiring_id: 'HIRING-TEST-001',
      tenant_id: 'TENANT-BANCO-001',
      employee_template_id: 'EMP-001',
      hired_instance_name: 'Contabilista AI Principal',
      selected_plan: 'BUSINESS',
      billing_cycle: 'MONTHLY',
      currency: 'AOA',
      agreed_digital_salary: 450000,
      contract_signed_at: new Date().toISOString(),
      contract_terms_hash: '',
    });

    assert.ok(hireResult.instance.instance_id.startsWith('INSTANCE-TENANT-EMP-001'));
    assert.equal(hireResult.instance.activation_status, 'PENDING_ACTIVATION');
    assert.equal(hireResult.instance.deployment_status, 'NOT_DEPLOYED');
    assert.ok(hireResult.contract.legal_disclaimer.includes('NÃO CONSTITUI NEM CRIA QUALQUER TIPO DE VÍNCULO LABORAL HUMANO'));
    assert.ok(hireResult.contract.terms_sha256.length > 0);
  });

  it('deve respeitar a regra SUBSCRIBED != ACTIVATED e exigir passagem nos 5 portões de ativação', () => {
    const hireResult = engine.hireEmployee({
      hiring_id: 'HIRING-TEST-002',
      tenant_id: 'TENANT-EP-002',
      employee_template_id: 'EMP-010',
      hired_instance_name: 'Auditor AI Fiscal',
      selected_plan: 'ENTERPRISE',
      billing_cycle: 'ANNUAL',
      currency: 'AOA',
      agreed_digital_salary: 600000,
      contract_signed_at: new Date().toISOString(),
      contract_terms_hash: '',
    });

    const instId = hireResult.instance.instance_id;

    // Tentativa com portões incompletos
    const partialActivation = engine.activateInstance(instId, {
      tenant_onboarded: true,
      cpeaa_policy_assigned: true,
    });

    assert.equal(partialActivation.success, false);
    assert.equal(partialActivation.missing_gates.length, 3);
    assert.equal(partialActivation.instance.activation_status, 'PENDING_ACTIVATION');

    // Tentar registar uso em instância não ativa -> deve falhar
    assert.throws(() => {
      engine.recordUsage(instId, 'TAX_AUDIT', 5000, 1200, ['PostgreSQL']);
    }, /Apenas instâncias ATIVAS podem executar tarefas/);

    // Ativar os portões restantes
    const fullActivation = engine.activateInstance(instId, {
      permissions_configured: true,
      connectors_connected: true,
      financial_limits_set: true,
    });

    assert.equal(fullActivation.success, true);
    assert.equal(fullActivation.missing_gates.length, 0);
    assert.equal(fullActivation.instance.activation_status, 'ACTIVE');
    assert.equal(fullActivation.instance.deployment_status, 'HEALTHY');
  });

  it('deve registar uso e computar os custos diretos após ativação', () => {
    const inst = engine.getAllInstances().find((i) => i.activation_status === 'ACTIVE');
    assert.ok(inst);

    const usageEvt = engine.recordUsage(inst.instance_id, 'TAX_REPORT_GEN', 10000, 2500, ['SAP', 'PostgreSQL'], true);
    assert.ok(usageEvt.cost_breakdown.total_cost > 0);
    assert.equal(usageEvt.hitl_escalated, true);

    const updatedInst = engine.getInstance(inst.instance_id);
    assert.equal(updatedInst?.current_period_tasks_executed, 1);
    assert.equal(updatedInst?.current_period_hitl_escalations, 1);
  });

  it('deve calcular a métrica de Unit Economics e demonstrar ROI para o cliente', () => {
    const economics = engine.getUnitEconomics('EMP-001');
    assert.equal(economics.length, 1);
    assert.ok(economics[0].gross_margin_pct > 0);
    assert.ok(economics[0].roi_for_client_pct > 50); // Digital salary < Human Equivalent
  });

  it('deve emitir o relatório de controlo financeiro e receita (Revenue Control Plane)', () => {
    const metrics = engine.getRevenueMetrics();
    assert.ok(metrics.total_mrr_aoa > 0);
    assert.equal(metrics.real_paid_mrr_aoa, 0); // Todas as subscrições são marcadas como DEMO_TEST
    assert.ok(metrics.demo_simulated_mrr_aoa > 0);
    assert.ok(metrics.gross_margin_pct >= 50);
  });
});
