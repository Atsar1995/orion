import { randomUUID } from "crypto";
import type {
  EnqueueSyncInput,
  SyncConflictRecord,
  SyncJobRecord,
  SyncSubscription,
  SynchronizationPolicy,
} from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import {
  createSyncConflictId,
  createSyncJobId,
} from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { synchronizationRulesEngine } from "@/lib/platform/data/SynchronizationRulesEngine";
import type { ServiceContext } from "@/types/services";

export type SyncPipelineResult = {
  readonly job: SyncJobRecord;
  readonly conflict?: SyncConflictRecord;
  readonly eventType:
    | "SynchronizationStarted"
    | "SynchronizationCompleted"
    | "SynchronizationFailed"
    | "SynchronizationConflictDetected"
    | "SynchronizationRetried";
};

export type SynchronizationExecuteOptions = {
  readonly jobId?: string;
};

/** Synchronization pipeline engine (Mission P-011.5). */
export class SynchronizationEngine {
  constructor(private readonly repository: SynchronizationRepository) {}

  execute(
    input: EnqueueSyncInput,
    context: ServiceContext,
    auditFn: (jobId: string, action: string, detail: string) => void,
    options?: SynchronizationExecuteOptions,
  ): SyncPipelineResult {
    const errors = synchronizationRulesEngine.validateEnqueue(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    if (!context.organizationId.trim()) throw new Error("ORG_CONTEXT_REQUIRED");

    const policy = this.resolvePolicy(input, context);
    const now = new Date().toISOString();
    const correlationId = input.correlationId ?? `corr-${randomUUID()}`;

    let job: SyncJobRecord = {
      id: options?.jobId ?? createSyncJobId(),
      organizationId: context.organizationId,
      syncType: input.syncType,
      changeEventType: input.changeEventType,
      entityType: input.entityType,
      entityId: input.entityId,
      sourceVersion: input.sourceVersion,
      targetVersion: input.incomingVersion,
      status: "pending",
      policyId: policy?.id,
      subscriptionIds: [],
      correlationId,
      retryCount: 0,
      conflictDetected: false,
      createdAt: now,
      updatedAt: now,
    };

    this.repository.saveJob(job);
    auditFn(job.id, "change_detected", `Detected ${input.changeEventType} for ${input.entityType ?? "unknown"}`);

    if (policy?.requireValidation && input.payload?.validationPassed !== "true") {
      job = this.updateJob(job, { status: "failed", lastError: "VALIDATION_REQUIRED" });
      auditFn(job.id, "validation_failed", "Synchronization blocked — validation not passed.");
      return { job, eventType: "SynchronizationFailed" };
    }

    const subscriptions = synchronizationRulesEngine.resolveMatchingSubscriptions(
      this.repository.listSubscriptions(context.organizationId),
      input,
    );

    if (subscriptions.length === 0) {
      job = this.updateJob(job, { status: "failed", lastError: "NO_SUBSCRIBERS" });
      auditFn(job.id, "subscription_failed", "No matching subscribers found.");
      return { job, eventType: "SynchronizationFailed" };
    }

    job = this.updateJob(job, {
      status: "in_progress",
      subscriptionIds: subscriptions.map((s) => s.id),
    });
    auditFn(job.id, "policy_evaluated", `Policy ${policy?.name ?? "default"} applied.`);

    let conflict: SyncConflictRecord | undefined;
    if (input.entityType && input.entityId && input.incomingVersion !== undefined) {
      const lastAccepted = this.repository.getLastAcceptedVersion(
        context.organizationId,
        input.entityType,
        input.entityId,
      );

      const hasConflict = synchronizationRulesEngine.detectVersionConflict(
        lastAccepted,
        input.incomingVersion,
      );

      if (hasConflict && policy) {
        const resolution = synchronizationRulesEngine.resolveConflict(
          policy.conflictStrategy,
          lastAccepted,
          input.incomingVersion,
        );

        if (!resolution.resolved || resolution.requiresManual) {
          conflict = this.repository.saveConflict({
            id: createSyncConflictId(),
            jobId: job.id,
            organizationId: context.organizationId,
            entityType: input.entityType,
            entityId: input.entityId,
            sourceVersion: lastAccepted ?? 0,
            incomingVersion: input.incomingVersion,
            resolutionStrategy: policy.conflictStrategy,
            resolved: false,
            createdAt: now,
          });

          job = this.updateJob(job, { status: "conflict", conflictDetected: true });
          auditFn(job.id, "conflict_detected", `Version conflict: accepted=${lastAccepted}, incoming=${input.incomingVersion}`);
          return { job, conflict, eventType: "SynchronizationConflictDetected" };
        }

        if (resolution.acceptIncoming) {
          this.repository.setLastAcceptedVersion(
            context.organizationId,
            input.entityType,
            input.entityId,
            input.incomingVersion,
          );
        }
      } else if (input.incomingVersion !== undefined) {
        this.repository.setLastAcceptedVersion(
          context.organizationId,
          input.entityType,
          input.entityId,
          input.incomingVersion,
        );
      }
    }

    this.deliverToSubscribers(job, subscriptions, auditFn);

    job = this.updateJob(job, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
    auditFn(job.id, "synchronization_confirmed", `Delivered to ${subscriptions.length} subscriber(s).`);

    return { job, conflict, eventType: "SynchronizationCompleted" };
  }

  retry(jobId: string, context: ServiceContext, auditFn: (jobId: string, action: string, detail: string) => void): SyncPipelineResult {
    const existing = this.repository.findJob(context.organizationId, jobId);
    if (!existing) throw new Error("JOB_NOT_FOUND");

    const policy = existing.policyId ? this.repository.findPolicy(existing.policyId) : null;
    const maxRetries = policy?.maxRetries ?? 3;

    if (existing.retryCount >= maxRetries) {
      const failed = this.updateJob(existing, { status: "failed", lastError: "MAX_RETRIES_EXCEEDED" });
      auditFn(failed.id, "retry_exhausted", `Max retries (${maxRetries}) exceeded.`);
      return { job: failed, eventType: "SynchronizationFailed" };
    }

    const retried = this.updateJob(existing, {
      status: "retry_pending",
      retryCount: existing.retryCount + 1,
      lastError: undefined,
    });
    auditFn(retried.id, "retry_scheduled", `Retry attempt ${retried.retryCount}.`);

    return this.execute(
      {
        syncType: retried.syncType,
        changeEventType: retried.changeEventType,
        entityType: retried.entityType,
        entityId: retried.entityId,
        sourceVersion: retried.sourceVersion,
        incomingVersion: retried.targetVersion,
        correlationId: retried.correlationId,
        policyId: retried.policyId,
        payload: { validationPassed: "true" },
      },
      context,
      auditFn,
    );
  }

  private resolvePolicy(input: EnqueueSyncInput, context: ServiceContext): SynchronizationPolicy | null {
    if (input.policyId) {
      const policy = this.repository.findPolicy(input.policyId);
      if (policy?.active) return policy;
    }

    const policies = this.repository.listPolicies(context.organizationId);
    return (
      policies.find((p) => p.organizationId === context.organizationId) ??
      policies.find((p) => !p.organizationId) ??
      null
    );
  }

  private deliverToSubscribers(
    job: SyncJobRecord,
    subscriptions: readonly SyncSubscription[],
    auditFn: (jobId: string, action: string, detail: string) => void,
  ): void {
    for (const sub of subscriptions) {
      auditFn(job.id, "synchronized", `Delivered to ${sub.subscriberService} (${sub.domainKey}).`);
    }
  }

  private updateJob(job: SyncJobRecord, patch: Partial<SyncJobRecord>): SyncJobRecord {
    const updated: SyncJobRecord = {
      ...job,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return this.repository.saveJob(updated);
  }
}
