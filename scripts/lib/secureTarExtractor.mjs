import * as zlib from 'node:zlib';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

/**
 * Cria cabeçalho padrão USTAR (512 bytes)
 */
export function buildTarHeader(name, size, type = '0') {
  const buf = Buffer.alloc(512);
  buf.write(name, 0, 100, 'utf8');
  buf.write('0000644\0', 100, 8, 'utf8'); // mode
  buf.write('0000000\0', 108, 8, 'utf8'); // uid
  buf.write('0000000\0', 116, 8, 'utf8'); // gid
  const sizeOct = size.toString(8).padStart(11, '0') + ' ';
  buf.write(sizeOct, 124, 12, 'utf8');
  const mtimeOct = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' ';
  buf.write(mtimeOct, 136, 12, 'utf8');
  buf.fill(' ', 148, 156); // checksum placeholder
  buf[156] = String(type).charCodeAt(0);
  buf.write('ustar\0', 257, 6, 'utf8');
  buf.write('00', 263, 2, 'utf8');

  let chk = 0;
  for (let i = 0; i < 512; i++) chk += buf[i];
  const chkOct = chk.toString(8).padStart(6, '0') + '\0 ';
  buf.write(chkOct, 148, 8, 'utf8');
  return buf;
}

/**
 * Empacota uma lista de arquivos em Buffer .tar.gz canónico
 */
export function buildTarGz(files) {
  const chunks = [];
  for (const f of files) {
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, 'utf8');
    const type = f.type || '0';
    const header = buildTarHeader(f.name, data.length, type);
    chunks.push(header);
    chunks.push(data);
    const padLen = (512 - (data.length % 512)) % 512;
    if (padLen > 0) chunks.push(Buffer.alloc(padLen));
  }
  chunks.push(Buffer.alloc(1024)); // Final do arquivo tar
  const tarBuf = Buffer.concat(chunks);
  return zlib.gzipSync(tarBuf);
}

/**
 * Audita e extrai com segurança máxima um arquivo tar ou tar.gz
 */
