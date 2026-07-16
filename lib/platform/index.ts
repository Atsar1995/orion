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

// Event services
export {
  EventBus,
  InMemoryEventPublisher,
  InMemoryEventSubscriber,
  createCorrelationId,
  createEventId,
  createInMemoryEventServices,
  createPlatformEvent,
} from "@/lib/platform/events";

// Activity services
export { ActivityStore } from "@/lib/platform/activity/ActivityStore";
export type { ActivityQueryFilter } from "@/lib/platform/activity/ActivityStore";
export {
  InMemoryActivityService,
  createActivityId,
  isInternalFrameworkEvent,
  platformEventToActivityRecord,
} from "@/lib/platform/activity/ActivityService";

// Audit services
export { AuditStore } from "@/lib/platform/audit/AuditStore";
export type { AuditQueryFilter, AuditSeverity } from "@/lib/platform/audit/AuditStore";
export {
  InMemoryAuditService,
  createAuditId,
  isAuditEligibleEvent,
  platformEventToAuditRecord,
  resolveAuditSeverity,
} from "@/lib/platform/audit/AuditService";

// Core types
export { ServiceErrorCode, ServiceHealth, ServiceStatus } from "@/types/services";
export type {
  ActivityRecord,
  AuditOutcome,
  AuditRecord,
  ConfigurationEntry,
  CreatePlatformEventInput,
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

import type { ServiceContext, ServiceResult } from "@/types/services";
import type { EventSubscriber } from "@/lib/platform/contracts";
import { InMemoryActivityService } from "@/lib/platform/activity/ActivityService";
import { InMemoryAuditService } from "@/lib/platform/audit/AuditService";
import { AuditStore } from "@/lib/platform/audit/AuditStore";

/** Creates and initializes the in-memory activity service. */
export async function createInMemoryActivityService(
  eventSubscriber: EventSubscriber,
  context: ServiceContext,
): Promise<ServiceResult<InMemoryActivityService>> {
  const service = new InMemoryActivityService(eventSubscriber);
  const initializeResult = await service.initialize(context);

  if (!initializeResult.success) {
    return initializeResult;
  }

  return { success: true, data: service };
}

/** Creates and initializes the in-memory audit service. */
export async function createInMemoryAuditService(
  eventSubscriber: EventSubscriber,
  context: ServiceContext,
): Promise<ServiceResult<InMemoryAuditService>> {
  const service = new InMemoryAuditService(eventSubscriber);
  const initializeResult = await service.initialize(context);

  if (!initializeResult.success) {
    return initializeResult;
  }

  return { success: true, data: service };
}

/** Creates an in-memory audit service with a dedicated store instance. */
export async function createInMemoryAuditServiceWithStore(
  eventSubscriber: EventSubscriber,
  context: ServiceContext,
  store: AuditStore,
): Promise<ServiceResult<InMemoryAuditService>> {
  const service = new InMemoryAuditService(eventSubscriber, store);
  const initializeResult = await service.initialize(context);

  if (!initializeResult.success) {
    return initializeResult;
  }

  return { success: true, data: service };
}
