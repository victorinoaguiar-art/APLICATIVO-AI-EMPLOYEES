import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const req = createRequire(path.resolve(ROOT_DIR, 'package.json'));
const Ajv = req('ajv');
const addFormats = req('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export const ALLOWED_CLASSIFICATIONS = [
  'PATCH_VERIFIED_AND_CI_ENFORCED',
  'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
  'PATCH_VERIFIED_AND_CI_GREEN'
];

export const FINAL_ATTESTATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'repository',
    'branch',
    'attested_commit_sha',
    'primary_run_id',
    'primary_run_url',
    'primary_status',
    'primary_conclusion',
    'primary_response_sha256',
    'remote_verification_run_id',
    'remote_run_url',
    'remote_status',
    'remote_conclusion',
    'remote_response_sha256',
    'remote_started_at',
    'query_actor',
    'query_run_id',
    'artifact_name',
    'classification',
    'operational_state',
    'generated_at',
    'evidence_index_sha256',
    'final_evidence_index_sha256',
    'status'
  ],
  properties: {
    repository: {
      type: 'string',
      const: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES'
    },
    branch: {
      type: 'string',
      const: 'master'
    },
    attested_commit_sha: {
      type: 'string',
      pattern: '^[0-9a-f]{40}$'
    },
    primary_run_id: {
      type: 'integer',
      minimum: 1
    },
    primary_run_url: {
      type: 'string',
      pattern: '^https://github\\.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/\\d+$'
    },
    primary_status: {
      type: 'string',
      const: 'completed'
    },
    primary_conclusion: {
      type: 'string',
      const: 'success'
    },
    primary_response_sha256: {
      type: 'string',
      pattern: '^[0-9a-f]{64}$'
    },
    remote_verification_run_id: {
      type: 'integer',
      minimum: 1
    },
    remote_run_url: {
      type: 'string',
      pattern: '^https://github\\.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/\\d+$'
    },
    remote_status: {
      type: 'string',
      const: 'completed'
    },
    remote_conclusion: {
      type: 'string',
      const: 'success'
    },
    remote_response_sha256: {
      type: 'string',
      pattern: '^[0-9a-f]{64}$'
    },
    remote_started_at: {
      type: 'string',
      format: 'date-time'
    },
    query_actor: {
      type: 'string',
      minLength: 1
    },
    query_run_id: {
      type: 'integer',
      minimum: 1
    },
    artifact_name: {
      type: 'string',
      pattern: '^aetf-verified-remote-evidence-bundle-[0-9a-f]{40}$'
    },
    artifact_id: {
      type: 'integer',
      minimum: 1
    },
    classification: {
      type: 'string',
      enum: ALLOWED_CLASSIFICATIONS
    },
    operational_state: {
      type: 'string',
      const: 'PRE-PRODUCTION / L2 HARDENED'
    },
    generated_at: {
      type: 'string',
      format: 'date-time'
    },
    evidence_index_sha256: {
      type: 'string',
      pattern: '^[0-9a-f]{64}$'
    },
    final_evidence_index_sha256: {
      type: 'string',
      pattern: '^[0-9a-f]{64}$'
    },
    status: {
      type: 'string',
      const: 'PASS'
    }
  }
};

const validateSchema = ajv.compile(FINAL_ATTESTATION_SCHEMA);

export function parseVerifyArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--attestation') args.attestationPath = argv[++i];
    else if (arg === '--evidence-dir') args.evidenceDir = argv[++i];
    else if (arg === '--primary-run-response') args.primaryRunResponse = argv[++i];
    else if (arg === '--remote-run-response') args.remoteRunResponse = argv[++i];
    else if (arg === '--final-evidence-index') args.finalEvidenceIndex = argv[++i];
    else if (arg === '--artifacts-response') args.artifactsResponse = argv[++i];
    else if (arg === '--sha') args.sha = argv[++i];
    else if (arg === '--primary-run-id') args.primaryRunId = argv[++i];
    else if (arg === '--remote-run-id') args.remoteRunId = argv[++i];
    else if (arg === '--artifact-id') args.artifactId = argv[++i];
    else if (arg === '--expected-actor') args.expectedActor = argv[++i];
    else if (arg === '--expected-classification') args.expectedClassification = argv[++i];
  }
  return args;
}

