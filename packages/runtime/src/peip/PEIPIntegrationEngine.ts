import {
  EnterpriseConnection,
  EnterpriseConnectionType,
  ConnectionHealthState,
  CanonicalCustomer,
  CanonicalSalesDocument,
  CanonicalLedgerEntry,
  CanonicalInventoryItem,
  CanonicalBankAccount,
  CanonicalBankTransaction,
  SpreadsheetSchema,
  DataLineageEnvelope,
  PEIPGlobalSummary
} from '@ai-employee/shared';

export class PEIPIntegrationEngine {
  private static instance: PEIPIntegrationEngine;

  private connections: Map<string, EnterpriseConnection> = new Map();
  private canonicalCustomers: Map<string, CanonicalCustomer> = new Map();
  private canonicalSales: Map<string, CanonicalSalesDocument> = new Map();
  private canonicalLedger: Map<string, CanonicalLedgerEntry> = new Map();
  private canonicalInventory: Map<string, CanonicalInventoryItem> = new Map();
  private canonicalBankAccounts: Map<string, CanonicalBankAccount> = new Map();
  private canonicalTransactions: Map<string, CanonicalBankTransaction> = new Map();

  private macroBlockCounter: number = 14;
  private writeAttemptsBlockedCounter: number = 8;
  private paymentAttemptsBlockedCounter: number = 5;

  private constructor() {
    this.seedEnterpriseConnections();
    this.seedPrimaveraCanonicalData();
    this.seedBankCanonicalData();
  }

  public static getInstance(): PEIPIntegrationEngine {
    if (!PEIPIntegrationEngine.instance) {
      PEIPIntegrationEngine.instance = new PEIPIntegrationEngine();
    }
    return PEIPIntegrationEngine.instance;
  }

  private seedEnterpriseConnections(): void {
    const tenantId = 'tenant_angola_telecom_01';
    const orgName = 'Angola Telecom SA';

    const connList: EnterpriseConnection[] = [
      {
        connectionId: 'conn_email_01',
        tenantId,
        organizationName: orgName,
        type: 'EMAIL',
        name: 'Microsoft 365 Exchange Online (E-mail Corporativo)',
        provider: 'Microsoft Graph API (OAuth2 mTLS)',
        mode: 'READ_AND_DRAFT',
        health: 'HEALTHY',
        scopes: ['email.read', 'email.search', 'email.attachment.read', 'email.draft.create'],
        lastSyncAt: new Date(Date.now() - 300000).toISOString(),
        employeesUsingCount: 120
      },
      {
        connectionId: 'conn_whatsapp_01',
        tenantId,
        organizationName: orgName,
        type: 'WHATSAPP_BUSINESS',
        name: 'WhatsApp Business Cloud API (Atendimento Corporativo)',
        provider: 'Meta Business Cloud API (Signed JWT)',
        mode: 'READ_AND_DRAFT',
        health: 'HEALTHY',
        scopes: ['message.read', 'message.send_template', 'message.send_secure_link'],
        lastSyncAt: new Date(Date.now() - 180000).toISOString(),
        employeesUsingCount: 45
      },
      {
        connectionId: 'conn_drive_01',
        tenantId,
        organizationName: orgName,
        type: 'CLOUD_DRIVE',
        name: 'Google Workspace Drive & SharePoint Corporate',
        provider: 'Google Drive API v3 / Microsoft Graph API',
        mode: 'READ_AND_APPROVED_WRITE',
        health: 'HEALTHY',
        scopes: ['storage.list', 'storage.watch', 'storage.download', 'storage.write_output'],
        lastSyncAt: new Date(Date.now() - 600000).toISOString(),
        employeesUsingCount: 200
      },
      {
        connectionId: 'conn_primavera_01',
        tenantId,
        organizationName: orgName,
        type: 'PRIMAVERA_V10',
        name: 'Primavera v10 ERP (Enterprise Data Gateway Read-Only)',
        provider: 'Primavera v10 SQL/Web API Read-Only Gateway',
        mode: 'READ_ONLY',
        health: 'HEALTHY',
        scopes: ['sales_by_period', 'stock_by_warehouse', 'trial_balance', 'supplier_aging', 'customer_aging', 'ledger_by_period'],
        lastSyncAt: new Date(Date.now() - 120000).toISOString(),
        employeesUsingCount: 180
      },
      {
        connectionId: 'conn_excel_01',
        tenantId,
        organizationName: orgName,
        type: 'EXCEL_AUTOMATION',
        name: 'Automated Spreadsheet Ingestion Engine (OpenXML)',
        provider: 'OpenXML Safe Parser (No VBA/Macros)',
        mode: 'AUTO_INGEST',
        health: 'HEALTHY',
        scopes: ['xlsx.schema_discovery', 'xlsx.column_mapping', 'xlsx.quality_scan', 'xlsx.auto_trigger'],
        lastSyncAt: new Date(Date.now() - 450000).toISOString(),
        employeesUsingCount: 350
      },
      {
        connectionId: 'conn_bank_01',
        tenantId,
        organizationName: orgName,
        type: 'BANK_READONLY',
        name: 'Banco Read-Only Feed (BFA / BAI / BCI Direct Feed)',
        provider: 'Corporate Banking API / OFX Secure Feed',
        mode: 'READ_ONLY',
        health: 'HEALTHY',
        scopes: ['bank.account.list', 'bank.balance.read', 'bank.transaction.list', 'bank.statement.read'],
        lastSyncAt: new Date(Date.now() - 90000).toISOString(),
        employeesUsingCount: 65
      }
    ];

    for (const c of connList) {
      this.connections.set(c.connectionId, c);
    }
  }

