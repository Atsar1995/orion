import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { integrationFacade } from "@/lib/platform/integration";
import type { ServiceContext } from "@/types/services";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();

/** Registers integration inbound event handlers (Mission P-010.7). */
export function registerIntegrationSubscribers(service: IntelligenceIntegrationService): void {
  if (initializedServices.has(service)) return;
  initializedServices.add(service);

  service.subscribe(
    {
      subscriberId: "integration-platform",
      eventTypes: ["CustomEvent"],
      priority: 60,
    },
    async (event, context) => {
      const inbound = event.payload.integrationInboundType ?? event.payload.integrationEventType;
      if (!inbound) return;

      await handleIntegrationInbound(
        inbound as import("@/types/integration").IntegrationInboundEventType,
        {
          connectorId: event.payload.connectorId ?? "",
          format: event.payload.format ?? "json",
          ...event.payload,
        },
        context,
      );
    },
  );
}

export async function handleIntegrationInbound(
  eventType: import("@/types/integration").IntegrationInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  switch (eventType) {
    case "IntegrationRequested":
      if (payload.connectorId) {
        await integrationFacade.integration.start(
          { connectorId: payload.connectorId, correlationId: payload.correlationId },
          context,
        );
      }
      break;
    case "ImportRequested":
      if (payload.connectorId) {
        integrationFacade.import.request(
          {
            connectorId: payload.connectorId,
            format: (payload.format as import("@/types/integration").IntegrationDataFormat) ?? "json",
            data: payload.data ? [JSON.parse(payload.data) as Record<string, string>] : [],
          },
          context,
        );
      }
      break;
    case "ExportRequested":
      if (payload.connectorId) {
        integrationFacade.export.request(
          {
            connectorId: payload.connectorId,
            format: (payload.format as import("@/types/integration").IntegrationDataFormat) ?? "json",
          },
          context,
        );
      }
      break;
  }
}
