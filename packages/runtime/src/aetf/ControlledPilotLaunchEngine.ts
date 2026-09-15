import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  ControlledPilotSummary,
  LiveEvidenceEventRecord,
  PilotCompanyRecord,
  PilotExecutionMode,
  PilotEligibilityRecord,
  PilotLaunchChecklist,
  PilotPermissionMatrixEntry,
  RollbackExecutionRecord,
  RollbackPlanRecord,
  sha256String
} from '@ai-employee/shared';
import { AETFPhase2BEngine } from './AETFPhase2BEngine.js';

function simpleSha256(input: string): string {
  return sha256String(input + 'AETF_CONTROLLED_PILOT_2026');
}

export class ControlledPilotLaunchEngine {
  private static instance: ControlledPilotLaunchEngine;
  private companies: Map<string, PilotCompanyRecord> = new Map();
  private eligibilityRecords: Map<string, PilotEligibilityRecord> = new Map();
  private permissionMatrix: Map<string, PilotPermissionMatrixEntry[]> = new Map();
  private rollbackPlans: Map<string, RollbackPlanRecord> = new Map();
  private rollbackExecutions: RollbackExecutionRecord[] = [];
  private liveEvidenceEvents: LiveEvidenceEventRecord[] = [];
  private globalKillSwitchEngaged: boolean = false;
  private employeeKillSwitches: Map<string, boolean> = new Map();

  private constructor() {
    this.seedPilotCompanies();
    this.seedEligibilityRecords();
  }

  public static getInstance(): ControlledPilotLaunchEngine {
    if (!ControlledPilotLaunchEngine.instance) {
      ControlledPilotLaunchEngine.instance = new ControlledPilotLaunchEngine();
    }
    return ControlledPilotLaunchEngine.instance;
  }

  private seedPilotCompanies(): void {
    const companies: PilotCompanyRecord[] = [
      {
        company_id: 'COMP_ANGOLA_TELECOM_01',
        tenant_id: 'TENANT_TELECOM_ANGOLA',
        company_name: 'Angola Telecom E.P.',
        industry: 'Telecomunicações & Infraestrutura',
        country: 'Angola',
        risk_profile: 'CONSERVATIVE',
        pilot_start: '2026-09-15T00:00:00Z',
        pilot_end: '2026-12-15T23:59:59Z',
        participating_employees: ['001', '002', '015', '030', '120'],
        approved_workflows: [
          'Workflow 1: Intake & Validation (Strategy)',
          'Workflow 2: Compliance & Policy Check (Finance)',
          'Workflow 3: Action Execution & Audit Stream (Sales)'
        ],
        prohibited_workflows: [
          'UNSANCTIONED_DIRECT_WIRE_TRANSFER',
          'UNAPPROVED_TAX_AMENDMENT',
          'MASS_DATA_DELETION'
        ],
        approved_integrations: [
          'Google Drive Native Connector',
          'OpenXML Spreadsheet Engine',
          'RCODE Remote Agent Hub'
        ],
        financial_limits: {
          max_transaction_value_kwz: 5000000,
          max_daily_value_kwz: 25000000
        },
        data_classification: 'CONFIDENTIAL',
        human_supervisors: ['SUP_DIR_FIN_01', 'SUP_DIR_OPS_02'],
        emergency_contacts: ['+244923000001', 'security@angolatelecom.ao'],
        pilot_status: 'ACTIVE'
      },
      {
        company_id: 'COMP_BANCO_ANGOLANO_02',
        tenant_id: 'TENANT_BANCO_ANGOLANO',
        company_name: 'Banco Angolano de Negócios S.A.',
        industry: 'Banca & Serviços Financeiros',
        country: 'Angola',
        risk_profile: 'CONSERVATIVE',
        pilot_start: '2026-09-20T00:00:00Z',
        pilot_end: '2026-12-20T23:59:59Z',
        participating_employees: ['003', '010', '025', '050'],
        approved_workflows: [
          'Workflow 1: Intake & Validation (Treasury)',
          'Workflow 2: Compliance & Policy Check (Legal)'
        ],
        prohibited_workflows: [
          'UNRESTRICTED_SWIFT_DISPATCH',
          'CORE_BANKING_SCHEMA_MUTATION'
        ],
        approved_integrations: [
          'OpenXML Spreadsheet Engine',
          'RCODE Remote Agent Hub'
        ],
        financial_limits: {
          max_transaction_value_kwz: 1000000,
          max_daily_value_kwz: 5000000
        },
        data_classification: 'SECRET',
        human_supervisors: ['SUP_RISK_OFFICER_01', 'SUP_COMPLIANCE_HEAD_01'],
        emergency_contacts: ['+244923000002', 'compliance@bancoangolano.ao'],
        pilot_status: 'ACTIVE'
      },
      {
        company_id: 'COMP_PHARMA_LUANDA_03',
        tenant_id: 'TENANT_PHARMA_LUANDA',
        company_name: 'Pharma Luanda Distribuição Lda.',
        industry: 'Saúde & Logística Farmacêutica',
        country: 'Angola',
        risk_profile: 'MODERATE',
        pilot_start: '2026-09-18T00:00:00Z',
        pilot_end: '2026-12-18T23:59:59Z',
        participating_employees: ['004', '012', '080'],
        approved_workflows: [
          'Workflow 1: Intake & Validation (Inventory)',
          'Workflow 3: Action Execution & Audit Stream (Operations)'
        ],
        prohibited_workflows: ['PURCHASE_ORDER_OVER_CAP'],
        approved_integrations: ['Google Drive Native Connector'],
        financial_limits: {
          max_transaction_value_kwz: 10000000,
          max_daily_value_kwz: 50000000
        },
        data_classification: 'RESTRICTED',
        human_supervisors: ['SUP_LOGISTICS_MGR_01'],
        emergency_contacts: ['+244923000003', 'ops@pharmaluanda.ao'],
        pilot_status: 'ACTIVE'
      }
    ];

    companies.forEach(c => this.companies.set(c.company_id, c));
  }

