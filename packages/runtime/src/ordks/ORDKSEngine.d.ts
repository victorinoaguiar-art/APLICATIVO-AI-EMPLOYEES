import { KnowledgeItem, ORDKSQueryContext, ORDKSQueryResult } from '@ai-employee/shared';
export declare class ORDKSEngine {
    private profileRegistry;
    private exceptionEngine;
    private knowledgeBase;
    constructor();
    private seedDefaultKnowledgeItems;
    queryKnowledge(context: ORDKSQueryContext): ORDKSQueryResult;
    registerKnowledgeItem(item: KnowledgeItem): void;
}
//# sourceMappingURL=ORDKSEngine.d.ts.map