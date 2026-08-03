/**
 * Finance entity persistence adapter — JSONB backing for Finance PlatformStore collections
 * (P-009.6 · P-009.7B · P-009.13).
 */

import type { FiscalCalendarRecord } from "@/types/finance-period";
import type { JournalLineRecord } from "@/types/finance-ledger";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

export const FINANCE_COLLECTION_JOURNAL = "finance_journal";
export const FINANCE_COLLECTION_JOURNAL_LINE = "finance_journal_line";
export const FINANCE_COLLECTION_EVENT_LINEAGE = "finance_event_lineage";
export const FINANCE_COLLECTION_ACCOUNT = "finance_account";
export const FINANCE_COLLECTION_FISCAL_PERIOD = "finance_fiscal_period";
export const FINANCE_COLLECTION_FISCAL_YEAR = "finance_fiscal_year";
export const FINANCE_COLLECTION_FISCAL_CALENDAR = "finance_fiscal_calendar";
export const FINANCE_COLLECTION_IDEMPOTENCY_KEY = "finance_idempotency_key";

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

/** Persists Finance entity collections to PostgreSQL without exposing SQL to domain services. */
export class FinanceEntityPersister {
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
       FROM finance_entities
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
        "DELETE FROM finance_entities WHERE collection_name = $1 AND entity_id = $2",
        [collection, entityId],
      );
    }

    for (const write of this.pendingWrites.values()) {
      await this.connection.query(
        `INSERT INTO finance_entities (collection_name, entity_id, organization_id, payload, updated_at)
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

/** Map wrapper that persists journal headers through {@link FinanceEntityPersister}. */
export class FinancePersistingMap<K, V> extends Map<K, V> {
  constructor(
    private readonly collection: string,
    private readonly persister: FinanceEntityPersister,
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

/** Journal line index keyed by `${organizationId}::${journalId}`. */
export class FinancePersistingJournalLinesMap extends Map<string, JournalLineRecord[]> {
  constructor(private readonly persister: FinanceEntityPersister) {
    super();
  }

  set(key: string, value: JournalLineRecord[]): this {
    const [organizationId] = key.split("::");
    const previous = this.get(key) ?? [];
    super.set(key, value);

    const nextIds = new Set(value.map((line) => line.id));
    for (const line of previous) {
      if (!nextIds.has(line.id)) {
        this.persister.queueDelete(FINANCE_COLLECTION_JOURNAL_LINE, line.id);
      }
    }

    for (const line of value) {
      this.persister.queueUpsert(
        FINANCE_COLLECTION_JOURNAL_LINE,
        line.id,
        line,
        organizationId,
      );
    }

    return this;
  }

  delete(key: string): boolean {
    const existing = this.get(key);
    const deleted = super.delete(key);
    if (deleted && existing) {
      for (const line of existing) {
        this.persister.queueDelete(FINANCE_COLLECTION_JOURNAL_LINE, line.id);
      }
    }
    return deleted;
  }
}

/** Event lineage map wrapper. */
export class FinancePersistingLineageMap<K, V> extends FinancePersistingMap<K, V> {
  constructor(persister: FinanceEntityPersister) {
    super(FINANCE_COLLECTION_EVENT_LINEAGE, persister);
  }
}

/** Idempotency index keyed by `${organizationId}::${idempotencyKey}`. */
export class FinancePersistingIdempotencyMap extends Map<string, Record<string, string>> {
  constructor(private readonly persister: FinanceEntityPersister) {
    super();
  }

  set(key: string, value: Record<string, string>): this {
    super.set(key, value);
    const [organizationId] = key.split("::");
    this.persister.queueUpsert(
      FINANCE_COLLECTION_IDEMPOTENCY_KEY,
      key,
      value,
      organizationId,
    );
    return this;
  }

  delete(key: string): boolean {
    const deleted = super.delete(key);
    if (deleted) {
      this.persister.queueDelete(FINANCE_COLLECTION_IDEMPOTENCY_KEY, key);
    }
    return deleted;
  }
}

function fiscalCalendarEntityId(organizationId: string): string {
  return `${organizationId}::calendar`;
}

/** Scalar fiscal calendar holder with PostgreSQL persistence. */
export class FinancePersistingFiscalCalendar {
  constructor(private readonly persister: FinanceEntityPersister) {}

  private _value: FiscalCalendarRecord | null = null;

  get value(): FiscalCalendarRecord | null {
    return this._value;
  }

  set value(next: FiscalCalendarRecord | null) {
    this._value = next;
    if (!next) {
      return;
    }

    this.persister.queueUpsert(
      FINANCE_COLLECTION_FISCAL_CALENDAR,
      fiscalCalendarEntityId(next.organizationId),
      next,
      next.organizationId,
    );
  }

  hydrate(calendar: FiscalCalendarRecord): void {
    this._value = calendar;
  }
}

export const FINANCE_PERSISTENT_COLLECTIONS = [
  FINANCE_COLLECTION_JOURNAL,
  FINANCE_COLLECTION_JOURNAL_LINE,
  FINANCE_COLLECTION_EVENT_LINEAGE,
  FINANCE_COLLECTION_ACCOUNT,
  FINANCE_COLLECTION_FISCAL_PERIOD,
  FINANCE_COLLECTION_FISCAL_YEAR,
  FINANCE_COLLECTION_FISCAL_CALENDAR,
  FINANCE_COLLECTION_IDEMPOTENCY_KEY,
] as const;

export type FinancePersistentCollection = (typeof FINANCE_PERSISTENT_COLLECTIONS)[number];