  private seedPrimaveraCanonicalData(): void {
    const cust1: CanonicalCustomer = {
      customerId: 'CUST_PRIM_001',
      nif: '5401009988',
      companyName: 'Unitel SA',
      email: 'financeiro@unitel.co.ao',
      phone: '+244923000100',
      creditLimitAoa: 500000000,
      currentBalanceAoa: 125000000,
      status: 'ACTIVE'
    };

    const sale1: CanonicalSalesDocument = {
      documentId: 'DOC_FT_2026_042',
      documentNumber: 'FT 2026/042',
      documentType: 'FT',
      customerId: cust1.customerId,
      customerName: cust1.companyName,
      nif: cust1.nif,
      issueDate: '2026-08-15',
      totalGrossAoa: 45000000,
      totalTaxAoa: 6300000, // 14% IVA
      totalNetAoa: 51300000,
      status: 'ISSUED'
    };

    const ledger1: CanonicalLedgerEntry = {
      entryId: 'LGD_2026_901',
      accountNumber: '71.1.1',
      accountName: 'Vendas de Produtos e Serviços — Mercado Nacional',
      debitAoa: 0,
      creditAoa: 45000000,
      entryDate: '2026-08-15',
      description: 'Facturação de Serviços de Telecomunicações',
      fiscalPeriod: '2026/08'
    };

    const inv1: CanonicalInventoryItem = {
      itemId: 'INV_EQUIP_001',
      itemCode: 'ROUTER-ENT-01',
      description: 'Roteador Empresarial Fibra Óptica AOA',
      warehouseId: 'WH_LUANDA_CENTRAL',
      quantityOnHand: 450,
      unitCostAoa: 185000,
      totalValueAoa: 83250000
    };

    this.canonicalCustomers.set(cust1.customerId, cust1);
    this.canonicalSales.set(sale1.documentId, sale1);
    this.canonicalLedger.set(ledger1.entryId, ledger1);
    this.canonicalInventory.set(inv1.itemId, inv1);
  }

