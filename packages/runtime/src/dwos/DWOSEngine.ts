import {
  OrganizationCoverageBlueprint,
  CoverageGap,
  StaffingSimulationResult,
  SimulationMode,
  HybridResponsibilityMatrix,
  HybridResponsibilityAssignment,
  DecisionRightPolicy,
  DecisionAction,
  WorkControlPattern,
  EmployeeSubstitutionProfile,
  WorkContinuityPlan,
  ContinuityState,
  EnterpriseDataContract,
  BusinessProcessDigitalTwin,
  WorkRequest,
  PriorityLevel,
  EnterpriseWorkQueueSummary,
  DWOSAutonomyLevel,
  AutonomyProgressionRecord,
  OrganizationRiskBudget,
  CapacityPricingTier,
  InternalChargebackShare,
  EnterpriseGroupStructure,
  DWOSGlobalSummary
} from '@ai-employee/shared';

export class DWOSEngine {
  private static instance: DWOSEngine;

  private coverageBlueprints: Map<string, OrganizationCoverageBlueprint> = new Map();
  private responsibilityMatrices: Map<string, HybridResponsibilityMatrix> = new Map();
  private decisionPolicies: Map<string, DecisionRightPolicy> = new Map();
  private workControlPatterns: Map<string, WorkControlPattern> = new Map();
  private substitutionProfiles: Map<string, EmployeeSubstitutionProfile> = new Map();
  private continuityPlans: Map<string, WorkContinuityPlan> = new Map();
  private dataContracts: Map<string, EnterpriseDataContract> = new Map();
  private processTwins: Map<string, BusinessProcessDigitalTwin> = new Map();
  private workRequests: WorkRequest[] = [];
  private autonomyRecords: Map<string, AutonomyProgressionRecord> = new Map();
  private riskBudgets: Map<string, OrganizationRiskBudget> = new Map();
  private groupStructures: Map<string, EnterpriseGroupStructure> = new Map();

  constructor() {
    this.seedDefaultDWOSData();
  }

  public static getInstance(): DWOSEngine {
    if (!DWOSEngine.instance) {
      DWOSEngine.instance = new DWOSEngine();
    }
    return DWOSEngine.instance;
  }