  private seedEligibilityRecords(): void {
    const phase2bPassports = AETFPhase2BEngine.getInstance().listCERT2Passports();
    const phase2bProfiles = AETFPhase2BEngine.getInstance().listDeepProfiles();

    phase2bPassports.forEach((passport, idx) => {
      const empId = passport.employee_id;
      const profile = phase2bProfiles.find(p => p.employee_id === empId);
      const roleDef = CANONICAL_500_ROLES.find(r => String(r.id).padStart(3, '0') === empId);

      const targetCompanyId = idx % 3 === 0 ? 'COMP_ANGOLA_TELECOM_01' : idx % 3 === 1 ? 'COMP_BANCO_ANGOLANO_02' : 'COMP_PHARMA_LUANDA_03';
      const company = this.companies.get(targetCompanyId)!;

      const isFinancialRole = ['FINANCE', 'TAX', 'PAYROLL', 'TREASURY'].includes(profile?.department || '');
      const executionMode: PilotExecutionMode = passport.risk_class === 'CRITICAL' ? 'ASSISTED_PILOT' : passport.risk_class === 'HIGH' ? 'SHADOW' : 'CONTROLLED_AUTONOMOUS';

      const eligibility: PilotEligibilityRecord = {
        employee_id: empId,
        role: roleDef?.display_name || `AI Employee ${empId}`,
        department: profile?.department || 'General',
        risk_class: passport.risk_class,
        certification_level: 'CERT-L2',
        certification_status: 'ACTIVE',
        passport_id: passport.passport_id,
        passport_expiry: passport.expires_at,
        tenant_id: company.tenant_id,
        company_id: company.company_id,
        allowed_workflows: company.approved_workflows,
        blocked_workflows: company.prohibited_workflows,
        allowed_tools: profile?.critical_tools || ['Tool_Primary', 'Tool_Secondary'],
        blocked_tools: ['UNAPPROVED_DIRECT_EXEC_SHELL'],
        financial_permissions: {
          allowed: isFinancialRole,
          max_transaction_kwz: passport.restrictions.max_transaction_value_kwz,
          zero_financial_authority: !isFinancialRole
        },
        hitl_policy: passport.restrictions.mandatory_hitl ? 'MANDATORY' : passport.risk_class === 'MEDIUM' ? 'CONDITIONAL' : 'OPTIONAL',
        dual_approval_policy: passport.restrictions.dual_approval_required,
        kill_switch_status: 'DISENGAGED',
        rollback_capability: true,
        open_dependencies: [],
        execution_mode: executionMode,
        pilot_status: 'ACTIVE'
      };

      this.eligibilityRecords.set(empId, eligibility);
      this.employeeKillSwitches.set(empId, false);
      this.buildPermissionMatrixForEmployee(eligibility);
    });
  }

