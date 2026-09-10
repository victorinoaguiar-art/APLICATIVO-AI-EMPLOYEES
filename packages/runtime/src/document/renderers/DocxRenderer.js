"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxRenderer = void 0;
const crypto_1 = require("crypto");
class DocxRenderer {
    static async render(doc) {
        const format = 'DOCX';
        const now = new Date().toISOString();
        let docxTextContent = `==================================================\n`;
        docxTextContent += `MICROSOFT WORD DOCUMENT (.DOCX)\n`;
        docxTextContent += `==================================================\n`;
        docxTextContent += `ORGANIZAÇÃO: ${doc.organizationId}\n`;
        docxTextContent += `CABEÇALHO: ${doc.headerText || ''}\n`;
        docxTextContent += `TÍTULO: ${doc.title.toUpperCase()}\n`;
        docxTextContent += `CLASSIFICAÇÃO: ${doc.classification}\n`;
        docxTextContent += `MARCA DE ÁGUA: ${doc.watermark || 'NENHUMA'}\n`;
        docxTextContent += `==================================================\n\n`;
        for (const section of doc.sections || []) {
            if (section.title) {
                docxTextContent += `--- SECÇÃO: ${section.title.toUpperCase()} ---\n\n`;
            }
            for (const elem of section.elements || []) {
                if (elem.type === 'heading') {
                    docxTextContent += `${'#'.repeat(elem.level)} ${elem.text}\n\n`;
                }
                else if (elem.type === 'paragraph') {
                    docxTextContent += `${elem.text}\n\n`;
                }
                else if (elem.type === 'table') {
                    if (elem.caption)
                        docxTextContent += `[Tabela: ${elem.caption}]\n`;
                    docxTextContent += `| ${elem.headers.join(' | ')} |\n`;
                    docxTextContent += `| ${elem.headers.map(() => '---').join(' | ')} |\n`;
                    for (const row of elem.rows) {
                        docxTextContent += `| ${row.join(' | ')} |\n`;
                    }
                    if (elem.totalsRow) {
                        docxTextContent += `| TOTAL: ${elem.totalsRow.join(' | ')} |\n`;
                    }
                    docxTextContent += `\n`;
                }
                else if (elem.type === 'list') {
                    for (let i = 0; i < elem.items.length; i++) {
                        const prefix = elem.ordered ? `${i + 1}.` : '•';
                        docxTextContent += `${prefix} ${elem.items[i]}\n`;
                    }
                    docxTextContent += `\n`;
                }
                else if (elem.type === 'callout') {
                    docxTextContent += `[CALLOUT (${elem.variant.toUpperCase()}): ${elem.text}]\n\n`;
                }
                else if (elem.type === 'signature_block') {
                    docxTextContent += `--------------------------------------------------\n`;
                    docxTextContent += `Assinatura: ${elem.signerName || '________________________'}\n`;
                    docxTextContent += `Cargo: ${elem.signerTitle}\n`;
                    docxTextContent += `Data: ${elem.date || now.split('T')[0]}\n`;
                    docxTextContent += `--------------------------------------------------\n\n`;
                }
                else if (elem.type === 'page_break') {
                    docxTextContent += `--- [QUEBRA DE PÁGINA] ---\n\n`;
                }
            }
        }
        docxTextContent += `==================================================\n`;
        docxTextContent += `RODAPÉ: ${doc.footerText || ''}\n`;
        docxTextContent += `PROVENIÊNCIA: Tarefa #${doc.provenance.taskId} | Empregado #${doc.provenance.employeeId}\n`;
        docxTextContent += `HASH CONTEÚDO SHA-256: ${doc.contentHash}\n`;
        docxTextContent += `==================================================\n`;
        const contentHash = (0, crypto_1.createHash)('sha256').update(docxTextContent).digest('hex');
        const artifactId = `art_docx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        return {
            artifactId,
            documentId: doc.documentId,
            version: doc.version,
            format,
            contentHash,
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSizeBytes: Buffer.byteLength(docxTextContent, 'utf-8'),
            downloadUrl: `/api/v1/documents/${doc.documentId}/download?format=DOCX&v=${doc.version}`,
            renderedAt: now
        };
    }
}
exports.DocxRenderer = DocxRenderer;
//# sourceMappingURL=DocxRenderer.js.map