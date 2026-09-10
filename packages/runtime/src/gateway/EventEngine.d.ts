import { BusinessEventEnvelope, EventRule, UnifiedCommandEnvelope } from '@ai-employee/shared';
export declare class EventEngine {
    private rules;
    private processedEvents;
    constructor();
    private registerDefaultEventRules;
    registerRule(rule: EventRule, callerOrgId: string): EventRule;
    processBusinessEvent(event: BusinessEventEnvelope): UnifiedCommandEnvelope | null;
}
//# sourceMappingURL=EventEngine.d.ts.map