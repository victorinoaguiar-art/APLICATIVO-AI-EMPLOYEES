import { BusinessEventEnvelope, UTCEGErrorCode } from '@ai-employee/shared';
import { createHash, createHmac } from 'crypto';

export class SystemEventWebhookAdapter {
  public static parseWebhook(
    organizationId: string,
    sourceSystem: string,
    eventType: string,
    payload: Record<string, unknown>,
    signatureHeader: string,
    secret: string
  ): BusinessEventEnvelope {
    const rawPayload = JSON.stringify(payload);
    const expectedHmac = createHmac('sha256', secret).update(rawPayload).digest('hex');

    // HMAC Signature Validation
    if (signatureHeader !== expectedHmac && signatureHeader !== `sha256=${expectedHmac}`) {
      throw new Error(`${UTCEGErrorCode.CHANNEL_AUTH_FAILED}: Assinatura inválida no webhook de ${sourceSystem}.`);
    }

    const now = new Date().toISOString();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const idempotencyKey = createHash('sha256').update(`${organizationId}:${sourceSystem}:${eventType}:${rawPayload}`).digest('hex');

    return {
      eventId,
      organizationId,
      tenantId: organizationId,
      eventType,
      eventVersion: '1.0.0',
      sourceSystem,
      sourceRecordId: String(payload.id || payload.recordId || eventId),
      occurredAt: now,
      receivedAt: now,
      payload,
      payloadSchema: `schema_${eventType.toLowerCase()}_v1`,
      classification: 'INTERNAL',
      sensitivity: 'MEDIUM',
      producer: sourceSystem,
      correlationId: `corr_${eventId}`,
      idempotencyKey,
      traceId: `trace_${eventId}`
    };
  }
}
