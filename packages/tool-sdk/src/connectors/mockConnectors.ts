import { ToolAdapter, ToolManifest, ToolExecutionContext, ToolExecutionResult } from '../interfaces/ToolAdapter.js';
import { IdempotencyStore } from '../idempotency/IdempotencyStore.js';

export class MockEmailConnector implements ToolAdapter {
  manifest(): ToolManifest {
    return {
      toolKey: 'T.COMM.GMAIL',
      name: 'Google Gmail Connector (Mock)',
      provider: 'Google',
      version: '1.0.0',
      category: 'COMMUNICATION',
      operations: [
        {
          key: 'send_email',
          description: 'Sends an email to a recipient',
          sideEffect: true,
          riskLevel: 'R2',
          requiredPermissions: ['communication.message.send'],
          requiredCapabilities: ['CAP.EMAIL_OPERATIONS'],
          inputSchema: { recipient: 'string', subject: 'string', body: 'string' },
          outputSchema: { messageId: 'string', status: 'string' },
          timeoutMs: 5000,
          requiresIdempotency: true
        }
      ]
    };
  }

  async execute(operation: string, input: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    const lock = IdempotencyStore.checkAndLock(
      context.organizationId,
      context.idempotencyKey,
      context.toolKey,
      operation,
      input
    );

    if (lock.status === 'CONFLICT') {
      throw new Error(`IDEMPOTENCY_KEY_CONFLICT: Key ${context.idempotencyKey} reuse with different payload.`);
    }

    if (lock.status === 'REPLAY' && lock.record?.result) {
      return {
        success: true,
        data: lock.record.result,
        executionTimeMs: Date.now() - startTime,
        idempotentReplay: true
      };
    }

    // Mock execution
    const data = {
      messageId: `msg_${Math.random().toString(36).substring(7)}`,
      status: 'SENT',
      recipient: (input as { recipient?: string }).recipient ?? 'test@example.com',
      timestamp: new Date().toISOString()
    };

    IdempotencyStore.complete(context.organizationId, context.idempotencyKey, data);

    return {
      success: true,
      data,
      executionTimeMs: Date.now() - startTime,
      idempotentReplay: false
    };
  }
}

export class MockCRMConnector implements ToolAdapter {
  manifest(): ToolManifest {
    return {
      toolKey: 'T.CRM.HUBSPOT',
      name: 'HubSpot CRM Connector (Mock)',
      provider: 'HubSpot',
      version: '1.0.0',
      category: 'CRM',
      operations: [
        {
          key: 'update_contact',
          description: 'Updates CRM contact details',
          sideEffect: true,
          riskLevel: 'R2',
          requiredPermissions: ['crm.customer.write'],
          requiredCapabilities: ['CAP.CRM_OPERATIONS'],
          inputSchema: { contactId: 'string', status: 'string' },
          outputSchema: { updated: 'boolean' },
          timeoutMs: 5000,
          requiresIdempotency: true
        }
      ]
    };
  }

  async execute(operation: string, input: unknown, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const data = { updated: true, timestamp: new Date().toISOString() };
    return {
      success: true,
      data,
      executionTimeMs: Date.now() - startTime,
      idempotentReplay: false
    };
  }
}
