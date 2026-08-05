/**
 * Procurement entity persistence adapter — JSONB backing for Procurement PlatformStore collections
 * (P-010.3 · P-010.4 · ADR-007).
 */

import type {
  ProcurementEntityRegistryEntry,
  ProcurementOrganizationFoundationRecord,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

export const PROCUREMENT_COLLECTION_ORGANIZATION_FOUNDATION = "procurement_organization_foundation";
export const PROCUREMENT_COLLECTION_IDEMPOTENCY_KEY = "procurement_idempotency_key";
export const PROCUREMENT_COLLECTION_ENTITY_REGISTRY = "procurement_entity_registry";
export const PROCUREMENT_COLLECTION_VENDOR = "procurement_vendor";
export const PROCUREMENT_COLLECTION_VENDOR_CONTACT = "procurement_vendor_contact";
export const PROCUREMENT_COLLECTION_CATALOG = "procurement_catalog";
export const PROCUREMENT_COLLECTION_CATALOG_ITEM = "procurement_catalog_item";
export const PROCUREMENT_COLLECTION_ITEM = "procurement_item";
export const PROCUREMENT_COLLECTION_REQUISITION = "procurement_requisition";
export const PROCUREMENT_COLLECTION_PURCHASE_APPROVAL = "procurement_purchase_approval";
export const PROCUREMENT_COLLECTION_RFQ = "procurement_rfq";
export const PROCUREMENT_COLLECTION_QUOTATION = "procurement_quotation";
export const PROCUREMENT_COLLECTION_PURCHASE_ORDER = "procurement_purchase_order";
export const PROCUREMENT_COLLECTION_PURCHASE_CONTRACT = "procurement_purchase_contract";
export const PROCUREMENT_COLLECTION_GOODS_RECEIPT = "procurement_goods_receipt";
export const PROCUREMENT_COLLECTION_RECEIVING_LINE = "procurement_receiving_line";
export const PROCUREMENT_COLLECTION_SUPPLIER_INVOICE = "procurement_supplier_invoice";
export const PROCUREMENT_COLLECTION_VENDOR_SCORECARD = "procurement_vendor_scorecard";

type PendingWrite = {
  readonly collection: string;
  readonly entityId: string;
  readonly payload: unknown;
  readonly organizationId?: string;
};

function extractOrganizationId(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const organizationId = (payload as { organizationId?: unknown }).organizationId;
  return typeof organizationId === "string" ? organizationId : undefined;
}

/** Persists Procurement entity collections to PostgreSQL without exposing SQL to domain services. */
export class ProcurementEntityPersister {
  private readonly pendingWrites = new Map<string, PendingWrite>();
  private readonly pendingDeletes = new Set<string>();
  private transactionDepth = 0;
  private flushScheduled = false;

  constructor(private readonly connection: DatabaseConnection) {}

  beginTransaction(): void {
    this.transactionDepth += 1;
  }

  endTransaction(): void {
    this.transactionDepth = Math.max(0, this.transactionDepth - 1);
  }

  discardPending(): void {
    this.pendingWrites.clear();
    this.pendingDeletes.clear();
    this.flushScheduled = false;
  }

  queueUpsert(collection: string, entityId: string, payload: unknown, organizationId?: string): void {
    const key = `${collection}::${entityId}`;
    this.pendingDeletes.delete(key);
    this.pendingWrites.set(key, {
      collection,
      entityId,
      payload,
      organizationId: organizationId ?? extractOrganizationId(payload),
    });
    this.scheduleFlush();
  }

  queueDelete(collection: string, entityId: string): void {
    const key = `${collection}::${entityId}`;
    this.pendingWrites.delete(key);
    this.pendingDeletes.add(key);
    this.scheduleFlush();
  }

  async loadCollection<T>(collection: string): Promise<Map<string, T>> {
    const result = await this.connection.query<{
      entity_id: string;
      payload: T;
    }>(
      `SELECT entity_id, payload
       FROM procurement_entities
       WHERE collection_name = $1`,
      [collection],
    );

    const map = new Map<string, T>();
    for (const row of result.rows) {
      map.set(row.entity_id, row.payload);
    }

    return map;
  }

  async flushPending(): Promise<void> {
    this.flushScheduled = false;

    for (const key of this.pendingDeletes) {
      const [collection, entityId] = key.split("::");
      await this.connection.query(
        "DELETE FROM procurement_entities WHERE collection_name = $1 AND entity_id = $2",
        [collection, entityId],
      );
    }

    for (const write of this.pendingWrites.values()) {
      await this.connection.query(
        `INSERT INTO procurement_entities (collection_name, entity_id, organization_id, payload, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, NOW())
         ON CONFLICT (collection_name, entity_id)
         DO UPDATE SET organization_id = EXCLUDED.organization_id, payload = EXCLUDED.payload, updated_at = NOW()`,
        [
          write.collection,
          write.entityId,
          write.organizationId ?? null,
          JSON.stringify(write.payload),
        ],
      );
    }

    this.pendingDeletes.clear();
    this.pendingWrites.clear();
  }

  private scheduleFlush(): void {
    if (this.transactionDepth > 0 || this.flushScheduled) {
      return;
    }

    this.flushScheduled = true;
    queueMicrotask(() => {
      void this.flushPending().catch(() => {
        // Health checks surface persistence failures; repositories remain synchronous.
      });
    });
  }
}

/** Map wrapper that persists Procurement aggregates through {@link ProcurementEntityPersister}. */
export class ProcurementPersistingMap<K, V> extends Map<K, V> {
  constructor(
    private readonly collection: string,
    private readonly persister: ProcurementEntityPersister,
  ) {
    super();
  }

  set(key: K, value: V): this {
    super.set(key, value);
    this.persister.queueUpsert(this.collection, String(key), value);
    return this;
  }

  delete(key: K): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(this.collection, String(key));
    }
    return deleted;
  }
}