export function verifyFinalAttestation(options = {}) {
  const attestationPath = options.attestationPath
    ? path.resolve(ROOT_DIR, options.attestationPath)
    : path.resolve(ROOT_DIR, '.artifacts/attestation/final-attestation.json');
  const evidenceDir = options.evidenceDir
    ? path.resolve(ROOT_DIR, options.evidenceDir)
    : path.resolve(ROOT_DIR, '.artifacts/evidence');

  const primaryResPath = options.primaryRunResponse
    ? path.resolve(ROOT_DIR, options.primaryRunResponse)
    : path.resolve(ROOT_DIR, '.artifacts/final-evidence/final-primary-run-api-response.json');
  const remoteResPath = options.remoteRunResponse
    ? path.resolve(ROOT_DIR, options.remoteRunResponse)
    : path.resolve(ROOT_DIR, '.artifacts/final-evidence/final-remote-run-api-response.json');
  const finalIndexPath = options.finalEvidenceIndex
    ? path.resolve(ROOT_DIR, options.finalEvidenceIndex)
    : path.resolve(ROOT_DIR, '.artifacts/final-evidence/final-evidence-files.sha256');
  const artifactsResPath = options.artifactsResponse
    ? path.resolve(ROOT_DIR, options.artifactsResponse)
    : path.resolve(ROOT_DIR, '.artifacts/final-evidence/final-remote-artifacts-api-response.json');

  // 1. Check mandatory caller arguments
  const requiredArgs = [
    { name: 'sha', val: options.sha },
    { name: 'primaryRunId', val: options.primaryRunId },
    { name: 'remoteRunId', val: options.remoteRunId },
    { name: 'expectedActor', val: options.expectedActor }
  ];
  for (const { name, val } of requiredArgs) {
    if (val === undefined || val === null || String(val).trim() === '') {
      return {
        valid: false,
        code: 'MISSING_CLI_ARGUMENT',
        error: `Mandatory verification parameter missing: ${name}`
      };
    }
  }

  // Mandatory physical response file presence
  if (!fs.existsSync(primaryResPath)) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_FILE_MISSING',
      error: `final-primary-run-api-response.json missing at: ${primaryResPath}`
    };
  }
  if (!fs.existsSync(remoteResPath)) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_FILE_MISSING',
      error: `final-remote-run-api-response.json missing at: ${remoteResPath}`
    };
  }
  if (!fs.existsSync(finalIndexPath)) {
    return {
      valid: false,
      code: 'FINAL_INDEX_FILE_MISSING',
      error: `final-evidence-files.sha256 missing at: ${finalIndexPath}`
    };
  }

  const expectedSha = String(options.sha).trim();
  if (!/^[0-9a-f]{40}$/i.test(expectedSha)) {
    return {
      valid: false,
      code: 'INVALID_CLI_ARGUMENT',
      error: `Expected SHA must be 40 hex characters: ${expectedSha}`
    };
  }

  const expectedPrimaryRunId = Number(options.primaryRunId);
  if (!Number.isInteger(expectedPrimaryRunId) || expectedPrimaryRunId <= 0) {
    return {
      valid: false,
      code: 'INVALID_CLI_ARGUMENT',
      error: `Expected primaryRunId must be positive integer: ${options.primaryRunId}`
    };
  }

  const expectedRemoteRunId = Number(options.remoteRunId);
  if (!Number.isInteger(expectedRemoteRunId) || expectedRemoteRunId <= 0) {
    return {
      valid: false,
      code: 'INVALID_CLI_ARGUMENT',
      error: `Expected remoteRunId must be positive integer: ${options.remoteRunId}`
    };
  }

  if (expectedPrimaryRunId === expectedRemoteRunId) {
    return {
      valid: false,
      code: 'RUN_ID_COLLISION',
      error: `primaryRunId (${expectedPrimaryRunId}) and remoteRunId (${expectedRemoteRunId}) cannot collide`
    };
  }

  const expectedActor = String(options.expectedActor).trim();

  // 2. Check attestation file existence
  if (!fs.existsSync(attestationPath)) {
    return {
      valid: false,
      code: 'ATTESTATION_FILE_MISSING',
      error: `Final attestation file not found at: ${attestationPath}`
    };
  }

  // 3. Parse JSON
  let attestation;
  try {
    const rawContent = fs.readFileSync(attestationPath, 'utf8');
    attestation = JSON.parse(rawContent);
  } catch (err) {
    return {
      valid: false,
      code: 'ATTESTATION_INVALID_JSON',
      error: `Failed to parse attestation JSON: ${err.message}`
    };
  }

  if (!attestation || typeof attestation !== 'object' || Array.isArray(attestation)) {
    return {
      valid: false,
      code: 'ATTESTATION_INVALID_JSON',
      error: 'Attestation content is not a JSON object'
    };
  }

  // 4. Schema validation with Ajv
  const schemaValid = validateSchema(attestation);
  if (!schemaValid) {
    const errors = validateSchema.errors ? validateSchema.errors.map(e => `${e.instancePath || 'root'} ${e.message}`).join(', ') : 'Unknown schema error';
    return {
      valid: false,
      code: 'ATTESTATION_SCHEMA_INVALID',
      error: `Attestation failed Ajv schema validation: ${errors}`
    };
  }

  // 5. Semantic field validations on attestation itself
  if (attestation.attested_commit_sha.toLowerCase() !== expectedSha.toLowerCase()) {
    return {
      valid: false,
      code: 'ATTESTATION_SHA_MISMATCH',
      error: `attested_commit_sha mismatch: expected ${expectedSha}, got ${attestation.attested_commit_sha}`
    };
  }

  if (attestation.primary_run_id !== expectedPrimaryRunId) {
    return {
      valid: false,
      code: 'ATTESTATION_RUN_ID_MISMATCH',
      error: `primary_run_id mismatch: expected ${expectedPrimaryRunId}, got ${attestation.primary_run_id}`
    };
  }

  if (attestation.remote_verification_run_id !== expectedRemoteRunId) {
    return {
      valid: false,
      code: 'ATTESTATION_RUN_ID_MISMATCH',
      error: `remote_verification_run_id mismatch: expected ${expectedRemoteRunId}, got ${attestation.remote_verification_run_id}`
    };
  }

  if (attestation.query_run_id !== expectedRemoteRunId) {
    return {
      valid: false,
      code: 'ATTESTATION_RUN_ID_MISMATCH',
      error: `query_run_id mismatch: expected ${expectedRemoteRunId}, got ${attestation.query_run_id}`
    };
  }

  if (attestation.query_actor !== expectedActor) {
    return {
      valid: false,
      code: 'ATTESTATION_ACTOR_MISMATCH',
      error: `query_actor mismatch: expected ${expectedActor}, got ${attestation.query_actor}`
    };
  }

  if (attestation.primary_status !== 'completed' || attestation.primary_conclusion !== 'success') {
    return {
      valid: false,
      code: 'ATTESTATION_CONCLUSION_INVALID',
      error: `primary_conclusion/status invalid: ${attestation.primary_status} / ${attestation.primary_conclusion}`
    };
  }

  if (attestation.remote_status !== 'completed' || attestation.remote_conclusion !== 'success') {
    return {
      valid: false,
      code: 'ATTESTATION_CONCLUSION_INVALID',
      error: `remote_conclusion/status invalid: ${attestation.remote_status} / ${attestation.remote_conclusion}`
    };
  }

  if (attestation.status !== 'PASS') {
    return {
      valid: false,
      code: 'ATTESTATION_STATUS_INVALID',
      error: `attestation status must be "PASS", found "${attestation.status}"`
    };
  }

  if (attestation.operational_state !== 'PRE-PRODUCTION / L2 HARDENED') {
    return {
      valid: false,
      code: 'ATTESTATION_STATUS_INVALID',
      error: `operational_state must be "PRE-PRODUCTION / L2 HARDENED", found "${attestation.operational_state}"`
    };
  }

  if (options.expectedClassification && attestation.classification !== options.expectedClassification) {
    return {
      valid: false,
      code: 'ATTESTATION_CLASSIFICATION_MISMATCH',
      error: `classification mismatch: expected ${options.expectedClassification}, got ${attestation.classification}`
    };
  }

  const expectedArtifactName = `aetf-verified-remote-evidence-bundle-${expectedSha}`;
  if (attestation.artifact_name !== expectedArtifactName) {
    return {
      valid: false,
      code: 'ATTESTATION_ARTIFACT_INVALID',
      error: `artifact_name mismatch: expected "${expectedArtifactName}", got "${attestation.artifact_name}"`
    };
  }

  if (options.artifactId) {
    const expectedArtId = Number(options.artifactId);
    if (attestation.artifact_id !== expectedArtId) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `artifact_id mismatch: expected ${expectedArtId}, got ${attestation.artifact_id}`
      };
    }
  }

  // 6. Physical validation of final-evidence-files.sha256
  const finalIndexBytes = fs.readFileSync(finalIndexPath);
  const computedFinalIndexHash = crypto.createHash('sha256').update(finalIndexBytes).digest('hex');
  if (computedFinalIndexHash.toLowerCase() !== attestation.final_evidence_index_sha256.toLowerCase()) {
    return {
      valid: false,
      code: 'FINAL_INDEX_HASH_MISMATCH',
      error: `final_evidence_index_sha256 mismatch: attestation has ${attestation.final_evidence_index_sha256}, physical file is ${computedFinalIndexHash}`
    };
  }

  // Parse lines in final-evidence-files.sha256
  const finalIndexLines = finalIndexBytes.toString('utf8').split('\n').map(l => l.trim()).filter(Boolean);
  const indexedFinalFiles = new Map();
  for (const line of finalIndexLines) {
    const parts = line.split(/\s+/);
    if (parts.length !== 2) {
      return {
        valid: false,
        code: 'FINAL_INDEX_INVALID',
        error: `Malformed line in final-evidence-files.sha256: "${line}"`
      };
    }
    const [hash, fname] = parts;
    if (indexedFinalFiles.has(fname)) {
      return {
        valid: false,
        code: 'FINAL_INDEX_INVALID',
        error: `Duplicate entry in final-evidence-files.sha256: ${fname}`
      };
    }
    indexedFinalFiles.set(fname, hash.toLowerCase());
  }

  // Check that all files in final index exist and match physical bytes
  const finalEvidenceParentDir = path.dirname(finalIndexPath);
  for (const [fname, expectedHash] of indexedFinalFiles.entries()) {
    const fpath = path.join(finalEvidenceParentDir, fname);
    if (!fs.existsSync(fpath)) {
      return {
        valid: false,
        code: 'FINAL_INDEX_FILE_MISSING',
        error: `Indexed file in final-evidence-files.sha256 missing on disk: ${fname}`
      };
    }
    const computedH = crypto.createHash('sha256').update(fs.readFileSync(fpath)).digest('hex').toLowerCase();
    if (computedH !== expectedHash) {
      return {
        valid: false,
        code: 'FINAL_RESPONSE_HASH_MISMATCH',
        error: `Byte-level hash mismatch for indexed file ${fname}: expected ${expectedHash}, computed ${computedH}`
      };
    }
  }

  // 7. Validate Physical Primary Run API Response
  const primaryRaw = fs.readFileSync(primaryResPath);
  const actualPrimaryHash = crypto.createHash('sha256').update(primaryRaw).digest('hex').toLowerCase();
  if (actualPrimaryHash !== attestation.primary_response_sha256.toLowerCase()) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_HASH_MISMATCH',
      error: `primary_response_sha256 mismatch: attestation has ${attestation.primary_response_sha256}, computed is ${actualPrimaryHash}`
    };
  }

  let primaryData;
  try {
    primaryData = JSON.parse(primaryRaw.toString('utf8'));
  } catch (err) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `Invalid JSON in final-primary-run-api-response.json: ${err.message}`
    };
  }

  if (Number(primaryData.id) !== expectedPrimaryRunId) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response ID (${primaryData.id}) mismatch with expectedPrimaryRunId (${expectedPrimaryRunId})`
    };
  }
  if (primaryData.status !== 'completed') {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response status is "${primaryData.status}", must be "completed"`
    };
  }
  if (primaryData.conclusion !== 'success') {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response conclusion is "${primaryData.conclusion}", must be "success"`
    };
  }
  if (!primaryData.head_sha || primaryData.head_sha.toLowerCase() !== expectedSha.toLowerCase()) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response head_sha (${primaryData.head_sha}) does not match expected SHA (${expectedSha})`
    };
  }
  if (primaryData.head_branch !== 'master') {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response head_branch is "${primaryData.head_branch}", must be "master"`
    };
  }
  if (!primaryData.repository || primaryData.repository.full_name !== 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES') {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response repository is "${primaryData.repository?.full_name}", must be "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES"`
    };
  }
  const isPrimaryExpectedWorkflow = primaryData.name === 'CI / Production Readiness & Audit Gate' ||
    (primaryData.path && primaryData.path.endsWith('ci.yml'));
  if (!isPrimaryExpectedWorkflow) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response workflow is "${primaryData.name || primaryData.path}", expected CI / Production Readiness & Audit Gate`
    };
  }
  if (!primaryData.run_attempt || !Number.isInteger(Number(primaryData.run_attempt)) || Number(primaryData.run_attempt) < 1) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response run_attempt is invalid: ${primaryData.run_attempt}`
    };
  }
  if (!primaryData.html_url || !primaryData.html_url.includes(String(expectedPrimaryRunId)) || !primaryData.html_url.includes('victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES')) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response html_url is invalid: ${primaryData.html_url}`
    };
  }
  const primaryActor = primaryData.actor?.login || primaryData.triggering_actor?.login;
  if (!primaryActor) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: 'primary run response actor is missing'
    };
  }
  if (!primaryData.created_at || !primaryData.updated_at || isNaN(Date.parse(primaryData.created_at)) || isNaN(Date.parse(primaryData.updated_at))) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: 'primary run response timestamps are invalid'
    };
  }
  if (Date.parse(primaryData.created_at) > Date.parse(primaryData.updated_at)) {
    return {
      valid: false,
      code: 'PRIMARY_RESPONSE_DATA_INVALID',
      error: `primary run response created_at (${primaryData.created_at}) is posterior to updated_at (${primaryData.updated_at})`
    };
  }

  // 8. Validate Physical Remote Run API Response
  const remoteRaw = fs.readFileSync(remoteResPath);
  const actualRemoteHash = crypto.createHash('sha256').update(remoteRaw).digest('hex').toLowerCase();
  if (actualRemoteHash !== attestation.remote_response_sha256.toLowerCase()) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_HASH_MISMATCH',
      error: `remote_response_sha256 mismatch: attestation has ${attestation.remote_response_sha256}, computed is ${actualRemoteHash}`
    };
  }

  let remoteData;
  try {
    remoteData = JSON.parse(remoteRaw.toString('utf8'));
  } catch (err) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `Invalid JSON in final-remote-run-api-response.json: ${err.message}`
    };
  }

  if (Number(remoteData.id) !== expectedRemoteRunId) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response ID (${remoteData.id}) mismatch with expectedRemoteRunId (${expectedRemoteRunId})`
    };
  }
  if (remoteData.status !== 'completed') {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response status is "${remoteData.status}", must be "completed"`
    };
  }
  if (remoteData.conclusion !== 'success') {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response conclusion is "${remoteData.conclusion}", must be "success"`
    };
  }
  if (!remoteData.head_sha || remoteData.head_sha.toLowerCase() !== expectedSha.toLowerCase()) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response head_sha (${remoteData.head_sha}) does not match expected SHA (${expectedSha})`
    };
  }
  if (remoteData.head_branch !== 'master') {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response head_branch is "${remoteData.head_branch}", must be "master"`
    };
  }
  if (!remoteData.repository || remoteData.repository.full_name !== 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES') {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response repository is "${remoteData.repository?.full_name}", must be "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES"`
    };
  }
  const isRemoteExpectedWorkflow = remoteData.name === 'Evidence Remote Verification' ||
    (remoteData.path && remoteData.path.endsWith('evidence-remote-verification.yml'));
  if (!isRemoteExpectedWorkflow) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response workflow is "${remoteData.name || remoteData.path}", expected Evidence Remote Verification`
    };
  }
  if (!remoteData.run_attempt || !Number.isInteger(Number(remoteData.run_attempt)) || Number(remoteData.run_attempt) < 1) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response run_attempt is invalid: ${remoteData.run_attempt}`
    };
  }
  if (!remoteData.html_url || !remoteData.html_url.includes(String(expectedRemoteRunId)) || !remoteData.html_url.includes('victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES')) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response html_url is invalid: ${remoteData.html_url}`
    };
  }
  const actualRemoteActor = remoteData.actor?.login || remoteData.triggering_actor?.login;
  if (!actualRemoteActor || actualRemoteActor !== expectedActor) {
    return {
      valid: false,
      code: 'REMOTE_ACTOR_MISMATCH',
      error: `remote run response actor (${actualRemoteActor}) does not match expectedActor (${expectedActor})`
    };
  }
  if (!remoteData.created_at || !remoteData.updated_at || isNaN(Date.parse(remoteData.created_at)) || isNaN(Date.parse(remoteData.updated_at))) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: 'remote run response timestamps are invalid'
    };
  }
  if (Date.parse(remoteData.created_at) > Date.parse(remoteData.updated_at)) {
    return {
      valid: false,
      code: 'REMOTE_RESPONSE_DATA_INVALID',
      error: `remote run response created_at (${remoteData.created_at}) is posterior to updated_at (${remoteData.updated_at})`
    };
  }

  // 9. Validate Artifact Metadata Response if present
  if (fs.existsSync(artifactsResPath)) {
    let artApiData;
    try {
      artApiData = JSON.parse(fs.readFileSync(artifactsResPath, 'utf8'));
    } catch (err) {
      return {
        valid: false,
        code: 'ARTIFACTS_RESPONSE_DATA_INVALID',
        error: `Invalid JSON in artifacts response: ${err.message}`
      };
    }
    const matchingArtifacts = (artApiData.artifacts || []).filter(a => a.name === expectedArtifactName);
    if (matchingArtifacts.length === 0) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Artifact ${expectedArtifactName} not found in artifacts response`
      };
    }
    if (matchingArtifacts.length > 1) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Multiple duplicate artifacts with name ${expectedArtifactName} found`
      };
    }
    const art = matchingArtifacts[0];
    if (options.artifactId && art.id !== Number(options.artifactId)) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Artifact ID mismatch: expected ${options.artifactId}, API response has ${art.id}`
      };
    }
    if (art.expired === true) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Artifact ${art.name} is expired`
      };
    }
    if (!art.size_in_bytes || art.size_in_bytes <= 0) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Artifact ${art.name} has invalid size: ${art.size_in_bytes}`
      };
    }
    if (art.workflow_run?.id && Number(art.workflow_run.id) !== expectedRemoteRunId) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Artifact associated run ID (${art.workflow_run.id}) does not match expectedRemoteRunId (${expectedRemoteRunId})`
      };
    }
    if (art.workflow_run?.head_sha && art.workflow_run.head_sha.toLowerCase() !== expectedSha.toLowerCase()) {
      return {
        valid: false,
        code: 'ATTESTATION_ARTIFACT_INVALID',
        error: `Artifact associated head_sha (${art.workflow_run.head_sha}) does not match expectedSha (${expectedSha})`
      };
    }
  }

  // 10. Cross-reference physical evidence directory
  if (fs.existsSync(evidenceDir)) {
    const indexPath = path.join(evidenceDir, 'evidence-files.sha256');
    if (!fs.existsSync(indexPath)) {
      return {
        valid: false,
        code: 'ATTESTATION_EVIDENCE_MISMATCH',
        error: `Physical index evidence-files.sha256 missing in evidenceDir: ${evidenceDir}`
      };
    }

    const physicalIndexBytes = fs.readFileSync(indexPath);
    const physicalIndexHash = crypto.createHash('sha256').update(physicalIndexBytes).digest('hex');
    if (physicalIndexHash.toLowerCase() !== attestation.evidence_index_sha256.toLowerCase()) {
      return {
        valid: false,
        code: 'ATTESTATION_EVIDENCE_MISMATCH',
        error: `evidence_index_sha256 mismatch: attestation has ${attestation.evidence_index_sha256}, physical file is ${physicalIndexHash}`
      };
    }
  }

  // 11. Check that attestation and .artifacts are not tracked in git
  try {
    const trackedFiles = execSync('git ls-files .artifacts', {
      encoding: 'utf8',
      cwd: ROOT_DIR,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (trackedFiles.length > 0) {
      return {
        valid: false,
        code: 'ATTESTATION_GIT_TRACKED',
        error: `Files inside .artifacts are tracked in git: ${trackedFiles}`
      };
    }
  } catch {}

  return {
    valid: true,
    attestation
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseVerifyArgs(process.argv.slice(2));
  console.log('[VERIFY-FINAL-ATTESTATION] Verifying final forensic attestation from physical API responses...');
  const result = verifyFinalAttestation(args);

  if (!result.valid) {
    console.error(`[FATAL] ${result.code}: ${result.error}`);
    process.exit(1);
  }

  console.log(`[PASS] Final attestation strictly verified for commit ${result.attestation.attested_commit_sha}.`);
  console.log(`       Classification: ${result.attestation.classification}`);
  console.log(`       Operational State: ${result.attestation.operational_state}`);
  console.log(`       Primary Run: ${result.attestation.primary_run_id} (${result.attestation.primary_status} / ${result.attestation.primary_conclusion})`);
  console.log(`       Remote Run: ${result.attestation.remote_verification_run_id} (${result.attestation.remote_status} / ${result.attestation.remote_conclusion})`);
  console.log(`       Query Actor: ${result.attestation.query_actor}`);
  console.log(`       Status: ${result.attestation.status}`);
  process.exit(0);
}
