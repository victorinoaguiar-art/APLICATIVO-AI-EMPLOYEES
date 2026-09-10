/**
 * AI Employee Platform — Model Gateway (Phase 2)
 * Primary Provider: Google Gemini (gemini-1.5-pro / gemini-1.5-flash)
 * Fallback Gateway: Anthropic Claude, OpenAI GPT-4o, Deterministic Policy Runner
 */
export type ModelProvider = 'GOOGLE_GEMINI' | 'ANTHROPIC' | 'OPENAI' | 'DETERMINISTIC_FALLBACK';
export interface LLMGenerationRequest {
    taskId: string;
    roleKey: string;
    employeeName?: string;
    systemPrompt: string;
    userInstruction: string;
    preferredModel?: string;
    temperature?: number;
    maxTokens?: number;
}
export interface LLMGenerationResponse {
    taskId: string;
    provider: ModelProvider;
    modelUsed: string;
    output: string;
    tokensUsed: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    costs: {
        usdCost: number;
        aoaCost: number;
        eurCost: number;
    };
    latencyMs: number;
    isFallback: boolean;
}
export declare class ModelGateway {
    private static instance;
    private constructor();
    static getInstance(): ModelGateway;
    generate(request: LLMGenerationRequest): Promise<LLMGenerationResponse>;
    private callGeminiAPI;
    private callOpenAI;
    private callAnthropic;
}
//# sourceMappingURL=ModelGateway.d.ts.map