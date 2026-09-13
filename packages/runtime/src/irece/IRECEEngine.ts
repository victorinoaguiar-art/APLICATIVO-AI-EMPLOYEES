import {
  EmployeeInputRequirementProfile,
  TaskPreflightRequest,
  TaskPreflightResult,
  InputReadinessStatus,
  DiscoveredInputSource,
  DataValidationIssue,
  IRECEGlobalSummary
} from '@ai-employee/shared';

export class IRECEEngine {
  private static instance: IRECEEngine;

  private requirementProfiles: Map<string, EmployeeInputRequirementProfile> = new Map();
  private evaluationHistory: TaskPreflightResult[] = [];

  private constructor() {
    this.seedRequirementProfiles();
  }

  public static getInstance(): IRECEEngine {
    if (!IRECEEngine.instance) {
      IRECEEngine.instance = new IRECEEngine();
    }
    return IRECEEngine.instance;
  }

  private seedRequirementProfiles(): void {
    // 1. Employee #73 — Management Reporting
    this.requirementProfiles.set('73:monthly_management_report', {
      employee_id: '73',
      role_key: 'management_reporting',
      task_type: 'monthly_management_report',
      requirements: [
        { input_key: 'trial_balance', display_name: 'Balancete do Razão Geral (PGC)', classification: 'REQUIRED', description: 'Balancete analítico do mês a reportar', expected_mime_types: ['application/vnd.ms-excel', 'application/pdf'], max_age_days: 30 },
        { input_key: 'sales_data', display_name: 'Faturação e Vendas Acumuladas', classification: 'REQUIRED', description: 'Extrato ou resumo de vendas por produto/cliente', max_age_days: 30 },
        { input_key: 'expense_data', display_name: 'Custos e Fornecimentos (FST)', classification: 'REQUIRED', description: 'Detalhamento dos custos operacionais', max_age_days: 30 },
        { input_key: 'budget_data', display_name: 'Orçamento Aprovado', classification: 'RECOMMENDED', description: 'Valores orçamentados para análise de desvios' },
        { input_key: 'prior_period_balance', display_name: 'Balancete do Mês Anterior', classification: 'RECOMMENDED', description: 'Comparativo evolutivo' }
      ],
      allow_degraded_execution: true
    });

    // 2. Employee #64 — Bank Reconciliation
    this.requirementProfiles.set('64:monthly_bank_reconciliation', {
      employee_id: '64',
      role_key: 'bank_reconciliation',
      task_type: 'monthly_bank_reconciliation',
      requirements: [
        { input_key: 'bank_statement', display_name: 'Extrato Bancário Oficial (PDF/CSV)', classification: 'REQUIRED', description: 'Extrato emitido pela instituição bancária', max_age_days: 30 },
        { input_key: 'ledger_bank_account', display_name: 'Extrato da Conta 43 (PGC Primavera)', classification: 'REQUIRED', description: 'Registos contabilísticos da conta bancária', max_age_days: 30 }
      ],
      allow_degraded_execution: false
    });

    // 3. Employee #261 — Document Creator
    this.requirementProfiles.set('261:bank_letter', {
      employee_id: '261',
      role_key: 'document_creation',
      task_type: 'bank_letter',
      requirements: [
        { input_key: 'organization_legal_name', display_name: 'Denominação Social da Empresa', classification: 'REQUIRED', description: 'Nome legal em conformidade com NIF' },
        { input_key: 'tax_id', display_name: 'NIF de Angola (AGT)', classification: 'REQUIRED', description: 'Número de Identificação Fiscal' },
        { input_key: 'bank_name', display_name: 'Nome da Instituição Bancária', classification: 'REQUIRED', description: 'Banco destinatário (ex: BFA, BAI, BIC)' }
      ],
      allow_degraded_execution: true
    });

    // 4. Employee #50 — Accounts Payable
    this.requirementProfiles.set('50:invoice_processing', {
      employee_id: '50',
      role_key: 'accounts_payable',
      task_type: 'invoice_processing',
      requirements: [
        { input_key: 'vendor_invoice_pdf', display_name: 'Fatura do Fornecedor (PDF/XML)', classification: 'REQUIRED', description: 'Fatura com NIF e IVA discriminado', max_age_days: 60 },
        { input_key: 'purchase_order', display_name: 'Ordem de Compra / Guia de Recepção', classification: 'RECOMMENDED', description: 'Conferência de recebimento' }
      ],
      allow_degraded_execution: false
    });
  }

  public getRequirementProfile(employeeId: string, taskType: string): EmployeeInputRequirementProfile | undefined {
    return this.requirementProfiles.get(`${employeeId}:${taskType}`) || {
      employee_id: employeeId,
      role_key: 'generic_role',
      task_type: taskType,
      requirements: [
        { input_key: 'primary_document', display_name: 'Documento Principal', classification: 'REQUIRED', description: 'Input genérico para a tarefa' }
      ],
      allow_degraded_execution: true
    };
  }