  private seedDefaultDWOSData(): void {
    const orgId = 'org-demo';

    // 1. Seed Coverage Blueprint
    this.coverageBlueprints.set(orgId, {
      organization_id: orgId,
      total_work_units: 12500,
      covered_work_units: 8750,
      coverage_percentage: 70,
      coverage_by_department: {
        'FINANÇAS': 82,
        'CONTABILIDADE': 91,
        'FISCALIDADE': 73,
        'MARKETING': 35,
        'VENDAS': 46,
        'RH': 58,
        'OPERAÇÕES': 64
      },
      active_coverage_mode: 'AI_operated_supervised',
      human_dependency_score: 30,
      ai_dependency_score: 70,
      critical_gaps: [
        {
          gap_id: 'gap-001',
          scope_type: 'process',
          scope_id: 'proc-conciliacao-intercompany',
          description: 'Falta de conector ativo para validação automática de saldos inter-empresas',
          gap_type: 'NO_CONNECTOR',
          recommended_action: 'Ativar o conector ERP Primavera v10 no PEIP'
        },
        {
          gap_id: 'gap-002',
          scope_type: 'task',
          scope_id: 'task-aprovacao-pagamento-10m',
          description: 'Ausência de aprovador humano delegado com autoridade > 10.000.000 AOA',
          gap_type: 'NO_APPROVER',
          recommended_action: 'Atribuir perfil de Aprovador Humano ao Diretor Financeiro'
        }
      ],
      last_calculated_at: new Date().toISOString()
    });

    // 2. Seed Responsibility Matrix
    this.responsibilityMatrices.set(orgId, {
      organization_id: orgId,
      assignments: [
        {
          process_id: 'proc-controlo-tesouraria',
          process_name: 'Gestão e Projeção de Tesouraria',
          area_code: 'A03',
          risk_class: 'R2',
          ai_executor: '50', // Accounts Payable / Treasury Employee
          ai_reviewer: '49', // Accounting Reviewer
          human_approver: 'user_director_financeiro',
          cfo_accountable: 'cfo_user_01',
          human_override_authorized: true
        },
        {
          process_id: 'proc-saft-ao-iva',
          process_name: 'Submissão SAF-T (AO) & Liquidação de IVA',
          area_code: 'A02',
          risk_class: 'R1',
          ai_executor: '49',
          ai_reviewer: '48',
          human_approver: 'user_head_tax',
          cfo_accountable: 'cfo_user_01',
          human_override_authorized: true
        }
      ],
      updated_at: new Date().toISOString()
    });

    // 3. Seed Decision Policies
    this.decisionPolicies.set('50', {
      policy_id: 'policy-emp-50',
      role_key: 'accounts_payable',
      allowed_actions: ['CAN_ACCESS', 'CAN_PREPARE', 'CAN_RECOMMEND'],
      monetary_limit_aoa: 2000000,
      risk_threshold: 'R3',
      requires_human_approval: true,
      requires_segregation_of_duties: true
    });

    // 4. Seed Work Control Patterns (Maker-Checker)
    this.workControlPatterns.set('proc-pagamento-fornecedores', {
      pattern_id: 'wcp-001',
      task_type: 'proc-pagamento-fornecedores',
      control_pattern: 'MAKER_CHECKER_APPROVER',
      maker_role: '50',
      checker_role: '49',
      approver_role: 'user_director_financeiro',
      prevent_self_approval: true
    });

    // 5. Seed Substitution Profile
    this.substitutionProfiles.set('50', {
      primary_employee_id: '50',
      backup_employee_id: '51', // Hot Backup Accounts Payable
      backup_state: 'HOT_BACKUP',
      skill_match_pct: 98,
      inherits_permissions_automatically: false,
      last_certified_at: new Date().toISOString()
    });

    // 6. Seed Work Continuity Plans
    this.continuityPlans.set('PEIP_PRIMAVERA_V10', {
      plan_id: 'cont-001',
      service_component: 'PEIP_PRIMAVERA_V10',
      current_state: 'NORMAL',
      fallback_action: 'Importação segura de ficheiro Excel/CSV pré-validado',
      notify_supervisor: true,
      last_state_change: new Date().toISOString()
    });

    // 7. Seed Enterprise Data Contracts
    this.dataContracts.set('contract-saft-format', {
      data_contract_id: 'contract-saft-format',
      semantic_type: 'FINANCIAL_TAX_DOCUMENT',
      source_owner: 'ERP Primavera v10',
      system: 'PRIMAVERA_V10',
      schema_definition: {
        Header: 'Object',
        MasterFiles: 'Object',
        SourceDocuments: 'Object'
      },
      required_fields: ['Header.TaxAccountingBasis', 'SourceDocuments.SalesInvoices'],
      freshness_max_minutes: 1440,
      quality_threshold_pct: 99.5,
      contract_state: 'ACTIVE',
      updated_at: new Date().toISOString()
    });

    // 8. Seed Process Digital Twin
    this.processTwins.set('proc-controlo-tesouraria', {
      process_id: 'proc-controlo-tesouraria',
      process_name: 'Gestão e Projeção de Tesouraria 13 Semanas',
      nodes: [
        {
          node_id: 'step-01',
          process_name: 'Extração de Extratos Bancários',
          step_sequence: 1,
          actor_type: 'AI_EMPLOYEE',
          actor_id: '50',
          input_contracts: ['contract-bank-statement'],
          output_outcome: 'out-extratos-validados',
          sla_minutes: 30,
          risk_level: 'R4'
        },
        {
          node_id: 'step-02',
          process_name: 'Reconciliação Bancária & Matching',
          step_sequence: 2,
          actor_type: 'AI_EMPLOYEE',
          actor_id: '50',
          input_contracts: ['contract-bank-statement', 'contract-erp-ledger'],
          output_outcome: 'out-mapa-conciliado',
          sla_minutes: 60,
          risk_level: 'R3'
        },
        {
          node_id: 'step-03',
          process_name: 'Aprovação de Mapa de Tesouraria',
          step_sequence: 3,
          actor_type: 'HUMAN',
          actor_id: 'user_director_financeiro',
          input_contracts: ['out-mapa-conciliado'],
          output_outcome: 'out-tesouraria-aprovada',
          sla_minutes: 120,
          risk_level: 'R2'
        }
      ],
      bottlenecks_detected: ['step-03 (Aguardando Aprovação Humana)'],
      total_cycle_time_minutes: 210
    });

    // 9. Seed Work Requests
    this.workRequests.push({
      request_id: 'req-001',
      organization_id: orgId,
      channel: 'TEXT',
      raw_prompt: 'Executar conciliação bancária mensal da conta BAI e emitir mapa de fluxo de caixa',
      resolved_intent: 'EXECUTE_BANK_RECONCILIATION',
      target_area_code: 'A03',
      assigned_employee_id: '50',
      priority: 'P1_HIGH',
      sla_deadline: new Date(Date.now() + 86400000).toISOString(),
      status: 'IN_PROGRESS',
      created_at: new Date().toISOString()
    });

    // 10. Seed Autonomy Progression Record
    this.autonomyRecords.set('50', {
      employee_id: '50',
      role_key: 'accounts_payable',
      current_autonomy_level: 'L3_PREPARE',
      empirical_sample_size: 1450,
      error_free_streak: 320,
      risk_budget_cap: 'L4_EXECUTE_LIMITED',
      last_evaluated_at: new Date().toISOString()
    });

    // 11. Seed Risk Budget
    this.riskBudgets.set(orgId, {
      organization_id: orgId,
      area_risk_caps: {
        'A03': 'LOW',
        'A02': 'VERY_LOW',
        'A01': 'MEDIUM'
      },
      max_allowed_autonomy: 'L4_EXECUTE_LIMITED',
      updated_at: new Date().toISOString()
    });

    // 12. Seed Group Structure
    this.groupStructures.set(orgId, {
      holding_id: 'holding-angola-corp',
      holding_name: 'Angola Corporate Group Holding',
      subsidiary_companies: [
        {
          company_id: 'comp-01',
          company_name: 'Empresa Comercial & Distribuição Lda',
          tenant_id: orgId,
          isolated_legal_entity: true
        },
        {
          company_id: 'comp-02',
          company_name: 'Empresa Industrial & Manufatura SA',
          tenant_id: 'org-subsidiary-02',
          isolated_legal_entity: true
        }
      ]
    });
  }

