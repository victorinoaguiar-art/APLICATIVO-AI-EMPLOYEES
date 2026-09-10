"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PptxRenderer = void 0;
const crypto_1 = require("crypto");
class PptxRenderer {
    static async render(doc) {
        const format = 'PPTX';
        const now = new Date().toISOString();
        let pptxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
        pptxContent += `<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n`;
        pptxContent += `  <!-- POWERPOINT EXECUTIVE PRESENTATION -->\n`;
        pptxContent += `  <!-- SLIDE 1: TITLE SLIDE -->\n`;
        pptxContent += `  <slide id="1" type="TITLE">\n`;
        pptxContent += `    <title>${doc.title}</title>\n`;
        pptxContent += `    <subtitle>Apresentação Executiva para ${doc.organizationId}</subtitle>\n`;
        pptxContent += `    <classification>${doc.classification}</classification>\n`;
        pptxContent += `  </slide>\n`;
        let slideId = 2;
        for (const sec of doc.sections || []) {
            pptxContent += `  <!-- SLIDE ${slideId}: SECTION ${sec.title || 'DETALHES'} -->\n`;
            pptxContent += `  <slide id="${slideId}" type="SECTION">\n`;
            pptxContent += `    <title>${sec.title || 'Secção'}</title>\n`;
            for (const elem of sec.elements || []) {
                if (elem.type === 'paragraph') {
                    pptxContent += `    <bodyText>${elem.text}</bodyText>\n`;
                }
                else if (elem.type === 'chart') {
                    pptxContent += `    <chart type="${elem.chartType}" title="${elem.title}"/>\n`;
                }
                else if (elem.type === 'list') {
                    pptxContent += `    <bulletList>${elem.items.join(' | ')}</bulletList>\n`;
                }
            }
            pptxContent += `  </slide>\n`;
            slideId++;
        }
        pptxContent += `  <!-- HASH: ${doc.contentHash} -->\n`;
        pptxContent += `</p:presentation>`;
        const contentHash = (0, crypto_1.createHash)('sha256').update(pptxContent).digest('hex');
        const artifactId = `art_pptx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        return {
            artifactId,
            documentId: doc.documentId,
            version: doc.version,
            format,
            contentHash,
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            fileSizeBytes: Buffer.byteLength(pptxContent, 'utf-8'),
            downloadUrl: `/api/v1/documents/${doc.documentId}/download?format=PPTX&v=${doc.version}`,
            renderedAt: now
        };
    }
}
exports.PptxRenderer = PptxRenderer;
//# sourceMappingURL=PptxRenderer.js.map