import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PEIPIntegrationEngine } from '../peip/PEIPIntegrationEngine.js';

describe('PEIPIntegrationEngine — Progressive Enterprise Integration Pack (6 Phases)', () => {
  const engine = PEIPIntegrationEngine.getInstance();

  it('should seed all 6 enterprise integration connections with HEALTHY state', () => {
    const conns = engine.getConnections();
    assert.equal(conns.length, 6);
    const summary = engine.getGlobalSummary();
    assert.equal(summary.totalPhasesConfigured, 6);
    assert.equal(summary.activeConnectionsCount, 6);
    assert.equal(summary.healthBreakdown.HEALTHY, 6);
  });

  it('Phase 1 (Email): should search authorized inbox and attachments', () => {
    const inbox = engine.searchEmailInbox('fatura');
    assert.ok(inbox.count >= 1);
    assert.ok(inbox.messages.length >= 1);
    assert.ok(inbox.messages[0].subject);
  });

  it('Phase 2 (WhatsApp): should generate draft message with JWT signed secure link', () => {
    const draft = engine.generateWhatsAppSignedDraft('+244923000111', 'Relatorio_Liquidez.pdf');
    assert.ok(draft.draftId);
    assert.equal(draft.status, 'DRAFT_CREATED');
    assert.ok(draft.signedLink.startsWith('https://'));
  });

  it('Phase 3 (Drive): should list authorized cloud storage files', () => {
    const drive = engine.listDriveFiles('/Financas/Faturas');
    assert.equal(drive.folder, '/Financas/Faturas');
    assert.ok(drive.files.length >= 1);
  });

  it('Phase 4 (Primavera v10): should execute pre-approved read query and block write attempts', () => {
    const salesRes = engine.executePrimaveraReadQuery('sales_by_period', { period: '2026/08' });
    assert.equal(salesRes.queryKey, 'sales_by_period');
    assert.ok(salesRes.recordCount >= 1);
    assert.equal(salesRes.dataLineage.sourceConnector, 'PRIMAVERA_V10');

    assert.throws(
      () => {
        engine.attemptPrimaveraWrite('UPDATE LineItems SET Price = 0');
      },
      (err: any) => {
        return err.message.includes('WRITE_ATTEMPT_DENIED');
      }
    );
  });

  it('Phase 5 (Excel): should ingest spreadsheet safely and block macro execution', () => {
    const res = engine.ingestSpreadsheet('Relatorio_Vendas_Macro.xlsm');
    assert.ok(res.schema.isValid);
    assert.equal(res.schema.mappingConfidencePercentage, 98.5);
    assert.equal(res.macroBlocked, true);

    const summary = engine.getGlobalSummary();
    assert.ok(summary.macroExecutionsBlocked >= 1);
  });

  it('Phase 6 (Bank Read-Only): should read account balance/transactions and strictly block payments', () => {
    const accounts = engine.getBankAccounts();
    assert.ok(accounts.length >= 1);
    assert.equal(accounts[0].currency, 'AOA');

    const txs = engine.getBankTransactions();
    assert.ok(txs.length >= 1);

    assert.throws(
      () => {
        engine.attemptBankPayment('payment.submit', { amount: 500000, recipientIban: 'AO06.0000...' });
      },
      (err: any) => {
        return err.message.includes('OPERATION_NOT_SUPPORTED');
      }
    );

    const summary = engine.getGlobalSummary();
    assert.ok(summary.unauthorizedPaymentAttemptsBlocked >= 1);
  });
});
