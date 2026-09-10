/**
 * CORPORATE LETTERHEAD, BRAND GOVERNANCE & STATIONERY SYSTEM (CLBGS)
 * Core Engine for Brand Governance, Letterhead Modes, Signatures & Layouts
 */

import {
  AuthorizedSignatory,
  BrandAssetRecord,
  CLBGSGlobalSummary,
  CLBGSRenderContext,
  CorporateTemplateRecord,
  OrganizationBrandPack,
  PageLayoutConfig,
  StationeryMode,
  TemplateCategory
} from '@ai-employee/shared';
import { createHash } from 'crypto';

export class CLBGSEngine {
  private brandPacks: Map<string, OrganizationBrandPack> = new Map();
  private brandAssets: Map<string, BrandAssetRecord> = new Map();
  private templates: Map<string, CorporateTemplateRecord> = new Map();
  private signatories: Map<string, AuthorizedSignatory> = new Map();

  constructor() {
    this.seedDefaultBrandPack();
  }

  private seedDefaultBrandPack(): void {
    const defaultOrgId = 'org_default_angola';

    const primaryLogo: BrandAssetRecord = {
      assetId: 'asset_logo_primary_v1',
      organizationId: defaultOrgId,
      assetType: 'LOGO_PRIMARY',
      assetName: 'Logo Oficial Corporativo (Color)',
      status: 'APPROVED',
      fileUriOrBase64: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMwRjE3MkEiLz48dGV4dCB4PSIxMCIgeT0iMjUiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+RU1QUkVTQSBMT0dPPC90ZXh0Pjwvc3ZnPg==',
      aspectRatio: 3.0,
      safeAreaMm: 5,
      approvedFrom: '2026-01-01'
    };

    const signatureAsset: BrandAssetRecord = {
      assetId: 'asset_sig_ceo_v1',
      organizationId: defaultOrgId,
      assetType: 'SIGNATURE',
      assetName: 'Assinatura Autorizada CEO',
      status: 'APPROVED',
      fileUriOrBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      aspectRatio: 2.5,
      safeAreaMm: 2,
      approvedFrom: '2026-01-01'
    };

    this.brandAssets.set(primaryLogo.assetId, primaryLogo);
    this.brandAssets.set(signatureAsset.assetId, signatureAsset);

    const defaultLayout: PageLayoutConfig = {
      pageSize: 'A4',
      topMarginMm: 25,
      bottomMarginMm: 25,
      leftMarginMm: 20,
      rightMarginMm: 20,
      headerReservedAreaMm: 35,
      footerReservedAreaMm: 25,
      signatureReservedAreaMm: 40,
      stampReservedAreaMm: 30,
      firstPageHeaderMode: 'FULL_HEADER',
      subsequentPageHeaderMode: 'COMPACT_HEADER',
      paginationStyle: 'PAGE_X_OF_Y',
      watermark: 'NONE'
    };

    const defaultTemplate: CorporateTemplateRecord = {
      templateId: 'tmpl_official_letter_v1',
      organizationId: defaultOrgId,
      category: 'LETTER',
      templateName: 'Carta Oficial Timbrada v1.0',
      version: 1,
      status: 'APPROVED',
      effectiveFrom: '2026-01-01',
      defaultStationeryMode: 'DIGITAL_LETTERHEAD',
      layoutConfig: defaultLayout
    };

    const contractTemplate: CorporateTemplateRecord = {
      templateId: 'tmpl_legal_contract_v1',
      organizationId: defaultOrgId,
      category: 'CONTRACT',
      templateName: 'Modelo de Contrato Institucional v1.0',
      version: 1,
      status: 'APPROVED',
      effectiveFrom: '2026-01-01',
      defaultStationeryMode: 'DIGITAL_LETTERHEAD',
      layoutConfig: { ...defaultLayout, watermark: 'CONFIDENTIAL' }
    };

    this.templates.set(defaultTemplate.templateId, defaultTemplate);
    this.templates.set(contractTemplate.templateId, contractTemplate);

    const brandPack: OrganizationBrandPack = {
      organizationId: defaultOrgId,
      version: 1,
      status: 'APPROVED',
      legalIdentity: {
        legalName: 'EMPRESA NACIONAL DE TECNOLOGIA, S.A.',
        commercialName: 'ENTEC SA',
        nif: '5412345678',
        registeredAddress: 'Avenida 4 de Fevereiro, Nº 100, Luanda',
        city: 'Luanda',
        country: 'Angola',
        phone: '+244 923 000 000',
        email: 'contacto@entec.co.ao',
        website: 'https://www.entec.co.ao',
        registrationNumber: 'Luanda-0045/2020',
        licenseReference: 'AGT-LIC-2026-99'
      },
      logos: {
        primaryAssetId: primaryLogo.assetId
      },
      stationery: {
        defaultMode: 'DIGITAL_LETTERHEAD',
        defaultPaperSize: 'A4',
        defaultTemplateId: defaultTemplate.templateId
      },
      typography: {
        headingFont: 'Inter, sans-serif',
        bodyFont: 'Inter, sans-serif'
      },
      colors: {
        primaryColorHex: '#0F172A',
        secondaryColorHex: '#2563EB',
        accentColorHex: '#059669',
        useApprovedPaletteOnly: true
      },
      signaturesGoverned: true,
      sealsGoverned: true
    };

    this.brandPacks.set(defaultOrgId, brandPack);

    const ceoSignatory: AuthorizedSignatory = {
      signatoryId: 'sig_ceo_001',
      organizationId: defaultOrgId,
      fullName: 'Dr. António Silva',
      roleTitle: 'Director Geral / CEO',
      signatureAssetId: signatureAsset.assetId,
      allowedDocumentTypes: ['LETTER', 'CONTRACT', 'REPORT', 'PROPOSAL', 'BANK_LETTER', 'GOVERNMENT_REQUEST', 'CERTIFICATE_SUPPORT'],
      validFrom: '2026-01-01',
      validUntil: '2027-12-31',
      status: 'ACTIVE'
    };

    this.signatories.set(ceoSignatory.signatoryId, ceoSignatory);
  }

