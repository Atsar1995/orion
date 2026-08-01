import { randomUUID } from "crypto";
import type {
  IndexedEntityRecord,
  SavedSearchRecord,
  SearchAnalyticsSnapshot,
  SearchHistoryRecord,
  SearchIndexRecord,
  SearchableEntityRegistration,
} from "@/types/search";
import type { SearchRepository } from "@/lib/platform/search/repositories/SearchRepository";
import { seedSearchPlatform } from "@/lib/platform/search/data/seed-search-index";

/** In-memory search repository (Mission P-010.5). */
export class InMemorySearchRepository implements SearchRepository {
  readonly domain = "platform" as const;

  private readonly indexes = new Map<string, SearchIndexRecord>();
  private readonly registrations = new Map<string, SearchableEntityRegistration>();
  private readonly entities = new Map<string, IndexedEntityRecord>();
  private readonly savedSearches = new Map<string, SavedSearchRecord>();
  private readonly history: SearchHistoryRecord[] = [];
  private readonly queryCounts = new Map<string, Map<string, number>>();

  constructor(seedOrganizationId = "org-orania") {
    const seed = seedSearchPlatform(seedOrganizationId);
    for (const registration of seed.registrations) {
      this.registrations.set(registration.id, registration);
    }
    for (const index of seed.indexes) {
      this.indexes.set(index.id, index);
    }
    for (const entity of seed.entities) {
      this.entities.set(`${entity.entityType}:${entity.entityId}`, entity);
    }
  }

  createIndex(index: SearchIndexRecord): SearchIndexRecord {
    this.indexes.set(index.id, index);
    return index;
  }

  updateIndex(index: SearchIndexRecord): SearchIndexRecord {
    this.indexes.set(index.id, index);
    return index;
  }

  findIndex(organizationId: string, indexId: string): SearchIndexRecord | null {
    const record = this.indexes.get(indexId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findIndexByEntity(
    organizationId: string,
    domainKey: string,
    entityType: string,
  ): SearchIndexRecord | null {
    return (
      [...this.indexes.values()].find(
        (index) =>
          index.organizationId === organizationId &&
          index.domainKey === domainKey &&
          index.entityType === entityType,
      ) ?? null
    );
  }

  listIndexes(organizationId: string): readonly SearchIndexRecord[] {
    return [...this.indexes.values()].filter((index) => index.organizationId === organizationId);
  }

  registerEntity(registration: SearchableEntityRegistration): SearchableEntityRegistration {
    this.registrations.set(registration.id, registration);
    return registration;
  }

  findRegistration(
    organizationId: string,
    domainKey: string,
    entityType: string,
  ): SearchableEntityRegistration | null {
    return (
      [...this.registrations.values()].find(
        (reg) =>
          reg.organizationId === organizationId &&
          reg.domainKey === domainKey &&
          reg.entityType === entityType &&
          reg.active,
      ) ?? null
    );
  }

  listRegistrations(organizationId: string): readonly SearchableEntityRegistration[] {
    return [...this.registrations.values()].filter((reg) => reg.organizationId === organizationId);
  }

  upsertEntity(entity: IndexedEntityRecord): IndexedEntityRecord {
    this.entities.set(`${entity.entityType}:${entity.entityId}`, entity);
    return entity;
  }

  findEntity(organizationId: string, entityId: string, entityType: string): IndexedEntityRecord | null {
    const record = this.entities.get(`${entityType}:${entityId}`);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listEntities(organizationId: string, indexId?: string): readonly IndexedEntityRecord[] {
    return [...this.entities.values()].filter(
      (entity) =>
        entity.organizationId === organizationId &&
        !entity.deleted &&
        (!indexId || entity.indexId === indexId),
    );
  }

  markEntityDeleted(organizationId: string, entityId: string, entityType: string): IndexedEntityRecord | null {
    const record = this.findEntity(organizationId, entityId, entityType);
    if (!record) return null;
    const updated = { ...record, deleted: true };
    this.entities.set(`${entityType}:${entityId}`, updated);
    return updated;
  }

  saveSearch(search: SavedSearchRecord): SavedSearchRecord {
    this.savedSearches.set(search.id, search);
    return search;
  }

  listSavedSearches(organizationId: string, userId: string): readonly SavedSearchRecord[] {
    return [...this.savedSearches.values()].filter(
      (search) => search.organizationId === organizationId && search.userId === userId,
    );
  }

  deleteSavedSearch(organizationId: string, searchId: string): boolean {
    const record = this.savedSearches.get(searchId);
    if (!record || record.organizationId !== organizationId) return false;
    return this.savedSearches.delete(searchId);
  }

  recordHistory(entry: SearchHistoryRecord): SearchHistoryRecord {
    this.history.unshift(entry);
    if (this.history.length > 500) this.history.length = 500;
    return entry;
  }

  listHistory(organizationId: string, userId: string, limit = 20): readonly SearchHistoryRecord[] {
    return this.history
      .filter((entry) => entry.organizationId === organizationId && entry.userId === userId)
      .slice(0, limit);
  }

  incrementSearchCount(organizationId: string, query: string): void {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return;
    const orgCounts = this.queryCounts.get(organizationId) ?? new Map<string, number>();
    orgCounts.set(normalized, (orgCounts.get(normalized) ?? 0) + 1);
    this.queryCounts.set(organizationId, orgCounts);
  }

  getAnalytics(organizationId: string): SearchAnalyticsSnapshot {
    const orgCounts = this.queryCounts.get(organizationId) ?? new Map<string, number>();
    const topQueries = [...orgCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    const indexes = this.listIndexes(organizationId);
    const entities = this.listEntities(organizationId);

    return {
      organizationId,
      totalSearches: this.history.filter((entry) => entry.organizationId === organizationId).length,
      totalIndexedEntities: entities.length,
      topQueries,
      indexStats: indexes.map((index) => ({
        indexId: index.id,
        domainKey: index.domainKey,
        entityType: index.entityType,
        documentCount: entities.filter((entity) => entity.indexId === index.id).length,
        status: index.status,
      })),
    };
  }
}

export const defaultSearchRepository = new InMemorySearchRepository();

export function createSearchEntityId(): string {
  return `ent-${randomUUID()}`;
}

export function createSearchIndexId(): string {
  return `idx-${randomUUID()}`;
}

export function createSavedSearchId(): string {
  return `ss-${randomUUID()}`;
}
