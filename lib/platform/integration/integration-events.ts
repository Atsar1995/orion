import type { IntegrationEventType, PublishIntegrationEventInput } from "@/types/integration";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "integration-platform";

/** Publishes integration lifecycle events via IIL (Mission P-010.7). */
export function publishIntegrationEvent(
  input: PublishIntegrationEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: SERVICE_ID,
      sourceWorkspace: "Integrations",
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.entityId,
      payload: {
        workspace: "integrations",
        integrationEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export type IntegrationInboundHandler = (
  eventType: import("@/types/integration").IntegrationInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
) => Promise<void>;

const inboundHandlers: IntegrationInboundHandler[] = [];

export function registerIntegrationInboundHandler(handler: IntegrationInboundHandler): void {
  inboundHandlers.push(handler);
}

export async function dispatchIntegrationInboundEvent(
  eventType: import("@/types/integration").IntegrationInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  for (const handler of inboundHandlers) {
    await handler(eventType, payload, context);
  }
}

export const INTEGRATION_OUTBOUND_EVENTS: readonly IntegrationEventType[] = [
  "IntegrationStarted",
  "IntegrationCompleted",
  "IntegrationFailed",
  "ImportCompleted",
  "ExportCompleted",
  "ConnectorHealthChanged",
] as const;

export const INTEGRATION_INBOUND_EVENTS = [
  "IntegrationRequested",
  "ImportRequested",
  "ExportRequested",
] as const;
