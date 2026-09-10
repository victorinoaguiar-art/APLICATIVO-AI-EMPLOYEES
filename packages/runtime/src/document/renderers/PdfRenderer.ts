import {
  UniversalDocument,
  RenderedArtifact,
  DocumentFormat
} from '@ai-employee/shared';
import { createHash } from 'crypto';

export class PdfRenderer {
  public static async render(doc: UniversalDocument): Promise<RenderedArtifact> {
    const format: DocumentFormat = 'PDF';
    const now = new Date().toISOString();

    let pdfContent = `%PDF-1.7\n`;
    pdfContent += `% UNIVERSAL PDF RENDERER (AI EMPLOYEE PLATFORM V2.1)\n`;
    pdfContent += `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`;
    pdfContent += `2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n`;
    pdfContent += `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >> endobj\n`;

    let pdfText = `[PDF DOCUMENT]\n`;
    pdfText += `ORGANIZAÇÃO: ${doc.organizationId}\n`;
    pdfText += `MARCA DE ÁGUA: [ ${doc.watermark || 'APPROVED'} ]\n`;
    pdfText += `CABEÇALHO: ${doc.headerText || ''}\n`;
    pdfText += `TÍTULO: ${doc.title}\n\n`;

    for (const sec of doc.sections || []) {
      if (sec.title) pdfText += `== ${sec.title} ==\n`;
      for (const elem of sec.elements || []) {
        if (elem.type === 'paragraph') pdfText += `${elem.text}\n`;
        else if (elem.type === 'heading') pdfText += `\n# ${elem.text}\n`;
        else if (elem.type === 'table') {
          pdfText += `TABELA (${elem.headers.join(' | ')})\n`;
          for (const row of elem.rows) pdfText += `> ${row.join(' | ')}\n`;
        }
      }
    }

    pdfText += `\nRODAPÉ: ${doc.footerText || ''}\n`;
    pdfText += `VERIFICAÇÃO SHA-256: ${doc.contentHash}\n`;

    pdfContent += `4 0 obj << /Length ${Buffer.byteLength(pdfText, 'utf-8')} >> stream\n${pdfText}\nendstream\nendobj\n`;
    pdfContent += `xref\n0 5\n0000000000 65535 f \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n%%EOF`;

    const contentHash = createHash('sha256').update(pdfContent).digest('hex');
    const artifactId = `art_pdf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return {
      artifactId,
      documentId: doc.documentId,
      version: doc.version,
      format,
      contentHash,
      mimeType: 'application/pdf',
      fileSizeBytes: Buffer.byteLength(pdfContent, 'utf-8'),
      downloadUrl: `/api/v1/documents/${doc.documentId}/download?format=PDF&v=${doc.version}`,
      renderedAt: now
    };
  }
}
