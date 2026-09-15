import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

const req = createRequire(import.meta.url);
let Ajv = null;
try {
  Ajv = req('ajv');
} catch {}

export function getFileSha256(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function validateWithAjv(data, schemaPath) {
  if (!Ajv || !fs.existsSync(schemaPath)) return { valid: true, skipped: true };
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const ajvInstance = new Ajv({ allErrors: true, strict: false });
    const validate = ajvInstance.compile(schema);
    const valid = validate(data);
    return { valid, errors: validate.errors };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}

/**
 * 1. Physical Live Tasks Calculator (Pure Function)
 * Reads canonical storage and counts verified external client executions.
 * Distinguishes:
 * - MISSING_SOURCE: File does not exist (blocks gate)
 * - INVALID_JSON / INVALID_SCHEMA: Corrupted source (blocks gate)
 * - OK: Valid file analyzed (proven zero if tasks is empty)
 */
export function calculatePhysicalLiveTasks(targetPath, schemaOverridePath) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    return {
      count: 0,
      verifiedTasks: [],
      sourcePath: targetPath,
      sourceHash: null,
      status: 'MISSING_SOURCE',
      error: 'CANONICAL_SOURCE_MISSING: Live tasks evidence storage file does not exist on disk'
    };
  }
  const sourceHash = getFileSha256(resolved);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (err) {
    return {
      count: 0,
      verifiedTasks: [],
      sourcePath: targetPath,
      sourceHash,
      status: 'INVALID_JSON',
      error: `JSON_SYNTAX_ERROR: ${err.message}`
    };
  }

  // Schema validation
  const defaultSchema = path.resolve(ROOT_DIR, 'schemas/data/liveTasks.schema.json');
  const schemaPath = schemaOverridePath || (fs.existsSync(defaultSchema) ? defaultSchema : null);
  if (schemaPath) {
    const schemaCheck = validateWithAjv(raw, schemaPath);
    if (!schemaCheck.valid) {
      return {
        count: 0,
        verifiedTasks: [],
        sourcePath: targetPath,
        sourceHash,
        status: 'INVALID_SCHEMA',
        schemaErrors: schemaCheck.errors
      };
    }
  }

  const list = Array.isArray(raw) ? raw : (raw.tasks || raw.items || []);
  const seen = new Set();
  const verified = [];
  const exclusions = [];

  for (const item of list) {
    if (!item.task_id) {
      exclusions.push({ reason: 'MISSING_TASK_ID', item });
      continue;
    }
    if (seen.has(item.task_id)) {
      exclusions.push({ reason: 'DUPLICATE_TASK_ID', task_id: item.task_id });
      continue;
    }
    seen.add(item.task_id);

    if (item.is_demonstration === true || item.is_test === true || item.simulated === true) {
      exclusions.push({ reason: 'DEMONSTRATION_OR_SIMULATION_EXCLUDED', task_id: item.task_id });
      continue;
    }
    if (!item.external_system_confirmation || !item.client_signature) {
      exclusions.push({ reason: 'UNVERIFIED_NO_EXTERNAL_SIGNATURE', task_id: item.task_id });
      continue;
    }
    verified.push(item.task_id);
  }

  return {
    count: verified.length,
    verifiedTasks: verified,
    sourcePath: targetPath,
    sourceHash,
    status: 'OK',
    isProvenZero: verified.length === 0,
    totalRecords: list.length,
    uniqueRecords: seen.size,
    exclusions
  };
}

/**
 * 2. Legally Authorized Tenants Calculator (Pure Function)
 * Reads legal contracts and verifies binding third-party production authorizations.
 * Computes separately: technical tenants, demonstration tenants, physical contracts,
 * production authorized tenants, unique & valid tenants.
 */
