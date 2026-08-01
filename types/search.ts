/**
 * Enterprise Search & Indexing Platform types (Mission P-010.5).
 * Organization-scoped, domain-agnostic search and indexing.
 */

/** Conceptual searchable entity types across ORION domains. */
export type SearchableEntityType =
  | "organization"
  | "user"
  | "document"
  | "reservation"
  | "guest"
  | "invoice"
  | "journal_entry"
  | "account"
  | "product"
  | "vendor"
  | "employee"
  | "asset"
  | "workflow_instance"
  | "custom";

/** Search match modes. */
export type SearchMatchMode = "keyword" | "exact" | "partial" | "phrase" | "boolean";

/** Sort direction. */
export type SearchSortDirection = "asc" | "desc";

/** Index lifecycle states. */
export type SearchIndexStatus = "active" | "rebuilding" | "validating" | "failed" | "archived";

/** Outbound search platform events. */
export type SearchEventType =
  | "EntityIndexed"
  | "EntityReindexed"
  | "IndexRebuilt"
  | "SearchExecuted"
  | "IndexValidationFailed";

/** Inbound events consumed by the search platform. */
export type SearchInboundEventType =
  | "EntityCreated"
  | "EntityUpdated"
  | "EntityDeleted"
  | "DocumentCreated"
  | "DocumentUpdated";

export type SearchIndexRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly domainKey: string;
  readonly entityType: SearchableEntityType;
  readonly indexVersion: number;
  readonly status: SearchIndexStatus;
  readonly documentCount: number;
  readonly lastIndexedAt?: string;
  readonly lastValidatedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SearchableEntityRegistration = {
  readonly id: string;
  readonly organizationId: string;
  readonly domainKey: string;
  readonly entityType: SearchableEntityType;
  readonly label: string;
  readonly searchableFields: readonly string[];
  readonly facetFields: readonly string[];
  readonly filterFields: readonly string[];
  readonly active: boolean;
  readonly registeredAt: string;
};

export type IndexedEntityRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly indexId: string;
  readonly domainKey: string;
  readonly entityType: SearchableEntityType;
  readonly entityId: string;
  readonly title: string;
  readonly content: string;
  readonly ownerId?: string;
  readonly status?: string;
  readonly category?: string;
  readonly tags: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
  readonly indexedAt: string;
  readonly indexVersion: number;
  readonly deleted: boolean;
};

export type SearchFilter = {
  readonly field: string;
  readonly operator: "eq" | "neq" | "contains" | "gte" | "lte" | "in";
  readonly value: string | readonly string[];
};

export type SearchSort = {
  readonly field: string;
  readonly direction: SearchSortDirection;
};

export type SearchQuery = {
  readonly query?: string;
  readonly matchMode?: SearchMatchMode;
  readonly domainKey?: string;
  readonly entityType?: SearchableEntityType;
  readonly filters?: readonly SearchFilter[];
  readonly facets?: readonly string[];
  readonly sort?: SearchSort;
  readonly page?: number;
  readonly pageSize?: number;
};

export type SearchFacetValue = {
  readonly value: string;
  readonly count: number;
};

export type SearchFacetResult = {
  readonly field: string;
  readonly values: readonly SearchFacetValue[];
};

export type SearchResultItem = {
  readonly id: string;
  readonly entityType: SearchableEntityType;
  readonly entityId: string;
  readonly domainKey: string;
  readonly title: string;
  readonly snippet: string;
  readonly score: number;
  readonly metadata: Readonly<Record<string, string>>;
};

export type SearchResult = {
  readonly query: SearchQuery;
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly items: readonly SearchResultItem[];
  readonly facets: readonly SearchFacetResult[];
  readonly executionMs: number;
};

export type SavedSearchRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly name: string;
  readonly query: SearchQuery;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type SearchHistoryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly query: string;
  readonly resultCount: number;
  readonly executedAt: string;
};

export type SearchAnalyticsSnapshot = {
  readonly organizationId: string;
  readonly totalSearches: number;
  readonly totalIndexedEntities: number;
  readonly topQueries: readonly { readonly query: string; readonly count: number }[];
  readonly indexStats: readonly {
    readonly indexId: string;
    readonly domainKey: string;
    readonly entityType: SearchableEntityType;
    readonly documentCount: number;
    readonly status: SearchIndexStatus;
  }[];
};

export type RegisterEntityInput = {
  readonly domainKey: string;
  readonly entityType: SearchableEntityType;
  readonly label: string;
  readonly searchableFields: readonly string[];
  readonly facetFields?: readonly string[];
  readonly filterFields?: readonly string[];
};

export type IndexEntityInput = {
  readonly domainKey: string;
  readonly entityType: SearchableEntityType;
  readonly entityId: string;
  readonly title: string;
  readonly content: string;
  readonly ownerId?: string;
  readonly status?: string;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
};

export type PublishSearchEventInput = {
  readonly eventType: SearchEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
