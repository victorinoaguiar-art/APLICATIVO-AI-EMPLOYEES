import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CPEAAEngine } from '../cpeaa/CPEAAEngine.js';

describe('CPEAA 2026 Engine Test Suite', () => {
  const engine = CPEAAEngine.getInstance();

  it('1. Global Summary — verifies CPEAA engine initialization', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(typeof summary.total_client_documents, 'number');
    assert.equal(typeof summary.total_extracted_rules, 'number');
    assert.equal(typeof summary.total_explainable_decisions, 'number');
  });
});