  public getGlobalSummary(): CLBGSGlobalSummary {
    let approvedAssets = 0;
    this.brandAssets.forEach((asset) => {
      if (asset.status === 'APPROVED' || asset.status === 'ACTIVE') approvedAssets++;
    });

    let activeSignatories = 0;
    this.signatories.forEach((sig) => {
      if (sig.status === 'ACTIVE') activeSignatories++;
    });

    return {
      totalBrandPacks: this.brandPacks.size,
      totalAssets: this.brandAssets.size,
      approvedAssetsCount: approvedAssets,
      totalTemplates: this.templates.size,
      authorizedSignatoriesCount: activeSignatories,
      defaultStationeryMode: 'DIGITAL_LETTERHEAD',
      tenantIsolationEnforced: true
    };
  }

  public getBrandPack(organizationId: string): OrganizationBrandPack {
    const pack = this.brandPacks.get(organizationId);
    if (!pack) {
      // Fallback to default Angola pack for unregistered orgs
      return this.brandPacks.get('org_default_angola')!;
    }
    return pack;
  }

  public getBrandAsset(assetId: string): BrandAssetRecord | undefined {
    return this.brandAssets.get(assetId);
  }

  public validateBrandAssetUsage(
    targetOrganizationId: string,
    assetId: string
  ): { valid: boolean; blockReason?: string; asset?: BrandAssetRecord } {
    const asset = this.brandAssets.get(assetId);
    if (!asset) {
      return { valid: false, blockReason: `Asset [${assetId}] not found in Brand Asset Registry.` };
    }

    // Tenant Isolation Check
    if (asset.organizationId !== targetOrganizationId) {
      return {
        valid: false,
        blockReason: `CROSS_TENANT_BRAND_USE: Asset [${assetId}] belongs to tenant [${asset.organizationId}], not [${targetOrganizationId}]. Blocked!`
      };
    }

    // Asset Status Governance Check
    if (asset.status !== 'APPROVED' && asset.status !== 'ACTIVE') {
      return {
        valid: false,
        blockReason: `UNAPPROVED_ASSET_USE: Asset [${assetId}] is in state [${asset.status}]. Production use blocked!`
      };
    }

    return { valid: true, asset };
  }

  public selectTemplate(
    organizationId: string,
    category: TemplateCategory
  ): CorporateTemplateRecord {
    // Search matching category for tenant
    for (const tmpl of this.templates.values()) {
      if (tmpl.organizationId === organizationId && tmpl.category === category && tmpl.status === 'APPROVED') {
        return tmpl;
      }
    }
    // Search matching category across default tenant
    for (const tmpl of this.templates.values()) {
      if (tmpl.category === category && tmpl.status === 'APPROVED') {
        return tmpl;
      }
    }
    // Fallback to default letterhead template
    return this.templates.get('tmpl_official_letter_v1')!;
  }

  public computePageLayout(
    mode: StationeryMode,
    baseLayout: PageLayoutConfig
  ): { layout: PageLayoutConfig; renderLogo: boolean; renderHeaderIdentity: boolean; renderFooterIdentity: boolean } {
    const layout = { ...baseLayout };

    if (mode === 'PREPRINTED_STATIONERY') {
      // Respect physical stationery top/bottom margins
      layout.topMarginMm = Math.max(layout.topMarginMm, 45);
      layout.bottomMarginMm = Math.max(layout.bottomMarginMm, 30);
      layout.headerReservedAreaMm = 45;
      layout.footerReservedAreaMm = 30;

      return {
        layout,
        renderLogo: false,
        renderHeaderIdentity: false,
        renderFooterIdentity: false
      };
    }

    if (mode === 'PLAIN_PAPER') {
      return {
        layout,
        renderLogo: false,
        renderHeaderIdentity: false,
        renderFooterIdentity: false
      };
    }

    if (mode === 'HYBRID') {
      layout.topMarginMm = Math.max(layout.topMarginMm, 40);
      return {
        layout,
        renderLogo: false,
        renderHeaderIdentity: false,
        renderFooterIdentity: true
      };
    }

    // DIGITAL_LETTERHEAD
    return {
      layout,
      renderLogo: true,
      renderHeaderIdentity: true,
      renderFooterIdentity: true
    };
  }

