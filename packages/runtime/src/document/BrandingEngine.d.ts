import { BrandingProfile, UniversalDocument } from '@ai-employee/shared';
export declare class BrandingEngine {
    private profiles;
    constructor();
    private registerDefaultProfile;
    registerProfile(profile: BrandingProfile, callerOrgId: string): BrandingProfile;
    getProfile(organizationId: string): BrandingProfile;
    applyBranding(doc: UniversalDocument): UniversalDocument;
}
//# sourceMappingURL=BrandingEngine.d.ts.map