  // --- 1. COVERAGE BLUEPRINT ENGINE ---
  public getOrganizationCoverageBlueprint(orgId: string): OrganizationCoverageBlueprint {
    const blueprint = this.coverageBlueprints.get(orgId);
    if (blueprint) return blueprint;
    return {
      organization_id: orgId,
      total_work_units: 10000,
      covered_work_units: 5000,
      coverage_percentage: 50,
      coverage_by_department: { 'GERAL': 50 },
      active_coverage_mode: 'AI_assisted',
      human_dependency_score: 50,
      ai_dependency_score: 50,
      critical_gaps: [],
      last_calculated_at: new Date().toISOString()
    };
  }

  // --- 2. STAFFING SIMULATOR ENGINE ---
  public simulateStaffing(params: {
    orgId: string;
    mode: SimulationMode;
    invoices: number;
    bankAccounts: number;
    employees: number;
    stockMovements: number;
  }): StaffingSimulationResult {
    const multiplier = params.mode === 'CONSERVATIVE' ? 1.0 : params.mode === 'BALANCED' ? 1.5 : 2.2;
    const recommendedCapacity = Math.round((params.invoices + params.stockMovements) * multiplier);
    const recommendedFteSupervisors = Math.max(1, Math.round(recommendedCapacity / 2500));
    const estimatedCostAoa = Math.round(recommendedCapacity * 1250 + recommendedFteSupervisors * 350000);

    return {
      simulation_id: `sim-${Date.now()}`,
      organization_id: params.orgId,
      mode: params.mode,
      input_monthly_invoices: params.invoices,
      input_bank_accounts: params.bankAccounts,
      input_employees_count: params.employees,
      input_stock_movements_monthly: params.stockMovements,
      recommended_areas: ['A03', 'A02', 'A05'],
      recommended_solution_packs: ['pack-fin-treasury', 'pack-saft-iva', 'pack-logistics-stock'],
      recommended_ai_employee_capacity_units: recommendedCapacity,
      required_human_supervisors_fte: recommendedFteSupervisors,
      recommended_connectors: ['PEIP_PRIMAVERA_V10', 'PEIP_BANK_READONLY', 'PEIP_EXCEL_SAFE'],
      estimated_monthly_cost_aoa: estimatedCostAoa,
      expected_time_to_value_days: params.mode === 'CONSERVATIVE' ? 14 : 7,
      is_production_affecting: false, // Mandatory safeguard
      simulated_at: new Date().toISOString()
    };
  }

