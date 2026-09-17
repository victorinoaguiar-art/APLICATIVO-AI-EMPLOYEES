import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import * as zlib from 'node:zlib';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { OperationalPilotMode } from '@ai-employee/shared';

// Standard CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  CRC_TABLE[i] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export interface ZipEntry {
  path: string;
  data: Buffer;
}

export class SimpleZip {
  public static create(entries: ZipEntry[]): Buffer {
    const localHeaders: Buffer[] = [];
    const centralHeaders: Buffer[] = [];
    let offset = 0;

    for (const entry of entries) {
      const fileNameBuf = Buffer.from(entry.path, 'utf8');
      const dataBuf = entry.data;
      const crc = crc32(dataBuf);
      const size = dataBuf.length;

      // Local file header (30 bytes + name)
      const localHdr = Buffer.alloc(30 + fileNameBuf.length);
      localHdr.writeUInt32LE(0x04034b50, 0); // local signature
      localHdr.writeUInt16LE(20, 4);         // version needed (2.0)
      localHdr.writeUInt16LE(0, 6);          // general purpose flag
      localHdr.writeUInt16LE(0, 8);          // compression method (0 = stored)
      localHdr.writeUInt16LE(0, 10);         // last mod file time
      localHdr.writeUInt16LE(0, 12);         // last mod file date
      localHdr.writeUInt32LE(crc, 14);       // crc-32
      localHdr.writeUInt32LE(size, 18);      // compressed size
      localHdr.writeUInt32LE(size, 22);      // uncompressed size
      localHdr.writeUInt16LE(fileNameBuf.length, 26); // file name length
      localHdr.writeUInt16LE(0, 28);         // extra field length
      fileNameBuf.copy(localHdr, 30);

      localHeaders.push(localHdr, dataBuf);

      // Central directory header (46 bytes + name)
      const centralHdr = Buffer.alloc(46 + fileNameBuf.length);
      centralHdr.writeUInt32LE(0x02014b50, 0); // central signature
      centralHdr.writeUInt16LE(20, 4);         // version made by
      centralHdr.writeUInt16LE(20, 6);         // version needed
      centralHdr.writeUInt16LE(0, 8);          // flag
      centralHdr.writeUInt16LE(0, 10);         // compression method (0 = stored)
      centralHdr.writeUInt16LE(0, 12);         // time
      centralHdr.writeUInt16LE(0, 14);         // date
      centralHdr.writeUInt32LE(crc, 16);       // crc
      centralHdr.writeUInt32LE(size, 20);      // compressed size
      centralHdr.writeUInt32LE(size, 24);      // uncompressed size
      centralHdr.writeUInt16LE(fileNameBuf.length, 28); // name length
      centralHdr.writeUInt16LE(0, 30);         // extra field length
      centralHdr.writeUInt16LE(0, 32);         // file comment length
      centralHdr.writeUInt16LE(0, 34);         // disk number start
      centralHdr.writeUInt16LE(0, 36);         // internal file attributes
      centralHdr.writeUInt32LE(0, 38);         // external file attributes
      centralHdr.writeUInt32LE(offset, 42);    // relative offset of local header
      fileNameBuf.copy(centralHdr, 46);

      centralHeaders.push(centralHdr);
      offset += localHdr.length + dataBuf.length;
    }

    const centralDirBuf = Buffer.concat(centralHeaders);
    const centralDirSize = centralDirBuf.length;
    const centralDirOffset = offset;

    // End of central directory record (22 bytes)
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
    eocd.writeUInt16LE(0, 4);          // number of this disk
    eocd.writeUInt16LE(0, 6);          // number of disk with start of CD
    eocd.writeUInt16LE(entries.length, 8);  // total entries in CD on this disk
    eocd.writeUInt16LE(entries.length, 10); // total entries in CD
    eocd.writeUInt32LE(centralDirSize, 12); // size of CD
    eocd.writeUInt32LE(centralDirOffset, 16); // offset of start of CD
    eocd.writeUInt16LE(0, 20);         // comment length

    return Buffer.concat([...localHeaders, centralDirBuf, eocd]);
  }

