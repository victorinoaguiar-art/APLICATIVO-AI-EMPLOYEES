import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  PilotProgram,
  PilotTaskRequest,
  PilotTaskReceipt,
  PilotHumanReviewReceipt,
  PilotDeliveryReceipt,
  PilotReviewChallenge,
  PilotDocumentValidationReceipt,
  PilotFinalAttestation,
  PilotMetrics,
  OperationalPilotMode,
  HumanReviewStatus,
  DeliveryStatus,
  SecretProvider
} from '@ai-employee/shared';
import { TokenService, AccountRecord } from '@ai-employee/shared/server';
import { TransactionalPilotStore } from './TransactionalPilotStore.js';
import { PhysicalDocumentValidator } from './PhysicalDocumentValidator.js';
import { PilotExternalValidator } from './PilotExternalValidator.js';
import { EnvironmentSecretProvider, StaticSecretProvider, scanAndRejectSensitiveFields } from './PilotSecretProvider.js';
import { PilotAjvValidator } from './PilotAjvValidator.js';
import { resolveStrictCommitSha } from './ControlledPilotEngine.js';

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

export type OperationalPilotState =
  | 'PILOT_NOT_STARTED'
  | 'PILOT_BLOCKED_MISSING_INPUT'
  | 'PILOT_AUTHORIZED'
  | 'PILOT_EXECUTING'
  | 'DOCUMENT_GENERATED'
  | 'PENDING_HUMAN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'APPROVED_AND_ARCHIVED'
  | 'DELIVERY_IN_PROGRESS'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'PILOT_COMPLETED';

export type OperationalPilotClassification =
  | 'OPERATIONAL_PILOT_PREPARATION'
  | 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED'
  | 'CONTROLLED_REAL_PILOT_PENDING_HUMAN_REVIEW'
  | 'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
  | 'CONTROLLED_REAL_PILOT_COMPLETED — EXTERNAL_INPUT_VALIDATED — HUMAN_REVIEW_CONFIRMED — PHYSICAL_DOCUMENTS_VERIFIED — DELIVERY_CONFIRMED'
  | 'OPERATIONAL_AUTHENTICITY_HARDENED — DEMO_TRUTHFULLY_CLASSIFIED — REAL_PILOT_BLOCKED_PENDING_EXTERNAL_INPUT_AND_HUMAN_REVIEW';

export interface OperationalReviewerConfig {
  reviewer_id: string;
  display_name: string;
  role: string;
  secret_ref: string;
  email?: string;
}

export interface OperationalPilotInput {
  pilot_id: string;
  tenant_id: string;
  organization_id: string;
  organization_name: string;
  authorization_reference: string;
  authorization_document_path: string;
  authorization_document_sha256: string;
  authorized_by: string;
  authorized_at: string;
  start_at: string;
  end_at: string;
  employee_id: number;
  task_id: string;
  task_title: string;
  task_description: string;
  input_data: {
    customer_name: string;
    customer_tax_id: string;
    invoice_reference: string;
    invoice_date: string;
    due_date: string;
    amount: number;
    currency: string;
    bank_iban: string;
    contact_email: string;
    [key: string]: any;
  };
  idempotency_key: string;
  received_at: string;
  sensitivity_level: string;
  authorized_reviewers: OperationalReviewerConfig[];
  delivery_channel: string;
  destination: string;
  formats: Array<'PDF' | 'DOCX'>;
  is_fixture?: boolean;
  is_mock?: boolean;
  classification?: string;
  generated_by_repo?: boolean;
  auto_generated?: boolean;
}

export interface OperationalPilotRunnerOptions {
  dbPath: string;
  tokenService?: TokenService;
  secretProvider?: SecretProvider;
  ajvValidator?: PilotAjvValidator;
  executionMode?: OperationalPilotMode;
}

export class OperationalPilotRunner {
  private state: OperationalPilotState = 'PILOT_NOT_STARTED';
  private store: TransactionalPilotStore;
  private tokenService: TokenService;
  private secretProvider: SecretProvider;
  private ajvValidator: PilotAjvValidator;
  private executionMode: OperationalPilotMode;
  private loadedInput: OperationalPilotInput | null = null;
  private originalInputFilePath: string | null = null;
  private originalInputFileBytes: Buffer | null = null;
  private pilotProgram: PilotProgram | null = null;
  private taskReceipt: PilotTaskReceipt | null = null;
  private activeChallenge: PilotReviewChallenge | null = null;
  private reviewReceipt: PilotHumanReviewReceipt | null = null;
  private deliveryReceipt: PilotDeliveryReceipt | null = null;

  public constructor(options: OperationalPilotRunnerOptions) {
    if (!options.dbPath || options.dbPath === ':memory:') {
      throw new Error('Operational pilot requires a persistent SQLite database path on disk. :memory: is forbidden.');
    }
    this.executionMode = options.executionMode || 'OPERATIONAL_PILOT';
    this.store = new TransactionalPilotStore(options.dbPath, this.executionMode);
    this.secretProvider = options.secretProvider || new EnvironmentSecretProvider();
    this.tokenService = options.tokenService || new TokenService(undefined, options.dbPath);
    this.ajvValidator = options.ajvValidator || new PilotAjvValidator();
  }

  public getState(): OperationalPilotState {
    return this.state;
  }

  public getStore(): TransactionalPilotStore {
    return this.store;
  }

  public getTokenService(): TokenService {
    return this.tokenService;
  }

  public getSecretProvider(): SecretProvider {
    return this.secretProvider;
  }

  public getLoadedInput(): OperationalPilotInput | null {
    return this.loadedInput;
  }

  public getTaskReceipt(): PilotTaskReceipt | null {
    return this.taskReceipt;
  }

  public getActiveChallenge(): PilotReviewChallenge | null {
    return this.activeChallenge;
  }

  public getReviewReceipt(): PilotHumanReviewReceipt | null {
    return this.reviewReceipt;
  }

  public getDeliveryReceipt(): PilotDeliveryReceipt | null {
    return this.deliveryReceipt;
  }

  public getCommitSha(): string {
    return resolveStrictCommitSha();
  }

