import { RolePack, RiskLevel, AutonomyLevel } from '@ai-employee/shared';
export interface RolePackFilter {
    department?: string;
    lifecycle?: string;
    minRisk?: RiskLevel;
    maxRisk?: RiskLevel;
    capability?: string;
    tool?: string;
    autonomy?: AutonomyLevel;
}
export declare class RolePackRegistry {
    private static instance;
    private rolesMap;
    private rolesByIdMap;
    private loadedChecksum;
    private isLoaded;
    private constructor();
    static getInstance(): RolePackRegistry;
    load(catalog?: RolePack[]): void;
    validate(): boolean;
    get(roleKey: string): RolePack | undefined;
    getById(id: number): RolePack | undefined;
    require(roleKey: string): RolePack;
    list(filter?: RolePackFilter): RolePack[];
    departments(): string[];
    manifest(): {
        count: number;
        version: string;
        checksum: string;
    };
    version(): string;
    checksum(): string;
    reloadAtomic(newCatalog: RolePack[]): void;
}
//# sourceMappingURL=RolePackRegistry.d.ts.map