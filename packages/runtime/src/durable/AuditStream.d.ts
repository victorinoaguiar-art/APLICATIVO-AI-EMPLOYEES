export interface AuditEvent {
    eventId: string;
    organizationId: string;
    taskId: string;
    employeeId: string;
    roleKey: string;
    eventType: 'TASK_CREATED' | 'POLICY_EVALUATED' | 'APPROVAL_REQUESTED' | 'APPROVAL_DECIDED' | 'TOOL_EXECUTED' | 'RETRY_ATTEMPTED' | 'TASK_COMPLETED' | 'TASK_FAILED' | 'DLQ_ROUTED';
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    details: Record<string, any>;
    timestamp: string;
    checksum: string;
}
export declare class AuditStream {
    private static events;
    static emit(orgId: string, taskId: string, employeeId: string, roleKey: string, eventType: AuditEvent['eventType'], severity: AuditEvent['severity'], details: Record<string, any>): AuditEvent;
    static query(filter?: {
        organizationId?: string;
        taskId?: string;
        eventType?: AuditEvent['eventType'];
    }): AuditEvent[];
    static getDecisionTrace(taskId: string): AuditEvent[];
    static clearEvents(): void;
}
//# sourceMappingURL=AuditStream.d.ts.map