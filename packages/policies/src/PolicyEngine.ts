import { ToolCallIntent, RiskLevel, AutonomyLevel, ApprovalPolicy } from '@ai-employee/shared';

export interface PolicyEvaluationRequest {
  intent: ToolCallIntent;
  riskLevel: RiskLevel;
  autonomyLevel: AutonomyLevel;
  approvalPolicy: ApprovalPolicy;
  amount?: number;
  externalRecipient?: boolean;
}

export interface PolicyEvaluationResult {
  requiresApproval: boolean;
  policyReason: string;
  evaluatedRisk: RiskLevel;
  policyName: string;
}

export class PolicyEngine {
  public static evaluatePolicy(request: PolicyEvaluationRequest): PolicyEvaluationResult {
    const { intent, riskLevel, autonomyLevel, approvalPolicy, amount, externalRecipient } = request;

    // Rule 1: R4 and R5 risk levels strictly require human approval
    if (riskLevel === 'R4' || riskLevel === 'R5') {
      return {
        requiresApproval: true,
        policyReason: `High-risk operation (${riskLevel}). Human approval is mandatory by system invariant.`,
        evaluatedRisk: riskLevel,
        policyName: 'POL_HIGH_RISK_MANDATORY_APPROVAL'
      };
    }

    // Rule 2: Explicit approval policy requirement
    if (approvalPolicy === 'AP.HUMAN_REQUIRED' || approvalPolicy === 'AP.SUPERVISOR_ONLY' || approvalPolicy === 'AP.TWO_PERSON_RULE') {
      return {
        requiresApproval: true,
        policyReason: `RolePack approval policy is configured as ${approvalPolicy}.`,
        evaluatedRisk: riskLevel,
        policyName: 'POL_ROLEPACK_EXPLICIT_APPROVAL'
      };
    }

    // Rule 3: Monetary transaction threshold policy (> €1,000)
    if (amount !== undefined && amount > 1000) {
      return {
        requiresApproval: true,
        policyReason: `Transaction amount (€${amount}) exceeds maximum autonomous threshold (€1,000).`,
        evaluatedRisk: riskLevel,
        policyName: 'POL_MONETARY_THRESHOLD_APPROVAL'
      };
    }

    // Rule 4: External communication with low autonomy (< L4)
    if (externalRecipient === true && (autonomyLevel === 'L0' || autonomyLevel === 'L1' || autonomyLevel === 'L2' || autonomyLevel === 'L3')) {
      return {
        requiresApproval: true,
        policyReason: `External communication requires minimum autonomy L4 (current: ${autonomyLevel}).`,
        evaluatedRisk: riskLevel,
        policyName: 'POL_EXTERNAL_COMMUNICATION_AUTONOMY_GATE'
      };
    }

    return {
      requiresApproval: false,
      policyReason: 'Operation passed all deterministic safety policy checks.',
      evaluatedRisk: riskLevel,
      policyName: 'POL_DEFAULT_ALLOW'
    };
  }
}
