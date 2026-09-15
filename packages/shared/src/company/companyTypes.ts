export type CompanyLifecycleState =
  | 'DRAFT'
  | 'CREATED'
  | 'IDENTITY_PENDING'
  | 'PROVISIONING'
  | 'READY_FOR_CONFIGURATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'OFFBOARDING'
  | 'CLOSED';

export type InstanceActivationGateState =
  | 'HIRED'
  | 'PROVISIONING'
  | 'COMPANY_BOUND'
  | 'DEPARTMENT_BOUND'
  | 'KNOWLEDGE_BOUND'
  | 'PERMISSIONS_CONFIGURED'
  | 'CONNECTORS_CONFIGURED'
  | 'READINESS_TEST'
  | 'READY'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export interface CompanyIdentification {
  legalName: string;
  tradeName?: string;
  nif: string;
  legalForm: string;
  registrationNumber?: string;
}

export interface CompanyLocation {
  country: string;
  provinceState: string;
  city: string;
  address: string;
  primaryJurisdiction: string;
}

export interface CompanyActivity {
  sector: string;
  primaryActivity: string;
  secondaryActivities?: string[];
  companySize: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
}

export interface CompanyContacts {
  email: string;
  phone: string;
  website?: string;
}

export interface CompanyPrincipalResponsible {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface CompanyOperationalConfig {
  language: string;
  currency: string;
  timeZone: string;
  fiscalCountry: string;
  laborCountry: string;
  primaryRegulatoryCountry: string;
}

export interface CompanyProfile {
  companyId: string; // CMP-xxxxxx
  tenantId: string;  // TNT-xxxxxx
  identification: CompanyIdentification;
  location: CompanyLocation;
  activity: CompanyActivity;
  contacts: CompanyContacts;
  principalResponsible: CompanyPrincipalResponsible;
  operationalConfig: CompanyOperationalConfig;
  lifecycleState: CompanyLifecycleState;
  defaultCountryPackId: string; // e.g. AETF-COUNTRY-AO
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMembership {
  membershipId: string;
  companyId: string;
  tenantId: string;
  userId: string;
  role: 'TENANT_ADMIN' | 'DEPARTMENT_MANAGER' | 'STANDARD_OPERATOR' | 'AUDITOR_VIEWER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
}

export interface Department {
  departmentId: string;
  companyId: string;
  tenantId: string;
  name: string;
  managerUserId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  costCenter?: string;
  createdAt: string;
}

export interface CompanyEmployeeInstance {
  instanceId: string; // AEI-xxxxxx
  companyId: string; // CMP-xxxxxx
  tenantId: string;  // TNT-xxxxxx
  catalogEmployeeId: number; // e.g. 1-500
  displayName: string;
  roleKey: string;
  departmentId: string;
  managerUserId?: string;
  subscriptionId?: string;
  planId?: string;
  countryPackId: string;
  sectorPackId?: string;
  clientPolicyPackId: string; // CPP-CMP-xxxxxx
  autonomyLevel: string;
  riskLevel: string;
  gateState: InstanceActivationGateState;
  status:
    | 'HIRED'
    | 'PROVISIONING'
    | 'COMPANY_BOUND'
    | 'DEPARTMENT_BOUND'
    | 'PERMISSIONS_CONFIGURED'
    | 'KNOWLEDGE_BOUND'
    | 'CONNECTORS_CONFIGURED'
    | 'READINESS_TEST'
    | 'READY'
    | 'ACTIVE'
    | 'PAUSED'
    | 'PILOT'
    | 'BLOCKED'
    | 'SUSPENDED'
    | 'OFFBOARDED'
    | 'DEACTIVATED'
    | 'ERROR';
  readinessChecks?: Record<string, boolean>;
  createdAt: string;
  activatedAt?: string;
  suspendedAt?: string;
  deactivatedAt?: string;
}

export interface ClientPolicyPack {
  cppId: string; // CPP-CMP-xxxxxx
  companyId: string;
  tenantId: string;
  internalPolicies: string[];
  procedures: string[];
  chartOfAccounts?: string;
  organizationChart?: string;
  documentTemplates?: string[];
  approvalLimits?: Record<string, number>;
  financialPolicies?: string[];
  standardContracts?: string[];
  internalRules?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyAuditEvent {
  eventId: string;
  timestamp: string;
  actor: string;
  companyId: string;
  tenantId: string;
  resourceId: string;
  action:
    | 'company_created'
    | 'tenant_created'
    | 'user_added'
    | 'membership_created'
    | 'department_created'
    | 'employee_selected'
    | 'employee_hiring_started'
    | 'employee_hired'
    | 'employee_instance_created'
    | 'employee_company_bound'
    | 'employee_tenant_bound'
    | 'employee_department_bound'
    | 'employee_permissions_configured'
    | 'employee_knowledge_bound'
    | 'employee_connectors_configured'
    | 'employee_readiness_passed'
    | 'permissions_assigned'
    | 'connector_granted'
    | 'knowledge_bound'
    | 'employee_activated'
    | 'employee_suspended'
    | 'employee_deactivated'
    | 'employee_removed';
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: string;
}
