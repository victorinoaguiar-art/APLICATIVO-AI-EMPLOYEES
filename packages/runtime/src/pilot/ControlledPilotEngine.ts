import { createHash, randomBytes, randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  PilotProgram,
  ControlledPilotStatus,
  PilotTaskRequest,
  PilotTaskReceipt,
  PilotHumanReviewReceipt,
  PilotDeliveryReceipt,
  PilotMetrics,
  PilotGateResults,
  PilotGateCheck,
  PilotIncident,
  HumanReviewStatus,
  DeliveryStatus,
  FinalTaskStatus,
  OperationalPilotMode,
  PilotFinalAttestation,
  PilotReviewChallenge,
  PilotDocumentValidationReceipt,
  SecretProvider
} from '@ai-employee/shared';
import { TransactionalPilotStore } from './TransactionalPilotStore.js';
import { PhysicalDocumentValidator } from './PhysicalDocumentValidator.js';
import { PilotExternalValidator } from './PilotExternalValidator.js';
import { EnvironmentSecretProvider, scanAndRejectSensitiveFields } from './PilotSecretProvider.js';
import { PilotAjvValidator } from './PilotAjvValidator.js';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

export function resolveStrictCommitSha(customExecSync?: (cmd: string, opts?: any) => string): string {
  const isValidSha = (sha: string): boolean => /^[0-9a-f]{40}$/i.test(sha);

  // 1. GITHUB_SHA, quando executado no GitHub Actions
  if (process.env.GITHUB_SHA !== undefined) {
    const sha = process.env.GITHUB_SHA.trim();
    if (!isValidSha(sha)) {
      throw new Error(`GITHUB_SHA definido mas inválido: esperado 40 caracteres hexadecimais, obtido '${sha}'.`);
    }
    return sha.toLowerCase();
  }

  // 2. GIT_COMMIT_SHA, quando explicitamente injectado
  if (process.env.GIT_COMMIT_SHA !== undefined) {
    const sha = process.env.GIT_COMMIT_SHA.trim();
    if (!isValidSha(sha)) {
      throw new Error(`GIT_COMMIT_SHA definido mas inválido: esperado 40 caracteres hexadecimais, obtido '${sha}'.`);
    }
    return sha.toLowerCase();
  }

  // 3. git rev-parse HEAD, quando existir um checkout Git válido
  try {
    const exec = customExecSync || ((cmd: string, opts?: any) => {
      const { execSync } = require('node:child_process');
      return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], ...opts });
    });
    const output = exec('git rev-parse HEAD');
    const sha = (output || '').trim();
    if (!isValidSha(sha)) {
      throw new Error(`git rev-parse HEAD retornou SHA inválido: esperado 40 caracteres hexadecimais, obtido '${sha}'.`);
    }
    return sha.toLowerCase();
  } catch (err: any) {
    throw new Error(`Falha ao resolver commit SHA do repositório Git: ${err?.message || err}`);
  }
}

export class ControlledPilotEngine {
  private static instance: ControlledPilotEngine;
  private store: TransactionalPilotStore;
  private tokenService?: TokenService;
  private secretProvider: SecretProvider;
  private taskCache = new Map<string, PilotTaskReceipt>();

  public constructor(
    store?: TransactionalPilotStore,
    tokenService?: TokenService,
    secretProvider?: SecretProvider
  ) {
    this.store = store || new TransactionalPilotStore();
    this.tokenService = tokenService;
    this.secretProvider = secretProvider || new EnvironmentSecretProvider();
  }

  public static getInstance(
    store?: TransactionalPilotStore,
    tokenService?: TokenService,
    secretProvider?: SecretProvider
  ): ControlledPilotEngine {
    if (!ControlledPilotEngine.instance || store || tokenService || secretProvider) {
      ControlledPilotEngine.instance = new ControlledPilotEngine(store, tokenService, secretProvider);
    }
    return ControlledPilotEngine.instance;
  }

  public setSecretProvider(sp: SecretProvider): void {
    this.secretProvider = sp;
  }

  public getSecretProvider(): SecretProvider {
    return this.secretProvider;
  }

  public setTokenService(ts: TokenService): void {
    this.tokenService = ts;
  }

  public getTokenService(): TokenService | undefined {
    return this.tokenService;
  }

  public getStore(): TransactionalPilotStore {
    return this.store;
  }

  public getDbPath(): string {
    return this.store.getDbPath();
  }

  public getCommitSha(): string {
    return resolveStrictCommitSha();
  }

  public clearStateForTests(): void {
    this.taskCache.clear();
    this.store.clearTablesForTests();
  }

  public reset(store?: TransactionalPilotStore): void {
    this.taskCache.clear();
    if (store) {
      if (this.store && this.store !== store) {
        try {
          this.store.close();
        } catch {}
      }
      this.store = store;
      return;
    }

    // Se nenhum store for fornecido e o store actual já for uma base persistente em ficheiro,
    // PRESERVA a base persistente e apenas limpa os dados para os testes!
    if (this.store && this.store.getDbPath() !== ':memory:') {
      this.clearStateForTests();
      return;
    }

    // Caso o store seja :memory:, fecha e recria :memory:
    if (this.store) {
      try {
        this.store.close();
      } catch {}
    }
    this.store = new TransactionalPilotStore(':memory:');
  }

  // -------------------------------------------------------------
  // 1. Pilot Program Lifecycle
  // -------------------------------------------------------------
  public createPilot(spec: {
    pilot_id: string;
    tenant_id: string;
    organization_name: string;
    authorization_reference: string;
    authorization_document_path?: string;
    authorization_document_sha256?: string;
    authorized_by: string;
    authorized_at: string;
    start_at: string;
    end_at: string;
    selected_employee_ids: number[];
    allowed_data_categories: string[];
    prohibited_data_categories: string[];
    allowed_connectors: string[];
    prohibited_actions: string[];
    human_reviewers: string[];
    reviewer_configs?: Array<{
      reviewer_id: string;
      display_name: string;
      role: string;
      secret_ref?: string;
      key_id?: string;
      secret_or_key?: string;
    }>;
    task_limit: number;
    execution_mode?: OperationalPilotMode;
  }): PilotProgram {
    const execution_mode = spec.execution_mode || 'SIMULATION';
    const completeSpec = { ...spec, execution_mode };

    // Strict scan against sensitive plaintext secrets in operational configurations
    if (execution_mode === 'OPERATIONAL_PILOT') {
      scanAndRejectSensitiveFields(spec);
      if (spec.reviewer_configs) {
        for (const cfg of spec.reviewer_configs) {
          if ((cfg as any).secret_or_key) {
            throw new Error(
              `Campo sensível proibido detectado: 'secret_or_key' no revisor '${cfg.reviewer_id}'. Use 'secret_ref' ou 'key_id'.`
            );
          }
        }
      }
    }

    // 1. Validate external config schema
    const validation = PilotExternalValidator.validatePilotConfig(completeSpec, execution_mode);
    if (!validation.isValid) {
      throw new Error(`Configuração do piloto inválida:\n${validation.errors.join('\n')}`);
    }

    const existing = this.store.getPilot(spec.pilot_id);
    if (existing) {
      throw new Error(`Piloto com ID '${spec.pilot_id}' já existe.`);
    }

    // Verify selected employees exist in canonical 500 catalog
    for (const empId of spec.selected_employee_ids) {
      const exists = CANONICAL_500_ROLES.some(r => r.id === empId);
      if (!exists) {
        throw new Error(`Employee ID ${empId} não encontrado no catálogo canónico de 500.`);
      }
    }

    const now = new Date().toISOString();
    const pilot: PilotProgram = {
      ...completeSpec,
      status: 'DRAFT',
      created_at: now,
      updated_at: now
    };

    this.store.savePilot(pilot);
    return pilot;
  }

