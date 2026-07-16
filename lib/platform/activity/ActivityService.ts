/**
 * ORION Platform Activity — in-memory activity service.
 */

import type {
  ActivityRecord,
  DateRange,
  PlatformEvent,
  ServiceContext,
  ServiceHealth,
  ServiceMetadata,
  ServiceResult,
} from "@/types/services";
import { ServiceHealth as ServiceHealthState } from "@/types/services";
import type {
  ActivityService as ActivityServiceContract,
  HealthCheckService,
} from "@/lib/platform/contracts";
import type { EventSubscriber } from "@/lib/platform/contracts";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import { validatePlatformServiceContext } from "@/lib/platform/shared";
import { ActivityStore } from "@/lib/platform/activity/ActivityStore";

const ACTIVITY_SERVICE_METADATA: ServiceMetadata = {
  serviceName: "ActivityService",
  version: "1.0.0",
  description: "In-memory platform activity service",
};

/** Platform event types consumed by the activity service. */
const ACTIVITY_EVENT_TYPES = [
  "user.created",
  "user.updated",
  "session.expired",
  "permission.changed",
  "entity.created",
  "entity.updated",
  "entity.deleted",
  "notification.sent",
  "notification.failed",
  "job.completed",
  "job.failed",
  "config.changed",
  "auth.login.success",
  "auth.login.failure",
  "auth.logout",
  "auth.password.reset",
  "auth.password.changed",
  "auth.account.locked",
  "auth.access.denied",
  "authorization.denied",
  "security.alert",
  "persistence.failure",
  "entity.tenant_violation",
] as const;

/** Internal framework sources excluded from activity capture. */
const INTERNAL_FRAMEWORK_SOURCES = new Set([
  "platform.events",
  "platform.activity",
  "platform.audit",
]);

/** Internal framework event types excluded from activity capture. */
const INTERNAL_FRAMEWORK_EVENT_TYPES = new Set([
  "platform.internal.subscription",
  "platform.internal.dispatch",
]);

let activitySequence = 0;

/** Creates a unique activity record identifier. */
export function createActivityId(): string {
  activitySequence += 1;
  return `activity-${activitySequence}`;
}

/** Returns true when an event originates from internal platform framework plumbing. */
export function isInternalFrameworkEvent(event: PlatformEvent): boolean {
  if (INTERNAL_FRAMEWORK_SOURCES.has(event.source)) {
    return true;
  }

  if (INTERNAL_FRAMEWORK_EVENT_TYPES.has(event.type)) {
    return true;
  }

  return (
    event.type.startsWith("platform.internal.") ||
    event.type.startsWith("platform.events.")
  );
}

/** Converts a platform event into an activity record. */
export function platformEventToActivityRecord(
  event: PlatformEvent,
): ActivityRecord {
  return {
    id: event.eventId,
    type: event.type,
    timestamp: event.timestamp,
    actorUserId: event.tenantContext.userId,
    organizationId: event.tenantContext.organizationId,
    workspaceId: event.tenantContext.workspaceId,
    module: event.payload.module ?? event.metadata?.module ?? event.source,
    entityType: event.payload.entityType ?? event.metadata?.entityType,
    entityId: event.payload.entityId ?? event.metadata?.entityId,
    description:
      event.payload.description ?? event.metadata?.description ?? event.type,
    metadata: event.metadata,
  };
}