  public static readEntries(buf: Buffer): Map<string, Buffer> {
    if (buf.length < 22) throw new Error('Buffer demasiado pequeno para ser um ZIP válido');
    if (buf.readUInt32LE(0) !== 0x04034b50) {
      throw new Error('Assinatura ZIP inválida: magic bytes PK\\x03\\x04 ausentes');
    }

    const result = new Map<string, Buffer>();
    let pos = 0;
    while (pos + 30 <= buf.length) {
      const sig = buf.readUInt32LE(pos);
      if (sig !== 0x04034b50) break; // Reached central dir or end

      const method = buf.readUInt16LE(pos + 8);
      const compSize = buf.readUInt32LE(pos + 18);
      const uncompSize = buf.readUInt32LE(pos + 22);
      const nameLen = buf.readUInt16LE(pos + 26);
      const extraLen = buf.readUInt16LE(pos + 28);
      const name = buf.toString('utf8', pos + 30, pos + 30 + nameLen);
      const dataStart = pos + 30 + nameLen + extraLen;
      const dataEnd = dataStart + compSize;
      if (dataEnd > buf.length) break;

      let fileData = buf.subarray(dataStart, dataEnd);
      if (method === 8) {
        fileData = zlib.inflateRawSync(fileData);
      }
      result.set(name, fileData);
      pos = dataEnd;
    }
    return result;
  }
}

export class PhysicalDocumentValidator {
  public static validate(
    filePathOrBuffer: string | Buffer,
    format: 'PDF' | 'DOCX' | 'XLSX' | 'JSON',
    mode: OperationalPilotMode
  ): { isValid: boolean; sha256: string; error?: string } {
    let buf: Buffer;
    if (typeof filePathOrBuffer === 'string') {
      if (!fs.existsSync(filePathOrBuffer)) {
        return { isValid: false, sha256: '', error: `Ficheiro físico não encontrado: ${filePathOrBuffer}` };
      }
      buf = fs.readFileSync(filePathOrBuffer);
    } else {
      buf = filePathOrBuffer;
    }

    if (buf.length === 0) {
      return { isValid: false, sha256: '', error: 'Ficheiro físico vazio (0 bytes).' };
    }

    const hash = createHash('sha256').update(buf).digest('hex');
    const textStart = buf.subarray(0, 100).toString('utf8');

    // 1. Prohibit mock text markers in OPERATIONAL_PILOT
    if (mode === 'OPERATIONAL_PILOT') {
      if (textStart.includes('[PDF DOCUMENT]') || textStart.includes('[DOCX DOCUMENT]') || textStart.includes('[XLSX SPREADSHEET]')) {
        return {
          isValid: false,
          sha256: hash,
          error: 'Marcadores textuais simulados [PDF/DOCX/XLSX DOCUMENT] são proibidos em modo OPERATIONAL_PILOT.'
        };
      }
    }

    // 2. Format specific binary validation
    try {
      if (format === 'PDF') {
        const fullText = buf.toString('utf8');
        if (!buf.subarray(0, 5).toString('utf8').startsWith('%PDF-')) {
          return { isValid: false, sha256: hash, error: 'Estrutura PDF inválida: cabeçalho %PDF- ausente.' };
        }
        if (!fullText.includes('%%EOF')) {
          return { isValid: false, sha256: hash, error: 'Estrutura PDF inválida: finalizador %%EOF ausente.' };
        }
        if (!fullText.includes('xref') && !fullText.includes('/Type /Catalog')) {
          return { isValid: false, sha256: hash, error: 'Estrutura PDF inválida: catálogo ou xref ausente.' };
        }
        this.checkPlaceholders(fullText);
      } else if (format === 'DOCX') {
        if (mode === 'OPERATIONAL_PILOT' || buf.subarray(0, 4).readUInt32LE(0) === 0x04034b50) {
          const entries = SimpleZip.readEntries(buf);
          if (!entries.has('[Content_Types].xml') || !entries.has('word/document.xml')) {
            return { isValid: false, sha256: hash, error: 'Pacote DOCX inválido: arquivos OpenXML obrigatórios ausentes.' };
          }
          const docXml = entries.get('word/document.xml')!.toString('utf8');
          if (!docXml.includes('w:document') && !docXml.includes('w:body')) {
            return { isValid: false, sha256: hash, error: 'DOCX corrompido: namespace OpenXML Word ausente.' };
          }
          this.checkPlaceholders(docXml);
        } else {
          // In simulation mode text format
          const text = buf.toString('utf8');
          this.checkPlaceholders(text);
        }
      } else if (format === 'XLSX') {
        if (mode === 'OPERATIONAL_PILOT' || buf.subarray(0, 4).readUInt32LE(0) === 0x04034b50) {
          const entries = SimpleZip.readEntries(buf);
          if (!entries.has('[Content_Types].xml') || (!entries.has('xl/workbook.xml') && !entries.has('xl/worksheets/sheet1.xml'))) {
            return { isValid: false, sha256: hash, error: 'Pacote XLSX inválido: arquivos OpenXML obrigatórios ausentes.' };
          }
          const sheetXml = entries.get('xl/worksheets/sheet1.xml') || entries.get('xl/workbook.xml');
          this.checkPlaceholders(sheetXml!.toString('utf8'));
        } else {
          // In simulation mode text format
          const text = buf.toString('utf8');
          this.checkPlaceholders(text);
        }
      }
    } catch (err: any) {
      return { isValid: false, sha256: hash, error: `Falha ao validar documento: ${err.message}` };
    }

    return { isValid: true, sha256: hash };
  }

