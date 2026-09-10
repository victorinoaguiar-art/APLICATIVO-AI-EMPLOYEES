"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePackRegistry = void 0;
const shared_1 = require("@ai-employee/shared");
const catalogDefinitions_js_1 = require("../catalog/catalogDefinitions.js");
const integrityGate_js_1 = require("../catalog/integrityGate.js");
class RolePackRegistry {
    static instance;
    rolesMap = new Map();
    rolesByIdMap = new Map();
    loadedChecksum = '';
    isLoaded = false;
    constructor() { }
    static getInstance() {
        if (!RolePackRegistry.instance) {
            RolePackRegistry.instance = new RolePackRegistry();
            RolePackRegistry.instance.load();
        }
        return RolePackRegistry.instance;
    }
    load(catalog = catalogDefinitions_js_1.CANONICAL_500_ROLES) {
        const gateResult = (0, integrityGate_js_1.runCatalogIntegrityGate)(catalog);
        if (!gateResult.valid) {
            throw new Error(`RolePackRegistry load failed: ${gateResult.message} - ${gateResult.errors.join('; ')}`);
        }
        const newRolesMap = new Map();
        const newRolesByIdMap = new Map();
        for (const rp of catalog) {
            const frozenRp = Object.freeze(JSON.parse(JSON.stringify(rp)));
            newRolesMap.set(rp.role_key, frozenRp);
            newRolesByIdMap.set(rp.id, frozenRp);
        }
        this.loadedChecksum = (0, shared_1.safeHash)(JSON.stringify(catalog));
        this.rolesMap = newRolesMap;
        this.rolesByIdMap = newRolesByIdMap;
        this.isLoaded = true;
    }
    validate() {
        return this.isLoaded && this.rolesMap.size === 500;
    }
    get(roleKey) {
        return this.rolesMap.get(roleKey);
    }
    getById(id) {
        return this.rolesByIdMap.get(id);
    }
    require(roleKey) {
        const rp = this.get(roleKey);
        if (!rp) {
            throw new Error(`RolePack not found for role_key: ${roleKey}`);
        }
        return rp;
    }
    list(filter) {
        let result = Array.from(this.rolesMap.values());
        if (!filter)
            return result;
        if (filter.department) {
            result = result.filter(r => r.department.toLowerCase() === filter.department?.toLowerCase());
        }
        if (filter.lifecycle) {
            result = result.filter(r => r.lifecycle === filter.lifecycle);
        }
        if (filter.capability) {
            result = result.filter(r => r.capabilities.includes(filter.capability));
        }
        if (filter.tool) {
            result = result.filter(r => r.tools.required.includes(filter.tool) || r.tools.optional.includes(filter.tool));
        }
        return result;
    }
    departments() {
        const depts = new Set();
        for (const r of this.rolesMap.values()) {
            depts.add(r.department);
        }
        return Array.from(depts).sort();
    }
    manifest() {
        return {
            count: this.rolesMap.size,
            version: '2.0.0',
            checksum: this.loadedChecksum
        };
    }
    version() {
        return '2.0.0';
    }
    checksum() {
        return this.loadedChecksum;
    }
    reloadAtomic(newCatalog) {
        this.load(newCatalog);
    }
}
exports.RolePackRegistry = RolePackRegistry;
//# sourceMappingURL=RolePackRegistry.js.map