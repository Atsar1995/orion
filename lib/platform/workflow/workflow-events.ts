import type { PublishWorkflowEventInput, WorkflowEventType } from "@/types/workflow";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "workflow-platform";

/** Publishes workflow lifecycle events via platform intelligence integration (Mission P-010.2). */
export function publishWorkflowEvent(
  input: PublishWorkflowEventInput,
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
        workflowEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

/** In-memory inbound event handler for WorkflowRequested / ApprovalRequested. */
export type WorkflowInboundHandler = (
  eventType: "WorkflowRequested" | "ApprovalRequested",
  payload: Record<string, string>,
  context: ServiceContext,
) => Promise<void>;

const inboundHandlers: WorkflowInboundHandler[] = [];

export function registerWorkflowInboundHandler(handler: WorkflowInboundHandler): void {
  inboundHandlers.push(handler);
}

export async function dispatchWorkflowInboundEvent(
  eventType: "WorkflowRequested" | "ApprovalRequested",
  payload: Record<string, string>,
  context: ServiceContext,
): Promise<void> {
  for (const handler of inboundHandlers) {
    await handler(eventType, payload, context);
  }
}

export const WORKFLOW_OUTBOUND_EVENTS: readonly WorkflowEventType[] = [
  "WorkflowStarted",
  "ApprovalAssigned",
  "ApprovalCompleted",
  "ApprovalRejected",
  "WorkflowCompleted",
  "WorkflowCancelled",
  "WorkflowEscalated",
] as const;

export const WORKFLOW_INBOUND_EVENTS = ["WorkflowRequested", "ApprovalRequested"] as const;
