import { registerComplianceSubscribers } from "@/lib/platform/compliance";
import { registerDataSubscribers } from "@/lib/platform/data";
import { registerIntegrationSubscribers } from "@/lib/platform/integration";
import { memoryService } from "@/lib/executive/memory";
import { registerFinanceEventSubscriptions } from "@/lib/finance/events/register-finance-subscribers";
import { registerHcmSubscribers } from "@/lib/hcm/events/register-hcm-subscribers";
import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();

/** Registers default intelligence event handlers for executive platforms (Mission P-006). */
export function registerIntelligenceHandlers(service: IntelligenceIntegrationService): void {
  if (initializedServices.has(service)) {
    return;
  }

  initializedServices.add(service);

  service.subscribe(
    {
      subscriberId: "executive-brief",
      eventTypes: [
        "DecisionCreated",
        "DecisionUpdated",
        "OrganizationUpdated",
        "CustomerUpdated",
        "InvoiceIssued",
        "ReservationCreated",
      ],
      priority: 10,
    },
    async () => {
      /* Brief feed updated synchronously during publish */
    },
  );

  service.subscribe(
    {
      subscriberId: "executive-memory",
      eventTypes: [
        "DecisionCreated",
        "DecisionUpdated",
        "MemoryCreated",
        "MemoryUpdated",
        "UserCreated",
        "OrganizationUpdated",
      ],
      priority: 20,
    },
    async (event, context) => {
      ingestEventToMemory(event, context);
    },
  );

  service.subscribe(
    {
      subscriberId: "decision-intelligence",
      eventTypes: ["CustomerUpdated", "InvoiceIssued", "ReservationCreated", "TaskCompleted"],
      priority: 30,
    },
    async () => {
      /* Decision intelligence reacts to operational signals */
    },
  );

  service.subscribe(
    {
      subscriberId: "notification-service",
      eventTypes: ["DecisionCreated", "NotificationSent"],
      priority: 40,
    },
    async () => {
      /* Notification dispatch placeholder */
    },
  );

  registerFinanceEventSubscriptions(service);
  registerHcmSubscribers(service);
  registerComplianceSubscribers(service);
  registerIntegrationSubscribers(service);
  registerDataSubscribers(service);
}

function ingestEventToMemory(event: IntelligenceEvent, context: ServiceContext): void {
  memoryService.createMemory(
    {
      category: mapEventCategory(event.eventType),
      title: event.eventType,
      summary: `${event.sourceService} reported ${event.entityType} ${event.entityId}`,
      fullContext: JSON.stringify(event.payload),
      workspace: event.sourceWorkspace,
      workspaceId: context.workspaceId,
      tags: ["intelligence-event", event.sourceService, event.eventType],
      importance: event.priority === "critical" || event.priority === "high" ? 80 : 55,
      confidence: 88,
    },
    context,
    event.actorName ?? "Platform",
  );
}

function mapEventCategory(eventType: IntelligenceEvent["eventType"]) {
  if (eventType.startsWith("Decision")) {
    return "executive_decision" as const;
  }

  if (eventType.startsWith("Memory")) {
    return "historical_context" as const;
  }

  if (eventType === "InvoiceIssued") {
    return "financial_event" as const;
  }

  if (eventType === "ReservationCreated" || eventType === "CustomerUpdated") {
    return "operational_event" as const;
  }

  return "historical_context" as const;
}
