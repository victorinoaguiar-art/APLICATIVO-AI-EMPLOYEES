"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingEngine = void 0;
const shared_1 = require("@ai-employee/shared");
class BrandingEngine {
    profiles = new Map();
    constructor() {
        this.registerDefaultProfile();
    }
    registerDefaultProfile() {
        this.profiles.set('DEFAULT', {
            profileId: 'profile_default',
            organizationId: 'DEFAULT',
            organizationName: 'AI Employee Platform Enterprise',
            primaryColor: '#0f172a',
            secondaryColor: '#2563eb',
            fontFamily: 'Inter, Arial, sans-serif',
            footerLegalText: 'Documento Gerado por AI Employee Platform — Todos os direitos reservados.'
        });
    }
    registerProfile(profile, callerOrgId) {
        if (profile.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Não é permitido criar perfil de marca para outra organização.`);
        }
        this.profiles.set(profile.organizationId, profile);
        return profile;
    }
    getProfile(organizationId) {
        return this.profiles.get(organizationId) || this.profiles.get('DEFAULT');
    }
    applyBranding(doc) {
        const branding = this.getProfile(doc.organizationId);
        const header = doc.headerText || `${branding.organizationName} — Documento Oficial`;
        const footer = doc.footerText || `${branding.footerLegalText} | ${doc.classification}`;
        return {
            ...doc,
            headerText: header,
            footerText: footer
        };
    }
}
exports.BrandingEngine = BrandingEngine;
//# sourceMappingURL=BrandingEngine.js.map