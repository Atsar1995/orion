import type { MasterDataEventType, PublishMasterDataEventInput } from "@/types/enterprise-data";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "data-platform";

/** Publishes master data registry events via IIL (Mission P-011.1). */
export function publishMasterDataEvent(
  input: PublishMasterDataEventInput,
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
        canonicalEventType: input.eventType,
        masterDataEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export type MasterDataInboundHandler = (
  eventType: import("@/types/enterprise-data").MasterDataInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
) => Promise<void>;

const inboundHandlers: MasterDataInboundHandler[] = [];

export function registerMasterDataInboundHandler(handler: MasterDataInboundHandler): void {
  inboundHandlers.push(handler);
}

export async function dispatchMasterDataInboundEvent(
  eventType: import("@/types/enterprise-data").MasterDataInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  for (const handler of inboundHandlers) {
    await handler(eventType, payload, context);
  }
}

export const MASTER_DATA_OUTBOUND_EVENTS: readonly MasterDataEventType[] = [
  "MasterEntityRegistered",
  "MasterEntityUpdated",
  "MasterEntityActivated",
  "MasterEntityDeactivated",
  "MasterEntityArchived",
] as const;

export const MASTER_DATA_INBOUND_EVENTS = ["EntityRegistrationRequested"] as const;
