import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { Invoice, Currency, PaymentStatus, SettlementProof } from '../paymentGateway.js';

export interface AccountingEvent {
  accountingId: string;
  invoiceId: string;
  tenantId: string;
  amount: number;
  currency: Currency;
  status: 'PENDING_OUTBOX' | 'POSTED' | 'BLOCKED';
  createdAt: string;
}

export class TransactionalPaymentStore {
  private db: any;
  private readonly dbPath: string;

  public constructor(customPath?: string) {
    if (customPath) {
      this.dbPath = customPath;
    } else if (process.env.NODE_ENV === 'test') {
      // In test mode, write strictly to an isolated temporary directory
      const tmpDir = path.join(os.tmpdir(), 'aetf_test_billing');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      this.dbPath = path.join(tmpDir, `billing_${Date.now()}_${Math.random().toString(36).slice(2)}.db`);
    } else {
      const prodDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(prodDir)) {
        fs.mkdirSync(prodDir, { recursive: true });
      }
      this.dbPath = path.join(prodDir, 'billing_production.db');
    }

    this.db = new DatabaseSync(this.dbPath);
    this.runMigrations();
  }

  private runMigrations(): void {
    this.db.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invoices (
        invoice_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        tax_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        tax_determination TEXT NOT NULL,
        status TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        paid_at TEXT,
        settlement_evidence TEXT,
        pdf_download_url TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payment_events (
        event_id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_transaction_id TEXT UNIQUE,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        payload_raw TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
      );

      CREATE TABLE IF NOT EXISTS settlements (
        settlement_id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        provider_tx_id TEXT NOT NULL,
        settled_at TEXT NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
      );

      CREATE TABLE IF NOT EXISTS idempotency_keys (
        idempotency_key TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounting_events (
        accounting_id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
      );

      CREATE TABLE IF NOT EXISTS webhook_receipts (
        receipt_id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        signature TEXT NOT NULL,
        verified INTEGER NOT NULL,
        processed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS refunds (
        refund_id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        amount REAL NOT NULL,
        reason TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
      );
    `);
  }

  public saveInvoice(invoice: Invoice): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO invoices (
        invoice_id, tenant_id, plan_id, amount, currency, tax_amount, total_amount,
        tax_determination, status, issued_at, paid_at, settlement_evidence, pdf_download_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      invoice.invoiceId,
      invoice.tenantId,
      invoice.planId,
      invoice.amount,
      invoice.currency,
      invoice.taxAmount,
      invoice.totalAmount,
      JSON.stringify(invoice.taxDetermination),
      invoice.status,
      invoice.issuedAt,
      invoice.paidAt || null,
      invoice.settlementEvidence ? JSON.stringify(invoice.settlementEvidence) : null,
      invoice.pdfDownloadUrl
    );
  }

  public getInvoice(invoiceId: string): Invoice | null {
    const stmt = this.db.prepare(`SELECT * FROM invoices WHERE invoice_id = ?`);
    const row = stmt.get(invoiceId) as any;
    if (!row) return null;

    return {
      invoiceId: row.invoice_id,
      tenantId: row.tenant_id,
      planId: row.plan_id,
      amount: row.amount,
      currency: row.currency,
      taxDetermination: JSON.parse(row.tax_determination),
      taxAmount: row.tax_amount,
      totalAmount: row.total_amount,
      issuedAt: row.issued_at,
      paidAt: row.paid_at || undefined,
      status: row.status,
      settlementEvidence: row.settlement_evidence ? JSON.parse(row.settlement_evidence) : undefined,
      pdfDownloadUrl: row.pdf_download_url
    };
  }

  public listInvoices(tenantId?: string): Invoice[] {
    const stmt = tenantId
      ? this.db.prepare(`SELECT * FROM invoices WHERE tenant_id = ?`)
      : this.db.prepare(`SELECT * FROM invoices`);
    const rows = (tenantId ? stmt.all(tenantId) : stmt.all()) as any[];

    return rows.map((row) => ({
      invoiceId: row.invoice_id,
      tenantId: row.tenant_id,
      planId: row.plan_id,
      amount: row.amount,
      currency: row.currency,
      taxDetermination: JSON.parse(row.tax_determination),
      taxAmount: row.tax_amount,
      totalAmount: row.total_amount,
      issuedAt: row.issued_at,
      paidAt: row.paid_at || undefined,
      status: row.status,
      settlementEvidence: row.settlement_evidence ? JSON.parse(row.settlement_evidence) : undefined,
      pdfDownloadUrl: row.pdf_download_url
    }));
  }

  public isIdempotencyKeySettled(key: string): boolean {
    const stmt = this.db.prepare(`SELECT idempotency_key FROM idempotency_keys WHERE idempotency_key = ?`);
    const row = stmt.get(key);
    return !!row;
  }

  public executeSettlementTransaction(
    invoiceId: string,
    proof: SettlementProof,
    settlementTimestamp: string
  ): Invoice {
    this.db.exec('BEGIN IMMEDIATE TRANSACTION;');
    try {
      // 1. Lock and load invoice
      const invoice = this.getInvoice(invoiceId);
      if (!invoice) {
        throw new Error(`INVOICE_NOT_FOUND: Invoice ${invoiceId} does not exist in transactional store.`);
      }

      // 2. Check idempotency key inside transaction
      const idempStmt = this.db.prepare(`SELECT idempotency_key FROM idempotency_keys WHERE idempotency_key = ?`);
      if (idempStmt.get(proof.idempotencyKey)) {
        throw new Error(`IDEMPOTENCY_REPLAY_DETECTED: Payment with key ${proof.idempotencyKey} already processed.`);
      }

      // 3. Register idempotency key
      const insertIdemp = this.db.prepare(`
        INSERT INTO idempotency_keys (idempotency_key, invoice_id, tenant_id, created_at, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertIdemp.run(proof.idempotencyKey, invoiceId, proof.tenantId, settlementTimestamp, 'SETTLED');

      // 4. Register payment event
      const insertPaymentEvent = this.db.prepare(`
        INSERT INTO payment_events (
          event_id, invoice_id, tenant_id, provider, provider_transaction_id,
          amount, currency, status, payload_raw, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const eventId = `pe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      insertPaymentEvent.run(
        eventId,
        invoiceId,
        proof.tenantId,
        proof.provider || 'STRIPE',
        proof.providerTransactionId,
        proof.amountPaid,
        proof.currency,
        'PAID',
        proof.webhookPayloadRaw,
        settlementTimestamp
      );

      // 5. Update invoice state
      invoice.status = 'PAID';
      invoice.paidAt = settlementTimestamp;
      invoice.settlementEvidence = {
        paymentStatus: 'PAID',
        providerTransactionId: proof.providerTransactionId,
        webhookSignatureVerified: true,
        settledAt: settlementTimestamp
      };
      this.saveInvoice(invoice);

      // 6. Outbox Pattern: Accounting event
      const insertAccounting = this.db.prepare(`
        INSERT INTO accounting_events (accounting_id, invoice_id, tenant_id, amount, currency, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const accountingId = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      insertAccounting.run(
        accountingId,
        invoiceId,
        proof.tenantId,
        proof.amountPaid,
        proof.currency,
        'PENDING_OUTBOX',
        settlementTimestamp
      );

      this.db.exec('COMMIT;');
      return invoice;
    } catch (err) {
      this.db.exec('ROLLBACK;');
      throw err;
    }
  }

  public close(): void {
    try {
      this.db.close();
    } catch {
      // ignore
    }
    // In test mode, clean up temporary file if exists
    if (process.env.NODE_ENV === 'test' && fs.existsSync(this.dbPath)) {
      try {
        fs.unlinkSync(this.dbPath);
      } catch {
        // ignore
      }
    }
  }
}
