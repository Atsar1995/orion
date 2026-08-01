import type { SyncAuditRecord, SyncConflictRecord } from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import { createSyncAuditId } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import type { ServiceContext } from "@/types/services";

/** Synchronization audit trail (Mission P-011.5). */
export class SynchronizationAuditService {
  constructor(private readonly repository: SynchronizationRepository) {}

  record(jobId: string, action: string, detail: string, context: ServiceContext): SyncAuditRecord {
    const audit: SyncAuditRecord = {
      id: createSyncAuditId(),
      organizationId: context.organizationId,
      jobId,
      action,
      detail,
      actorId: context.userId ?? "system",
      createdAt: new Date().toISOString(),
    };
    return this.repository.saveAudit(audit);
  }

  listAudits(context: ServiceContext, jobId?: string, limit = 100): readonly SyncAuditRecord[] {
    return this.repository.listAudits(context.organizationId, jobId, limit);
  }

  resolveConflict(
    conflictId: string,
    resolution: string,
    context: ServiceContext,
  ): SyncConflictRecord {
    const conflict = this.repository.findConflict(context.organizationId, conflictId);
    if (!conflict) throw new Error("CONFLICT_NOT_FOUND");

    const resolved: SyncConflictRecord = {
      ...conflict,
      resolved: true,
      resolution,
      resolvedAt: new Date().toISOString(),
    };

    this.record(conflict.jobId, "conflict_resolved", resolution, context);
    return this.repository.saveConflict(resolved);
  }
}
