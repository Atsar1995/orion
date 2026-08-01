import { randomUUID } from "crypto";
import type { PlatformEvent } from "@/types/services";
import type {
  IntelligenceEvent,
  IntelligenceEventPriority,
  IntelligenceEventType,
  PublishIntelligenceEventInput,
} from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

const DEFAULT_VERSION = "1.0";

/** Creates intelligence events conforming to the P-006 canonical schema. */
export function createIntelligenceEvent(
  input: PublishIntelligenceEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const correlationId = input.correlationId?.trim() || context.correlationId?.trim() || randomUUID();

  return {
    eventId: input.eventId?.trim() || randomUUID(),
    eventType: input.eventType,
    sourceService: input.sourceService.trim(),
    sourceWorkspace: input.sourceWorkspace.trim(),
    organizationId: context.organizationId,
    entityType: input.entityType.trim(),
    entityId: input.entityId.trim(),
    timestamp: new Date().toISOString(),
    actorId: input.actorId.trim(),
    actorName: input.actorName?.trim(),
    priority: input.priority ?? resolveDefaultPriority(input.eventType),
    correlationId,
    payload: input.payload ?? {},
    version: input.version?.trim() || DEFAULT_VERSION,
    securityClassification: input.securityClassification ?? "internal",
    auditMetadata: {
      workspaceId: context.workspaceId,
      actorRole: context.role,
      publishedAt: new Date().toISOString(),
      ...(input.auditMetadata ?? {}),
    },
  };
}

/** Maps an intelligence event to the platform event contract for audit/activity consumers. */
export function intelligenceEventToPlatformEvent(
  event: IntelligenceEvent,
  context: ServiceContext,
): PlatformEvent {
  return {
    eventId: event.eventId,
    type: mapToPlatformEventType(event.eventType),
    timestamp: new Date(event.timestamp),
    correlationId: event.correlationId,
    source: event.sourceService,
    version: event.version,
    tenantContext: context,
    payload: {
      entityType: event.entityType,
      entityId: event.entityId,
      sourceWorkspace: event.sourceWorkspace,
      priority: event.priority,
      securityClassification: event.securityClassification,
      ...event.payload,
    },
    metadata: event.auditMetadata,
  };
}

function mapToPlatformEventType(eventType: IntelligenceEventType): string {
  const mapping: Record<IntelligenceEventType, string> = {
    DecisionCreated: "decision.created",
    DecisionUpdated: "decision.updated",
    MemoryCreated: "memory.created",
    MemoryUpdated: "memory.updated",
    UserCreated: "user.created",
    OrganizationUpdated: "organization.updated",
    ReservationCreated: "entity.created",
    CustomerUpdated: "entity.updated",
    InvoiceIssued: "financial.event",
    TaskCompleted: "job.completed",
    NotificationSent: "notification.sent",
    CustomEvent: "custom.event",
  };

  return mapping[eventType];
}

function resolveDefaultPriority(eventType: IntelligenceEventType): IntelligenceEventPriority {
  if (eventType === "DecisionCreated" || eventType === "InvoiceIssued") {
    return "high";
  }

  if (eventType === "NotificationSent" || eventType === "TaskCompleted") {
    return "normal";
  }

  return "normal";
}

export function mapPlatformTypeToIntelligence(type: string): IntelligenceEventType {
  const reverse: Record<string, IntelligenceEventType> = {
    "decision.created": "DecisionCreated",
    "decision.updated": "DecisionUpdated",
    "memory.created": "MemoryCreated",
    "memory.updated": "MemoryUpdated",
    "user.created": "UserCreated",
    "organization.updated": "OrganizationUpdated",
  };

  return reverse[type] ?? "CustomEvent";
}