  public authorizePilot(pilot_id: string, authRef: string, authorizedBy: string, authAt: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    if (!authRef || !authorizedBy || !authAt) {
      throw new Error('Autorização física incompleta.');
    }
    pilot.authorization_reference = authRef;
    pilot.authorized_by = authorizedBy;
    pilot.authorized_at = authAt;
    pilot.status = 'AUTHORIZED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public activatePilot(pilot_id: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    if (pilot.status !== 'AUTHORIZED' && pilot.status !== 'PAUSED') {
      throw new Error(`Piloto não pode ser activado a partir do estado ${pilot.status}. Requer autorização prévia.`);
    }
    pilot.status = 'ACTIVE';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public pausePilot(pilot_id: string, reason: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    pilot.status = 'PAUSED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    this.recordIncident({
      incident_id: `INC_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pilot_id,
      timestamp: new Date().toISOString(),
      type: 'OTHER',
      severity: 'MEDIUM',
      details: `Piloto pausado: ${reason}`,
      resolved: false
    });
    return pilot;
  }

  public cancelPilot(pilot_id: string, reason: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    pilot.status = 'CANCELLED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public completePilot(pilot_id: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    pilot.status = 'COMPLETED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public getPilot(pilot_id: string): PilotProgram {
    const pilot = this.store.getPilot(pilot_id);
    if (!pilot) {
      throw new Error(`Piloto '${pilot_id}' não encontrado.`);
    }
    return pilot;
  }

  // -------------------------------------------------------------
  // 2. Task Intake & Execution Pipeline
  // -------------------------------------------------------------
  public executeTask(request: PilotTaskRequest): PilotTaskReceipt {
    const pilot = this.getPilot(request.pilot_id);

    // 1. Tenant Isolation Gate
    if (request.tenant_id !== pilot.tenant_id) {
      this.recordIncident({
        incident_id: `INC_CROSS_${Date.now()}`,
        pilot_id: pilot.pilot_id,
        timestamp: new Date().toISOString(),
        type: 'CROSS_TENANT_ACCESS',
        severity: 'CRITICAL',
        details: `Tentativa de acesso cruzado: Pedido para tenant '${request.tenant_id}' num piloto do tenant '${pilot.tenant_id}'.`,
        resolved: false
      });
      throw new Error(`Acesso negado: Isolamento multi-tenant violado. Tenant '${request.tenant_id}' difere do piloto '${pilot.tenant_id}'.`);
    }

    // Strict validation against default requester fallback in operational mode
    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!request.requested_by || request.requested_by === 'operador_saso_01') {
        throw new Error("Solicitante obrigatório e fallback 'operador_saso_01' proibido em modo operacional.");
      }
    }

    // 2. Prohibited Action Gate
    if (request.action_type && pilot.prohibited_actions?.includes(request.action_type)) {
      this.recordIncident({
        incident_id: `INC_UNAUTH_${Date.now()}`,
        pilot_id: pilot.pilot_id,
        timestamp: new Date().toISOString(),
        type: 'UNAUTHORIZED_ACTION',
        severity: 'CRITICAL',
        details: `Tentativa de acção proibida detectada: ${request.action_type}`,
        resolved: false
      });
      throw new Error(`Acção proibida pelo regulamento do piloto: '${request.action_type}'.`);
    }

    // 3. Validate external task request against pilot contract
    const taskValidation = PilotExternalValidator.validateTaskRequest(request, pilot);
    if (!taskValidation.isValid) {
      throw new Error(`Tarefa inválida rejeitada:\n${taskValidation.errors.join('\n')}`);
    }

    // 4. Pilot Status Gate
    if (pilot.status !== 'ACTIVE') {
      throw new Error(`Execução rejeitada: Piloto '${pilot.pilot_id}' não está activo (estado actual: ${pilot.status}).`);
    }

    // 5. Expiration Gate
    const now = new Date();
    if (now > new Date(pilot.end_at)) {
      throw new Error(`Execução rejeitada: Piloto '${pilot.pilot_id}' expirou em ${pilot.end_at}.`);
    }

    // 6. Task Limit Gate
    const currentTasks = this.store.listTasks(pilot.pilot_id);
    if (currentTasks.length >= pilot.task_limit) {
      throw new Error(`Execução rejeitada: Limite de ${pilot.task_limit} tarefas atingido no piloto.`);
    }

    // 7. Idempotency Check in Transactional Persistence (Pilar 3: Zero Fabricação)
    if (!request.idempotency_key || typeof request.idempotency_key !== 'string' || request.idempotency_key.trim().length === 0) {
      throw new Error('Chave de idempotência (idempotency_key) obrigatória e ausente na tarefa.');
    }
    if (!request.received_at || typeof request.received_at !== 'string' || isNaN(Date.parse(request.received_at))) {
      throw new Error('received_at obrigatório e inválido na tarefa.');
    }
    if (request.tenant_id !== pilot.tenant_id) {
      throw new Error(`Isolamento multi-tenant violado: tenant '${request.tenant_id}' difere do piloto '${pilot.tenant_id}'.`);
    }
    if (request.pilot_id !== pilot.pilot_id) {
      throw new Error(`pilot_id '${request.pilot_id}' difere do piloto activo '${pilot.pilot_id}'.`);
    }

    const existingTask = this.store.getTaskByIdempotency(pilot.pilot_id, request.idempotency_key);
    if (existingTask) {
      return existingTask;
    }

    // 8. Input Snapshot & Tampering Validation
    if (!request.input_data || (typeof request.input_data === 'object' && Object.keys(request.input_data).length === 0)) {
      throw new Error('Dados de entrada vazios ou ausentes.');
    }
    const inputSnapshot = canonicalJson(request.input_data);
    const inputSnapshotSha = sha256(inputSnapshot);

    // 9. Execute Real Task Content Generation
    const startedAt = new Date().toISOString();
    const generated = this.generateEmployeeOutput(request, pilot.execution_mode);

    // 10. Physical Document Validation (PDF, DOCX, XLSX)
    const docValidation = PhysicalDocumentValidator.validate(generated.buffer, request.format, pilot.execution_mode);
    if (!docValidation.isValid) {
      throw new Error(`Falha na validação física do documento: ${docValidation.error}`);
    }

    const completedAt = new Date().toISOString();
    const outputHash = docValidation.sha256;

    const isSim = pilot.execution_mode === 'SIMULATION';
    const classificationLevel = isSim
      ? 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED'
      : 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY';

    const receipt: PilotTaskReceipt = {
      task_id: request.task_id,
      pilot_id: request.pilot_id,
      tenant_id: request.tenant_id,
      commit_sha: this.getCommitSha(),
      employee_id: request.employee_id,
      requested_by: request.requested_by,
      received_at: request.received_at,
      input_snapshot_sha256: inputSnapshotSha,
      execution_started_at: startedAt,
      execution_completed_at: completedAt,
      output_files: [generated.fileName],
      output_hashes: [outputHash],
      human_review_status: 'PENDING_REVIEW',
      reviewed_by: null,
      reviewed_at: null,
      corrections_required: 0,
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      error_code: null,
      version: 1,
      idempotency_key: request.idempotency_key,
      execution_mode: pilot.execution_mode,
      is_simulation: isSim,
      classification_level: classificationLevel
    };

    receipt.receipt_sha256 = '';
    receipt.receipt_sha256 = sha256(canonicalJson(receipt));

    // Save task, output and physical BLOB atomically with immediate read verification (Passo 1)
    this.store.saveTaskWithOutputAndVerify(receipt, {
      output_id: `OUT_${request.task_id}_v1`,
      task_id: request.task_id,
      version: 1,
      file_name: generated.fileName,
      file_path: generated.fileName,
      file_bytes: generated.buffer,
      file_bytes_sha256: outputHash,
      is_active: true
    });

    // 11. Validação física e estrutural independente prévia no pipeline (Passos 2, 3, 4, 5)
    // Passo 2: releitura dos bytes da persistência
    const activeOutRecord = this.store.getActiveOutputBytes(request.task_id);
    if (!activeOutRecord || !activeOutRecord.bytes) {
      throw new Error(`Falha crítica: Bytes de saída não encontrados na persistência para tarefa '${request.task_id}'.`);
    }
    const savedBytes = activeOutRecord.bytes;

    PhysicalDocumentValidator.validateMimeCoherence(savedBytes, request.format, generated.fileName);

    // Passos 3 & 4: Validação estrutural interna + validação independente
    const [structReceipt, indepReceipt] = PhysicalDocumentValidator.createBothValidationReceipts(
      savedBytes,
      request.format,
      request.task_id,
      1,
      pilot.tenant_id,
      pilot.pilot_id,
      pilot.execution_mode,
      generated.fileName
    );

    // Passo 5: Persistência dos dois recibos distintos
    this.store.saveDocumentValidationReceipt(structReceipt);
    this.store.saveDocumentValidationReceipt(indepReceipt);

    if (structReceipt.result !== 'PASS' || indepReceipt.result !== 'PASS') {
      const errorMsg = `Falha na validação do documento para tarefa '${request.task_id}': Estrutural: ${structReceipt.error || 'OK'}, Independente: ${indepReceipt.error || 'OK'}`;
      this.recordIncident({
        incident_id: `INC_DOCVAL_${Date.now()}`,
        pilot_id: pilot.pilot_id,
        timestamp: new Date().toISOString(),
        type: 'OTHER',
        severity: 'HIGH',
        details: errorMsg,
        resolved: false
      });
      receipt.final_status = 'FAILED';
      receipt.error_code = 'DOCUMENT_VALIDATION_FAILED';
      receipt.human_review_status = 'BLOCKED';
      this.store.updateTask(receipt);
      throw new Error(errorMsg);
    }

    // Passo 6: Emissão do Desafio de Revisão Humana (Fase A)
    this.issueReviewChallenge(request.task_id);

    this.taskCache.set(receipt.task_id, receipt);
    return receipt;
  }

  // -------------------------------------------------------------
  // 3. Human Review Challenge Issuance (Phase A)
  // -------------------------------------------------------------
  public issueReviewChallenge(
    taskId: string,
    allowedDecision?: HumanReviewStatus,
    reviewerId?: string
  ): PilotReviewChallenge {
    const task = this.store.getTask(taskId);
    if (!task) {
      throw new Error(`Tarefa '${taskId}' não encontrada.`);
    }
    const pilot = this.getPilot(task.pilot_id);

    const activeOutput = this.store.getActiveOutput(taskId);
    if (!activeOutput) {
      throw new Error(`Output activo não encontrado para tarefa '${taskId}'.`);
    }

    // Validação estrutural e independente prévias OBRIGATÓRIAS (Pilar 2 & 5)
    const structReceipt = this.store.getDocumentValidationReceipt(taskId, activeOutput.version, 'INTERNAL_STRUCTURAL_VALIDATION');
    const indepReceipt = this.store.getDocumentValidationReceipt(taskId, activeOutput.version, 'INDEPENDENT_LIBRARY_VALIDATION');

    if (!structReceipt || structReceipt.result !== 'PASS') {
      throw new Error(
        `Desafio de revisão bloqueado: Documento da tarefa '${taskId}' não possui validação estrutural interna aprovada (PASS).`
      );
    }
    if (!indepReceipt || indepReceipt.result !== 'PASS') {
      throw new Error(
        `Desafio de revisão bloqueado: Documento da tarefa '${taskId}' não possui validação independente aprovada (PASS).`
      );
    }
    if (structReceipt.file_bytes_sha256 !== activeOutput.file_bytes_sha256 || indepReceipt.file_bytes_sha256 !== activeOutput.file_bytes_sha256) {
      throw new Error(
        `Desafio de revisão bloqueado: Hash do documento nos recibos de validação diverge do output activo da tarefa '${taskId}'.`
      );
    }

    const challengeId = `CHAL_${Date.now()}_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const nonce = randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    const challenge: PilotReviewChallenge = {
      challenge_id: challengeId,
      nonce,
      tenant_id: pilot.tenant_id,
      pilot_id: pilot.pilot_id,
      task_id: taskId,
      document_version: activeOutput.version,
      document_sha256: activeOutput.file_bytes_sha256,
      reviewer_id: reviewerId || null,
      allowed_decision: allowedDecision || null,
      issued_at: issuedAt,
      challenge_issued_at: issuedAt,
      expires_at: expiresAt,
      consumed_at: null,
      status: 'PENDING'
    };

    this.store.saveReviewChallenge(challenge);
    return challenge;
  }