/** Organization foundation markers with PostgreSQL persistence. */
export class ProcurementPersistingOrganizationFoundationMap extends Map<
  string,
  ProcurementOrganizationFoundationRecord
> {
  constructor(private readonly persister: ProcurementEntityPersister) {
    super();
  }

  set(key: string, value: ProcurementOrganizationFoundationRecord): this {
    super.set(key, value);
    this.persister.queueUpsert(
      PROCUREMENT_COLLECTION_ORGANIZATION_FOUNDATION,
      key,
      value,
      value.organizationId,
    );
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(PROCUREMENT_COLLECTION_ORGANIZATION_FOUNDATION, key);
    }
    return deleted;
  }
}

/** Idempotency index keyed by organization ID. */
export class ProcurementPersistingIdempotencyMap extends Map<string, Record<string, string>> {
  constructor(private readonly persister: ProcurementEntityPersister) {
    super();
  }

  set(key: string, value: Record<string, string>): this {
    super.set(key, value);
    this.persister.queueUpsert(PROCUREMENT_COLLECTION_IDEMPOTENCY_KEY, key, value, key);
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(PROCUREMENT_COLLECTION_IDEMPOTENCY_KEY, key);
    }
    return deleted;
  }
}

/** Entity registry keyed by `${collection}::${entityId}`. */
export class ProcurementPersistingEntityRegistryMap extends Map<
  string,
  ProcurementEntityRegistryEntry
> {
  constructor(private readonly persister: ProcurementEntityPersister) {
    super();
  }

  set(key: string, value: ProcurementEntityRegistryEntry): this {
    super.set(key, value);
    this.persister.queueUpsert(
      PROCUREMENT_COLLECTION_ENTITY_REGISTRY,
      key,
      value,
      value.organizationId,
    );
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(PROCUREMENT_COLLECTION_ENTITY_REGISTRY, key);
    }
    return deleted;
  }
}

export const PROCUREMENT_PERSISTENT_COLLECTIONS = [
  PROCUREMENT_COLLECTION_ORGANIZATION_FOUNDATION,
  PROCUREMENT_COLLECTION_VENDOR,
  PROCUREMENT_COLLECTION_VENDOR_CONTACT,
  PROCUREMENT_COLLECTION_CATALOG,
  PROCUREMENT_COLLECTION_CATALOG_ITEM,
  PROCUREMENT_COLLECTION_ITEM,
  PROCUREMENT_COLLECTION_REQUISITION,
  PROCUREMENT_COLLECTION_PURCHASE_APPROVAL,
  PROCUREMENT_COLLECTION_RFQ,
  PROCUREMENT_COLLECTION_QUOTATION,
  PROCUREMENT_COLLECTION_PURCHASE_ORDER,
  PROCUREMENT_COLLECTION_PURCHASE_CONTRACT,
  PROCUREMENT_COLLECTION_GOODS_RECEIPT,
  PROCUREMENT_COLLECTION_RECEIVING_LINE,
  PROCUREMENT_COLLECTION_SUPPLIER_INVOICE,
  PROCUREMENT_COLLECTION_VENDOR_SCORECARD,
  PROCUREMENT_COLLECTION_IDEMPOTENCY_KEY,
  PROCUREMENT_COLLECTION_ENTITY_REGISTRY,
] as const;

export type ProcurementPersistentCollection = (typeof PROCUREMENT_PERSISTENT_COLLECTIONS)[number];