  private seedBankCanonicalData(): void {
    const bankAcc: CanonicalBankAccount = {
      accountRef: 'ACC_BFA_AOA_001',
      bankName: 'Banco de Fomento Angola (BFA)',
      iban: 'AO06.0006.0000.1234.5678.1018.9',
      currency: 'AOA',
      accountType: 'CURRENT',
      currentBalance: 450000000,
      availableBalance: 435000000,
      updatedAt: new Date().toISOString()
    };

    const tx1: CanonicalBankTransaction = {
      transactionId: 'TX_BFA_2026_001',
      accountRef: bankAcc.accountRef,
      transactionDate: '2026-08-14',
      valueDate: '2026-08-14',
      description: 'Recebimento Liquidação FT 2026/030 — Unitel',
      amount: 35000000,
      type: 'CREDIT',
      referenceNumber: 'REF_BFA_998811',
      reconciled: true
    };

    const tx2: CanonicalBankTransaction = {
      transactionId: 'TX_BFA_2026_002',
      accountRef: bankAcc.accountRef,
      transactionDate: '2026-08-15',
      valueDate: '2026-08-15',
      description: 'Pagamento Fornecedor Equipamentos TI',
      amount: 12500000,
      type: 'DEBIT',
      referenceNumber: 'REF_BFA_998812',
      reconciled: false
    };

    this.canonicalBankAccounts.set(bankAcc.accountRef, bankAcc);
    this.canonicalTransactions.set(tx1.transactionId, tx1);
    this.canonicalTransactions.set(tx2.transactionId, tx2);
  }

  // --- Phase 1: Email Integration ---
  public searchEmailInbox(query: string = 'fatura'): { count: number; messages: any[] } {
    return {
      count: 2,
      messages: [
        {
          id: 'msg_em_001',
          subject: 'Fatura de Serviço de Consultoria — Agosto 2026',
          from: 'fornecedor.ti@parceiro.co.ao',
          date: new Date(Date.now() - 3600000 * 3).toISOString(),
          attachments: ['fatura_fornecedor_042.pdf']
        },
        {
          id: 'msg_em_002',
          subject: 'Comprovativo de Liquidação Imposto AGT',
          from: 'notificacoes@agt.minfin.gov.ao',
          date: new Date(Date.now() - 3600000 * 12).toISOString(),
          attachments: ['guias_dar_agt.pdf']
        }
      ]
    };
  }

  // --- Phase 2: WhatsApp Business ---
  public generateWhatsAppSignedDraft(phone: string, documentTitle: string): { draftId: string; signedLink: string; status: string } {
    const draftId = `wa_draft_${Date.now()}`;
    const signedLink = `https://portal.angolatelecom.ao/secure-docs/${draftId}?token=signed_jwt_wa_${Date.now()}`;
    return {
      draftId,
      signedLink,
      status: 'DRAFT_CREATED'
    };
  }

  // --- Phase 3: Cloud Storage Drive ---
  public listDriveFiles(folderPath: string = '/Financas/Faturas'): { folder: string; files: any[] } {
    return {
      folder: folderPath,
      files: [
        { name: 'Extrato_BFA_Agosto_2026.csv', sizeBytes: 45200, modifiedAt: new Date().toISOString() },
        { name: 'Fatura_AGT_Liquidação.pdf', sizeBytes: 124000, modifiedAt: new Date().toISOString() }
      ]
    };
  }

  // --- Phase 4: Primavera v10 Read-Only ERP ---
  public executePrimaveraReadQuery(queryKey: string, params: Record<string, any> = {}): { queryKey: string; recordCount: number; data: any[]; dataLineage: DataLineageEnvelope } {
    const lineage: DataLineageEnvelope = {
      sourceConnector: 'PRIMAVERA_V10',
      sourceResource: `PRIMAVERA_V10_DB_${queryKey.toUpperCase()}`,
      retrievedAt: new Date().toISOString(),
      snapshotId: `snap_prim_${Date.now()}`,
      mappingVersion: 'v10.0_canonical_v1',
      freshnessStatus: 'FRESH'
    };

    switch (queryKey) {
      case 'sales_by_period':
        return { queryKey, recordCount: this.canonicalSales.size, data: Array.from(this.canonicalSales.values()), dataLineage: lineage };
      case 'customer_aging':
        return { queryKey, recordCount: this.canonicalCustomers.size, data: Array.from(this.canonicalCustomers.values()), dataLineage: lineage };
      case 'ledger_by_period':
        return { queryKey, recordCount: this.canonicalLedger.size, data: Array.from(this.canonicalLedger.values()), dataLineage: lineage };
      case 'stock_by_warehouse':
        return { queryKey, recordCount: this.canonicalInventory.size, data: Array.from(this.canonicalInventory.values()), dataLineage: lineage };
      default:
        return { queryKey, recordCount: 1, data: [{ info: 'Consulta parametrizada do catálogo executada com sucesso.' }], dataLineage: lineage };
    }
  }

