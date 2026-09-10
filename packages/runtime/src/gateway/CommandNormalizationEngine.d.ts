import { UnifiedCommandEnvelope, CommandSourceType, SourceActorType } from '@ai-employee/shared';
export interface RawInputPayload {
    organizationId: string;
    tenantId?: string;
    sourceType: CommandSourceType;
    sourceChannel: string;
    sourceActorType: SourceActorType;
    sourceActorId?: string;
    rawInput: unknown;
    language?: string;
    locale?: string;
    requestedEmployeeId?: number;
    requestedRoleKey?: string;
    taskType?: string;
    parameters?: Record<string, unknown>;
    idempotencyKey?: string;
    correlationId?: string;
}
export declare class CommandNormalizationEngine {
    static normalize(payload: RawInputPayload): UnifiedCommandEnvelope;
}
//# sourceMappingURL=CommandNormalizationEngine.d.ts.map