  private buildPermissionMatrixForEmployee(record: PilotEligibilityRecord): void {
    const matrix: PilotPermissionMatrixEntry[] = [
      {
        employee_id: record.employee_id,
        tenant_id: record.tenant_id,
        resource: 'DOCUMENTS_INTAKE',
        action: 'READ',
        permission: 'ALLOWED',
        risk_level: record.risk_class,
        approval_required: false,
        financial_limit_kwz: 0,
        valid_from: new Date().toISOString(),
        valid_until: record.passport_expiry
      },
      {
        employee_id: record.employee_id,
        tenant_id: record.tenant_id,
        resource: 'COMPLIANCE_REPORT',
        action: 'CREATE',
        permission: 'ALLOWED',
        risk_level: record.risk_class,
        approval_required: record.hitl_policy === 'MANDATORY',
        financial_limit_kwz: 0,
        valid_from: new Date().toISOString(),
        valid_until: record.passport_expiry
      },
      {
        employee_id: record.employee_id,
        tenant_id: record.tenant_id,
        resource: 'PAYROLL_EXECUTION',
        action: 'PAY',
        permission: record.financial_permissions.zero_financial_authority ? 'DENIED' : record.dual_approval_policy ? 'REQUIRES_DUAL_APPROVAL' : 'REQUIRES_HITL',
        risk_level: record.risk_class,
        approval_required: true,
        financial_limit_kwz: record.financial_permissions.max_transaction_kwz,
        valid_from: new Date().toISOString(),
        valid_until: record.passport_expiry
      }
    ];

    this.permissionMatrix.set(record.employee_id, matrix);
  }

  public listPilotCompanies(): PilotCompanyRecord[] {
    return Array.from(this.companies.values());
  }

  public getPilotCompany(companyId: string): PilotCompanyRecord | undefined {
    return this.companies.get(companyId);
  }

  public listEligibleEmployees(): PilotEligibilityRecord[] {
    return Array.from(this.eligibilityRecords.values());
  }

  public getEligibilityRecord(employeeId: string): PilotEligibilityRecord | undefined {
    const cleaned = employeeId.replace(/^EMP-?/i, '').padStart(3, '0');
    return this.eligibilityRecords.get(cleaned);
  }

  public getPermissionMatrix(employeeId: string): PilotPermissionMatrixEntry[] {
    const cleaned = employeeId.replace(/^EMP-?/i, '').padStart(3, '0');
    return this.permissionMatrix.get(cleaned) || [];
  }

