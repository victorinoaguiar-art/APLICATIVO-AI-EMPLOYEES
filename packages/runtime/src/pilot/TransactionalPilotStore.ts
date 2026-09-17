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
  OperationalPilotMode
} from '@ai-employee/shared';

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
      incidentCount: getCount('pilot_incidents')
    };
  }

  public clearTablesForTests(): void {
    this.db.exec(`
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
      task.idempotency_key || task.task_id,
      task.requested_by,
      task.human_review_status || 'PENDING_REVIEW',
      task.delivery_status || 'PENDING',
      task.final_status || 'PENDING',
      task.version || 1,
      task.input_snapshot_sha256 || '',
      JSON.stringify(task),
      task.received_at || new Date().toISOString(),
      task.execution_completed_at || new Date().toISOString()
    );
  }

  public updateTask(task: PilotTaskReceipt): void {
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
      task.version || 1,
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
    if (!output.file_bytes || !Buffer.isBuffer(output.file_bytes)) {
      throw new Error(`saveOutput: file_bytes obrigatório e deve ser um Buffer para o output ${output.output_id}`);
    }
    const computedSha = createHash('sha256').update(output.file_bytes).digest('hex');
    if (output.file_bytes_sha256 && output.file_bytes_sha256 !== computedSha) {
      throw new Error(`saveOutput: SHA-256 divergente para output ${output.output_id}: esperado ${output.file_bytes_sha256}, calculado ${computedSha}`);
    }
    const sha = output.file_bytes_sha256 || computedSha;

    // Deactivate prior versions if new active version
    if (output.is_active !== false) {
      this.db.prepare(`UPDATE task_outputs SET is_active = 0 WHERE task_id = ?`).run(output.task_id);
    }
    const stmt = this.db.prepare(`
      INSERT INTO task_outputs (
        output_id, task_id, version, file_name, file_path, file_bytes, file_bytes_sha256, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      output.output_id,
      output.task_id,
      output.version,
      output.file_name,
      output.file_path,
      output.file_bytes,
      sha,
      output.is_active !== false ? 1 : 0,
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

      const verifiedHash = createHash('sha256').update(activeOut.bytes).digest('hex');
      const expectedHash = output.file_bytes_sha256 || createHash('sha256').update(output.file_bytes).digest('hex');

      if (verifiedHash !== expectedHash) {
        throw new Error(`Verificação pós-gravação falhou: SHA-256 divergente no SQLite (esperado ${expectedHash}, lido ${verifiedHash}).`);
      }
    });
  }

  // -------------------------------------------------------------
  // Human Reviews
  // -------------------------------------------------------------
  public saveReview(review: PilotHumanReviewReceipt): void {
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
  // Deliveries
  // -------------------------------------------------------------
  public saveDelivery(delivery: PilotDeliveryReceipt): void {
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
