import { EmployeeHandoffEnvelope, UnifiedCommandEnvelope } from '@ai-employee/shared';
export declare class EmployeeHandoffRouter {
    private handoffsList;
    dispatchHandoff(handoff: EmployeeHandoffEnvelope): UnifiedCommandEnvelope;
    getHandoffsForOrganization(organizationId: string): EmployeeHandoffEnvelope[];
}
//# sourceMappingURL=EmployeeHandoffRouter.d.ts.map