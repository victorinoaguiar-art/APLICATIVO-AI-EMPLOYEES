import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ModelGateway } from '../model/ModelGateway.js';
import { RedisQueueProvider } from '../durable/RedisQueueProvider.js';

describe('Phase 2 — Model Gateway (Google Gemini Primary)', () => {
  it('Generates output via Gemini primary / fallback route', async () => {
    const gateway = ModelGateway.getInstance();
    const response = await gateway.generate({
      taskId: 'task_gemini_1',
      roleKey: 'ceo_assistant',
      systemPrompt: 'You are CEO Assistant.',
      userInstruction: 'Prepare Q3 strategy outline.'
    });

    assert.ok(response.output);
    assert.strictEqual(response.taskId, 'task_gemini_1');
    assert.ok(response.tokensUsed.totalTokens > 0);
    assert.ok(response.costs.aoaCost >= 0);
  });
});

describe('Phase 4 — Redis Queue Provider', () => {
  it('Enqueues and dequeues tasks with priority', async () => {
    const queue = RedisQueueProvider.getInstance();
    await queue.enqueueTask({ id: 'task_1', title: 'Low priority' } as any, 1);
    await queue.enqueueTask({ id: 'task_2', title: 'High priority' } as any, 10);

    const next = await queue.dequeueNextTask();
    assert.strictEqual(next?.id, 'task_2');
  });
});
