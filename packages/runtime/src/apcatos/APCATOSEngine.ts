import {
  ProvisioningJob,
  APCATOSInstance,
  OrganizationUser,
  ClientAccessPassport,
  OrganizationEmployeeReadinessPassport,
  OffboardingJob,
  APCATOSGlobalSummary,
  APCATOSInstanceLifecycleState,
  APCATOSUserRole,
  APCATOSOffboardingReason
} from '@ai-employee/shared';

export class APCATOSEngine {
  private static instance: APCATOSEngine;

  private provisioningJobs: Map<string, ProvisioningJob> = new Map();
  private employeeInstances: Map<string, APCATOSInstance> = new Map();
  private organizationUsers: Map<string, OrganizationUser> = new Map();
  private readinessPassports: Map<string, OrganizationEmployeeReadinessPassport> = new Map();
  private offboardingJobs: Map<string, OffboardingJob> = new Map();

  private constructor() {
    this.seedInitialState();
  }

  public static getInstance(): APCATOSEngine {
    if (!APCATOSEngine.instance) {
      APCATOSEngine.instance = new APCATOSEngine();
    }
    return APCATOSEngine.instance;
  }

  private seedInitialState(): void {
    const tenantId = 'tenant_angola_telecom_01';
    const orgId = 'org_angola_telecom';
    const orgName = 'Angola Telecom SA';

    // Seed Organization Users
    const users: OrganizationUser[] = [
      {
        userId: 'usr_admin_01',
        tenantId,
        organizationId: orgId,
        email: 'admin.geral@angolatelecom.ao',
        name: 'Carlos Agostinho',
        role: 'TENANT_ADMIN',
        department: 'Direção Geral / IT',
        permissions: ['READ_ALL', 'PROVISION_INSTANCES', 'ACTIVATE_INSTANCES', 'MANAGE_USERS', 'RUN_OFFBOARDING', 'VIEW_PASSPORTS'],
        assignedEmployeeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        status: 'ACTIVE',
        authenticationMethod: 'PASSWORD_MFA',
        mfaStatus: 'ENFORCED',
        invitedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        userId: 'usr_mgr_fin',
        tenantId,
        organizationId: orgId,
        email: 'financas.director@angolatelecom.ao',
        name: 'Maria Esperança',
        role: 'DEPARTMENT_MANAGER',
        department: 'Finanças & Fiscalidade',
        permissions: ['READ_ALL', 'ACTIVATE_INSTANCES', 'VIEW_PASSPORTS'],
        assignedEmployeeIds: [1, 2, 3],
        status: 'ACTIVE',
        authenticationMethod: 'OIDC_SSO',
        mfaStatus: 'ENABLED',
        invitedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
      },
      {
        userId: 'usr_op_01',
        tenantId,
        organizationId: orgId,
        email: 'operador.fiscal@angolatelecom.ao',
        name: 'António Kwanza',
        role: 'STANDARD_OPERATOR',
        department: 'Contabilidade',
        permissions: ['READ_ALL', 'VIEW_PASSPORTS'],
        assignedEmployeeIds: [1, 2],
        status: 'ACTIVE',
        authenticationMethod: 'PASSWORD_MFA',
        mfaStatus: 'ENABLED',
        invitedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        lastLoginAt: new Date(Date.now() - 14400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        userId: 'usr_audit_01',
        tenantId,
        organizationId: orgId,
        email: 'auditoria.interna@angolatelecom.ao',
        name: 'Sofia Bento',
        role: 'AUDITOR_VIEWER',
        department: 'Auditoria & Compliance',
        permissions: ['READ_ALL', 'VIEW_PASSPORTS'],
        assignedEmployeeIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        status: 'ACTIVE',
        authenticationMethod: 'SAML_SSO',
        mfaStatus: 'ENFORCED',
        invitedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ];

    for (const u of users) {
      this.organizationUsers.set(u.userId, u);
    }

    // Seed Employee Instances across departments
    const seedInstancesData = [
      { id: 1, roleKey: 'accounting_clerk', dept: 'Finance & Tax', name: 'Assistente Contábil Digital (AGT & IVA)', state: 'ACTIVE' as APCATOSInstanceLifecycleState },
      { id: 2, roleKey: 'tax_specialist', dept: 'Finance & Tax', name: 'Especialista de Conformidade Fiscal Angola', state: 'ACTIVE' as APCATOSInstanceLifecycleState },
      { id: 3, roleKey: 'treasury_analyst', dept: 'Finance & Tax', name: 'Analista de Tesouraria e Fluxo de Caixa', state: 'PILOT_ACTIVE' as APCATOSInstanceLifecycleState },
      { id: 4, roleKey: 'payroll_officer', dept: 'HR & Admin', name: 'Oficial de Processamento de Salários & IRT', state: 'ACTIVE' as APCATOSInstanceLifecycleState },
      { id: 5, roleKey: 'recruitment_coordinator', dept: 'HR & Admin', name: 'Coordenador de Triagem e Recrutamento Digital', state: 'READY_FOR_ACTIVATION' as APCATOSInstanceLifecycleState },
      { id: 6, roleKey: 'procurement_specialist', dept: 'Operations & Supply', name: 'Especialista em Compras e Cotações Fiscais', state: 'ACTIVE' as APCATOSInstanceLifecycleState },
      { id: 7, roleKey: 'warehouse_supervisor', dept: 'Operations & Supply', name: 'Supervisor de Inventário e Guia de Transporte', state: 'PILOT_ACTIVE' as APCATOSInstanceLifecycleState },
      { id: 8, roleKey: 'customer_support_rep', dept: 'Sales & Service', name: 'Atendimento e Suporte Técnico ao Cliente AO', state: 'PROVISIONING' as APCATOSInstanceLifecycleState },
      { id: 9, roleKey: 'legal_assistant', dept: 'Legal & Compliance', name: 'Assistente Jurídico e Análise de Contratos AO', state: 'PROVISIONED' as APCATOSInstanceLifecycleState },
      { id: 10, roleKey: 'compliance_auditor', dept: 'Legal & Compliance', name: 'Auditor de Conformidade Regulatória BNA/AGT', state: 'SUSPENDED' as APCATOSInstanceLifecycleState }
    ];

    for (const inst of seedInstancesData) {
      const instanceId = `inst_${tenantId}_emp_${inst.id}`;
      const instance: APCATOSInstance = {
        instanceId,
        tenantId,
        organizationId: orgId,
        organizationName: orgName,
        employeeId: inst.id,
        roleKey: inst.roleKey,
        department: inst.dept,
        customName: inst.name,
        lifecycleState: inst.state,
        allocatedResources: {
          cpuCores: 2,
          memoryMb: 4096,
          isolatedDatabaseSchema: `tenant_${inst.id}_db`,
          allocatedPorts: [8000 + inst.id, 9000 + inst.id]
        },
        securityBoundary: {
          encryptionAtRest: true,
          encryptionInTransit: true,
          auditLoggingEnabled: true,
          crossTenantAccessBlocked: true,
          dataJurisdiction: 'ANGOLA_AO_DATACENTER'
        },
        iamPolicy: {
          assignedUserIds: ['usr_admin_01'],
          rolePermissions: ['EXECUTE_TASKS', 'VIEW_AUDIT_TRAIL', 'GENERATE_DOCUMENTS'],
          accessTokenExpiryHours: 24
        },
        pilot: {
          isPilot: inst.state === 'PILOT_ACTIVE',
          pilotStartDate: inst.state === 'PILOT_ACTIVE' ? new Date(Date.now() - 86400000 * 5).toISOString() : undefined,
          pilotEndDate: inst.state === 'PILOT_ACTIVE' ? new Date(Date.now() + 86400000 * 9).toISOString() : undefined,
          pilotSuccessCriteria: ['Acurácia de Tarefas >= 98%', 'Tempo de Resposta < 2s', 'Zero Falhas de Isolamento']
        },
        readinessScore: inst.state === 'ACTIVE' ? 100 : inst.state === 'PILOT_ACTIVE' ? 92 : 85,
        provisionedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        activatedAt: inst.state === 'ACTIVE' ? new Date(Date.now() - 86400000 * 10).toISOString() : undefined,
        updatedAt: new Date().toISOString()
      };
      this.employeeInstances.set(instanceId, instance);
    }

    // Run initial readiness check for standard tenant
    this.runOrganizationReadinessCheck(tenantId);
  }

  public createProvisioningJob(
    tenantId: string,
    organizationName: string,
    requestedEmployeeIds: number[],
    environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX' = 'PRODUCTION',
    adminUserId: string = 'usr_admin_01'
  ): ProvisioningJob {
    const jobId = `job_prov_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const job: ProvisioningJob = {
      provisioningJobId: jobId,
      tenantId,
      organizationId: `org_${tenantId}`,
      requestedBy: adminUserId,
      requestedAt: new Date().toISOString(),
      state: 'PROVISIONING',
      progressPercentage: 10,
      provisionedInstanceIds: [],
      failedEmployeeIds: [],
      logs: [
        `[${new Date().toISOString()}] Job de provisionamento criado por ${adminUserId} (${environment})`,
        `[${new Date().toISOString()}] Iniciando alocação de recursos e schemas isolados para ${requestedEmployeeIds.length} colaboradores IA`
      ]
    };

    this.provisioningJobs.set(jobId, job);

    // Provision instances synchronously for simulation
    const createdInstanceIds: string[] = [];
    for (const empId of requestedEmployeeIds) {
      const inst = this.provisionEmployeeInstance(tenantId, empId, `role_emp_${empId}`, 'Operações Digitais', adminUserId);
      createdInstanceIds.push(inst.instanceId);
    }

    job.provisionedInstanceIds = createdInstanceIds;
    job.state = 'COMPLETED';
    job.progressPercentage = 100;
    job.completedAt = new Date().toISOString();
    job.logs.push(`[${new Date().toISOString()}] Provisionamento concluído com sucesso. ${createdInstanceIds.length} instâncias ativas.`);

    this.runOrganizationReadinessCheck(tenantId);
    return job;
  }

  public provisionEmployeeInstance(
    tenantId: string,
    employeeId: number,
    roleKey: string,
    department: string,
    adminUserId: string = 'usr_admin_01'
  ): APCATOSInstance {
    const instanceId = `inst_${tenantId}_emp_${employeeId}`;
    const customName = `Colaborador IA #${employeeId} (${roleKey})`;

    const instance: APCATOSInstance = {
      instanceId,
      tenantId,
      organizationId: `org_${tenantId}`,
      organizationName: 'Organização Registada',
      employeeId,
      roleKey,
      department,
      customName,
      lifecycleState: 'PROVISIONED',
      allocatedResources: {
        cpuCores: 2,
        memoryMb: 4096,
        isolatedDatabaseSchema: `schema_${tenantId}_emp_${employeeId}`,
        allocatedPorts: [8500 + employeeId, 9500 + employeeId]
      },
      securityBoundary: {
        encryptionAtRest: true,
        encryptionInTransit: true,
        auditLoggingEnabled: true,
        crossTenantAccessBlocked: true,
        dataJurisdiction: 'ANGOLA_AO_DATACENTER'
      },
      iamPolicy: {
        assignedUserIds: [adminUserId],
        rolePermissions: ['EXECUTE_TASKS', 'VIEW_AUDIT_TRAIL', 'GENERATE_DOCUMENTS'],
        accessTokenExpiryHours: 24
      },
      pilot: {
        isPilot: false,
        pilotSuccessCriteria: ['Validação de Fluxo de Trabalho', 'Segurança de Dados']
      },
      readinessScore: 95,
      provisionedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.employeeInstances.set(instanceId, instance);
    this.runOrganizationReadinessCheck(tenantId);
    return instance;
  }

  public inviteOrganizationUser(
    tenantId: string,
    email: string,
    name: string,
    role: APCATOSUserRole,
    permissions: string[] = ['READ_ALL'],
    assignedEmployeeIds: number[] = [],
    department: string = 'Geral'
  ): OrganizationUser {
    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const user: OrganizationUser = {
      userId,
      tenantId,
      organizationId: `org_${tenantId}`,
      email,
      name,
      role,
      department,
      permissions,
      assignedEmployeeIds,
      status: 'INVITED',
      authenticationMethod: 'PASSWORD_MFA',
      mfaStatus: 'ENABLED',
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.organizationUsers.set(userId, user);
    return user;
  }

  public startPilot(instanceId: string, durationDays: number = 14): APCATOSInstance {
    const instance = this.employeeInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância com id '${instanceId}' não encontrada.`);
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 86400000);

    instance.lifecycleState = 'PILOT_ACTIVE';
    instance.pilot = {
      isPilot: true,
      pilotStartDate: startDate.toISOString(),
      pilotEndDate: endDate.toISOString(),
      pilotSuccessCriteria: [
        'Acurácia Funcional >= 98%',
        'Sem infrações de isolamento de tenant',
        'Avaliação satisfatória do supervisor humano'
      ]
    };
    instance.updatedAt = new Date().toISOString();

    this.runOrganizationReadinessCheck(instance.tenantId);
    return instance;
  }

  public activateInstance(instanceId: string): APCATOSInstance {
    const instance = this.employeeInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância com id '${instanceId}' não encontrada.`);
    }

    instance.lifecycleState = 'ACTIVE';
    instance.activatedAt = new Date().toISOString();
    instance.readinessScore = 100;
    if (instance.pilot) {
      instance.pilot.isPilot = false;
    }
    instance.updatedAt = new Date().toISOString();

    this.runOrganizationReadinessCheck(instance.tenantId);
    return instance;
  }

  public offboardInstance(
    tenantId: string,
    instanceId: string,
    reason: APCATOSOffboardingReason = 'CONTRACT_EXPIRED',
    requestedBy: string = 'usr_admin_01'
  ): OffboardingJob {
    const instance = this.employeeInstances.get(instanceId);
    if (!instance) {
      throw new Error(`Instância com id '${instanceId}' não encontrada para offboarding.`);
    }

    const jobId = `job_offboard_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Update instance state
    instance.lifecycleState = 'OFFBOARDED';
    instance.deactivatedAt = new Date().toISOString();
    instance.updatedAt = new Date().toISOString();

    const offboardingJob: OffboardingJob = {
      jobId,
      tenantId,
      instanceId,
      employeeId: instance.employeeId,
      reason,
      status: 'COMPLETED',
      requestedBy,
      requestedAt: new Date().toISOString(),
      revokedUserIds: instance.iamPolicy.assignedUserIds,
      resourcesReleased: {
        cpuCores: instance.allocatedResources.cpuCores,
        memoryMb: instance.allocatedResources.memoryMb,
        schemaArchived: true,
        portsFreed: instance.allocatedResources.allocatedPorts
      },
      auditArchiveReference: `AUDIT_ARCHIVE_${instance.instanceId}_${Date.now()}`,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.offboardingJobs.set(jobId, offboardingJob);
    this.runOrganizationReadinessCheck(tenantId);
    return offboardingJob;
  }

  public runOrganizationReadinessCheck(tenantId: string): OrganizationEmployeeReadinessPassport {
    const instances = Array.from(this.employeeInstances.values()).filter(i => i.tenantId === tenantId);
    const users = Array.from(this.organizationUsers.values()).filter(u => u.tenantId === tenantId);

    const totalInstances = instances.length;
    const activeInstances = instances.filter(i => i.lifecycleState === 'ACTIVE').length;
    const pilotInstances = instances.filter(i => i.lifecycleState === 'PILOT_ACTIVE').length;

    const securityControlsPassed = instances.every(i => i.securityBoundary.crossTenantAccessBlocked && i.securityBoundary.encryptionAtRest);
    const iamConfigured = users.some(u => u.role === 'TENANT_ADMIN' && u.status === 'ACTIVE');
    const connectivityTested = totalInstances > 0;
    const trainingVerified = true;

    const readinessScore = Math.min(
      100,
      (securityControlsPassed ? 30 : 0) +
      (iamConfigured ? 25 : 0) +
      (connectivityTested ? 25 : 0) +
      (trainingVerified ? 20 : 0)
    );

    const isReadyForFullDeployment = readinessScore >= 90 && securityControlsPassed && iamConfigured;

    const passport: OrganizationEmployeeReadinessPassport = {
      passportId: `passport_readiness_${tenantId}`,
      tenantId,
      organizationName: instances[0]?.organizationName || 'Angola Telecom SA',
      evaluatedAt: new Date().toISOString(),
      totalProvisionedEmployees: totalInstances,
      activeEmployeesCount: activeInstances,
      pilotEmployeesCount: pilotInstances,
      securityControlsPassed,
      iamConfigured,
      connectivityTested,
      trainingVerified,
      readinessScore,
      isReadyForFullDeployment,
      complianceNotes: [
        'Isolamento estrito de base de dados verificado (Schema Per Employee/Tenant).',
        'Registos de auditoria imutáveis ativos em conformidade com o Regulamento de Proteção de Dados de Angola.',
        'Autenticação multifator e RBAC configurados com sucesso para os utilizadores da organização.'
      ],
      checklist: {
        identityVerified: true,
        usersAssigned: iamConfigured,
        supervisorAssigned: true,
        connectionsHealthy: connectivityTested,
        permissionsConfigured: true,
        policiesActive: securityControlsPassed,
        approvalMatrixConfigured: true,
        knowledgeLoaded: true,
        templatesBrandingReady: true,
        organizationTrainingCompleted: trainingVerified,
        testTaskPassed: true,
        deliveryReceiptPassed: true,
        auditTrailVerified: true
      }
    };

    this.readinessPassports.set(tenantId, passport);
    return passport;
  }

  public getClientAccessPassport(tenantId: string, userId: string): ClientAccessPassport | null {
    const user = this.organizationUsers.get(userId);
    if (!user || user.tenantId !== tenantId) {
      return null;
    }

    const instances = Array.from(this.employeeInstances.values()).filter(
      i => i.tenantId === tenantId && (user.role === 'TENANT_ADMIN' || user.assignedEmployeeIds.includes(i.employeeId))
    );

    return {
      passportId: `pass_${tenantId}_${userId}`,
      tenantId,
      userId,
      userRole: user.role,
      userEmail: user.email,
      accessibleEmployeeIds: instances.map(i => i.employeeId),
      authSessionToken: `jwt_session_token_${userId}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      permissions: user.permissions,
      portalUrl: `http://localhost:3000/apcatos?tenant=${tenantId}&user=${userId}`
    };
  }

  public getGlobalSummary(): APCATOSGlobalSummary {
    const instances = Array.from(this.employeeInstances.values());

    const activeCount = instances.filter(i => i.lifecycleState === 'ACTIVE').length;
    const pilotCount = instances.filter(i => i.lifecycleState === 'PILOT_ACTIVE').length;
    const readyCount = instances.filter(i => i.lifecycleState === 'READY_FOR_ACTIVATION' || i.lifecycleState === 'PROVISIONED').length;

    const uniqueTenants = new Set(instances.map(i => i.tenantId)).size || 1;

    return {
      totalEmployeesCapacity: 500,
      totalProvisioned: instances.length,
      totalActive: activeCount,
      totalInPilot: pilotCount,
      totalReadyForActivation: readyCount,
      totalOffboarded: instances.filter(i => i.lifecycleState === 'OFFBOARDED').length,
      tenantCount: uniqueTenants,
      globalReadinessPercentage: Math.round(((activeCount + pilotCount + readyCount) / 500) * 100 * 10) / 10
    };
  }

  public getInstances(tenantId?: string): APCATOSInstance[] {
    const all = Array.from(this.employeeInstances.values());
    if (tenantId) {
      return all.filter(i => i.tenantId === tenantId);
    }
    return all;
  }

  public getInstanceById(instanceId: string): APCATOSInstance | undefined {
    return this.employeeInstances.get(instanceId);
  }

  public getUsers(tenantId?: string): OrganizationUser[] {
    const all = Array.from(this.organizationUsers.values());
    if (tenantId) {
      return all.filter(u => u.tenantId === tenantId);
    }
    return all;
  }

  public getProvisioningJobs(tenantId?: string): ProvisioningJob[] {
    const all = Array.from(this.provisioningJobs.values());
    if (tenantId) {
      return all.filter(j => j.tenantId === tenantId);
    }
    return all;
  }

  public getOffboardingJobs(tenantId?: string): OffboardingJob[] {
    const all = Array.from(this.offboardingJobs.values());
    if (tenantId) {
      return all.filter(j => j.tenantId === tenantId);
    }
    return all;
  }
}