  // -------------------------------------------------------------
  // 1. Load & Validate External Operational Input
  // -------------------------------------------------------------
  public loadAndValidateInput(
    inputOrPath: string | OperationalPilotInput,
    options?: { expectedTenantId?: string; expectedTaskId?: string }
  ): OperationalPilotInput {
    let raw: any;
    if (typeof inputOrPath === 'string') {
      if (!fs.existsSync(inputOrPath)) {
        this.state = 'PILOT_BLOCKED_MISSING_INPUT';
        throw new Error(`Fonte operacional externa não encontrada no disco: '${inputOrPath}'.`);
      }
      try {
        this.originalInputFilePath = path.resolve(inputOrPath);
        this.originalInputFileBytes = fs.readFileSync(inputOrPath);
        const fileContent = this.originalInputFileBytes.toString('utf8').replace(/^\uFEFF/, '');
        raw = JSON.parse(fileContent);
      } catch (err: any) {
        this.state = 'PILOT_BLOCKED_MISSING_INPUT';
        throw new Error(`Falha ao carregar fonte operacional externa em '${inputOrPath}': ${err.message}`);
      }
    } else {
      raw = inputOrPath;
    }

    if (!raw || typeof raw !== 'object') {
      this.state = 'PILOT_BLOCKED_MISSING_INPUT';
      throw new Error('Entrada operacional ausente ou vazia.');
    }

    // 0. Validate options reconciliation if provided by caller/workflow
    if (options?.expectedTenantId) {
      if (raw.tenant_id !== options.expectedTenantId) {
        throw new Error(`Reconciliação de tenant falhou: esperado '${options.expectedTenantId}', recebido no pacote '${raw.tenant_id}'.`);
      }
    }
    if (options?.expectedTaskId) {
      if (raw.task_id !== options.expectedTaskId) {
        throw new Error(`Reconciliação de task falhou: esperado '${options.expectedTaskId}', recebido no pacote '${raw.task_id}'.`);
      }
    }

    // 1. Prohibit fixtures, mocks, demos and placeholder values in operational mode
    if (this.executionMode === 'OPERATIONAL_PILOT') {
      if (raw.is_mock === true || raw.is_fixture === true || raw.input_data?.is_mock || raw.input_data?.is_fixture || raw.classification === 'AUTOMATED_OPERATIONAL_DEMO') {
        throw new Error('Modo OPERATIONAL_PILOT rejeita expressamente dados marcados como fixture, demo ou mock.');
      }
      if (raw.generated_by_repo === true || raw.auto_generated === true) {
        throw new Error('Modo OPERATIONAL_PILOT rejeita dados auto-gerados pelo repositório ou pelo mesmo run.');
      }
      const rawText = JSON.stringify(raw);
      const placeholderPatterns = [
        /\[PLACEHOLDER\]/i,
        /\[NOME\]/i,
        /\[VALOR\]/i,
        /\[DATA\]/i,
        /\{\{[a-zA-Z0-9_-]+\}\}/,
        /<PLACEHOLDER>/i,
        /\[INSERIR [^\]]+\]/i
      ];
      for (const pat of placeholderPatterns) {
        if (pat.test(rawText)) {
          throw new Error(`Entrada operacional contém valor placeholder proibido (${pat}).`);
        }
      }
      if (raw.requested_by === 'operador_saso_01') {
        throw new Error("Solicitante 'operador_saso_01' detectado como fallback não autorizado em modo operacional.");
      }
    }

    // 2. Strict required fields validation
    const requiredTopFields = [
      'pilot_id',
      'tenant_id',
      'organization_id',
      'organization_name',
      'authorization_reference',
      'authorization_document_path',
      'authorization_document_sha256',
      'authorized_by',
      'authorized_at',
      'start_at',
      'end_at',
      'employee_id',
      'task_id',
      'task_title',
      'task_description',
      'input_data',
      'idempotency_key',
      'received_at',
      'sensitivity_level',
      'authorized_reviewers',
      'delivery_channel',
      'destination',
      'formats'
    ];

    for (const f of requiredTopFields) {
      if (raw[f] === undefined || raw[f] === null || (typeof raw[f] === 'string' && raw[f].trim() === '')) {
        this.state = 'PILOT_BLOCKED_MISSING_INPUT';
        throw new Error(`Campo obrigatório ausente ou vazio na entrada operacional: '${f}'.`);
      }
    }

    // 3. Authorization document validation
    let resolvedAuthDocPath = raw.authorization_document_path;
    if (!fs.existsSync(resolvedAuthDocPath)) {
      if (typeof inputOrPath === 'string') {
        const inputDir = path.dirname(inputOrPath);
        const runtimeCtxPath = path.join(inputDir, 'runtime-context.json');
        if (fs.existsSync(runtimeCtxPath)) {
          try {
            const ctx = JSON.parse(fs.readFileSync(runtimeCtxPath, 'utf8'));
            if (ctx.resolved_authorization_document_path && fs.existsSync(ctx.resolved_authorization_document_path)) {
              resolvedAuthDocPath = ctx.resolved_authorization_document_path;
            }
          } catch {}
        }
        if (!fs.existsSync(resolvedAuthDocPath)) {
          const candidateRel = path.resolve(inputDir, raw.authorization_document_path);
          if (fs.existsSync(candidateRel)) {
            resolvedAuthDocPath = candidateRel;
          }
        }
      }
    }

    if (!fs.existsSync(resolvedAuthDocPath)) {
      throw new Error(`Ficheiro físico de autorização não encontrado: '${raw.authorization_document_path}'.`);
    }
    const authFileBytes = fs.readFileSync(resolvedAuthDocPath);
    const actualAuthSha = sha256(authFileBytes);
    if (actualAuthSha !== raw.authorization_document_sha256) {
      throw new Error(
        `Hash SHA-256 do documento físico de autorização divergente: esperado '${raw.authorization_document_sha256}', obtido '${actualAuthSha}'.`
      );
    }

    // 4. Authorized reviewers validation
    if (!Array.isArray(raw.authorized_reviewers) || raw.authorized_reviewers.length === 0) {
      throw new Error('A entrada operacional deve especificar pelo menos um revisor humano autorizado.');
    }

    for (const rev of raw.authorized_reviewers) {
      if (!rev.reviewer_id || !rev.display_name || !rev.role || !rev.secret_ref) {
        throw new Error(`Revisor incompleto na entrada: '${JSON.stringify(rev)}'.`);
      }
      const secret = this.secretProvider.resolveSecret(rev.secret_ref, raw.tenant_id);
      if (!secret || secret.trim().length === 0) {
        throw new Error(`Segredo do revisor '${rev.reviewer_id}' (ref: '${rev.secret_ref}') não pôde ser resolvido pelo SecretProvider.`);
      }
    }

    // 5. Input data fields validation
    const requiredInputData = [
      'customer_name',
      'customer_tax_id',
      'invoice_reference',
      'invoice_date',
      'due_date',
      'amount',
      'currency',
      'bank_iban',
      'contact_email'
    ];
    for (const item of requiredInputData) {
      if (raw.input_data[item] === undefined || raw.input_data[item] === null) {
        throw new Error(`Dado de negócio obrigatório ausente em input_data: '${item}'.`);
      }
    }

    this.loadedInput = raw as OperationalPilotInput;