export function auditAndExtractTar(archiveBufferOrPath, targetDir, options = {}) {
  const maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5 MB
  const maxTotalSize = options.maxTotalSize || 10 * 1024 * 1024; // 10 MB
  const maxCompressionRatio = options.maxCompressionRatio || 100;
  const allowedFiles = options.allowedFiles ? new Set(options.allowedFiles) : null;

  let rawCompressed = Buffer.isBuffer(archiveBufferOrPath)
    ? archiveBufferOrPath
    : fs.readFileSync(archiveBufferOrPath);

  if (rawCompressed.length === 0) {
    throw new Error('Arquivo de pacote tar está completamente vazio.');
  }

  // 1. Descompressão com proteção contra Decompression Bomb
  let tarBuf;
  if (rawCompressed[0] === 0x1f && rawCompressed[1] === 0x8b) {
    try {
      tarBuf = zlib.gunzipSync(rawCompressed);
    } catch (err) {
      throw new Error(`Falha ao descompactar gzip do pacote: ${err.message}`);
    }
    const ratio = tarBuf.length / rawCompressed.length;
    if (ratio > maxCompressionRatio && tarBuf.length > maxTotalSize) {
      throw new Error(`Taxa de expansão (${ratio.toFixed(1)}x) excede limite de segurança (tar-bomb detectado).`);
    }
  } else {
    tarBuf = rawCompressed;
  }

  if (tarBuf.length < 512) {
    throw new Error('Arquivo tar truncado ou menor que um bloco de 512 bytes.');
  }

  // 2. Pré-Auditoria de todas as entradas antes de qualquer escrita em disco
  const entriesToExtract = [];
  const seenNormalizedNames = new Set();
  let totalUncompressedSize = 0;
  let offset = 0;

  while (offset + 512 <= tarBuf.length) {
    const header = tarBuf.subarray(offset, offset + 512);
    offset += 512;

    // Dois blocos zerados indicam fim de arquivo
    if (header.every(b => b === 0)) {
      break;
    }

    const magic = header.subarray(257, 263).toString('utf8').replace(/\0/g, '');
    let name = header.subarray(0, 100).toString('utf8').replace(/\0/g, '').trim();
    if (magic.startsWith('ustar')) {
      const prefix = header.subarray(345, 500).toString('utf8').replace(/\0/g, '').trim();
      if (prefix) name = prefix + '/' + name;
    }

    if (!name) {
      throw new Error('Entrada com nome vazio detectada no arquivo tar.');
    }

    // Rejeitar caminhos absolutos
    if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:/.test(name) || path.isAbsolute(name)) {
      throw new Error(`Caminho absoluto proibido no arquivo tar: '${name}'.`);
    }

    // Rejeitar sequências '..'
    const pathParts = name.replace(/\\/g, '/').split('/');
    if (pathParts.includes('..')) {
      throw new Error(`Path traversal ('..') proibido no arquivo tar: '${name}'.`);
    }

    const normalizedName = path.normalize(name).replace(/\\/g, '/').replace(/^\.\//, '');
    if (normalizedName.startsWith('../') || normalizedName === '..') {
      throw new Error(`Path traversal proibido após normalização: '${normalizedName}'.`);
    }

    // Verificar colisão / duplicação
    if (seenNormalizedNames.has(normalizedName)) {
      throw new Error(`Entrada duplicada ou colisão de caminho no arquivo tar: '${normalizedName}'.`);
    }
    seenNormalizedNames.add(normalizedName);

    // Avaliar tipo de entrada
    const type = String.fromCharCode(header[156] || 48);
    if (type === '1') {
      throw new Error(`Hardlink proibido no arquivo tar: '${name}'.`);
    }
    if (type === '2') {
      throw new Error(`Symlink proibido no arquivo tar: '${name}'.`);
    }
    if (type === '3' || type === '4' || type === '6') {
      throw new Error(`Entrada de dispositivo especial (device/fifo/socket) proibida no arquivo tar: '${name}'.`);
    }
    if (type === '5') {
      // Directório: se permitido, garantir que fica sob targetDir
      continue;
    }
    if (type !== '0' && type !== '\0') {
      throw new Error(`Tipo de entrada não autorizada ('${type}') no arquivo tar: '${name}'.`);
    }

    // Tamanho do arquivo
    const sizeStr = header.subarray(124, 136).toString('utf8').replace(/\0/g, '').trim();
    const size = parseInt(sizeStr, 8) || 0;

    if (size > maxFileSize) {
      throw new Error(`Tamanho do ficheiro '${name}' (${size} bytes) excede o limite máximo permitido (${maxFileSize} bytes).`);
    }

    totalUncompressedSize += size;
    if (totalUncompressedSize > maxTotalSize) {
      throw new Error(`Tamanho total descompactado (${totalUncompressedSize} bytes) excede o limite máximo permitido (${maxTotalSize} bytes).`);
    }

    // Validar se está entre os ficheiros permitidos pelo manifesto
    if (allowedFiles && !allowedFiles.has(normalizedName)) {
      throw new Error(`Ficheiro inesperado pelo manifesto no arquivo: '${normalizedName}'.`);
    }

    if (offset + size > tarBuf.length) {
      throw new Error(`Ficheiro '${name}' truncado no arquivo tar.`);
    }

    const data = tarBuf.subarray(offset, offset + size);
    const pad = (512 - (size % 512)) % 512;
    offset += size + pad;

    entriesToExtract.push({
      name: normalizedName,
      size,
      data
    });
  }

  // Se allowedFiles foi especificado, verificar se todos foram encontrados
  if (allowedFiles) {
    for (const af of allowedFiles) {
      if (!seenNormalizedNames.has(af)) {
        throw new Error(`Ficheiro obrigatório '${af}' ausente no arquivo tar.`);
      }
    }
  }

  // 3. Extração Segura em Disco
  fs.mkdirSync(targetDir, { recursive: true });
  const targetDirResolved = path.resolve(targetDir);

  const extracted = [];
  for (const entry of entriesToExtract) {
    const destPath = path.resolve(targetDirResolved, entry.name);

    // Garantir rigorosamente que destPath está dentro de targetDirResolved
    if (!destPath.startsWith(targetDirResolved + path.sep) && destPath !== targetDirResolved) {
      throw new Error(`Caminho de extração escapa do directório de destino: '${destPath}'.`);
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, entry.data);

    // Confirmação pós-extração
    const st = fs.lstatSync(destPath);
    if (st.isSymbolicLink()) {
      throw new Error(`Ficheiro extraído '${entry.name}' foi detectado como symlink.`);
    }
    if (!st.isFile()) {
      throw new Error(`Ficheiro extraído '${entry.name}' não é um ficheiro regular.`);
    }

    extracted.push({
      name: entry.name,
      size: entry.size,
      sha256: sha256(entry.data),
      path: destPath
    });
  }

  return extracted;
}

