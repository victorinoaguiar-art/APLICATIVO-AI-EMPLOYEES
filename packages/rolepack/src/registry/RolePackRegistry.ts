import { RolePack, RiskLevel, AutonomyLevel, safeHash } from '@ai-employee/shared';
import { CANONICAL_500_ROLES } from '../catalog/catalogDefinitions.js';
import { runCatalogIntegrityGate } from '../catalog/integrityGate.js';

export interface RolePackFilter {
  department?: string;
  lifecycle?: string;
  minRisk?: RiskLevel;
  maxRisk?: RiskLevel;
  capability?: string;
  tool?: string;
  autonomy?: AutonomyLevel;
}

export class RolePackRegistry {
  private static instance: RolePackRegistry;
  private rolesMap: Map<string, RolePack> = new Map();
  private rolesByIdMap: Map<number, RolePack> = new Map();
  private loadedChecksum: string = '';
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): RolePackRegistry {
    if (!RolePackRegistry.instance) {
      RolePackRegistry.instance = new RolePackRegistry();
      RolePackRegistry.instance.load();
    }
    return RolePackRegistry.instance;
  }

  public load(catalog: RolePack[] = CANONICAL_500_ROLES): void {
    const gateResult = runCatalogIntegrityGate(catalog);
    if (!gateResult.valid) {
      throw new Error(`RolePackRegistry load failed: ${gateResult.message} - ${gateResult.errors.join('; ')}`);
    }

    const newRolesMap = new Map<string, RolePack>();
    const newRolesByIdMap = new Map<number, RolePack>();

    for (const rp of catalog) {
      const frozenRp = Object.freeze(JSON.parse(JSON.stringify(rp)));
      newRolesMap.set(rp.role_key, frozenRp);
      newRolesByIdMap.set(rp.id, frozenRp);
    }

    this.loadedChecksum = safeHash(JSON.stringify(catalog));

    this.rolesMap = newRolesMap;
    this.rolesByIdMap = newRolesByIdMap;
    this.isLoaded = true;
  }

  public validate(): boolean {
    return this.isLoaded && this.rolesMap.size === 500;
  }

  public get(roleKey: string): RolePack | undefined {
    return this.rolesMap.get(roleKey);
  }

  public getById(id: number): RolePack | undefined {
    return this.rolesByIdMap.get(id);
  }

  public require(roleKey: string): RolePack {
    const rp = this.get(roleKey);
    if (!rp) {
      throw new Error(`RolePack not found for role_key: ${roleKey}`);
    }
    return rp;
  }

  public list(filter?: RolePackFilter): RolePack[] {
    let result = Array.from(this.rolesMap.values());
    if (!filter) return result;

    if (filter.department) {
      result = result.filter(r => r.department.toLowerCase() === filter.department?.toLowerCase());
    }
    if (filter.lifecycle) {
      result = result.filter(r => r.lifecycle === filter.lifecycle);
    }
    if (filter.capability) {
      result = result.filter(r => r.capabilities.includes(filter.capability!));
    }
    if (filter.tool) {
      result = result.filter(r => r.tools.required.includes(filter.tool!) || r.tools.optional.includes(filter.tool!));
    }

    return result;
  }

  public departments(): string[] {
    const depts = new Set<string>();
    for (const r of this.rolesMap.values()) {
      depts.add(r.department);
    }
    return Array.from(depts).sort();
  }

  public manifest(): { count: number; version: string; checksum: string } {
    return {
      count: this.rolesMap.size,
      version: '2.0.0',
      checksum: this.loadedChecksum
    };
  }

  public version(): string {
    return '2.0.0';
  }

  public checksum(): string {
    return this.loadedChecksum;
  }

  public reloadAtomic(newCatalog: RolePack[]): void {
    this.load(newCatalog);
  }
}
