import {
  MarketplaceListing,
  Publisher,
  Installation,
  PermissionDiff,
  CertificationTier
} from './types';
import { safeUUID } from '@ai-employee/shared';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';

export class MarketplaceManager {
  private publishers: Map<string, Publisher> = new Map();
  private listings: Map<string, MarketplaceListing> = new Map();
  private installations: Map<string, Installation> = new Map();

  constructor() {
    this.seedDefaultPublishers();
    this.seedListingsFromCatalog();
  }

  private seedDefaultPublishers(): void {
    const corePublisher: Publisher = {
      id: 'pub_core_ai_employees',
      name: 'AI Employees Official Studio',
      verified: true,
      email: 'marketplace@ai-employees.internal',
      payoutCurrency: 'USD'
    };
    this.publishers.set(corePublisher.id, corePublisher);
  }

  private seedListingsFromCatalog(): void {
    const publisher = Array.from(this.publishers.values())[0];
    
    CANONICAL_500_ROLES.slice(0, 50).forEach((rp: any) => {
      const riskLevel = (rp.risk?.level || 'R2') as 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
      const maxAutonomy = (rp.autonomy?.default || 'L2') as 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
      const listing: MarketplaceListing = {
        id: `list_${rp.id}_${rp.role_key}`,
        publisherId: publisher.id,
        publisherName: publisher.name,
        roleKey: rp.role_key,
        displayName: rp.display_name,
        department: rp.department,
        version: '1.0.0',
        description: rp.mission,
        certification: riskLevel === 'R4' || riskLevel === 'R5' ? 'Enterprise Certified' : 'Certified',
        riskLevel,
        maxAutonomy,
        pricingModel: 'per_employee',
        unitPrice: riskLevel === 'R5' ? 250 : riskLevel === 'R4' ? 150 : 50,
        currency: 'USD',
        installsCount: Math.floor(Math.random() * 400) + 50,
        rating: 4.8,
        requiredPermissions: rp.permissions || [],
        requiredTools: rp.tools?.required || []
      };
      this.listings.set(listing.id, listing);
    });
  }

  public getListings(departmentFilter?: string, certFilter?: CertificationTier): MarketplaceListing[] {
    let result = Array.from(this.listings.values());
    if (departmentFilter) {
      result = result.filter((l) => l.department.toLowerCase() === departmentFilter.toLowerCase());
    }
    if (certFilter) {
      result = result.filter((l) => l.certification === certFilter);
    }
    return result;
  }

  public getListingByRoleKey(roleKey: string): MarketplaceListing | undefined {
    return Array.from(this.listings.values()).find((l) => l.roleKey === roleKey);
  }

  public computePermissionDiff(currentListing: MarketplaceListing, newListing: MarketplaceListing): PermissionDiff {
    const currentPerms = new Set(currentListing.requiredPermissions);
    const newPerms = new Set(newListing.requiredPermissions);

    const addedPermissions = newListing.requiredPermissions.filter((p) => !currentPerms.has(p));
    const removedPermissions = currentListing.requiredPermissions.filter((p) => !newPerms.has(p));

    const riskRank: Record<string, number> = { R0: 0, R1: 1, R2: 2, R3: 3, R4: 4, R5: 5 };
    const riskEscalated = riskRank[newListing.riskLevel] > riskRank[currentListing.riskLevel];

    const materialConsentRequired = addedPermissions.length > 0 || riskEscalated;

    return {
      addedPermissions,
      removedPermissions,
      riskEscalated,
      oldRisk: currentListing.riskLevel,
      newRisk: newListing.riskLevel,
      materialConsentRequired
    };
  }

  public installListing(tenantId: string, listingId: string, adminUser: string): Installation {
    const listing = this.listings.get(listingId);
    if (!listing) {
      throw new Error(`Marketplace Listing ${listingId} not found.`);
    }

    const installation: Installation = {
      id: safeUUID(),
      tenantId,
      listingId,
      roleKey: listing.roleKey,
      installedVersion: listing.version,
      installedAt: new Date().toISOString(),
      adminConsentBy: adminUser,
      status: 'ACTIVE',
      configuredAutonomy: listing.maxAutonomy
    };

    this.installations.set(installation.id, installation);
    listing.installsCount += 1;
    return installation;
  }

  public getInstallationsForTenant(tenantId: string): Installation[] {
    return Array.from(this.installations.values()).filter((i) => i.tenantId === tenantId);
  }
}
