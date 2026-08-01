import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { complianceFacade, type ComplianceFacade } from "@/lib/platform/compliance";
import { complianceRulesEngine } from "@/lib/platform/compliance/ComplianceRulesEngine";
import type { ServiceContext } from "@/types/services";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();

/** Registers compliance inbound event handlers (Mission P-010.6). */
export function registerComplianceSubscribers(service: IntelligenceIntegrationService): void {
  if (initializedServices.has(service)) return;
  initializedServices.add(service);

  service.subscribe(
    {
      subscriberId: "compliance-platform",
      eventTypes: ["CustomEvent"],
      priority: 50,
    },
    async (event, context) => {
      const inboundType = event.payload.complianceEventType
        ?? event.payload.workflowEventType
        ?? event.payload.notificationEventType
        ?? event.payload.searchEventType;

      const mapped = mapCustomEventToInbound(inboundType, event.payload);
      if (!mapped) return;

      const action = complianceRulesEngine.mapInboundAction(mapped);
      complianceFacade.audit.record(
        {
          domainKey: event.payload.domainKey ?? event.sourceWorkspace.toLowerCase(),
          entityType: event.entityType,
          entityId: event.entityId,
          action,
          sourceService: event.sourceService,
          correlationId: event.correlationId,
          previousState: event.payload.previousState,
          currentState: event.payload.currentState,
          riskClassification: inferRisk(action),
        },
        context,
      );
    },
  );
}

function mapCustomEventToInbound(
  eventType: string | undefined,
  payload: Readonly<Record<string, string>>,
): import("@/types/enterprise-audit").ComplianceInboundEventType | null {
  const candidates = [
    eventType,
    payload.eventType,
    payload.workflowEventType,
    payload.notificationEventType,
  ].filter(Boolean);

  for (const candidate of candidates) {
    switch (candidate) {
      case "EntityCreated":
      case "EntityUpdated":
      case "EntityDeleted":
      case "WorkflowCompleted":
      case "NotificationSent":
      case "DocumentUpdated":
      case "JournalPosted":
        return candidate;
      case "WorkflowCompleted":
      case "ApprovalCompleted":
        return "WorkflowCompleted";
      default:
        break;
    }
  }

  if (payload.periodEvent === "JournalPosted") return "JournalPosted";
  return null;
}

function inferRisk(action: string): import("@/types/enterprise-audit").AuditRiskClassification {
  switch (action) {
    case "financial_posting":
    case "permission_granted":
    case "permission_revoked":
      return "high";
    case "document_accessed":
    case "workflow_completed":
      return "medium";
    default:
      return "low";
  }
}

/** Standalone inbound dispatch for direct integration. */
export async function handleComplianceInboundEvent(
  eventType: import("@/types/enterprise-audit").ComplianceInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
  facade: ComplianceFacade = complianceFacade,
): Promise<void> {
  const action = complianceRulesEngine.mapInboundAction(eventType);
  facade.audit.record(
    {
      domainKey: payload.domainKey ?? "platform",
      entityType: payload.entityType ?? "entity",
      entityId: payload.entityId ?? "unknown",
      action,
      sourceService: payload.sourceService ?? "external",
      correlationId: payload.correlationId,
      previousState: payload.previousState,
      currentState: payload.currentState,
      riskClassification: inferRisk(action),
    },
    context,
  );
}
