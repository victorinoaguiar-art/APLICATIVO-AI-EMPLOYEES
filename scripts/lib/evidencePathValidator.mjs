import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Validates that customDir resolves strictly within rootDir workspace (or an explicitly authorized temp root).
 * Rejects:
 * - Empty string or flag values when argument provided
 * - Root directory itself
 * - Paths escaping root directory (relative path starts with '..' or is absolute)
 * - Sibling folders sharing root directory prefix
 * - Arbitrary temp directories unless explicitly authorized via options.allowedTempRoot
 */
export function validateEvidenceDir(customDir, rootDir, options = {}) {
  if (!rootDir) {
    throw new Error('Root directory is required for evidence path validation.');
  }
  const resolvedRoot = path.resolve(rootDir);
  const allowedTempRoot = (typeof options === 'string' ? options : options?.allowedTempRoot)
    ? path.resolve(typeof options === 'string' ? options : options.allowedTempRoot)
    : null;

  if (customDir !== undefined && customDir !== null) {
    if (typeof customDir !== 'string' || customDir.trim() === '' || customDir.trim().startsWith('--')) {
      const err = new Error('Evidence output directory argument (--output) cannot be empty.');
      err.code = 'EVIDENCE_PATH_INVALID';
      throw err;
    }
  }

  const rawDir = customDir || '.artifacts/evidence';
  const hasTraversal = rawDir.split(/[\\/]/).some(s => s === '..');
  if (hasTraversal) {
    const err = new Error(`Evidence output directory cannot contain path traversal: ${rawDir}`);
    err.code = 'EVIDENCE_PATH_INVALID';
    throw err;
  }

  const targetDir = path.resolve(resolvedRoot, rawDir);

  if (targetDir === resolvedRoot) {
    const err = new Error('Evidence output directory cannot be the repository root.');
    err.code = 'EVIDENCE_PATH_INVALID';
    throw err;
  }

  const normTarget = process.platform === 'win32' ? targetDir.toLowerCase() : targetDir;
  const normRoot = process.platform === 'win32' ? resolvedRoot.toLowerCase() : resolvedRoot;

  // Rejeita explicitamente pastas irmãs que partilham prefixo com a raiz (ex: /tmp/repo-sibling)
  if (normTarget.startsWith(normRoot) && normTarget !== normRoot) {
    const nextChar = normTarget.charAt(normRoot.length);
    if (nextChar !== path.sep && nextChar !== '/') {
      const err = new Error(`Evidence output directory must be within workspace: ${targetDir}`);
      err.code = 'EVIDENCE_PATH_INVALID';
      throw err;
    }
  }

  const relToRoot = path.relative(resolvedRoot, targetDir);
  const isInsideWorkspace = relToRoot && !relToRoot.startsWith('..') && !path.isAbsolute(relToRoot);

  if (!isInsideWorkspace) {
    let isInsideAllowedTemp = false;
    if (allowedTempRoot) {
      const normTemp = process.platform === 'win32' ? allowedTempRoot.toLowerCase() : allowedTempRoot;
      if (normTarget === normTemp) {
        isInsideAllowedTemp = true;
      } else if (normTarget.startsWith(normTemp)) {
        const nextChar = normTarget.charAt(normTemp.length);
        if (nextChar === path.sep || nextChar === '/') {
          const relToTemp = path.relative(allowedTempRoot, targetDir);
          if (relToTemp && !relToTemp.startsWith('..') && !path.isAbsolute(relToTemp)) {
            isInsideAllowedTemp = true;
          }
        }
      }
    }

    if (!isInsideAllowedTemp) {
      const err = new Error(`Evidence output directory must be within workspace: ${targetDir}`);
      err.code = 'EVIDENCE_PATH_INVALID';
      throw err;
    }
  }

  return targetDir;
}
