export type EnterpriseConnectionType =
  | 'EMAIL'
  | 'WHATSAPP_BUSINESS'
  | 'CLOUD_DRIVE'
  | 'PRIMAVERA_V10'
  | 'EXCEL_AUTOMATION'
  | 'BANK_READONLY';

export type ConnectionHealthState =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'NEEDS_REAUTHORIZATION'
  | 'REVOKED';

export type ConnectionMode =
  | 'READ_ONLY'
  | 'READ_AND_DRAFT'
  | 'READ_AND_APPROVED_WRITE'
  | 'AUTO_INGEST';

export interface EnterpriseConnection {
  connectionId: string;
  tenantId: string;
  organizationName: string;
  type: EnterpriseConnectionType;
  name: string;
  provider: string;
  mode: ConnectionMode;
  health: ConnectionHealthState;
  scopes: string[];
  lastSyncAt: string;
  employeesUsingCount: number;
  statusMessage?: string;
}

export interface CanonicalCustomer {
  customerId: string;
  nif: string;
  companyName: string;
  email: string;
  phone: string;
  creditLimitAoa: number;
  currentBalanceAoa: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface CanonicalSalesDocument {
  documentId: string;
  documentNumber: string;
  documentType: 'FT' | 'FR' | 'NC' | 'ND';
  customerId: string;
  customerName: string;
  nif: string;
  issueDate: string;
  totalGrossAoa: number;
  totalTaxAoa: number;
  totalNetAoa: number;
  status: 'ISSUED' | 'PAID' | 'CANCELLED';
}

export interface CanonicalLedgerEntry {
  entryId: string;
  accountNumber: string;
  accountName: string;
  debitAoa: number;
  creditAoa: number;
  entryDate: string;
  description: string;
  fiscalPeriod: string;
}

export interface CanonicalInventoryItem {
  itemId: string;
  itemCode: string;
  description: string;
  warehouseId: string;
  quantityOnHand: number;
  unitCostAoa: number;
  totalValueAoa: number;
}

export interface CanonicalBankAccount {
  accountRef: string;
  bankName: string;
  iban: string;
  currency: 'AOA' | 'USD' | 'EUR';
  accountType: 'CURRENT' | 'SAVINGS' | 'ESCROW';
  currentBalance: number;
  availableBalance: number;
  updatedAt: string;
}

export interface CanonicalBankTransaction {
  transactionId: string;
  accountRef: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  referenceNumber: string;
  reconciled: boolean;
}

export interface SpreadsheetSchema {
  schemaId: string;
  name: string;
  expectedSheets: string[];
  requiredColumns: string[];
  detectedColumns: string[];
  mappingConfidencePercentage: number;
  isValid: boolean;
}

export interface DataLineageEnvelope {
  sourceConnector: EnterpriseConnectionType;
  sourceResource: string;
  retrievedAt: string;
  snapshotId: string;
  mappingVersion: string;
  freshnessStatus: 'FRESH' | 'STALE_WARNING' | 'CACHED';
}

export interface PEIPGlobalSummary {
  totalPhasesConfigured: number; // 6
  activeConnectionsCount: number;
  totalSyncOperations: number;
  healthBreakdown: Record<ConnectionHealthState, number>;
  primaveraReadQueriesCount: number;
  bankReconciliationRatePercentage: number;
  macroExecutionsBlocked: number;
  unauthorizedWriteAttemptsBlocked: number;
  unauthorizedPaymentAttemptsBlocked: number;
  timestamp: string;
}
