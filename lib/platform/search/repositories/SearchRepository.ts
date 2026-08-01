import type {
  IndexedEntityRecord,
  SavedSearchRecord,
  SearchAnalyticsSnapshot,
  SearchHistoryRecord,
  SearchIndexRecord,
  SearchableEntityRegistration,
} from "@/types/search";

/** Search repository contract (Mission P-010.5). */
export type SearchRepository = {
  readonly domain: string;

  createIndex(index: SearchIndexRecord): SearchIndexRecord;
  updateIndex(index: SearchIndexRecord): SearchIndexRecord;
  findIndex(organizationId: string, indexId: string): SearchIndexRecord | null;
  findIndexByEntity(
    organizationId: string,
    domainKey: string,
    entityType: string,
  ): SearchIndexRecord | null;
  listIndexes(organizationId: string): readonly SearchIndexRecord[];

  registerEntity(registration: SearchableEntityRegistration): SearchableEntityRegistration;
  findRegistration(
    organizationId: string,
    domainKey: string,
    entityType: string,
  ): SearchableEntityRegistration | null;
  listRegistrations(organizationId: string): readonly SearchableEntityRegistration[];

  upsertEntity(entity: IndexedEntityRecord): IndexedEntityRecord;
  findEntity(organizationId: string, entityId: string, entityType: string): IndexedEntityRecord | null;
  listEntities(organizationId: string, indexId?: string): readonly IndexedEntityRecord[];
  markEntityDeleted(organizationId: string, entityId: string, entityType: string): IndexedEntityRecord | null;

  saveSearch(search: SavedSearchRecord): SavedSearchRecord;
  listSavedSearches(organizationId: string, userId: string): readonly SavedSearchRecord[];
  deleteSavedSearch(organizationId: string, searchId: string): boolean;

  recordHistory(entry: SearchHistoryRecord): SearchHistoryRecord;
  listHistory(organizationId: string, userId: string, limit?: number): readonly SearchHistoryRecord[];

  incrementSearchCount(organizationId: string, query: string): void;
  getAnalytics(organizationId: string): SearchAnalyticsSnapshot;
};
