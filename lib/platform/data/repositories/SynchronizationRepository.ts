import type {
  SyncAuditRecord,
  SyncConflictRecord,
  SyncJobRecord,
  SyncSubscription,
  SynchronizationPolicy,
} from "@/types/enterprise-data-synchronization";

/** Internal synchronization persistence (Mission P-011.5). */
export type SynchronizationRepository = {
  readonly domain: "platform";

  listSubscriptions(organizationId: string): readonly SyncSubscription[];
  findSubscription(id: string): SyncSubscription | null;
  saveSubscription(subscription: SyncSubscription): SyncSubscription;

  listPolicies(organizationId?: string): readonly SynchronizationPolicy[];
  findPolicy(id: string): SynchronizationPolicy | null;
  savePolicy(policy: SynchronizationPolicy): SynchronizationPolicy;

  saveJob(job: SyncJobRecord): SyncJobRecord;
  findJob(organizationId: string, jobId: string): SyncJobRecord | null;
  listJobs(organizationId: string, limit?: number): readonly SyncJobRecord[];

  saveConflict(conflict: SyncConflictRecord): SyncConflictRecord;
  findConflict(organizationId: string, conflictId: string): SyncConflictRecord | null;
  listConflicts(organizationId: string, unresolvedOnly?: boolean): readonly SyncConflictRecord[];

  saveAudit(audit: SyncAuditRecord): SyncAuditRecord;
  listAudits(organizationId: string, jobId?: string, limit?: number): readonly SyncAuditRecord[];

  getLastAcceptedVersion(organizationId: string, entityType: string, entityId: string): number | null;
  setLastAcceptedVersion(organizationId: string, entityType: string, entityId: string, version: number): void;
};
