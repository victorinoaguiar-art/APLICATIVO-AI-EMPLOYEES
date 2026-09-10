import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DatabaseDriver } from '../db/dbDriver.js';

describe('Phase 1 — Database Persistence Driver', () => {
  it('Initializes driver and inserts record into table', async () => {
    const db = DatabaseDriver.getInstance();
    const status = db.getStatus();
    assert.strictEqual(status.tablesCount >= 6, true);

    const inserted = await db.insert('tasks', 'task_test_1', {
      title: 'Database Test Task',
      status: 'COMPLETED'
    });

    assert.strictEqual(inserted.id, 'task_test_1');

    const found = await db.findById('tasks', 'task_test_1');
    assert.ok(found);
    assert.strictEqual(found?.data.title, 'Database Test Task');
  });
});
