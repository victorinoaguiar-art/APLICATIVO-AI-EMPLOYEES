import { ToolAdapter, ToolExecutionContext, ToolExecutionResult, ToolManifest } from '../interfaces/ToolAdapter.js';

export class ORDKSToolAdapter implements ToolAdapter {
  public readonly toolKey = 'T.ORDKS.KNOWLEDGE_QUERY';
  public readonly description = 'Ferramenta lógica universal de consulta à Central de Conhecimento Operacional e Realidade Profissional (ORDKS).';

  public manifest(): ToolManifest {
    return {
      toolKey: this.toolKey,
      name: 'Operational Reality & Domain Knowledge System Adapter',
      provider: 'AI Employee Platform Central Service',
      version: '1.0.0',
      category: 'KNOWLEDGE',
      operations: [
        {
          key: 'ordks.query',
          description: 'Consulta itens de conhecimento com hierarquia de precedência de 11 níveis.',
          sideEffect: false,
          riskLevel: 'R1',
          requiredPermissions: ['knowledge.read'],
          requiredCapabilities: ['knowledge_query'],
          inputSchema: {},
          outputSchema: {},
          timeoutMs: 15000,
          requiresIdempotency: false
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
    const queryText = String(params.queryText || 'procedimentos operacionais');

    return {
      success: true,
      data: {
        message: `Consulta ORDKS concluída para '${queryText}'`,
        organizationId: context.organizationId,
        employeeId: context.employeeId,
        taskId: context.taskId,
        precedenceHierarchy: [
          '1. PLATFORM SAFETY RULES',
          '2. CERTIFIED ROLE PACK CONSTRAINTS',
          '3. APPLICABLE LAW / REGULATION (Angola AGT/PGCA)',
          '4. ORGANIZATION POLICY',
          '5. APPROVED SOP / PROCESS',
          '6. CERTIFIED SYSTEM DOCUMENTATION',
          '7. VERIFIED DOMAIN KNOWLEDGE',
          '8. VERIFIED INDUSTRY KNOWLEDGE',
          '9. VALIDATED CASE LIBRARY',
          '10. VALIDATED OPERATIONAL MEMORY',
          '11. GENERAL MODEL KNOWLEDGE'
        ],
        queryInput: params
      },
      executionTimeMs: Date.now() - startTime,
      idempotentReplay: false
    };
  }
}
