export type OperationalState =
  | 'REGISTERED'
  | 'SPECIFIED'
  | 'IMPLEMENTED'
  | 'KNOWLEDGE_PREPARED'
  | 'INTEGRATION_MAPPED'
  | 'TESTS_DEFINED'
  | 'STRUCTURALLY_READY'
  | 'READY_FOR_TEST'
  | 'IN_TESTING'
  | 'CONNECTED'
  | 'FUNCTIONAL_TESTED'
  | 'E2E_TESTED'
  | 'SHADOW_MODE'
  | 'SHADOW_VALIDATED'
  | 'HUMAN_BENCHMARKED'
  | 'SECURITY_VALIDATED'
  | 'PLATFORM_CERTIFIED'
  | 'ORGANIZATION_CONFIGURING'
  | 'ORGANIZATION_READY'
  | 'ACTIVE'
  | 'NEEDS_IMPROVEMENT'
  | 'WAITING_DATA'
  | 'WAITING_CONNECTION'
  | 'WAITING_APPROVAL'
  | 'BLOCKED'
  | 'DEGRADED'
  | 'SUSPENDED'
  | 'DEPRECATED';

export interface PlatformCertificate {
  certificateId: string;
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  evaluationScore: number;
  redTeamVulnerabilities: number;
  gateSuitePassed: boolean;
  issuedAt: string;
  validUntil: string;
  signatureHash: string;
  issuer: string;
}

export type EnterpriseConnectorType =
  | 'PRIMAVERA_ERP'
  | 'SQL_SERVER'
  | 'POSTGRESQL'
  | 'LOCAL_EXCEL_ODATA'
  | 'NETWORK_SHARE_DMS'
  | 'AGT_TAX_PORTAL';

export interface EnterpriseConnectorConfig {
  connectorId: string;
  connectorType: EnterpriseConnectorType;
  name: string;
  connectionStringRef: string;
  isOutboundOnly: boolean;
  tlsEnabled: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export interface OrganizationProvisioningProfile {
  organizationId: string;
  organizationName: string;
  tenantId: string;
  country: string;
  jurisdictionCode: string;
  configuredConnectors: EnterpriseConnectorConfig[];
  assignedEmployees: {
    employeeId: number;
    roleKey: string;
    operationalState: OperationalState;
    hasCertificate: boolean;
    activeInProduction: boolean;
  }[];
  provisionedAt: string;
  updatedAt: string;
}

export interface ExtendedReadinessPassport {
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  operationalState: OperationalState;
  architecturePassed: boolean;
  knowledgePassed: boolean;
  governancePassed: boolean;
  implementationPassed: boolean;
  testingPassed: boolean;
  certificate?: PlatformCertificate;
  organizationConfigured: boolean;
  activeInProduction: boolean;
  lastAuditAt: string;
}
