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
export declare class PolicyEngine {
    static evaluatePolicy(request: PolicyEvaluationRequest): PolicyEvaluationResult;
}
//# sourceMappingURL=PolicyEngine.d.ts.map