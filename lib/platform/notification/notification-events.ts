import type { PublishNotificationEventInput, NotificationEventType } from "@/types/notification";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "notification-platform";

/** Publishes notification lifecycle events via IIL (Mission P-010.3). */
export function publishNotificationEvent(
  input: PublishNotificationEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: SERVICE_ID,
      sourceWorkspace: "Platform",
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.entityId,
      payload: {
        workspace: "platform",
        notificationEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export type NotificationInboundHandler = (
  eventType: import("@/types/notification").NotificationInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
) => Promise<void>;

const inboundHandlers: NotificationInboundHandler[] = [];

export function registerNotificationInboundHandler(handler: NotificationInboundHandler): void {
  inboundHandlers.push(handler);
}

export async function dispatchNotificationInboundEvent(
  eventType: import("@/types/notification").NotificationInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  for (const handler of inboundHandlers) {
    await handler(eventType, payload, context);
  }
}

export const NOTIFICATION_OUTBOUND_EVENTS: readonly NotificationEventType[] = [
  "NotificationQueued",
  "NotificationSent",
  "NotificationDelivered",
  "NotificationFailed",
  "NotificationRetried",
  "NotificationCancelled",
] as const;

export const NOTIFICATION_INBOUND_EVENTS = [
  "WorkflowCompleted",
  "ApprovalAssigned",
  "ApprovalCompleted",
  "ExecutiveAlertCreated",
  "SystemAlertGenerated",
] as const;
