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
    'primary_conclusion',
    'remote_verification_run_id',
    'remote_run_url',
    'remote_conclusion',
    'remote_started_at',
    'query_actor',
    'query_run_id',
    'artifact_name',
    'classification',
    'operational_state',
    'generated_at',
    'evidence_index_sha256',
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
    primary_conclusion: {
      type: 'string',
      const: 'success'
    },
    remote_verification_run_id: {
      type: 'integer',
      minimum: 1
    },
    remote_run_url: {
      type: 'string',
      pattern: '^https://github\\.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/\\d+$'
    },
    remote_conclusion: {
      type: 'string',
      const: 'success'
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

  // 5. Semantic field validations
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

  if (attestation.primary_conclusion !== 'success') {
    return {
      valid: false,
      code: 'ATTESTATION_CONCLUSION_INVALID',
      error: `primary_conclusion must be "success", found "${attestation.primary_conclusion}"`
    };
  }

  if (attestation.remote_conclusion !== 'success') {
    return {
      valid: false,
      code: 'ATTESTATION_CONCLUSION_INVALID',
      error: `remote_conclusion must be "success", found "${attestation.remote_conclusion}"`
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

  // 6. Cross-reference physical evidence directory
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

    // Verify remote API response matches if present
    const remoteApiResPath = path.join(evidenceDir, 'remote-workflow-run-api-response.json');
    if (fs.existsSync(remoteApiResPath)) {
      try {
        const rawRemoteData = JSON.parse(fs.readFileSync(remoteApiResPath, 'utf8'));
        if (Number(rawRemoteData.id) !== expectedRemoteRunId) {
          return {
            valid: false,
            code: 'ATTESTATION_EVIDENCE_MISMATCH',
            error: `remote-workflow-run-api-response.json ID (${rawRemoteData.id}) does not match expectedRemoteRunId (${expectedRemoteRunId})`
          };
        }
        if (rawRemoteData.head_sha && rawRemoteData.head_sha.toLowerCase() !== expectedSha.toLowerCase()) {
          return {
            valid: false,
            code: 'ATTESTATION_EVIDENCE_MISMATCH',
            error: `remote-workflow-run-api-response.json head_sha (${rawRemoteData.head_sha}) does not match expected SHA (${expectedSha})`
          };
        }
        const apiActor = rawRemoteData.actor?.login || rawRemoteData.triggering_actor?.login;
        if (apiActor && apiActor !== expectedActor) {
          return {
            valid: false,
            code: 'ATTESTATION_ACTOR_MISMATCH',
            error: `remote-workflow-run-api-response.json actor (${apiActor}) does not match expectedActor (${expectedActor})`
          };
        }
      } catch (e) {
        return {
          valid: false,
          code: 'ATTESTATION_EVIDENCE_MISMATCH',
          error: `Failed to verify remote-workflow-run-api-response.json against attestation: ${e.message}`
        };
      }
    }
  }

  // 7. Check that attestation and .artifacts are not tracked in git
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
  } catch {
    // If git is not present or not in a git repo, ignore git tracking check
  }

  return {
    valid: true,
    attestation
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseVerifyArgs(process.argv.slice(2));
  console.log('[VERIFY-FINAL-ATTESTATION] Verifying final forensic attestation...');
  const result = verifyFinalAttestation(args);

  if (!result.valid) {
    console.error(`[FATAL] ${result.code}: ${result.error}`);
    process.exit(1);
  }

  console.log(`[PASS] Final attestation strictly verified for commit ${result.attestation.attested_commit_sha}.`);
  console.log(`       Classification: ${result.attestation.classification}`);
  console.log(`       Operational State: ${result.attestation.operational_state}`);
  console.log(`       Primary Run: ${result.attestation.primary_run_id} (${result.attestation.primary_conclusion})`);
  console.log(`       Remote Run: ${result.attestation.remote_verification_run_id} (${result.attestation.remote_conclusion})`);
  console.log(`       Query Actor: ${result.attestation.query_actor}`);
  console.log(`       Status: ${result.attestation.status}`);
  process.exit(0);
}
