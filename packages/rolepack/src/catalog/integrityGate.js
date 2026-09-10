"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCatalogIntegrityGate = runCatalogIntegrityGate;
const shared_1 = require("@ai-employee/shared");
const catalogDefinitions_js_1 = require("./catalogDefinitions.js");
function runCatalogIntegrityGate(catalog = catalogDefinitions_js_1.CANONICAL_500_ROLES) {
    const errors = [];
    if (catalog.length !== shared_1.EXPECTED_ROLEPACK_COUNT) {
        errors.push(`Count mismatch: expected ${shared_1.EXPECTED_ROLEPACK_COUNT}, got ${catalog.length}`);
    }
    const roleKeys = new Set();
    const ids = new Set();
    for (let i = 0; i < catalog.length; i++) {
        const rp = catalog[i];
        const expectedId = i + 1;
        if (rp.id !== expectedId) {
            errors.push(`RolePack at index ${i} has ID ${rp.id}, expected ${expectedId}`);
        }
        if (ids.has(rp.id)) {
            errors.push(`Duplicate ID found: ${rp.id}`);
        }
        ids.add(rp.id);
        if (roleKeys.has(rp.role_key)) {
            errors.push(`Duplicate role_key found: ${rp.role_key}`);
        }
        roleKeys.add(rp.role_key);
        // Validate autonomy default <= maximum
        const defaultLevelNum = parseInt(rp.autonomy.default.replace('L', ''), 10);
        const maxLevelNum = parseInt(rp.autonomy.maximum.replace('L', ''), 10);
        if (defaultLevelNum > maxLevelNum) {
            errors.push(`RolePack ${rp.role_key} (ID ${rp.id}) default autonomy (${rp.autonomy.default}) exceeds maximum (${rp.autonomy.maximum})`);
        }
        // Validate R4/R5 policy
        if (rp.risk.level === 'R4' || rp.risk.level === 'R5') {
            if (rp.approval_policy === 'AP.NONE') {
                errors.push(`RolePack ${rp.role_key} (ID ${rp.id}) has risk level ${rp.risk.level} but uses AP.NONE approval policy`);
            }
        }
        // Check duplicate tools
        const reqTools = new Set(rp.tools.required);
        for (const optTool of rp.tools.optional) {
            if (reqTools.has(optTool)) {
                errors.push(`RolePack ${rp.role_key} has tool ${optTool} in both required and optional`);
            }
        }
    }
    const valid = errors.length === 0;
    const message = valid
        ? `ROLEPACK CATALOG: ${catalog.length}/500 VALID`
        : `ROLEPACK_CATALOG_INTEGRITY_FAILED (${errors.length} errors found)`;
    return {
        valid,
        actualCount: catalog.length,
        expectedCount: shared_1.EXPECTED_ROLEPACK_COUNT,
        message,
        errors
    };
}
//# sourceMappingURL=integrityGate.js.map