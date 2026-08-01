import { randomUUID } from "crypto";
import type {
  CanonicalEntityRegistration,
  CanonicalEntityType,
  MasterEntityDiscoveryQuery,
  MasterEntityRecord,
  RegistryQuery,
} from "@/types/enterprise-data";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import {
  seedCanonicalEntityTypes,
  seedMasterEntities,
} from "@/lib/platform/data/data/seed-master-registry";

/** In-memory master entity repository (Mission P-011.1). */
export class InMemoryMasterEntityRepository implements MasterEntityRepository {
  readonly domain = "platform" as const;

  private readonly entityTypes = new Map<CanonicalEntityType, CanonicalEntityRegistration>();
  private readonly entities = new Map<string, MasterEntityRecord>();
  private readonly businessKeyIndex = new Map<string, string>();
  private readonly globalIdIndex = new Map<string, string>();
  private readonly fingerprints = new Map<string, string>();

  constructor(seedOrganizationId = "org-orania") {
    for (const registration of seedCanonicalEntityTypes()) {
      this.entityTypes.set(registration.entityType, registration);
    }
    for (const entity of seedMasterEntities(seedOrganizationId)) {
      this.entities.set(entity.id, entity);
      this.businessKeyIndex.set(this.businessKey(entity.organizationId, entity.entityType, entity.businessKey), entity.id);
      this.globalIdIndex.set(entity.globalId, entity.id);
    }
  }

  registerEntityType(registration: CanonicalEntityRegistration): CanonicalEntityRegistration {
    this.entityTypes.set(registration.entityType, registration);
    return registration;
  }

  findEntityType(entityType: CanonicalEntityType): CanonicalEntityRegistration | null {
    return this.entityTypes.get(entityType) ?? null;
  }

  listEntityTypes(query: RegistryQuery = {}): readonly CanonicalEntityRegistration[] {
    let results = [...this.entityTypes.values()];
    if (query.entityType) results = results.filter((r) => r.entityType === query.entityType);
    if (query.domainKey) results = results.filter((r) => r.domainKey === query.domainKey);
    if (!query.includeInactive) results = results.filter((r) => r.active);
    return results.sort((a, b) => a.label.localeCompare(b.label));
  }

  create(entity: MasterEntityRecord): MasterEntityRecord {
    this.entities.set(entity.id, entity);
    this.businessKeyIndex.set(this.businessKey(entity.organizationId, entity.entityType, entity.businessKey), entity.id);
    this.globalIdIndex.set(entity.globalId, entity.id);
    return entity;
  }

  update(entity: MasterEntityRecord): MasterEntityRecord {
    this.entities.set(entity.id, entity);
    return entity;
  }

  findById(organizationId: string, entityId: string): MasterEntityRecord | null {
    const record = this.entities.get(entityId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findByBusinessKey(
    organizationId: string,
    entityType: CanonicalEntityType,
    businessKey: string,
  ): MasterEntityRecord | null {
    const id = this.businessKeyIndex.get(this.businessKey(organizationId, entityType, businessKey));
    if (!id) return null;
    return this.findById(organizationId, id);
  }

  findByGlobalId(globalId: string): MasterEntityRecord | null {
    const id = this.globalIdIndex.get(globalId);
    if (!id) return null;
    return this.entities.get(id) ?? null;
  }

  list(organizationId: string, query: MasterEntityDiscoveryQuery = {}): readonly MasterEntityRecord[] {
    const results = this.filterEntities(organizationId, query);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }

  count(organizationId: string, query: MasterEntityDiscoveryQuery = {}): number {
    return this.filterEntities(organizationId, query).length;
  }

  findDuplicateFingerprint(organizationId: string, fingerprint: string): MasterEntityRecord | null {
    const entityId = this.fingerprints.get(`${organizationId}:${fingerprint}`);
    if (!entityId) return null;
    return this.findById(organizationId, entityId);
  }

  setFingerprint(organizationId: string, fingerprint: string, entityId: string): void {
    this.fingerprints.set(`${organizationId}:${fingerprint}`, entityId);
  }

  private filterEntities(organizationId: string, query: MasterEntityDiscoveryQuery): MasterEntityRecord[] {
    let results = [...this.entities.values()].filter(
      (e) => e.organizationId === organizationId && e.status !== "deleted",
    );

    if (query.entityType) results = results.filter((e) => e.entityType === query.entityType);
    if (query.domainKey) results = results.filter((e) => e.domainKey === query.domainKey);
    if (query.status) results = results.filter((e) => e.status === query.status);
    if (query.search?.trim()) {
      const term = query.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.displayName.toLowerCase().includes(term) ||
          e.businessKey.toLowerCase().includes(term) ||
          e.globalId.toLowerCase().includes(term),
      );
    }

    return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  private businessKey(organizationId: string, entityType: CanonicalEntityType, key: string): string {
    return `${organizationId}:${entityType}:${key}`;
  }
}

export const defaultMasterEntityRepository = new InMemoryMasterEntityRepository();

export function createMasterEntityId(): string {
  return `md-${randomUUID()}`;
}

export function createGlobalId(
  organizationId: string,
  entityType: CanonicalEntityType,
  businessKey: string,
): string {
  return `gid-${organizationId}-${entityType}-${businessKey}`;
}
