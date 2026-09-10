import { WorkProductEnvelope, DeliveryReceipt, OutputRoute } from '@ai-employee/shared';
export interface CreateWorkProductInput<T = unknown> {
    organizationId: string;
    taskId: string;
    employeeId: string;
    roleKey: string;
    rolePackVersion?: string;
    type: string;
    structuredPayload?: T;
    artifactRefs?: string[];
    sourceSnapshotId: string;
    deliveryRoutes?: OutputRoute[];
}
export declare class DeliveryRouter {
    static createWorkProduct<T = unknown>(input: CreateWorkProductInput<T>): WorkProductEnvelope<T>;
    static dispatchDelivery(workProduct: WorkProductEnvelope, route: OutputRoute): DeliveryReceipt;
}
//# sourceMappingURL=DeliveryRouter.d.ts.map