/**
 * CORPORATE LETTERHEAD, BRAND GOVERNANCE & STATIONERY SYSTEM (CLBGS)
 * Types & Contracts for 500 AI Employees
 */

export type StationeryMode = 'DIGITAL_LETTERHEAD' | 'PREPRINTED_STATIONERY' | 'PLAIN_PAPER' | 'HYBRID';

export type BrandAssetState =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'DEPRECATED'
  | 'REVOKED'
  | 'QUARANTINED';

export type TemplateCategory =
  | 'LETTER'
  | 'CONTRACT'
  | 'REPORT'
  | 'PROPOSAL'
  | 'INVOICE_SUPPORT'
  | 'BANK_LETTER'
  | 'TAX_LETTER'
  | 'HR_DOCUMENT'
  | 'GOVERNMENT_REQUEST'
  | 'PROCUREMENT'
  | 'PRESENTATION'
  | 'SPREADSHEET'
  | 'FORM'
  | 'CERTIFICATE_SUPPORT'
  | 'MEMO'
  | 'NOTICE';

export type TemplateState =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'DEPRECATED'
  | 'REVOKED';

export type CLBGSWatermarkType = 'DRAFT' | 'CONFIDENTIAL' | 'COPY' | 'ORIGINAL' | 'CANCELLED' | 'NONE';

export type PageSize = 'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM';

export interface LegalIdentity {
  legalName: string;
  commercialName?: string;
  nif: string;
  registeredAddress: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  registrationNumber?: string;
  licenseReference?: string;
}

export interface BrandAssetRecord {
  assetId: string;
  organizationId: string;
  assetType: 'LOGO_PRIMARY' | 'LOGO_SECONDARY' | 'LOGO_MONOCHROME' | 'SYMBOL' | 'WATERMARK' | 'SIGNATURE' | 'SEAL' | 'STAMP' | 'QR_IDENTITY_MARK';
  assetName: string;
  status: BrandAssetState;
  fileUriOrBase64: string;
  aspectRatio: number;
  safeAreaMm: number;
  approvedFrom: string;
  approvedUntil?: string;
}

export interface OrganizationBrandPack {
  organizationId: string;
  version: number;
  status: 'APPROVED' | 'DRAFT' | 'DEPRECATED';
  legalIdentity: LegalIdentity;
  logos: {
    primaryAssetId: string;
    secondaryAssetId?: string;
    monochromeAssetId?: string;
  };
  stationery: {
    defaultMode: StationeryMode;
    defaultPaperSize: PageSize;
    defaultTemplateId: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  colors: {
    primaryColorHex: string;
    secondaryColorHex: string;
    accentColorHex: string;
    useApprovedPaletteOnly: boolean;
  };
  signaturesGoverned: boolean;
  sealsGoverned: boolean;
}

export interface PageLayoutConfig {
  pageSize: PageSize;
  topMarginMm: number;
  bottomMarginMm: number;
  leftMarginMm: number;
  rightMarginMm: number;
  headerReservedAreaMm: number;
  footerReservedAreaMm: number;
  signatureReservedAreaMm: number;
  stampReservedAreaMm: number;
  firstPageHeaderMode: 'FULL_HEADER' | 'COMPACT_HEADER' | 'SUPPRESSED';
  subsequentPageHeaderMode: 'FULL_HEADER' | 'COMPACT_HEADER' | 'SUPPRESSED';
  paginationStyle: 'PAGE_X_OF_Y' | 'PAGE_X' | 'NONE';
  watermark: CLBGSWatermarkType;
}

export interface AuthorizedSignatory {
  signatoryId: string;
  organizationId: string;
  fullName: string;
  roleTitle: string;
  signatureAssetId: string;
  allowedDocumentTypes: TemplateCategory[];
  validFrom: string;
  validUntil: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';
}

export interface CorporateTemplateRecord {
  templateId: string;
  organizationId: string;
  category: TemplateCategory;
  templateName: string;
  version: number;
  status: TemplateState;
  effectiveFrom: string;
  effectiveUntil?: string;
  defaultStationeryMode: StationeryMode;
  layoutConfig: PageLayoutConfig;
}

export interface CLBGSRenderContext {
  organizationId: string;
  documentId: string;
  documentType: TemplateCategory;
  employeeId: number;
  stationeryMode: StationeryMode;
  brandPack: OrganizationBrandPack;
  template: CorporateTemplateRecord;
  layout: PageLayoutConfig;
  renderLogo: boolean;
  renderHeaderIdentity: boolean;
  renderFooterIdentity: boolean;
  watermark: CLBGSWatermarkType;
  signatory?: AuthorizedSignatory;
  signedHashSha256?: string;
  validationStatus: 'VALID' | 'BLOCKED_TENANT_MISMATCH' | 'BLOCKED_UNAPPROVED_ASSET' | 'BLOCKED_UNAUTHORIZED_SIGNATORY';
  blockReason?: string;
}

export interface CLBGSGlobalSummary {
  totalBrandPacks: number;
  totalAssets: number;
  approvedAssetsCount: number;
  totalTemplates: number;
  authorizedSignatoriesCount: number;
  defaultStationeryMode: StationeryMode;
  tenantIsolationEnforced: boolean;
}
