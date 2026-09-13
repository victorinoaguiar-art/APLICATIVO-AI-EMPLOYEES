import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { IRECEEngine } from '../irece/IRECEEngine.js';

describe('IRECEEngine — Input Readiness & Preflight Engine Tests', () => {
  const irece = IRECEEngine.getInstance();

  it('1. Preflight READY — should approve execution when all required inputs are discovered/provided', () => {
    const preflight = irece.runPreflight({
      request_id: 'req_001',
      organization_id: 'org-empresa-demonstracao',
      employee_id: '73',
      role_key: 'management_reporting',
      task_type: 'monthly_management_report',
      user_intent_prompt: 'Quero o relatório de gestão de Agosto com o balancete e vendas.',
      provided_inputs: {
        trial_balance: 'Balancete_Agosto.xlsx',
        sales_data: 'Vendas_Agosto.json',
        expense_data: 'Custos_FST.xlsx'
      },
      requested_by: 'gerente.financeiro@empresa.co.ao'
    });

    assert.equal(preflight.execution_permitted, true);
    assert.equal(preflight.status, 'READY');
    assert.equal(preflight.missing_required_keys.length, 0);
  });

  it('2. Preflight NEEDS_DATA — should block execution when required inputs are missing', () => {
    const preflight = irece.runPreflight({
      request_id: 'req_002',
      organization_id: 'org-empresa-demonstracao',
      employee_id: '64',
      role_key: 'bank_reconciliation',
      task_type: 'monthly_bank_reconciliation',
      user_intent_prompt: 'Faça a conciliação bancária.',
      provided_inputs: {},
      requested_by: 'contabilista@empresa.co.ao'
    });

    assert.equal(preflight.execution_permitted, false);
    assert.equal(preflight.status, 'NEEDS_DATA');
    assert.ok(preflight.missing_required_keys.includes('bank_statement'));
    assert.ok(preflight.issues.some(i => i.severity === 'BLOCKING'));
  });

  it('3. Preflight DATA_CONFLICT — should detect conflicts in data/period and halt execution', () => {
    const preflight = irece.runPreflight({
      request_id: 'req_003',
      organization_id: 'org-empresa-demonstracao',
      employee_id: '73',
      role_key: 'management_reporting',
      task_type: 'monthly_management_report',
      user_intent_prompt: 'Relatório de gestão com balancete em conflito de Agosto.',
      provided_inputs: {
        trial_balance: 'Balancete.xlsx',
        sales_data: 'Vendas.json',
        expense_data: 'Custos.xlsx'
      },
      requested_by: 'auditor@empresa.co.ao'
    });

    assert.equal(preflight.execution_permitted, false);
    assert.equal(preflight.status, 'DATA_CONFLICT');
    assert.ok(preflight.issues.some(i => i.issue_type === 'DATA_CONFLICT'));
  });

  it('4. Preflight READY_WITH_WARNINGS — should allow degraded execution when only recommended inputs are missing', () => {
    const preflight = irece.runPreflight({
      request_id: 'req_004',
      organization_id: 'org-empresa-demonstracao',
      employee_id: '73',
      role_key: 'management_reporting',
      task_type: 'monthly_management_report',
      user_intent_prompt: 'Gerar relatório simples.',
      provided_inputs: {
        trial_balance: 'Balancete.xlsx',
        sales_data: 'Vendas.json',
        expense_data: 'Custos.xlsx'
      },
      requested_by: 'diretor@empresa.co.ao'
    });

    assert.equal(preflight.execution_permitted, true);
    assert.equal(preflight.status, 'READY_WITH_WARNINGS');
    assert.ok(preflight.warnings.length > 0);
  });

  it('5. Requirement Profiles — should retrieve employee profile for any task type', () => {
    const profile = irece.getRequirementProfile('261', 'bank_letter');
    assert.ok(profile);
    assert.equal(profile?.employee_id, '261');
    assert.ok(profile?.requirements.some(r => r.input_key === 'tax_id'));
  });

  it('6. Global Summary — should output unified IRECE preflight metrics', () => {
    const summary = irece.getGlobalSummary();
    assert.ok(summary.total_preflights_evaluated >= 4);
    assert.ok(summary.input_health_index_pct > 90);
  });
});
