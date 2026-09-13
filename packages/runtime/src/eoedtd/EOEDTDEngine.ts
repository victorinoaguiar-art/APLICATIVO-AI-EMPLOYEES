import {
  OffboardingCase,
  OffboardingSchedule,
  OffboardingAction,
  AreaOffboardingDependencyCheck,
  OpenWorkImpactSummary,
  OffboardingExportPackage,
  DataRetentionPolicy,
  LegalHold,
  DataDeletionCertificate,
  DeletionTombstone,
  OffboardingCertificate,
  EOEDTDGlobalSummary,
  OffboardingScopeType,
  OffboardingReasonCode,
  OffboardingCaseStatus,
  EmployeeOffboardingStatus,
  AreaOffboardingStatus,
  TenantOffboardingStatus,
  OpenWorkResolutionOption,
  DataPurgeStatus
} from '@ai-employee/shared';
import * as crypto from 'crypto';

export class EOEDTDEngine {
  private static instance: EOEDTDEngine;

  private offboardingCases: Map<string, OffboardingCase> = new Map();
  private schedules: Map<string, OffboardingSchedule> = new Map();
  private actions: Map<string, OffboardingAction[]> = new Map();
  private retentionPolicies: Map<string, DataRetentionPolicy> = new Map();
  private legalHolds: Map<string, LegalHold> = new Map();
  private tombstones: Map<string, DeletionTombstone> = new Map();
  private exportPackages: Map<string, OffboardingExportPackage> = new Map();
  private deletionCertificates: Map<string, DataDeletionCertificate> = new Map();
  private finalCertificates: Map<string, OffboardingCertificate> = new Map();

  private constructor() {
    this.seedDefaultPoliciesAndData();
  }

  public static getInstance(): EOEDTDEngine {
    if (!EOEDTDEngine.instance) {
      EOEDTDEngine.instance = new EOEDTDEngine();
    }
    return EOEDTDEngine.instance;
  }

