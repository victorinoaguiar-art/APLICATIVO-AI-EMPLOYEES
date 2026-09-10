import { TaskRecord, TaskStatus } from '@ai-employee/shared';
export declare class TaskStateMachine {
    static ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]>;
    static transition(task: TaskRecord, newStatus: TaskStatus): TaskRecord;
    static createTask(orgId: string, employeeId: string, roleKey: string, title: string, instruction: string): TaskRecord;
}
//# sourceMappingURL=TaskStateMachine.d.ts.map