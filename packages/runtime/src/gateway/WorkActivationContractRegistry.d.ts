import { WorkActivationContract } from '@ai-employee/shared';
export declare class WorkActivationContractRegistry {
    private static instance;
    private contractsMap;
    private constructor();
    static getInstance(): WorkActivationContractRegistry;
    private generate500ActivationContracts;
    private buildDefaultActivationContract;
    getActivationContract(employeeId: number): WorkActivationContract;
    getAllActivationContracts(): WorkActivationContract[];
    getCount(): number;
}
//# sourceMappingURL=WorkActivationContractRegistry.d.ts.map