  // --- 3. RESPONSIBILITY & DECISION RIGHTS ENGINES ---
  public getResponsibilityMatrix(orgId: string): HybridResponsibilityMatrix {
    return this.responsibilityMatrices.get(orgId) || {
      organization_id: orgId,
      assignments: [],
      updated_at: new Date().toISOString()
    };
  }

  public evaluateDecisionRight(roleKey: string, action: DecisionAction, amountAoa: number): {
    allowed: boolean;
    reason: string;
    requiresApproval: boolean;
  } {
    const policy = Array.from(this.decisionPolicies.values()).find(p => p.role_key === roleKey);
    if (!policy) {
      return { allowed: false, reason: `Nenhuma política de direitos de decisão encontrada para a função '${roleKey}'`, requiresApproval: true };
    }

    if (!policy.allowed_actions.includes(action)) {
      return {
        allowed: false,
        reason: `Ação '${action}' não autorizada para a função '${roleKey}'. Ações permitidas: ${policy.allowed_actions.join(', ')}`,
        requiresApproval: true
      };
    }

    if (amountAoa > policy.monetary_limit_aoa) {
      return {
        allowed: false,
        reason: `Valor de ${amountAoa.toLocaleString('pt-AO')} AOA excede o limite monetário autorizado de ${policy.monetary_limit_aoa.toLocaleString('pt-AO')} AOA`,
        requiresApproval: true
      };
    }

    return {
      allowed: true,
      reason: `Ação '${action}' autorizada dentro dos limites regulamentares`,
      requiresApproval: policy.requires_human_approval
    };
  }

  // --- 4. MAKER-CHECKER PATTERN EVALUATOR ---
  public evalMakerCheckerPattern(taskType: string, makerId: string, approverId: string): {
    valid: boolean;
    reason: string;
  } {
    const pattern = this.workControlPatterns.get(taskType);
    if (!pattern) return { valid: true, reason: 'Nenhum padrão estrito de Maker-Checker configurado para esta tarefa' };

    if (pattern.prevent_self_approval && makerId === approverId) {
      return {
        valid: false,
        reason: 'VIOLAÇÃO DE SEGREGAÇÃO DE FUNÇÕES: O mesmo agente/utilizador não pode ser simultaneamente Maker e Approver (Auto-aprovação proibida)'
      };
    }

    return { valid: true, reason: 'Controlo Maker-Checker-Approver satisfeito com segregação de funções' };
  }

  // --- 5. SUBSTITUTION & HOT BACKUP ENGINE ---
  public getSubstitutionProfile(employeeId: string): EmployeeSubstitutionProfile | undefined {
    return this.substitutionProfiles.get(employeeId);
  }

  public activateHotBackup(employeeId: string): {
    success: boolean;
    backupEmployeeId: string;
    inheritedPermissions: false;
    message: string;
  } {
    const profile = this.substitutionProfiles.get(employeeId);
    if (!profile) {
      return {
        success: false,
        backupEmployeeId: '',
        inheritedPermissions: false,
        message: 'Nenhum perfil de backup configurado para este AI Employee'
      };
    }

    return {
      success: true,
      backupEmployeeId: profile.backup_employee_id,
      inheritedPermissions: false, // Mandatory safeguard
      message: `AI Employee substituto '${profile.backup_employee_id}' ativado em estado HOT_BACKUP. Permissões requerem validação explícita de escopo.`
    };
  }

  // --- 6. WORK CONTINUITY ENGINE ---
  public getContinuityPlan(serviceComponent: string): WorkContinuityPlan {
    return this.continuityPlans.get(serviceComponent) || {
      plan_id: `plan-${serviceComponent}`,
      service_component: serviceComponent,
      current_state: 'NORMAL',
      fallback_action: 'Operar em modo seguro de contingência manual/draft',
      notify_supervisor: true,
      last_state_change: new Date().toISOString()
    };
  }