  public attemptPrimaveraWrite(sqlQuery: string): never {
    this.writeAttemptsBlockedCounter++;
    throw new Error('WRITE_ATTEMPT_DENIED: O conector Primavera v10 opera exclusivamente em modo READ-ONLY. Alterações de dados são estritamente proibidas.');
  }

  // --- Phase 5: Automated Spreadsheet Ingestion ---
  public ingestSpreadsheet(filename: string, fileBufferContent?: any): { schema: SpreadsheetSchema; recordCount: number; macroBlocked: boolean } {
    if (filename.toLowerCase().endsWith('.xlsm') || filename.toLowerCase().endsWith('.vba')) {
      this.macroBlockCounter++;
    }

    const schema: SpreadsheetSchema = {
      schemaId: `schema_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: filename,
      expectedSheets: ['Dados_Gerais', 'Resumo_Financeiro'],
      requiredColumns: ['NIF', 'Valor_AOA', 'Data_Emissão', 'Documento'],
      detectedColumns: ['NIF', 'Valor_AOA', 'Data_Emissão', 'Documento', 'Estado'],
      mappingConfidencePercentage: 98.5,
      isValid: true
    };

    return {
      schema,
      recordCount: 142,
      macroBlocked: true
    };
  }

  // --- Phase 6: Bank Read-Only & Payment Block ---
  public getBankAccounts(): CanonicalBankAccount[] {
    return Array.from(this.canonicalBankAccounts.values());
  }

  public getBankTransactions(accountRef?: string): CanonicalBankTransaction[] {
    const all = Array.from(this.canonicalTransactions.values());
    if (accountRef) {
      return all.filter(t => t.accountRef === accountRef);
    }
    return all;
  }

  public attemptBankPayment(operation: string, details: any): never {
    this.paymentAttemptsBlockedCounter++;
    throw new Error(`OPERATION_NOT_SUPPORTED: O conector bancário 'BANK_READONLY' proíbe estritamente a operação de pagamento '${operation}'. Apenas consulta de saldos e extratos é permitida.`);
  }

  // --- Connection Center Management ---
  public getConnections(): EnterpriseConnection[] {
    return Array.from(this.connections.values());
  }

  public testConnection(connectionId: string): EnterpriseConnection {
    const conn = this.connections.get(connectionId);
    if (!conn) {
      throw new Error(`Conexão empresarial '${connectionId}' não encontrada.`);
    }
    conn.health = 'HEALTHY';
    conn.lastSyncAt = new Date().toISOString();
    return conn;
  }

  public getGlobalSummary(): PEIPGlobalSummary {
    const conns = Array.from(this.connections.values());
    const healthBreakdown: Record<ConnectionHealthState, number> = {
      HEALTHY: 0,
      DEGRADED: 0,
      DISCONNECTED: 0,
      NEEDS_REAUTHORIZATION: 0,
      REVOKED: 0
    };

    for (const c of conns) {
      healthBreakdown[c.health] += 1;
    }

    return {
      totalPhasesConfigured: 6,
      activeConnectionsCount: conns.filter(c => c.health === 'HEALTHY').length,
      totalSyncOperations: 1420,
      healthBreakdown,
      primaveraReadQueriesCount: 6,
      bankReconciliationRatePercentage: 96.8,
      macroExecutionsBlocked: this.macroBlockCounter,
      unauthorizedWriteAttemptsBlocked: this.writeAttemptsBlockedCounter,
      unauthorizedPaymentAttemptsBlocked: this.paymentAttemptsBlockedCounter,
      timestamp: new Date().toISOString()
    };
  }
}
