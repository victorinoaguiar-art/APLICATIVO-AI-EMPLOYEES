import {
  OrganizationProvisioningProfile,
  EnterpriseConnectorConfig,
  EnterpriseConnectorType,
  OperationalState
} from '@ai-employee/shared';
import { PlatformCertificationEngine } from './PlatformCertificationEngine.js';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';

export class OrganizationProvisioningEngine {
  private static instance: OrganizationProvisioningEngine;
  private certificationEngine: PlatformCertificationEngine;
  private organizationsMap: Map<string, OrganizationProvisioningProfile> = new Map();

  private constructor() {
    this.certificationEngine = PlatformCertificationEngine.getInstance();
    this.seedDefaultOrganization();
  }

  public static getInstance(): OrganizationProvisioningEngine {
    if (!OrganizationProvisioningEngine.instance) {
      OrganizationProvisioningEngine.instance = new OrganizationProvisioningEngine();
    }
    return OrganizationProvisioningEngine.instance;
  }

  private seedDefaultOrganization(): void {
    const defaultConnectors: EnterpriseConnectorConfig[] = [
      {
        connectorId: 'conn_prim_01',
        connectorType: 'PRIMAVERA_ERP',
        name: 'Primavera ERP V10 (Angola Local Instance)',
        connectionStringRef: 'env:PRIMAVERA_CONNECTION_STRING',
        isOutboundOnly: true,
        tlsEnabled: true,
        status: 'CONNECTED'
      },
      {
        connectorId: 'conn_sql_01',
        connectorType: 'SQL_SERVER',
        name: 'Microsoft SQL Server Enterprise Data Warehouse',
        connectionStringRef: 'env:MSSQL_CONNECTION_STRING',
        isOutboundOnly: true,
        tlsEnabled: true,
        status: 'CONNECTED'
      },
      {
        connectorId: 'conn_excel_01',
        connectorType: 'LOCAL_EXCEL_ODATA',
        name: 'PowerQuery OData Feed (OneDrive / SharePoint Sync)',
        connectionStringRef: 'env:EXCEL_ODATA_FEED_URL',
        isOutboundOnly: true,
        tlsEnabled: true,
        status: 'CONNECTED'
      },
      {
        connectorId: 'conn_agt_01',
        connectorType: 'AGT_TAX_PORTAL',
        name: 'Portal AGT (Submissão IVA / IRT / Imposto Industrial)',
        connectionStringRef: 'env:AGT_PORTAL_GATEWAY_URL',
        isOutboundOnly: true,
        tlsEnabled: true,
        status: 'CONNECTED'
      }
    ];

    const profile: OrganizationProvisioningProfile = {
      organizationId: 'tenant_enterprise_001',
      organizationName: 'Grupo Empresarial Angola Lda',
      tenantId: 'tenant_enterprise_001',
      country: 'Angola',
      jurisdictionCode: 'AO_ANGOLA',
      configuredConnectors: defaultConnectors,
      assignedEmployees: [],
      provisionedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.organizationsMap.set(profile.organizationId, profile);
  }

  public provisionOrganization(
    organizationId: string,
    organizationName: string,
    country: string = 'Angola',
    connectors: EnterpriseConnectorConfig[] = []
  ): OrganizationProvisioningProfile {
    const profile: OrganizationProvisioningProfile = {
      organizationId,
      organizationName,
      tenantId: organizationId,
      country,
      jurisdictionCode: country.toLowerCase().includes('angola') ? 'AO_ANGOLA' : 'GLOBAL',
      configuredConnectors: connectors,
      assignedEmployees: [],
      provisionedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.organizationsMap.set(organizationId, profile);
    return profile;
  }

  public activateEmployeeForOrganization(
    organizationId: string,
    employeeId: number
  ): { success: boolean; state: OperationalState; message: string } {
    const org = this.organizationsMap.get(organizationId);
    if (!org) {
      throw new Error(`Organização '${organizationId}' não encontrada para aprovisionamento.`);
    }

    const hasCert = this.certificationEngine.hasValidCertificate(employeeId);

    // DENY RULE: IF certification missing THEN ACTIVE = DENIED
    if (!hasCert) {
      return {
        success: false,
        state: 'BLOCKED',
        message: `[DENY RULE TRIGGERED] Ativação recusada para o Empregado IA #${employeeId}: Certificado de Plataforma ausente (PLATFORM_CERTIFIED = FALSE).`
      };
    }

    const role = CANONICAL_500_ROLES.find((r) => r.id === employeeId) || CANONICAL_500_ROLES[0];

    const existingIndex = org.assignedEmployees.findIndex((e) => e.employeeId === employeeId);
    const assignedEntry = {
      employeeId,
      roleKey: role.role_key,
      operationalState: 'ACTIVE' as OperationalState,
      hasCertificate: true,
      activeInProduction: true
    };

    if (existingIndex >= 0) {
      org.assignedEmployees[existingIndex] = assignedEntry;
    } else {
      org.assignedEmployees.push(assignedEntry);
    }

    org.updatedAt = new Date().toISOString();

    return {
      success: true,
      state: 'ACTIVE',
      message: `Empregado IA #${employeeId} (${role.display_name}) ativado com sucesso na organização ${org.organizationName} (Estado: ACTIVE).`
    };
  }

  public getOrganizationProfile(organizationId: string): OrganizationProvisioningProfile | undefined {
    return this.organizationsMap.get(organizationId);
  }
}
