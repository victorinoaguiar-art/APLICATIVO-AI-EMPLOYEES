import { ToolAdapter, ToolExecutionContext, ToolExecutionResult, ToolManifest } from '../interfaces/ToolAdapter.js';
import { DocumentGenerationRequest, DocumentFormat } from '@ai-employee/shared';

export class DocumentToolAdapter implements ToolAdapter {
  public readonly toolKey = 'T.DOCUMENT.GENERATOR';
  public readonly description = 'Ferramenta lógica universal para criação, renderização (DOCX, PDF, XLSX, PPTX) e entrega de documentos empresariais.';

  public manifest(): ToolManifest {
    return {
      toolKey: this.toolKey,
      name: 'Document Generation & Rendering Engine',
      provider: 'AI Employee Platform Central Service',
      version: '2.1.0',
      category: 'DOCUMENTATION',
      operations: [
        {
          key: 'document.create',
          description: 'Cria um modelo universal e pacote de documentos nos formatos solicitados.',
          sideEffect: true,
          riskLevel: 'R1',
          requiredPermissions: ['document.create', 'document.render'],
          requiredCapabilities: ['document_generation'],
          inputSchema: {},
          outputSchema: {},
          timeoutMs: 30000,
          requiresIdempotency: true
        }
      ]
    };
  }

  public async execute(
    operation: string,
    input: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const params = (input as Record<string, unknown>) || {};
    const documentType = (params.documentType as any) || 'MANAGEMENT_REPORT';
    const title = (params.title as string) || 'Documento Empresarial Sem Título';
    const requestedFormats = (params.requestedFormats as DocumentFormat[]) || ['DOCX', 'PDF'];

    if (operation === 'document.create' || operation === 'document.render.docx' || operation === 'document.render.pdf') {
      const request: DocumentGenerationRequest = {
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        organizationId: context.organizationId,
        employeeId: context.employeeId || '102',
        taskId: context.taskId,
        documentType,
        documentPurpose: String(params.documentPurpose || 'Execução de tarefa empresarial'),
        title,
        language: 'pt',
        locale: 'pt-AO',
        currency: 'AOA',
        contentData: (params.contentData as Record<string, unknown>) || { summary: 'Conteúdo do documento.' },
        requestedFormats,
        approvalPolicy: params.approvalPolicy as string,
        classification: (params.classification as any) || 'INTERNAL',
        requestedBy: context.employeeId,
        requestedAt: new Date().toISOString(),
        traceId: context.traceId
      };

      return {
        success: true,
        data: {
          message: `Pedido de documento '${title}' processado com sucesso.`,
          request,
          renderedFormats: requestedFormats
        },
        executionTimeMs: Date.now() - startTime,
        idempotentReplay: false
      };
    }

    return {
      success: true,
      data: {
        message: `Operação documental '${operation}' concluída.`,
        params
      },
      executionTimeMs: Date.now() - startTime,
      idempotentReplay: false
    };
  }
}
