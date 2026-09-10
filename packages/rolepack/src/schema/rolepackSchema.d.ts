export declare const ROLEPACK_SCHEMA_V2: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        schema_version: {
            type: string;
        };
        id: {
            type: string;
            minimum: number;
        };
        role_key: {
            type: string;
            pattern: string;
        };
        display_name: {
            type: string;
            minLength: number;
        };
        department: {
            type: string;
        };
        archetypes: {
            type: string;
            minItems: number;
            items: {
                type: string;
                enum: string[];
            };
        };
        mission: {
            type: string;
            minLength: number;
        };
        inputs: {
            type: string;
        };
        outputs: {
            type: string;
        };
        capabilities: {
            type: string;
        };
        tools: {
            type: string;
            required: string[];
            properties: {
                required: {
                    type: string;
                };
                optional: {
                    type: string;
                };
            };
        };
        permissions: {
            type: string;
        };
        autonomy: {
            type: string;
            required: string[];
            properties: {
                default: {
                    type: string;
                };
                maximum: {
                    type: string;
                };
            };
        };
        risk: {
            type: string;
            required: string[];
            properties: {
                level: {
                    type: string;
                };
                controls: {
                    type: string;
                };
            };
        };
        approval_policy: {
            type: string;
        };
        events: {
            type: string;
            required: string[];
            properties: {
                triggers: {
                    type: string;
                };
                emits: {
                    type: string;
                };
            };
        };
        workflow: {
            type: string;
            required: string[];
            properties: {
                primary: {
                    type: string;
                };
            };
        };
        kpis: {
            type: string;
        };
        acceptance_tests: {
            type: string;
        };
        version: {
            type: string;
        };
        lifecycle: {
            type: string;
        };
        metadata: {
            type: string;
        };
    };
};
//# sourceMappingURL=rolepackSchema.d.ts.map