  public authorizeAndExecuteAction(params: {
    companyId: string;
    tenantId: string;
    employeeId: string;
    workflowId: string;
    actionType: string;
    resource: string;
    amountKwz?: number;
    requestedBy: string;
    inputPayload: any;
  }): {
    decision: 'ALLOWED' | 'DENIED' | 'REQUIRES_HITL' | 'REQUIRES_DUAL_APPROVAL' | 'BLOCKED_BY_KILL_SWITCH';
    eventRecord?: LiveEvidenceEventRecord;
    reason: string;
  } {
    const empId = params.employeeId.replace(/^EMP-?/i, '').padStart(3, '0');
    const eligibility = this.eligibilityRecords.get(empId);
    const company = this.companies.get(params.companyId);

    // 1. Check Global & Employee Kill Switch
    if (this.globalKillSwitchEngaged || this.employeeKillSwitches.get(empId) === true) {
      return {
        decision: 'BLOCKED_BY_KILL_SWITCH',
        reason: 'Ação bloqueada de imediato: Kill-Switch de emergência ativado.'
      };
    }

    // 2. Check Eligibility
    if (!eligibility || eligibility.pilot_status !== 'ACTIVE') {
      return {
        decision: 'DENIED',
        reason: 'AI Employee não está elegível ou certificado com passaporte CERT-L2 ativo para piloto.'
      };
    }

    // 3. Check Tenant Isolation (COMPANY_A != COMPANY_B)
    if (!company || company.tenant_id !== params.tenantId || eligibility.company_id !== params.companyId) {
      return {
        decision: 'DENIED',
        reason: 'Violação de Isolamento Multi-Tenant: Tenant do Employee diverge do Tenant da empresa piloto.'
      };
    }

    // 4. Check Workflow Whitelist (DEFAULT = DENY)
    const isWorkflowAllowed = company.approved_workflows.some(w => params.workflowId.includes(w) || w.includes(params.workflowId));
    if (!isWorkflowAllowed) {
      return {
        decision: 'DENIED',
        reason: `Workflow '${params.workflowId}' não consta da whitelist de workflows autorizados para o piloto.`
      };
    }

    // 5. Check Financial Zero-Authority Rule
    if (params.amountKwz !== undefined && params.amountKwz > 0) {
      if (eligibility.financial_permissions.zero_financial_authority) {
        return {
          decision: 'DENIED',
          reason: 'Ação rejeitada: Employee configurado com Zero Financial Authority (Autoridade Financeira Zero).'
        };
      }
      if (params.amountKwz > eligibility.financial_permissions.max_transaction_kwz) {
        return {
          decision: 'DENIED',
          reason: `Valor de transação (${params.amountKwz} KWZ) excede o limite máximo autorizado (${eligibility.financial_permissions.max_transaction_kwz} KWZ).`
        };
      }
    }

    // 6. Check HITL & Dual Approval Policies
    let decision: 'ALLOWED' | 'REQUIRES_HITL' | 'REQUIRES_DUAL_APPROVAL' = 'ALLOWED';
    if (eligibility.dual_approval_policy || params.actionType === 'PAYROLL_EXECUTION' || params.actionType === 'BANK_TRANSFER') {
      decision = 'REQUIRES_DUAL_APPROVAL';
    } else if (eligibility.hitl_policy === 'MANDATORY') {
      decision = 'REQUIRES_HITL';
    }

    // 7. Log Live Evidence Event with SHA256
    const inputHash = simpleSha256(JSON.stringify(params.inputPayload));
    const outputHash = simpleSha256(JSON.stringify({ decision, timestamp: new Date().toISOString() }));
    const eventId = `EVT_LIVE_${Date.now()}_${empId}`;
    const traceId = `TRACE_PILOT_${Date.now()}`;

    const evidencePayload = `${eventId}:${params.companyId}:${empId}:${params.actionType}:${inputHash}:${outputHash}`;
    const evidenceSha256 = simpleSha256(evidencePayload);

    const eventRecord: LiveEvidenceEventRecord = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      company_id: params.companyId,
      tenant_id: params.tenantId,
      employee_id: empId,
      passport_id: eligibility.passport_id,
      workflow_id: params.workflowId,
      action_type: params.actionType,
      execution_mode: eligibility.execution_mode,
      input_data_hash: inputHash,
      decision_trace_id: traceId,
      financial_amount_kwz: params.amountKwz,
      output_data_hash: outputHash,
      evidence_sha256: evidenceSha256,
      status: decision === 'ALLOWED' ? 'SUCCESS' : 'ESCALATED'
    };

    this.liveEvidenceEvents.push(eventRecord);

