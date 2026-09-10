import { UnifiedCommandEnvelope } from '@ai-employee/shared';
export declare class HumanCommandAdapter {
    static parseTextCommand(organizationId: string, userId: string, text: string, requestedEmployeeId?: number): UnifiedCommandEnvelope;
    static parseVoiceCommand(organizationId: string, userId: string, transcriptText: string, audioDurationSec: number, requestedEmployeeId?: number): UnifiedCommandEnvelope;
    static parseQuickAction(organizationId: string, userId: string, actionName: string, employeeId: number, params?: Record<string, unknown>): UnifiedCommandEnvelope;
}
//# sourceMappingURL=HumanCommandAdapter.d.ts.map