import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export function getFileSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * 1. Physical Live Tasks Calculator (Pure Function)
 * Reads canonical storage and counts verified external client executions.
 * Demonstration and simulated tasks are explicitly excluded.
 */
export function calculatePhysicalLiveTasks(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    return { count: 0, verifiedTasks: [], sourcePath: targetPath, sourceHash: null, status: 'EMPTY_SOURCE' };
  }
  const sourceHash = getFileSha256(resolved);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch {
    return { count: 0, verifiedTasks: [], sourcePath: targetPath, sourceHash, status: 'INVALID_JSON' };
  }
  const list = Array.isArray(raw) ? raw : (raw.tasks || raw.items || []);
  const seen = new Set();
  const verified = [];
  for (const item of list) {
    if (!item.task_id || seen.has(item.task_id)) continue;
    seen.add(item.task_id);
    if (item.is_demonstration === true || item.is_test === true || item.simulated === true) continue;
    if (!item.external_system_confirmation || !item.client_signature) continue;
    verified.push(item.task_id);
  }
  return { count: verified.length, verifiedTasks: verified, sourcePath: targetPath, sourceHash, status: 'OK' };
}

/**
 * 2. Legally Authorized Tenants Calculator (Pure Function)
 * Reads legal contracts and verifies binding third-party production authorizations.
 * Technical tenant registrations without signed contracts are rejected.
 */
export function calculateLegallyAuthorizedTenants(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    return { count: 0, authorizedTenants: [], demonstrationCount: 0, sourcePath: targetPath, sourceHash: null, status: 'EMPTY_SOURCE' };
  }
  const sourceHash = getFileSha256(resolved);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch {
    return { count: 0, authorizedTenants: [], demonstrationCount: 0, sourcePath: targetPath, sourceHash, status: 'INVALID_JSON' };
  }
  const list = Array.isArray(raw) ? raw : (raw.contracts || raw.tenants || []);
  const seen = new Set();
  const authorized = [];
  let demoCount = 0;
  for (const item of list) {
    if (!item.tenant_id || seen.has(item.tenant_id)) continue;
    seen.add(item.tenant_id);
    if (item.authorization_type === 'DEMONSTRATION' || item.is_pilot_demonstration === true) {
      demoCount++;
      continue;
    }
    if (item.status === 'SIGNED_LEGAL_CONTRACT' && item.legal_signatory && item.contract_document_sha256) {
      authorized.push(item.tenant_id);
    }
  }
  return { count: authorized.length, authorizedTenants: authorized, demonstrationCount: demoCount, sourcePath: targetPath, sourceHash, status: 'OK' };
}

/**
 * 3. Eligible Certification Evidence Calculator (Pure Function)
 * Counts valid external third-party independent audit certifications.
 * Internal receipts are explicitly excluded from being counted as external evidence.
 */
export function calculateEligibleCertificationEvidence(targetPath) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    return { count: 0, eligibleAudits: [], sourcePath: targetPath, sourceHash: null, status: 'EMPTY_SOURCE' };
  }
  const sourceHash = getFileSha256(resolved);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch {
    return { count: 0, eligibleAudits: [], sourcePath: targetPath, sourceHash, status: 'INVALID_JSON' };
  }
  const list = Array.isArray(raw) ? raw : (raw.evidence || raw.audits || []);
  const seen = new Set();
  const eligible = [];
  for (const item of list) {
    if (!item.audit_id || seen.has(item.audit_id)) continue;
    seen.add(item.audit_id);
    if (item.is_internal_receipt === true || item.auditor_type !== 'INDEPENDENT_THIRD_PARTY') continue;
    if (item.verdict === 'CERT_L3_APPROVED' && item.auditor_signature) {
      eligible.push(item.audit_id);
    }
  }
  return { count: eligible.length, eligibleAudits: eligible, sourcePath: targetPath, sourceHash, status: 'OK' };
}

/**
 * 4. Readiness Risk & Autonomy Distribution Calculator (Pure Function)
 * Reads canonical baseline manifest employee authorization records and partitions
 * by risk classification into controlled pilot ready (LOW, MEDIUM, HIGH) vs HITL mandatory (CRITICAL).
 */
export function calculateReadinessRiskDistribution(manifestPath) {
  const resolved = path.resolve(manifestPath);
  if (!fs.existsSync(resolved)) {
    throw new Error('CANONICAL_MANIFEST_NOT_FOUND: ' + manifestPath);
  }
  const sourceHash = getFileSha256(resolved);
  const manifest = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  const records = manifest.employee_authorization_records;
  if (!Array.isArray(records)) {
    throw new Error('INVALID_MANIFEST_SCHEMA: employee_authorization_records array missing');
  }
  const seenIds = new Set();
  let controlledPilotReady = 0;
  let hitlMandatory = 0;
  let certL3Approved = 0;
  for (const record of records) {
    const id = record.employee_id;
    if (seenIds.has(id)) {
      throw new Error('DUPLICATE_EMPLOYEE_ID_IN_MANIFEST: ' + id);
    }
    seenIds.add(id);
    if (record.cert_l3_status === 'CERT_L3_APPROVED') {
      certL3Approved++;
    }
    const riskClass = (record.risk_class || '').toUpperCase();
    if (riskClass === 'CRITICAL') {
      hitlMandatory++;
    } else if (['LOW', 'MEDIUM', 'HIGH'].includes(riskClass)) {
      controlledPilotReady++;
    }
  }
  return {
    totalEmployees: records.length,
    uniqueEmployees: seenIds.size,
    controlled_pilot_ready_count: controlledPilotReady,
    hitl_mandatory_count: hitlMandatory,
    cert_l3_count: certL3Approved,
    sourcePath: manifestPath,
    sourceHash,
    status: 'PASS'
  };
}