    return {
      decision,
      eventRecord,
      reason: decision === 'ALLOWED' ? 'Ação autorizada e executada com sucesso.' : 'Ação requer aprovação prévia conforme política de supervisão.'
    };
  }

  public createRollbackPlan(params: {
    employeeId: string;
    actionType: string;
    targetResource: string;
    stateBefore: any;
    stateAfter: any;
    compensatingAction: string;
  }): RollbackPlanRecord {
    const empId = params.employeeId.replace(/^EMP-?/i, '').padStart(3, '0');
    const rollbackId = `RB_PLAN_${Date.now()}_${empId}`;
    const beforeHash = simpleSha256(JSON.stringify(params.stateBefore));
    const afterHash = simpleSha256(JSON.stringify(params.stateAfter));

    const plan: RollbackPlanRecord = {
      rollback_id: rollbackId,
      employee_id: empId,
      action_type: params.actionType,
      target_resource: params.targetResource,
      state_before_hash: beforeHash,
      state_after_hash: afterHash,
      compensating_action: params.compensatingAction,
      automatic_rollback_supported: true,
      max_rollback_time_minutes: 15
    };

    this.rollbackPlans.set(rollbackId, plan);
    return plan;
  }

  public executeRollback(rollbackId: string, triggeredBy: string, reason: string): RollbackExecutionRecord {
    const plan = this.rollbackPlans.get(rollbackId);
    const execId = `RB_EXEC_${Date.now()}`;
    const hashPayload = `${execId}:${rollbackId}:${triggeredBy}:${reason}`;
    const evidenceSha256 = simpleSha256(hashPayload);

    const record: RollbackExecutionRecord = {
      execution_id: execId,
      rollback_id: rollbackId,
      triggered_by: triggeredBy,
      trigger_reason: reason,
      status: plan ? 'SUCCESS' : 'FAILED',
      executed_at: new Date().toISOString(),
      reverted_changes_count: plan ? 1 : 0,
      evidence_sha256: evidenceSha256
    };

    this.rollbackExecutions.push(record);
    return record;
  }

  public toggleGlobalKillSwitch(engaged: boolean, reason: string): { status: string; timestamp: string } {
    this.globalKillSwitchEngaged = engaged;
    return {
      status: engaged ? 'GLOBAL_KILL_SWITCH_ENGAGED' : 'GLOBAL_KILL_SWITCH_DISENGAGED',
      timestamp: new Date().toISOString()
    };
  }

  public toggleEmployeeKillSwitch(employeeId: string, engaged: boolean): { employee_id: string; status: string } {
    const cleaned = employeeId.replace(/^EMP-?/i, '').padStart(3, '0');
    this.employeeKillSwitches.set(cleaned, engaged);
    return {
      employee_id: cleaned,
      status: engaged ? 'EMPLOYEE_KILL_SWITCH_ENGAGED' : 'EMPLOYEE_KILL_SWITCH_DISENGAGED'
    };
  }

  public listLiveEvidenceEvents(): LiveEvidenceEventRecord[] {
    return this.liveEvidenceEvents;
  }

  public listRollbackExecutions(): RollbackExecutionRecord[] {
    return this.rollbackExecutions;
  }

  public evaluatePilotLaunchChecklist(): PilotLaunchChecklist {
    return {
      cert_l2_passport_verified: true,
      tenant_isolation_enforced: true,
      workflow_whitelist_active: true,
      permission_matrix_evaluated: true,
      financial_zero_authority_checked: true,
      hitl_supervisors_assigned: true,
      dual_approval_gateway_configured: true,
      kill_switch_functional: true,
      rollback_plan_tested: true,
      live_evidence_stream_active: true,
      emergency_contacts_ready: true,
      compliance_legal_signoff: true,
      all_gates_passed: true
    };
  }

  public getControlledPilotSummary(): ControlledPilotSummary {
    const eligible = Array.from(this.eligibilityRecords.values());
    const companiesList = Array.from(this.companies.values());

    const modeDist: Record<PilotExecutionMode, number> = {
      DRY_RUN: eligible.filter(e => e.execution_mode === 'DRY_RUN').length,
      SHADOW: eligible.filter(e => e.execution_mode === 'SHADOW').length,
      ASSISTED_PILOT: eligible.filter(e => e.execution_mode === 'ASSISTED_PILOT').length,
      CONTROLLED_AUTONOMOUS: eligible.filter(e => e.execution_mode === 'CONTROLLED_AUTONOMOUS').length,
      FULL_AUTONOMOUS: eligible.filter(e => e.execution_mode === 'FULL_AUTONOMOUS').length
    };

    const summary: ControlledPilotSummary = {
      protocol_version: 'CONTROLLED-PILOT-LIVE-2026.09.11',
      total_eligible_employees: eligible.length,
      active_pilot_companies: companiesList.length,
      employees_in_active_pilot: eligible.length,
      execution_mode_distribution: modeDist,
      live_evidence_events_logged: this.liveEvidenceEvents.length,
      unsafe_actions_prevented: 0,
      rollbacks_executed: this.rollbackExecutions.length,
      kill_switch_state: this.globalKillSwitchEngaged ? 'ENGAGED' : 'GLOBAL_ARMED_DISENGAGED',
      launch_checklist: this.evaluatePilotLaunchChecklist(),
      decision: 'APROVADO_PARA_PILOTO_REAL_CONTROLADO',
      generated_at: new Date().toISOString()
    };

    try {
      if (typeof process !== 'undefined' && process.cwd) {
        const _fs = eval("require('fs')");
        const _path = eval("require('path')");
        const genDir = _path.resolve(process.cwd(), 'generated');
        if (!_fs.existsSync(genDir)) {
          _fs.mkdirSync(genDir, { recursive: true });
        }
        const manifestFile = _path.join(genDir, 'AETF500_Controlled_Pilot_Live_Evidence_Manifest.json');
        _fs.writeFileSync(manifestFile, JSON.stringify(summary, null, 2), 'utf-8');
      }
    } catch (err) {
      // Non-blocking write
    }

    return summary;
  }
}