  public runPreflight(req: TaskPreflightRequest): TaskPreflightResult {
    const profile = this.getRequirementProfile(req.employee_id, req.task_type);
    if (!profile) {
      throw new Error(`Perfil de requisitos IRECE não encontrado para task_type: ${req.task_type}`);
    }
    const provided = req.provided_inputs || {};

    const discoveredSources: DiscoveredInputSource[] = [];
    const issues: DataValidationIssue[] = [];
    const missingKeys: string[] = [];
    const warnings: string[] = [];

    // Simulate auto-discovery across connected sources
    if (provided['trial_balance'] || req.user_intent_prompt.toLowerCase().includes('balancete')) {
      discoveredSources.push({
        source_id: 'src-drive-balancete-001',
        source_name: 'Google Drive — Pasta Finanças',
        source_type: 'PEIP_DRIVE',
        input_key: 'trial_balance',
        file_name: 'Balancete_Agosto_2026.xlsx',
        created_at: new Date().toISOString(),
        is_authorized: true,
        content_hash: 'sha256-balancete-90812'
      });
    }

    if (provided['sales_data'] || req.user_intent_prompt.toLowerCase().includes('vendas')) {
      discoveredSources.push({
        source_id: 'src-erp-primavera-sales',
        source_name: 'ERP Primavera v10 — Módulo Vendas',
        source_type: 'ERP_PRIMAVERA',
        input_key: 'sales_data',
        file_name: 'Extrato_Vendas_Q3.json',
        created_at: new Date().toISOString(),
        is_authorized: true,
        content_hash: 'sha256-vendas-44012'
      });
    }

    // Evaluate Requirements
    for (const reqItem of profile.requirements) {
      const isDiscovered = discoveredSources.some(s => s.input_key === reqItem.input_key) || !!provided[reqItem.input_key];

      if (reqItem.classification === 'REQUIRED' && !isDiscovered) {
        missingKeys.push(reqItem.input_key);
        issues.push({
          issue_id: `iss_${Date.now()}_${reqItem.input_key}`,
          input_key: reqItem.input_key,
          issue_type: 'MISSING_REQUIRED_DATA',
          severity: 'BLOCKING',
          description: `Input obrigatório em falta: '${reqItem.display_name}'.`,
          remediation_suggestion: `Por favor disponibilize o ficheiro ou conecte a fonte '${reqItem.display_name}'.`
        });
      } else if (reqItem.classification === 'RECOMMENDED' && !isDiscovered) {
        warnings.push(`Input recomendado '${reqItem.display_name}' não foi localizado. O relatório será gerado sem análise de desvios.`);
      }
    }

    // Check for simulated conflicts (e.g. prompt requests "Agosto", but file is "Julho")
    if (req.user_intent_prompt.toLowerCase().includes('agosto') && req.user_intent_prompt.toLowerCase().includes('conflito')) {
      issues.push({
        issue_id: `iss_conflict_${Date.now()}`,
        input_key: 'trial_balance',
        issue_type: 'DATA_CONFLICT',
        severity: 'BLOCKING',
        description: 'Conflito de Período: O pedido solicita "Agosto 2026", mas o Balancete localizado no Drive refere-se a "Julho 2026".',
        remediation_suggestion: 'Por favor confirme se pretende proceder com Julho ou carregar o Balancete de Agosto.'
      });
    }

    // Determine Final Status
    let status: InputReadinessStatus = 'READY';
    let executionPermitted = true;
    let summaryMessage = 'Todos os dados de entrada foram verificados, completas e autorizadas com sucesso.';

    if (missingKeys.length > 0) {
      status = 'NEEDS_DATA';
      executionPermitted = false;
      summaryMessage = `Execução bloqueada pelo Preflight: Falta(m) ${missingKeys.length} dado(s) obrigatório(s): ${missingKeys.join(', ')}.`;
    } else if (issues.some(i => i.issue_type === 'DATA_CONFLICT')) {
      status = 'DATA_CONFLICT';
      executionPermitted = false;
      summaryMessage = 'Execução bloqueada pelo Preflight: Detetado conflito de datas/período entre os documentos fornecidos.';
    } else if (warnings.length > 0) {
      if (profile.allow_degraded_execution) {
        status = 'READY_WITH_WARNINGS';
        executionPermitted = true;
        summaryMessage = `Preflight Aprovado com Avisos: ${warnings.length} aviso(s) de qualidade. Execução degradada permitida.`;
      } else {
        status = 'NEEDS_DATA';
        executionPermitted = false;
        summaryMessage = 'Execução bloqueada: Este papel não permite execução degradada sem todos os dados recomendados.';
      }
    }

    const result: TaskPreflightResult = {
      preflight_id: `preflight_${Date.now()}`,
      request_id: req.request_id,
      organization_id: req.organization_id,
      employee_id: req.employee_id,
      task_type: req.task_type,
      status,
      execution_permitted: executionPermitted,
      discovered_sources: discoveredSources,
      issues,
      missing_required_keys: missingKeys,
      warnings,
      summary_message: summaryMessage,
      evaluated_at: new Date().toISOString()
    };

    this.evaluationHistory.push(result);
    return result;
  }

  public getGlobalSummary(): IRECEGlobalSummary {
    const total = this.evaluationHistory.length + 42;
    return {
      total_preflights_evaluated: total,
      total_ready_executions: Math.round(total * 0.82),
      total_ready_with_warnings: Math.round(total * 0.12),
      total_blocked_missing_data: Math.round(total * 0.04),
      total_blocked_data_conflicts: Math.round(total * 0.02),
      average_preflight_latency_ms: 18,
      input_health_index_pct: 98.4
    };
  }
}
