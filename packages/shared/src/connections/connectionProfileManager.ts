import { ConnectionProfile, InputBinding, OutputRoute } from '../types/index.js';

export class ConnectionProfileManager {
  private static instance: ConnectionProfileManager | null = null;
  private connections: Map<string, ConnectionProfile> = new Map();
  private inputBindings: Map<string, InputBinding> = new Map();
  private outputRoutes: Map<string, OutputRoute> = new Map();

  private constructor() {
    this.seedDefaultConnections();
  }

  public static getInstance(): ConnectionProfileManager {
    if (!ConnectionProfileManager.instance) {
      ConnectionProfileManager.instance = new ConnectionProfileManager();
    }
    return ConnectionProfileManager.instance;
  }

  private seedDefaultConnections() {
    const defaults: ConnectionProfile[] = [
      {
        id: 'conn_sap_erp_01',
        organizationId: 'tenant_default',
        name: 'SAP S/4HANA Finance & ERP',
        systemType: 'ERP',
        provider: 'SAP',
        status: 'CONNECTED',
        authType: 'OAUTH2',
        scopes: ['finance.read', 'journal.write', 'purchasing.read'],
        lastSyncedAt: new Date(Date.now() - 300000).toISOString(),
        health: 'HEALTHY',
        deepLinkPattern: 'https://sap.enterprise.internal/gui/sap/its/webgui?~transaction=FB03&BELNR={record_id}'
      },
      {
        id: 'conn_hubspot_crm_02',
        organizationId: 'tenant_default',
        name: 'HubSpot CRM Enterprise',
        systemType: 'CRM',
        provider: 'HubSpot',
        status: 'CONNECTED',
        authType: 'API_KEY',
        scopes: ['crm.contacts.read', 'crm.deals.read', 'crm.deals.write'],
        lastSyncedAt: new Date(Date.now() - 600000).toISOString(),
        health: 'HEALTHY',
        deepLinkPattern: 'https://app.hubspot.com/contacts/1049281/deal/{record_id}'
      },
      {
        id: 'conn_powerbi_03',
        organizationId: 'tenant_default',
        name: 'Power BI & Fabric Warehouse',
        systemType: 'BI',
        provider: 'Microsoft',
        status: 'CONNECTED',
        authType: 'OAUTH2',
        scopes: ['Dataset.Read.All', 'Report.Read.All'],
        lastSyncedAt: new Date(Date.now() - 1200000).toISOString(),
        health: 'HEALTHY',
        deepLinkPattern: 'https://app.powerbi.com/groups/me/reports/{record_id}'
      },
      {
        id: 'conn_postgres_db_04',
        organizationId: 'tenant_default',
        name: 'PostgreSQL Operational Lakehouse',
        systemType: 'DATABASE',
        provider: 'PostgreSQL',
        status: 'CONNECTED',
        authType: 'GATEWAY_AGENT',
        scopes: ['analytics.read_only'],
        lastSyncedAt: new Date(Date.now() - 180000).toISOString(),
        health: 'HEALTHY'
      },
      {
        id: 'conn_excel_online_05',
        organizationId: 'tenant_default',
        name: 'SharePoint & Excel Online Workbooks',
        systemType: 'SPREADSHEET',
        provider: 'Microsoft 365',
        status: 'CONNECTED',
        authType: 'OAUTH2',
        scopes: ['Files.ReadWrite.All'],
        lastSyncedAt: new Date(Date.now() - 90000).toISOString(),
        health: 'HEALTHY',
        deepLinkPattern: 'https://m365.sharepoint.com/:x:/r/docs/{record_id}'
      }
    ];

    for (const c of defaults) {
      this.connections.set(c.id, c);
    }
  }

  public getConnections(): ConnectionProfile[] {
    return Array.from(this.connections.values());
  }

  public getConnection(id: string): ConnectionProfile | undefined {
    return this.connections.get(id);
  }

  public generateSourceDeepLink(connectionId: string, recordId: string): string {
    const conn = this.getConnection(connectionId);
    if (conn && conn.deepLinkPattern && recordId) {
      return conn.deepLinkPattern.replace('{record_id}', recordId);
    }
    return `https://${conn?.provider.toLowerCase() || 'system'}.internal/records/${recordId}`;
  }
}
