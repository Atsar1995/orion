import type { PublishSearchEventInput, SearchEventType } from "@/types/search";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "search-platform";

/** Publishes search lifecycle events via IIL (Mission P-010.5). */
export function publishSearchEvent(
  input: PublishSearchEventInput,
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
        searchEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export type SearchInboundHandler = (
  eventType: import("@/types/search").SearchInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
) => Promise<void>;

const inboundHandlers: SearchInboundHandler[] = [];

export function registerSearchInboundHandler(handler: SearchInboundHandler): void {
  inboundHandlers.push(handler);
}

export async function dispatchSearchInboundEvent(
  eventType: import("@/types/search").SearchInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  for (const handler of inboundHandlers) {
    await handler(eventType, payload, context);
  }
}

export const SEARCH_OUTBOUND_EVENTS: readonly SearchEventType[] = [
  "EntityIndexed",
  "EntityReindexed",
  "IndexRebuilt",
  "SearchExecuted",
  "IndexValidationFailed",
] as const;

export const SEARCH_INBOUND_EVENTS = [
  "EntityCreated",
  "EntityUpdated",
  "EntityDeleted",
  "DocumentCreated",
  "DocumentUpdated",
] as const;
