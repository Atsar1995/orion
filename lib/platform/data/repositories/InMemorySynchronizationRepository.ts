import { randomUUID } from "crypto";
import type {
  SyncAuditRecord,
  SyncConflictRecord,
  SyncJobRecord,
  SyncSubscription,
  SynchronizationPolicy,
} from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import {
  seedSyncPolicies,
  seedSyncSubscriptions,
} from "@/lib/platform/data/data/seed-synchronization-registry";

/** In-memory synchronization repository (Mission P-011.5). */
export class InMemorySynchronizationRepository implements SynchronizationRepository {
  readonly domain = "platform" as const;

  private readonly subscriptions = new Map<string, SyncSubscription>();
  private readonly policies = new Map<string, SynchronizationPolicy>();
  private readonly jobs = new Map<string, SyncJobRecord>();
  private readonly conflicts = new Map<string, SyncConflictRecord>();
  private readonly audits = new Map<string, SyncAuditRecord>();
  private readonly acceptedVersions = new Map<string, number>();

  constructor() {
    for (const sub of seedSyncSubscriptions()) {
      this.subscriptions.set(sub.id, sub);
    }
    for (const policy of seedSyncPolicies()) {
      this.policies.set(policy.id, policy);
    }
  }

  listSubscriptions(organizationId: string): readonly SyncSubscription[] {
    return [...this.subscriptions.values()]
      .filter((s) => s.organizationId === organizationId && s.active)
      .sort((a, b) => a.subscriberId.localeCompare(b.subscriberId));
  }

  findSubscription(id: string): SyncSubscription | null {
    return this.subscriptions.get(id) ?? null;
  }

  saveSubscription(subscription: SyncSubscription): SyncSubscription {
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  listPolicies(organizationId?: string): readonly SynchronizationPolicy[] {
    return [...this.policies.values()]
      .filter(
        (p) =>
          p.active &&
          (!organizationId || !p.organizationId || p.organizationId === organizationId),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  findPolicy(id: string): SynchronizationPolicy | null {
    return this.policies.get(id) ?? null;
  }

  savePolicy(policy: SynchronizationPolicy): SynchronizationPolicy {
    this.policies.set(policy.id, policy);
    return policy;
  }

  saveJob(job: SyncJobRecord): SyncJobRecord {
    this.jobs.set(job.id, job);
    return job;
  }

  findJob(organizationId: string, jobId: string): SyncJobRecord | null {
    const job = this.jobs.get(jobId);
    if (!job || job.organizationId !== organizationId) return null;
    return job;
  }

  listJobs(organizationId: string, limit = 100): readonly SyncJobRecord[] {
    return [...this.jobs.values()]
      .filter((j) => j.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  saveConflict(conflict: SyncConflictRecord): SyncConflictRecord {
    this.conflicts.set(conflict.id, conflict);
    return conflict;
  }

  findConflict(organizationId: string, conflictId: string): SyncConflictRecord | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict || conflict.organizationId !== organizationId) return null;
    return conflict;
  }

  listConflicts(organizationId: string, unresolvedOnly = false): readonly SyncConflictRecord[] {
    return [...this.conflicts.values()]
      .filter((c) => c.organizationId === organizationId && (!unresolvedOnly || !c.resolved))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  saveAudit(audit: SyncAuditRecord): SyncAuditRecord {
    this.audits.set(audit.id, audit);
    return audit;
  }

  listAudits(organizationId: string, jobId?: string, limit = 100): readonly SyncAuditRecord[] {
    return [...this.audits.values()]
      .filter((a) => a.organizationId === organizationId && (!jobId || a.jobId === jobId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  getLastAcceptedVersion(organizationId: string, entityType: string, entityId: string): number | null {
    return this.acceptedVersions.get(`${organizationId}:${entityType}:${entityId}`) ?? null;
  }

  setLastAcceptedVersion(organizationId: string, entityType: string, entityId: string, version: number): void {
    this.acceptedVersions.set(`${organizationId}:${entityType}:${entityId}`, version);
  }
}

export const defaultSynchronizationRepository = new InMemorySynchronizationRepository();

export function createSyncJobId(): string {
  return `sync-${randomUUID()}`;
}

export function createSyncSubscriptionId(): string {
  return `ssub-${randomUUID()}`;
}

export function createSyncPolicyId(): string {
  return `spolicy-${randomUUID()}`;
}

export function createSyncConflictId(): string {
  return `sconf-${randomUUID()}`;
}

export function createSyncAuditId(): string {
  return `saud-${randomUUID()}`;
}