  public authorizeSignature(
    targetOrganizationId: string,
    signatoryId: string,
    category: TemplateCategory
  ): { authorized: boolean; blockReason?: string; signatory?: AuthorizedSignatory } {
    const signatory = this.signatories.get(signatoryId);
    if (!signatory) {
      return { authorized: false, blockReason: `Signatory [${signatoryId}] not found.` };
    }

    if (signatory.organizationId !== targetOrganizationId) {
      return {
        authorized: false,
        blockReason: `CROSS_TENANT_SIGNATURE_USE: Signatory [${signatoryId}] belongs to tenant [${signatory.organizationId}].`
      };
    }

    if (signatory.status !== 'ACTIVE') {
      return {
        authorized: false,
        blockReason: `INACTIVE_SIGNATORY: Signatory [${signatoryId}] status is [${signatory.status}].`
      };
    }

    if (!signatory.allowedDocumentTypes.includes(category)) {
      return {
        authorized: false,
        blockReason: `UNAUTHORIZED_DOCUMENT_TYPE: Signatory [${signatoryId}] is not authorized for document type [${category}].`
      };
    }

    return { authorized: true, signatory };
  }

  public generateCLBGSRenderContext(params: {
    organizationId: string;
    documentId: string;
    documentType: TemplateCategory;
    employeeId: number;
    stationeryMode?: StationeryMode;
    signatoryId?: string;
    rawDocumentContent?: string;
  }): CLBGSRenderContext {
    const brandPack = this.getBrandPack(params.organizationId);
    const template = this.selectTemplate(params.organizationId, params.documentType);
    const mode = params.stationeryMode || brandPack.stationery.defaultMode;

    // Validate Logo Asset
    const logoValidation = this.validateBrandAssetUsage(
      params.organizationId,
      brandPack.logos.primaryAssetId
    );

    if (!logoValidation.valid && mode === 'DIGITAL_LETTERHEAD') {
      return {
        organizationId: params.organizationId,
        documentId: params.documentId,
        documentType: params.documentType,
        employeeId: params.employeeId,
        stationeryMode: mode,
        brandPack,
        template,
        layout: template.layoutConfig,
        renderLogo: false,
        renderHeaderIdentity: false,
        renderFooterIdentity: false,
        watermark: template.layoutConfig.watermark,
        validationStatus: 'BLOCKED_UNAPPROVED_ASSET',
        blockReason: logoValidation.blockReason
      };
    }

    // Compute Page Layout & Identity Flags
    const layoutRes = this.computePageLayout(mode, template.layoutConfig);

    // Validate Signature if requested
    let authorizedSignatory: AuthorizedSignatory | undefined;
    let signedHashSha256: string | undefined;

    if (params.signatoryId) {
      const sigAuth = this.authorizeSignature(
        params.organizationId,
        params.signatoryId,
        params.documentType
      );

      if (!sigAuth.authorized) {
        return {
          organizationId: params.organizationId,
          documentId: params.documentId,
          documentType: params.documentType,
          employeeId: params.employeeId,
          stationeryMode: mode,
          brandPack,
          template,
          layout: layoutRes.layout,
          renderLogo: layoutRes.renderLogo,
          renderHeaderIdentity: layoutRes.renderHeaderIdentity,
          renderFooterIdentity: layoutRes.renderFooterIdentity,
          watermark: layoutRes.layout.watermark,
          validationStatus: 'BLOCKED_UNAUTHORIZED_SIGNATORY',
          blockReason: sigAuth.blockReason
        };
      }

      authorizedSignatory = sigAuth.signatory;

      // Compute Cryptographic Immutable Signed Hash
      const contentToHash = `${params.documentId}:${params.organizationId}:${params.employeeId}:${params.signatoryId}:${params.rawDocumentContent || 'DOCUMENT_BODY_CONTENT'}`;
      signedHashSha256 = createHash('sha256').update(contentToHash).digest('hex');
    }

    return {
      organizationId: params.organizationId,
      documentId: params.documentId,
      documentType: params.documentType,
      employeeId: params.employeeId,
      stationeryMode: mode,
      brandPack,
      template,
      layout: layoutRes.layout,
      renderLogo: layoutRes.renderLogo,
      renderHeaderIdentity: layoutRes.renderHeaderIdentity,
      renderFooterIdentity: layoutRes.renderFooterIdentity,
      watermark: layoutRes.layout.watermark,
      signatory: authorizedSignatory,
      signedHashSha256,
      validationStatus: 'VALID'
    };
  }
}
