import { ToolCallIntent } from '@ai-employee/shared';
export declare class SnapshotHasher {
    static hashIntent(intent: ToolCallIntent): string;
    static verifySnapshot(intent: ToolCallIntent, expectedHash: string): boolean;
}
//# sourceMappingURL=SnapshotHasher.d.ts.map