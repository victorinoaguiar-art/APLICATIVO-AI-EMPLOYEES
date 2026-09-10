import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { GWNISIntegrationEngine } from '../gwnis/GWNISIntegrationEngine.js';

describe('GWNISIntegrationEngine — Google Workspace Native Integration Suite', () => {
  let engine: GWNISIntegrationEngine;

  beforeEach(() => {
    engine = new GWNISIntegrationEngine();
  });

  it('1. Connection & OAuth Vault — should retrieve healthy Google Workspace connection profile', () => {
    const conns = engine.getConnections('tenant-default');
    assert.ok(conns.length > 0);
    assert.equal(conns[0].connectionState, 'CONNECTED_HEALTHY');
    assert.ok(conns[0].scopes.includes('https://www.googleapis.com/auth/drive.readonly'));
  });

  it('2. Google Drive Connector — should search files and return metadata', () => {
    const files = engine.searchDriveFiles('tenant-default', 'Balancete');
    assert.ok(files.length > 0);
    assert.equal(files[0].mimeType, 'application/vnd.google-apps.spreadsheet');
  });

  it('3. Google Drive Security — should block file deletion operations', () => {
    assert.throws(
      () => engine.deleteDriveFile('tenant-default', 'file-drive-001', 'emp-261'),
      /OPERATION_PROHIBITED: A eliminação de ficheiros no Google Drive está estritamente proibida/
    );
  });

  it('4. Google Docs Connector — should create document with structured content', () => {
    const doc = engine.createDocument('tenant-default', {
      title: 'Relatório Financeiro Q3 2026',
      contentSections: [
        { type: 'HEADING_1', text: 'Resumo Financeiro Q3 2026' },
        { type: 'PARAGRAPH', text: 'Receita total acumulada de 45.000.000 AOA com margem EBITDA de 34%.' }
      ],
      employeeId: 'emp-261'
    });

    assert.ok(doc.documentId);
    assert.equal(doc.title, 'Relatório Financeiro Q3 2026');
  });

  it('5. Google Sheets Connector — should validate cell range and read sheet data', () => {
    const sheetData = engine.readSheetRange('tenant-default', 'sheet-001', 'A1:C10', 'emp-286');
    assert.ok(sheetData.rows.length > 0);
    assert.equal(sheetData.range, 'A1:C10');
  });

  it('6. Pilot Execution — Pilot #261 (Document Creator)', async () => {
    const receipt = await engine.executePilot261DocumentCreator('tenant-default', {
      title: 'Proposta Comercial Clientes Enterprise',
      sections: [{ heading: 'Escopo', body: 'Automação de 50 processos empresariais.' }]
    });

    assert.equal(receipt.status, 'SUCCESS');
    assert.ok(receipt.operationId);
  });

  it('7. Pilot Execution — Pilot #286 (Spreadsheet Employee)', async () => {
    const receipt = await engine.executePilot286SpreadsheetEmployee('tenant-default', {
      spreadsheetId: 'sheet-001',
      readRange: 'A1:D20'
    });

    assert.equal(receipt.status, 'SUCCESS');
  });

  it('8. Pilot Execution — Pilot #73 (Management Reporting Suite)', async () => {
    const receipt = await engine.executePilot73ManagementReporting('tenant-default', {
      searchDriveQuery: 'Balancete',
      spreadsheetId: 'sheet-001',
      reportTitle: 'Relatório de Gestão Consolidado 2026'
    });

    assert.equal(receipt.status, 'SUCCESS');
  });
});
