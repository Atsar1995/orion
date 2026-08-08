import { createPlatformEvent } from "@/lib/platform/events/PlatformEventFactory";
import type { EventBus } from "@/lib/platform/events/EventBus";

export type EventMetadata = {
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly emittedAt: string;
};

export type AuroraDomainEvent = {
  readonly name: string;
  readonly tenantId: string;
  readonly brandId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly metadata: EventMetadata;
};

export interface AuroraEventPublisher {
  publish(event: AuroraDomainEvent): Promise<void>;
  publishBatch(events: readonly AuroraDomainEvent[]): Promise<void>;
  getPublishedEvents(): readonly AuroraDomainEvent[];
}

function toStringPayload(
  payload: Readonly<Record<string, unknown>>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    result[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return result;
}

export class DefaultAuroraEventPublisher implements AuroraEventPublisher {
  private readonly published: AuroraDomainEvent[] = [];

  constructor(private readonly eventBus: EventBus) {}

  async publish(event: AuroraDomainEvent): Promise<void> {
    this.published.push(event);
    const platformEvent = createPlatformEvent({
      type: event.name,
      source: "aurora.platform",
      version: "1.0",
      tenantContext: {
        organizationId: event.tenantId,
        workspaceId: event.brandId ?? event.tenantId,
        userId: "aurora.platform",
        role: "organization_admin",
        correlationId: event.metadata.correlationId,
        requestId: event.metadata.requestId,
      },
      payload: toStringPayload({
        tenantId: event.tenantId,
        ...(event.brandId ? { brandId: event.brandId } : {}),
        ...event.payload,
      }),
      correlationId: event.metadata.correlationId,
    });

    if (!platformEvent.success) {
      throw new Error(platformEvent.error.message);
    }

    await this.eventBus.publish(platformEvent.data);
  }

  async publishBatch(events: readonly AuroraDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  getPublishedEvents(): readonly AuroraDomainEvent[] {
    return [...this.published];
  }
}