  private seedDefaultPoliciesAndData(): void {
    // Seed standard retention policies
    const defaultPolicies: DataRetentionPolicy[] = [
      {
        policy_id: 'POL_TASK_DATA_01',
        data_category: 'TASK_DATA',
        retention_period_days: 90,
        retention_basis: 'Commercial Code Art. 45 / Operational Audit',
        effective_from: '2026-01-01T00:00:00Z',
        legal_hold_allowed: true,
        purge_method: 'SECURE_DELETE',
        backup_treatment: 'EXPIRE_NATURALLY_WITH_TOMBSTONE'
      },
      {
        policy_id: 'POL_DOCUMENTS_01',
        data_category: 'DOCUMENTS',
        retention_period_days: 365,
        retention_basis: 'Tax & Accounting Regulation Angola Law 12/20',
        effective_from: '2026-01-01T00:00:00Z',
        legal_hold_allowed: true,
        purge_method: 'CRYPTO_SHRED',
        backup_treatment: 'EXPIRE_NATURALLY_WITH_TOMBSTONE'
      },
      {
        policy_id: 'POL_AUDIT_01',
        data_category: 'AUDIT',
        retention_period_days: 1825, // 5 years
        retention_basis: 'Compliance & Audit Integrity Act',
        effective_from: '2026-01-01T00:00:00Z',
        legal_hold_allowed: true,
        purge_method: 'LOGICAL_DELETE',
        backup_treatment: 'EXPIRE_NATURALLY_WITH_TOMBSTONE'
      },
      {
        policy_id: 'POL_BILLING_01',
        data_category: 'BILLING',
        retention_period_days: 3650, // 10 years
        retention_basis: 'Commercial Code Tax Books Retention Requirement',
        effective_from: '2026-01-01T00:00:00Z',
        legal_hold_allowed: true,
        purge_method: 'STORAGE_EXPIRY',
        backup_treatment: 'EXPIRE_NATURALLY_WITH_TOMBSTONE'
      }
    ];

    defaultPolicies.forEach(p => this.retentionPolicies.set(p.policy_id, p));

    // Seed initial demo offboarding case
    const seedCase: OffboardingCase = {
      offboarding_case_id: 'OFC_DEMO_001',
      organization_id: 'ORG_DEMO_001',
      tenant_id: 'TENANT_DEMO_001',
      scope_type: 'ORGANIZATION_OFFBOARDING',
      scope_id: 'ORG_DEMO_001',
      reason_code: 'CONTRACT_END',
      reason_text: 'Fim do contrato anual de subscrição comercial.',
      requested_by: 'admin@demo-org.ao',
      requested_at: new Date().toISOString(),
      effective_service_stop_at: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days
      read_only_until: new Date(Date.now() + 86400000 * 45).toISOString(),
      retention_end_at: new Date(Date.now() + 86400000 * 120).toISOString(),
      status: 'APPROVED',
      legal_hold_status: 'NONE',
      billing_close_status: 'OPEN',
      export_status: 'READY',
      risk_level: 'MEDIUM',
      approved_by: 'governance@ai-employee.platform',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.offboardingCases.set(seedCase.offboarding_case_id, seedCase);
  }

  public getGlobalSummary(): EOEDTDGlobalSummary {
    const cases = Array.from(this.offboardingCases.values());
    const holds = Array.from(this.legalHolds.values());

    return {
      active_offboarding_cases_count: cases.filter(c => c.status === 'OFFBOARDING_IN_PROGRESS' || c.status === 'APPROVED').length,
      scheduled_cases_count: cases.filter(c => c.status === 'SCHEDULED').length,
      grace_period_cases_count: cases.filter(c => c.status === 'GRACE_PERIOD').length,
      read_only_retention_tenants_count: cases.filter(c => c.status === 'READ_ONLY_RETENTION').length,
      decommissioned_tenants_count: cases.filter(c => c.status === 'COMPLETED').length,
      active_legal_holds_count: holds.filter(h => h.status === 'ACTIVE').length,
      purge_blocked_cases_count: cases.filter(c => c.status === 'PURGE_BLOCKED').length,
      completed_purge_certificates_count: this.deletionCertificates.size
    };
  }

  public listOffboardingCases(orgId?: string): OffboardingCase[] {
    const cases = Array.from(this.offboardingCases.values());
    if (!orgId) return cases;
    return cases.filter(c => c.organization_id === orgId);
  }

  public getOffboardingCaseById(id: string): OffboardingCase | undefined {
    return this.offboardingCases.get(id);
  }

  public createOffboardingCase(params: {
    organization_id: string;
    tenant_id?: string;
    scope_type: OffboardingScopeType;
    scope_id: string;
    reason_code: OffboardingReasonCode;
    reason_text?: string;
    requested_by: string;
    effective_service_stop_at?: string;
    read_only_until?: string;
    retention_end_at?: string;
    risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): OffboardingCase {
    const caseId = `OFC_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const now = new Date();
    const serviceStop = params.effective_service_stop_at || new Date(now.getTime() + 86400000 * 14).toISOString(); // 14 days
    const readOnlyUntil = params.read_only_until || new Date(now.getTime() + 86400000 * 30).toISOString();
    const retentionEnd = params.retention_end_at || new Date(now.getTime() + 86400000 * 90).toISOString();

    const newCase: OffboardingCase = {
      offboarding_case_id: caseId,
      organization_id: params.organization_id,
      tenant_id: params.tenant_id || `TENANT_${params.organization_id}`,
      scope_type: params.scope_type,
      scope_id: params.scope_id,
      reason_code: params.reason_code,
      reason_text: params.reason_text || `Solicitação de offboarding (${params.reason_code})`,
      requested_by: params.requested_by,
      requested_at: now.toISOString(),
      effective_service_stop_at: serviceStop,
      read_only_until: readOnlyUntil,
      retention_end_at: retentionEnd,
      status: 'REQUESTED',
      legal_hold_status: 'NONE',
      billing_close_status: 'OPEN',
      export_status: 'NOT_REQUESTED',
      risk_level: params.risk_level || 'MEDIUM',
      created_at: now.toISOString(),
      updated_at: new Date().toISOString()
    };

    this.offboardingCases.set(caseId, newCase);
    return newCase;
  }

  public analyzeImpact(caseId: string): OpenWorkImpactSummary {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) {
      throw new Error(`Caso de offboarding ${caseId} não encontrado.`);
    }

    const isOrg = caseObj.scope_type === 'ORGANIZATION_OFFBOARDING';

    return {
      offboarding_case_id: caseId,
      running_tasks_count: isOrg ? 5 : 1,
      queued_tasks_count: isOrg ? 12 : 2,
      scheduled_jobs_count: isOrg ? 8 : 1,
      pending_approvals_count: isOrg ? 3 : 0,
      cross_area_dependencies_count: isOrg ? 4 : 1,
      recommended_action: 'FINISH_THEN_DEACTIVATE'
    };
  }

  public approveOffboardingCase(caseId: string, approvedBy: string): OffboardingCase {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    caseObj.status = 'APPROVED';
    caseObj.approved_by = approvedBy;
    caseObj.approved_at = new Date().toISOString();
    caseObj.updated_at = new Date().toISOString();

    this.offboardingCases.set(caseId, caseObj);
    return caseObj;
  }

  public scheduleOffboardingCase(caseId: string): OffboardingSchedule {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    caseObj.status = 'SCHEDULED';
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);

    const scheduleId = `SCH_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const sched: OffboardingSchedule = {
      offboarding_schedule_id: scheduleId,
      offboarding_case_id: caseId,
      freeze_at: new Date().toISOString(),
      stop_new_work_at: caseObj.effective_service_stop_at,
      deactivate_employees_at: caseObj.effective_service_stop_at,
      revoke_connections_at: caseObj.effective_service_stop_at,
      read_only_until: caseObj.read_only_until,
      retention_end_at: caseObj.retention_end_at,
      purge_after: caseObj.retention_end_at,
      status: 'SCHEDULED'
    };

    this.schedules.set(scheduleId, sched);
    return sched;
  }

  public startOffboardingCase(caseId: string): OffboardingCase {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    caseObj.status = 'OFFBOARDING_IN_PROGRESS';
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);
    return caseObj;
  }

  public pauseOffboardingCase(caseId: string): OffboardingCase {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    caseObj.status = 'UNDER_REVIEW';
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);
    return caseObj;
  }

