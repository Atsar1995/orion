/**
 * ORION Platform Audit — append-only immutable in-memory audit store.
 */

import type { AuditRecord, ServiceContext } from "@/types/services";

/** Audit severity levels stored in record metadata. */
export type AuditSeverity = "info" | "warning" | "error" | "critical";

/** Query filters for audit store lookups. */
export interface AuditQueryFilter {
  userId?: string;
  eventType?: string;
  severity?: AuditSeverity;
}

/** Append-only, immutable, tenant-aware in-memory audit record store. */
export class AuditStore {
  private readonly records: AuditRecord[] = [];

  /** Appends an audit record. Records are never modified after insertion. */
  append(record: AuditRecord): void {
    this.records.push(record);
  }

  /** Returns tenant-scoped audit records matching optional filters. */
  find(
    context: ServiceContext,
    filter: AuditQueryFilter = {},
  ): AuditRecord[] {
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

      if (
        filter.severity !== undefined &&
        record.metadata?.severity !== filter.severity
      ) {
        return false;
      }

      return true;
    });
  }

  /** Returns all audit records for the active tenant scope. */
  findAll(context: ServiceContext): AuditRecord[] {
    return this.find(context);
  }

  /** Returns audit records for the active organization and workspace. */
  findByOrganization(context: ServiceContext): AuditRecord[] {
    return this.find(context);
  }

  /** Returns audit records for the active workspace within the tenant scope. */
  findByWorkspace(context: ServiceContext): AuditRecord[] {
    return this.find(context);
  }

  /** Returns audit records for a specific user within the tenant scope. */
  findByUser(userId: string, context: ServiceContext): AuditRecord[] {
    return this.find(context, { userId });
  }

  /** Returns audit records for a specific severity within the tenant scope. */
  findBySeverity(
    severity: AuditSeverity,
    context: ServiceContext,
  ): AuditRecord[] {
    return this.find(context, { severity });
  }

  /** Returns the number of audit records in the active tenant scope. */
  count(context: ServiceContext): number {
    return this.find(context).length;
  }

  /** Clears all stored audit records. Intended for development and testing only. */
  clear(): void {
    this.records.length = 0;
  }

  private matchesTenantScope(
    record: Pick<AuditRecord, "organizationId" | "workspaceId">,
    context: ServiceContext,
  ): boolean {
    return (
      record.organizationId === context.organizationId &&
      record.workspaceId === context.workspaceId
    );
  }
}
