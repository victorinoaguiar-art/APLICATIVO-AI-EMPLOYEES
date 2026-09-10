import {
  BrandingProfile,
  UniversalDocument,
  DocumentErrorCode
} from '@ai-employee/shared';

export class BrandingEngine {
  private profiles: Map<string, BrandingProfile> = new Map();

  constructor() {
    this.registerDefaultProfile();
  }

  private registerDefaultProfile(): void {
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

  public registerProfile(profile: BrandingProfile, callerOrgId: string): BrandingProfile {
    if (profile.organizationId !== callerOrgId) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Não é permitido criar perfil de marca para outra organização.`);
    }

    this.profiles.set(profile.organizationId, profile);
    return profile;
  }

  public getProfile(organizationId: string): BrandingProfile {
    return this.profiles.get(organizationId) || this.profiles.get('DEFAULT')!;
  }

  public applyBranding(doc: UniversalDocument): UniversalDocument {
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
