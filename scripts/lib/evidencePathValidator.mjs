import * as path from 'node:path';

/**
 * Validates that customDir resolves strictly within rootDir workspace.
 * Rejects:
 * - Empty string or flag values when argument provided
 * - Root directory itself
 * - Paths escaping root directory (relative path starts with '..' or is absolute)
 * - Sibling folders sharing root directory prefix
 */
export function validateEvidenceDir(customDir, rootDir) {
  if (!rootDir) {
    throw new Error('Root directory is required for evidence path validation.');
  }
  const resolvedRoot = path.resolve(rootDir);

  if (customDir !== undefined && customDir !== null) {
    if (typeof customDir !== 'string' || customDir.trim() === '' || customDir.trim().startsWith('--')) {
      const err = new Error('Evidence output directory argument (--output) cannot be empty.');
      err.code = 'EVIDENCE_PATH_INVALID';
      throw err;
    }
  }

  const targetDir = customDir
    ? path.resolve(resolvedRoot, customDir)
    : path.resolve(resolvedRoot, '.artifacts/evidence');

  if (targetDir === resolvedRoot) {
    const err = new Error('Evidence output directory cannot be the repository root.');
    err.code = 'EVIDENCE_PATH_INVALID';
    throw err;
  }

  const rel = path.relative(resolvedRoot, targetDir);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    const err = new Error(`Evidence output directory must be within workspace: ${targetDir}`);
    err.code = 'EVIDENCE_PATH_INVALID';
    throw err;
  }

  return targetDir;
}
