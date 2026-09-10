"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemEventWebhookAdapter = void 0;
const shared_1 = require("@ai-employee/shared");
const crypto_1 = require("crypto");
class SystemEventWebhookAdapter {
    static parseWebhook(organizationId, sourceSystem, eventType, payload, signatureHeader, secret) {
        const rawPayload = JSON.stringify(payload);
        const expectedHmac = (0, crypto_1.createHmac)('sha256', secret).update(rawPayload).digest('hex');
        // HMAC Signature Validation
        if (signatureHeader !== expectedHmac && signatureHeader !== `sha256=${expectedHmac}`) {
            throw new Error(`${shared_1.UTCEGErrorCode.CHANNEL_AUTH_FAILED}: Assinatura inválida no webhook de ${sourceSystem}.`);
        }
        const now = new Date().toISOString();
        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const idempotencyKey = (0, crypto_1.createHash)('sha256').update(`${organizationId}:${sourceSystem}:${eventType}:${rawPayload}`).digest('hex');
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
exports.SystemEventWebhookAdapter = SystemEventWebhookAdapter;
//# sourceMappingURL=SystemEventWebhookAdapter.js.map