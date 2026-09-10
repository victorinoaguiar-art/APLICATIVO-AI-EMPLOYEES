import { safeHash } from '@ai-employee/shared';

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

export class AuditStream {
  private static events: AuditEvent[] = [];

  public static emit(
    orgId: string,
    taskId: string,
    employeeId: string,
    roleKey: string,
    eventType: AuditEvent['eventType'],
    severity: AuditEvent['severity'],
    details: Record<string, any>
  ): AuditEvent {
    const timestamp = new Date().toISOString();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const payload = { eventId, orgId, taskId, employeeId, roleKey, eventType, timestamp, details };
    const checksum = safeHash(JSON.stringify(payload));

    const event: AuditEvent = {
      eventId,
      organizationId: orgId,
      taskId,
      employeeId,
      roleKey,
      eventType,
      severity,
      details,
      timestamp,
      checksum
    };

    this.events.push(Object.freeze(event));
    return event;
  }

  public static query(filter?: { organizationId?: string; taskId?: string; eventType?: AuditEvent['eventType'] }): AuditEvent[] {
    let result = [...this.events];
    if (!filter) return result;

    if (filter.organizationId) {
      result = result.filter(e => e.organizationId === filter.organizationId);
    }
    if (filter.taskId) {
      result = result.filter(e => e.taskId === filter.taskId);
    }
    if (filter.eventType) {
      result = result.filter(e => e.eventType === filter.eventType);
    }
    return result;
  }

  public static getDecisionTrace(taskId: string): AuditEvent[] {
    return this.events.filter(e => e.taskId === taskId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  public static clearEvents(): void {
    this.events = [];
  }
}
