import { UniversalDocument, DocumentGenerationRequest, WorkProductBundle, DocumentDeliveryReceipt, DocumentTemplate, BrandingProfile } from '@ai-employee/shared';
import { DeliveryRouter } from '../delivery/DeliveryRouter.js';
export declare class DocumentService {
    private templateEngine;
    private brandingEngine;
    private deliveryRouter;
    private documents;
    private documentVersions;
    private bundles;
    private snapshots;
    private receipts;
    constructor(deliveryRouter?: DeliveryRouter);
    registerTemplate(template: DocumentTemplate, callerOrgId: string): DocumentTemplate;
    registerBrandingProfile(profile: BrandingProfile, callerOrgId: string): BrandingProfile;
    generateDocumentBundle(request: DocumentGenerationRequest): Promise<WorkProductBundle>;
    approveDocumentBundle(documentId: string, callerOrgId: string, approverId: string): WorkProductBundle;
    deliverDocumentBundle(documentId: string, callerOrgId: string, destination: string): Promise<DocumentDeliveryReceipt[]>;
    getDocument(documentId: string, callerOrgId: string): UniversalDocument;
    getBundle(documentId: string, callerOrgId: string): WorkProductBundle;
    getReceipts(documentId: string, callerOrgId: string): DocumentDeliveryReceipt[];
}
//# sourceMappingURL=DocumentService.d.ts.map