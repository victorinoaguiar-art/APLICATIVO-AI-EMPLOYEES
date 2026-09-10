import { RoleKnowledgeProfile } from '@ai-employee/shared';
export declare class RoleKnowledgeProfileRegistry {
    private static instance;
    private profilesMap;
    private constructor();
    static getInstance(): RoleKnowledgeProfileRegistry;
    private initializeAllProfiles;
    private generateProfileForRole;
    getRoleProfile(employeeId: number): RoleKnowledgeProfile | undefined;
    getAllRoleProfiles(): RoleKnowledgeProfile[];
}
//# sourceMappingURL=RoleKnowledgeProfileRegistry.d.ts.map