/** In-memory implementation of the platform activity service contract. */
export class InMemoryActivityService
  implements ActivityServiceContract, HealthCheckService
{
  readonly metadata = ACTIVITY_SERVICE_METADATA;

  private readonly subscriptionIds: string[] = [];
  private initialized = false;

  constructor(
    private readonly eventSubscriber: EventSubscriber,
    private readonly store: ActivityStore = new ActivityStore(),
  ) {}

  /** Registers platform event subscriptions for activity capture. */
  async initialize(context: ServiceContext): Promise<ServiceResult<void>> {
    if (this.initialized) {
      return success(undefined);
    }

    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    for (const eventType of ACTIVITY_EVENT_TYPES) {
      const subscriptionResult = await this.eventSubscriber.subscribe(
        eventType,
        (event) => this.handlePlatformEvent(event),
        context,
      );

      if (!subscriptionResult.success) {
        return subscriptionResult;
      }

      this.subscriptionIds.push(subscriptionResult.data);
    }

    this.initialized = true;
    return success(undefined);
  }

  async record(
    activity: Omit<ActivityRecord, "id" | "timestamp">,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const alignmentResult = this.validateActivityTenantAlignment(activity, context);

    if (!alignmentResult.success) {
      return alignmentResult;
    }

    if (!activity.type.trim()) {
      return failure(
        validationError({
          message: "ActivityRecord.type is required.",
        }),
      );
    }

    if (!activity.description.trim()) {
      return failure(
        validationError({
          message: "ActivityRecord.description is required.",
        }),
      );
    }

    const record: ActivityRecord = {
      id: createActivityId(),
      timestamp: new Date(),
      ...activity,
      type: activity.type.trim(),
      description: activity.description.trim(),
    };

    this.store.append(record);

    return success(record);
  }

  async findAll(context: ServiceContext): Promise<ServiceResult<ActivityRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.findAll(context));
  }

  async findByOrganization(
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.findByOrganization(context));
  }

  async findByUser(
    userId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (!userId.trim()) {
      return failure(
        validationError({
          message: "User id is required.",
        }),
      );
    }

    return success(this.store.findByUser(userId.trim(), context));
  }

  async findByModule(
    module: string,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (!module.trim()) {
      return failure(
        validationError({
          message: "Module is required.",
        }),
      );
    }

    return success(
      this.store.find(context, {
        module: module.trim(),
      }),
    );
  }

  async findByDateRange(
    range: DateRange,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (
      !(range.from instanceof Date) ||
      Number.isNaN(range.from.getTime()) ||
      !(range.to instanceof Date) ||
      Number.isNaN(range.to.getTime())
    ) {
      return failure(
        validationError({
          message: "DateRange.from and DateRange.to must be valid dates.",
        }),
      );
    }

    if (range.from.getTime() > range.to.getTime()) {
      return failure(
        validationError({
          message: "DateRange.from must be earlier than or equal to DateRange.to.",
        }),
      );
    }

    const records = this.store.findAll(context).filter((record) => {
      const timestamp = record.timestamp.getTime();
      return timestamp >= range.from.getTime() && timestamp <= range.to.getTime();
    });

    return success(records);
  }

  async count(context: ServiceContext): Promise<ServiceResult<number>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return success(this.store.count(context));
  }

  /** Clears stored activity records. Intended for development and testing only. */
  clear(): void {
    this.store.clear();
  }

  async checkHealth(): Promise<ServiceResult<ServiceHealth>> {
    return success(ServiceHealthState.Healthy);
  }

  private async handlePlatformEvent(
    event: PlatformEvent,
  ): Promise<ServiceResult<void>> {
    if (isInternalFrameworkEvent(event)) {
      return success(undefined);
    }

    const contextResult = validatePlatformServiceContext(event.tenantContext);

    if (!contextResult.success) {
      return contextResult;
    }

    this.store.append(platformEventToActivityRecord(event));

    return success(undefined);
  }

  private validateActivityTenantAlignment(
    activity: Omit<ActivityRecord, "id" | "timestamp">,
    context: ServiceContext,
  ): ServiceResult<Omit<ActivityRecord, "id" | "timestamp">> {
    if (
      activity.organizationId !== context.organizationId ||
      activity.workspaceId !== context.workspaceId
    ) {
      return failure(
        validationError({
          message: "ActivityRecord tenant scope does not match the active service context.",
          details: {
            expectedOrganizationId: context.organizationId,
            expectedWorkspaceId: context.workspaceId,
            actualOrganizationId: activity.organizationId,
            actualWorkspaceId: activity.workspaceId,
          },
        }),
      );
    }

    return success(activity);
  }
}
