/**
 * ORION Platform Services Foundation — public API.
 *
 * Contracts and helpers for tenant-aware platform services.
 *
 * @see docs/02_Engineering/ES-011-Platform-Services-Foundation.md
 */

// Service contracts
export type {
  ActivityService,
  AuditService,
  BackgroundJobService,
  ConfigurableService,
  ConfigurationService,
  EventPublisher,
  EventSubscriber,
  FeatureFlagService,
  HealthCheckService,
  LifecycleService,
  NotificationService,
  PlatformService,
} from "@/lib/platform/contracts";

// Result helpers
export {
  failure,
  isFailure,
  isSuccess,
  mapResult,
  success,
  unwrapOrNull,
} from "@/lib/platform/result";

// Error factories
export {
  configurationError,
  dependencyError,
  notImplementedError,
  serviceUnavailableError,
  unknownServiceError,
  validationError,
} from "@/lib/platform/errors";

// Core types
export { ServiceErrorCode, ServiceHealth, ServiceStatus } from "@/types/services";
export type {
  ActivityRecord,
  AuditOutcome,
  AuditRecord,
  ConfigurationEntry,
  DateRange,
  EnqueueJobRequest,
  FeatureFlag,
  FeatureFlagScope,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationRequest,
  PlatformEvent,
  PlatformEventHandler,
  PlatformJob,
  ScheduleJobRequest,
  ScheduledNotificationRequest,
  ServiceContext,
  ServiceError,
  ServiceMetadata,
  ServiceResult,
} from "@/types/services";
