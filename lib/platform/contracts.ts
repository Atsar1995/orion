/**
 * ORION Platform Services — service contracts.
 */

import type {
  ActivityRecord,
  AuditRecord,
  ConfigurationEntry,
  DateRange,
  EnqueueJobRequest,
  FeatureFlag,
  FeatureFlagScope,
  NotificationDeliveryStatus,
  NotificationRequest,
  PlatformEvent,
  PlatformEventHandler,
  PlatformJob,
  ScheduleJobRequest,
  ScheduledNotificationRequest,
  ServiceContext,
  ServiceHealth,
  ServiceMetadata,
  ServiceResult,
} from "@/types/services";

/** Base contract for all platform services. */
export interface PlatformService {
  readonly metadata: ServiceMetadata;
}

/** Contract for services that expose health status. */
export interface HealthCheckService extends PlatformService {
  checkHealth(): Promise<ServiceResult<ServiceHealth>>;
}

/** Contract for services with runtime configuration exposure. */
export interface ConfigurableService extends PlatformService {
  getServiceConfiguration(
    context: ServiceContext,
  ): Promise<ServiceResult<Record<string, string>>>;
}

/** Contract for services with explicit lifecycle management. */
export interface LifecycleService extends PlatformService {
  initialize(): Promise<ServiceResult<void>>;
  shutdown(): Promise<ServiceResult<void>>;
}

/** Contract for publishing platform events. */
export interface EventPublisher extends PlatformService {
  publish(
    event: PlatformEvent,
    context: ServiceContext,
  ): Promise<ServiceResult<void>>;
}

/** Contract for subscribing to platform events. */
export interface EventSubscriber extends PlatformService {
  subscribe(
    eventType: string,
    handler: PlatformEventHandler,
    context: ServiceContext,
  ): Promise<ServiceResult<string>>;

  unsubscribe(
    subscriptionId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<void>>;
}

/** Contract for delivering platform notifications. */
export interface NotificationService extends PlatformService {
  send(
    notification: NotificationRequest,
    context: ServiceContext,
  ): Promise<ServiceResult<string>>;

  schedule(
    notification: ScheduledNotificationRequest,
    context: ServiceContext,
  ): Promise<ServiceResult<string>>;

  cancel(
    notificationId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<void>>;

  getDeliveryStatus(
    notificationId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<NotificationDeliveryStatus>>;
}

/** Contract for recording operational platform activity. */
export interface ActivityService extends PlatformService {
  record(
    activity: Omit<ActivityRecord, "id" | "timestamp">,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord>>;

  findByUser(
    userId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>>;

  findByModule(
    module: string,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>>;

  findByDateRange(
    range: DateRange,
    context: ServiceContext,
  ): Promise<ServiceResult<ActivityRecord[]>>;
}

/** Contract for recording security and compliance audit events. */
export interface AuditService extends PlatformService {
  record(
    audit: Omit<AuditRecord, "id" | "timestamp">,
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord>>;

  findByOrganization(
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>>;

  findByWorkspace(
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>>;

  findByActor(
    actorUserId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<AuditRecord[]>>;
}

/** Contract for enqueueing and managing background jobs. */
export interface BackgroundJobService extends PlatformService {
  enqueue(
    job: EnqueueJobRequest,
    context: ServiceContext,
  ): Promise<ServiceResult<PlatformJob>>;

  schedule(
    job: ScheduleJobRequest,
    context: ServiceContext,
  ): Promise<ServiceResult<PlatformJob>>;

  cancel(
    jobId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<void>>;

  getStatus(
    jobId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<PlatformJob>>;

  retry(
    jobId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<PlatformJob>>;
}

/** Contract for evaluating feature flags. */
export interface FeatureFlagService extends PlatformService {
  getFeatureFlag(
    key: string,
    scope: FeatureFlagScope,
    context: ServiceContext,
    scopeId?: string,
  ): Promise<ServiceResult<FeatureFlag | null>>;

  isFeatureEnabled(
    key: string,
    scope: FeatureFlagScope,
    context: ServiceContext,
    scopeId?: string,
  ): Promise<ServiceResult<boolean>>;
}

/** Contract for reading and writing platform configuration. */
export interface ConfigurationService extends PlatformService {
  get(
    key: string,
    scope: FeatureFlagScope,
    context: ServiceContext,
    scopeId?: string,
  ): Promise<ServiceResult<ConfigurationEntry | null>>;

  set(
    entry: Omit<ConfigurationEntry, "updatedAt">,
    context: ServiceContext,
  ): Promise<ServiceResult<ConfigurationEntry>>;
}
