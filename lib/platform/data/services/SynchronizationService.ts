import type { EnqueueSyncInput, SyncJobRecord } from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import { createSyncJobId } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { SynchronizationEngine } from "@/lib/platform/data/synchronization/SynchronizationEngine";
import { publishSynchronizationEvent } from "@/lib/platform/data/synchronization-events";
import type { ServiceContext } from "@/types/services";

/** Primary synchronization entry point (Mission P-011.5). */
export class SynchronizationService {
  private readonly engine: SynchronizationEngine;

  constructor(
    private readonly repository: SynchronizationRepository,
    private readonly auditRecorder: (jobId: string, action: string, detail: string, context: ServiceContext) => void,
  ) {
    this.engine = new SynchronizationEngine(repository);
  }

  enqueue(input: EnqueueSyncInput, context: ServiceContext): SyncJobRecord {
    const jobId = createSyncJobId();

    publishSynchronizationEvent(
      {
        eventType: "SynchronizationStarted",
        jobId,
        entityType: input.entityType,
        entityId: input.entityId,
        correlationId: input.correlationId,
        payload: { changeEventType: input.changeEventType, syncType: input.syncType },
      },
      context,
    );

    const result = this.engine.execute(
      input,
      context,
      (jobId, action, detail) => this.auditRecorder(jobId, action, detail, context),
      { jobId },
    );

    publishSynchronizationEvent(
      {
        eventType: result.eventType,
        jobId: result.job.id,
        entityType: result.job.entityType,
        entityId: result.job.entityId,
        correlationId: result.job.correlationId,
        payload: {
          status: result.job.status,
          conflictDetected: String(result.job.conflictDetected),
        },
      },
      context,
    );

    return result.job;
  }

  retry(jobId: string, context: ServiceContext): SyncJobRecord {
    const result = this.engine.retry(jobId, context, (id, action, detail) =>
      this.auditRecorder(id, action, detail, context),
    );

    publishSynchronizationEvent(
      {
        eventType: "SynchronizationRetried",
        jobId: result.job.id,
        entityType: result.job.entityType,
        entityId: result.job.entityId,
        correlationId: result.job.correlationId,
        payload: { retryCount: String(result.job.retryCount), status: result.job.status },
      },
      context,
    );

    if (result.eventType !== "SynchronizationRetried") {
      publishSynchronizationEvent(
        {
          eventType: result.eventType,
          jobId: result.job.id,
          entityType: result.job.entityType,
          entityId: result.job.entityId,
          correlationId: result.job.correlationId,
        },
        context,
      );
    }

    return result.job;
  }

  getJob(jobId: string, context: ServiceContext): SyncJobRecord | null {
    return this.repository.findJob(context.organizationId, jobId);
  }

  listJobs(context: ServiceContext, limit = 50): readonly SyncJobRecord[] {
    return this.repository.listJobs(context.organizationId, limit);
  }
}