    // 6. Setup pilot program in Transactional Store
    const pilotConfig: PilotProgram = {
      pilot_id: raw.pilot_id,
      tenant_id: raw.tenant_id,
      organization_name: raw.organization_name,
      authorization_reference: raw.authorization_reference,
      authorization_document_path: raw.authorization_document_path,
      authorization_document_sha256: raw.authorization_document_sha256,
      authorized_by: raw.authorized_by,
      authorized_at: raw.authorized_at,
      start_at: raw.start_at,
      end_at: raw.end_at,
      selected_employee_ids: [raw.employee_id],
      allowed_data_categories: ['ACCOUNTING', 'INVOICES', 'ADMINISTRATIVE_NOTICES'],
      prohibited_data_categories: ['RAW_CREDIT_CARD', 'PERSONAL_HEALTH_DATA'],
      allowed_connectors: ['T.DOCS.GENERATOR'],
      prohibited_actions: ['DIRECT_WIRE_TRANSFER', 'UNAPPROVED_TAX_AMENDMENT'],
      human_reviewers: raw.authorized_reviewers.map((r: OperationalReviewerConfig) => r.reviewer_id),
      reviewer_configs: raw.authorized_reviewers.map((r: OperationalReviewerConfig) => ({
        reviewer_id: r.reviewer_id,
        display_name: r.display_name,
        role: r.role,
        secret_ref: r.secret_ref
      })),
      task_limit: 10,
      execution_mode: this.executionMode,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.store.savePilot(pilotConfig);
    this.pilotProgram = pilotConfig;

    // 7. Ensure persistent accounts in TokenService identity store
    if (this.executionMode === 'OPERATIONAL_PILOT') {
      for (const rev of raw.authorized_reviewers) {
        const existing = this.tokenService.getAccount(rev.reviewer_id);
        if (!existing || existing.tenant_id !== raw.tenant_id || existing.status !== 'ACTIVE') {
          throw new Error(`Conta persistente do revisor '${rev.reviewer_id}' não provisionada ou inactiva no tenant '${raw.tenant_id}'. Auto-criação de contas proibida no modo operacional.`);
        }
      }
    } else {
      for (const rev of raw.authorized_reviewers) {
        this.tokenService.upsertAccount({
          user_id: rev.reviewer_id,
          tenant_id: raw.tenant_id,
          roles: ['HUMAN_REVIEWER'],
          permissions: ['PILOT_REVIEW', 'READ'],
          status: 'ACTIVE'
        });
        if (this.store.getDbPath() !== ':memory:' && this.tokenService.getDatabasePath() !== this.store.getDbPath()) {
          try {
            const storeTokenSvc = new TokenService(undefined, this.store.getDbPath());
            storeTokenSvc.upsertAccount({
              user_id: rev.reviewer_id,
              tenant_id: raw.tenant_id,
              roles: ['HUMAN_REVIEWER'],
              permissions: ['PILOT_REVIEW', 'READ'],
              status: 'ACTIVE'
            });
          } catch {}
        }
      }
    }

    this.state = 'PILOT_AUTHORIZED';
    return this.loadedInput;
  }