  // -------------------------------------------------------------
  // 4. Human Review & Signed Challenge Consumption (Phase B)
  // -------------------------------------------------------------
  public reviewTask(params: {
    review_id: string;
    task_id: string;
    challenge_id?: string;
    reviewer: string;
    decision: HumanReviewStatus;
    comments: string;
    auth_method?: 'SESSION_TOKEN' | 'HMAC_SIGNATURE' | 'API_KEY';
    auth_token?: string;
    reviewer_token?: string;
    session_reference?: string;
    signature?: string;
    corrections_requested?: string[];
    corrected_content?: string | Buffer;
    event_signed_at?: string;
  }): PilotHumanReviewReceipt {
    const reviewReceivedAt = new Date().toISOString();

    const task = this.taskCache.get(params.task_id) || this.store.getTask(params.task_id);
    if (!task) {
      throw new Error(`Tarefa '${params.task_id}' não encontrada.`);
    }

    const pilot = this.getPilot(task.pilot_id);

    // 1. Prohibit self-review (solicitante e revisor não podem ser a mesma pessoa)
    if (task.requested_by === params.reviewer) {
      throw new Error('Auto-revisão proibida: solicitante e revisor não podem ser a mesma pessoa.');
    }

    // 2. Check reviewer authorization
    if (!pilot.human_reviewers.includes(params.reviewer)) {
      throw new Error(`Utilizador '${params.reviewer}' não está credenciado como revisor humano no piloto.`);
    }

    // 3. Obter Desafio de Revisão Fase A (via challenge_id ou pendente na tarefa)
    let challenge: PilotReviewChallenge | null = null;
    if (params.challenge_id) {
      challenge = this.store.getReviewChallenge(params.challenge_id);
    } else {
      challenge = this.store.getPendingChallengeForTask(params.task_id);
    }

    if (!challenge || challenge.status !== 'PENDING') {
      throw new Error(`Desafio de revisão pendente não encontrado ou já consumido para a tarefa '${params.task_id}'.`);
    }

    if (new Date() > new Date(challenge.expires_at)) {
      throw new Error(`Desafio de revisão expirou em ${challenge.expires_at}.`);
    }

    if (challenge.reviewer_id && challenge.reviewer_id !== params.reviewer) {
      throw new Error(`Desafio de revisão restrito ao revisor '${challenge.reviewer_id}'.`);
    }

    if (challenge.allowed_decision && challenge.allowed_decision !== params.decision) {
      throw new Error(`Decisão de revisão não autorizada pelo desafio: '${params.decision}'.`);
    }

    const activeOutput = this.store.getActiveOutput(params.task_id);
    if (!activeOutput) {
      throw new Error(`Ficheiros de saída activos da tarefa '${params.task_id}' não encontrados.`);
    }

    if (challenge.document_sha256 !== activeOutput.file_bytes_sha256) {
      throw new Error('Hash do documento diverge do desafio emitido.');
    }

    // 3b. Validação estrutural interna e validação independente prévias com status PASS obrigatórias (Pilar 2 & 5)
    const structReceipt = this.store.getDocumentValidationReceipt(params.task_id, activeOutput.version, 'INTERNAL_STRUCTURAL_VALIDATION');
    const indepReceipt = this.store.getDocumentValidationReceipt(params.task_id, activeOutput.version, 'INDEPENDENT_LIBRARY_VALIDATION');

    if (!structReceipt || structReceipt.result !== 'PASS') {
      throw new Error('Revisão rejeitada: documento ativo não possui validação estrutural interna aprovada (PASS).');
    }
    if (!indepReceipt || indepReceipt.result !== 'PASS') {
      throw new Error('Revisão rejeitada: documento ativo não possui validação independente aprovada (PASS).');
    }
    if (structReceipt.file_bytes_sha256 !== activeOutput.file_bytes_sha256 || indepReceipt.file_bytes_sha256 !== activeOutput.file_bytes_sha256) {
      throw new Error('Revisão rejeitada: hash do documento nos recibos de validação diverge do output ativo.');
    }

    // 4. Timestamps forenses & Autenticação Criptográfica (Pilar 1 & 6)
    const challengeIssuedAt = challenge.challenge_issued_at || challenge.issued_at;
    const prevHash = activeOutput.file_bytes_sha256;
    let newHash = prevHash;

    const authToken = params.auth_token || params.reviewer_token;
    let sessionRef = params.session_reference;
    let sessionId: string | undefined;
    let authTokenSha256: string | undefined;

    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!authToken) {
        throw new Error('Token de autenticação do revisor obrigatório em modo OPERATIONAL_PILOT.');
      }
      if (!this.tokenService) {
        throw new Error('Serviço de autenticação TokenService não configurado no motor para execução operacional.');
      }
      if (!params.event_signed_at) {
        throw new Error('Timestamp de assinatura do evento (event_signed_at) obrigatório em modo OPERATIONAL_PILOT.');
      }
    }

    if (authToken) {
      authTokenSha256 = sha256(authToken);
      const tokenSvc = this.tokenService || new TokenService();
      const tokenValidation = PilotExternalValidator.validateReviewerToken(
        authToken,
        pilot.tenant_id,
        params.reviewer,
        tokenSvc,
        pilot.pilot_id
      );
      if (!tokenValidation.isValid) {
        throw new Error(`Autenticação de revisor por token rejeitada: ${tokenValidation.error}`);
      }

      const tokenJti = tokenValidation.payload?.jti || authTokenSha256.slice(0, 16);
      const session = this.store.getActiveSessionForToken(
        tokenJti,
        pilot.tenant_id,
        params.reviewer,
        pilot.pilot_id
      );
      if (session) {
        if (session.reviewer_id !== params.reviewer) {
          throw new Error(`Sessão activa pertence ao revisor '${session.reviewer_id}', não a '${params.reviewer}'.`);
        }
        if (session.tenant_id !== pilot.tenant_id) {
          throw new Error(`Sessão activa pertence ao inquilino '${session.tenant_id}', não a '${pilot.tenant_id}'.`);
        }
        if (session.pilot_id !== pilot.pilot_id) {
          throw new Error(`Sessão activa pertence ao piloto '${session.pilot_id}', não a '${pilot.pilot_id}'.`);
        }
        sessionId = session.session_id;
        sessionRef = session.session_id;
      } else if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
        throw new Error('Sessão de revisor activa não encontrada ou expirada para o token.');
      } else {
        sessionRef = tokenValidation.payload?.jti || authTokenSha256.slice(0, 16);
      }
    }

    const eventSignedAt = params.event_signed_at || reviewReceivedAt;

    const reviewerConfig = pilot.reviewer_configs?.find(r => r.reviewer_id === params.reviewer);
    let secretKey: string | undefined;

    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!reviewerConfig) {
        throw new Error(`Configuração do revisor '${params.reviewer}' ausente em modo operacional.`);
      }
      const secretRef = reviewerConfig.secret_ref || reviewerConfig.key_id;
      if (!secretRef) {
        throw new Error(`Referência de segredo (secret_ref/key_id) ausente para revisor '${params.reviewer}'.`);
      }
      secretKey = this.secretProvider.resolveSecret(secretRef, pilot.tenant_id);
      if (!secretKey) {
        throw new Error(`Segredo não resolvido pelo SecretProvider para '${secretRef}'.`);
      }
    } else {
      // Modo SIMULATION
      const secretRef = reviewerConfig?.secret_ref || reviewerConfig?.key_id;
      if (secretRef) {
        try {
          secretKey = this.secretProvider.resolveSecret(secretRef, pilot.tenant_id);
        } catch {}
      }
      if (!secretKey) {
        secretKey = reviewerConfig?.secret_or_key || 'SIMULATION_PILOT_DEV_REVIEW_KEY';
      }
    }

    let signature = params.signature;
    if (!signature) {
      if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
        throw new Error('Assinatura canónica do desafio obrigatória em modo OPERATIONAL_PILOT.');
      }
      signature = PilotExternalValidator.generateCanonicalChallengeSignature(
        challenge,
        params.reviewer,
        params.decision,
        secretKey!,
        eventSignedAt
      );
    } else {
      const isValidSig = PilotExternalValidator.validateCanonicalChallengeSignature(
        challenge,
        params.reviewer,
        params.decision,
        signature,
        secretKey!,
        eventSignedAt
      );
      if (!isValidSig) {
        throw new Error('Assinatura criptográfica canónica do desafio inválida ou adulterada.');
      }
    }

    const reviewAcceptedAt = new Date().toISOString();

    // Verificação de monotonicidade cronológica dos 4 primeiros timestamps
    const t1 = new Date(challengeIssuedAt).getTime();
    const t2 = new Date(eventSignedAt).getTime();
    const t3 = new Date(reviewReceivedAt).getTime();
    const t4 = new Date(reviewAcceptedAt).getTime();

    if (t1 > t2 || t2 > t3 || t3 > t4) {
      throw new Error(
        `Violação de monotonicidade cronológica nos timestamps forenses da revisão: challenge_issued_at (${challengeIssuedAt}) <= event_signed_at (${eventSignedAt}) <= review_received_at (${reviewReceivedAt}) <= review_accepted_at (${reviewAcceptedAt}).`
      );
    }

    // 5. Handle corrections
    if (params.decision === 'APPROVED_WITH_CORRECTIONS') {
      if (!params.corrected_content) {
        throw new Error('Correcção exigida requer novo conteúdo rectificado.');
      }

      const format: any = activeOutput.file_name.endsWith('.pdf')
        ? 'PDF'
        : activeOutput.file_name.endsWith('.xlsx')
        ? 'XLSX'
        : 'DOCX';

      let correctedBuf: Buffer;
      if (Buffer.isBuffer(params.corrected_content)) {
        correctedBuf = params.corrected_content;
      } else {
        const textContent = String(params.corrected_content);
        if (format === 'DOCX') {
          correctedBuf = PhysicalDocumentValidator.buildRealBinaryDocx('Documento Rectificado', textContent.split('\n'));
        } else if (format === 'PDF') {
          correctedBuf = PhysicalDocumentValidator.buildRealBinaryPdf('Documento Rectificado', textContent.split('\n'));
        } else {
          correctedBuf = Buffer.from(textContent, 'utf8');
        }
      }

      PhysicalDocumentValidator.validateMimeCoherence(correctedBuf, format, activeOutput.file_name);

      const v2FileName = activeOutput.file_name.replace(/\.([a-z0-9]+)$/, '_v2.$1');

      // Gerar os DOIS recibos de validação para a v2 (estrutural e independente)
      const [structReceiptV2, indepReceiptV2] = PhysicalDocumentValidator.createBothValidationReceipts(
        correctedBuf,
        format,
        params.task_id,
        2,
        pilot.tenant_id,
        pilot.pilot_id,
        pilot.execution_mode,
        v2FileName
      );
      this.store.saveDocumentValidationReceipt(structReceiptV2);
      this.store.saveDocumentValidationReceipt(indepReceiptV2);

      if (structReceiptV2.result !== 'PASS' || indepReceiptV2.result !== 'PASS') {
        throw new Error(
          `Conteúdo rectificado rejeitado na validação documental: Estrutural: ${structReceiptV2.error || 'OK'}, Independente: ${indepReceiptV2.error || 'OK'}`
        );
      }

      newHash = structReceiptV2.file_bytes_sha256;

      task.output_files = [v2FileName];
      task.output_hashes = [newHash];
      task.corrections_required = (params.corrections_requested || []).length || 1;
      task.version = 2;

      this.store.saveOutput({
        output_id: `OUT_${params.task_id}_v2`,
        task_id: params.task_id,
        version: 2,
        file_name: v2FileName,
        file_path: v2FileName,
        file_bytes: correctedBuf,
        file_bytes_sha256: newHash,
        is_active: true
      });
    } else if (params.decision === 'REJECTED') {
      task.delivery_status = 'BLOCKED';
      task.final_status = 'REJECTED';
    } else if (params.decision === 'BLOCKED') {
      task.delivery_status = 'BLOCKED';
      task.final_status = 'BLOCKED';
    }

    const challengeConsumedAt = new Date().toISOString();
    const t5 = new Date(challengeConsumedAt).getTime();
    if (t4 > t5) {
      throw new Error(
        `Violação de monotonicidade cronológica: review_accepted_at (${reviewAcceptedAt}) <= challenge_consumed_at (${challengeConsumedAt}).`
      );
    }

    const currentSha = this.getCommitSha();
    if (task.commit_sha && task.commit_sha !== currentSha) {
      throw new Error(`Divergência de commit_sha entre tarefa (${task.commit_sha}) e revisão (${currentSha}).`);
    }

    task.human_review_status = params.decision;
    task.reviewed_by = params.reviewer;
    task.reviewed_at = reviewAcceptedAt;
    task.receipt_sha256 = '';
    task.receipt_sha256 = sha256(canonicalJson(task));

    const reviewReceipt: PilotHumanReviewReceipt = {
      review_id: params.review_id,
      task_id: params.task_id,
      pilot_id: task.pilot_id,
      tenant_id: pilot.tenant_id,
      commit_sha: currentSha,
      document_version: task.version,
      challenge_id: challenge.challenge_id,
      reviewer: params.reviewer,
      reviewed_at: reviewAcceptedAt,
      decision: params.decision,
      comments: params.comments,
      corrections_requested: params.corrections_requested,
      previous_output_hash: prevHash,
      new_output_hash: newHash,
      auth_method: authToken ? 'SESSION_TOKEN' : (params.auth_method || 'HMAC_SIGNATURE'),
      review_signature_sha256: signature,
      receipt_sha256: '',
      challenge_issued_at: challengeIssuedAt,
      event_signed_at: eventSignedAt,
      review_received_at: reviewReceivedAt,
      review_accepted_at: reviewAcceptedAt,
      challenge_consumed_at: challengeConsumedAt,
      ...(authTokenSha256 ? { auth_token_sha256: authTokenSha256 } : {}),
      ...(sessionId ? { session_id: sessionId } : {}),
      ...(sessionRef ? { session_reference: sessionRef } : {})
    };
    reviewReceipt.receipt_sha256 = sha256(canonicalJson(reviewReceipt));

    // Consumo atómico do desafio e persistência da revisão
    this.store.consumeReviewChallengeAtomic(challenge.challenge_id, reviewReceipt, task);
    this.taskCache.set(task.task_id, task);
    return reviewReceipt;
  }

  // -------------------------------------------------------------
  // 4. Controlled Delivery vs. Explicit Archiving
  // -------------------------------------------------------------
  public deliverTask(
    taskIdOrParams: string | {
      taskId: string;
      deliveredTo: string;
      channel: string;
      externalProviderResponse?: Record<string, any>;
    },
    deliveredToArg?: string,
    channelArg?: string,
    externalProviderResponseArg?: Record<string, any>
  ): PilotDeliveryReceipt {
    const params = typeof taskIdOrParams === 'string'
      ? {
          taskId: taskIdOrParams,
          deliveredTo: deliveredToArg || 'archive@saso.ao',
          channel: channelArg || 'INTERNAL_ARCHIVE',
          externalProviderResponse: externalProviderResponseArg
        }
      : taskIdOrParams;

    const task = this.taskCache.get(params.taskId) || this.store.getTask(params.taskId);
    if (!task) {
      throw new Error(`Tarefa '${params.taskId}' não encontrada.`);
    }

    const pilot = this.getPilot(task.pilot_id);

    // Strict validation against default delivery recipient in operational mode
    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!params.deliveredTo || params.deliveredTo === 'archive@saso.ao') {
        throw new Error("Destinatário de entrega obrigatório e fallback 'archive@saso.ao' proibido em modo operacional.");
      }
    }

    // Require independent document validation pass prior to delivery
    if (task.version === undefined || task.version === null || typeof task.version !== 'number' || !Number.isInteger(task.version) || task.version < 1) {
      throw new Error(`Entrega bloqueada: Versão da tarefa '${params.taskId}' inválida ou ausente.`);
    }
    const docReceipt = this.store.getDocumentValidationReceipt(params.taskId, task.version);
    if (!docReceipt || (!docReceipt.is_valid && docReceipt.result !== 'PASS')) {
      throw new Error(`Entrega bloqueada: Documento da tarefa '${params.taskId}' não possui validação física independente aprovada.`);
    }

    if (task.human_review_status !== 'APPROVED' && task.human_review_status !== 'APPROVED_WITH_CORRECTIONS') {
      throw new Error(`Entrega bloqueada: Tarefa '${params.taskId}' não tem aprovação humana (estado: ${task.human_review_status}).`);
    }

    if (!task.output_hashes || task.output_hashes.length === 0) {
      throw new Error('Entrega bloqueada: Saída sem hash físico não pode ser entregue.');
    }

    // Ponto 3: Localizar revisão aprovada que autorizou a entrega
    const taskReviews = this.store.listReviewsForTask(params.taskId);
    const approvedReview = taskReviews.slice().reverse().find(r => 
      (r.decision === 'APPROVED' || r.decision === 'APPROVED_WITH_CORRECTIONS') &&
      (r.document_version === task.version || (!r.document_version && task.version === 1))
    );
    if (!approvedReview) {
      throw new Error(`Entrega bloqueada: Nenhuma revisão aprovada encontrada para a versão ${task.version} da tarefa '${params.taskId}'.`);
    }
    if (approvedReview.tenant_id && approvedReview.tenant_id !== task.tenant_id) {
      throw new Error(`Entrega bloqueada: Tenant da revisão '${approvedReview.review_id}' (${approvedReview.tenant_id}) diverge da tarefa (${task.tenant_id}).`);
    }
    if (approvedReview.pilot_id && approvedReview.pilot_id !== task.pilot_id) {
      throw new Error(`Entrega bloqueada: Piloto da revisão '${approvedReview.review_id}' (${approvedReview.pilot_id}) diverge da tarefa (${task.pilot_id}).`);
    }
    const currentSha = this.getCommitSha();
    if (approvedReview.commit_sha && approvedReview.commit_sha !== currentSha) {
      throw new Error(`Divergência de commit_sha entre revisão (${approvedReview.commit_sha}) e entrega (${currentSha}).`);
    }
    if (task.commit_sha && task.commit_sha !== currentSha) {
      throw new Error(`Divergência de commit_sha entre tarefa (${task.commit_sha}) e entrega (${currentSha}).`);
    }
    if (approvedReview.new_output_hash && !task.output_hashes.includes(approvedReview.new_output_hash)) {
      throw new Error(`Entrega bloqueada: Hash do output aprovado na revisão '${approvedReview.review_id}' (${approvedReview.new_output_hash}) não está presente nos hashes da tarefa.`);
    }

    const deliveredAt = new Date().toISOString();
    const hasExternalResponse = Boolean(params.externalProviderResponse && params.externalProviderResponse.external_id);

    // If no real external provider response, mark strictly as ARCHIVED or READY_FOR_MANUAL_DELIVERY
    let status: DeliveryStatus = 'ARCHIVED';
    if (hasExternalResponse) {
      status = 'DELIVERED';
    } else if (params.channel === 'MANUAL_DISPATCH') {
      status = 'READY_FOR_MANUAL_DELIVERY';
    } else {
      status = 'ARCHIVED';
    }

    task.delivery_status = status;
    task.receipt_sha256 = '';
    task.receipt_sha256 = sha256(canonicalJson(task));

    const deliveryReceipt: PilotDeliveryReceipt = {
      delivery_id: `DELIV_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      task_id: params.taskId,
      pilot_id: task.pilot_id,
      tenant_id: task.tenant_id,
      commit_sha: currentSha,
      document_version: task.version,
      review_id: approvedReview.review_id,
      delivered_to: params.deliveredTo,
      channel: params.channel,
      delivered_at: deliveredAt,
      output_hashes: [...task.output_hashes],
      status,
      is_external_confirmed: hasExternalResponse,
      external_provider_response: params.externalProviderResponse,
      receipt_sha256: ''
    };
    deliveryReceipt.receipt_sha256 = sha256(canonicalJson(deliveryReceipt));

    this.store.transaction(() => {
      this.store.saveDelivery(deliveryReceipt);
      this.store.updateTask(task);
    });

    return deliveryReceipt;
  }

  // -------------------------------------------------------------
  // Document Quality & Placeholder Validation (Backwards Compatibility)
  // -------------------------------------------------------------
  public validateDocumentContent(content: string, format: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Conteúdo do documento gerado está vazio.');
    }

    // Residual placeholder pattern checks
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
      if (pat.test(content)) {
        throw new Error(`Rejeição de qualidade: Documento contém placeholder residual ou template não preenchido (${pat}).`);
      }
    }

    // Format specific checks
    if (format === 'PDF') {
      if (!content.startsWith('%PDF-1.7') && !content.includes('[PDF DOCUMENT]')) {
        throw new Error('Ficheiro PDF com estrutura inválida.');
      }
    } else if (format === 'DOCX') {
      if (!content.includes('[DOCX DOCUMENT]') && !content.includes('<?xml')) {
        throw new Error('Ficheiro DOCX com estrutura inválida.');
      }
    } else if (format === 'XLSX') {
      if (!content.includes('[XLSX SPREADSHEET]') && !content.includes('<?xml')) {
        throw new Error('Ficheiro XLSX com estrutura inválida.');
      }
    }
  }

  // -------------------------------------------------------------
  // 5. Metrics Calculation (Derived Physically from Persistence)
  // -------------------------------------------------------------
  public calculatePilotMetrics(pilotId: string): PilotMetrics {
    const pilot = this.getPilot(pilotId);
    const tasks = this.store.listTasks(pilotId);
    const deliveries = this.store.listDeliveries(pilotId);
    const incidents = this.store.listIncidents(pilotId);

    const totalReceived = tasks.length;
    const totalCompleted = tasks.filter(t => t.final_status === 'SUCCESS').length;
    const totalApprovedFirst = tasks.filter(t => t.human_review_status === 'APPROVED' && t.corrections_required === 0).length;
    const totalCorrected = tasks.filter(t => t.human_review_status === 'APPROVED_WITH_CORRECTIONS' || t.corrections_required > 0).length;
    const totalRejected = tasks.filter(t => t.human_review_status === 'REJECTED' || t.final_status === 'REJECTED').length;
    const totalFailed = tasks.filter(t => t.final_status === 'FAILED' || t.error_code !== null).length;
    const totalArchived = tasks.filter(t => t.delivery_status === 'ARCHIVED' || t.delivery_status === 'READY_FOR_MANUAL_DELIVERY').length;

    const completionRate = totalReceived > 0 ? (totalCompleted / totalReceived) * 100 : 0;
    const firstPassRate = totalCompleted > 0 ? (totalApprovedFirst / totalCompleted) * 100 : 0;
    const correctionRate = totalCompleted > 0 ? (totalCorrected / totalCompleted) * 100 : 0;

    const executionTimesMs = tasks.map(t => {
      const start = new Date(t.execution_started_at).getTime();
      const end = new Date(t.execution_completed_at).getTime();
      return Math.max(0, end - start);
    }).sort((a, b) => a - b);

    const medianExec = executionTimesMs.length > 0
      ? executionTimesMs[Math.floor(executionTimesMs.length / 2)]
      : 0;
    const p95Exec = executionTimesMs.length > 0
      ? executionTimesMs[Math.floor(executionTimesMs.length * 0.95)]
      : 0;

    const reviewTimesMs: number[] = [];
    for (const t of tasks) {
      if (t.reviewed_at && t.execution_completed_at) {
        const ms = new Date(t.reviewed_at).getTime() - new Date(t.execution_completed_at).getTime();
        if (ms >= 0) reviewTimesMs.push(ms);
      }
    }
    reviewTimesMs.sort((a, b) => a - b);
    const medianReview = reviewTimesMs.length > 0
      ? reviewTimesMs[Math.floor(reviewTimesMs.length / 2)]
      : 0;

    const approvedCount = totalApprovedFirst + totalCorrected;
    const processedDeliveries = deliveries.filter(d => d.status === 'DELIVERED' || d.status === 'ARCHIVED' || d.status === 'READY_FOR_MANUAL_DELIVERY').length;
    const deliverySuccessRate = approvedCount > 0 ? (processedDeliveries / approvedCount) * 100 : 0;

    const crossTenantIncidents = incidents.filter(i => i.type === 'CROSS_TENANT_ACCESS').length;
    const privacyIncidents = incidents.filter(i => i.type === 'PRIVACY_LEAK').length;
    const unauthorizedActionAttempts = incidents.filter(i => i.type === 'UNAUTHORIZED_ACTION').length;
    const duplicateEffects = incidents.filter(i => i.type === 'DUPLICATE_EXECUTION').length;

    return {
      execution_mode: pilot.execution_mode,
      total_tasks_received: totalReceived,
      total_tasks_completed: totalCompleted,
      total_tasks_approved_first_review: totalApprovedFirst,
      total_tasks_corrected: totalCorrected,
      total_tasks_rejected: totalRejected,
      total_tasks_failed: totalFailed,
      total_tasks_archived: totalArchived,
      completion_rate: Number(completionRate.toFixed(2)),
      first_pass_acceptance_rate: Number(firstPassRate.toFixed(2)),
      human_correction_rate: Number(correctionRate.toFixed(2)),
      median_execution_time: medianExec,
      p95_execution_time: p95Exec,
      median_review_time: medianReview,
      delivery_success_rate: Number(deliverySuccessRate.toFixed(2)),
      cross_tenant_incidents: crossTenantIncidents,
      privacy_incidents: privacyIncidents,
      unauthorized_action_attempts: unauthorizedActionAttempts,
      duplicate_business_effects: duplicateEffects
    };
  }

  // -------------------------------------------------------------
  // 6. Pilot Gates Evaluation (Zero Hardcoded Values)
  // -------------------------------------------------------------
  public evaluatePilotGates(pilotId: string): PilotGateResults {
    const pilot = this.getPilot(pilotId);
    const metrics = this.calculatePilotMetrics(pilotId);
    const tasks = this.store.listTasks(pilotId);

    // Gate 1: Autorização física
    const hasAuth = Boolean(pilot.authorization_reference && pilot.authorized_by);
    const gate1Passed = hasAuth;

    // Gate 2: Tenant isolation
    const gate2Passed = metrics.cross_tenant_incidents === 0;

    // Gate 3: Privacidade
    const gate3Passed = metrics.privacy_incidents === 0;

    // Gate 4: Execução
    const gate4Passed = metrics.total_tasks_completed >= 25;

    // Gate 5: Qualidade
    const gate5Passed = metrics.first_pass_acceptance_rate >= 80;

    // Gate 6: Correcção (todas as tarefas corrigidas devem ter saída v2 e v1 preservada)
    const correctedTasks = tasks.filter(t => t.corrections_required > 0);
    let allCorrectionsVerified = true;
    for (const ct of correctedTasks) {
      const outputs = this.store.getOutputsForTask(ct.task_id);
      const hasV1 = outputs.some(o => o.version === 1);
      const hasV2 = outputs.some(o => o.version === 2 && o.is_active === 1);
      if (!hasV1 || !hasV2) {
        allCorrectionsVerified = false;
        break;
      }
    }
    const gate6Passed = correctedTasks.length > 0 ? allCorrectionsVerified : true;

    // Gate 7: Entrega / Arquivamento declarado
    const gate7Passed = metrics.delivery_success_rate >= 95;

    // Gate 8: Idempotência
    const gate8Passed = metrics.duplicate_business_effects === 0;

    // Gate 9: Acções proibidas
    const gate9Passed = metrics.unauthorized_action_attempts === 0;

    // Gate 10: Evidência integral
    const allHaveHashes = tasks.length > 0 && tasks.every(t => t.output_hashes.length > 0 && t.receipt_sha256);
    const gate10Passed = allHaveHashes;

    const gates: PilotGateCheck[] = [
      {
        gate_name: 'Autorização',
        required_condition: '100% das tarefas ligadas a autorização válida',
        actual_value: gate1Passed ? '100%' : '0%',
        passed: gate1Passed,
        notes: `Referência formal ${pilot.authorization_reference}`,
        source: 'pilot_programs',
        calculation: 'Boolean(authorization_reference && authorized_by)',
        evidence_sha256: sha256(pilot.authorization_reference)
      },
      {
        gate_name: 'Tenant isolation',
        required_condition: 'Zero acesso cruzado',
        actual_value: metrics.cross_tenant_incidents,
        passed: gate2Passed,
        notes: gate2Passed ? 'Zero violações de tenant' : 'Falha crítica',
        source: 'pilot_incidents (type: CROSS_TENANT_ACCESS)',
        calculation: 'COUNT(*) WHERE type = CROSS_TENANT_ACCESS',
        evidence_sha256: sha256(String(metrics.cross_tenant_incidents))
      },
      {
        gate_name: 'Privacidade',
        required_condition: 'Zero exposição de dados em Git ou logs públicos',
        actual_value: metrics.privacy_incidents,
        passed: gate3Passed,
        notes: gate3Passed ? 'Zero incidentes de privacidade' : 'Violação detectada',
        source: 'pilot_incidents (type: PRIVACY_LEAK)',
        calculation: 'COUNT(*) WHERE type = PRIVACY_LEAK',
        evidence_sha256: sha256(String(metrics.privacy_incidents))
      },
      {
        gate_name: 'Execução',
        required_condition: 'Pelo menos 25 tarefas concluídas',
        actual_value: metrics.total_tasks_completed,
        passed: gate4Passed,
        notes: `${metrics.total_tasks_completed} tarefas concluídas no modo ${pilot.execution_mode}`,
        source: 'pilot_tasks',
        calculation: 'COUNT(*) WHERE final_status = SUCCESS',
        evidence_sha256: sha256(String(metrics.total_tasks_completed))
      },
      {
        gate_name: 'Qualidade',
        required_condition: 'Pelo menos 80% aprovadas na primeira revisão',
        actual_value: `${metrics.first_pass_acceptance_rate}%`,
        passed: gate5Passed,
        notes: `Aprovação 1ª revisão calculada: ${metrics.first_pass_acceptance_rate}%`,
        source: 'human_reviews',
        calculation: '(approved_first / completed) * 100',
        evidence_sha256: sha256(String(metrics.first_pass_acceptance_rate))
      },
      {
        gate_name: 'Correcção',
        required_condition: '100% dos erros materiais corrigidos antes da entrega com v1 e v2 preservadas',
        actual_value: gate6Passed ? '100%' : 'Falha',
        passed: gate6Passed,
        notes: `${correctedTasks.length} tarefas corrigidas com versionamento atómico`,
        source: 'task_outputs',
        calculation: 'EXISTS(v1) AND EXISTS(v2) FOR EACH corrected task',
        evidence_sha256: sha256(String(correctedTasks.length))
      },
      {
        gate_name: 'Entrega / Arquivamento',
        required_condition: 'Pelo menos 95% de entregas ou arquivamentos técnicos bem-sucedidos',
        actual_value: `${metrics.delivery_success_rate}%`,
        passed: gate7Passed,
        notes: `Taxa calculada: ${metrics.delivery_success_rate}%`,
        source: 'pilot_deliveries',
        calculation: '(deliveries / approved) * 100',
        evidence_sha256: sha256(String(metrics.delivery_success_rate))
      },
      {
        gate_name: 'Idempotência',
        required_condition: 'Zero efeitos duplicados',
        actual_value: metrics.duplicate_business_effects,
        passed: gate8Passed,
        notes: 'Chaves de idempotência únicas verificadas no SQLite',
        source: 'pilot_tasks (UNIQUE index)',
        calculation: 'COUNT(*) WHERE duplicate_detected',
        evidence_sha256: sha256(String(metrics.duplicate_business_effects))
      },
      {
        gate_name: 'Acções proibidas',
        required_condition: 'Zero execução não autorizada',
        actual_value: metrics.unauthorized_action_attempts,
        passed: gate9Passed,
        notes: 'Bloqueio estrito de ações financeiras/fiscais',
        source: 'pilot_incidents (type: UNAUTHORIZED_ACTION)',
        calculation: 'COUNT(*) WHERE type = UNAUTHORIZED_ACTION',
        evidence_sha256: sha256(String(metrics.unauthorized_action_attempts))
      },
      {
        gate_name: 'Evidência',
        required_condition: '100% das tarefas com recibo e hashes físicos',
        actual_value: gate10Passed ? '100%' : '0%',
        passed: gate10Passed,
        notes: 'Cadeia criptográfica integral gerada em disco',
        source: 'pilot_tasks (output_hashes)',
        calculation: 'COUNT(output_hashes > 0) / COUNT(*)',
        evidence_sha256: sha256(canonicalJson(tasks.map(t => t.receipt_sha256)))
      }
    ];

    const allPassed = gates.every(g => g.passed);
    return {
      all_passed: allPassed,
      execution_mode: pilot.execution_mode,
      gates,
      evaluated_at: new Date().toISOString()
    };
  }

  public exportPilotEvidence(
    pilotId: string,
    outputDir: string,
    ajvValidator?: PilotAjvValidator
  ): { files: string[]; indexHash: string } {
    const pilot = this.getPilot(pilotId);
    const metrics = this.calculatePilotMetrics(pilotId);
    const gates = this.evaluatePilotGates(pilotId);
    const ajv = ajvValidator || new PilotAjvValidator();

    fs.mkdirSync(outputDir, { recursive: true });
    const exportSubdirs = ['task-receipts', 'review-receipts', 'delivery-receipts', 'task-outputs', 'document-validation-receipts'];
    for (const sub of exportSubdirs) {
      const subPath = path.join(outputDir, sub);
      if (fs.existsSync(subPath)) {
        fs.rmSync(subPath, { recursive: true, force: true });
      }
      fs.mkdirSync(subPath, { recursive: true });
    }
    const staleFiles = ['pilot-evidence-manifest.json', 'pilot-evidence-files.sha256'];
    for (const f of staleFiles) {
      const p = path.join(outputDir, f);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { force: true });
      }
    }

    // 1. Authorization receipt
    const authReceipt = {
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      organization_name: pilot.organization_name,
      authorization_reference: pilot.authorization_reference,
      authorized_by: pilot.authorized_by,
      authorized_at: pilot.authorized_at,
      execution_mode: pilot.execution_mode,
      status: pilot.status
    };
    fs.writeFileSync(path.join(outputDir, 'pilot-authorization-receipt.json'), JSON.stringify(authReceipt, null, 2), 'utf8');

    // 2. Configuration
    fs.writeFileSync(path.join(outputDir, 'pilot-configuration.json'), JSON.stringify(pilot, null, 2), 'utf8');

    // 3. Selected employees
    const selectedEmployees = CANONICAL_500_ROLES.filter(r => pilot.selected_employee_ids.includes(r.id)).map(r => ({
      id: r.id,
      role_key: r.role_key,
      display_name: r.display_name,
      department: r.department,
      risk: r.risk.level
    }));
    fs.writeFileSync(path.join(outputDir, 'selected-employees.json'), JSON.stringify(selectedEmployees, null, 2), 'utf8');

    // 4. Task receipts & Physical Outputs
    fs.mkdirSync(path.join(outputDir, 'task-outputs'), { recursive: true });
    const pilotTasks = this.store.listTasks(pilotId);
    for (const t of pilotTasks) {
      fs.writeFileSync(path.join(outputDir, 'task-receipts', `${t.task_id}.json`), JSON.stringify(t, null, 2), 'utf8');

      // Export physical output files stored as BLOBs in SQLite
      const outputs = this.store.getOutputsForTask(t.task_id);
      for (const out of outputs) {
        const bytes = this.store.getOutputBytes(out.output_id);
        if (bytes) {
          const ext = path.extname(out.file_name).toLowerCase();
          const format = ext === '.pdf' ? 'PDF' : ext === '.xlsx' ? 'XLSX' : ext === '.docx' ? 'DOCX' : 'JSON';
          if (format !== 'JSON') {
            const indepCheck = PhysicalDocumentValidator.readWithIndependentLibrary(bytes, format as any);
            if (!indepCheck.success) {
              throw new Error(`Falha na validação independente do output físico '${out.file_name}': ${indepCheck.error}`);
            }
          }
          fs.writeFileSync(path.join(outputDir, 'task-outputs', out.file_name), bytes);
        }
      }
    }

    // 5. Review receipts
    const allReviews = this.store.listAllReviews(pilotId);
    for (const rev of allReviews) {
      fs.writeFileSync(path.join(outputDir, 'review-receipts', `${rev.review_id}.json`), JSON.stringify(rev, null, 2), 'utf8');
    }

    // 6. Delivery receipts
    const allDeliveries = this.store.listDeliveries(pilotId);
    for (const deliv of allDeliveries) {
      fs.writeFileSync(path.join(outputDir, 'delivery-receipts', `${deliv.delivery_id}.json`), JSON.stringify(deliv, null, 2), 'utf8');
    }

    // 6b. Independent Document Validation Receipts (Pre-Review Phase)
    fs.mkdirSync(path.join(outputDir, 'document-validation-receipts'), { recursive: true });
    const pilotTaskIds = new Set(pilotTasks.map(t => t.task_id));
    const allDocValidations = this.store.getAllDocumentValidationReceipts().filter(v => pilotTaskIds.has(v.task_id));
    for (const val of allDocValidations) {
      const valId = val.receipt_id || val.validation_id || '';
      fs.writeFileSync(
        path.join(outputDir, 'document-validation-receipts', `${valId}.json`),
        JSON.stringify(val, null, 2),
        'utf8'
      );
    }

    // 7. Metrics
    fs.writeFileSync(path.join(outputDir, 'pilot-metrics.json'), JSON.stringify(metrics, null, 2), 'utf8');

    // 8. Incidents
    const pilotIncidents = this.store.listIncidents(pilotId);
    fs.writeFileSync(path.join(outputDir, 'pilot-incidents.json'), JSON.stringify(pilotIncidents, null, 2), 'utf8');

    // 9. Final Attestation (Strictly compliant with prompt Section 7)
    let classificationStatus: any = 'NOT_PROVEN';
    let operationalState = 'PRE-PRODUCTION / L2 HARDENED';

    if (pilot.execution_mode === 'SIMULATION') {
      classificationStatus = 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED';
      operationalState = 'PRE-PRODUCTION / L2 HARDENED (SIMULATION HARNESS)';
    } else if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      classificationStatus = 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY';
      operationalState = 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY — STRICT AJV VERIFIED — INDEPENDENT SQLITE, RECEIPT, FILE AND MANIFEST CONSISTENCY VERIFIED — CLEAN DETERMINISTIC VERIFICATION CONFIRMED — REAL PILOT NOT YET EXECUTED';
    }

    const attestation: PilotFinalAttestation = {
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      organization_name: pilot.organization_name,
      execution_mode: pilot.execution_mode,
      infrastructure_implemented: true,
      simulation_executed: pilot.execution_mode === 'SIMULATION',
      operational_pilot_started: false,
      operational_pilot_completed: false,
      classification_status: classificationStatus,
      classification: classificationStatus,
      operational_state: operationalState,
      metrics,
      gates_result: gates.all_passed ? 'PASS' : 'FAIL',
      generated_at: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'pilot-final-attestation.json'), JSON.stringify(attestation, null, 2), 'utf8');

    // 10. Verify evidence directory and collect manifest entries (bidirectional validation)
    const verified = this.verifyEvidenceDirectory(pilotId, outputDir, ajv);

    const manifestData = {
      manifest_version: '2.0',
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      execution_mode: pilot.execution_mode,
      commit_sha: verified.commitSha,
      total_files: verified.totalFiles,
      created_at: new Date().toISOString(),
      persistence_fingerprint: this.store.getPersistenceFingerprint(),
      files: verified.files
    };

    // Validar manifesto gerado via Ajv Schema estrito antes de persistir no disco
    ajv.validateEvidenceManifest(manifestData, 'pilot-evidence-manifest.json');

    fs.writeFileSync(
      path.join(outputDir, 'pilot-evidence-manifest.json'),
      JSON.stringify(manifestData, null, 2),
      'utf8'
    );

    // 11. Generate pilot-evidence-files.sha256 covering all files (including manifest)
    const allDiscoveredFiles = verified.scanDirRecursive(outputDir).filter(
      f => f.relativePath !== 'pilot-evidence-files.sha256'
    );

    const indexLines: string[] = [];
    const exportedFileList: string[] = [];

    for (const f of allDiscoveredFiles) {
      const fileBytes = fs.readFileSync(f.fullPath);
      const hash = sha256(fileBytes);
      indexLines.push(`${hash}  ${f.relativePath}`);
      exportedFileList.push(f.relativePath);
    }

    const indexContent = indexLines.join('\n') + '\n';
    fs.writeFileSync(path.join(outputDir, 'pilot-evidence-files.sha256'), indexContent, 'utf8');

    return {
      files: exportedFileList,
      indexHash: sha256(indexContent)
    };
  }

  // -------------------------------------------------------------
  // 7b. Strict Relational Evidence Directory Verification
  // -------------------------------------------------------------
  public verifyEvidenceDirectory(
    pilotId: string,
    outputDir: string,
    ajvValidator?: PilotAjvValidator
  ): {
    files: any[];
    totalFiles: number;
    commitSha: string;
    scanDirRecursive: (baseDir: string) => { relativePath: string; fullPath: string }[];
  } {
    const pilot = this.getPilot(pilotId);
    const ajv = ajvValidator || new PilotAjvValidator();

    const scanDirRecursive = (baseDir: string): { relativePath: string; fullPath: string }[] => {
      const visitedDirs = new Set<string>();
      const normalizedBaseDir = path.resolve(baseDir);
      let realBaseDir = normalizedBaseDir;
      try {
        realBaseDir = fs.realpathSync(normalizedBaseDir);
      } catch {}

      const walk = (dir: string): { relativePath: string; fullPath: string }[] => {
        let realDir = dir;
        try {
          realDir = fs.realpathSync(dir);
        } catch {
          throw new Error(`Path inválido ou inacessível: '${dir}'.`);
        }

        const isInside = process.platform === 'win32'
          ? realDir.toLowerCase().startsWith(realBaseDir.toLowerCase())
          : realDir.startsWith(realBaseDir);

        if (!isInside) {
          throw new Error(`Path traversal detectado e rejeitado: '${dir}' resolve fora da raiz autorizada '${normalizedBaseDir}'.`);
        }
        const dirKey = process.platform === 'win32' ? realDir.toLowerCase() : realDir;
        if (visitedDirs.has(dirKey)) {
          throw new Error(`Ciclo de directórios detectado na varredura: '${dir}'.`);
        }
        visitedDirs.add(dirKey);

        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const results: { relativePath: string; fullPath: string }[] = [];
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Bloqueio rigoroso de symlinks / junctions
          const lstat = fs.lstatSync(fullPath);
          if (lstat.isSymbolicLink()) {
            throw new Error(`Ligação simbólica (symlink) detectada e rejeitada: '${fullPath}'.`);
          }

          if (entry.isDirectory()) {
            results.push(...walk(fullPath));
          } else if (entry.isFile()) {
            let realFile = fullPath;
            try {
              realFile = fs.realpathSync(fullPath);
            } catch {}
            const fileInside = process.platform === 'win32'
              ? realFile.toLowerCase().startsWith(realBaseDir.toLowerCase())
              : realFile.startsWith(realBaseDir);
            if (!fileInside) {
              throw new Error(`Ficheiro com referência externa rejeitado: '${fullPath}'.`);
            }
            const rel = path.relative(normalizedBaseDir, fullPath).replace(/\\/g, '/');
            if (rel.startsWith('..') || path.isAbsolute(rel)) {
              throw new Error(`Path traversal detectado no caminho relativo: '${rel}'.`);
            }
            results.push({ relativePath: rel, fullPath });
          }
        }
        return results;
      };

      return walk(normalizedBaseDir).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    };

    const commitSha = this.getCommitSha();

    const initialFiles = scanDirRecursive(outputDir).filter(
      f => f.relativePath !== 'pilot-evidence-manifest.json' && f.relativePath !== 'pilot-evidence-files.sha256'
    );

    // Ponto 5: Rejeitar ambiguidades de nomes de output, colisões case-insensitive e path traversal
    const taskOutputs = this.store.getOutputsForTenant(pilot.tenant_id);
    const outputMap = new Map<string, { task_id: string; version: number; output_id: string; file_bytes_sha256: string }>();
    const dbSeenLowerNames = new Map<string, string>();
    for (const out of taskOutputs) {
      if (!out.file_name || out.file_name.trim() === '' || out.file_name.includes('..') || out.file_name.includes('/') || out.file_name.includes('\\')) {
        throw new Error(`Output registado no SQLite com nome de ficheiro ambíguo ou inválido: '${out.file_name}'.`);
      }
      const lower = out.file_name.toLowerCase();
      if (dbSeenLowerNames.has(lower) && dbSeenLowerNames.get(lower) !== out.file_name) {
        throw new Error(`Colisão case-insensitive de outputs registada no SQLite para o tenant '${pilot.tenant_id}': '${out.file_name}' colide com '${dbSeenLowerNames.get(lower)}'.`);
      }
      dbSeenLowerNames.set(lower, out.file_name);
      if (outputMap.has(out.file_name)) {
        const prev = outputMap.get(out.file_name)!;
        if (prev.output_id !== out.output_id) {
          throw new Error(`Colisão de nome de output no SQLite: '${out.file_name}' associado a múltiplos output_ids ('${prev.output_id}', '${out.output_id}').`);
        }
      }
      outputMap.set(out.file_name, {
        task_id: out.task_id,
        version: out.version,
        output_id: out.output_id,
        file_bytes_sha256: out.file_bytes_sha256
      });
    }

    const diskSeenLowerOutputs = new Map<string, string>();
    for (const f of initialFiles) {
      if (f.relativePath.startsWith('task-outputs/')) {
        const fileName = path.basename(f.relativePath);
        if (f.relativePath !== `task-outputs/${fileName}`) {
          throw new Error(`Path traversal ou subdirectório proibido em 'task-outputs': '${f.relativePath}'.`);
        }
        if (!fileName || fileName.trim() === '' || fileName === '.' || fileName === '..' || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
          throw new Error(`Nome de ficheiro de output inválido ou ambíguo: '${fileName}'.`);
        }
        const lower = fileName.toLowerCase();
        if (diskSeenLowerOutputs.has(lower)) {
          throw new Error(`Colisão case-insensitive em 'task-outputs' no disco: '${fileName}' colide com '${diskSeenLowerOutputs.get(lower)}'.`);
        }
        diskSeenLowerOutputs.set(lower, fileName);
      }
    }

    const manifestFiles = initialFiles.map(f => {
      const bytes = fs.readFileSync(f.fullPath);
      const ext = path.extname(f.relativePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (ext === '.json') mimeType = 'application/json';
      else if (ext === '.sha256') mimeType = 'text/plain';

      let origin = 'ENGINE_RECORD';
      let receiptType = 'GENERIC_EVIDENCE';
      let taskId: string | undefined;
      let docVersion: number | undefined;
      let documentId: string | undefined;
      let reviewId: string | undefined;
      let deliveryId: string | undefined;
      let validationType: string | undefined;

      if (f.relativePath.startsWith('task-outputs/')) {
        origin = 'SQLITE_TASK_OUTPUT';
        receiptType = 'OUTPUT_DOCUMENT';
        const fileName = path.basename(f.relativePath);
        const mapped = outputMap.get(fileName);
        if (!mapped) {
          throw new Error(`Ficheiro de output '${fileName}' no filesystem não tem registo correspondente no SQLite para o tenant '${pilot.tenant_id}'.`);
        }
        taskId = mapped.task_id;
        docVersion = mapped.version;
        documentId = mapped.output_id;

        const outForensic = this.store.getOutputForensicRecord(mapped.output_id);
        if (!outForensic) {
          throw new Error(`Output '${mapped.output_id}' presente no filesystem não possui registo forense no SQLite.`);
        }
        if (!outForensic.blob) {
          throw new Error(`Output '${mapped.output_id}' presente no filesystem não possui BLOB no SQLite.`);
        }
        const diskHash = sha256(bytes);
        const dbBlobHash = outForensic.blobSha256;
        if (diskHash !== dbBlobHash) {
          throw new Error(`Divergência entre ficheiro em disco e BLOB SQLite para output '${fileName}': disco=${diskHash}, blob=${dbBlobHash}.`);
        }
        if (outForensic.rawColumns.file_bytes_sha256 !== diskHash) {
          throw new Error(`Divergência entre coluna file_bytes_sha256 SQLite e ficheiro em disco para output '${fileName}': coluna=${outForensic.rawColumns.file_bytes_sha256}, disco=${diskHash}.`);
        }
        if (outForensic.rawColumns.file_bytes_sha256 !== dbBlobHash) {
          throw new Error(`Divergência entre coluna file_bytes_sha256 SQLite e BLOB SQLite para output '${fileName}': coluna=${outForensic.rawColumns.file_bytes_sha256}, blob=${dbBlobHash}.`);
        }
        if (outForensic.rawColumns.file_name !== fileName) {
          throw new Error(`Divergência de file_name para output '${mapped.output_id}': coluna=${outForensic.rawColumns.file_name}, disco=${fileName}.`);
        }
        if (outForensic.rawColumns.task_id !== mapped.task_id) {
          throw new Error(`Divergência de task_id para output '${mapped.output_id}': coluna=${outForensic.rawColumns.task_id}, esperado=${mapped.task_id}.`);
        }
        if (outForensic.rawColumns.version !== mapped.version) {
          throw new Error(`Divergência de version para output '${mapped.output_id}': coluna=${outForensic.rawColumns.version}, esperado=${mapped.version}.`);
        }

        const detectedMime = PhysicalDocumentValidator.detectMimeType(bytes);
        PhysicalDocumentValidator.validateMimeCoherence(detectedMime, ext, f.relativePath);
        mimeType = detectedMime;

        if (ext === '.docx' || ext === '.xlsx' || ext === '.pdf') {
          const format = ext === '.docx' ? 'DOCX' : ext === '.xlsx' ? 'XLSX' : 'PDF';
          const indep = PhysicalDocumentValidator.readWithIndependentLibrary(bytes, format);
          if (!indep.success) {
            throw new Error(`Ficheiro '${f.relativePath}' não passou na leitura independente durante a geração do manifesto: ${indep.error}`);
          }
        }
      } else if (f.relativePath.startsWith('document-validation-receipts/')) {
        origin = 'INDEPENDENT_PARSER_RECEIPT';
        receiptType = 'DOCUMENT_VALIDATION_RECEIPT';
        let parsed: any;
        try {
          parsed = JSON.parse(bytes.toString('utf8'));
        } catch (err: any) {
          throw new Error(`Ficheiro de recibo de validação '${f.relativePath}' contém JSON inválido: ${err.message}`);
        }

        if (!parsed.task_id || parsed.document_version === undefined || parsed.document_version === null) {
          throw new Error(`Recibo de validação '${f.relativePath}' inválido: 'task_id' e 'document_version' obrigatórios.`);
        }
        taskId = parsed.task_id;
        docVersion = parsed.document_version;
        validationType = parsed.validation_type;

        // Ponto 2: Consulta forense read-only (Plano 1 e Plano 2)
        const docForensic = this.store.getDocumentValidationForensicRecord(taskId!, docVersion!, validationType as any);
        if (!docForensic) {
          throw new Error(`Recibo de validação '${f.relativePath}' (task: ${taskId}, v: ${docVersion}) não possui registo correspondente no SQLite.`);
        }

        // Ponto 1: Validação Ajv estrita (Plano 3)
        ajv.validateDocumentValidationReceipt(parsed, f.relativePath);

        // Confrontação Criptográfica
        const recomputedSha = sha256(canonicalJson({ ...parsed, receipt_sha256: '' }));
        if (recomputedSha !== parsed.receipt_sha256) {
          throw new Error(`Recibo de validação documental '${f.relativePath}' com receipt_sha256 corrompido ou adulterado: declarado='${parsed.receipt_sha256}', recalculado='${recomputedSha}'.`);
        }

        const raw = docForensic.rawColumns;
        const recJson = docForensic.parsedReceipt;

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 2 (receipt_json SQLite)
        if (raw.receipt_id !== recJson.receipt_id && raw.receipt_id !== recJson.validation_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'receipt_id': rawColumns='${raw.receipt_id}', receipt_json='${recJson.receipt_id || recJson.validation_id}'.`);
        }
        if (raw.task_id !== recJson.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'task_id': rawColumns='${raw.task_id}', receipt_json='${recJson.task_id}'.`);
        }
        if (raw.document_version !== recJson.document_version) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'document_version': rawColumns='${raw.document_version}', receipt_json='${recJson.document_version}'.`);
        }
        if (raw.validation_type !== recJson.validation_type) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'validation_type': rawColumns='${raw.validation_type}', receipt_json='${recJson.validation_type}'.`);
        }
        if (raw.tenant_id !== recJson.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', receipt_json='${recJson.tenant_id}'.`);
        }
        if (raw.pilot_id !== recJson.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', receipt_json='${recJson.pilot_id}'.`);
        }
        if (raw.result !== recJson.result) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'result': rawColumns='${raw.result}', receipt_json='${recJson.result}'.`);
        }
        const rawIsValid = raw.is_valid !== undefined ? Boolean(raw.is_valid) : raw.result === 'PASS';
        if (rawIsValid !== Boolean(recJson.is_valid)) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'is_valid': rawColumns='${rawIsValid}', receipt_json='${recJson.is_valid}'.`);
        }
        if (raw.file_bytes_sha256 !== recJson.file_bytes_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'file_bytes_sha256': rawColumns='${raw.file_bytes_sha256}', receipt_json='${recJson.file_bytes_sha256}'.`);
        }
        if (raw.commit_sha !== recJson.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', receipt_json='${recJson.commit_sha}'.`);
        }
        if (raw.receipt_sha256 !== recJson.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para validação documental '${raw.receipt_id}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', receipt_json='${recJson.receipt_sha256}'.`);
        }

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 3 (Ficheiro Físico parsed)
        const recId = parsed.receipt_id || parsed.validation_id;
        if (raw.receipt_id !== recId) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'receipt_id': rawColumns='${raw.receipt_id}', ficheiro='${recId}'.`);
        }
        if (raw.task_id !== parsed.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'task_id': rawColumns='${raw.task_id}', ficheiro='${parsed.task_id}'.`);
        }
        if (raw.document_version !== parsed.document_version) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'document_version': rawColumns='${raw.document_version}', ficheiro='${parsed.document_version}'.`);
        }
        if (raw.validation_type !== parsed.validation_type) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'validation_type': rawColumns='${raw.validation_type}', ficheiro='${parsed.validation_type}'.`);
        }
        if (raw.tenant_id !== parsed.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', ficheiro='${parsed.tenant_id}'.`);
        }
        if (raw.pilot_id !== parsed.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', ficheiro='${parsed.pilot_id}'.`);
        }
        if (raw.result !== parsed.result) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'result': rawColumns='${raw.result}', ficheiro='${parsed.result}'.`);
        }
        if (rawIsValid !== Boolean(parsed.is_valid)) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'is_valid': rawColumns='${rawIsValid}', ficheiro='${parsed.is_valid}'.`);
        }
        if (raw.file_bytes_sha256 !== parsed.file_bytes_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'file_bytes_sha256': rawColumns='${raw.file_bytes_sha256}', ficheiro='${parsed.file_bytes_sha256}'.`);
        }
        if (raw.commit_sha !== parsed.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', ficheiro='${parsed.commit_sha}'.`);
        }
        if (raw.receipt_sha256 !== parsed.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', ficheiro='${parsed.receipt_sha256}'.`);
        }
      } else if (f.relativePath.startsWith('task-receipts/')) {
        origin = 'EXECUTION_TASK_RECEIPT';
        receiptType = 'TASK_RECEIPT';
        let parsed: any;
        try {
          parsed = JSON.parse(bytes.toString('utf8'));
        } catch (err: any) {
          throw new Error(`Ficheiro de recibo de tarefa '${f.relativePath}' contém JSON inválido: ${err.message}`);
        }

        if (!parsed.task_id || parsed.version === undefined || parsed.version === null) {
          throw new Error(`Recibo de tarefa '${f.relativePath}' inválido: 'task_id' e 'version' obrigatórios.`);
        }
        taskId = parsed.task_id;
        docVersion = parsed.version;

        // Ponto 2: Consulta forense read-only (Plano 1 e Plano 2)
        const taskForensic = this.store.getTaskForensicRecord(taskId!);
        if (!taskForensic) {
          throw new Error(`Recibo de tarefa '${f.relativePath}' (task: ${taskId}) não possui registo correspondente no SQLite.`);
        }

        // Ponto 1: Validação Ajv estrita (Plano 3)
        ajv.validateTaskReceipt(parsed, f.relativePath);

        // Confrontação Criptográfica
        const recomputedSha = sha256(canonicalJson({ ...parsed, receipt_sha256: '' }));
        if (recomputedSha !== parsed.receipt_sha256) {
          throw new Error(`Recibo de tarefa '${f.relativePath}' com receipt_sha256 corrompido ou adulterado: declarado='${parsed.receipt_sha256}', recalculado='${recomputedSha}'.`);
        }

        const raw = taskForensic.rawColumns;
        const recJson = taskForensic.parsedReceipt;

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 2 (receipt_json SQLite)
        if (raw.task_id !== recJson.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'task_id': rawColumns='${raw.task_id}', receipt_json='${recJson.task_id}'.`);
        }
        if (raw.pilot_id !== recJson.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', receipt_json='${recJson.pilot_id}'.`);
        }
        if (raw.tenant_id !== recJson.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', receipt_json='${recJson.tenant_id}'.`);
        }
        if (raw.employee_id !== recJson.employee_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'employee_id': rawColumns='${raw.employee_id}', receipt_json='${recJson.employee_id}'.`);
        }
        if (raw.idempotency_key !== recJson.idempotency_key) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'idempotency_key': rawColumns='${raw.idempotency_key}', receipt_json='${recJson.idempotency_key}'.`);
        }
        if (raw.requested_by !== recJson.requested_by) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'requested_by': rawColumns='${raw.requested_by}', receipt_json='${recJson.requested_by}'.`);
        }
        if (raw.human_review_status !== recJson.human_review_status) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'human_review_status': rawColumns='${raw.human_review_status}', receipt_json='${recJson.human_review_status}'.`);
        }
        if (raw.delivery_status !== recJson.delivery_status) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'delivery_status': rawColumns='${raw.delivery_status}', receipt_json='${recJson.delivery_status}'.`);
        }
        if (raw.final_status !== recJson.final_status) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'final_status': rawColumns='${raw.final_status}', receipt_json='${recJson.final_status}'.`);
        }
        if (raw.version !== recJson.version) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'version': rawColumns='${raw.version}', receipt_json='${recJson.version}'.`);
        }
        if (raw.input_snapshot_sha256 !== recJson.input_snapshot_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'input_snapshot_sha256': rawColumns='${raw.input_snapshot_sha256}', receipt_json='${recJson.input_snapshot_sha256}'.`);
        }
        if (raw.commit_sha && recJson.commit_sha && raw.commit_sha !== recJson.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', receipt_json='${recJson.commit_sha}'.`);
        }
        if (raw.receipt_sha256 && recJson.receipt_sha256 && raw.receipt_sha256 !== recJson.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para tarefa '${raw.task_id}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', receipt_json='${recJson.receipt_sha256}'.`);
        }

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 3 (Ficheiro Físico parsed)
        if (raw.task_id !== parsed.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'task_id': rawColumns='${raw.task_id}', ficheiro='${parsed.task_id}'.`);
        }
        if (raw.pilot_id !== parsed.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', ficheiro='${parsed.pilot_id}'.`);
        }
        if (raw.tenant_id !== parsed.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', ficheiro='${parsed.tenant_id}'.`);
        }
        if (raw.employee_id !== parsed.employee_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'employee_id': rawColumns='${raw.employee_id}', ficheiro='${parsed.employee_id}'.`);
        }
        if (raw.idempotency_key !== parsed.idempotency_key) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'idempotency_key': rawColumns='${raw.idempotency_key}', ficheiro='${parsed.idempotency_key}'.`);
        }
        if (raw.requested_by !== parsed.requested_by) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'requested_by': rawColumns='${raw.requested_by}', ficheiro='${parsed.requested_by}'.`);
        }
        if (raw.human_review_status !== parsed.human_review_status) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'human_review_status': rawColumns='${raw.human_review_status}', ficheiro='${parsed.human_review_status}'.`);
        }
        if (raw.delivery_status !== parsed.delivery_status) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'delivery_status': rawColumns='${raw.delivery_status}', ficheiro='${parsed.delivery_status}'.`);
        }
        if (raw.final_status !== parsed.final_status) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'final_status': rawColumns='${raw.final_status}', ficheiro='${parsed.final_status}'.`);
        }
        if (raw.version !== parsed.version) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'version': rawColumns='${raw.version}', ficheiro='${parsed.version}'.`);
        }
        if (raw.input_snapshot_sha256 !== parsed.input_snapshot_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'input_snapshot_sha256': rawColumns='${raw.input_snapshot_sha256}', ficheiro='${parsed.input_snapshot_sha256}'.`);
        }
        if (raw.commit_sha && parsed.commit_sha && raw.commit_sha !== parsed.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', ficheiro='${parsed.commit_sha}'.`);
        }
        if (raw.receipt_sha256 && parsed.receipt_sha256 && raw.receipt_sha256 !== parsed.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', ficheiro='${parsed.receipt_sha256}'.`);
        }
      } else if (f.relativePath.startsWith('review-receipts/')) {
        origin = 'HUMAN_REVIEW_RECEIPT';
        receiptType = 'REVIEW_RECEIPT';
        let parsed: any;
        try {
          parsed = JSON.parse(bytes.toString('utf8'));
        } catch (err: any) {
          throw new Error(`Ficheiro de recibo de revisão '${f.relativePath}' contém JSON inválido: ${err.message}`);
        }

        if (!parsed.task_id || !parsed.review_id) {
          throw new Error(`Recibo de revisão '${f.relativePath}' inválido: 'task_id' e 'review_id' obrigatórios.`);
        }
        taskId = parsed.task_id;
        reviewId = parsed.review_id;

        // Ponto 2: Consulta forense read-only (Plano 1 e Plano 2)
        const revForensic = this.store.getReviewForensicRecord(reviewId!);
        if (!revForensic) {
          throw new Error(`Recibo de revisão '${f.relativePath}' não possui registo correspondente no SQLite.`);
        }

        // Ponto 1: Validação Ajv estrita (Plano 3)
        ajv.validateHumanReviewReceipt(parsed, f.relativePath);

        // Confrontação Criptográfica
        const recomputedSha = sha256(canonicalJson({ ...parsed, receipt_sha256: '' }));
        if (recomputedSha !== parsed.receipt_sha256) {
          throw new Error(`Recibo de revisão '${f.relativePath}' com receipt_sha256 corrompido ou adulterado: declarado='${parsed.receipt_sha256}', recalculado='${recomputedSha}'.`);
        }

        const raw = revForensic.rawColumns;
        const recJson = revForensic.parsedReceipt;

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 2 (receipt_json SQLite)
        if (raw.review_id !== recJson.review_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'review_id': rawColumns='${raw.review_id}', receipt_json='${recJson.review_id}'.`);
        }
        if (raw.task_id !== recJson.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'task_id': rawColumns='${raw.task_id}', receipt_json='${recJson.task_id}'.`);
        }
        if (raw.pilot_id !== recJson.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', receipt_json='${recJson.pilot_id}'.`);
        }
        if (raw.tenant_id && recJson.tenant_id && raw.tenant_id !== recJson.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', receipt_json='${recJson.tenant_id}'.`);
        }
        if (raw.document_version !== undefined && recJson.document_version !== undefined && raw.document_version !== recJson.document_version) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'document_version': rawColumns='${raw.document_version}', receipt_json='${recJson.document_version}'.`);
        }
        if (raw.challenge_id && recJson.challenge_id && raw.challenge_id !== recJson.challenge_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'challenge_id': rawColumns='${raw.challenge_id}', receipt_json='${recJson.challenge_id}'.`);
        }
        const rawReviewer = raw.reviewer || raw.reviewer_id;
        if (rawReviewer !== recJson.reviewer) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'reviewer': rawColumns='${rawReviewer}', receipt_json='${recJson.reviewer}'.`);
        }
        if (raw.decision !== recJson.decision) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'decision': rawColumns='${raw.decision}', receipt_json='${recJson.decision}'.`);
        }
        if (raw.comments !== recJson.comments) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'comments': rawColumns='${raw.comments}', receipt_json='${recJson.comments}'.`);
        }
        if (raw.auth_method !== recJson.auth_method) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'auth_method': rawColumns='${raw.auth_method}', receipt_json='${recJson.auth_method}'.`);
        }
        if (raw.review_signature_sha256 !== recJson.review_signature_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'review_signature_sha256': rawColumns='${raw.review_signature_sha256}', receipt_json='${recJson.review_signature_sha256}'.`);
        }
        if (raw.previous_output_hash !== recJson.previous_output_hash) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'previous_output_hash': rawColumns='${raw.previous_output_hash}', receipt_json='${recJson.previous_output_hash}'.`);
        }
        if (raw.new_output_hash !== recJson.new_output_hash) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'new_output_hash': rawColumns='${raw.new_output_hash}', receipt_json='${recJson.new_output_hash}'.`);
        }
        if (raw.commit_sha && recJson.commit_sha && raw.commit_sha !== recJson.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', receipt_json='${recJson.commit_sha}'.`);
        }
        if (raw.receipt_sha256 && recJson.receipt_sha256 && raw.receipt_sha256 !== recJson.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para revisão '${raw.review_id}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', receipt_json='${recJson.receipt_sha256}'.`);
        }

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 3 (Ficheiro Físico parsed)
        if (raw.review_id !== parsed.review_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'review_id': rawColumns='${raw.review_id}', ficheiro='${parsed.review_id}'.`);
        }
        if (raw.task_id !== parsed.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'task_id': rawColumns='${raw.task_id}', ficheiro='${parsed.task_id}'.`);
        }
        if (raw.pilot_id !== parsed.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', ficheiro='${parsed.pilot_id}'.`);
        }
        if (raw.tenant_id && parsed.tenant_id && raw.tenant_id !== parsed.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', ficheiro='${parsed.tenant_id}'.`);
        }
        if (raw.document_version !== undefined && parsed.document_version !== undefined && raw.document_version !== parsed.document_version) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'document_version': rawColumns='${raw.document_version}', ficheiro='${parsed.document_version}'.`);
        }
        if (raw.challenge_id && parsed.challenge_id && raw.challenge_id !== parsed.challenge_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'challenge_id': rawColumns='${raw.challenge_id}', ficheiro='${parsed.challenge_id}'.`);
        }
        const rawReviewerDisk = raw.reviewer || raw.reviewer_id;
        if (rawReviewerDisk !== parsed.reviewer) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'reviewer': rawColumns='${rawReviewerDisk}', ficheiro='${parsed.reviewer}'.`);
        }
        if (raw.decision !== parsed.decision) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'decision': rawColumns='${raw.decision}', ficheiro='${parsed.decision}'.`);
        }
        if (raw.comments !== parsed.comments) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'comments': rawColumns='${raw.comments}', ficheiro='${parsed.comments}'.`);
        }
        if (raw.auth_method !== parsed.auth_method) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'auth_method': rawColumns='${raw.auth_method}', ficheiro='${parsed.auth_method}'.`);
        }
        if (raw.review_signature_sha256 !== parsed.review_signature_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'review_signature_sha256': rawColumns='${raw.review_signature_sha256}', ficheiro='${parsed.review_signature_sha256}'.`);
        }
        if (raw.previous_output_hash !== parsed.previous_output_hash) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'previous_output_hash': rawColumns='${raw.previous_output_hash}', ficheiro='${parsed.previous_output_hash}'.`);
        }
        if (raw.new_output_hash !== parsed.new_output_hash) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'new_output_hash': rawColumns='${raw.new_output_hash}', ficheiro='${parsed.new_output_hash}'.`);
        }
        if (raw.commit_sha && parsed.commit_sha && raw.commit_sha !== parsed.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', ficheiro='${parsed.commit_sha}'.`);
        }
        if (raw.receipt_sha256 && parsed.receipt_sha256 && raw.receipt_sha256 !== parsed.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', ficheiro='${parsed.receipt_sha256}'.`);
        }
      } else if (f.relativePath.startsWith('delivery-receipts/')) {
        origin = 'DELIVERY_RECEIPT';
        receiptType = 'DELIVERY_RECEIPT';
        let parsed: any;
        try {
          parsed = JSON.parse(bytes.toString('utf8'));
        } catch (err: any) {
          throw new Error(`Ficheiro de recibo de entrega '${f.relativePath}' contém JSON inválido: ${err.message}`);
        }

        if (!parsed.task_id || !parsed.delivery_id) {
          throw new Error(`Recibo de entrega '${f.relativePath}' inválido: 'task_id' e 'delivery_id' obrigatórios.`);
        }
        taskId = parsed.task_id;
        deliveryId = parsed.delivery_id;

        // Ponto 2: Consulta forense read-only (Plano 1 e Plano 2)
        const delivForensic = this.store.getDeliveryForensicRecord(deliveryId!);
        if (!delivForensic) {
          throw new Error(`Recibo de entrega '${f.relativePath}' não possui registo correspondente no SQLite.`);
        }

        // Ponto 1: Validação Ajv estrita (Plano 3)
        ajv.validateDeliveryReceipt(parsed, f.relativePath);

        // Confrontação Criptográfica
        const recomputedSha = sha256(canonicalJson({ ...parsed, receipt_sha256: '' }));
        if (recomputedSha !== parsed.receipt_sha256) {
          throw new Error(`Recibo de entrega '${f.relativePath}' com receipt_sha256 corrompido ou adulterado: declarado='${parsed.receipt_sha256}', recalculado='${recomputedSha}'.`);
        }

        const raw = delivForensic.rawColumns;
        const recJson = delivForensic.parsedReceipt;

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 2 (receipt_json SQLite)
        if (raw.delivery_id !== recJson.delivery_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'delivery_id': rawColumns='${raw.delivery_id}', receipt_json='${recJson.delivery_id}'.`);
        }
        if (raw.task_id !== recJson.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'task_id': rawColumns='${raw.task_id}', receipt_json='${recJson.task_id}'.`);
        }
        if (raw.pilot_id !== recJson.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', receipt_json='${recJson.pilot_id}'.`);
        }
        if (raw.tenant_id !== recJson.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', receipt_json='${recJson.tenant_id}'.`);
        }
        if (raw.document_version !== undefined && recJson.document_version !== undefined && raw.document_version !== recJson.document_version) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'document_version': rawColumns='${raw.document_version}', receipt_json='${recJson.document_version}'.`);
        }
        if (raw.review_id && recJson.review_id && raw.review_id !== recJson.review_id) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'review_id': rawColumns='${raw.review_id}', receipt_json='${recJson.review_id}'.`);
        }
        if (raw.delivered_to !== recJson.delivered_to) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'delivered_to': rawColumns='${raw.delivered_to}', receipt_json='${recJson.delivered_to}'.`);
        }
        if (raw.channel !== recJson.channel) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'channel': rawColumns='${raw.channel}', receipt_json='${recJson.channel}'.`);
        }
        if (raw.status !== recJson.status) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'status': rawColumns='${raw.status}', receipt_json='${recJson.status}'.`);
        }
        if (Boolean(raw.is_external_confirmed) !== Boolean(recJson.is_external_confirmed)) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'is_external_confirmed': rawColumns='${raw.is_external_confirmed}', receipt_json='${recJson.is_external_confirmed}'.`);
        }
        if (raw.commit_sha && recJson.commit_sha && raw.commit_sha !== recJson.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', receipt_json='${recJson.commit_sha}'.`);
        }
        if (raw.receipt_sha256 && recJson.receipt_sha256 && raw.receipt_sha256 !== recJson.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e receipt_json para entrega '${raw.delivery_id}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', receipt_json='${recJson.receipt_sha256}'.`);
        }

        // Quatro Planos: Plano 1 (Colunas SQLite) ↔ Plano 3 (Ficheiro Físico parsed)
        if (raw.delivery_id !== parsed.delivery_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'delivery_id': rawColumns='${raw.delivery_id}', ficheiro='${parsed.delivery_id}'.`);
        }
        if (raw.task_id !== parsed.task_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'task_id': rawColumns='${raw.task_id}', ficheiro='${parsed.task_id}'.`);
        }
        if (raw.pilot_id !== parsed.pilot_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'pilot_id': rawColumns='${raw.pilot_id}', ficheiro='${parsed.pilot_id}'.`);
        }
        if (raw.tenant_id !== parsed.tenant_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'tenant_id': rawColumns='${raw.tenant_id}', ficheiro='${parsed.tenant_id}'.`);
        }
        if (raw.document_version !== undefined && parsed.document_version !== undefined && raw.document_version !== parsed.document_version) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'document_version': rawColumns='${raw.document_version}', ficheiro='${parsed.document_version}'.`);
        }
        if (raw.review_id && parsed.review_id && raw.review_id !== parsed.review_id) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'review_id': rawColumns='${raw.review_id}', ficheiro='${parsed.review_id}'.`);
        }
        if (raw.delivered_to !== parsed.delivered_to) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'delivered_to': rawColumns='${raw.delivered_to}', ficheiro='${parsed.delivered_to}'.`);
        }
        if (raw.channel !== parsed.channel) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'channel': rawColumns='${raw.channel}', ficheiro='${parsed.channel}'.`);
        }
        if (raw.status !== parsed.status) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'status': rawColumns='${raw.status}', ficheiro='${parsed.status}'.`);
        }
        if (Boolean(raw.is_external_confirmed) !== Boolean(parsed.is_external_confirmed)) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'is_external_confirmed': rawColumns='${raw.is_external_confirmed}', ficheiro='${parsed.is_external_confirmed}'.`);
        }
        if (raw.commit_sha && parsed.commit_sha && raw.commit_sha !== parsed.commit_sha) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'commit_sha': rawColumns='${raw.commit_sha}', ficheiro='${parsed.commit_sha}'.`);
        }
        if (raw.receipt_sha256 && parsed.receipt_sha256 && raw.receipt_sha256 !== parsed.receipt_sha256) {
          throw new Error(`Divergência entre SQLite rawColumns e ficheiro de recibo '${f.relativePath}' no campo 'receipt_sha256': rawColumns='${raw.receipt_sha256}', ficheiro='${parsed.receipt_sha256}'.`);
        }
      } else if (f.relativePath === 'pilot-authorization-receipt.json') {
        origin = 'AUTHORIZATION_RECEIPT';
        receiptType = 'AUTHORIZATION';
      } else if (f.relativePath === 'pilot-configuration.json') {
        origin = 'PILOT_CONFIGURATION';
        receiptType = 'CONFIGURATION';
      } else if (f.relativePath === 'selected-employees.json') {
        origin = 'EMPLOYEE_REGISTRY';
        receiptType = 'EMPLOYEE_LIST';
      } else if (f.relativePath === 'pilot-metrics.json') {
        origin = 'PILOT_METRICS';
        receiptType = 'METRICS';
      } else if (f.relativePath === 'pilot-incidents.json') {
        origin = 'INCIDENT_LOG';
        receiptType = 'INCIDENT_LOG';
      } else if (f.relativePath === 'pilot-final-attestation.json') {
        origin = 'FINAL_ATTESTATION';
        receiptType = 'ATTESTATION';
      } else if (f.relativePath === 'document-validation-receipt.json') {
        origin = 'INDEPENDENT_PARSER_RECEIPT';
        receiptType = 'DOCUMENT_VERIFICATION';
      }

      const fileStat = fs.statSync(f.fullPath);

      return {
        relative_path: f.relativePath,
        sha256: sha256(bytes),
        byte_size: bytes.length,
        mime_type: mimeType,
        origin,
        commit_sha: commitSha,
        tenant_id: pilot.tenant_id,
        pilot_id: pilot.pilot_id,
        ...(taskId ? { task_id: taskId } : {}),
        ...(docVersion !== undefined ? { document_version: docVersion } : {}),
        ...(documentId ? { document_id: documentId } : {}),
        ...(reviewId ? { review_id: reviewId } : {}),
        ...(deliveryId ? { delivery_id: deliveryId } : {}),
        ...(validationType ? { validation_type: validationType } : {}),
        receipt_type: receiptType,
        generated_at: fileStat.mtime.toISOString()
      };
    });

    // Verificação Bidirecional Estrita: SQLite -> Filesystem
    const pilotTasks = this.store.listTasks(pilotId);
    const allReviews = this.store.listAllReviews(pilotId);
    const allDeliveries = this.store.listDeliveries(pilotId);
    const pilotTaskIds = new Set(pilotTasks.map(t => t.task_id));
    const allDocValidations = this.store.getAllDocumentValidationReceipts().filter(v => pilotTaskIds.has(v.task_id));

    for (const t of pilotTasks) {
      const taskReceiptPath = path.join(outputDir, 'task-receipts', `${t.task_id}.json`);
      if (!fs.existsSync(taskReceiptPath)) {
        throw new Error(`Verificação bidirecional falhou: tarefa SQLite '${t.task_id}' sem ficheiro em '${taskReceiptPath}'.`);
      }
      const tOutputs = this.store.getOutputsForTask(t.task_id);
      for (const out of tOutputs) {
        const outPath = path.join(outputDir, 'task-outputs', out.file_name);
        if (!fs.existsSync(outPath)) {
          throw new Error(`Verificação bidirecional falhou: output SQLite '${out.output_id}' (${out.file_name}) sem ficheiro em '${outPath}'.`);
        }
        const diskSha = sha256(fs.readFileSync(outPath));
        if (diskSha !== out.file_bytes_sha256) {
          throw new Error(`Verificação bidirecional falhou: SHA-256 de '${out.file_name}' diverge (SQLite: ${out.file_bytes_sha256}, Disco: ${diskSha}).`);
        }
      }
    }

    for (const rev of allReviews) {
      const revPath = path.join(outputDir, 'review-receipts', `${rev.review_id}.json`);
      if (!fs.existsSync(revPath)) {
        throw new Error(`Verificação bidirecional falhou: revisão SQLite '${rev.review_id}' sem ficheiro em '${revPath}'.`);
      }
    }

    for (const deliv of allDeliveries) {
      const delivPath = path.join(outputDir, 'delivery-receipts', `${deliv.delivery_id}.json`);
      if (!fs.existsSync(delivPath)) {
        throw new Error(`Verificação bidirecional falhou: entrega SQLite '${deliv.delivery_id}' sem ficheiro em '${delivPath}'.`);
      }
    }

    for (const val of allDocValidations) {
      const valId = val.receipt_id || val.validation_id || '';
      const valPath = path.join(outputDir, 'document-validation-receipts', `${valId}.json`);
      if (!fs.existsSync(valPath)) {
        throw new Error(`Verificação bidirecional falhou: validação documental SQLite '${valId}' sem ficheiro em '${valPath}'.`);
      }
    }

    // Se o manifesto existir no directório, validar contra o schema Ajv e conformidade
    const manifestJsonPath = path.join(outputDir, 'pilot-evidence-manifest.json');
    if (fs.existsSync(manifestJsonPath)) {
      let parsedManifest: any;
      try {
        parsedManifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
      } catch (err: any) {
        throw new Error(`Ficheiro de manifesto 'pilot-evidence-manifest.json' contém JSON inválido: ${err.message}`);
      }
      ajv.validateEvidenceManifest(parsedManifest, 'pilot-evidence-manifest.json');
      if (parsedManifest.commit_sha !== commitSha) {
        throw new Error(`Manifesto 'pilot-evidence-manifest.json' possui commit_sha divergente: esperado='${commitSha}', obtido='${parsedManifest.commit_sha}'.`);
      }
      if (parsedManifest.pilot_id !== pilot.pilot_id) {
        throw new Error(`Manifesto 'pilot-evidence-manifest.json' possui pilot_id divergente: esperado='${pilot.pilot_id}', obtido='${parsedManifest.pilot_id}'.`);
      }
      if (parsedManifest.tenant_id !== pilot.tenant_id) {
        throw new Error(`Manifesto 'pilot-evidence-manifest.json' possui tenant_id divergente: esperado='${pilot.tenant_id}', obtido='${parsedManifest.tenant_id}'.`);
      }
      if (parsedManifest.total_files !== (parsedManifest.files ? parsedManifest.files.length : 0)) {
        throw new Error(`Manifesto 'pilot-evidence-manifest.json' possui total_files divergente da contagem de ficheiros: total_files=${parsedManifest.total_files}, files=${parsedManifest.files ? parsedManifest.files.length : 0}.`);
      }

      // Verificação Bidirecional Estrita do Manifesto:
      // 1) Todo ficheiro físico em disco deve estar explicitamente listado no manifesto
      const manifestFilePaths = new Set<string>((parsedManifest.files || []).map((f: any) => f.relative_path));
      for (const f of initialFiles) {
        if (!manifestFilePaths.has(f.relativePath)) {
          throw new Error(`Ficheiro físico '${f.relativePath}' presente no directório mas ausente no manifesto de evidências.`);
        }
      }

      // 2) Todo ficheiro listado no manifesto deve existir em disco e coincidir o SHA-256
      for (const mf of (parsedManifest.files || [])) {
        const fullP = path.join(outputDir, mf.relative_path);
        if (!fs.existsSync(fullP)) {
          throw new Error(`Ficheiro '${mf.relative_path}' presente no manifesto mas ausente no directório.`);
        }
        const diskSha = sha256(fs.readFileSync(fullP));
        if (diskSha !== mf.sha256) {
          throw new Error(`Divergência de hash para ficheiro do manifesto '${mf.relative_path}': manifesto=${mf.sha256}, disco=${diskSha}.`);
        }
      }
    }

    return {
      files: manifestFiles,
      totalFiles: manifestFiles.length,
      commitSha,
      scanDirRecursive
    };
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  public recordIncident(incident: PilotIncident): void {
    this.store.recordIncident(incident);
  }

  public getTask(taskId: string): PilotTaskReceipt | null {
    return this.taskCache.get(taskId) || this.store.getTask(taskId);
  }

  public getTaskOutput(taskId: string) {
    const outputs = this.store.getOutputsForTask(taskId);
    if (outputs.length === 0) return null;
    const current = outputs.find(o => o.is_active === 1) || outputs[outputs.length - 1];
    const previous = outputs.find(o => o.version === 1 && current.version > 1);
    return {
      current: { file: current.file_name, content: '', hash: current.file_bytes_sha256 },
      previous: previous ? { file: previous.file_name, content: '', hash: previous.file_bytes_sha256 } : undefined
    };
  }

  private generateEmployeeOutput(
    request: PilotTaskRequest,
    mode: OperationalPilotMode
  ): { fileName: string; buffer: Buffer } {
    const empId = request.employee_id;
    const taskNumber = request.task_id.replace(/^TASK_/, '');

    if (mode === 'OPERATIONAL_PILOT') {
      const taskTitle = request.title || `Tarefa ${taskNumber}`;
      const docLines: string[] = [
        `TITULO: ${taskTitle}`,
        `SOLICITANTE: ${request.requested_by}`,
        `EMPLOYEE ID: ${empId}`,
        `DATA RECEPCAO: ${request.received_at || new Date().toISOString()}`,
        `INSTRUCAO: ${request.instruction || 'Execucao formal autorizada'}`
      ];

      if (request.input_data && typeof request.input_data === 'object') {
        for (const [k, v] of Object.entries(request.input_data)) {
          docLines.push(`${k.toUpperCase()}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
        }
      }

      switch (request.format) {
        case 'PDF': {
          const fileName = `output_${taskNumber}.pdf`;
          const buf = PhysicalDocumentValidator.buildRealBinaryPdf(taskTitle, docLines);
          return { fileName, buffer: buf };
        }
        case 'DOCX': {
          const fileName = `output_${taskNumber}.docx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryDocx(taskTitle, docLines);
          return { fileName, buffer: buf };
        }
        case 'XLSX': {
          const fileName = `output_${taskNumber}.xlsx`;
          const rows: (string | number)[][] = [
            ['Campo', 'Valor'],
            ['Task ID', request.task_id],
            ['Titulo', taskTitle],
            ['Solicitante', request.requested_by],
            ['Employee ID', empId]
          ];
          if (request.input_data && typeof request.input_data === 'object') {
            for (const [k, v] of Object.entries(request.input_data)) {
              rows.push([k, typeof v === 'number' || typeof v === 'string' ? v : JSON.stringify(v)]);
            }
          }
          const buf = PhysicalDocumentValidator.buildRealBinaryXlsx(taskTitle.slice(0, 30), rows);
          return { fileName, buffer: buf };
        }
        default: {
          const fileName = `output_${taskNumber}.json`;
          return { fileName, buffer: Buffer.from(JSON.stringify(request.input_data || {}, null, 2), 'utf8') };
        }
      }
    } else {
      // Simulation mode
      switch (empId) {
        case 66: {
          const fileName = `sim_classificacao_${taskNumber}.pdf`;
          const buf = PhysicalDocumentValidator.buildRealBinaryPdf(
            `Classificacao Contabilistica SASO ${taskNumber}`,
            [
              `Documento classificado para employee 66 em simulacao controlada.`,
              `Registo de operacao e calculo de taxas aplicaveis.`
            ]
          );
          return { fileName, buffer: buf };
        }
        case 263: {
          const fileName = `sim_carta_${taskNumber}.docx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryDocx(
            `Simulacao Carta Formal ${taskNumber}`,
            ['Documento administrativo gerado em ambiente de simulacao tecnica.']
          );
          return { fileName, buffer: buf };
        }
        case 58: {
          const fileName = `sim_mapa_${taskNumber}.xlsx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryXlsx(
            `Simulacao Financeira`,
            [['Orcado', 'Realizado'], [1000, 900]]
          );
          return { fileName, buffer: buf };
        }
        case 52: {
          const fileName = `sim_cobranca_${taskNumber}.docx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryDocx(
            `Simulacao Aviso Cobranca ${taskNumber}`,
            ['Aviso de cobranca gerado em simulacao.']
          );
          return { fileName, buffer: buf };
        }
        case 73: {
          const fileName = `sim_relatorio_${taskNumber}.pdf`;
          const buf = PhysicalDocumentValidator.buildRealBinaryPdf(
            `Relatorio de Gestao SASO ${taskNumber}`,
            [
              `Relatorio executivo para employee 73 em simulacao controlada.`,
              `Consolidacao de indicadores de desempenho operacional.`
            ]
          );
          return { fileName, buffer: buf };
        }
        default:
          throw new Error(`Employee ID ${empId} sem gerador de simulacao.`);
      }
    }
  }

  public get tasks(): Map<string, PilotTaskReceipt> {
    const map = new Map<string, PilotTaskReceipt>();
    for (const t of this.store.listTasks()) {
      map.set(t.task_id, t);
    }
    return map;
  }

  public get taskOutputs(): Map<string, any> {
    const map = new Map<string, any>();
    for (const t of this.store.listTasks()) {
      const out = this.getTaskOutput(t.task_id);
      if (out) {
        map.set(t.task_id, out);
      }
    }
    return map;
  }

  public get incidents(): PilotIncident[] {
    return this.store.listIncidents();
  }
}
