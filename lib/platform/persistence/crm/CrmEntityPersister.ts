/**
 * CRM entity persistence adapter — JSONB backing for CRM PlatformStore collections
 * (P-008.9 · P-008.17 · ADR-007).
 */

import type { CrmEntityRegistryEntry } from "@/lib/crm/persistence/CrmStoreBacking";
import type { CrmOrganizationFoundationRecord } from "@/lib/crm/persistence/CrmStoreBacking";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

export const CRM_COLLECTION_ORGANIZATION_FOUNDATION = "crm_organization_foundation";
export const CRM_COLLECTION_IDEMPOTENCY_KEY = "crm_idempotency_key";
export const CRM_COLLECTION_ENTITY_REGISTRY = "crm_entity_registry";
export const CRM_COLLECTION_ACCOUNT = "crm_account";
export const CRM_COLLECTION_CONTACT = "crm_contact";
export const CRM_COLLECTION_ORGANIZATION = "crm_organization";
export const CRM_COLLECTION_LEAD = "crm_lead";
export const CRM_COLLECTION_OPPORTUNITY = "crm_opportunity";
export const CRM_COLLECTION_QUOTE = "crm_quote";
export const CRM_COLLECTION_ACTIVITY = "crm_activity";
export const CRM_COLLECTION_CASE = "crm_case";
export const CRM_COLLECTION_SALES_ORDER = "crm_sales_order";
export const CRM_COLLECTION_NOTE = "crm_note";
export const CRM_COLLECTION_ATTACHMENT = "crm_attachment";

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

/** Persists CRM entity collections to PostgreSQL without exposing SQL to domain services. */
export class CrmEntityPersister {
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
       FROM crm_entities
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
        "DELETE FROM crm_entities WHERE collection_name = $1 AND entity_id = $2",
        [collection, entityId],
      );
    }

    for (const write of this.pendingWrites.values()) {
      await this.connection.query(
        `INSERT INTO crm_entities (collection_name, entity_id, organization_id, payload, updated_at)
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

/** Map wrapper that persists CRM aggregates through {@link CrmEntityPersister}. */
export class CrmPersistingMap<K, V> extends Map<K, V> {
  constructor(
    private readonly collection: string,
    private readonly persister: CrmEntityPersister,
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
export class CrmPersistingOrganizationFoundationMap extends Map<
  string,
  CrmOrganizationFoundationRecord
> {
  constructor(private readonly persister: CrmEntityPersister) {
    super();
  }

  set(key: string, value: CrmOrganizationFoundationRecord): this {
    super.set(key, value);
    this.persister.queueUpsert(
      CRM_COLLECTION_ORGANIZATION_FOUNDATION,
      key,
      value,
      value.organizationId,
    );
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(CRM_COLLECTION_ORGANIZATION_FOUNDATION, key);
    }
    return deleted;
  }
}

/** Idempotency index keyed by organization ID. */
export class CrmPersistingIdempotencyMap extends Map<string, Record<string, string>> {
  constructor(private readonly persister: CrmEntityPersister) {
    super();
  }

  set(key: string, value: Record<string, string>): this {
    super.set(key, value);
    this.persister.queueUpsert(CRM_COLLECTION_IDEMPOTENCY_KEY, key, value, key);
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(CRM_COLLECTION_IDEMPOTENCY_KEY, key);
    }
    return deleted;
  }
}

/** Entity registry keyed by `${collection}::${entityId}`. */
export class CrmPersistingEntityRegistryMap extends Map<string, CrmEntityRegistryEntry> {
  constructor(private readonly persister: CrmEntityPersister) {
    super();
  }

  set(key: string, value: CrmEntityRegistryEntry): this {
    super.set(key, value);
    this.persister.queueUpsert(
      CRM_COLLECTION_ENTITY_REGISTRY,
      key,
      value,
      value.organizationId,
    );
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(CRM_COLLECTION_ENTITY_REGISTRY, key);
    }
    return deleted;
  }
}

export const CRM_PERSISTENT_COLLECTIONS = [
  CRM_COLLECTION_ORGANIZATION_FOUNDATION,
  CRM_COLLECTION_ACCOUNT,
  CRM_COLLECTION_CONTACT,
  CRM_COLLECTION_ORGANIZATION,
  CRM_COLLECTION_LEAD,
  CRM_COLLECTION_OPPORTUNITY,
  CRM_COLLECTION_QUOTE,
  CRM_COLLECTION_ACTIVITY,
  CRM_COLLECTION_CASE,
  CRM_COLLECTION_SALES_ORDER,
  CRM_COLLECTION_NOTE,
  CRM_COLLECTION_ATTACHMENT,
  CRM_COLLECTION_IDEMPOTENCY_KEY,
  CRM_COLLECTION_ENTITY_REGISTRY,
] as const;

export type CrmPersistentCollection = (typeof CRM_PERSISTENT_COLLECTIONS)[number];