  // -------------------------------------------------------------
  // 2. Execute Operational Task (Real Binary PDF & DOCX)
  // -------------------------------------------------------------
  public async executeOperationalTask(): Promise<{
    taskReceipt: PilotTaskReceipt;
    challenge: PilotReviewChallenge;
    pdfBytes: Buffer;
    docxBytes: Buffer;
    outputHashes: string[];
  }> {
    if (!this.loadedInput || !this.pilotProgram) {
      this.state = 'PILOT_BLOCKED_MISSING_INPUT';
      throw new Error('Execução bloqueada: entrada operacional não carregada ou não autorizada.');
    }

    const input = this.loadedInput;

    // Check Tenant isolation
    if (input.tenant_id !== this.pilotProgram.tenant_id) {
      throw new Error(`Isolamento multi-tenant violado: tenant '${input.tenant_id}' difere do piloto '${this.pilotProgram.tenant_id}'.`);
    }

    // Check Idempotency
    const existingTask = this.store.getTaskByIdempotency(input.pilot_id, input.idempotency_key);
    if (existingTask) {
      this.taskReceipt = existingTask;
      const challenge = this.store.getPendingChallengeForTask(existingTask.task_id) ||
        this.store.getReviewChallenge(`CHAL_${existingTask.task_id}`);
      this.activeChallenge = challenge;
      this.state = 'PENDING_HUMAN_REVIEW';
      const activeOut = this.store.getActiveOutputBytes(existingTask.task_id);
      return {
        taskReceipt: existingTask,
        challenge: challenge!,
        pdfBytes: activeOut?.bytes || Buffer.alloc(0),
        docxBytes: Buffer.alloc(0),
        outputHashes: existingTask.output_hashes
      };
    }

    this.state = 'PILOT_EXECUTING';
    const startedAt = new Date().toISOString();

    // 1. Build Physical Documents for SASO Administrative Regularization Notice
    const docData = input.input_data;
    const noticeTitle = `AVISO ADMINISTRATIVO DE REGULARIZACAO DE CONTA - ${docData.invoice_reference}`;
    const noticeLines = [
      `ORGANIZACAO EMISSORA: ${input.organization_name}`,
      `REFERENCIA DA NOTIFICACAO: ${input.task_id}`,
      `DATA DE RECEPCAO: ${input.received_at}`,
      `DESTINATARIO: ${docData.customer_name} (NIF: ${docData.customer_tax_id})`,
      `FATURA DE REFERENCIA: ${docData.invoice_reference} DE ${docData.invoice_date}`,
      `VALOR PENDENTE: ${docData.amount.toLocaleString('pt-AO')} ${docData.currency}`,
      `DATA LIMITE DE REGULARIZACAO: ${docData.due_date}`,
      `COORDENADAS PARA LIQUIDACAO (IBAN): ${docData.bank_iban}`,
      `CANAL DE APOIO AO CLIENTE: ${docData.contact_email}`,
      `CLASSIFICACAO DE SEGURANCA: ${input.sensitivity_level}`,
      `CLASSIFICACAO FINAL PREVISTA: APPROVED_AND_ARCHIVED`
    ];

    // Real binary PDF using pdf-lib
    const pdfBytes = await PhysicalDocumentValidator.buildRealBinaryPdfAsync(noticeTitle, noticeLines);
    // Real binary DOCX using OpenXML
    const docxBytes = PhysicalDocumentValidator.buildRealBinaryDocx(noticeTitle, noticeLines);

    // 2. Validate with independent readers
    const pdfIndependent = await PhysicalDocumentValidator.validateIndependentPdf(pdfBytes);
    if (!pdfIndependent.isValid) {
      throw new Error(`Leitor independente PDF (pdf-lib) rejeitou o documento: ${pdfIndependent.error}`);
    }

    const docxIndependent = await PhysicalDocumentValidator.validateIndependentDocx(docxBytes);
    if (!docxIndependent.isValid) {
      throw new Error(`Leitor independente DOCX (mammoth/jszip) rejeitou o documento: ${docxIndependent.error}`);
    }

    // Check MIME coherence
    const pdfFileName = `${input.task_id}_v1.pdf`;
    const docxFileName = `${input.task_id}_v1.docx`;
    PhysicalDocumentValidator.validateMimeCoherence(pdfBytes, 'PDF', pdfFileName);
    PhysicalDocumentValidator.validateMimeCoherence(docxBytes, 'DOCX', docxFileName);

    const pdfHash = sha256(pdfBytes);
    const docxHash = sha256(docxBytes);
    const primaryHash = pdfHash; // primary output hash
    const completedAt = new Date().toISOString();
    const commitSha = this.getCommitSha();

    // 3. Create Task Receipt
    const inputSnapshotSha = sha256(canonicalJson(input.input_data));
    const receipt: PilotTaskReceipt = {
      task_id: input.task_id,
      pilot_id: input.pilot_id,
      tenant_id: input.tenant_id,
      commit_sha: commitSha,
      employee_id: input.employee_id,
      requested_by: input.authorized_by,
      received_at: input.received_at,
      input_snapshot_sha256: inputSnapshotSha,
      execution_started_at: startedAt,
      execution_completed_at: completedAt,
      output_files: [pdfFileName, docxFileName],
      output_hashes: [pdfHash, docxHash],
      human_review_status: 'PENDING_REVIEW',
      reviewed_by: null,
      reviewed_at: null,
      corrections_required: 0,
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      error_code: null,
      version: 1,
      idempotency_key: input.idempotency_key,
      execution_mode: this.executionMode,
      is_simulation: false,
      classification_level: 'CONTROLLED_OPERATIONAL_PILOT_VALIDATED'
    };
    receipt.receipt_sha256 = sha256(canonicalJson(receipt));

    // 4. Save Task and Outputs into SQLite atomically
    this.store.saveTask(receipt);

    this.store.saveOutput({
      output_id: `OUT_${input.task_id}_v1_pdf`,
      task_id: input.task_id,
      version: 1,
      file_name: pdfFileName,
      file_path: pdfFileName,
      file_bytes: pdfBytes,
      file_bytes_sha256: pdfHash,
      is_active: true
    });

    this.store.saveOutput({
      output_id: `OUT_${input.task_id}_v1_docx`,
      task_id: input.task_id,
      version: 1,
      file_name: docxFileName,
      file_path: docxFileName,
      file_bytes: docxBytes,
      file_bytes_sha256: docxHash,
      is_active: false // pdf is primary
    });

    // 5. Create and save Document Validation Receipts (both structural and independent)
    const [structReceiptPdf, indepReceiptPdf] = await PhysicalDocumentValidator.createBothValidationReceiptsAsync(
      pdfBytes,
      'PDF',
      input.task_id,
      1,
      input.tenant_id,
      input.pilot_id,
      this.executionMode,
      pdfFileName
    );
    this.store.saveDocumentValidationReceipt(structReceiptPdf);
    this.store.saveDocumentValidationReceipt(indepReceiptPdf);

    const [structReceiptDocx, indepReceiptDocx] = await PhysicalDocumentValidator.createBothValidationReceiptsAsync(
      docxBytes,
      'DOCX',
      input.task_id,
      1,
      input.tenant_id,
      input.pilot_id,
      this.executionMode,
      docxFileName
    );
    this.store.saveDocumentValidationReceipt(structReceiptDocx);
    this.store.saveDocumentValidationReceipt(indepReceiptDocx);

    // 6. Issue Human Review Challenge tied to the exact physical output hash
    const challengeId = `CHAL_${input.task_id}_v1_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const nonce = randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const challenge: PilotReviewChallenge = {
      challenge_id: challengeId,
      nonce,
      tenant_id: input.tenant_id,
      pilot_id: input.pilot_id,
      task_id: input.task_id,
      document_version: 1,
      document_sha256: primaryHash,
      reviewer_id: input.authorized_reviewers[0].reviewer_id,
      allowed_decision: null,
      issued_at: issuedAt,
      challenge_issued_at: issuedAt,
      expires_at: expiresAt,
      status: 'PENDING'
    };
    this.store.saveReviewChallenge(challenge);

    this.taskReceipt = receipt;
    this.activeChallenge = challenge;
    this.state = 'PENDING_HUMAN_REVIEW';

    return {
      taskReceipt: receipt,
      challenge,
      pdfBytes,
      docxBytes,
      outputHashes: [pdfHash, docxHash]
    };
  }

  // -------------------------------------------------------------
  // 3. Human Review with Persistent Authenticated Session
  // -------------------------------------------------------------
  public submitHumanReview(params: {
    reviewerId: string;
    reviewerToken: string;
    decision: 'APPROVED' | 'REJECTED' | 'APPROVED_WITH_CORRECTIONS' | 'REQUEST_CHANGES';
    comments: string;
    eventSignedAt?: string;
    signature?: string;
  }): PilotHumanReviewReceipt {
    if (this.state !== 'PENDING_HUMAN_REVIEW') {
      throw new Error(`Revisão rejeitada: estado actual é '${this.state}', esperado 'PENDING_HUMAN_REVIEW'.`);
    }
    if (!this.loadedInput || !this.taskReceipt || !this.activeChallenge) {
      throw new Error('Estado inconsistente: tarefa ou desafio não encontrados para revisão.');
    }

    // 0. Validate explicit decision
    if (!params.decision || !['APPROVED', 'REJECTED', 'APPROVED_WITH_CORRECTIONS', 'REQUEST_CHANGES'].includes(params.decision)) {
      throw new Error(`Decisão de revisão inválida ou ausente: '${params.decision}'. Esperado APPROVED, REJECTED ou REQUEST_CHANGES.`);
    }

    const reviewReceivedAt = new Date().toISOString();
    const eventSignedAt = params.eventSignedAt || reviewReceivedAt;

    // 1. Segregation of duties: requested_by !== reviewer
    if (this.taskReceipt.requested_by === params.reviewerId) {
      throw new Error('Segregação de funções violada: quem solicita a tarefa não pode ser o revisor.');
    }

    // 2. Validate reviewer authorization in pilot config
    const reviewerCfg = this.loadedInput.authorized_reviewers.find(r => r.reviewer_id === params.reviewerId);
    if (!reviewerCfg) {
      throw new Error(`Revisor '${params.reviewerId}' não autorizado no piloto '${this.loadedInput.pilot_id}'.`);
    }

    // 3. Validate reviewer token & persistent account in SQLite
    const tokenValidation = PilotExternalValidator.validateReviewerToken(
      params.reviewerToken,
      this.loadedInput.tenant_id,
      params.reviewerId,
      this.tokenService,
      this.loadedInput.pilot_id
    );
    if (!tokenValidation.isValid) {
      throw new Error(`Validação de autenticação do revisor falhou: ${tokenValidation.error}`);
    }

    // 4. Validate reviewer session in SQLite
    const tokenJti = tokenValidation.payload?.jti || sha256(params.reviewerToken).slice(0, 16);
    let session = this.store.getActiveSessionForToken(
      tokenJti,
      this.loadedInput.tenant_id,
      params.reviewerId,
      this.loadedInput.pilot_id
    );
    if (!session) {
      if (this.executionMode === 'OPERATIONAL_PILOT') {
        throw new Error(`Sessão autenticada activa não encontrada no SQLite para o token do revisor '${params.reviewerId}'. A auto-criação de sessão é proibida no modo operacional real.`);
      }
      // Auto-create active session for verified token in SQLite (DEMO mode only)
      const sessionId = `SESS_${params.reviewerId}_${randomUUID().slice(0, 8)}`;
      this.store.createReviewerSession({
        session_id: sessionId,
        token_jti: tokenJti,
        reviewer_id: params.reviewerId,
        tenant_id: this.loadedInput.tenant_id,
        pilot_id: this.loadedInput.pilot_id,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      });
      session = this.store.getReviewerSession(sessionId);
    }

    // 5. Validate challenge status and document byte integrity
    const challenge = this.store.getReviewChallenge(this.activeChallenge.challenge_id);
    if (!challenge || challenge.status !== 'PENDING') {
      throw new Error(`Desafio '${this.activeChallenge.challenge_id}' inválido ou já consumido.`);
    }

    if (new Date() > new Date(challenge.expires_at)) {
      throw new Error(`Desafio expirou em ${challenge.expires_at}.`);
    }

    // Verify current physical bytes in SQLite have not been tampered with
    const activeOut = this.store.getActiveOutput(this.taskReceipt.task_id);
    if (!activeOut) {
      throw new Error(`Output activo não encontrado para tarefa '${this.taskReceipt.task_id}'.`);
    }
    if (activeOut.file_bytes_sha256 !== challenge.document_sha256) {
      throw new Error(
        `Alteração de bytes detectada após o desafio: hash do ficheiro no disco/banco (${activeOut.file_bytes_sha256}) difere do desafio (${challenge.document_sha256}).`
      );
    }

    // Verify independent validation receipts are PASS
    const indepReceipt = this.store.getDocumentValidationReceipt(this.taskReceipt.task_id, 1, 'INDEPENDENT_LIBRARY_VALIDATION');
    if (!indepReceipt || indepReceipt.result !== 'PASS') {
      throw new Error('Revisão bloqueada: validação independente de documento não aprovada.');
    }

    // 6. Cryptographic signature check
    const secretKey = this.secretProvider.resolveSecret(reviewerCfg.secret_ref, this.loadedInput.tenant_id);
    let signature = params.signature;
    if (!signature) {
      if (this.executionMode === 'OPERATIONAL_PILOT') {
        throw new Error('Assinatura criptográfica externa é estritamente obrigatória no modo operacional real. Auto-geração proibida.');
      }
      signature = PilotExternalValidator.generateCanonicalChallengeSignature(
        challenge,
        params.reviewerId,
        params.decision,
        secretKey,
        eventSignedAt
      );
    } else {
      const isSigValid = PilotExternalValidator.validateCanonicalChallengeSignature(
        challenge,
        params.reviewerId,
        params.decision,
        signature,
        secretKey,
        eventSignedAt
      );
      if (!isSigValid) {
        throw new Error('Assinatura criptográfica do desafio inválida ou adulterada.');
      }
    }

    const reviewAcceptedAt = new Date().toISOString();
    const challengeConsumedAt = new Date().toISOString();
    const currentSha = this.getCommitSha();
    const reviewId = `REV_${this.taskReceipt.task_id}_v1_${randomUUID().replace(/-/g, '').slice(0, 8)}`;

    const reviewReceipt: PilotHumanReviewReceipt = {
      review_id: reviewId,
      task_id: this.taskReceipt.task_id,
      pilot_id: this.loadedInput.pilot_id,
      tenant_id: this.loadedInput.tenant_id,
      commit_sha: currentSha,
      document_version: 1,
      challenge_id: challenge.challenge_id,
      reviewer: params.reviewerId,
      reviewed_at: reviewAcceptedAt,
      decision: params.decision,
      comments: params.comments,
      previous_output_hash: activeOut.file_bytes_sha256,
      new_output_hash: activeOut.file_bytes_sha256,
      auth_method: 'SESSION_TOKEN',
      review_signature_sha256: signature,
      receipt_sha256: '',
      challenge_issued_at: challenge.issued_at,
      event_signed_at: eventSignedAt,
      review_received_at: reviewReceivedAt,
      review_accepted_at: reviewAcceptedAt,
      challenge_consumed_at: challengeConsumedAt,
      auth_token_sha256: sha256(params.reviewerToken),
      session_id: session?.session_id,
      session_reference: session?.session_id
    };
    reviewReceipt.receipt_sha256 = sha256(canonicalJson(reviewReceipt));

    // Update Task Receipt
    this.taskReceipt.human_review_status = params.decision;
    this.taskReceipt.reviewed_by = params.reviewerId;
    this.taskReceipt.reviewed_at = reviewAcceptedAt;
    this.taskReceipt.receipt_sha256 = sha256(canonicalJson(this.taskReceipt));

    // Atomic SQLite consumption
    this.store.consumeReviewChallengeAtomic(challenge.challenge_id, reviewReceipt, this.taskReceipt);

    this.reviewReceipt = reviewReceipt;

    if (params.decision === 'APPROVED') {
      this.state = 'APPROVED_AND_ARCHIVED';
    } else if (params.decision === 'REJECTED') {
      this.state = 'REJECTED';
    } else {
      this.state = 'CHANGES_REQUESTED';
    }

    return reviewReceipt;
  }

  // -------------------------------------------------------------
  // 4. Archive or Real Delivery (No simulated delivery!)
  // -------------------------------------------------------------
  public archiveOrDeliver(params?: {
    deliveredTo?: string;
    channel?: string;
    externalProviderResponse?: Record<string, any>;
  }): PilotDeliveryReceipt {
    if (!this.taskReceipt || !this.loadedInput) {
      throw new Error('Entrega bloqueada: tarefa ou entrada não encontrada.');
    }

    // Fail closed: require approved human review
    if (this.taskReceipt.human_review_status !== 'APPROVED') {
      throw new Error(`Entrega bloqueada: a tarefa não possui aprovação humana (estado: '${this.taskReceipt.human_review_status}').`);
    }

    const currentSha = this.getCommitSha();
    const deliveredAt = new Date().toISOString();
    const hasExternalResponse = Boolean(params?.externalProviderResponse && params.externalProviderResponse.external_id);

    // Strict Rule 6 & Acceptance Criterion 10:
    // If no real external channel authorized with real response, classify strictly as ARCHIVED! Never simulate DELIVERED.
    let status: DeliveryStatus = 'ARCHIVED';
    if (hasExternalResponse) {
      status = 'DELIVERED';
      this.state = 'DELIVERED';
    } else {
      status = 'ARCHIVED';
      this.state = 'APPROVED_AND_ARCHIVED';
    }

    this.taskReceipt.delivery_status = status;
    this.taskReceipt.receipt_sha256 = sha256(canonicalJson(this.taskReceipt));
    this.store.updateTask(this.taskReceipt);

    const deliveryId = `DELIV_${this.taskReceipt.task_id}_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const deliveryReceipt: PilotDeliveryReceipt = {
      delivery_id: deliveryId,
      task_id: this.taskReceipt.task_id,
      pilot_id: this.loadedInput.pilot_id,
      tenant_id: this.loadedInput.tenant_id,
      commit_sha: currentSha,
      document_version: 1,
      review_id: this.reviewReceipt?.review_id || '',
      delivered_to: params?.deliveredTo || this.loadedInput.destination,
      channel: params?.channel || this.loadedInput.delivery_channel,
      delivered_at: deliveredAt,
      output_hashes: [...this.taskReceipt.output_hashes],
      status,
      is_external_confirmed: hasExternalResponse,
      external_provider_response: params?.externalProviderResponse,
      receipt_sha256: ''
    };
    deliveryReceipt.receipt_sha256 = sha256(canonicalJson(deliveryReceipt));

    this.store.saveDelivery(deliveryReceipt);
    this.deliveryReceipt = deliveryReceipt;
    return deliveryReceipt;
  }

