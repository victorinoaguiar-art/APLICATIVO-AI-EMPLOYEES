import { ExceptionPattern } from '@ai-employee/shared';

export class ExceptionLibraryEngine {
  private static instance: ExceptionLibraryEngine;
  private exceptionPatterns: Map<string, ExceptionPattern> = new Map();

  private constructor() {
    this.seedDefaultExceptions();
  }

  public static getInstance(): ExceptionLibraryEngine {
    if (!ExceptionLibraryEngine.instance) {
      ExceptionLibraryEngine.instance = new ExceptionLibraryEngine();
    }
    return ExceptionLibraryEngine.instance;
  }

  private seedDefaultExceptions(): void {
    const globalExceptions: ExceptionPattern[] = [
      {
        exceptionId: 'exc_glob_001',
        code: 'EXC_VAT_INCONSISTENT',
        title: 'Incompatibilidade na Taxa de IVA Aplicada',
        category: 'DATA_QUALITY',
        symptoms: ['Cálculo de IVA na fatura diverge da taxa legal em vigor (14% vs 7%)'],
        rootCauses: ['Parametrização incorreta no ERP do fornecedor ou isenção não fundamentada'],
        workaroundProcedure: [
          'Solicitar nota de crédito ou fatura retificada',
          'Registar pendência no diário contabilístico provisório'
        ],
        escalationTrigger: 'Divergência monetária superior a 50.000 Kz',
        approvalRequired: 'AP.HUMAN_REQUIRED',
        preventionControl: 'AGT VAT Compliance Validator',
        department: 'Accounting',
        affectedRoleKeys: ['accounts_payable_specialist', 'tax_compliance_specialist']
      },
      {
        exceptionId: 'exc_glob_002',
        code: 'EXC_SUPPLIER_NIF_INVALID',
        title: 'NIF do Fornecedor Não Validado na Base da AGT',
        category: 'POLICY_BREACH',
        symptoms: ['Consulta ao NIF no sistema de validação tributária devolve INATIVO ou INEXISTENTE'],
        rootCauses: ['Erro de dactilografia no NIF ou situação irregular junto do fisco'],
        workaroundProcedure: [
          'Bloquear pagamento ao fornecedor',
          'Notificar departamento de Compras para obter certidão de não devedor'
        ],
        escalationTrigger: 'Emissão de ordens de pagamento para fornecedores sem NIF ativo',
        approvalRequired: 'AP.HUMAN_REQUIRED',
        preventionControl: 'AGT NIF Validation Gate',
        department: 'Procurement',
        affectedRoleKeys: ['accounts_payable_specialist', 'procurement_specialist']
      }
    ];

    for (const exc of globalExceptions) {
      this.exceptionPatterns.set(exc.exceptionId, exc);
    }
  }

  public registerExceptionPattern(pattern: ExceptionPattern): void {
    this.exceptionPatterns.set(pattern.exceptionId, pattern);
  }

  public getExceptionsForDepartment(department: string): ExceptionPattern[] {
    return Array.from(this.exceptionPatterns.values()).filter(
      (exc) => exc.department.toLowerCase() === department.toLowerCase()
    );
  }

  public getAllExceptions(): ExceptionPattern[] {
    return Array.from(this.exceptionPatterns.values());
  }
}
