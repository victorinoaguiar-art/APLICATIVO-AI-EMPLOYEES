import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import {
  PilotProgram,
  PilotTaskReceipt,
  PilotHumanReviewReceipt,
  PilotDeliveryReceipt,
  PilotIncident,
  OperationalPilotMode,
  PilotReviewChallenge,
  PilotDocumentValidationReceipt,
  PilotDocumentValidationType
} from '@ai-employee/shared';

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

export class TransactionalPilotStore {
  private db: any;
  private readonly dbPath: string;
  private readonly executionMode: OperationalPilotMode;

  public constructor(customPath?: string, executionMode?: OperationalPilotMode) {
    if (customPath) {
      this.dbPath = customPath;
    } else if (process.env.PILOT_DB_PATH) {
      this.dbPath = process.env.PILOT_DB_PATH;
    } else {
      this.dbPath = ':memory:';
    }

    const mode = executionMode || (process.env.PILOT_MODE as OperationalPilotMode) || 'SIMULATION';
    this.executionMode = mode;
    if ((mode === 'OPERATIONAL_PILOT' || String(mode).toLowerCase() === 'operational') && this.dbPath === ':memory:') {
      throw new Error('Operational pilot requires a persistent SQLite database path, :memory: is forbidden.');
    }

    if (this.dbPath !== ':memory:') {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(this.dbPath);
    this.runMigrations();
  }

  public getDbPath(): string {
    return this.dbPath;
  }

  public getMode(): OperationalPilotMode {
    return this.executionMode;
  }

  public getPersistenceFingerprint(): string {
    if (this.dbPath === ':memory:') {
      return 'sqlite://memory';
    }
    const baseName = path.basename(this.dbPath);
    const pathSha = createHash('sha256').update(this.dbPath).digest('hex').slice(0, 16);
    return `sqlite://${baseName}:${pathSha}`;
  }

  public getDatabaseMetrics(): {
    pilotCount: number;
    taskCount: number;
    outputCount: number;
    reviewCount: number;
    deliveryCount: number;
    incidentCount: number;
    challengeCount?: number;
    validationCount?: number;
  } {
    const getCount = (table: string): number => {
      const row = this.db.prepare(`SELECT count(*) as cnt FROM ${table}`).get() as any;
      return row ? Number(row.cnt) : 0;
    };
    return {
      pilotCount: getCount('pilot_programs'),
      taskCount: getCount('pilot_tasks'),
      outputCount: getCount('task_outputs'),
      reviewCount: getCount('human_reviews'),
      deliveryCount: getCount('pilot_deliveries'),
      incidentCount: getCount('pilot_incidents'),
      challengeCount: getCount('pilot_review_challenges'),
      validationCount: getCount('task_document_validations')
    };
  }

  public clearTablesForTests(): void {
    this.db.exec(`
      DELETE FROM task_document_validations;
      DELETE FROM pilot_review_challenges;
      DELETE FROM pilot_deliveries;
      DELETE FROM human_reviews;
      DELETE FROM task_outputs;
      DELETE FROM pilot_tasks;
      DELETE FROM pilot_incidents;
      DELETE FROM pilot_programs;
    `);
  }

  private runMigrations(): void {
    this.db.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS pilot_programs (
        pilot_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        organization_name TEXT NOT NULL,
        authorization_reference TEXT NOT NULL,
        execution_mode TEXT NOT NULL,
        status TEXT NOT NULL,
        task_limit INTEGER NOT NULL,
        config_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pilot_tasks (
        task_id TEXT PRIMARY KEY,
        pilot_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        employee_id INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        human_review_status TEXT NOT NULL,
        delivery_status TEXT NOT NULL,
        final_status TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        input_snapshot_sha256 TEXT NOT NULL,
        receipt_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(pilot_id, idempotency_key),
        FOREIGN KEY (pilot_id) REFERENCES pilot_programs(pilot_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS task_outputs (
        output_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_bytes BLOB NOT NULL,
        file_bytes_sha256 TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES pilot_tasks(task_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pilot_review_challenges (
        challenge_id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        pilot_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        document_version INTEGER NOT NULL,
        document_sha256 TEXT NOT NULL,
        allowed_decision TEXT,
        reviewer_id TEXT,
        nonce TEXT NOT NULL UNIQUE,
        issued_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        consumed_at TEXT,
        consumption_receipt_sha256 TEXT,
        FOREIGN KEY (task_id) REFERENCES pilot_tasks(task_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS task_document_validations (
        receipt_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        document_version INTEGER NOT NULL,
        validation_type TEXT NOT NULL DEFAULT 'INDEPENDENT_LIBRARY_VALIDATION',
        tenant_id TEXT,
        pilot_id TEXT,
        file_path TEXT,
        format TEXT NOT NULL,
        parser_name TEXT NOT NULL,
        parser_version TEXT NOT NULL,
        file_bytes_sha256 TEXT NOT NULL,
        result TEXT NOT NULL,
        page_or_cell_count INTEGER,
        error TEXT,
        error_details TEXT,
        execution_started_at TEXT,
        execution_completed_at TEXT,
        commit_sha TEXT,
        receipt_sha256 TEXT,
        validated_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES pilot_tasks(task_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pilot_reviewer_sessions (
        session_id TEXT PRIMARY KEY,
        token_jti TEXT NOT NULL UNIQUE,
        reviewer_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        pilot_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS human_reviews (
        review_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        pilot_id TEXT NOT NULL,
        reviewer_id TEXT NOT NULL,
        decision TEXT NOT NULL,
        signature TEXT NOT NULL,
        receipt_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES pilot_tasks(task_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pilot_deliveries (
        delivery_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        pilot_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        status TEXT NOT NULL,
        external_receipt_id TEXT,
        receipt_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES pilot_tasks(task_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pilot_incidents (
        incident_id TEXT PRIMARY KEY,
        pilot_id TEXT NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (pilot_id) REFERENCES pilot_programs(pilot_id) ON DELETE CASCADE
      );
    `);

    // Ensure backwards compatibility if task_outputs existed without file_bytes
    try {
      const cols = this.db.prepare(`PRAGMA table_info(task_outputs)`).all() as any[];
      if (cols.length > 0 && !cols.some(c => c.name === 'file_bytes')) {
        this.db.exec(`ALTER TABLE task_outputs ADD COLUMN file_bytes BLOB NOT NULL DEFAULT (X'')`);
      }
    } catch {
      // Ignored if table fresh
    }

    // Ensure backwards compatibility for task_document_validations columns
    try {
      const valCols = this.db.prepare(`PRAGMA table_info(task_document_validations)`).all() as any[];
      const colNames = new Set(valCols.map(c => c.name));
      if (!colNames.has('validation_type')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN validation_type TEXT NOT NULL DEFAULT 'INDEPENDENT_LIBRARY_VALIDATION'`);
      }
      if (!colNames.has('tenant_id')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN tenant_id TEXT`);
      }
      if (!colNames.has('pilot_id')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN pilot_id TEXT`);
      }
      if (!colNames.has('file_path')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN file_path TEXT`);
      }
      if (!colNames.has('error_details')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN error_details TEXT`);
      }
      if (!colNames.has('execution_started_at')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN execution_started_at TEXT`);
      }
      if (!colNames.has('execution_completed_at')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN execution_completed_at TEXT`);
      }
      if (!colNames.has('commit_sha')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN commit_sha TEXT`);
      }
      if (!colNames.has('receipt_sha256')) {
        this.db.exec(`ALTER TABLE task_document_validations ADD COLUMN receipt_sha256 TEXT`);
      }
    } catch {
      // Ignored if table fresh
    }
  }

  public transaction<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  // -------------------------------------------------------------
  // Pilot Programs
  // -------------------------------------------------------------
  public savePilot(pilot: PilotProgram): void {
    const stmt = this.db.prepare(`
      INSERT INTO pilot_programs (
        pilot_id, tenant_id, organization_name, authorization_reference,
        execution_mode, status, task_limit, config_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      pilot.pilot_id,
      pilot.tenant_id,
      pilot.organization_name,
      pilot.authorization_reference,
      pilot.execution_mode,
      pilot.status || 'CREATED',
      pilot.task_limit || 50,
      JSON.stringify(pilot),
      pilot.created_at || new Date().toISOString(),
      pilot.updated_at || new Date().toISOString()
    );
  }

  public updatePilotStatus(pilot_id: string, status: string): void {
    const existing = this.getPilot(pilot_id);
    const now = new Date().toISOString();
    if (existing) {
      existing.status = status as any;
      existing.updated_at = now;
      const stmt = this.db.prepare(`
        UPDATE pilot_programs SET status = ?, updated_at = ?, config_json = ? WHERE pilot_id = ?
      `);
      stmt.run(status, now, JSON.stringify(existing), pilot_id);
    } else {
      const stmt = this.db.prepare(`
        UPDATE pilot_programs SET status = ?, updated_at = ? WHERE pilot_id = ?
      `);
      stmt.run(status, now, pilot_id);
    }
  }

  public updatePilot(pilot: PilotProgram): void {
    pilot.updated_at = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE pilot_programs
      SET status = ?, authorization_reference = ?, updated_at = ?, config_json = ?
      WHERE pilot_id = ?
    `);
    stmt.run(
      pilot.status,
      pilot.authorization_reference,
      pilot.updated_at,
      JSON.stringify(pilot),
      pilot.pilot_id
    );
  }

  public getPilot(pilot_id: string): PilotProgram | null {
    const stmt = this.db.prepare(`
      SELECT status, config_json FROM pilot_programs WHERE pilot_id = ?
    `);
    const row = stmt.get(pilot_id) as any;
    if (!row) return null;
    const pilot = JSON.parse(row.config_json);
    pilot.status = row.status;
    return pilot;
  }

  // -------------------------------------------------------------
  // Pilot Tasks
  // -------------------------------------------------------------
  public saveTask(task: PilotTaskReceipt): void {
    if (!task) {
      throw new Error('saveTask: objecto task obrigatório.');
    }
    if (!task.task_id || typeof task.task_id !== 'string' || task.task_id.trim() === '') {
      throw new Error("saveTask: 'task_id' obrigatório e não pode ser vazio.");
    }
    if (!task.pilot_id || typeof task.pilot_id !== 'string' || task.pilot_id.trim() === '') {
      throw new Error("saveTask: 'pilot_id' obrigatório e não pode ser vazio.");
    }
    if (!task.tenant_id || typeof task.tenant_id !== 'string' || task.tenant_id.trim() === '') {
      throw new Error("saveTask: 'tenant_id' obrigatório e não pode ser vazio.");
    }
    if (task.employee_id === undefined || task.employee_id === null || typeof task.employee_id !== 'number' || task.employee_id <= 0) {
      throw new Error("saveTask: 'employee_id' obrigatório e deve ser um número positivo.");
    }
    if (!task.idempotency_key || typeof task.idempotency_key !== 'string' || task.idempotency_key.trim() === '') {
      throw new Error("saveTask: 'idempotency_key' obrigatória e não pode ser vazia ou assumida por fallback.");
    }
    if (!task.received_at || typeof task.received_at !== 'string' || isNaN(Date.parse(task.received_at))) {
      throw new Error("saveTask: 'received_at' obrigatório, deve ser data ISO-8601 válida e não pode ser assumido por fallback.");
    }
    if (task.version === undefined || task.version === null || typeof task.version !== 'number' || !Number.isInteger(task.version) || task.version < 1) {
      throw new Error("saveTask: 'version' obrigatória, deve ser inteiro positivo e não pode ser assumida por fallback.");
    }
    if (!task.input_snapshot_sha256 || typeof task.input_snapshot_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(task.input_snapshot_sha256)) {
      throw new Error("saveTask: 'input_snapshot_sha256' obrigatório, deve ser hash SHA-256 hexadecimal de 64 caracteres e não pode ser vazio ou assumido por fallback.");
    }
    if (!task.requested_by || typeof task.requested_by !== 'string' || task.requested_by.trim() === '') {
      throw new Error("saveTask: 'requested_by' obrigatório e não pode ser vazio.");
    }
    if (!task.human_review_status) {
      throw new Error("saveTask: 'human_review_status' obrigatório.");
    }
    if (!task.delivery_status) {
      throw new Error("saveTask: 'delivery_status' obrigatório.");
    }
    if (!task.final_status) {
      throw new Error("saveTask: 'final_status' obrigatório.");
    }
    const executionCompletedAt = task.execution_completed_at;
    if (!executionCompletedAt || typeof executionCompletedAt !== 'string' || isNaN(Date.parse(executionCompletedAt))) {
      throw new Error("saveTask: 'execution_completed_at' obrigatório e deve ser data ISO-8601 válida.");
    }

    const stmt = this.db.prepare(`
      INSERT INTO pilot_tasks (
        task_id, pilot_id, tenant_id, employee_id, idempotency_key,
        requested_by, human_review_status, delivery_status, final_status,
        version, input_snapshot_sha256, receipt_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      task.task_id,
      task.pilot_id,
      task.tenant_id,
      task.employee_id,
      task.idempotency_key,
      task.requested_by,
      task.human_review_status,
      task.delivery_status,
      task.final_status,
      task.version,
      task.input_snapshot_sha256,
      JSON.stringify(task),
      task.received_at,
      executionCompletedAt
    );
  }

  public updateTask(task: PilotTaskReceipt): void {
    if (!task || !task.task_id) {
      throw new Error("updateTask: 'task_id' obrigatório.");
    }
    const existing = this.getTask(task.task_id);
    if (!existing) {
      throw new Error(`updateTask: tarefa '${task.task_id}' não encontrada para atualização.`);
    }

    // Regras de integridade em atualizações
    if (task.idempotency_key !== existing.idempotency_key) {
      throw new Error(`updateTask: violação de integridade. 'idempotency_key' não pode ser alterada após a criação (existente '${existing.idempotency_key}', recebida '${task.idempotency_key}').`);
    }
    if (task.received_at !== existing.received_at) {
      throw new Error(`updateTask: violação de integridade. 'received_at' não pode ser alterado após a criação (existente '${existing.received_at}', recebido '${task.received_at}').`);
    }
    // Validar version do existing sem qualquer fallback
    if (existing.version === undefined || existing.version === null || typeof existing.version !== 'number' || !Number.isInteger(existing.version) || existing.version < 1) {
      throw new Error(`updateTask: versão persistida inválida ou ausente no registo existente para a tarefa '${task.task_id}'.`);
    }

    if (task.version === undefined || task.version === null || typeof task.version !== 'number' || !Number.isInteger(task.version) || task.version < 1) {
      throw new Error("updateTask: 'version' obrigatória e deve ser inteiro positivo.");
    }
    const existingVersion = existing.version;
    if (task.version < existingVersion) {
      throw new Error(`updateTask: redução de versão proibida (existente ${existingVersion}, recebida ${task.version}).`);
    }
    if (task.version > existingVersion + 1) {
      throw new Error(`updateTask: salto de versão injustificado proibido (existente ${existingVersion}, recebida ${task.version}).`);
    }

    // Validar input_snapshot_sha256 obrigatório e imutável
    if (!task.input_snapshot_sha256 || typeof task.input_snapshot_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(task.input_snapshot_sha256)) {
      throw new Error("updateTask: 'input_snapshot_sha256' obrigatório e deve ser hash SHA-256 de 64 caracteres hexadecimais.");
    }
    if (task.input_snapshot_sha256 !== existing.input_snapshot_sha256) {
      throw new Error(`updateTask: alteração ou remoção de 'input_snapshot_sha256' proibida (existente '${existing.input_snapshot_sha256}', recebido '${task.input_snapshot_sha256}').`);
    }

    // Validar congruência entre a coluna relacional do SQLite e o receipt_json existente
    const row = this.db.prepare(`
      SELECT input_snapshot_sha256, version, idempotency_key FROM pilot_tasks WHERE task_id = ?
    `).get(task.task_id) as any;
    if (row) {
      if (row.input_snapshot_sha256 !== existing.input_snapshot_sha256 || row.input_snapshot_sha256 !== task.input_snapshot_sha256) {
        throw new Error(`updateTask: divergência entre a coluna relacional 'input_snapshot_sha256' e o recibo para tarefa '${task.task_id}'.`);
      }
    }

    const stmt = this.db.prepare(`
      UPDATE pilot_tasks SET
        human_review_status = ?,
        delivery_status = ?,
        final_status = ?,
        version = ?,
        receipt_json = ?,
        updated_at = ?
      WHERE task_id = ? AND pilot_id = ?
    `);
    stmt.run(
      task.human_review_status,
      task.delivery_status,
      task.final_status,
      task.version,
      JSON.stringify(task),
      new Date().toISOString(),
      task.task_id,
      task.pilot_id
    );
  }

  public getTask(task_id: string): PilotTaskReceipt | null {
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM pilot_tasks WHERE task_id = ?
    `);
    const row = stmt.get(task_id) as any;
    if (!row) return null;
    return JSON.parse(row.receipt_json);
  }

  public getTaskByIdempotency(pilot_id: string, idempotency_key: string): PilotTaskReceipt | null {
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM pilot_tasks WHERE pilot_id = ? AND idempotency_key = ?
    `);
    const row = stmt.get(pilot_id, idempotency_key) as any;
    if (!row) return null;
    return JSON.parse(row.receipt_json);
  }

  public listTasks(pilot_id?: string): PilotTaskReceipt[] {
    if (pilot_id) {
      const stmt = this.db.prepare(`
        SELECT receipt_json FROM pilot_tasks WHERE pilot_id = ? ORDER BY created_at ASC
      `);
      const rows = stmt.all(pilot_id) as any[];
      return rows.map(r => JSON.parse(r.receipt_json));
    }
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM pilot_tasks ORDER BY created_at ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map(r => JSON.parse(r.receipt_json));
  }

  // -------------------------------------------------------------
  // Task Outputs
  // -------------------------------------------------------------
  public saveOutput(output: {
    output_id: string;
    task_id: string;
    version: number;
    file_name: string;
    file_path: string;
    file_bytes: Buffer;
    file_bytes_sha256?: string;
    is_active?: boolean;
  }): void {
    if (!output) {
      throw new Error('saveOutput: objecto output obrigatório.');
    }
    if (!output.output_id || typeof output.output_id !== 'string' || output.output_id.trim() === '') {
      throw new Error("saveOutput: 'output_id' obrigatório e não pode ser vazio.");
    }
    if (!output.task_id || typeof output.task_id !== 'string' || output.task_id.trim() === '') {
      throw new Error("saveOutput: 'task_id' obrigatório e não pode ser vazio.");
    }
    if (output.version === undefined || output.version === null || typeof output.version !== 'number' || !Number.isInteger(output.version) || output.version < 1) {
      throw new Error("saveOutput: 'version' obrigatória e deve ser inteiro positivo.");
    }
    if (!output.file_bytes || !Buffer.isBuffer(output.file_bytes) || output.file_bytes.length === 0) {
      throw new Error(`saveOutput: file_bytes obrigatório e deve ser Buffer não-vazio para o output ${output.output_id}.`);
    }
    if (!output.file_bytes_sha256 || typeof output.file_bytes_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(output.file_bytes_sha256)) {
      throw new Error(`saveOutput: 'file_bytes_sha256' obrigatório, deve ser hash SHA-256 hexadecimal de 64 caracteres e não pode ser assumido por fallback para output ${output.output_id}.`);
    }

    const computedSha = createHash('sha256').update(output.file_bytes).digest('hex');
    if (output.file_bytes_sha256 !== computedSha) {
      throw new Error(`saveOutput: SHA-256 divergente para output ${output.output_id}: declarado ${output.file_bytes_sha256}, calculado ${computedSha}.`);
    }
    const sha = output.file_bytes_sha256;

    if (!output.file_name || typeof output.file_name !== 'string' || output.file_name.trim() === '') {
      throw new Error("saveOutput: 'file_name' obrigatório e não pode ser vazio.");
    }
    const cleanFileName = output.file_name.trim();
    if (cleanFileName.includes('..') || cleanFileName.includes('/') || cleanFileName.includes('\\')) {
      throw new Error(`saveOutput: Path traversal detectado. Nome de ficheiro de output não pode conter directórios ou '..': '${cleanFileName}'.`);
    }
    if (output.file_path && typeof output.file_path === 'string') {
      const cleanPath = output.file_path.trim();
      if (cleanPath.startsWith('..') || cleanPath.includes('/../') || cleanPath.includes('\\..\\')) {
        throw new Error(`saveOutput: Path traversal detectado em file_path: '${cleanPath}'.`);
      }
    }

    // Check duplicate output_id across different tasks or file names
    const existingOutput = this.db.prepare(`SELECT output_id, task_id, file_name FROM task_outputs WHERE output_id = ?`).get(output.output_id) as { output_id: string; task_id: string; file_name: string } | undefined;
    if (existingOutput && (existingOutput.task_id !== output.task_id || existingOutput.file_name !== cleanFileName)) {
      throw new Error(`saveOutput: output_id '${output.output_id}' já existe para outra tarefa ou ficheiro. Re-utilização de output_id é proibida.`);
    }

    // Check case-insensitive collision in SQLite for the same tenant
    const currentTask = this.db.prepare(`SELECT tenant_id FROM pilot_tasks WHERE task_id = ?`).get(output.task_id) as { tenant_id: string } | undefined;
    if (currentTask) {
      const collision = this.db.prepare(`
        SELECT o.file_name FROM task_outputs o
        JOIN pilot_tasks t ON t.task_id = o.task_id
        WHERE LOWER(o.file_name) = LOWER(?) AND t.tenant_id = ? AND o.output_id != ?
      `).get(cleanFileName, currentTask.tenant_id, output.output_id) as { file_name: string } | undefined;
      if (collision) {
        throw new Error(`saveOutput: Colisão case-insensitive de nome de output no tenant '${currentTask.tenant_id}': '${cleanFileName}' colide com existente '${collision.file_name}'.`);
      }
    }

    // Deactivate prior versions if new active version
    if (output.is_active !== false) {
      this.db.prepare(`UPDATE task_outputs SET is_active = 0 WHERE task_id = ?`).run(output.task_id);
    }
    const stmt = this.db.prepare(`
      INSERT INTO task_outputs (
        output_id, task_id, version, file_name, file_path, file_bytes, file_bytes_sha256, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(output_id) DO UPDATE SET
        task_id=excluded.task_id,
        version=excluded.version,
        file_name=excluded.file_name,
        file_path=excluded.file_path,
        file_bytes=excluded.file_bytes,
        file_bytes_sha256=excluded.file_bytes_sha256,
        is_active=excluded.is_active
    `);
    stmt.run(
      output.output_id,
      output.task_id,
      output.version,
      output.file_name,
      output.file_path,
      output.file_bytes,
      sha,
      output.is_active === false ? 0 : 1,
      new Date().toISOString()
    );
  }

  public getActiveOutput(task_id: string): any | null {
    const stmt = this.db.prepare(`
      SELECT output_id, task_id, version, file_name, file_path, file_bytes_sha256, is_active, created_at
      FROM task_outputs WHERE task_id = ? AND is_active = 1
    `);
    return stmt.get(task_id) || null;
  }

  public getOutputsForTask(task_id: string): any[] {
    const stmt = this.db.prepare(`
      SELECT output_id, task_id, version, file_name, file_path, file_bytes_sha256, is_active, created_at
      FROM task_outputs WHERE task_id = ? ORDER BY version ASC
    `);
    return stmt.all(task_id) as any[];
  }

  public getOutputBytes(output_id: string): Buffer | null {
    const stmt = this.db.prepare(`
      SELECT file_bytes FROM task_outputs WHERE output_id = ?
    `);
    const row = stmt.get(output_id) as any;
    if (!row || !row.file_bytes) return null;
    return Buffer.from(row.file_bytes);
  }

  public getActiveOutputBytes(task_id: string): { output: any; bytes: Buffer } | null {
    const stmt = this.db.prepare(`
      SELECT * FROM task_outputs WHERE task_id = ? AND is_active = 1
    `);
    const row = stmt.get(task_id) as any;
    if (!row) return null;
    return {
      output: {
        output_id: row.output_id,
        task_id: row.task_id,
        version: row.version,
        file_name: row.file_name,
        file_path: row.file_path,
        file_bytes_sha256: row.file_bytes_sha256,
        is_active: Boolean(row.is_active),
        created_at: row.created_at
      },
      bytes: Buffer.from(row.file_bytes)
    };
  }

  public getOutputsForTenant(tenant_id: string, task_id?: string): any[] {
    if (task_id) {
      const stmt = this.db.prepare(`
        SELECT o.output_id, o.task_id, o.version, o.file_name, o.file_path, o.file_bytes_sha256, o.is_active, o.created_at
        FROM task_outputs o
        JOIN pilot_tasks t ON o.task_id = t.task_id
        WHERE t.tenant_id = ? AND o.task_id = ?
        ORDER BY o.version ASC
      `);
      return stmt.all(tenant_id, task_id) as any[];
    }
    const stmt = this.db.prepare(`
      SELECT o.output_id, o.task_id, o.version, o.file_name, o.file_path, o.file_bytes_sha256, o.is_active, o.created_at
      FROM task_outputs o
      JOIN pilot_tasks t ON o.task_id = t.task_id
      WHERE t.tenant_id = ?
      ORDER BY o.created_at ASC
    `);
    return stmt.all(tenant_id) as any[];
  }

  public saveTaskWithOutputAndVerify(
    task: PilotTaskReceipt,
    output: {
      output_id: string;
      task_id: string;
      version: number;
      file_name: string;
      file_path: string;
      file_bytes: Buffer;
      file_bytes_sha256?: string;
      is_active?: boolean;
    }
  ): void {
    this.transaction(() => {
      this.saveTask(task);
      this.saveOutput(output);

      // Releitura atómica imediata para conferência estrita
      const savedTask = this.getTask(task.task_id);
      if (!savedTask) {
        throw new Error(`Verificação pós-gravação falhou: tarefa ${task.task_id} não encontrada após persistência.`);
      }

      const activeOut = this.getActiveOutputBytes(task.task_id);
      if (!activeOut) {
        throw new Error(`Verificação pós-gravação falhou: output ativo de ${task.task_id} não recuperável.`);
      }

      if (!output.file_bytes_sha256 || typeof output.file_bytes_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(output.file_bytes_sha256)) {
        throw new Error(`saveTaskWithOutputAndVerify: 'file_bytes_sha256' obrigatório e deve ser hash SHA-256 de 64 caracteres.`);
      }

      const verifiedHash = createHash('sha256').update(activeOut.bytes).digest('hex');
      const expectedHash = output.file_bytes_sha256;

      if (verifiedHash !== expectedHash) {
        throw new Error(`Verificação pós-gravação falhou: SHA-256 divergente no SQLite (esperado ${expectedHash}, lido ${verifiedHash}).`);
      }
    });
  }

  // -------------------------------------------------------------
  // Human Reviews
  // -------------------------------------------------------------
  public saveReview(review: PilotHumanReviewReceipt): void {
    if (!review) {
      throw new Error('saveReview: objecto review obrigatório.');
    }
    if (!review.review_id || typeof review.review_id !== 'string' || review.review_id.trim() === '') {
      throw new Error("saveReview: 'review_id' obrigatório e não pode ser vazio.");
    }
    if (!review.task_id || typeof review.task_id !== 'string' || review.task_id.trim() === '') {
      throw new Error("saveReview: 'task_id' obrigatório e não pode ser vazio.");
    }
    if (!review.reviewer || typeof review.reviewer !== 'string' || review.reviewer.trim() === '') {
      throw new Error("saveReview: 'reviewer' obrigatório e não pode ser vazio.");
    }
    if (!review.decision || !['APPROVED', 'REJECTED', 'CORRECTION_REQUIRED', 'APPROVED_WITH_CORRECTIONS'].includes(review.decision)) {
      throw new Error(`saveReview: 'decision' inválida '${(review as any).decision}'.`);
    }
    if (!review.review_signature_sha256 || typeof review.review_signature_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(review.review_signature_sha256)) {
      throw new Error("saveReview: 'review_signature_sha256' obrigatório e deve ser SHA-256 de 64 caracteres.");
    }
    if (!review.reviewed_at || typeof review.reviewed_at !== 'string' || isNaN(Date.parse(review.reviewed_at))) {
      throw new Error("saveReview: 'reviewed_at' obrigatório e deve ser data ISO válida.");
    }

    const stmt = this.db.prepare(`
      INSERT INTO human_reviews (
        review_id, task_id, pilot_id, reviewer_id, decision, signature, receipt_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      review.review_id,
      review.task_id,
      review.pilot_id,
      review.reviewer,
      review.decision,
      review.review_signature_sha256,
      JSON.stringify(review),
      review.reviewed_at
    );
  }

  public listReviewsForTask(task_id: string): PilotHumanReviewReceipt[] {
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM human_reviews WHERE task_id = ? ORDER BY created_at ASC
    `);
    const rows = stmt.all(task_id) as any[];
    return rows.map(r => JSON.parse(r.receipt_json));
  }

  public listAllReviews(pilot_id: string): PilotHumanReviewReceipt[] {
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM human_reviews WHERE pilot_id = ? ORDER BY created_at ASC
    `);
    const rows = stmt.all(pilot_id) as any[];
    return rows.map(r => JSON.parse(r.receipt_json));
  }

  // -------------------------------------------------------------
  // Review Challenges (Fase A / Fase B)
  // -------------------------------------------------------------
  public saveReviewChallenge(challenge: PilotReviewChallenge): void {
    const stmt = this.db.prepare(`
      INSERT INTO pilot_review_challenges (
        challenge_id, tenant_id, pilot_id, task_id, document_version,
        document_sha256, allowed_decision, reviewer_id, nonce, issued_at,
        expires_at, status, consumed_at, consumption_receipt_sha256
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(challenge_id) DO UPDATE SET
        tenant_id=excluded.tenant_id,
        pilot_id=excluded.pilot_id,
        task_id=excluded.task_id,
        document_version=excluded.document_version,
        document_sha256=excluded.document_sha256,
        allowed_decision=excluded.allowed_decision,
        reviewer_id=excluded.reviewer_id,
        nonce=excluded.nonce,
        issued_at=excluded.issued_at,
        expires_at=excluded.expires_at,
        status=excluded.status,
        consumed_at=excluded.consumed_at,
        consumption_receipt_sha256=excluded.consumption_receipt_sha256
    `);
    stmt.run(
      challenge.challenge_id,
      challenge.tenant_id,
      challenge.pilot_id,
      challenge.task_id,
      challenge.document_version,
      challenge.document_sha256,
      challenge.allowed_decision,
      challenge.reviewer_id,
      challenge.nonce,
      challenge.issued_at,
      challenge.expires_at,
      challenge.status || 'PENDING',
      challenge.consumed_at || null,
      challenge.consumption_receipt_sha256 || null
    );
  }

  public getReviewChallenge(challenge_id: string): PilotReviewChallenge | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pilot_review_challenges WHERE challenge_id = ?
    `);
    const row = stmt.get(challenge_id) as any;
    if (!row) return null;
    return {
      challenge_id: row.challenge_id,
      tenant_id: row.tenant_id,
      pilot_id: row.pilot_id,
      task_id: row.task_id,
      document_version: row.document_version,
      document_sha256: row.document_sha256,
      allowed_decision: row.allowed_decision,
      reviewer_id: row.reviewer_id,
      nonce: row.nonce,
      issued_at: row.issued_at,
      expires_at: row.expires_at,
      status: row.status,
      consumed_at: row.consumed_at,
      consumption_receipt_sha256: row.consumption_receipt_sha256
    };
  }

  public getPendingChallengeForTask(task_id: string): PilotReviewChallenge | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pilot_review_challenges WHERE task_id = ? AND status = 'PENDING' ORDER BY issued_at DESC LIMIT 1
    `);
    const row = stmt.get(task_id) as any;
    if (!row) return null;
    return {
      challenge_id: row.challenge_id,
      tenant_id: row.tenant_id,
      pilot_id: row.pilot_id,
      task_id: row.task_id,
      document_version: row.document_version,
      document_sha256: row.document_sha256,
      allowed_decision: row.allowed_decision,
      reviewer_id: row.reviewer_id,
      nonce: row.nonce,
      issued_at: row.issued_at,
      expires_at: row.expires_at,
      status: row.status,
      consumed_at: row.consumed_at,
      consumption_receipt_sha256: row.consumption_receipt_sha256
    };
  }

  public consumeReviewChallengeAtomic(
    challenge_id: string,
    reviewReceipt: PilotHumanReviewReceipt,
    task: PilotTaskReceipt
  ): void {
    this.transaction(() => {
      const challenge = this.getReviewChallenge(challenge_id);
      if (!challenge) {
        throw new Error(`Desafio de revisão '${challenge_id}' não encontrado.`);
      }
      if (challenge.status !== 'PENDING') {
        throw new Error(`Desafio de revisão '${challenge_id}' já foi consumido ou invalidado (status: ${challenge.status}).`);
      }
      const now = new Date().toISOString();
      if (now > challenge.expires_at) {
        this.db.prepare(`UPDATE pilot_review_challenges SET status = 'EXPIRED' WHERE challenge_id = ?`).run(challenge_id);
        throw new Error(`Desafio de revisão '${challenge_id}' expirou em ${challenge.expires_at}.`);
      }

      const consumedAt = reviewReceipt.challenge_consumed_at || now;
      reviewReceipt.challenge_consumed_at = consumedAt;
      reviewReceipt.receipt_sha256 = '';
      reviewReceipt.receipt_sha256 = createHash('sha256').update(canonicalJson(reviewReceipt)).digest('hex');

      this.db.prepare(`
        UPDATE pilot_review_challenges
        SET status = 'CONSUMED', consumed_at = ?, consumption_receipt_sha256 = ?
        WHERE challenge_id = ?
      `).run(consumedAt, reviewReceipt.review_signature_sha256, challenge_id);

      this.saveReview(reviewReceipt);
      this.updateTask(task);
    });
  }

  // -------------------------------------------------------------
  // Reviewer Sessions (Pilar 1)
  // -------------------------------------------------------------
  public createReviewerSession(session: {
    session_id: string;
    token_jti: string;
    reviewer_id: string;
    tenant_id: string;
    pilot_id: string;
    status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
    created_at?: string;
    expires_at: string;
  }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO pilot_reviewer_sessions (
        session_id, token_jti, reviewer_id, tenant_id, pilot_id, status, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.session_id,
      session.token_jti,
      session.reviewer_id,
      session.tenant_id,
      session.pilot_id,
      session.status || 'ACTIVE',
      session.created_at || new Date().toISOString(),
      session.expires_at
    );
  }

  public getReviewerSession(sessionId: string): {
    session_id: string;
    token_jti: string;
    reviewer_id: string;
    tenant_id: string;
    pilot_id: string;
    status: string;
    created_at: string;
    expires_at: string;
  } | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pilot_reviewer_sessions WHERE session_id = ?
    `);
    const row = stmt.get(sessionId) as any;
    if (!row) return null;
    return {
      session_id: row.session_id,
      token_jti: row.token_jti,
      reviewer_id: row.reviewer_id,
      tenant_id: row.tenant_id,
      pilot_id: row.pilot_id,
      status: row.status,
      created_at: row.created_at,
      expires_at: row.expires_at
    };
  }

  public getActiveSessionForToken(
    tokenJti: string,
    tenantId?: string,
    reviewerId?: string,
    pilotId?: string
  ): {
    session_id: string;
    token_jti: string;
    reviewer_id: string;
    tenant_id: string;
    pilot_id: string;
    status: string;
    created_at: string;
    expires_at: string;
  } | null {
    let row: any;
    if (tenantId && reviewerId && pilotId) {
      const stmt = this.db.prepare(`
        SELECT * FROM pilot_reviewer_sessions
        WHERE token_jti = ? AND tenant_id = ? AND reviewer_id = ? AND pilot_id = ? AND status = 'ACTIVE'
      `);
      row = stmt.get(tokenJti, tenantId, reviewerId, pilotId);
    } else {
      const stmt = this.db.prepare(`
        SELECT * FROM pilot_reviewer_sessions
        WHERE token_jti = ? AND status = 'ACTIVE'
      `);
      row = stmt.get(tokenJti);
    }
    if (!row) return null;
    const now = new Date().toISOString();
    if (now > row.expires_at) {
      this.db.prepare(`UPDATE pilot_reviewer_sessions SET status = 'EXPIRED' WHERE session_id = ?`).run(row.session_id);
      return null;
    }
    return {
      session_id: row.session_id,
      token_jti: row.token_jti,
      reviewer_id: row.reviewer_id,
      tenant_id: row.tenant_id,
      pilot_id: row.pilot_id,
      status: row.status,
      created_at: row.created_at,
      expires_at: row.expires_at
    };
  }

  // -------------------------------------------------------------
  // Document Validations (Pilar 5: Pré-revisão e Auditoria)
  // -------------------------------------------------------------
  public saveDocumentValidationReceipt(receipt: PilotDocumentValidationReceipt): void {
    if (!receipt) {
      throw new Error('saveDocumentValidationReceipt: objecto receipt obrigatório.');
    }
    if (!receipt.receipt_id || typeof receipt.receipt_id !== 'string' || receipt.receipt_id.trim() === '') {
      throw new Error("saveDocumentValidationReceipt: 'receipt_id' obrigatório e não pode ser vazio.");
    }
    if (!receipt.task_id || typeof receipt.task_id !== 'string' || receipt.task_id.trim() === '') {
      throw new Error("saveDocumentValidationReceipt: 'task_id' obrigatório e não pode ser vazio.");
    }
    if (receipt.document_version === undefined || receipt.document_version === null || typeof receipt.document_version !== 'number' || !Number.isInteger(receipt.document_version) || receipt.document_version < 1) {
      throw new Error("saveDocumentValidationReceipt: 'document_version' obrigatório e deve ser inteiro positivo.");
    }
    if (!receipt.format || typeof receipt.format !== 'string' || receipt.format.trim() === '') {
      throw new Error("saveDocumentValidationReceipt: 'format' obrigatório.");
    }
    if (!receipt.parser_name || typeof receipt.parser_name !== 'string' || receipt.parser_name.trim() === '') {
      throw new Error("saveDocumentValidationReceipt: 'parser_name' obrigatório.");
    }
    if (!receipt.parser_version || typeof receipt.parser_version !== 'string' || receipt.parser_version.trim() === '') {
      throw new Error("saveDocumentValidationReceipt: 'parser_version' obrigatório.");
    }
    if (!receipt.file_bytes_sha256 || typeof receipt.file_bytes_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(receipt.file_bytes_sha256)) {
      throw new Error("saveDocumentValidationReceipt: 'file_bytes_sha256' obrigatório e deve ser hash SHA-256 de 64 caracteres.");
    }
    if (!receipt.result || !['PASS', 'FAIL'].includes(receipt.result)) {
      throw new Error(`saveDocumentValidationReceipt: 'result' deve ser PASS ou FAIL (recebido: '${receipt.result}').`);
    }
    if (!receipt.validated_at || typeof receipt.validated_at !== 'string' || isNaN(Date.parse(receipt.validated_at))) {
      throw new Error("saveDocumentValidationReceipt: 'validated_at' obrigatório e deve ser data ISO válida.");
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO task_document_validations (
        receipt_id, task_id, document_version, validation_type, tenant_id,
        pilot_id, file_path, format, parser_name, parser_version,
        file_bytes_sha256, result, page_or_cell_count, error, error_details,
        execution_started_at, execution_completed_at, commit_sha, receipt_sha256,
        validated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      receipt.receipt_id,
      receipt.task_id,
      receipt.document_version,
      receipt.validation_type || 'INDEPENDENT_LIBRARY_VALIDATION',
      receipt.tenant_id || null,
      receipt.pilot_id || null,
      receipt.file_path || null,
      receipt.format,
      receipt.parser_name,
      receipt.parser_version,
      receipt.file_bytes_sha256,
      receipt.result,
      receipt.page_or_cell_count || null,
      receipt.error || null,
      receipt.error_details || receipt.error || null,
      receipt.execution_started_at || null,
      receipt.execution_completed_at || null,
      receipt.commit_sha || null,
      receipt.receipt_sha256 || null,
      receipt.validated_at
    );
  }

  public getDocumentValidationReceipt(
    task_id: string,
    version: number,
    validationType?: PilotDocumentValidationType
  ): PilotDocumentValidationReceipt | null {
    let row: any;
    if (validationType) {
      const stmt = this.db.prepare(`
        SELECT * FROM task_document_validations
        WHERE task_id = ? AND document_version = ? AND validation_type = ?
      `);
      row = stmt.get(task_id, version, validationType);
    } else {
      const stmt = this.db.prepare(`
        SELECT * FROM task_document_validations
        WHERE task_id = ? AND document_version = ?
        ORDER BY CASE WHEN validation_type = 'INDEPENDENT_LIBRARY_VALIDATION' THEN 1 ELSE 2 END ASC
        LIMIT 1
      `);
      row = stmt.get(task_id, version);
    }
    if (!row) return null;
    return {
      receipt_id: row.receipt_id,
      validation_id: row.receipt_id,
      task_id: row.task_id,
      document_version: row.document_version,
      validation_type: row.validation_type as PilotDocumentValidationType,
      tenant_id: row.tenant_id,
      pilot_id: row.pilot_id,
      file_path: row.file_path,
      format: row.format,
      parser_name: row.parser_name,
      parser_version: row.parser_version,
      file_bytes_sha256: row.file_bytes_sha256,
      result: row.result,
      is_valid: row.result === 'PASS',
      page_or_cell_count: row.page_or_cell_count,
      error: row.error,
      error_details: row.error_details,
      execution_started_at: row.execution_started_at,
      execution_completed_at: row.execution_completed_at,
      commit_sha: row.commit_sha,
      receipt_sha256: row.receipt_sha256,
      validated_at: row.validated_at
    };
  }

  public getDocumentValidationReceipts(task_id: string, version: number): PilotDocumentValidationReceipt[] {
    const stmt = this.db.prepare(`
      SELECT * FROM task_document_validations
      WHERE task_id = ? AND document_version = ?
      ORDER BY validation_type ASC
    `);
    const rows = stmt.all(task_id, version) as any[];
    return rows.map(row => ({
      receipt_id: row.receipt_id,
      validation_id: row.receipt_id,
      task_id: row.task_id,
      document_version: row.document_version,
      validation_type: row.validation_type as PilotDocumentValidationType,
      tenant_id: row.tenant_id,
      pilot_id: row.pilot_id,
      file_path: row.file_path,
      format: row.format,
      parser_name: row.parser_name,
      parser_version: row.parser_version,
      file_bytes_sha256: row.file_bytes_sha256,
      result: row.result,
      is_valid: row.result === 'PASS',
      page_or_cell_count: row.page_or_cell_count,
      error: row.error,
      error_details: row.error_details,
      execution_started_at: row.execution_started_at,
      execution_completed_at: row.execution_completed_at,
      commit_sha: row.commit_sha,
      receipt_sha256: row.receipt_sha256,
      validated_at: row.validated_at
    }));
  }

  public hasBothValidationsPassed(task_id: string, version: number, expectedHash?: string): boolean {
    const receipts = this.getDocumentValidationReceipts(task_id, version);
    const struct = receipts.find(r => r.validation_type === 'INTERNAL_STRUCTURAL_VALIDATION');
    const indep = receipts.find(r => r.validation_type === 'INDEPENDENT_LIBRARY_VALIDATION');

    if (!struct || !indep) return false;
    if (struct.result !== 'PASS' || indep.result !== 'PASS') return false;
    if (struct.file_bytes_sha256 !== indep.file_bytes_sha256) return false;
    if (expectedHash && (struct.file_bytes_sha256 !== expectedHash || indep.file_bytes_sha256 !== expectedHash)) {
      return false;
    }
    return true;
  }

  public getAllDocumentValidationReceipts(task_id?: string): PilotDocumentValidationReceipt[] {
    if (task_id) {
      const stmt = this.db.prepare(`
        SELECT * FROM task_document_validations WHERE task_id = ? ORDER BY document_version ASC
      `);
      return (stmt.all(task_id) as any[]).map(r => ({
        receipt_id: r.receipt_id,
        validation_id: r.receipt_id,
        task_id: r.task_id,
        document_version: r.document_version,
        validation_type: r.validation_type as PilotDocumentValidationType,
        tenant_id: r.tenant_id,
        pilot_id: r.pilot_id,
        file_path: r.file_path,
        format: r.format,
        parser_name: r.parser_name,
        parser_version: r.parser_version,
        file_bytes_sha256: r.file_bytes_sha256,
        result: r.result,
        is_valid: r.result === 'PASS',
        page_or_cell_count: r.page_or_cell_count,
        error: r.error,
        error_details: r.error_details,
        execution_started_at: r.execution_started_at,
        execution_completed_at: r.execution_completed_at,
        commit_sha: r.commit_sha,
        receipt_sha256: r.receipt_sha256,
        validated_at: r.validated_at
      }));
    }
    const stmt = this.db.prepare(`
      SELECT * FROM task_document_validations ORDER BY validated_at ASC
    `);
    return (stmt.all() as any[]).map(r => ({
      receipt_id: r.receipt_id,
      validation_id: r.receipt_id,
      task_id: r.task_id,
      document_version: r.document_version,
      validation_type: r.validation_type as PilotDocumentValidationType,
      tenant_id: r.tenant_id,
      pilot_id: r.pilot_id,
      file_path: r.file_path,
      format: r.format,
      parser_name: r.parser_name,
      parser_version: r.parser_version,
      file_bytes_sha256: r.file_bytes_sha256,
      result: r.result,
      is_valid: r.result === 'PASS',
      page_or_cell_count: r.page_or_cell_count,
      error: r.error,
      error_details: r.error_details,
      execution_started_at: r.execution_started_at,
      execution_completed_at: r.execution_completed_at,
      commit_sha: r.commit_sha,
      receipt_sha256: r.receipt_sha256,
      validated_at: r.validated_at
    }));
  }

  // -------------------------------------------------------------
  // Deliveries
  // -------------------------------------------------------------
  public saveDelivery(delivery: PilotDeliveryReceipt): void {
    if (!delivery) {
      throw new Error('saveDelivery: objecto delivery obrigatório.');
    }
    if (!delivery.delivery_id || typeof delivery.delivery_id !== 'string' || delivery.delivery_id.trim() === '') {
      throw new Error("saveDelivery: 'delivery_id' obrigatório e não pode ser vazio.");
    }
    if (!delivery.task_id || typeof delivery.task_id !== 'string' || delivery.task_id.trim() === '') {
      throw new Error("saveDelivery: 'task_id' obrigatório e não pode ser vazio.");
    }
    if (!delivery.pilot_id || typeof delivery.pilot_id !== 'string' || delivery.pilot_id.trim() === '') {
      throw new Error("saveDelivery: 'pilot_id' obrigatório e não pode ser vazio.");
    }
    if (!delivery.tenant_id || typeof delivery.tenant_id !== 'string' || delivery.tenant_id.trim() === '') {
      throw new Error("saveDelivery: 'tenant_id' obrigatório e não pode ser vazio.");
    }
    if (!delivery.channel || typeof delivery.channel !== 'string' || delivery.channel.trim() === '') {
      throw new Error("saveDelivery: 'channel' obrigatório e não pode ser vazio.");
    }
    if (!delivery.status || typeof delivery.status !== 'string' || delivery.status.trim() === '') {
      throw new Error("saveDelivery: 'status' obrigatório e não pode ser vazio.");
    }
    if (!delivery.delivered_at || typeof delivery.delivered_at !== 'string' || isNaN(Date.parse(delivery.delivered_at))) {
      throw new Error("saveDelivery: 'delivered_at' obrigatório e deve ser data ISO válida.");
    }

    const stmt = this.db.prepare(`
      INSERT INTO pilot_deliveries (
        delivery_id, task_id, pilot_id, tenant_id, channel, status,
        external_receipt_id, receipt_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      delivery.delivery_id,
      delivery.task_id,
      delivery.pilot_id,
      delivery.tenant_id,
      delivery.channel,
      delivery.status,
      delivery.external_provider_response?.external_id || null,
      JSON.stringify(delivery),
      delivery.delivered_at
    );
  }

  public getDeliveryForTask(task_id: string): PilotDeliveryReceipt | null {
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM pilot_deliveries WHERE task_id = ?
    `);
    const row = stmt.get(task_id) as any;
    if (!row) return null;
    return JSON.parse(row.receipt_json);
  }

  public listDeliveries(pilot_id?: string): PilotDeliveryReceipt[] {
    if (pilot_id) {
      const stmt = this.db.prepare(`
        SELECT receipt_json FROM pilot_deliveries WHERE pilot_id = ? ORDER BY created_at ASC
      `);
      const rows = stmt.all(pilot_id) as any[];
      return rows.map(r => JSON.parse(r.receipt_json));
    }
    const stmt = this.db.prepare(`
      SELECT receipt_json FROM pilot_deliveries ORDER BY created_at ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map(r => JSON.parse(r.receipt_json));
  }

  // -------------------------------------------------------------
  // Incidents
  // -------------------------------------------------------------
  public recordIncident(incident: PilotIncident): void {
    const stmt = this.db.prepare(`
      INSERT INTO pilot_incidents (
        incident_id, pilot_id, type, severity, details, resolved, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      incident.incident_id,
      incident.pilot_id,
      incident.type,
      incident.severity,
      incident.details,
      incident.resolved ? 1 : 0,
      incident.timestamp
    );
  }

  public listIncidents(pilot_id?: string): PilotIncident[] {
    if (pilot_id) {
      const stmt = this.db.prepare(`
        SELECT * FROM pilot_incidents WHERE pilot_id = ? ORDER BY created_at ASC
      `);
      const rows = stmt.all(pilot_id) as any[];
      return rows.map(r => ({
        incident_id: r.incident_id,
        pilot_id: r.pilot_id,
        timestamp: r.created_at,
        type: r.type,
        severity: r.severity,
        details: r.details,
        resolved: Boolean(r.resolved)
      }));
    }
    const stmt = this.db.prepare(`
      SELECT * FROM pilot_incidents ORDER BY created_at ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map(r => ({
      incident_id: r.incident_id,
      pilot_id: r.pilot_id,
      timestamp: r.created_at,
      type: r.type,
      severity: r.severity,
      details: r.details,
      resolved: Boolean(r.resolved)
    }));
  }

  public close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