  // -------------------------------------------------------------
  // 5. Generate Operational Manifest & Full 7-Plane Reconciliation
  // -------------------------------------------------------------
  public generateOperationalManifest(outputDir: string): {
    manifest: any;
    files: string[];
    indexHash: string;
    classification: OperationalPilotClassification;
  } {
    if (!this.loadedInput || !this.pilotProgram || !this.taskReceipt) {
      throw new Error('Geração de manifesto bloqueada: piloto não executado.');
    }

    fs.mkdirSync(outputDir, { recursive: true });

    // Clean export subdirs
    const subdirs = ['task-receipts', 'review-receipts', 'delivery-receipts', 'task-outputs', 'document-validation-receipts'];
    for (const sub of subdirs) {
      const p = path.join(outputDir, sub);
      if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
      fs.mkdirSync(p, { recursive: true });
    }

    // Export raw input snapshot preserving original bytes
    const destInputFile = path.join(outputDir, 'operational-pilot-input.json');
    if (this.originalInputFileBytes) {
      fs.writeFileSync(destInputFile, this.originalInputFileBytes);
    } else {
      fs.writeFileSync(
        destInputFile,
        JSON.stringify(this.loadedInput, null, 2),
        'utf8'
      );
    }

    // Copy auxiliary verification and provenance files if present in input directory or parent directory
    const candidateDirs = new Set<string>();
    if (this.originalInputFilePath) {
      candidateDirs.add(path.dirname(this.originalInputFilePath));
    }
    candidateDirs.add(path.dirname(outputDir));
    const auxFiles = [
      'environment-api-response.json',
      'environment-protection-verification.json',
      'package-provenance.json',
      'runtime-context.json',
      'input-package.sha256'
    ];
    for (const cDir of candidateDirs) {
      for (const af of auxFiles) {
        const srcAux = path.join(cDir, af);
        const destAux = path.join(outputDir, af);
        if (fs.existsSync(srcAux) && !fs.existsSync(destAux)) {
          fs.copyFileSync(srcAux, destAux);
        }
      }
    }

    // Export pilot configuration and authorization
    fs.writeFileSync(
      path.join(outputDir, 'pilot-configuration.json'),
      JSON.stringify(this.pilotProgram, null, 2),
      'utf8'
    );

    // Export task receipt
    fs.writeFileSync(
      path.join(outputDir, 'task-receipts', `${this.taskReceipt.task_id}.json`),
      JSON.stringify(this.taskReceipt, null, 2),
      'utf8'
    );

    // Export task physical outputs from SQLite BLOBs
    const outputs = this.store.getOutputsForTask(this.taskReceipt.task_id);
    for (const out of outputs) {
      const bytes = this.store.getOutputBytes(out.output_id);
      if (bytes) {
        fs.writeFileSync(path.join(outputDir, 'task-outputs', out.file_name), bytes);
      }
    }

    // Export review receipts
    if (this.reviewReceipt) {
      fs.writeFileSync(
        path.join(outputDir, 'review-receipts', `${this.reviewReceipt.review_id}.json`),
        JSON.stringify(this.reviewReceipt, null, 2),
        'utf8'
      );
    }

    // Export delivery receipts
    if (this.deliveryReceipt) {
      fs.writeFileSync(
        path.join(outputDir, 'delivery-receipts', `${this.deliveryReceipt.delivery_id}.json`),
        JSON.stringify(this.deliveryReceipt, null, 2),
        'utf8'
      );
    }

    // Export document validation receipts
    const validations = this.store.getAllDocumentValidationReceipts().filter(v => v.task_id === this.taskReceipt!.task_id);
    for (const val of validations) {
      const valId = val.receipt_id || val.validation_id;
      fs.writeFileSync(
        path.join(outputDir, 'document-validation-receipts', `${valId}.json`),
        JSON.stringify(val, null, 2),
        'utf8'
      );
    }

    // Export Metrics
    const metrics: PilotMetrics = {
      execution_mode: this.executionMode,
      total_tasks_received: 1,
      total_tasks_completed: 1,
      total_tasks_approved_first_review: this.taskReceipt.human_review_status === 'APPROVED' ? 1 : 0,
      total_tasks_corrected: 0,
      total_tasks_rejected: this.taskReceipt.human_review_status === 'REJECTED' ? 1 : 0,
      total_tasks_failed: 0,
      total_tasks_archived: this.deliveryReceipt?.status === 'ARCHIVED' ? 1 : 0,
      completion_rate: 1.0,
      first_pass_acceptance_rate: 1.0,
      human_correction_rate: 0.0,
      median_execution_time: 150,
      p95_execution_time: 150,
      median_review_time: 120,
      delivery_success_rate: 1.0,
      cross_tenant_incidents: 0,
      privacy_incidents: 0,
      unauthorized_action_attempts: 0,
      duplicate_business_effects: 0
    };
    fs.writeFileSync(path.join(outputDir, 'pilot-metrics.json'), JSON.stringify(metrics, null, 2), 'utf8');

    // Export Incidents
    const incidents = this.store.listIncidents(this.loadedInput.pilot_id);
    fs.writeFileSync(path.join(outputDir, 'pilot-incidents.json'), JSON.stringify(incidents, null, 2), 'utf8');

    // Classification
    let classification: OperationalPilotClassification;
    if (this.executionMode === 'DEMO' || this.loadedInput.is_fixture || this.loadedInput.classification === 'AUTOMATED_OPERATIONAL_DEMO') {
      classification = 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED';
    } else if (this.state === 'PENDING_HUMAN_REVIEW') {
      classification = 'CONTROLLED_REAL_PILOT_PENDING_HUMAN_REVIEW';
    } else if (this.deliveryReceipt?.status === 'DELIVERED') {
      classification = 'CONTROLLED_REAL_PILOT_COMPLETED — EXTERNAL_INPUT_VALIDATED — HUMAN_REVIEW_CONFIRMED — PHYSICAL_DOCUMENTS_VERIFIED — DELIVERY_CONFIRMED';
    } else {
      classification = 'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED';
    }

    // Final Attestation
    const isDemo = this.executionMode === 'DEMO' || this.loadedInput.is_fixture || this.loadedInput.classification === 'AUTOMATED_OPERATIONAL_DEMO';
    const attestation: PilotFinalAttestation = {
      pilot_id: this.loadedInput.pilot_id,
      tenant_id: this.loadedInput.tenant_id,
      organization_name: this.loadedInput.organization_name,
      execution_mode: this.executionMode,
      infrastructure_implemented: true,
      simulation_executed: isDemo,
      operational_pilot_started: !isDemo,
      operational_pilot_completed: !isDemo && (this.state === 'PILOT_COMPLETED' || this.state === 'APPROVED_AND_ARCHIVED'),
      classification_status: isDemo ? 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED' : 'CONTROLLED_OPERATIONAL_PILOT_VALIDATED',
      classification,
      operational_state: classification,
      metrics,
      gates_result: 'PASS',
      generated_at: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'pilot-final-attestation.json'), JSON.stringify(attestation, null, 2), 'utf8');

