/**
 * Shared CRM persistence collections — single backing for platform foundation repositories.
 * Mirrors {@link FinanceStoreBacking} pattern (Mission P-008.9 · ADR-007).
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

/**
 * Shared CRM persistence collections — single backing for all foundation repositories.
 */
export type CrmStoreBacking = {
  readonly organizationFoundations: Map<string, CrmOrganizationFoundationRecord>;
  readonly idempotencyKeys: Map<string, Record<string, string>>;
  readonly entityRegistry: Map<string, CrmEntityRegistryEntry>;
};
