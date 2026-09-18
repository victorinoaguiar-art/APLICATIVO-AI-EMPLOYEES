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
