import { RiskLevel, AutonomyLevel } from '@ai-employee/shared';

export interface ToolOperationSchema {
  key: string;
  description: string;
  sideEffect: boolean;
  riskLevel: RiskLevel;
  requiredPermissions: string[];
  requiredCapabilities: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  timeoutMs: number;
  requiresIdempotency: boolean;
}

export interface ToolManifest {
  toolKey: string;
  name: string;
  provider: string;
  version: string;
  category: string;
  operations: ToolOperationSchema[];
}

export interface ToolExecutionContext {
  organizationId: string;
  employeeId: string;
  taskId: string;
  roleKey: string;
  toolKey: string;
  operation: string;
  permissions: string[];
  autonomyLevel: AutonomyLevel;
  riskLevel: RiskLevel;
  approvalId?: string;
  idempotencyKey: string;
  traceId: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTimeMs: number;
  idempotentReplay: boolean;
}

export interface ToolAdapter {
  manifest(): ToolManifest;
  execute(
    operation: string,
    input: unknown,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult>;
}
