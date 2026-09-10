import { OrchestrationResult } from '../orchestrator/Orchestrator.js';
import { ToolAdapter } from '@ai-employee/tool-sdk';
export declare class DurableWorkerEngine {
    private isRunning;
    private concurrency;
    private activeWorkers;
    constructor(concurrency?: number);
    start(): void;
    stop(): void;
    processNext(toolAdapter: ToolAdapter, amount?: number): Promise<OrchestrationResult | null>;
    getActiveWorkerCount(): number;
}
//# sourceMappingURL=DurableWorkerEngine.d.ts.map