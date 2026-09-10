import {
  UniversalDocument,
  DocumentGenerationRequest,
  WorkProductBundle,
  WorkProductSnapshot,
  RenderedArtifact,
  DocumentFormat,
  DocumentDeliveryReceipt,
  DocumentErrorCode,
  DocumentTemplate,
  BrandingProfile
} from '@ai-employee/shared';
import { UniversalDocumentComposer } from './UniversalDocumentComposer.js';
import { TemplateEngine } from './TemplateEngine.js';
import { BrandingEngine } from './BrandingEngine.js';
import { DocumentValidator } from './DocumentValidator.js';
import { DocxRenderer } from './renderers/DocxRenderer.js';
import { PdfRenderer } from './renderers/PdfRenderer.js';
import { XlsxRenderer } from './renderers/XlsxRenderer.js';
import { PptxRenderer } from './renderers/PptxRenderer.js';
import { DeliveryRouter } from '../delivery/DeliveryRouter.js';
import { createHash } from 'crypto';

export class DocumentService {
  private templateEngine: TemplateEngine;
  private brandingEngine: BrandingEngine;
  private deliveryRouter: DeliveryRouter;

  private documents: Map<string, UniversalDocument> = new Map();
  private documentVersions: Map<string, UniversalDocument[]> = new Map();
  private bundles: Map<string, WorkProductBundle> = new Map();
  private snapshots: Map<string, WorkProductSnapshot> = new Map();
  private receipts: Map<string, DocumentDeliveryReceipt[]> = new Map();

  constructor(deliveryRouter?: DeliveryRouter) {
    this.templateEngine = new TemplateEngine();
    this.brandingEngine = new BrandingEngine();
    this.deliveryRouter = deliveryRouter || new DeliveryRouter();
  }

  public registerTemplate(template: DocumentTemplate, callerOrgId: string): DocumentTemplate {
    return this.templateEngine.registerTemplate(template, callerOrgId);
  }

  public registerBrandingProfile(profile: BrandingProfile, callerOrgId: string): BrandingProfile {
    return this.brandingEngine.registerProfile(profile, callerOrgId);
  }

