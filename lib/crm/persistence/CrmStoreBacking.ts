/**
 * Shared CRM persistence collections — single backing for platform foundation repositories.
 * Mirrors {@link FinanceStoreBacking} pattern (Mission P-008.9 · P-008.10 · ADR-007).
 */

/** Organization foundation marker stored in platform backing. */
export type CrmOrganizationFoundationRecord = {
  readonly organizationId: string;
  readonly registeredAt: string;
  readonly foundationVersion: string;
};

/** Entity registry entry preparing for `crm_entities` PostgreSQL persistence. */
export type CrmEntityRegistryEntry = {
  readonly collection: string;
  readonly entityId: string;
  readonly organizationId: string;
  readonly registeredAt: string;
};

/** Organization-scoped CRM aggregate placeholder (infrastructure only). */
export type CrmAggregateRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Shared CRM business aggregate collections (Mission P-008.10). */
export type CrmPersistenceCollection =
  | "accounts"
  | "contacts"
  | "organizations"
  | "leads"
  | "opportunities"
  | "quotes"
  | "activities"
  | "cases"
  | "salesOrders"
  | "notes"
  | "attachments";

/**
 * Shared CRM persistence collections — single backing for all foundation repositories.
 */
export type CrmStoreBacking = {
  readonly organizationFoundations: Map<string, CrmOrganizationFoundationRecord>;
  readonly accounts: Map<string, CrmAggregateRecord>;
  readonly contacts: Map<string, CrmAggregateRecord>;
  readonly organizations: Map<string, CrmAggregateRecord>;
  readonly leads: Map<string, CrmAggregateRecord>;
  readonly opportunities: Map<string, CrmAggregateRecord>;
  readonly quotes: Map<string, CrmAggregateRecord>;
  readonly activities: Map<string, CrmAggregateRecord>;
  readonly cases: Map<string, CrmAggregateRecord>;
  readonly salesOrders: Map<string, CrmAggregateRecord>;
  readonly notes: Map<string, CrmAggregateRecord>;
  readonly attachments: Map<string, CrmAggregateRecord>;
  readonly idempotencyKeys: Map<string, Record<string, string>>;
  readonly entityRegistry: Map<string, CrmEntityRegistryEntry>;
};
