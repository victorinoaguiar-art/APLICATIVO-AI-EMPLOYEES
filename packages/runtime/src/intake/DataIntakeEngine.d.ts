import { DataEnvelope } from '@ai-employee/shared';
export interface CreateEnvelopeInput<T = unknown> {
    organizationId: string;
    sourceConnectionId: string;
    sourceSystem: string;
    sourceRecordId?: string;
    sourceDeepLink?: string;
    schemaKey: string;
    schemaVersion?: string;
    classification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'HIGHLY_RESTRICTED';
    payload: T;
    attachmentRefs?: string[];
    idempotencyKey?: string;
}
export declare class DataIntakeEngine {
    static createEnvelope<T = unknown>(input: CreateEnvelopeInput<T>): DataEnvelope<T>;
}
//# sourceMappingURL=DataIntakeEngine.d.ts.map