/**
 * Constrói um Buffer ZIP canónico para testes determinísticos
 */
export function buildZip(files) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const f of files) {
    const content = f.data !== undefined ? f.data : (f.content !== undefined ? f.content : Buffer.alloc(0));
    const rawData = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const nameBuf = Buffer.from(f.name, 'utf8');
    const crc = zlib.crc32(rawData);
    const compressed = f.compress === false ? rawData : zlib.deflateRawSync(rawData);
    const method = f.compress === false ? 0 : 8;
    const isSymlink = f.type === '2' || f.isSymlink;
    const isHardlink = f.type === '1' || f.isHardlink;
    const isFifo = f.type === '6' || f.isFifo;

    let modeBits = 0o100644;
    if (isSymlink) modeBits = 0o120777;
    if (isFifo) modeBits = 0o010666;
    if (isHardlink) modeBits = 0o100644;
    const externalAttrs = (modeBits * 65536) >>> 0;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt32LE(0, 10);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(rawData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localChunks.push(localHeader, nameBuf, compressed);

    const cdHeader = Buffer.alloc(46);
    cdHeader.writeUInt32LE(0x02014b50, 0);
    cdHeader.writeUInt16LE(20, 4);
    cdHeader.writeUInt16LE(20, 6);
    cdHeader.writeUInt16LE(0, 8);
    cdHeader.writeUInt16LE(method, 10);
    cdHeader.writeUInt32LE(0, 12);
    cdHeader.writeUInt32LE(crc, 16);
    cdHeader.writeUInt32LE(compressed.length, 20);
    cdHeader.writeUInt32LE(rawData.length, 24);
    cdHeader.writeUInt16LE(nameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30);
    cdHeader.writeUInt16LE(0, 32);
    cdHeader.writeUInt16LE(0, 34);
    cdHeader.writeUInt16LE(0, 36);
    cdHeader.writeUInt32LE(externalAttrs, 38);
    cdHeader.writeUInt32LE(offset, 42);
    centralChunks.push(cdHeader, nameBuf);
    offset += 30 + nameBuf.length + compressed.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const c of centralChunks) cdSize += c.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, ...centralChunks, eocd]);
}

/**
 * Audita e extrai com segurança máxima um arquivo ZIP externo
 */