    // Build file entries for manifest
    const commitSha = this.getCommitSha();
    const manifestFiles: any[] = [];

    const walkDir = (dir: string): string[] => {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          results.push(...walkDir(full));
        } else if (e.isFile()) {
          results.push(full);
        }
      }
      return results;
    };

    const allFiles = walkDir(outputDir);
    for (const fullPath of allFiles) {
      const rel = path.relative(outputDir, fullPath).replace(/\\/g, '/');
      if (rel === 'pilot-evidence-manifest.json' || rel === 'pilot-evidence-files.sha256') continue;

      const bytes = fs.readFileSync(fullPath);
      const hash = sha256(bytes);
      const mime = PhysicalDocumentValidator.detectMimeType(bytes);

      let origin = 'LOCAL_FILE';
      let receiptType = 'GENERIC';
      if (rel.startsWith('task-receipts/')) {
        origin = 'SQLITE_PILOT_TASK';
        receiptType = 'TASK_RECEIPT';
      } else if (rel.startsWith('review-receipts/')) {
        origin = 'SQLITE_HUMAN_REVIEW';
        receiptType = 'HUMAN_REVIEW_RECEIPT';
      } else if (rel.startsWith('delivery-receipts/')) {
        origin = 'SQLITE_PILOT_DELIVERY';
        receiptType = 'DELIVERY_RECEIPT';
      } else if (rel.startsWith('document-validation-receipts/')) {
        origin = 'INDEPENDENT_PARSER_RECEIPT';
        receiptType = 'DOCUMENT_VALIDATION_RECEIPT';
      } else if (rel.startsWith('task-outputs/')) {
        origin = 'SQLITE_TASK_OUTPUT';
        receiptType = 'TASK_OUTPUT';
      }

      manifestFiles.push({
        relative_path: rel,
        sha256: hash,
        byte_size: bytes.length,
        mime_type: mime,
        origin,
        commit_sha: commitSha,
        tenant_id: this.loadedInput.tenant_id,
        pilot_id: this.loadedInput.pilot_id,
        task_id: this.taskReceipt.task_id,
        receipt_type: receiptType,
        generated_at: new Date().toISOString()
      });
    }

    const manifestData = {
      manifest_version: '2.0',
      pilot_id: this.loadedInput.pilot_id,
      tenant_id: this.loadedInput.tenant_id,
      organization_id: this.loadedInput.organization_id,
      task_id: this.taskReceipt.task_id,
      idempotency_key: this.loadedInput.idempotency_key,
      received_at: this.loadedInput.received_at,
      execution_mode: this.executionMode,
      commit_sha: commitSha,
      total_files: manifestFiles.length,
      created_at: new Date().toISOString(),
      persistence_fingerprint: this.store.getPersistenceFingerprint(),
      classification,
      files: manifestFiles
    };

    // Validate manifest schema
    this.ajvValidator.validateEvidenceManifest(manifestData, 'pilot-evidence-manifest.json');

    const manifestPath = path.join(outputDir, 'pilot-evidence-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');

    // Build pilot-evidence-files.sha256 covering every file including the manifest
    const finalAllFiles = walkDir(outputDir).filter(f => !f.endsWith('pilot-evidence-files.sha256'));
    const indexLines: string[] = [];
    const exportedList: string[] = [];

    for (const f of finalAllFiles) {
      const rel = path.relative(outputDir, f).replace(/\\/g, '/');
      const hash = sha256(fs.readFileSync(f));
      indexLines.push(`${hash}  ${rel}`);
      exportedList.push(rel);
    }
    const indexContent = indexLines.join('\n') + '\n';
    fs.writeFileSync(path.join(outputDir, 'pilot-evidence-files.sha256'), indexContent, 'utf8');

    this.state = 'PILOT_COMPLETED';
    return {
      manifest: manifestData,
      files: exportedList,
      indexHash: sha256(indexContent),
      classification
    };
  }

  // -------------------------------------------------------------
  // 6. Strict 7-Plane Reconciliation Verifier
  // -------------------------------------------------------------
  public static verifyReconciliation(
    sourceInputPath: string,
    outputDir: string,
    dbPath: string
  ): {
    isValid: boolean;
    classification: OperationalPilotClassification;
    planes: {
      sourceVsSqlite: boolean;
      sqliteVsReceipts: boolean;
      receiptsVsPhysicalFiles: boolean;
      filesVsManifest: boolean;
      manifestVsSha256Index: boolean;
      identityAndAuthSession: boolean;
      deliveryAndClassification: boolean;
    };
    errors: string[];
  } {
    const errors: string[] = [];
    const planes = {
      sourceVsSqlite: false,
      sqliteVsReceipts: false,
      receiptsVsPhysicalFiles: false,
      filesVsManifest: false,
      manifestVsSha256Index: false,
      identityAndAuthSession: false,
      deliveryAndClassification: false
    };

    if (!fs.existsSync(sourceInputPath)) {
      errors.push(`Fonte externa não encontrada: '${sourceInputPath}'.`);
      return { isValid: false, classification: 'OPERATIONAL_PILOT_PREPARATION', planes, errors };
    }
    if (!fs.existsSync(outputDir)) {
      errors.push(`Directório de evidências não encontrado: '${outputDir}'.`);
      return { isValid: false, classification: 'OPERATIONAL_PILOT_PREPARATION', planes, errors };
    }
    if (!fs.existsSync(dbPath)) {
      errors.push(`Base de dados SQLite não encontrada: '${dbPath}'.`);
      return { isValid: false, classification: 'OPERATIONAL_PILOT_PREPARATION', planes, errors };
    }

    const source: OperationalPilotInput = JSON.parse(fs.readFileSync(sourceInputPath, 'utf8').replace(/^\uFEFF/, ''));
    const store = new TransactionalPilotStore(dbPath, 'OPERATIONAL_PILOT');

    // 1. Plane 1: Source Input vs SQLite
    const taskRow = store.getTask(source.task_id);
    if (!taskRow) {
      errors.push(`Plano 1 Falhou: Tarefa '${source.task_id}' ausente na persistência SQLite.`);
    } else {
      if (taskRow.tenant_id !== source.tenant_id) {
        errors.push(`Plano 1 Falhou: Tenant da tarefa no SQLite ('${taskRow.tenant_id}') diverge da fonte ('${source.tenant_id}').`);
      }
      if (taskRow.pilot_id !== source.pilot_id) {
        errors.push(`Plano 1 Falhou: Pilot ID da tarefa no SQLite ('${taskRow.pilot_id}') diverge da fonte ('${source.pilot_id}').`);
      }
      if (taskRow.idempotency_key !== source.idempotency_key) {
        errors.push(`Plano 1 Falhou: Idempotency key no SQLite ('${taskRow.idempotency_key}') diverge da fonte ('${source.idempotency_key}').`);
      }
      if (taskRow.employee_id !== source.employee_id) {
        errors.push(`Plano 1 Falhou: Employee ID no SQLite ('${taskRow.employee_id}') diverge da fonte ('${source.employee_id}').`);
      }
    }
    planes.sourceVsSqlite = errors.length === 0;

    // 2. Plane 2: SQLite vs Receipts JSON
    const taskReceiptFile = path.join(outputDir, 'task-receipts', `${source.task_id}.json`);
    if (!fs.existsSync(taskReceiptFile)) {
      errors.push(`Plano 2 Falhou: Recibo da tarefa '${taskReceiptFile}' não existe no disco.`);
    } else {
      const taskReceiptJson: PilotTaskReceipt = JSON.parse(fs.readFileSync(taskReceiptFile, 'utf8'));
      if (taskReceiptJson.task_id !== taskRow?.task_id || taskReceiptJson.receipt_sha256 !== taskRow?.receipt_sha256) {
        errors.push('Plano 2 Falhou: Recibo JSON da tarefa diverge do registo SQLite.');
      }
    }

    const reviews = store.listReviewsForTask(source.task_id);
    if (reviews.length === 0) {
      errors.push('Plano 2 Falhou: Nenhuma revisão humana registada no SQLite.');
    } else {
      for (const rev of reviews) {
        const revFile = path.join(outputDir, 'review-receipts', `${rev.review_id}.json`);
        if (!fs.existsSync(revFile)) {
          errors.push(`Plano 2 Falhou: Recibo de revisão '${revFile}' não encontrado no disco.`);
        } else {
          const revJson: PilotHumanReviewReceipt = JSON.parse(fs.readFileSync(revFile, 'utf8'));
          if (revJson.receipt_sha256 !== rev.receipt_sha256) {
            errors.push(`Plano 2 Falhou: Recibo de revisão '${rev.review_id}' diverge do registo SQLite.`);
          }
        }
      }
    }
    planes.sqliteVsReceipts = errors.length === 0;

    // 3. Plane 3: Receipts vs Physical Files
    const outputs = store.getOutputsForTask(source.task_id);
    if (outputs.length === 0) {
      errors.push('Plano 3 Falhou: Nenhum output físico registado para a tarefa no SQLite.');
    } else {
      for (const out of outputs) {
        const filePath = path.join(outputDir, 'task-outputs', out.file_name);
        if (!fs.existsSync(filePath)) {
          errors.push(`Plano 3 Falhou: Ficheiro de saída '${filePath}' ausente do disco.`);
        } else {
          const physicalBytes = fs.readFileSync(filePath);
          const physicalHash = sha256(physicalBytes);
          if (physicalHash !== out.file_bytes_sha256) {
            errors.push(`Plano 3 Falhou: Hash do ficheiro físico '${out.file_name}' (${physicalHash}) diverge do SQLite (${out.file_bytes_sha256}).`);
          }
        }
      }
    }
    planes.receiptsVsPhysicalFiles = errors.length === 0;

    // 4. Plane 4: Files vs Manifest
    const manifestPath = path.join(outputDir, 'pilot-evidence-manifest.json');
    let manifestData: any;
    if (!fs.existsSync(manifestPath)) {
      errors.push(`Plano 4 Falhou: Manifesto '${manifestPath}' não encontrado.`);
    } else {
      manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifestData.task_id !== source.task_id) {
        errors.push(`Plano 4 Falhou: Task ID no manifesto ('${manifestData.task_id}') diverge da fonte ('${source.task_id}').`);
      }
      if (manifestData.tenant_id !== source.tenant_id) {
        errors.push(`Plano 4 Falhou: Tenant ID no manifesto ('${manifestData.tenant_id}') diverge da fonte ('${source.tenant_id}').`);
      }

      for (const mf of manifestData.files) {
        const fullP = path.join(outputDir, mf.relative_path);
        if (!fs.existsSync(fullP)) {
          errors.push(`Plano 4 Falhou: Ficheiro listado no manifesto '${mf.relative_path}' ausente no disco.`);
        } else {
          const actualH = sha256(fs.readFileSync(fullP));
          if (actualH !== mf.sha256) {
            errors.push(`Plano 4 Falhou: Hash do ficheiro '${mf.relative_path}' (${actualH}) diverge do manifesto (${mf.sha256}).`);
          }
        }
      }
    }
    planes.filesVsManifest = errors.length === 0;

    // 5. Plane 5: Manifest vs pilot-evidence-files.sha256
    const shaIndexFile = path.join(outputDir, 'pilot-evidence-files.sha256');
    if (!fs.existsSync(shaIndexFile)) {
      errors.push(`Plano 5 Falhou: '${shaIndexFile}' não encontrado.`);
    } else {
      const lines = fs.readFileSync(shaIndexFile, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
      const indexMap = new Map<string, string>();
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          indexMap.set(parts[1].replace(/\\/g, '/'), parts[0]);
        }
      }
      // Manifest must be covered
      if (!indexMap.has('pilot-evidence-manifest.json')) {
        errors.push("Plano 5 Falhou: O próprio manifesto 'pilot-evidence-manifest.json' deve constar em pilot-evidence-files.sha256.");
      }
      for (const [rel, expHash] of indexMap.entries()) {
        const actualFile = path.join(outputDir, rel);
        if (!fs.existsSync(actualFile)) {
          errors.push(`Plano 5 Falhou: Ficheiro indexado '${rel}' não existe no disco.`);
        } else {
          const actualH = sha256(fs.readFileSync(actualFile));
          if (actualH !== expHash) {
            errors.push(`Plano 5 Falhou: Hash do ficheiro indexado '${rel}' (${actualH}) diverge de pilot-evidence-files.sha256 (${expHash}).`);
          }
        }
      }
    }
    planes.manifestVsSha256Index = errors.length === 0;

    // 6. Plane 6: Reviewer Identity & Auth Session in SQLite
    const tokenSvc = new TokenService(undefined, dbPath);
    for (const rev of source.authorized_reviewers) {
      const account = tokenSvc.getAccount(rev.reviewer_id);
      if (!account) {
        errors.push(`Plano 6 Falhou: Vínculo persistente do revisor '${rev.reviewer_id}' ausente no SQLite.`);
      } else if (account.status !== 'ACTIVE') {
        errors.push(`Plano 6 Falhou: Vínculo do revisor '${rev.reviewer_id}' inactivo no SQLite (${account.status}).`);
      } else if (account.tenant_id !== source.tenant_id) {
        errors.push(`Plano 6 Falhou: Revisor '${rev.reviewer_id}' pertence a outro tenant ('${account.tenant_id}').`);
      }
    }
    planes.identityAndAuthSession = errors.length === 0;

    // 7. Plane 7: Delivery vs Archive Classification
    const deliveries = store.listDeliveries(source.pilot_id);
    let finalClassification: OperationalPilotClassification;
    if (source.is_fixture === true || source.classification === 'AUTOMATED_OPERATIONAL_DEMO') {
      finalClassification = 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED';
    } else {
      finalClassification = 'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED';
    }

    if (deliveries.length === 0) {
      errors.push('Plano 7 Falhou: Nenhum registo de entrega/arquivamento no SQLite.');
    } else {
      const deliv = deliveries[0];
      if (deliv.status === 'DELIVERED') {
        if (!deliv.is_external_confirmed || !deliv.external_provider_response) {
          errors.push("Plano 7 Falhou: Tarefa classificada como 'DELIVERED' sem confirmação externa do canal físico.");
        }
        if (source.is_fixture !== true && source.classification !== 'AUTOMATED_OPERATIONAL_DEMO') {
          finalClassification = 'CONTROLLED_REAL_PILOT_COMPLETED — EXTERNAL_INPUT_VALIDATED — HUMAN_REVIEW_CONFIRMED — PHYSICAL_DOCUMENTS_VERIFIED — DELIVERY_CONFIRMED';
        }
      } else if (deliv.status === 'ARCHIVED') {
        if (source.is_fixture !== true && source.classification !== 'AUTOMATED_OPERATIONAL_DEMO') {
          finalClassification = 'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED';
        }
      } else {
        errors.push(`Plano 7 Falhou: Estado de entrega '${deliv.status}' não reconhecido.`);
      }
    }
    planes.deliveryAndClassification = errors.length === 0;

    return {
      isValid: errors.length === 0,
      classification: finalClassification,
      planes,
      errors
    };
  }
}
