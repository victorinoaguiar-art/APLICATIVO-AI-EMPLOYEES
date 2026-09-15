import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ConnectorRegistry } from '../connectors/ConnectorRegistry.js';

describe('AETF-500 Connector Reality Gate (Prompt Mestre Secção 14)', () => {
  const registry = ConnectorRegistry.getInstance();

  test('Taxonomy completeness & registered connectors check', () => {
    const all = registry.getAllConnectors();
    assert.strictEqual(all.length >= 4, true);

    const gmailMock = registry.getConnector('T.COMM.GMAIL.MOCK');
    assert.strictEqual(gmailMock?.classification, 'GENERIC_MOCK');

    const primavera = registry.getConnector('T.ERP.PRIMAVERA.V10');
    assert.strictEqual(primavera?.classification, 'CONTROLLED_SIMULATION');
    assert.strictEqual(primavera?.healthStatus, 'BLOCKED');
  });

  test('PRODUCTION + MOCK CONNECTOR = BLOCKED enforcement', () => {
    const evalResult = registry.evaluateExecutionGate('T.COMM.GMAIL.MOCK', 'production');
    assert.strictEqual(evalResult.allowed, false);
    assert.strictEqual(evalResult.errorCode, 'MOCK_CONNECTOR_BLOCKED_IN_PRODUCTION');
  });

  test('MOCK connector allowed in test / sandbox environment', () => {
    const evalResult = registry.evaluateExecutionGate('T.COMM.GMAIL.MOCK', 'test');
    assert.strictEqual(evalResult.allowed, true);
  });

  test('PRIMAVERA_WRITE and PRIMAVERA_IMPORT = BLOCKED', () => {
    const writeResult = registry.evaluateExecutionGate('T.ERP.PRIMAVERA.V10', 'sandbox', true);
    assert.strictEqual(writeResult.allowed, false);
    assert.strictEqual(writeResult.errorCode, 'PRIMAVERA_WRITE_BLOCKED');
  });
});
