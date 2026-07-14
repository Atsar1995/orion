/**
 * ORION Platform Services — core type definitions.
 * @see docs/02_Engineering/ES-011-Platform-Services-Foundation.md
 */

import type { RoleSlug } from "@/types/auth";

/** Operational status for platform jobs and async work. */
export enum ServiceStatus {
  Pending = "pending",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
  Cancelled = "cancelled",
}

/** Health state exposed by platform services. */
export enum ServiceHealth {
  Healthy = "healthy",
  Degraded = "degraded",
  Unhealthy = "unhealthy",
  Unknown = "unknown",
}

/** Identity metadata for a registered platform service. */
export interface ServiceMetadata {
  serviceName: string;
  version: string;
  description?: string;
}

/** Tenant-scoped execution context for platform service operations. */
export interface ServiceContext {
  organizationId: string;
  workspaceId: string;
  userId: string;
  role: RoleSlug;
  correlationId?: string;
  requestId?: string;
}

/** Standard result envelope for platform service operations. */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

/** Structured platform service error descriptor. */
export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  details?: Record<string, string>;
}

/** Platform service error codes for typed error handling. */
export enum ServiceErrorCode {
  Validation = "VALIDATION",
  NotImplemented = "NOT_IMPLEMENTED",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
  Configuration = "CONFIGURATION",
  Dependency = "DEPENDENCY",
  Unknown = "UNKNOWN",
}

/** Notification delivery channels. */
export type NotificationChannel = "in_app" | "email" | "push" | "sms";

/** Notification delivery status values. */
export type NotificationDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "read";

/** Platform notification request contract. */
export interface NotificationRequest {
  id: string;
  type: string;
  recipientUserId: string;
  channel: NotificationChannel;
  subject: string;
  body: string;
  metadata?: Record<string, string>;
}

/** Scheduled notification request contract. */
export interface ScheduledNotificationRequest extends NotificationRequest {
  scheduledAt: Date;
}

/** Platform event contract. */
export interface PlatformEvent {
  eventId: string;
  type: string;
  timestamp: Date;
  correlationId: string;
  causationId?: string;
  source: string;
  version: string;
  tenantContext: ServiceContext;
  payload: Record<string, string>;
  metadata?: Record<string, string>;
}

/** Input for constructing a platform event. */
export interface CreatePlatformEventInput {
  type: string;
  source: string;
  version: string;
  tenantContext: ServiceContext;
  payload: Record<string, string>;
  eventId?: string;
  timestamp?: Date;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, string>;
}

/** Background job contract. */
export interface PlatformJob {
  id: string;
  type: string;
  status: ServiceStatus;
  organizationId: string;
  workspaceId: string;
  payload: Record<string, string>;
  createdAt: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  attempts: number;
  maxAttempts: number;
}

/** Background job enqueue request. */
export interface EnqueueJobRequest {
  type: string;
  payload: Record<string, string>;
  maxAttempts?: number;
}

/** Scheduled background job request. */
export interface ScheduleJobRequest extends EnqueueJobRequest {
  scheduledAt: Date;
}

/** Activity record contract. */
export interface ActivityRecord {
  id: string;
  type: string;
  timestamp: Date;
  actorUserId: string;
  organizationId: string;
  workspaceId: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, string>;
}

/** Audit outcome values. */
export type AuditOutcome = "success" | "failure";

/** Audit record contract. */
export interface AuditRecord {
  id: string;
  type: string;
  timestamp: Date;
  actorUserId: string;
  organizationId: string;
  workspaceId: string;
  action: string;
  outcome: AuditOutcome;
  targetEntityType?: string;
  targetEntityId?: string;
  ipAddress?: string;
  metadata?: Record<string, string>;
}

/** Feature flag scope levels. */
export type FeatureFlagScope =
  | "platform"
  | "organization"
  | "workspace"
  | "user";

/** Feature flag contract. */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  scope: FeatureFlagScope;
  scopeId?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Configuration entry contract. */
export interface ConfigurationEntry {
  key: string;
  value: string;
  scope: FeatureFlagScope;
  scopeId?: string;
  updatedAt: Date;
}

/** Date range filter for service queries. */
export interface DateRange {
  from: Date;
  to: Date;
}

/** Handler invoked when a subscribed platform event is received. */
export type PlatformEventHandler = (
  event: PlatformEvent,
) => Promise<ServiceResult<void>>;
