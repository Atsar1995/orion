/**
 * Enterprise Notification & Communication Framework types (Mission P-010.3).
 * Channel-agnostic, organization-scoped notification orchestration.
 */

/** Supported notification delivery channels (conceptual — no provider SDKs). */
export type EnterpriseNotificationChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "push"
  | "in_app"
  | "web"
  | "custom";

/** Notification classification types. */
export type NotificationType =
  | "informational"
  | "success"
  | "warning"
  | "error"
  | "approval_request"
  | "approval_outcome"
  | "reminder"
  | "escalation"
  | "system_alert"
  | "security_alert";

/** Delivery lifecycle states. */
export type NotificationDeliveryState =
  | "queued"
  | "processing"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "retry_pending"
  | "cancelled"
  | "expired";

/** Template scope. */
export type NotificationTemplateScope = "system" | "organization";

/** Outbound notification events. */
export type NotificationEventType =
  | "NotificationQueued"
  | "NotificationSent"
  | "NotificationDelivered"
  | "NotificationFailed"
  | "NotificationRetried"
  | "NotificationCancelled";

/** Inbound events consumed by the notification framework. */
export type NotificationInboundEventType =
  | "WorkflowCompleted"
  | "ApprovalAssigned"
  | "ApprovalCompleted"
  | "ExecutiveAlertCreated"
  | "SystemAlertGenerated";

export type NotificationTemplateRecord = {
  readonly id: string;
  readonly organizationId?: string;
  readonly scope: NotificationTemplateScope;
  readonly key: string;
  readonly name: string;
  readonly notificationType: NotificationType;
  readonly defaultChannel: EnterpriseNotificationChannel;
  readonly subjectTemplate: string;
  readonly bodyTemplate: string;
  readonly language: string;
  readonly version: number;
  readonly active: boolean;
  readonly variables: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationTemplateVersionRecord = {
  readonly id: string;
  readonly templateId: string;
  readonly organizationId?: string;
  readonly version: number;
  readonly subjectTemplate: string;
  readonly bodyTemplate: string;
  readonly language: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type UserNotificationPreferenceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly enabledChannels: readonly EnterpriseNotificationChannel[];
  readonly disabledTypes: readonly NotificationType[];
  readonly language: string;
  readonly quietHoursStart?: string;
  readonly quietHoursEnd?: string;
  readonly digestEnabled: boolean;
  readonly digestFrequency?: "daily" | "weekly";
  readonly priorityOverrides: Readonly<Record<string, EnterpriseNotificationChannel>>;
  readonly updatedAt: string;
};

export type OrganizationNotificationPolicyRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly allowedChannels: readonly EnterpriseNotificationChannel[];
  readonly mandatoryTypes: readonly NotificationType[];
  readonly defaultLanguage: string;
  readonly maxRetries: number;
  readonly retryDelayMinutes: number;
  readonly updatedAt: string;
};

export type NotificationRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly recipientUserId: string;
  readonly notificationType: NotificationType;
  readonly channel: EnterpriseNotificationChannel;
  readonly subject: string;
  readonly body: string;
  readonly templateId?: string;
  readonly templateVersion?: number;
  readonly correlationId?: string;
  readonly deliveryState: NotificationDeliveryState;
  readonly scheduledAt?: string;
  readonly sentAt?: string;
  readonly deliveredAt?: string;
  readonly readAt?: string;
  readonly failedAt?: string;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly lastError?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationHistoryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly notificationId: string;
  readonly action: string;
  readonly fromState?: NotificationDeliveryState;
  readonly toState?: NotificationDeliveryState;
  readonly actorId: string;
  readonly timestamp: string;
  readonly detail?: string;
};

export type SendNotificationInput = {
  readonly recipientUserId: string;
  readonly notificationType: NotificationType;
  readonly channel?: EnterpriseNotificationChannel;
  readonly templateKey?: string;
  readonly subject?: string;
  readonly body?: string;
  readonly variables?: Readonly<Record<string, string>>;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type ScheduleNotificationInput = SendNotificationInput & {
  readonly scheduledAt: string;
};

export type CreateTemplateInput = {
  readonly key: string;
  readonly name: string;
  readonly notificationType: NotificationType;
  readonly defaultChannel: EnterpriseNotificationChannel;
  readonly subjectTemplate: string;
  readonly bodyTemplate: string;
  readonly language?: string;
  readonly variables?: readonly string[];
  readonly scope?: NotificationTemplateScope;
};

export type UpdatePreferenceInput = {
  readonly enabledChannels?: readonly EnterpriseNotificationChannel[];
  readonly disabledTypes?: readonly NotificationType[];
  readonly language?: string;
  readonly quietHoursStart?: string;
  readonly quietHoursEnd?: string;
  readonly digestEnabled?: boolean;
  readonly digestFrequency?: "daily" | "weekly";
  readonly priorityOverrides?: Readonly<Record<string, EnterpriseNotificationChannel>>;
};

export type PublishNotificationEventInput = {
  readonly eventType: NotificationEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
