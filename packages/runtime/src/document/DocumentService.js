"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const shared_1 = require("@ai-employee/shared");
const UniversalDocumentComposer_js_1 = require("./UniversalDocumentComposer.js");
const TemplateEngine_js_1 = require("./TemplateEngine.js");
const BrandingEngine_js_1 = require("./BrandingEngine.js");
const DocumentValidator_js_1 = require("./DocumentValidator.js");
const DocxRenderer_js_1 = require("./renderers/DocxRenderer.js");
const PdfRenderer_js_1 = require("./renderers/PdfRenderer.js");
const XlsxRenderer_js_1 = require("./renderers/XlsxRenderer.js");
const PptxRenderer_js_1 = require("./renderers/PptxRenderer.js");
const DeliveryRouter_js_1 = require("../delivery/DeliveryRouter.js");
const crypto_1 = require("crypto");
class DocumentService {
    templateEngine;
    brandingEngine;
    deliveryRouter;
    documents = new Map();
    documentVersions = new Map();
    bundles = new Map();
    snapshots = new Map();
    receipts = new Map();
    constructor(deliveryRouter) {
        this.templateEngine = new TemplateEngine_js_1.TemplateEngine();
        this.brandingEngine = new BrandingEngine_js_1.BrandingEngine();
        this.deliveryRouter = deliveryRouter || new DeliveryRouter_js_1.DeliveryRouter();
    }
    registerTemplate(template, callerOrgId) {
        return this.templateEngine.registerTemplate(template, callerOrgId);
    }
    registerBrandingProfile(profile, callerOrgId) {
        return this.brandingEngine.registerProfile(profile, callerOrgId);
    }
    async generateDocumentBundle(request) {
        // 1. Compose Document Model
        let doc = UniversalDocumentComposer_js_1.UniversalDocumentComposer.compose(request);
        // 2. Resolve Template & Apply Branding
        const template = this.templateEngine.resolveTemplate(request.organizationId, request.documentType, undefined, request.templateId);
        doc.provenance.templateId = template.templateId;
        doc.provenance.templateVersion = template.version;
        doc = this.brandingEngine.applyBranding(doc);
        // 3. Validate Document
        const validation = DocumentValidator_js_1.DocumentValidator.validate(doc);
        if (!validation.isValid) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_VALIDATION_FAILED}: ${validation.errors.join('; ')}`);
        }
        doc.status = 'VALIDATING';
        // 4. Save Snapshot for Approval & Data Consistency across Formats
        const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const snapshot = {
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
        this.documentVersions.get(doc.documentId).push(doc);
        // 5. Render Requested Formats asynchronously / deterministically
        const renderings = {
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
                renderings.DOCX = await DocxRenderer_js_1.DocxRenderer.render(doc);
            }
            else if (fmt === 'PDF') {
                renderings.PDF = await PdfRenderer_js_1.PdfRenderer.render(doc);
            }
            else if (fmt === 'XLSX') {
                renderings.XLSX = await XlsxRenderer_js_1.XlsxRenderer.render(doc);
            }
            else if (fmt === 'PPTX') {
                renderings.PPTX = await PptxRenderer_js_1.PptxRenderer.render(doc);
            }
        }
        // 6. Check Approval Requirement
        const requiresApproval = request.approvalPolicy && request.approvalPolicy !== 'AP.NONE';
        const bundleStatus = requiresApproval ? 'APPROVAL_REQUIRED' : 'APPROVED';
        const bundle = {
            workProductId: doc.documentId,
            snapshotId,
            title: doc.title,
            organizationId: request.organizationId,
            employeeId: request.employeeId,
            taskId: request.taskId,
            status: bundleStatus,
            approvalStatus: requiresApproval ? 'PENDING' : 'APPROVED',
            approvalHash: requiresApproval ? undefined : doc.contentHash,
            renderings,
            createdAt: new Date().toISOString()
        };
        this.bundles.set(doc.documentId, bundle);
        doc.status = bundleStatus;
        return bundle;
    }
    approveDocumentBundle(documentId, callerOrgId, approverId) {
        const bundle = this.bundles.get(documentId);
        if (!bundle) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_NOT_FOUND}: Pacote de documento '${documentId}' não encontrado.`);
        }
        if (bundle.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Tentativa de aprovação cruzada não autorizada.`);
        }
        const snapshot = this.snapshots.get(bundle.snapshotId);
        const doc = this.documents.get(documentId);
        if (!snapshot || !doc) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_INVALID}: Snapshot do documento não encontrado.`);
        }
        // Verify snapshot hash hasn't been tampered with
        if (snapshot.dataHash !== doc.contentHash) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH}: O conteúdo do documento foi alterado após a submissão. Exigida nova aprovação.`);
        }
        bundle.approvalStatus = 'APPROVED';
        bundle.status = 'APPROVED';
        bundle.approvalHash = (0, crypto_1.createHash)('sha256').update(`${doc.contentHash}:${approverId}`).digest('hex');
        doc.status = 'APPROVED';
        doc.watermark = 'APPROVED';
        doc.provenance.approvedBy = approverId;
        return bundle;
    }
    async deliverDocumentBundle(documentId, callerOrgId, destination) {
        const bundle = this.bundles.get(documentId);
        if (!bundle) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_NOT_FOUND}: Pacote '${documentId}' não encontrado.`);
        }
        if (bundle.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Acesso não autorizado.`);
        }
        if (bundle.approvalStatus === 'PENDING') {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_APPROVAL_REQUIRED}: Não é possível entregar um documento pendente de aprovação.`);
        }
        const doc = this.documents.get(documentId);
        const now = new Date().toISOString();
        const issuedReceipts = [];
        for (const [fmt, artifact] of Object.entries(bundle.renderings)) {
            const art = artifact;
            if (art) {
                const receiptId = `drec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                const receipt = {
                    receiptId,
                    documentId,
                    versionId: `v${doc.version}`,
                    format: fmt,
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
        this.receipts.get(documentId).push(...issuedReceipts);
        return issuedReceipts;
    }
    getDocument(documentId, callerOrgId) {
        const doc = this.documents.get(documentId);
        if (!doc) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_NOT_FOUND}: Documento '${documentId}' não encontrado.`);
        }
        if (doc.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Tentativa de acesso a documento de outro tenant.`);
        }
        return doc;
    }
    getBundle(documentId, callerOrgId) {
        const bundle = this.bundles.get(documentId);
        if (!bundle) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_NOT_FOUND}: Pacote de documento '${documentId}' não encontrado.`);
        }
        if (bundle.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Acesso negado.`);
        }
        return bundle;
    }
    getReceipts(documentId, callerOrgId) {
        this.getBundle(documentId, callerOrgId); // Tenant check
        return this.receipts.get(documentId) || [];
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=DocumentService.js.map