  public resumeOffboardingCase(caseId: string): OffboardingCase {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    caseObj.status = 'OFFBOARDING_IN_PROGRESS';
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);
    return caseObj;
  }

  public cancelOffboardingCase(caseId: string): OffboardingCase {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    caseObj.status = 'CANCELLED';
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);
    return caseObj;
  }

  public deactivateEmployeeInstance(employeeInstanceId: string, resolution: OpenWorkResolutionOption): {
    success: boolean;
    employee_instance_id: string;
    status: EmployeeOffboardingStatus;
    open_work_resolved: boolean;
    audit_preserved: boolean;
  } {
    return {
      success: true,
      employee_instance_id: employeeInstanceId,
      status: 'DEACTIVATED',
      open_work_resolved: true,
      audit_preserved: true
    };
  }

  public cancelAreaSubscription(areaId: string, orgId: string): {
    success: boolean;
    area_id: string;
    status: AreaOffboardingStatus;
    employees_deactivated_count: number;
    entitlements_revoked_count: number;
    dependency_check: AreaOffboardingDependencyCheck;
  } {
    const dependencyCheck: AreaOffboardingDependencyCheck = {
      area_id: areaId,
      organization_id: orgId,
      dependent_areas: [
        {
          area_id: 'AREA_SALES',
          area_name: 'Vendas & CRM',
          relationship_type: 'RECEIVES_DATA_FROM'
        }
      ],
      active_employees_count: 3,
      open_workflows_count: 2,
      shared_connectors_count: 1,
      has_blocking_dependency: false,
      warnings: ['Fluxo de propostas compartilhado com área Vendas passará para modo sem automação.']
    };

    return {
      success: true,
      area_id: areaId,
      status: 'CANCELLED',
      employees_deactivated_count: 3,
      entitlements_revoked_count: 3,
      dependency_check: dependencyCheck
    };
  }

  public revokeConnection(connectionId: string, orgId: string, isFullOrg: boolean): {
    success: boolean;
    connection_id: string;
    status: 'REVOKED';
    secret_destruction_event: { destroyed_at: string; secret_ref: string };
  } {
    return {
      success: true,
      connection_id: connectionId,
      status: 'REVOKED',
      secret_destruction_event: {
        destroyed_at: new Date().toISOString(),
        secret_ref: `SECRET_HASH_${crypto.randomBytes(6).toString('hex')}`
      }
    };
  }

  public generateExportPackage(caseId: string): OffboardingExportPackage {
    const caseObj = this.offboardingCases.get(caseId);
    const exportId = `EXP_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const hash = crypto.createHash('sha256').update(`${caseId}-${exportId}-${Date.now()}`).digest('hex');

    const pkg: OffboardingExportPackage = {
      export_package_id: exportId,
      offboarding_case_id: caseId,
      organization_id: caseObj ? caseObj.organization_id : 'ORG_DEMO_001',
      included_categories: ['TASK_DATA', 'DOCUMENTS', 'APPROVED_OUTPUTS', 'AUDIT', 'BILLING_METRICS'],
      excluded_categories: ['SYSTEM_PROMPTS', 'CHAIN_OF_THOUGHT', 'PLATFORM_SOURCE_CODE'],
      generated_at: new Date().toISOString(),
      hash: hash,
      delivery_method: 'DIRECT_DOWNLOAD',
      delivery_status: 'READY',
      download_expiry: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days
      size_bytes: 48291040 // ~48 MB
    };

    if (caseObj) {
      caseObj.export_status = 'READY';
      this.offboardingCases.set(caseId, caseObj);
    }

    this.exportPackages.set(exportId, pkg);
    return pkg;
  }

  public listRetentionPolicies(): DataRetentionPolicy[] {
    return Array.from(this.retentionPolicies.values());
  }

  public listLegalHolds(orgId?: string): LegalHold[] {
    const holds = Array.from(this.legalHolds.values());
    if (!orgId) return holds;
    return holds.filter(h => h.organization_id === orgId);
  }

  public createLegalHold(hold: Partial<LegalHold>): LegalHold {
    const holdId = `HOLD_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const newHold: LegalHold = {
      legal_hold_id: holdId,
      organization_id: hold.organization_id || 'ORG_DEMO_001',
      scope_type: hold.scope_type || 'ORGANIZATION',
      scope_id: hold.scope_id || hold.organization_id || 'ORG_DEMO_001',
      reason: hold.reason || 'Litígio pendente / Investigação Regulamentar',
      authority: hold.authority || 'Departamento Jurídico / Regulador',
      start_at: new Date().toISOString(),
      status: 'ACTIVE',
      created_by: hold.created_by || 'legal-officer@company.ao',
      case_reference: hold.case_reference || `CASE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    };

    this.legalHolds.set(holdId, newHold);

    // Update matching offboarding case if present
    const cases = Array.from(this.offboardingCases.values());
    const matchingCase = cases.find(c => c.organization_id === newHold.organization_id);
    if (matchingCase) {
      matchingCase.legal_hold_status = 'ACTIVE';
      matchingCase.status = 'PURGE_BLOCKED';
      this.offboardingCases.set(matchingCase.offboarding_case_id, matchingCase);
    }

    return newHold;
  }

  public releaseLegalHold(holdId: string): LegalHold {
    const hold = this.legalHolds.get(holdId);
    if (!hold) throw new Error(`Legal Hold ${holdId} não encontrado.`);

    hold.status = 'RELEASED';
    hold.end_at = new Date().toISOString();
    this.legalHolds.set(holdId, hold);

    // Check if other legal holds remain active for org
    const activeHolds = Array.from(this.legalHolds.values()).filter(
      h => h.organization_id === hold.organization_id && h.status === 'ACTIVE'
    );

    if (activeHolds.length === 0) {
      const cases = Array.from(this.offboardingCases.values());
      const matchingCase = cases.find(c => c.organization_id === hold.organization_id);
      if (matchingCase && matchingCase.status === 'PURGE_BLOCKED') {
        matchingCase.legal_hold_status = 'NONE';
        matchingCase.status = 'PURGE_ELIGIBLE';
        this.offboardingCases.set(matchingCase.offboarding_case_id, matchingCase);
      }
    }

    return hold;
  }

  public evaluatePurgeEligibility(caseId: string): {
    eligible: boolean;
    status: DataPurgeStatus;
    legal_hold_blocking: boolean;
    retention_expired: boolean;
    categories_eligible: string[];
  } {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    const hasActiveLegalHold = Array.from(this.legalHolds.values()).some(
      h => h.organization_id === caseObj.organization_id && h.status === 'ACTIVE'
    );

    const retentionExpired = new Date(caseObj.retention_end_at).getTime() <= Date.now();

    if (hasActiveLegalHold) {
      caseObj.status = 'PURGE_BLOCKED';
      caseObj.legal_hold_status = 'ACTIVE';
      return {
        eligible: false,
        status: 'BLOCKED',
        legal_hold_blocking: true,
        retention_expired: retentionExpired,
        categories_eligible: []
      };
    }

    const eligible = retentionExpired;
    const status: DataPurgeStatus = eligible ? 'ELIGIBLE' : 'NOT_ELIGIBLE';
    if (eligible) {
      caseObj.status = 'PURGE_ELIGIBLE';
    }

    return {
      eligible,
      status,
      legal_hold_blocking: false,
      retention_expired: retentionExpired,
      categories_eligible: eligible ? ['TASK_DATA', 'DOCUMENTS', 'OPERATIONAL_MEMORY', 'CONNECTOR_LOGS'] : []
    };
  }

  public executeDataPurge(caseId: string, authorizedBy: string): {
    success: boolean;
    deletion_certificate: DataDeletionCertificate;
    tombstones_created: DeletionTombstone[];
  } {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    const evalResult = this.evaluatePurgeEligibility(caseId);
    if (evalResult.legal_hold_blocking) {
      throw new Error(`Purge bloqueado: Existe Legal Hold ativo para a organização ${caseObj.organization_id}.`);
    }

    const certId = `CERT_DEL_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const hash = crypto.createHash('sha256').update(`${caseId}-${certId}-${authorizedBy}-${Date.now()}`).digest('hex');

    const cert: DataDeletionCertificate = {
      certificate_id: certId,
      organization_id: caseObj.organization_id,
      offboarding_case_id: caseId,
      categories_deleted: ['TASK_DATA', 'DOCUMENTS', 'OPERATIONAL_MEMORY', 'CONNECTOR_LOGS', 'VECTOR_INDEXES'],
      categories_retained: ['AUDIT_TRAIL_RETAINED', 'TAX_BILLING_RETAINED'],
      retention_basis: 'Commercial Code Art. 45 & Compliance Legal Exception',
      legal_hold_exceptions: [],
      purge_completed_at: new Date().toISOString(),
      verification_status: 'PASS',
      authorized_by: authorizedBy,
      audit_reference: `AUDIT_REF_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      verification_hash: hash
    };

    const tombstone: DeletionTombstone = {
      tombstone_id: `TOMB_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      tenant_id: caseObj.tenant_id,
      organization_id: caseObj.organization_id,
      entity_type: 'ORGANIZATION',
      entity_id: caseObj.organization_id,
      deleted_at: new Date().toISOString(),
      purge_certificate_id: certId,
      restore_protection: 'BLOCK_AND_PURGE'
    };

    this.deletionCertificates.set(certId, cert);
    this.tombstones.set(tombstone.tombstone_id, tombstone);

    caseObj.status = 'DECOMMISSIONING';
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);

    return {
      success: true,
      deletion_certificate: cert,
      tombstones_created: [tombstone]
    };
  }

  public decommissionTenant(tenantId: string, caseId: string, authorizedBy: string): {
    success: boolean;
    tenant_id: string;
    status: TenantOffboardingStatus;
    final_certificate: OffboardingCertificate;
  } {
    const caseObj = this.offboardingCases.get(caseId);
    if (!caseObj) throw new Error(`Caso ${caseId} não encontrado.`);

    const certId = `CERT_FINAL_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const hash = crypto.createHash('sha256').update(`FINAL-${tenantId}-${caseId}-${Date.now()}`).digest('hex');

    const cert: OffboardingCertificate = {
      certificate_id: certId,
      organization_id: caseObj.organization_id,
      offboarding_case_id: caseId,
      service_stop_at: caseObj.effective_service_stop_at,
      areas_cancelled: 8,
      employees_deactivated: 42,
      connections_revoked: 6,
      secrets_destroyed: 6,
      exports_delivered: true,
      retention_status: 'EXPIRED_AND_PURGED',
      purge_status: 'COMPLETED_VERIFIED',
      legal_hold_summary: 'NO_ACTIVE_HOLDS',
      billing_status: 'BILLING_CLOSED',
      tenant_status: 'DECOMMISSIONED',
      completed_at: new Date().toISOString(),
      authorized_by: authorizedBy,
      audit_reference: `AUDIT_FINAL_${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      certificate_fingerprint: hash
    };

    this.finalCertificates.set(certId, cert);

    caseObj.status = 'COMPLETED';
    caseObj.completed_at = new Date().toISOString();
    caseObj.updated_at = new Date().toISOString();
    this.offboardingCases.set(caseId, caseObj);

    return {
      success: true,
      tenant_id: tenantId,
      status: 'DECOMMISSIONED',
      final_certificate: cert
    };
  }

  public triggerEmergencyBreakGlass(orgId: string, requestedBy: string, reason: string): {
    success: boolean;
    org_id: string;
    status: 'PAUSED_ORGANIZATION';
    runtime_tokens_revoked: number;
    open_incident_id: string;
  } {
    const incidentId = `INC_BREAKGLASS_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Pause all offboarding cases for this org
    const cases = Array.from(this.offboardingCases.values()).filter(c => c.organization_id === orgId);
    cases.forEach(c => {
      c.status = 'UNDER_REVIEW';
      c.updated_at = new Date().toISOString();
      this.offboardingCases.set(c.offboarding_case_id, c);
    });

    return {
      success: true,
      org_id: orgId,
      status: 'PAUSED_ORGANIZATION',
      runtime_tokens_revoked: 42,
      open_incident_id: incidentId
    };
  }
}
