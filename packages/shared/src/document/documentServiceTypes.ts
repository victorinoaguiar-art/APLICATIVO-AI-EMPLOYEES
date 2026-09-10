export type DocumentFormat = 'DOCX' | 'PDF' | 'XLSX' | 'PPTX' | 'HTML' | 'CSV' | 'TXT' | 'JSON';

export type DocumentType =
  | 'ADMINISTRATIVE'
  | 'ACCOUNTING'
  | 'FINANCIAL'
  | 'MANAGEMENT_REPORT'
  | 'TAX'
  | 'LEGAL'
  | 'HR'
  | 'BANKING'
  | 'GOVERNMENT'
  | 'SALES'
  | 'PROCUREMENT'
  | 'AUDIT'
  | 'PROJECT'
  | 'COMPLIANCE'
  | 'OPERATIONS'
  | 'TECHNICAL'
  | 'POLICY'
  | 'PROCEDURE'
  | 'SOP'
  | 'FORM'
  | 'PROPOSAL'
  | 'CONTRACT'
  | 'LETTER'
  | 'CERTIFICATE'
  | 'STATEMENT'
  | 'MEMO'
  | 'INVOICE_SUPPORT'
  | 'BOARD_REPORT'
  | 'PRESENTATION'
  | 'SPREADSHEET'
  | 'ANALYTICAL_REPORT';

export type DocumentClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'
  | 'HIGHLY_RESTRICTED';

export type DocumentStatus =
  | 'DRAFT'
  | 'CONTENT_PREPARATION'
  | 'STRUCTURED'
  | 'TEMPLATE_RESOLUTION'
  | 'COMPOSING'
  | 'RENDERING'
  | 'VALIDATING'
  | 'REVIEW_REQUIRED'
  | 'APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'ARCHIVED'
  | 'FAILED'
  | 'BLOCKED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type WatermarkType = 'DRAFT' | 'CONFIDENTIAL' | 'INTERNAL' | 'COPY' | 'SUPERSEDED' | 'APPROVED';

export type SignatureType =
  | 'UNSIGNED'
  | 'MANUAL_SIGNATURE_REQUIRED'
  | 'ELECTRONIC_SIGNATURE'
  | 'DIGITAL_SIGNATURE'
  | 'AUTHORIZED_SIGNATURE_IMAGE';

