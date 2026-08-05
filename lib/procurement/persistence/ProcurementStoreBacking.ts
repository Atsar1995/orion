/**
 * Shared Procurement persistence collections — single backing for platform foundation repositories.
 * Mirrors {@link CrmStoreBacking} pattern (Mission P-010.3 · ADR-007).
 */

/** Organization foundation marker stored in platform backing. */
export type ProcurementOrganizationFoundationRecord = {
  readonly organizationId: string;
  readonly registeredAt: string;
  readonly foundationVersion: string;
};

/** Entity registry entry preparing for `procurement_entities` PostgreSQL persistence. */
export type ProcurementEntityRegistryEntry = {
  readonly collection: string;
  readonly entityId: string;
  readonly organizationId: string;
  readonly registeredAt: string;
};

/** Organization-scoped Procurement aggregate placeholder (infrastructure only). */
export type ProcurementAggregateRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Shared Procurement business aggregate collections (Mission P-010.3 · P-010.4). */
export type ProcurementPersistenceCollection =
  | "vendors"
  | "vendorContacts"
  | "catalogs"
  | "catalogItems"
  | "items"
  | "requisitions"
  | "purchaseApprovals"
  | "rfqs"
  | "quotations"
  | "purchaseOrders"
  | "purchaseContracts"
  | "goodsReceipts"
  | "receivingLines"
  | "supplierInvoices"
  | "vendorScorecards";

/**
 * Shared Procurement persistence collections — single backing for all foundation repositories.
 */
export type ProcurementStoreBacking = {
  readonly organizationFoundations: Map<string, ProcurementOrganizationFoundationRecord>;
  readonly vendors: Map<string, ProcurementAggregateRecord>;
  readonly vendorContacts: Map<string, ProcurementAggregateRecord>;
  readonly catalogs: Map<string, ProcurementAggregateRecord>;
  readonly catalogItems: Map<string, ProcurementAggregateRecord>;
  readonly items: Map<string, ProcurementAggregateRecord>;
  readonly requisitions: Map<string, ProcurementAggregateRecord>;
  readonly purchaseApprovals: Map<string, ProcurementAggregateRecord>;
  readonly rfqs: Map<string, ProcurementAggregateRecord>;
  readonly quotations: Map<string, ProcurementAggregateRecord>;
  readonly purchaseOrders: Map<string, ProcurementAggregateRecord>;
  readonly purchaseContracts: Map<string, ProcurementAggregateRecord>;
  readonly goodsReceipts: Map<string, ProcurementAggregateRecord>;
  readonly receivingLines: Map<string, ProcurementAggregateRecord>;
  readonly supplierInvoices: Map<string, ProcurementAggregateRecord>;
  readonly vendorScorecards: Map<string, ProcurementAggregateRecord>;
  readonly idempotencyKeys: Map<string, Record<string, string>>;
  readonly entityRegistry: Map<string, ProcurementEntityRegistryEntry>;
};
