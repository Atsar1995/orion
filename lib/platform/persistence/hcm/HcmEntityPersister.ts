/**
 * HCM entity persistence adapter — JSONB backing for InMemoryHcmStore shape (Mission P-015.5).
 */

import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

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

/** Persists HCM entity collections to PostgreSQL without exposing SQL to repositories. */
export class HcmEntityPersister {
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

  queueUpsert(collection: string, entityId: string, payload: unknown): void {
    const key = `${collection}::${entityId}`;
    this.pendingDeletes.delete(key);
    this.pendingWrites.set(key, {
      collection,
      entityId,
      payload,
      organizationId: extractOrganizationId(payload),
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
       FROM hcm_entities
       WHERE collection_name = $1 AND entity_id <> '__array__'`,
      [collection],
    );

    const map = new Map<string, T>();
    for (const row of result.rows) {
      map.set(row.entity_id, row.payload);
    }
    return map;
  }

  async loadArrayCollection<T>(collection: string): Promise<T[]> {
    const result = await this.connection.query<{ payload: T[] }>(
      `SELECT payload
       FROM hcm_entities
       WHERE collection_name = $1 AND entity_id = '__array__'
       LIMIT 1`,
      [collection],
    );

    return result.rows[0]?.payload ?? [];
  }

  async flushPending(): Promise<void> {
    this.flushScheduled = false;

    for (const key of this.pendingDeletes) {
      const [collection, entityId] = key.split("::");
      await this.connection.query(
        "DELETE FROM hcm_entities WHERE collection_name = $1 AND entity_id = $2",
        [collection, entityId],
      );
    }

    for (const write of this.pendingWrites.values()) {
      await this.connection.query(
        `INSERT INTO hcm_entities (collection_name, entity_id, organization_id, payload, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, NOW())
         ON CONFLICT (collection_name, entity_id)
         DO UPDATE SET organization_id = EXCLUDED.organization_id, payload = EXCLUDED.payload, updated_at = NOW()`,
        [write.collection, write.entityId, write.organizationId ?? null, JSON.stringify(write.payload)],
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

/** Map wrapper that persists mutations through {@link HcmEntityPersister}. */
export class PersistingMap<K, V> extends Map<K, V> {
  constructor(
    private readonly collection: string,
    private readonly persister: HcmEntityPersister,
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

/** Array wrapper that persists employment history and similar collections. */
export class PersistingArray<T> extends Array<T> {
  constructor(
    private readonly collection: string,
    private readonly persister: HcmEntityPersister,
  ) {
    super();
  }

  push(...items: T[]): number {
    const length = super.push(...items);
    this.persistSnapshot();
    return length;
  }

  splice(start: number, deleteCount?: number, ...items: T[]): T[] {
    const removed = super.splice(start, deleteCount ?? 0, ...items);
    this.persistSnapshot();
    return removed;
  }

  private persistSnapshot(): void {
    this.persister.queueUpsert(this.collection, "__array__", [...this]);
  }
}

export const HCM_PERSISTENT_COLLECTIONS = [
  "orgUnits",
  "positions",
  "reporting",
  "employees",
  "employeeFingerprints",
  "employments",
  "assignments",
  "candidates",
  "applications",
  "offers",
  "onboardingProcesses",
  "onboardingTasks",
  "documentRequirements",
  "documents",
  "verifications",
  "provisioningTasks",
  "attendance",
  "attendanceExceptions",
  "shifts",
  "rosters",
  "leaveRequests",
  "leaveBalances",
  "leavePolicies",
  "holidayCalendars",
  "workCalendars",
  "overtime",
  "payrollCalendars",
  "payrollPeriods",
  "payrollRuns",
  "payrollEntries",
  "payrollComponents",
  "payrollAdjustments",
  "payrollResults",
  "goals",
  "objectives",
  "performanceReviews",
  "competencies",
  "competencyAssessments",
  "developmentPlans",
  "trainingCourses",
  "learningPrograms",
  "enrollments",
  "certifications",
  "careerPaths",
  "successionPlans",
  "talentProfiles",
] as const;

export type HcmPersistentCollection = (typeof HCM_PERSISTENT_COLLECTIONS)[number];