  public static checkPlaceholders(text: string): void {
    const badPatterns = [
      /\byyyy\b/i,
      /\[NOME\]/i,
      /\[VALOR\]/i,
      /\[DATA\]/i,
      /\{\{[a-zA-Z0-9_-]+\}\}/,
      /<PLACEHOLDER>/i,
      /\[INSERIR [^\]]+\]/i
    ];
    for (const pat of badPatterns) {
      if (pat.test(text)) {
        throw new Error(`Documento contém placeholder residual não preenchido (${pat}).`);
      }
    }
  }

  // -------------------------------------------------------------
  // Independent Parsers Validation (pdf-lib & jszip)
  // -------------------------------------------------------------
  public static async validateIndependentPdf(buf: Buffer): Promise<{ isValid: boolean; pageCount?: number; error?: string }> {
    try {
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      if (count === 0) {
        return { isValid: false, error: 'Documento PDF independente rejeitado: 0 páginas encontradas.' };
      }
      return { isValid: true, pageCount: count };
    } catch (err: any) {
      return { isValid: false, error: `Falha no leitor independente pdf-lib: ${err.message}` };
    }
  }

  public static async validateIndependentDocx(buf: Buffer): Promise<{ isValid: boolean; files?: string[]; error?: string }> {
    try {
      const zip = await JSZip.loadAsync(buf);
      const fileNames = Object.keys(zip.files);
      if (!fileNames.includes('[Content_Types].xml') || !fileNames.includes('word/document.xml')) {
        return { isValid: false, error: 'DOCX inválido no parser jszip: [Content_Types].xml ou word/document.xml ausente.' };
      }
      const docXml = await zip.files['word/document.xml'].async('string');
      if (!docXml.includes('w:document') && !docXml.includes('w:body')) {
        return { isValid: false, error: 'DOCX corrompido no parser jszip: estrutura OpenXML Word ausente.' };
      }
      this.checkPlaceholders(docXml);
      return { isValid: true, files: fileNames };
    } catch (err: any) {
      return { isValid: false, error: `Falha no leitor independente jszip para DOCX: ${err.message}` };
    }
  }

  public static async validateIndependentXlsx(buf: Buffer): Promise<{ isValid: boolean; files?: string[]; error?: string; cellCount?: number }> {
    try {
      const zip = await JSZip.loadAsync(buf);
      const fileNames = Object.keys(zip.files);
      if (!fileNames.includes('[Content_Types].xml') || (!fileNames.includes('xl/workbook.xml') && !fileNames.includes('xl/worksheets/sheet1.xml'))) {
        return { isValid: false, error: 'XLSX inválido no parser jszip: ficheiros OpenXML obrigatórios ausentes.' };
      }

      // Validar CRC e integridade descompactando todos os ficheiros
      for (const fn of fileNames) {
        const entry = zip.files[fn];
        if (!entry.dir) {
          await entry.async('uint8array');
        }
      }

      // Validar estrutura do workbook
      const wbEntry = zip.files['xl/workbook.xml'];
      if (!wbEntry) {
        return { isValid: false, error: 'XLSX inválido: xl/workbook.xml ausente.' };
      }
      const wbXml = await wbEntry.async('string');
      if (!wbXml.includes('<sheets') || !wbXml.includes('<sheet')) {
        return { isValid: false, error: 'XLSX inválido: nenhuma worksheet declarada no workbook.' };
      }

      // Validar estrutura da worksheet e presença de células
      const sheetEntry = zip.files['xl/worksheets/sheet1.xml'] || wbEntry;
      const sheetXml = await sheetEntry.async('string');
      if (!sheetXml.includes('<sheetData') || (!sheetXml.includes('<c ') && !sheetXml.includes('<c>'))) {
        return { isValid: false, error: 'XLSX inválido: folha de cálculo sem dados de células.' };
      }

      this.checkPlaceholders(sheetXml);
      const cellMatches = sheetXml.match(/<c\s/g) || [];
      return { isValid: true, files: fileNames, cellCount: cellMatches.length };
    } catch (err: any) {
      return { isValid: false, error: `Falha no leitor independente jszip para XLSX: ${err.message}` };
    }
  }

  public static async validateWithIndependentReaders(
    filePathOrBuffer: string | Buffer,
    format: 'PDF' | 'DOCX' | 'XLSX' | 'JSON',
    mode: OperationalPilotMode = 'OPERATIONAL_PILOT'
  ): Promise<{ isValid: boolean; sha256: string; error?: string; pageCount?: number; files?: string[]; cellCount?: number }> {
    const baseResult = this.validate(filePathOrBuffer, format, mode);
    if (!baseResult.isValid) {
      return baseResult;
    }

    let buf: Buffer;
    if (typeof filePathOrBuffer === 'string') {
      buf = fs.readFileSync(filePathOrBuffer);
    } else {
      buf = filePathOrBuffer;
    }

    if (format === 'PDF') {
      const ind = await this.validateIndependentPdf(buf);
      if (!ind.isValid) {
        return { isValid: false, sha256: baseResult.sha256, error: ind.error };
      }
      return { isValid: true, sha256: baseResult.sha256, pageCount: ind.pageCount };
    } else if (format === 'DOCX') {
      const ind = await this.validateIndependentDocx(buf);
      if (!ind.isValid) {
        return { isValid: false, sha256: baseResult.sha256, error: ind.error };
      }
      return { isValid: true, sha256: baseResult.sha256, files: ind.files };
    } else if (format === 'XLSX') {
      const ind = await this.validateIndependentXlsx(buf);
      if (!ind.isValid) {
        return { isValid: false, sha256: baseResult.sha256, error: ind.error };
      }
      return { isValid: true, sha256: baseResult.sha256, files: ind.files, cellCount: ind.cellCount };
    }

    return baseResult;
  }

  // -------------------------------------------------------------
  // Binary Document Builders for OPERATIONAL_PILOT
  // -------------------------------------------------------------
  public static buildRealBinaryPdf(title: string, bodyLines: string[]): Buffer {
    const objects: string[] = [];
    objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n`);

    const streamLines = [`BT /F1 12 Tf 50 750 Td (${title.replace(/[()]/g, '')}) Tj ET`];
    let y = 720;
    for (const line of bodyLines) {
      const clean = line.replace(/[()]/g, '');
      streamLines.push(`BT /F1 10 Tf 50 ${y} Td (${clean}) Tj ET`);
      y -= 18;
    }
    const streamContent = streamLines.join('\n');
    objects.push(`4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`);

    let out = `%PDF-1.7\n`;
    const offsets = [0];
    for (let i = 0; i < objects.length; i++) {
      offsets.push(Buffer.byteLength(out, 'utf8'));
      out += objects[i];
    }

    const startXref = Buffer.byteLength(out, 'utf8');
    out += `xref\n0 ${objects.length + 1}\n`;
    out += `0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

    return Buffer.from(out, 'utf8');
  }

  public static async buildRealBinaryPdfAsync(title: string, bodyLines: string[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const cleanTitle = title.replace(/[^\x20-\x7E]/g, ' ');
    // Desenhar conteúdo textual no PDF de forma padrão
    page.drawText(cleanTitle, { x: 50, y: 780, size: 14 });
    let y = 750;
    for (const line of bodyLines) {
      if (y < 50) break;
      const clean = line.replace(/[^\x20-\x7E]/g, ' ');
      page.drawText(clean, { x: 50, y, size: 10 });
      y -= 18;
    }
    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }

  public static buildRealBinaryDocx(title: string, paragraphs: string[]): Buffer {
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>
    ${paragraphs.map(p => `<w:p><w:r><w:t>${escapeXml(p)}</w:t></w:r></w:p>`).join('\n')}
  </w:body>
</w:document>`;

    return SimpleZip.create([
      { path: '[Content_Types].xml', data: Buffer.from(contentTypes, 'utf8') },
      { path: '_rels/.rels', data: Buffer.from(rels, 'utf8') },
      { path: 'word/document.xml', data: Buffer.from(documentXml, 'utf8') }
    ]);
  }

  public static buildRealBinaryXlsx(sheetTitle: string, rows: (string | number)[][]): Buffer {
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheets><sheet name="${escapeXml(sheetTitle)}" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets>
</workbook>`;

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rows.map((row, rIdx) => `
      <row r="${rIdx + 1}">
        ${row.map((cell, cIdx) => `<c r="${String.fromCharCode(65 + cIdx)}${rIdx + 1}" t="${typeof cell === 'number' ? 'n' : 'inlineStr'}">
          ${typeof cell === 'number' ? `<v>${cell}</v>` : `<is><t>${escapeXml(String(cell))}</t></is>`}
        </c>`).join('')}
      </row>`).join('')}
  </sheetData>
</worksheet>`;

    return SimpleZip.create([
      { path: '[Content_Types].xml', data: Buffer.from(contentTypes, 'utf8') },
      { path: '_rels/.rels', data: Buffer.from(rels, 'utf8') },
      { path: 'xl/workbook.xml', data: Buffer.from(workbookXml, 'utf8') },
      { path: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheetXml, 'utf8') }
    ]);
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