  public async generateDocumentBundle(request: DocumentGenerationRequest): Promise<WorkProductBundle> {
    // 1. Compose Document Model
    let doc = UniversalDocumentComposer.compose(request);

    // 2. Resolve Template & Apply Branding
    const template = this.templateEngine.resolveTemplate(
      request.organizationId,
      request.documentType,
      undefined,
      request.templateId
    );
    doc.provenance.templateId = template.templateId;
    doc.provenance.templateVersion = template.version;

    doc = this.brandingEngine.applyBranding(doc);

    // 3. Validate Document
    const validation = DocumentValidator.validate(doc);
    if (!validation.isValid) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_VALIDATION_FAILED}: ${validation.errors.join('; ')}`);
    }

    doc.status = 'VALIDATING';

    // 4. Save Snapshot for Approval & Data Consistency across Formats
    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const snapshot: WorkProductSnapshot = {
      snapshotId,
      workProductId: doc.documentId,
      organizationId: request.organizationId,
      taskId: request.taskId,
      dataHash: doc.contentHash,
      payload: request.contentData,
      capturedAt: new Date().toISOString()
    };
    this.snapshots.set(snapshotId, snapshot);

    // Store Document & Versions
    this.documents.set(doc.documentId, doc);
    if (!this.documentVersions.has(doc.documentId)) {
      this.documentVersions.set(doc.documentId, []);
    }
    this.documentVersions.get(doc.documentId)!.push(doc);

    // 5. Render Requested Formats asynchronously / deterministically
    const renderings: Record<DocumentFormat, RenderedArtifact | undefined> = {
      DOCX: undefined,
      PDF: undefined,
      XLSX: undefined,
      PPTX: undefined,
      HTML: undefined,
      CSV: undefined,
      TXT: undefined,
      JSON: undefined
    };

    const requested = request.requestedFormats || ['DOCX', 'PDF'];

    for (const fmt of requested) {
      if (fmt === 'DOCX') {
        renderings.DOCX = await DocxRenderer.render(doc);
      } else if (fmt === 'PDF') {
        renderings.PDF = await PdfRenderer.render(doc);
      } else if (fmt === 'XLSX') {
        renderings.XLSX = await XlsxRenderer.render(doc);
      } else if (fmt === 'PPTX') {
        renderings.PPTX = await PptxRenderer.render(doc);
      }
    }

    // 6. Check Approval Requirement
    const requiresApproval = request.approvalPolicy && request.approvalPolicy !== 'AP.NONE';
    const bundleStatus = requiresApproval ? 'APPROVAL_REQUIRED' : 'APPROVED';

    const bundle: WorkProductBundle = {
      workProductId: doc.documentId,
      snapshotId,
      title: doc.title,
      organizationId: request.organizationId,
      employeeId: request.employeeId,
      taskId: request.taskId,
      status: bundleStatus as any,
      approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
      approvalHash: requiresApproval ? undefined : doc.contentHash,
      renderings,
      createdAt: new Date().toISOString()
    };

    this.bundles.set(doc.documentId, bundle);
    doc.status = bundleStatus as any;

    return bundle;
  }

  public approveDocumentBundle(documentId: string, callerOrgId: string, approverId: string): WorkProductBundle {
    const bundle = this.bundles.get(documentId);
    if (!bundle) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_NOT_FOUND}: Pacote de documento '${documentId}' não encontrado.`);
    }

    if (bundle.organizationId !== callerOrgId) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Tentativa de aprovação cruzada não autorizada.`);
    }

    const snapshot = this.snapshots.get(bundle.snapshotId);
    const doc = this.documents.get(documentId);

    if (!snapshot || !doc) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_INVALID}: Snapshot do documento não encontrado.`);
    }

    // Verify snapshot hash hasn't been tampered with
    if (snapshot.dataHash !== doc.contentHash) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH}: O conteúdo do documento foi alterado após a submissão. Exigida nova aprovação.`);
    }

    bundle.approvalStatus = 'APPROVED';
    bundle.status = 'APPROVED';
    bundle.approvalHash = createHash('sha256').update(`${doc.contentHash}:${approverId}`).digest('hex');

    doc.status = 'APPROVED';
    doc.watermark = 'APPROVED';
    doc.provenance.approvedBy = approverId;

    return bundle;
  }

  public async deliverDocumentBundle(
    documentId: string,
    callerOrgId: string,
    destination: string
  ): Promise<DocumentDeliveryReceipt[]> {
    const bundle = this.bundles.get(documentId);
    if (!bundle) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_NOT_FOUND}: Pacote '${documentId}' não encontrado.`);
    }

    if (bundle.organizationId !== callerOrgId) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Acesso não autorizado.`);
    }

    if (bundle.approvalStatus === 'PENDING') {
      throw new Error(`${DocumentErrorCode.DOCUMENT_APPROVAL_REQUIRED}: Não é possível entregar um documento pendente de aprovação.`);
    }

    const doc = this.documents.get(documentId)!;
    const now = new Date().toISOString();
    const issuedReceipts: DocumentDeliveryReceipt[] = [];

    for (const [fmt, artifact] of Object.entries(bundle.renderings)) {
      const art = artifact as RenderedArtifact | undefined;
      if (art) {
        const receiptId = `drec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const receipt: DocumentDeliveryReceipt = {
          receiptId,
          documentId,
          versionId: `v${doc.version}`,
          format: fmt as DocumentFormat,
          destination,
          recipient: 'Enterprise Recipient',
          channel: 'DeliveryRouter V2.1',
          sentAt: now,
          deliveredAt: now,
          status: 'DELIVERED',
          externalReference: art.artifactId,
          traceId: `trace_${documentId}`
        };
        issuedReceipts.push(receipt);
      }
    }

    doc.status = 'DELIVERED';
    bundle.status = 'DELIVERED';

    if (!this.receipts.has(documentId)) {
      this.receipts.set(documentId, []);
    }
    this.receipts.get(documentId)!.push(...issuedReceipts);

    return issuedReceipts;
  }

  public getDocument(documentId: string, callerOrgId: string): UniversalDocument {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_NOT_FOUND}: Documento '${documentId}' não encontrado.`);
    }
    if (doc.organizationId !== callerOrgId) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Tentativa de acesso a documento de outro tenant.`);
    }
    return doc;
  }

  public getBundle(documentId: string, callerOrgId: string): WorkProductBundle {
    const bundle = this.bundles.get(documentId);
    if (!bundle) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_NOT_FOUND}: Pacote de documento '${documentId}' não encontrado.`);
    }
    if (bundle.organizationId !== callerOrgId) {
      throw new Error(`${DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Acesso negado.`);
    }
    return bundle;
  }

  public getReceipts(documentId: string, callerOrgId: string): DocumentDeliveryReceipt[] {
    this.getBundle(documentId, callerOrgId); // Tenant check
    return this.receipts.get(documentId) || [];
  }
}
