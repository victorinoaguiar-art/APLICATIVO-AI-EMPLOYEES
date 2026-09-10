import {
  UniversalDocument,
  RenderedArtifact,
  DocumentFormat
} from '@ai-employee/shared';
import { createHash } from 'crypto';

export class XlsxRenderer {
  public static async render(doc: UniversalDocument): Promise<RenderedArtifact> {
    const format: DocumentFormat = 'XLSX';
    const now = new Date().toISOString();

    let xlsxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    xlsxContent += `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n`;
    xlsxContent += `  <sheets>\n`;
    xlsxContent += `    <sheet name="DASHBOARD" sheetId="1" r:id="rId1"/>\n`;
    xlsxContent += `    <sheet name="SUMMARY" sheetId="2" r:id="rId2"/>\n`;
    xlsxContent += `    <sheet name="RAW_DATA" sheetId="3" r:id="rId3"/>\n`;
    xlsxContent += `  </sheets>\n`;

    let dataRowsStr = '';
    for (const sec of doc.sections || []) {
      for (const elem of sec.elements || []) {
        if (elem.type === 'table') {
          dataRowsStr += `[SHEET: RAW_DATA] CABEÇALHOS: ${elem.headers.join(', ')}\n`;
          for (let r = 0; r < elem.rows.length; r++) {
            dataRowsStr += `LINHA ${r + 1}: ${elem.rows[r].join(' | ')}\n`;
          }
          if (elem.totalsRow) {
            dataRowsStr += `FÓRMULA SOMA TOTAL: =SUM(B2:B${elem.rows.length + 1}) | VALOR: ${elem.totalsRow.join(' | ')}\n`;
          }
        }
      }
    }

    xlsxContent += `  <!-- DATA CONTENT LAYER -->\n`;
    xlsxContent += `  <!-- MOEDA: ${doc.currency} | LOCALE: ${doc.locale} -->\n`;
    xlsxContent += `  <!-- HASH: ${doc.contentHash} -->\n`;
    xlsxContent += `  <dataPayload>${dataRowsStr}</dataPayload>\n`;
    xlsxContent += `</workbook>`;

    const contentHash = createHash('sha256').update(xlsxContent).digest('hex');
    const artifactId = `art_xlsx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return {
      artifactId,
      documentId: doc.documentId,
      version: doc.version,
      format,
      contentHash,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileSizeBytes: Buffer.byteLength(xlsxContent, 'utf-8'),
      downloadUrl: `/api/v1/documents/${doc.documentId}/download?format=XLSX&v=${doc.version}`,
      renderedAt: now
    };
  }
}
