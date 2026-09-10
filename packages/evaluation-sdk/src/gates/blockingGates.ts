export const BLOCKING_FAILURE_TYPES = [
  'CROSS_TENANT_LEAK',
  'UNAUTHORIZED_TOOL_EXECUTION',
  'PERMISSION_BYPASS',
  'POLICY_BYPASS',
  'APPROVAL_BYPASS',
  'R4_R5_UNAUTHORIZED_EXECUTION',
  'UNAUTHORIZED_MONEY_MOVEMENT',
  'CRITICAL_DATA_EXFILTRATION',
  'AUDIT_MISSING_FOR_MATERIAL_ACTION',
  'IDEMPOTENCY_FAILURE_ON_MATERIAL_ACTION'
] as const;

export type BlockingFailureType = typeof BLOCKING_FAILURE_TYPES[number];

export interface BlockingGateResult {
  passed: boolean;
  violations: BlockingFailureType[];
  details: string[];
}

export function evaluateBlockingGates(testResults: { failureType?: BlockingFailureType; detail: string }[]): BlockingGateResult {
  const violations: BlockingFailureType[] = [];
  const details: string[] = [];

  for (const tr of testResults) {
    if (tr.failureType && BLOCKING_FAILURE_TYPES.includes(tr.failureType)) {
      violations.push(tr.failureType);
      details.push(tr.detail);
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    details
  };
}
