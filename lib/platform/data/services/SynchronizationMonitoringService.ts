import type { SyncMonitoringStats } from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import type { ServiceContext } from "@/types/services";

/** Synchronization monitoring and statistics (Mission P-011.5). */
export class SynchronizationMonitoringService {
  constructor(private readonly repository: SynchronizationRepository) {}

  getStats(context: ServiceContext): SyncMonitoringStats {
    const jobs = this.repository.listJobs(context.organizationId, 1000);
    const subscriptions = this.repository.listSubscriptions(context.organizationId);

    return {
      organizationId: context.organizationId,
      totalJobs: jobs.length,
      pendingJobs: jobs.filter((j) => j.status === "pending").length,
      inProgressJobs: jobs.filter((j) => j.status === "in_progress").length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      failedJobs: jobs.filter((j) => j.status === "failed").length,
      conflictJobs: jobs.filter((j) => j.status === "conflict").length,
      retryPendingJobs: jobs.filter((j) => j.status === "retry_pending").length,
      activeSubscriptions: subscriptions.filter((s) => s.active).length,
    };
  }

  listUnresolvedConflicts(context: ServiceContext) {
    return this.repository.listConflicts(context.organizationId, true);
  }
}
