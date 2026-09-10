import { BusinessEventEnvelope } from '@ai-employee/shared';
export declare class SystemEventWebhookAdapter {
    static parseWebhook(organizationId: string, sourceSystem: string, eventType: string, payload: Record<string, unknown>, signatureHeader: string, secret: string): BusinessEventEnvelope;
}
//# sourceMappingURL=SystemEventWebhookAdapter.d.ts.map