export interface DocumentHeading {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface DocumentParagraph {
  type: 'paragraph';
  text: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface DocumentTable {
  type: 'table';
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  totalsRow?: (string | number)[];
}

export interface DocumentList {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

export interface DocumentImage {
  type: 'image';
  url: string;
  altText?: string;
  caption?: string;
}

export interface DocumentChart {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'column';
  title: string;
  categories: string[];
  series: { name: string; data: number[] }[];
}

export interface DocumentCallout {
  type: 'callout';
  variant: 'note' | 'tip' | 'warning' | 'important';
  text: string;
}

export interface DocumentSignatureBlock {
  type: 'signature_block';
  signerTitle: string;
  signerName?: string;
  signatureUrl?: string;
  date?: string;
}

export interface DocumentPageBreak {
  type: 'page_break';
}

export type DocumentElement =
  | DocumentHeading
  | DocumentParagraph
  | DocumentTable
  | DocumentList
  | DocumentImage
  | DocumentChart
  | DocumentCallout
  | DocumentSignatureBlock
  | DocumentPageBreak;

export interface DocumentSection {
  title?: string;
  elements: DocumentElement[];
}

export interface DocumentAnnex {
  annexId: string;
  title: string;
  content: string;
  format?: DocumentFormat;
}

export interface DocumentSourceLineage {
  factId: string;
  factValue: string | number;
  sourceDataset: string;
  sourceSystem: string;
  recordIdentifier: string;
  extractedAt: string;
}

export interface DocumentProvenance {
  requestedBy: string;
  employeeId: string;
  rolePackId: string;
  taskId: string;
  workflowRunId?: string;
  templateId: string;
  templateVersion: string;
  aiModel?: string;
  reviewedBy?: string;
  approvedBy?: string;
  generatedAt: string;
  sourceLineage: DocumentSourceLineage[];
}

export interface UniversalDocument {
  documentId: string;
  organizationId: string;
  title: string;
  documentType: DocumentType;
  classification: DocumentClassification;
  language: 'pt' | 'en' | 'fr' | 'es';
  locale: string;
  currency: string;
  version: number;
  status: DocumentStatus;
  watermark?: WatermarkType;
  headerText?: string;
  footerText?: string;
  sections: DocumentSection[];
  annexes?: DocumentAnnex[];
  provenance: DocumentProvenance;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentGenerationRequest {
  requestId: string;
  organizationId: string;
  employeeId: string;
  taskId: string;
  workflowRunId?: string;
  documentType: DocumentType;
  documentPurpose: string;
  title: string;
  language: 'pt' | 'en';
  locale: string;
  currency: string;
  contentData: Record<string, unknown>;
  templateId?: string;
  templateVersion?: string;
  brandingProfileId?: string;
  requestedFormats: DocumentFormat[];
  approvalPolicy?: string;
  classification: DocumentClassification;
  confidentialityMarking?: string;
  destinationRoutes?: string[];
  requestedBy: string;
  requestedAt: string;
  traceId: string;
}

export interface WorkProductSnapshot {
  snapshotId: string;
  workProductId: string;
  organizationId: string;
  taskId: string;
  dataHash: string;
  payload: Record<string, unknown>;
  capturedAt: string;
}

export interface RenderedArtifact {
  artifactId: string;
  documentId: string;
  version: number;
  format: DocumentFormat;
  contentHash: string;
  mimeType: string;
  fileSizeBytes: number;
  downloadUrl?: string;
  renderedAt: string;
}

export interface WorkProductBundle {
  workProductId: string;
  snapshotId: string;
  title: string;
  organizationId: string;
  employeeId: string;
  taskId: string;
  status: DocumentStatus;
  approvalStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalHash?: string;
  renderings: Record<DocumentFormat, RenderedArtifact | undefined>;
  createdAt: string;
}

export interface DocumentTemplate {
  templateId: string;
  organizationId: string;
  department?: string;
  documentType: DocumentType;
  name: string;
  version: string;
  isDefault: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  styles?: Record<string, unknown>;
  sanitizedAt: string;
}

export interface BrandingProfile {
  profileId: string;
  organizationId: string;
  organizationName: string;
  logoUrl?: string;
  secondaryLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  address?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  website?: string;
  footerLegalText?: string;
}

export interface DocumentDeliveryReceipt {
  receiptId: string;
  documentId: string;
  versionId: string;
  format: DocumentFormat;
  destination: string;
  recipient: string;
  channel: string;
  sentAt: string;
  deliveredAt?: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'REJECTED' | 'ACKNOWLEDGED';
  externalReference?: string;
  traceId: string;
}

export interface DocumentDeliveryPolicy {
  enabled: boolean;
  documentTypes: DocumentType[];
  mandatoryFormats: DocumentFormat[];
  optionalFormats: DocumentFormat[];
  templatePolicy: {
    organizationTemplateFirst: boolean;
  };
  reviewPolicy?: string;
  approvalPolicy?: string;
  signaturePolicy?: SignatureType;
  destinations: string[];
  archiveEnabled: boolean;
  versioningEnabled: boolean;
  deliveryReceiptRequired: boolean;
}

export enum DocumentErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  DOCUMENT_INVALID = 'DOCUMENT_INVALID',
  DOCUMENT_TEMPLATE_NOT_FOUND = 'DOCUMENT_TEMPLATE_NOT_FOUND',
  DOCUMENT_TEMPLATE_INVALID = 'DOCUMENT_TEMPLATE_INVALID',
  DOCUMENT_RENDER_FAILED = 'DOCUMENT_RENDER_FAILED',
  DOCUMENT_FORMAT_NOT_SUPPORTED = 'DOCUMENT_FORMAT_NOT_SUPPORTED',
  DOCUMENT_VALIDATION_FAILED = 'DOCUMENT_VALIDATION_FAILED',
  DOCUMENT_APPROVAL_REQUIRED = 'DOCUMENT_APPROVAL_REQUIRED',
  DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH = 'DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH',
  DOCUMENT_SIGNATURE_REQUIRED = 'DOCUMENT_SIGNATURE_REQUIRED',
  DOCUMENT_SIGNATURE_DENIED = 'DOCUMENT_SIGNATURE_DENIED',
  DOCUMENT_DELIVERY_FAILED = 'DOCUMENT_DELIVERY_FAILED',
  DOCUMENT_TENANT_ACCESS_DENIED = 'DOCUMENT_TENANT_ACCESS_DENIED',
  DOCUMENT_VERSION_CONFLICT = 'DOCUMENT_VERSION_CONFLICT',
  DOCUMENT_SUPERSEDED = 'DOCUMENT_SUPERSEDED'
}
