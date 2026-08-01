import type { CanonicalEntityRegistration, RegistryQuery } from "@/types/enterprise-data";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import type { ServiceContext } from "@/types/services";

export type RegistryStats = {
  readonly organizationId: string;
  readonly registeredEntityTypes: number;
  readonly totalMasterEntities: number;
  readonly activeEntities: number;
  readonly byDomain: Readonly<Record<string, number>>;
  readonly byType: Readonly<Record<string, number>>;
};

/** Canonical entity type registry queries (Mission P-011.1). */
export class RegistryQueryService {
  constructor(private readonly repository: MasterEntityRepository) {}

  listEntityTypes(query: RegistryQuery = {}): readonly CanonicalEntityRegistration[] {
    return this.repository.listEntityTypes(query);
  }

  getEntityType(entityType: RegistryQuery["entityType"], _context: ServiceContext): CanonicalEntityRegistration | null {
    if (!entityType) return null;
    return this.repository.findEntityType(entityType);
  }

  getStats(context: ServiceContext): RegistryStats {
    const types = this.repository.listEntityTypes();
    const entities = this.repository.list(context.organizationId, { pageSize: 1000 });
    const activeEntities = entities.filter((e) => e.status === "active");

    const byDomain: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const entity of entities) {
      byDomain[entity.domainKey] = (byDomain[entity.domainKey] ?? 0) + 1;
      byType[entity.entityType] = (byType[entity.entityType] ?? 0) + 1;
    }

    return {
      organizationId: context.organizationId,
      registeredEntityTypes: types.length,
      totalMasterEntities: entities.length,
      activeEntities: activeEntities.length,
      byDomain,
      byType,
    };
  }
}