  public triggerDegradedFallback(serviceComponent: string): WorkContinuityPlan {
    const plan = this.getContinuityPlan(serviceComponent);
    plan.current_state = 'DEGRADED';
    plan.last_state_change = new Date().toISOString();
    this.continuityPlans.set(serviceComponent, plan);
    return plan;
  }

  // --- 7. WORK REQUEST & QUEUE ENGINES ---
  public submitWorkRequest(rawPrompt: string, areaCode: string, priority: PriorityLevel = 'P2_NORMAL'): WorkRequest {
    const req: WorkRequest = {
      request_id: `req-${Date.now()}`,
      organization_id: 'org-demo',
      channel: 'TEXT',
      raw_prompt: rawPrompt,
      resolved_intent: 'AUTONOMOUS_WORK_REQUEST',
      target_area_code: areaCode,
      assigned_employee_id: '50',
      priority,
      sla_deadline: new Date(Date.now() + 86400000).toISOString(),
      status: 'QUEUED',
      created_at: new Date().toISOString()
    };

    this.workRequests.push(req);
    return req;
  }

  public getWorkQueueSummary(orgId: string): EnterpriseWorkQueueSummary {
    const openTasks = this.workRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    return {
      organization_id: orgId,
      total_open_tasks: openTasks.length,
      active_ai_employees_count: 53,
      active_areas_count: 11,
      waiting_approval_count: openTasks.filter(r => r.status === 'WAITING_APPROVAL').length,
      waiting_data_count: openTasks.filter(r => r.status === 'WAITING_DATA').length,
      blocked_count: openTasks.filter(r => r.status === 'BLOCKED').length,
      p0_critical_count: openTasks.filter(r => r.priority === 'P0_CRITICAL').length,
      updated_at: new Date().toISOString()
    };
  }

  // --- 8. AUTONOMY PROGRESSION ENGINE ---
  public evaluateAutonomyLevel(employeeId: string, empiricalSample: number, errorFreeStreak: number): AutonomyProgressionRecord {
    const record = this.autonomyRecords.get(employeeId) || {
      employee_id: employeeId,
      role_key: 'accounts_payable',
      current_autonomy_level: 'L2_RECOMMEND',
      empirical_sample_size: empiricalSample,
      error_free_streak: errorFreeStreak,
      risk_budget_cap: 'L4_EXECUTE_LIMITED',
      last_evaluated_at: new Date().toISOString()
    };

    record.empirical_sample_size = empiricalSample;
    record.error_free_streak = errorFreeStreak;

    if (errorFreeStreak >= 500 && empiricalSample >= 1000) {
      record.current_autonomy_level = 'L4_EXECUTE_LIMITED';
    } else if (errorFreeStreak >= 100 && empiricalSample >= 300) {
      record.current_autonomy_level = 'L3_PREPARE';
    } else {
      record.current_autonomy_level = 'L2_RECOMMEND';
    }

    record.last_evaluated_at = new Date().toISOString();
    this.autonomyRecords.set(employeeId, record);
    return record;
  }

  // --- 9. GLOBAL DWOS SUMMARY ---
  public getGlobalSummary(orgId: string = 'org-demo'): DWOSGlobalSummary {
    return {
      organization_id: orgId,
      coverage_blueprint: this.getOrganizationCoverageBlueprint(orgId),
      active_capacity_allocations: 14,
      queue_summary: this.getWorkQueueSummary(orgId),
      risk_budget: this.riskBudgets.get(orgId) || {
        organization_id: orgId,
        area_risk_caps: { 'A03': 'LOW' },
        max_allowed_autonomy: 'L4_EXECUTE_LIMITED',
        updated_at: new Date().toISOString()
      },
      responsibility_matrix_size: (this.responsibilityMatrices.get(orgId)?.assignments || []).length,
      group_structure: this.groupStructures.get(orgId) || {
        holding_id: 'holding-demo',
        holding_name: 'Holding Angola Corp',
        subsidiary_companies: []
      },
      updated_at: new Date().toISOString()
    };
  }
}
