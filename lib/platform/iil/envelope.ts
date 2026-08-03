import type { IntelligenceEvent, PublishIntelligenceEventInput } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

const IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Builds the ADR-013 partition key for ordered delivery within an entity. */
export function buildPartitionKey(event: IntelligenceEvent): string {
  if (event.partitionKey?.trim()) {
    return event.partitionKey.trim();
  }

  return `${event.organizationId}:${event.entityType}:${event.entityId}`;
}

/** Builds the ADR-013 idempotency key from envelope fields. */
export function buildIdempotencyKey(event: IntelligenceEvent): string {
  if (event.idempotencyKey?.trim()) {
    return event.idempotencyKey.trim();
  }

  if (event.payload.idempotencyKey?.trim()) {
    return event.payload.idempotencyKey.trim();
  }

  const eventType = event.payload.canonicalEventType ?? event.eventType;
  return `${event.organizationId}:${event.sourceService}:${eventType}:${event.entityId}:1`;
}

/** Enriches a P-006 envelope with ADR-013 transport fields. */
export function enrichDurableEnvelope(
  event: IntelligenceEvent,
  input: PublishIntelligenceEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const sourceDomain =
    input.auditMetadata?.sourceDomain ??
    event.payload.sourceDomain ??
    resolveSourceDomain(event.sourceService);

  return {
    ...event,
    sourceDomain,
    idempotencyKey: buildIdempotencyKey(event),
    partitionKey: buildPartitionKey(event),
    causationId: input.auditMetadata?.causationId ?? event.causationId,
    deliveryMetadata: {
      adapter: "iil-v1",
      persistedAt: new Date().toISOString(),
      ...(event.deliveryMetadata ?? {}),
    },
    auditMetadata: {
      ...event.auditMetadata,
      sourceDomain,
      workspaceId: context.workspaceId ?? event.auditMetadata.workspaceId,
    },
  };
}

export function resolveSourceDomain(sourceService: string): string {
  if (sourceService.includes("finance")) return "finance";
  if (sourceService.includes("hcm")) return "hcm";
  if (sourceService.includes("crm")) return "crm";
  if (sourceService.includes("hospitality")) return "hospitality";
  return "platform";
}

export function isIdempotencyKeyExpired(expiresAt: string): boolean {
  return Date.now() > new Date(expiresAt).getTime();
}

export function createIdempotencyExpiry(): string {
  return new Date(Date.now() + IDEMPOTENCY_WINDOW_MS).toISOString();
}

export const IIL_IDEMPOTENCY_WINDOW_MS = IDEMPOTENCY_WINDOW_MS;