export function calculateLegallyAuthorizedTenants(targetPath, schemaOverridePath) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    return {
      count: 0,
      authorizedTenants: [],
      technicalTenantsCount: 0,
      demonstrationCount: 0,
      physicalContractCount: 0,
      sourcePath: targetPath,
      sourceHash: null,
      status: 'MISSING_SOURCE',
      error: 'CANONICAL_SOURCE_MISSING: Legal contracts storage file does not exist on disk'
    };
  }
  const sourceHash = getFileSha256(resolved);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (err) {
    return {
      count: 0,
      authorizedTenants: [],
      technicalTenantsCount: 0,
      demonstrationCount: 0,
      physicalContractCount: 0,
      sourcePath: targetPath,
      sourceHash,
      status: 'INVALID_JSON',
      error: `JSON_SYNTAX_ERROR: ${err.message}`
    };
  }

  // Schema validation
  const defaultSchema = path.resolve(ROOT_DIR, 'schemas/data/legalContracts.schema.json');
  const schemaPath = schemaOverridePath || (fs.existsSync(defaultSchema) ? defaultSchema : null);
  if (schemaPath) {
    const schemaCheck = validateWithAjv(raw, schemaPath);
    if (!schemaCheck.valid) {
      return {
        count: 0,
        authorizedTenants: [],
        technicalTenantsCount: 0,
        demonstrationCount: 0,
        physicalContractCount: 0,
        sourcePath: targetPath,
        sourceHash,
        status: 'INVALID_SCHEMA',
        schemaErrors: schemaCheck.errors
      };
    }
  }

  const list = Array.isArray(raw) ? raw : (raw.contracts || raw.tenants || []);
  const seen = new Set();
  const authorized = [];
  let demoCount = 0;
  let technicalCount = 0;
  let physicalContracts = 0;
  const exclusions = [];

  for (const item of list) {
    if (!item.tenant_id) {
      exclusions.push({ reason: 'MISSING_TENANT_ID', item });
      continue;
    }
    if (seen.has(item.tenant_id)) {
      exclusions.push({ reason: 'DUPLICATE_TENANT_ID', tenant_id: item.tenant_id });
      continue;
    }
    seen.add(item.tenant_id);

    if (item.tenant_type === 'TECHNICAL' || item.is_technical_only === true) {
      technicalCount++;
    }

    if (item.authorization_type === 'DEMONSTRATION' || item.is_pilot_demonstration === true) {
      demoCount++;
      exclusions.push({ reason: 'DEMONSTRATION_PILOT_NOT_AUTHORIZED_PRODUCTION', tenant_id: item.tenant_id });
      continue;
    }

    if (item.contract_document_sha256) {
      physicalContracts++;
    }

    if (item.status === 'SIGNED_LEGAL_CONTRACT' && item.legal_signatory && item.contract_document_sha256) {
      authorized.push(item.tenant_id);
    } else {
      exclusions.push({ reason: 'MISSING_LEGAL_SIGNATURE_OR_DOC_HASH', tenant_id: item.tenant_id });
    }
  }

  return {
    count: authorized.length,
    authorizedTenants: authorized,
    technicalTenantsCount: technicalCount,
    demonstrationCount: demoCount,
    physicalContractCount: physicalContracts,
    uniqueCount: seen.size,
    totalRecords: list.length,
    sourcePath: targetPath,
    sourceHash,
    status: 'OK',
    exclusions
  };
}

/**
 * 3. Eligible Certification Evidence Calculator (Pure Function)
 * Distinguishes internal receipts from external eligible evidence.
 * Counts valid external third-party independent audit certifications.
 */
export function calculateEligibleCertificationEvidence(targetPath, schemaOverridePath) {
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    return {
      count: 0,
      eligibleAudits: [],
      internalReceiptsCount: 0,
      declaredCertCount: 0,
      physicalCertCount: 0,
      sourcePath: targetPath,
      sourceHash: null,
      status: 'MISSING_SOURCE',
      error: 'CANONICAL_SOURCE_MISSING: External audits certification storage file does not exist on disk'
    };
  }
  const sourceHash = getFileSha256(resolved);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (err) {
    return {
      count: 0,
      eligibleAudits: [],
      internalReceiptsCount: 0,
      declaredCertCount: 0,
      physicalCertCount: 0,
      sourcePath: targetPath,
      sourceHash,
      status: 'INVALID_JSON',
      error: `JSON_SYNTAX_ERROR: ${err.message}`
    };
  }

  // Schema validation
  const defaultSchema = path.resolve(ROOT_DIR, 'schemas/data/externalAudits.schema.json');
  const schemaPath = schemaOverridePath || (fs.existsSync(defaultSchema) ? defaultSchema : null);
  if (schemaPath) {
    const schemaCheck = validateWithAjv(raw, schemaPath);
    if (!schemaCheck.valid) {
      return {
        count: 0,
        eligibleAudits: [],
        internalReceiptsCount: 0,
        declaredCertCount: 0,
        physicalCertCount: 0,
        sourcePath: targetPath,
        sourceHash,
        status: 'INVALID_SCHEMA',
        schemaErrors: schemaCheck.errors
      };
    }
  }

  const list = Array.isArray(raw) ? raw : (raw.evidence || raw.audits || []);
  const seen = new Set();
  const eligible = [];
  let internalReceipts = 0;
  const exclusions = [];

  for (const item of list) {
    if (!item.audit_id) {
      exclusions.push({ reason: 'MISSING_AUDIT_ID', item });
      continue;
    }
    if (seen.has(item.audit_id)) {
      exclusions.push({ reason: 'DUPLICATE_AUDIT_ID', audit_id: item.audit_id });
      continue;
    }
    seen.add(item.audit_id);

    if (item.is_internal_receipt === true || item.auditor_type === 'INTERNAL_SELF_ASSESSMENT' || item.auditor_type !== 'INDEPENDENT_THIRD_PARTY') {
      internalReceipts++;
      exclusions.push({ reason: 'INTERNAL_RECEIPT_CANNOT_CLOSE_EXTERNAL_CERTIFICATION', audit_id: item.audit_id });
      continue;
    }
    if (item.verdict === 'CERT_L3_APPROVED' && item.auditor_signature) {
      eligible.push(item.audit_id);
    } else {
      exclusions.push({ reason: 'AUDIT_NOT_APPROVED_OR_UNSIGNED', audit_id: item.audit_id });
    }
  }

  return {
    count: eligible.length,
    eligibleAudits: eligible,
    internalReceiptsCount: internalReceipts,
    declaredCertCount: 0,
    physicalCertCount: eligible.length,
    isProvenZero: eligible.length === 0,
    uniqueCount: seen.size,
    totalRecords: list.length,
    sourcePath: targetPath,
    sourceHash,
    status: 'OK',
    exclusions
  };
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
