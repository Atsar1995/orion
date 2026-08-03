/**
 * IIL entity persistence adapter — JSONB backing for durable transport (P-009.16).
 */

import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

export const IIL_COLLECTION_EVENT = "iil_event";
export const IIL_COLLECTION_DELIVERY = "iil_delivery";
export const IIL_COLLECTION_DEAD_LETTER = "iil_dead_letter";
export const IIL_COLLECTION_IDEMPOTENCY = "iil_idempotency";

type PendingWrite = {
  readonly collection: string;
  readonly entityId: string;
  readonly payload: unknown;
  readonly organizationId?: string;
};

export class IILEntityPersister {
  private readonly pendingWrites = new Map<string, PendingWrite>();
  private readonly pendingDeletes = new Set<string>();

  constructor(private readonly connection: DatabaseConnection) {}

  queueUpsert(collection: string, entityId: string, payload: unknown, organizationId?: string): void {
    const key = `${collection}::${entityId}`;
    this.pendingDeletes.delete(key);
    this.pendingWrites.set(key, { collection, entityId, payload, organizationId });
  }

  queueDelete(collection: string, entityId: string): void {
    const key = `${collection}::${entityId}`;
    this.pendingWrites.delete(key);
    this.pendingDeletes.add(key);
  }

  async flushPending(): Promise<void> {
    for (const key of this.pendingDeletes) {
      const [collection, entityId] = key.split("::");
      await this.connection.query(
        "DELETE FROM iil_entities WHERE collection_name = $1 AND entity_id = $2",
        [collection, entityId],
      );
    }

    for (const write of this.pendingWrites.values()) {
      await this.connection.query(
        `INSERT INTO iil_entities (collection_name, entity_id, organization_id, payload, updated_at)
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

    this.pendingWrites.clear();
    this.pendingDeletes.clear();
  }

  async loadCollection<T>(collection: string, organizationId?: string): Promise<Map<string, T>> {
    const sql = organizationId
      ? `SELECT entity_id, payload FROM iil_entities WHERE collection_name = $1 AND organization_id = $2`
      : `SELECT entity_id, payload FROM iil_entities WHERE collection_name = $1`;
    const params = organizationId ? [collection, organizationId] : [collection];
    const result = await this.connection.query<{ entity_id: string; payload: T }>(sql, params);

    const map = new Map<string, T>();
    for (const row of result.rows) {
      map.set(row.entity_id, row.payload);
    }
    return map;
  }

  async upsertImmediate(
    collection: string,
    entityId: string,
    payload: unknown,
    organizationId?: string,
  ): Promise<void> {
    this.queueUpsert(collection, entityId, payload, organizationId);
    await this.flushPending();
  }

  async deleteImmediate(collection: string, entityId: string): Promise<void> {
    this.queueDelete(collection, entityId);
    await this.flushPending();
  }
}
