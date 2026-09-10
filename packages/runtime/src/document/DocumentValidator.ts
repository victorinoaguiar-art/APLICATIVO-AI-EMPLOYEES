import {
  UniversalDocument,
  DocumentTable,
  DocumentErrorCode
} from '@ai-employee/shared';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DocumentValidator {
  public static validate(doc: UniversalDocument): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!doc.documentId) {
      errors.push('Identificador do documento ausente.');
    }
    if (!doc.organizationId) {
      errors.push('Identificador da organização ausente.');
    }
    if (!doc.title || doc.title.trim().length === 0) {
      errors.push('Título do documento não pode estar vazio.');
    }
    if (!doc.sections || doc.sections.length === 0) {
      errors.push('O documento deve conter pelo menos uma secção de conteúdo.');
    }

    // Validate table totals if present
    for (const section of doc.sections || []) {
      for (const elem of section.elements || []) {
        if (elem.type === 'table') {
          this.validateTableTotals(elem, warnings);
          this.sanitizeTableFormulas(elem);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateTableTotals(table: DocumentTable, warnings: string[]): void {
    if (!table.totalsRow || table.rows.length === 0) return;

    for (let colIdx = 0; colIdx < table.headers.length; colIdx++) {
      const totalVal = table.totalsRow[colIdx];
      if (typeof totalVal === 'number') {
        let sum = 0;
        let numericCount = 0;
        for (const row of table.rows) {
          const val = row[colIdx];
          if (typeof val === 'number') {
            sum += val;
            numericCount++;
          }
        }
        if (numericCount > 0 && Math.abs(sum - totalVal) > 0.01) {
          warnings.push(
            `Inconsistência de totais na coluna '${table.headers[colIdx]}': Soma dos dados = ${sum}, Total declarado = ${totalVal}`
          );
        }
      }
    }
  }

  private static sanitizeTableFormulas(table: DocumentTable): void {
    for (let r = 0; r < table.rows.length; r++) {
      for (let c = 0; c < table.rows[r].length; c++) {
        const val = table.rows[r][c];
        if (typeof val === 'string' && /^[=+\-@\t\r]/.test(val)) {
          // Neutralize dangerous formula injection prefixes
          table.rows[r][c] = `'${val}`;
        }
      }
    }
  }
}
