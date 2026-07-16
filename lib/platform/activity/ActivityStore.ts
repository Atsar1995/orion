/**
 * ORION Platform Activity — append-only in-memory activity store.
 */

import type { ActivityRecord, ServiceContext } from "@/types/services";

/** Query filters for activity store lookups. */
export interface ActivityQueryFilter {
  userId?: string;
  eventType?: string;
  module?: string;
}

/** Append-only, tenant-aware in-memory activity record store. */
export class ActivityStore {
  private readonly records: ActivityRecord[] = [];

  /** Appends an activity record. Records are never modified after insertion. */
  append(record: ActivityRecord): void {
    this.records.push(record);
  }

  /** Returns tenant-scoped activity records matching optional filters. */
  find(
    context: ServiceContext,
    filter: ActivityQueryFilter = {},
  ): ActivityRecord[] {
    return this.records.filter((record) => {
      if (!this.matchesTenantScope(record, context)) {
        return false;
      }

      if (filter.userId !== undefined && record.actorUserId !== filter.userId) {
        return false;
      }

      if (filter.eventType !== undefined && record.type !== filter.eventType) {
        return false;
      }

      if (filter.module !== undefined && record.module !== filter.module) {
        return false;
      }

      return true;
    });
  }

  /** Returns all activity records for the active tenant scope. */
  findAll(context: ServiceContext): ActivityRecord[] {
    return this.find(context);
  }

  /** Returns activity records for the active organization and workspace. */
  findByOrganization(context: ServiceContext): ActivityRecord[] {
    return this.find(context);
  }

  /** Returns activity records for a specific user within the tenant scope. */
  findByUser(userId: string, context: ServiceContext): ActivityRecord[] {
    return this.find(context, { userId });
  }

  /** Returns activity records for a specific event type within the tenant scope. */
  findByEventType(eventType: string, context: ServiceContext): ActivityRecord[] {
    return this.find(context, { eventType });
  }

  /** Returns the number of activity records in the active tenant scope. */
  count(context: ServiceContext): number {
    return this.find(context).length;
  }

  /** Clears all stored activity records. Intended for development and testing only. */
  clear(): void {
    this.records.length = 0;
  }

  private matchesTenantScope(
    record: Pick<ActivityRecord, "organizationId" | "workspaceId">,
    context: ServiceContext,
  ): boolean {
    return (
      record.organizationId === context.organizationId &&
      record.workspaceId === context.workspaceId
    );
  }
}
