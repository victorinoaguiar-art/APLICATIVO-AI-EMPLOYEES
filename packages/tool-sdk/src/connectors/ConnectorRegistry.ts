/**
 * AI Employee Platform — Central Connector Registry & Taxonomy Engine
 * Complies strictly with AETF-500 Master Forensic Prompt Section 14 (Fase 11).
 */

export type ConnectorClassification =
  | 'REAL_PRODUCTION_CONNECTOR'
  | 'REAL_SANDBOX_CONNECTOR'
  | 'AUTHORIZED_PILOT_CONNECTOR'
  | 'CONNECTOR_EMULATOR'
  | 'CONTROLLED_SIMULATION'
  | 'GENERIC_MOCK'
  | 'NOT_CONFIGURED';

export interface ConnectorDescriptor {
  connectorId: string;
  provider: string;
  name: string;
  classification: ConnectorClassification;
  supportedEnvironments: Array<'production' | 'sandbox' | 'staging' | 'development' | 'test'>;
  capabilities: string[];
  hasAuth: boolean;
  tenantId?: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'BLOCKED';
  writeAccessAllowed: boolean;
  lastVerifiedAt?: string;
  notes?: string;
}

export interface ConnectorExecutionCheckResult {
  allowed: boolean;
  reason?: string;
  classification: ConnectorClassification;
  errorCode?: string;
}

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private registry: Map<string, ConnectorDescriptor> = new Map();

  private constructor() {
    this.seedCanonicalConnectors();
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  private seedCanonicalConnectors(): void {
    // 1. Google Gmail Mock
    this.register({
      connectorId: 'T.COMM.GMAIL.MOCK',
      provider: 'Google',
      name: 'Google Gmail Connector (Mock)',
      classification: 'GENERIC_MOCK',
      supportedEnvironments: ['development', 'test', 'sandbox'],
      capabilities: ['CAP.EMAIL_OPERATIONS'],
      hasAuth: false,
      healthStatus: 'HEALTHY',
      writeAccessAllowed: false,
      notes: 'Mock connector for automated testing only. Strictly blocked in production.'
    });

    // 2. Google Gmail Real
    this.register({
      connectorId: 'T.COMM.GMAIL.REAL',
      provider: 'Google',
      name: 'Google Gmail Connector (Real)',
      classification: process.env.GMAIL_OAUTH_TOKEN ? 'REAL_PRODUCTION_CONNECTOR' : 'NOT_CONFIGURED',
      supportedEnvironments: ['production', 'staging', 'sandbox'],
      capabilities: ['CAP.EMAIL_OPERATIONS'],
      hasAuth: Boolean(process.env.GMAIL_OAUTH_TOKEN),
      healthStatus: process.env.GMAIL_OAUTH_TOKEN ? 'HEALTHY' : 'UNAVAILABLE',
      writeAccessAllowed: true,
      lastVerifiedAt: process.env.GMAIL_OAUTH_TOKEN ? new Date().toISOString() : undefined
    });

    // 3. Primavera ERP (Strictly blocked write and import per forensic prompt)
    this.register({
      connectorId: 'T.ERP.PRIMAVERA.V10',
      provider: 'Primavera',
      name: 'Primavera ERP Connector v10 (Read Only / Blocked Writes)',
      classification: 'CONTROLLED_SIMULATION',
      supportedEnvironments: ['sandbox', 'staging'],
      capabilities: ['CAP.ERP_INSPECTION'],
      hasAuth: false,
      healthStatus: 'BLOCKED',
      writeAccessAllowed: false,
      notes: 'PRIMAVERA_WRITE = BLOCKED & PRIMAVERA_IMPORT = BLOCKED until certified connector & pilot environment.'
    });

    // 4. Microsoft Outlook Real / Mock
    this.register({
      connectorId: 'T.COMM.OUTLOOK.MOCK',
      provider: 'Microsoft',
      name: 'Microsoft Outlook Connector (Mock)',
      classification: 'GENERIC_MOCK',
      supportedEnvironments: ['development', 'test'],
      capabilities: ['CAP.EMAIL_OPERATIONS'],
      hasAuth: false,
      healthStatus: 'HEALTHY',
      writeAccessAllowed: false
    });

    // 5. WhatsApp Business API
    this.register({
      connectorId: 'T.COMM.WHATSAPP.CLOUD',
      provider: 'Meta',
      name: 'WhatsApp Cloud API Connector',
      classification: process.env.WHATSAPP_TOKEN ? 'REAL_SANDBOX_CONNECTOR' : 'NOT_CONFIGURED',
      supportedEnvironments: ['sandbox', 'production'],
      capabilities: ['CAP.WHATSAPP_MESSAGING'],
      hasAuth: Boolean(process.env.WHATSAPP_TOKEN),
      healthStatus: process.env.WHATSAPP_TOKEN ? 'HEALTHY' : 'UNAVAILABLE',
      writeAccessAllowed: Boolean(process.env.WHATSAPP_TOKEN)
    });
  }

  public register(descriptor: ConnectorDescriptor): void {
    this.registry.set(descriptor.connectorId, descriptor);
  }

  public getConnector(connectorId: string): ConnectorDescriptor | undefined {
    return this.registry.get(connectorId);
  }

  public getAllConnectors(): ConnectorDescriptor[] {
    return Array.from(this.registry.values());
  }

  /**
   * Evaluates whether a connector is authorized to execute in the target environment.
   * Enforces: PRODUCTION + MOCK CONNECTOR = BLOCKED.
   * Enforces: PRIMAVERA_WRITE = BLOCKED.
   */
  public evaluateExecutionGate(
    connectorId: string,
    environment: 'production' | 'sandbox' | 'staging' | 'development' | 'test',
    isWriteOperation: boolean = false
  ): ConnectorExecutionCheckResult {
    const connector = this.registry.get(connectorId);
    if (!connector) {
      return {
        allowed: false,
        classification: 'NOT_CONFIGURED',
        errorCode: 'CONNECTOR_NOT_FOUND',
        reason: `Connector '${connectorId}' is not registered.`
      };
    }

    // Rule 1: Production + Generic Mock = BLOCKED
    if (environment === 'production' && (connector.classification === 'GENERIC_MOCK' || connector.classification === 'CONTROLLED_SIMULATION')) {
      return {
        allowed: false,
        classification: connector.classification,
        errorCode: 'MOCK_CONNECTOR_BLOCKED_IN_PRODUCTION',
        reason: `MOCK connector '${connectorId}' (${connector.classification}) is strictly blocked in production environment.`
      };
    }

    // Rule 2: Primavera Write/Import = BLOCKED
    if (connector.connectorId.includes('PRIMAVERA') && isWriteOperation) {
      return {
        allowed: false,
        classification: connector.classification,
        errorCode: 'PRIMAVERA_WRITE_BLOCKED',
        reason: 'PRIMAVERA_WRITE and PRIMAVERA_IMPORT are strictly blocked until external pilot validation.'
      };
    }

    // Rule 3: Write operation without write access permission
    if (isWriteOperation && !connector.writeAccessAllowed) {
      return {
        allowed: false,
        classification: connector.classification,
        errorCode: 'WRITE_ACCESS_DENIED',
        reason: `Write access is denied on connector '${connectorId}'.`
      };
    }

    // Rule 4: Check supported environments
    if (!connector.supportedEnvironments.includes(environment)) {
      return {
        allowed: false,
        classification: connector.classification,
        errorCode: 'UNSUPPORTED_ENVIRONMENT',
        reason: `Connector '${connectorId}' does not support environment '${environment}'.`
      };
    }

    return {
      allowed: true,
      classification: connector.classification
    };
  }
}
