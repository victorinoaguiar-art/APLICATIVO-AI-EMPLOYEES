import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FirstPaidCustomerValidationEngine } from '../commerce/FirstPaidCustomerValidationEngine.js';

describe('FirstPaidCustomerValidationEngine - First Paid Customer Controlled Onboarding & Real Revenue Test Suite', () => {
  const engine = FirstPaidCustomerValidationEngine.getInstance();

  it('1. deve gerir as Ondas de Lançamento (Cohort Waves) e manter a Onda 1 ativa com limite de 1 cliente pagante', () => {
    const waves = engine.getCohortWaves();
    assert.equal(waves.length, 7);

    const activeWave = engine.getCurrentWave();
    assert.equal(activeWave.wave_id, 'WAVE_1_SINGLE_CUSTOMER');
    assert.equal(activeWave.max_customers, 1);
    assert.equal(activeWave.max_allowed_incidents, 0);
  });

  it('2. deve avaliar os 23 Portões de Prontidão para Produção (23 Readiness Gates)', () => {
    const gatesEval = engine.evaluate23ReadinessGates('CUST-PILOT-001', {
      identity_verification: true,
      commercial_contract: true,
      customer_data: true,
      payment_method: true,
      first_payment: true,
      tenant_creation: true,
      employee_assignment: true,
      employee_version: true,
      permissions: true,
      knowledge_provisioning: true,
      internal_policies: true,
      integrations: true,
      security_controls: true,
      audit_logging: true,
      data_protection: true,
      backup_recovery: true,
      human_supervisor: true,
      escalation_rules: true,
      support_channel: true,
      usage_metering: true,
      billing_metering: true,
      rollback_plan: true,
      emergency_stop: true,
    });

    assert.equal(gatesEval.all_passed, true);
    assert.equal(gatesEval.missing_gates.length, 0);
  });

  it('3. deve configurar o Wizard de Primeiro Dia de Trabalho (First Day at Work)', () => {
    const wizard = engine.configureFirstDayAtWork('CUST-PILOT-001', 'INSTANCE-EMP-001-01', {
      mission_statement: 'Processar e conciliar declarações fiscais de IRT/IVA com 100% de precisão.',
      department: 'Tax',
      role_title: 'Especialista de Fiscalidade Digital',
      key_objectives: ['Reduzir erros de submissão', 'Automatizar apuramento de impostos'],
      forbidden_activities: ['Alterar taxas legais sem aprovação', 'Efetuar pagamentos bancários diretos'],
      human_supervisor_id: 'SUP-MINFIN-001',
      authorized_tools: ['PdfRenderer', 'PostgreSQL', 'EmailConnector'],
      permissions: ['READ_TAX_DATA', 'PREPARE_DECLARATION'],
      internal_systems: ['ERP_PRIMAVERA', 'AGT_PORTAL'],
      knowledge_pack_ids: ['KP-TAX-AO-2026'],
      autonomy_limit_aoa: 500000,
      risk_level: 'MEDIUM',
      first_task_prompt: 'Executar verificação prévia de conformidade fiscal do mês de Agosto 2026.',
    });

    assert.equal(wizard.organization_id, 'ORG-CUST-PILOT-001');
    assert.equal(wizard.risk_level, 'MEDIUM');
    assert.equal(wizard.forbidden_activities.length, 2);
  });

  it('4. deve aplicar o controlo de risco e bloquear a execução autónoma de tarefas de risco CRÍTICO', () => {
    assert.throws(() => {
      engine.executeFirstTask(
        'CUST-PILOT-001',
        'TENANT-001',
        'EMP-001',
        'INSTANCE-EMP-001-01',
        'Liquidação financeira imediata de 50.000.000 AOA',
        'CRITICAL',
      );
    }, /Execução autónoma proibida para tarefas de risco CRÍTICO/);
  });

  it('5. deve executar a Primeira Tarefa Real com sucesso em modo controlado', () => {
    const task = engine.executeFirstTask(
      'CUST-PILOT-001',
      'TENANT-001',
      'EMP-001',
      'INSTANCE-EMP-001-01',
      'Verificação prévia de conformidade fiscal',
      'LOW',
    );

    assert.ok(task.task_id.startsWith('FIRST-TASK-'));
    assert.equal(task.status, 'FIRST_TASK_COMPLETED');
    assert.equal(task.supervisor_approval_status, 'APPROVED');
    assert.ok(task.output_result.length > 0);
  });

  it('6. deve validar o Primeiro Valor (First Value Validation) e calcular a métrica FTV (First Time To Value)', () => {
    const tasks = engine.getFirstTasks();
    assert.ok(tasks.length > 0);

    const paymentTime = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago
    const val = engine.validateFirstValue(tasks[0].task_id, paymentTime, 4.9);

    assert.equal(val.value_validated, true);
    assert.equal(val.first_task.status, 'FIRST_TASK_ACCEPTED');
    assert.ok(val.ftv_metrics.ftv_hours >= 0);
    assert.equal(val.ftv_metrics.estimated_roi_pct, 340);
  });

  it('7. deve auditar a Receita Real e Margem de Contribuição (Contribution Margin)', () => {
    const rev = engine.validateRealRevenue(
      'CUST-PILOT-001',
      'EMP-001',
      'INSTANCE-EMP-001-01',
      'PROFESSIONAL',
      180000,
      true, // Real Paid Customer
    );

    assert.equal(rev.status, 'REAL_REVENUE_VALIDATED');
    assert.equal(rev.amount_received, 180000);
    assert.equal(rev.total_variable_cost, 17800); // 8200 + 3400 + 1200 + 5000
    assert.equal(rev.contribution_margin, 162200); // 180000 - 17800
    assert.equal(rev.reconciliation_status, 'RECONCILED');
  });

  it('8. deve avaliar a Saúde do Cliente (Customer Health Score)', () => {
    const health = engine.evaluateCustomerHealth('CUST-PILOT-001');
    assert.equal(health.status, 'HEALTHY');
    assert.equal(health.health_score, 95);
    assert.equal(health.renewal_risk, 'LOW');
  });

  it('9. deve validar o Scorecard de Validação do Cliente Pagante Real', () => {
    const scorecard = engine.getValidationScorecard('CUST-PILOT-001');
    assert.ok(scorecard);
    assert.equal(scorecard?.all_passed, true);
    assert.equal(scorecard?.overall_status, 'REAL_REVENUE_VALIDATED');
  });
});
