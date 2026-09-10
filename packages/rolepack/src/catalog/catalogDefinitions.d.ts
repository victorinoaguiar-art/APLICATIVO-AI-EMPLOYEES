import { RolePack, RiskLevel, AutonomyLevel } from '@ai-employee/shared';
interface RawRoleDef {
    id: number;
    role_key: string;
    display_name: string;
    department: string;
    archetypes: string[];
    risk: RiskLevel;
    autonomyDefault: AutonomyLevel;
    autonomyMax: AutonomyLevel;
}
export declare function buildRolePack(raw: RawRoleDef): RolePack;
export declare const CANONICAL_500_ROLES: RolePack[];
export {};
//# sourceMappingURL=catalogDefinitions.d.ts.map