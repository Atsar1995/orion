import type { ComplianceEventType, PublishComplianceEventInput } from "@/types/enterprise-audit";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "compliance-platform";

/** Publishes compliance lifecycle events via IIL (Mission P-010.6). */
export function publishComplianceEvent(
  input: PublishComplianceEventInput,
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
        complianceEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export type ComplianceInboundHandler = (
  eventType: import("@/types/enterprise-audit").ComplianceInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
) => Promise<void>;

const inboundHandlers: ComplianceInboundHandler[] = [];

export function registerComplianceInboundHandler(handler: ComplianceInboundHandler): void {
  inboundHandlers.push(handler);
}

export async function dispatchComplianceInboundEvent(
  eventType: import("@/types/enterprise-audit").ComplianceInboundEventType,
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  for (const handler of inboundHandlers) {
    await handler(eventType, payload, context);
  }
}

export const COMPLIANCE_OUTBOUND_EVENTS: readonly ComplianceEventType[] = [
  "AuditRecorded",
  "ComplianceViolationDetected",
  "RetentionExpired",
  "AuditExportGenerated",
] as const;

export const COMPLIANCE_INBOUND_EVENTS = [
  "EntityCreated",
  "EntityUpdated",
  "EntityDeleted",
  "WorkflowCompleted",
  "NotificationSent",
  "DocumentUpdated",
  "JournalPosted",
] as const;
