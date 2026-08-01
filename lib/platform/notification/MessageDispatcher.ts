import { randomUUID } from "crypto";
import type { NotificationRecord } from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import type { ServiceContext } from "@/types/services";
import { getChannelAdapter } from "@/lib/platform/notification/channels/ChannelAdapters";
import { NotificationHistoryService } from "@/lib/platform/notification/NotificationHistoryService";
import { notificationRulesEngine } from "@/lib/platform/notification/NotificationRulesEngine";
import { publishNotificationEvent } from "@/lib/platform/notification/notification-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Dispatches notifications through channel adapters with retry support (Mission P-010.3). */
export class MessageDispatcher {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly historyService: NotificationHistoryService,
  ) {}

  async dispatch(notification: NotificationRecord, context: ServiceContext): Promise<NotificationRecord> {
    const processing = this.transition(notification, "processing", context);
    publishNotificationEvent(
      {
        eventType: "NotificationQueued",
        entityType: "notification",
        entityId: processing.id,
        correlationId: processing.correlationId,
      },
      context,
    );

    const adapter = getChannelAdapter(processing.channel);
    if (!adapter) {
      return this.fail(processing, "CHANNEL_UNAVAILABLE", context);
    }

    const result = await adapter.deliver({
      recipientUserId: processing.recipientUserId,
      subject: processing.subject,
      body: processing.body,
      metadata: processing.metadata,
    });

    if (!result.success) {
      return this.fail(processing, result.error ?? "DELIVERY_FAILED", context);
    }

    const sent = this.transition(
      {
        ...processing,
        sentAt: nowIso(),
        attempts: processing.attempts + 1,
      },
      "sent",
      context,
    );

    publishNotificationEvent(
      {
        eventType: "NotificationSent",
        entityType: "notification",
        entityId: sent.id,
        correlationId: sent.correlationId,
        payload: { channel: sent.channel },
      },
      context,
    );

    const delivered = this.transition(
      {
        ...sent,
        deliveredAt: nowIso(),
      },
      result.delivered ? "delivered" : "sent",
      context,
    );

    if (result.delivered) {
      publishNotificationEvent(
        {
          eventType: "NotificationDelivered",
          entityType: "notification",
          entityId: delivered.id,
          correlationId: delivered.correlationId,
        },
        context,
      );
    }

    return delivered;
  }

  async retry(notificationId: string, context: ServiceContext): Promise<NotificationRecord> {
    const notification = this.repository.findNotification(context.organizationId, notificationId);
    if (!notification) throw new Error("NOTIFICATION_NOT_FOUND");

    if (notification.deliveryState !== "failed" && notification.deliveryState !== "retry_pending") {
      throw new Error("NOT_RETRYABLE");
    }

    if (notification.attempts >= notification.maxAttempts) {
      throw new Error("MAX_RETRIES_EXCEEDED");
    }

    const retryPending = this.transition(notification, "retry_pending", context, "retry_requested");
    publishNotificationEvent(
      {
        eventType: "NotificationRetried",
        entityType: "notification",
        entityId: retryPending.id,
        correlationId: retryPending.correlationId,
        payload: { attempt: String(retryPending.attempts + 1) },
      },
      context,
    );

    return this.dispatch(retryPending, context);
  }

  cancel(notificationId: string, context: ServiceContext): NotificationRecord {
    const notification = this.repository.findNotification(context.organizationId, notificationId);
    if (!notification) throw new Error("NOTIFICATION_NOT_FOUND");

    const transitionError = notificationRulesEngine.validateTransition(
      notification.deliveryState,
      "cancelled",
    );
    if (transitionError) throw new Error(transitionError.code);

    const cancelled = this.transition(notification, "cancelled", context, "cancelled_by_user");
    publishNotificationEvent(
      {
        eventType: "NotificationCancelled",
        entityType: "notification",
        entityId: cancelled.id,
        correlationId: cancelled.correlationId,
      },
      context,
    );

    return cancelled;
  }

  markRead(notificationId: string, context: ServiceContext): NotificationRecord {
    const notification = this.repository.findNotification(context.organizationId, notificationId);
    if (!notification) throw new Error("NOTIFICATION_NOT_FOUND");

    const updated = this.repository.updateNotification({
      ...notification,
      deliveryState: "read",
      readAt: nowIso(),
      updatedAt: nowIso(),
    });

    this.historyService.record(context, notificationId, "marked_read", notification.deliveryState, "read");
    return updated;
  }

  getDeliveryStatus(notificationId: string, context: ServiceContext): NotificationRecord | null {
    return this.repository.findNotification(context.organizationId, notificationId);
  }

  private fail(
    notification: NotificationRecord,
    errorCode: string,
    context: ServiceContext,
  ): NotificationRecord {
    const failed = this.repository.updateNotification({
      ...notification,
      deliveryState: notification.attempts + 1 >= notification.maxAttempts ? "failed" : "retry_pending",
      failedAt: nowIso(),
      lastError: errorCode,
      attempts: notification.attempts + 1,
      updatedAt: nowIso(),
    });

    this.historyService.record(
      context,
      failed.id,
      "delivery_failed",
      notification.deliveryState,
      failed.deliveryState,
      errorCode,
    );

    publishNotificationEvent(
      {
        eventType: "NotificationFailed",
        entityType: "notification",
        entityId: failed.id,
        correlationId: failed.correlationId,
        payload: { error: errorCode },
      },
      context,
    );

    return failed;
  }

  private transition(
    notification: NotificationRecord,
    toState: NotificationRecord["deliveryState"],
    context: ServiceContext,
    action = "state_transition",
  ): NotificationRecord {
    const transitionError = notificationRulesEngine.validateTransition(notification.deliveryState, toState);
    if (transitionError && notification.deliveryState !== toState) {
      throw new Error(transitionError.code);
    }

    const updated = this.repository.updateNotification({
      ...notification,
      deliveryState: toState,
      updatedAt: nowIso(),
    });

    this.historyService.record(
      context,
      notification.id,
      action,
      notification.deliveryState,
      toState,
    );

    return updated;
  }
}

export function createNotificationId(): string {
  return `ntf-${randomUUID()}`;
}
