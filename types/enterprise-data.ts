/**
 * Enterprise Master Data Platform types (Mission P-011.1).
 * Canonical master entity registry — organization-scoped.
 */

/** Canonical master entity types supported by the registry. */
export type CanonicalEntityType =
  | "organization"
  | "business_unit"
  | "branch"
  | "department"
  | "team"
  | "user"
  | "employee"
  | "customer"
  | "guest"
  | "vendor"
  | "supplier"
  | "product"
  | "service"
  | "inventory_item"
  | "asset"
  | "financial_account"
  | "currency"
  | "tax_code"
  | "location"
  | "address"
  | "document"
  | "workflow_definition"
  | "notification_template";

/** Master entity lifecycle states. */
export type MasterEntityStatus =
  | "draft"
  | "active"
  | "inactive"
  | "archived"
  | "deleted";

/** Canonical entity type registration record. */
export type CanonicalEntityRegistration = {
  readonly id: string;
  readonly entityType: CanonicalEntityType;
  readonly domainKey: string;
  readonly label: string;
  readonly owningService: string;
  readonly active: boolean;
  readonly registeredAt: string;
};

/** Immutable master entity identity — surrogate key never changes after creation. */
export type MasterEntityRecord = {
  readonly id: string;
  readonly globalId: string;
  readonly organizationId: string;
  readonly entityType: CanonicalEntityType;
  readonly businessKey: string;
  readonly displayName: string;
  readonly domainKey: string;
  readonly status: MasterEntityStatus;
  readonly version: number;
  readonly ownerId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type RegisterMasterEntityInput = {
  readonly entityType: CanonicalEntityType;
  readonly businessKey: string;
  readonly displayName: string;
  readonly domainKey: string;
  readonly ownerId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type UpdateMasterEntityInput = {
  readonly entityId: string;
  readonly displayName?: string;
  readonly ownerId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type MasterEntityDiscoveryQuery = {
  readonly entityType?: CanonicalEntityType;
  readonly domainKey?: string;
  readonly status?: MasterEntityStatus;
  readonly search?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type MasterEntityDiscoveryResult = {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly entities: readonly MasterEntityRecord[];
};

export type RegistryQuery = {
  readonly entityType?: CanonicalEntityType;
  readonly domainKey?: string;
  readonly includeInactive?: boolean;
};

/** Outbound master data registry events (Mission P-011.1). */
export type MasterDataEventType =
  | "MasterEntityRegistered"
  | "MasterEntityUpdated"
  | "MasterEntityActivated"
  | "MasterEntityDeactivated"
  | "MasterEntityArchived";

/** Inbound events consumed by the registry. */
export type MasterDataInboundEventType = "EntityRegistrationRequested";

export type PublishMasterDataEventInput = {
  readonly eventType: MasterDataEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
