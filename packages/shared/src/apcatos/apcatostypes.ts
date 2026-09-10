export type ProvisioningJobState =
  | 'REQUESTED'
  | 'VALIDATING'
  | 'PROVISIONING'
  | 'CONFIGURING'
  | 'READY_FOR_PILOT'
  | 'PILOTING'
  | 'ORGANIZATION_READY'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'FAILED';

export interface ProvisioningJob {
  provisioningJobId: string;
  organizationId: string;
  tenantId: string;
  roleId?: number;
  roleKey?: string;
  subscriptionId?: string;
  planId?: string;
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  state: ProvisioningJobState;
  progressPercentage: number;
  idempotencyKey?: string;
  instanceId?: string;
  provisionedInstanceIds?: string[];
  failedEmployeeIds?: number[];
  failureReason?: string;
  logs: string[];
}

export type APCATOSInstanceLifecycleState =
  | 'PROVISIONING'
  | 'PROVISIONED'
  | 'READY_FOR_ACTIVATION'
  | 'PILOT_ACTIVE'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'OFFBOARDED';

export interface APCATOSInstance {
  instanceId: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  employeeId: number;
  roleKey: string;
  department: string;
  customName: string;
  lifecycleState: APCATOSInstanceLifecycleState;
  allocatedResources: {
    cpuCores: number;
    memoryMb: number;
    isolatedDatabaseSchema: string;
    allocatedPorts: number[];
  };
  securityBoundary: {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    auditLoggingEnabled: boolean;
    crossTenantAccessBlocked: boolean;
    dataJurisdiction: string;
  };
  iamPolicy: {
    assignedUserIds: string[];
    rolePermissions: string[];
    accessTokenExpiryHours: number;
  };
  pilot?: {
    isPilot: boolean;
    pilotStartDate?: string;
    pilotEndDate?: string;
    pilotSuccessCriteria: string[];
  };
  readinessScore: number;
  provisionedAt: string;
  activatedAt?: string;
  suspendedAt?: string;
  deactivatedAt?: string;
  updatedAt: string;
}

export type APCATOSUserRole =
  | 'TENANT_ADMIN'
  | 'IT_ADMIN'
  | 'DEPARTMENT_MANAGER'
  | 'EMPLOYEE_SUPERVISOR'
  | 'STANDARD_OPERATOR'
  | 'AUDITOR_VIEWER';

export interface OrganizationUser {
  userId: string;
  tenantId: string;
  organizationId: string;
  email: string;
  name: string;
  role: APCATOSUserRole;
  department: string;
  permissions: string[];
  assignedEmployeeIds: number[];
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  authenticationMethod: string;
  mfaStatus: string;
  invitedAt: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface ClientAccessPassport {
  passportId: string;
  tenantId: string;
  userId: string;
  userRole: string;
  userEmail: string;
  accessibleEmployeeIds: number[];
  authSessionToken: string;
  expiresAt: string;
  permissions: string[];
  portalUrl: string;
}

export interface InstanceReadinessChecklist {
  identityVerified: boolean;
  usersAssigned: boolean;
  supervisorAssigned: boolean;
  connectionsHealthy: boolean;
  permissionsConfigured: boolean;
  policiesActive: boolean;
  approvalMatrixConfigured: boolean;
  knowledgeLoaded: boolean;
  templatesBrandingReady: boolean;
  organizationTrainingCompleted: boolean;
  testTaskPassed: boolean;
  deliveryReceiptPassed: boolean;
  auditTrailVerified: boolean;
}

export interface OrganizationEmployeeReadinessPassport {
  passportId: string;
  tenantId: string;
  organizationName: string;
  evaluatedAt: string;
  totalProvisionedEmployees: number;
  activeEmployeesCount: number;
  pilotEmployeesCount: number;
  securityControlsPassed: boolean;
  iamConfigured: boolean;
  connectivityTested: boolean;
  trainingVerified: boolean;
  readinessScore: number;
  isReadyForFullDeployment: boolean;
  complianceNotes: string[];
  checklist?: InstanceReadinessChecklist;
}

export type APCATOSOffboardingReason =
  | 'CONTRACT_EXPIRED'
  | 'CLIENT_REQUEST'
  | 'SECURITY_SUSPENSION'
  | 'ROLE_RETIRED'
  | 'MIGRATION';

export interface OffboardingJob {
  jobId: string;
  tenantId: string;
  instanceId: string;
  employeeId: number;
  reason: APCATOSOffboardingReason;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  revokedUserIds: string[];
  resourcesReleased: {
    cpuCores: number;
    memoryMb: number;
    schemaArchived: boolean;
    portsFreed: number[];
  };
  auditArchiveReference: string;
  createdAt?: string;
}

export interface APCATOSGlobalSummary {
  totalEmployeesCapacity: number;
  totalProvisioned: number;
  totalActive: number;
  totalInPilot: number;
  totalReadyForActivation: number;
  totalOffboarded: number;
  tenantCount: number;
  globalReadinessPercentage: number;
}