export function auditAndExtractZip(archiveBufferOrPath, targetDir, options = {}) {
  const maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5 MB
  const maxTotalSize = options.maxTotalSize || 10 * 1024 * 1024; // 10 MB
  const maxCompressionRatio = options.maxCompressionRatio || 100;
  const maxEntries = options.maxEntries || 100;
  const allowedFiles = options.allowedFiles ? new Set(options.allowedFiles) : null;

  const rawZip = Buffer.isBuffer(archiveBufferOrPath)
    ? archiveBufferOrPath
    : fs.readFileSync(archiveBufferOrPath);

  if (rawZip.length === 0) {
    throw new Error('Arquivo ZIP está completamente vazio.');
  }
  if (rawZip.length < 22) {
    throw new Error('Arquivo ZIP truncado ou estruturalmente inválido.');
  }

  // 1. Localizar End of Central Directory (EOCD)
  let eocdOffset = -1;
  for (let i = rawZip.length - 22; i >= Math.max(0, rawZip.length - 65557); i--) {
    if (rawZip.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }

  if (eocdOffset === -1) {
    throw new Error('Assinatura de fim do directório central (EOCD) não encontrada no arquivo ZIP.');
  }

  const entryCount = rawZip.readUInt16LE(eocdOffset + 10);
  const cdSize = rawZip.readUInt32LE(eocdOffset + 12);
  const cdOffset = rawZip.readUInt32LE(eocdOffset + 16);

  if (entryCount > maxEntries) {
    throw new Error(`Número de entradas no ZIP (${entryCount}) excede o limite de segurança (${maxEntries}).`);
  }
  if (cdOffset + cdSize > rawZip.length) {
    throw new Error('Directório central do ZIP excede o tamanho físico do arquivo.');
  }

  // 2. Pré-auditoria das entradas
  const entriesToExtract = [];
  const seenNormalizedNames = new Set();
  let totalUncompressedSize = 0;
  let pos = cdOffset;

  for (let i = 0; i < entryCount; i++) {
    if (pos + 46 > rawZip.length) {
      throw new Error('Cabeçalho de directório central truncado no arquivo ZIP.');
    }
    if (rawZip.readUInt32LE(pos) !== 0x02014b50) {
      throw new Error(`Assinatura de directório central inválida no índice ${i}.`);
    }

    const method = rawZip.readUInt16LE(pos + 10);
    const crc = rawZip.readUInt32LE(pos + 16);
    const compSize = rawZip.readUInt32LE(pos + 20);
    const uncompSize = rawZip.readUInt32LE(pos + 24);
    const nameLen = rawZip.readUInt16LE(pos + 28);
    const extraLen = rawZip.readUInt16LE(pos + 30);
    const commentLen = rawZip.readUInt16LE(pos + 32);
    const extAttrs = rawZip.readUInt32LE(pos + 38);
    const localOffset = rawZip.readUInt32LE(pos + 42);

    if (pos + 46 + nameLen > rawZip.length) {
      throw new Error('Nome de ficheiro excede limites do directório central.');
    }
    const name = rawZip.toString('utf8', pos + 46, pos + 46 + nameLen);
    pos += 46 + nameLen + extraLen + commentLen;

    // Directórios no ZIP (terminam em '/')
    if (name.endsWith('/') || name.endsWith('\\')) {
      continue;
    }

    // Validação de nomes e caminhos
    if (name.includes('\0')) {
      throw new Error(`Caractere nulo detectado no nome do ficheiro: '${name}'.`);
    }
    if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:/.test(name)) {
      throw new Error(`Caminho absoluto proibido no arquivo ZIP: '${name}'.`);
    }

    const segments = name.split(/[\\/]/);
    if (segments.some(s => s === '..')) {
      throw new Error(`Path traversal (..) detectado no arquivo ZIP: '${name}'.`);
    }

    const normalizedName = path.normalize(name).replace(/^(\.\.[\/\\])+/, '');
    if (normalizedName.startsWith('..') || path.isAbsolute(normalizedName)) {
      throw new Error(`Escape de directório após normalização no arquivo ZIP: '${name}'.`);
    }

    if (seenNormalizedNames.has(normalizedName)) {
      throw new Error(`Colisão ou nome duplicado no arquivo ZIP: '${normalizedName}'.`);
    }
    seenNormalizedNames.add(normalizedName);

    // Validação de permissões e tipos especiais (Unix mode bits em extAttrs >> 16)
    const unixMode = (extAttrs >>> 16) & 0xffff;
    const fileType = unixMode & 0o170000;
    if (fileType === 0o120000) {
      throw new Error(`Symlink proibido no arquivo ZIP: '${name}'.`);
    }
    if (fileType === 0o010000 || fileType === 0o020000 || fileType === 0o060000) {
      throw new Error(`Dispositivo especial proibido no arquivo ZIP: '${name}'.`);
    }

    // Métodos suportados: 0 (Store) ou 8 (Deflate)
    if (method !== 0 && method !== 8) {
      throw new Error(`Método de compressão não suportado no ZIP (${method}) para '${name}'.`);
    }

    // Limites de tamanho e ratio
    if (uncompSize > maxFileSize) {
      throw new Error(`Tamanho do ficheiro '${name}' (${uncompSize} bytes) excede limite de segurança (${maxFileSize} bytes).`);
    }
    totalUncompressedSize += uncompSize;
    if (totalUncompressedSize > maxTotalSize) {
      throw new Error(`Tamanho total descompactado do ZIP (${totalUncompressedSize} bytes) excede limite (${maxTotalSize} bytes).`);
    }
    if (compSize > 0) {
      const ratio = uncompSize / compSize;
      if (ratio > maxCompressionRatio && uncompSize > 1024 * 1024) {
        throw new Error(`Taxa de expansão (${ratio.toFixed(1)}x) excede limite de segurança (zip-bomb detectado).`);
      }
    }

    if (allowedFiles && !allowedFiles.has(normalizedName)) {
      throw new Error(`Ficheiro inesperado pelo manifesto no arquivo ZIP: '${normalizedName}'.`);
    }

    // Leitura dos dados a partir do cabeçalho local
    if (localOffset + 30 > rawZip.length) {
      throw new Error(`Cabeçalho local de '${name}' fora dos limites do arquivo ZIP.`);
    }
    if (rawZip.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Assinatura de cabeçalho local inválida para '${name}'.`);
    }

    const localNameLen = rawZip.readUInt16LE(localOffset + 26);
    const localExtraLen = rawZip.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;

    if (dataStart + compSize > rawZip.length) {
      throw new Error(`Dados compactados de '${name}' truncados no arquivo ZIP.`);
    }

    const compData = rawZip.subarray(dataStart, dataStart + compSize);
    let decompressed;
    if (method === 8) {
      try {
        decompressed = zlib.inflateRawSync(compData);
      } catch (err) {
        throw new Error(`Falha ao descompactar entrada '${name}' no ZIP: ${err.message}`);
      }
    } else {
      decompressed = compData;
    }

    if (decompressed.length !== uncompSize) {
      throw new Error(`Tamanho descompactado de '${name}' (${decompressed.length}) diverge do anunciado (${uncompSize}).`);
    }

    entriesToExtract.push({
      name: normalizedName,
      size: uncompSize,
      data: decompressed
    });
  }

  // 3. Extração segura para directório de destino
  fs.mkdirSync(targetDir, { recursive: true });
  const targetDirResolved = path.resolve(targetDir);

  const extracted = [];
  for (const entry of entriesToExtract) {
    const destPath = path.resolve(targetDirResolved, entry.name);

    if (!destPath.startsWith(targetDirResolved + path.sep) && destPath !== targetDirResolved) {
      throw new Error(`Caminho de extração escapa do directório de destino: '${destPath}'.`);
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, entry.data);

    const st = fs.lstatSync(destPath);
    if (st.isSymbolicLink()) {
      throw new Error(`Ficheiro extraído '${entry.name}' foi detectado como symlink.`);
    }
    if (!st.isFile()) {
      throw new Error(`Ficheiro extraído '${entry.name}' não é um ficheiro regular.`);
    }

    extracted.push({
      name: entry.name,
      size: entry.size,
      sha256: sha256(entry.data),
      path: destPath
    });
  }

  return extracted;
}

