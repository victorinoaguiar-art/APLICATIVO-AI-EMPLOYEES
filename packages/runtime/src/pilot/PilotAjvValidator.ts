import * as fs from 'node:fs';
import * as path from 'node:path';

export interface AjvValidationErrorDetail {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  message?: string;
  params?: any;
}

export class PilotAjvValidator {
  private ajv: any;
  private taskValidator: any;
  private docValidationValidator: any;
  private humanReviewValidator: any;
  private deliveryValidator: any;
  private manifestValidator: any;
  private schemasDir: string;

  constructor(customSchemasDir?: string, customAjv?: any) {
    if (customAjv === null) {
      throw new Error('Ajv indisponível ou desativado.');
    }

    if (customAjv) {
      this.ajv = customAjv;
    } else {
      try {
        const AjvClass = require('ajv');
        const addFormats = require('ajv-formats');
        this.ajv = new AjvClass({ allErrors: true, strict: false });
        addFormats(this.ajv);
      } catch (err: any) {
        throw new Error(`Ajv indisponível: ${err.message}`);
      }
    }

    this.schemasDir = customSchemasDir || this.resolveSchemasDir();
    this.compileAllSchemas();
  }

  private resolveSchemasDir(): string {
    const candidates = [
      path.resolve(process.cwd(), 'schemas/pilot'),
      path.resolve(process.cwd(), '../../schemas/pilot'),
      path.resolve(__dirname, '../../../../schemas/pilot'),
      path.resolve(__dirname, '../../../schemas/pilot'),
      path.resolve(__dirname, '../../schemas/pilot')
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        return cand;
      }
    }
    throw new Error(`Directório de schemas não encontrado. Procurado em: ${candidates.join(', ')}`);
  }

  private loadSchema(fileName: string): any {
    const filePath = path.join(this.schemasDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Schema ausente: '${filePath}' não encontrado.`);
    }
    try {
      const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
      return JSON.parse(content);
    } catch (err: any) {
      throw new Error(`Schema corrompido ou JSON inválido em '${filePath}': ${err.message}`);
    }
  }

  private compileAllSchemas(): void {
    const taskSchema = this.loadSchema('pilot-task-receipt.schema.json');
    this.taskValidator = this.compileSchema(taskSchema, 'pilot-task-receipt.schema.json');

    const docSchema = this.loadSchema('pilot-document-validation-receipt.schema.json');
    this.docValidationValidator = this.compileSchema(docSchema, 'pilot-document-validation-receipt.schema.json');

    const reviewSchema = this.loadSchema('pilot-human-review-receipt.schema.json');
    this.humanReviewValidator = this.compileSchema(reviewSchema, 'pilot-human-review-receipt.schema.json');

    const deliverySchema = this.loadSchema('pilot-delivery-receipt.schema.json');
    this.deliveryValidator = this.compileSchema(deliverySchema, 'pilot-delivery-receipt.schema.json');

    const manifestSchema = this.loadSchema('pilot-evidence-manifest.schema.json');
    this.manifestValidator = this.compileSchema(manifestSchema, 'pilot-evidence-manifest.schema.json');
  }

  private compileSchema(schema: any, schemaName: string): any {
    try {
      return this.ajv.compile(schema);
    } catch (err: any) {
      throw new Error(`Falha ao compilar schema Ajv '${schemaName}': ${err.message}`);
    }
  }

  private formatErrors(validator: any, filePath: string, schemaName: string): string {
    const errors = validator.errors || [];
    const details = errors.map((e: any) =>
      `[instancePath: '${e.instancePath}', schemaPath: '${e.schemaPath}']: ${e.message}`
    ).join('; ');
    return `Validação Ajv falhou para ficheiro '${filePath}' com schema '${schemaName}': ${details}`;
  }

  public validateTaskReceipt(data: any, filePath: string = 'task-receipt.json'): void {
    if (!data || typeof data !== 'object') {
      throw new Error(`Validação Ajv falhou: payload de tarefa não é objecto em '${filePath}'.`);
    }
    const valid = this.taskValidator(data);
    if (!valid) {
      throw new Error(this.formatErrors(this.taskValidator, filePath, 'pilot-task-receipt.schema.json'));
    }
  }

  public validateDocumentValidationReceipt(data: any, filePath: string = 'document-validation-receipt.json'): void {
    if (!data || typeof data !== 'object') {
      throw new Error(`Validação Ajv falhou: payload de validação documental não é objecto em '${filePath}'.`);
    }
    const valid = this.docValidationValidator(data);
    if (!valid) {
      throw new Error(this.formatErrors(this.docValidationValidator, filePath, 'pilot-document-validation-receipt.schema.json'));
    }
  }

  public validateHumanReviewReceipt(data: any, filePath: string = 'review-receipt.json'): void {
    if (!data || typeof data !== 'object') {
      throw new Error(`Validação Ajv falhou: payload de revisão não é objecto em '${filePath}'.`);
    }
    const valid = this.humanReviewValidator(data);
    if (!valid) {
      throw new Error(this.formatErrors(this.humanReviewValidator, filePath, 'pilot-human-review-receipt.schema.json'));
    }
  }

  public validateDeliveryReceipt(data: any, filePath: string = 'delivery-receipt.json'): void {
    if (!data || typeof data !== 'object') {
      throw new Error(`Validação Ajv falhou: payload de entrega não é objecto em '${filePath}'.`);
    }
    const valid = this.deliveryValidator(data);
    if (!valid) {
      throw new Error(this.formatErrors(this.deliveryValidator, filePath, 'pilot-delivery-receipt.schema.json'));
    }
  }

  public validateEvidenceManifest(data: any, filePath: string = 'pilot-evidence-manifest.json'): void {
    if (!data || typeof data !== 'object') {
      throw new Error(`Validação Ajv falhou: payload de manifesto não é objecto em '${filePath}'.`);
    }
    const valid = this.manifestValidator(data);
    if (!valid) {
      throw new Error(this.formatErrors(this.manifestValidator, filePath, 'pilot-evidence-manifest.schema.json'));
    }
  }
}
