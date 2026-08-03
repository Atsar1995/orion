import type { IntelligenceEvent, ReplayResult } from "@/types/intelligence-integration";
import type { DeliveryProcessor, ReplayCriteria } from "@/lib/platform/iil/DurableTransportAdapter";

export type ReplayEventSource = {
  findEvents(criteria: ReplayCriteria): Promise<readonly IntelligenceEvent[]>;
  createDelivery(event: IntelligenceEvent, criteria: ReplayCriteria): Promise<void>;
};

/** Replays persisted IIL events by filter criteria (P-009.16). */
export class ReplayService {
  async replay(
    criteria: ReplayCriteria,
    source: ReplayEventSource,
    processor: DeliveryProcessor,
  ): Promise<ReplayResult> {
    const events = await source.findEvents(criteria);
    let replayed = 0;
    let skipped = 0;
    let failed = 0;

    for (const event of events) {
      if (criteria.eventId && event.eventId !== criteria.eventId) {
        skipped += 1;
        continue;
      }

      if (criteria.correlationId && event.correlationId !== criteria.correlationId) {
        skipped += 1;
        continue;
      }

      if (criteria.eventType) {
        const canonical = event.payload.canonicalEventType ?? event.eventType;
        if (canonical !== criteria.eventType && event.eventType !== criteria.eventType) {
          skipped += 1;
          continue;
        }
      }

      try {
        await source.createDelivery(event, criteria);
        await processor({
          deliveryId: `replay-${event.eventId}`,
          eventId: event.eventId,
          event,
          context: {
            organizationId: event.organizationId,
            userId: event.actorId,
            workspaceId: event.auditMetadata.workspaceId ?? "platform",
            role: "service_account",
            correlationId: event.correlationId,
          },
          attempts: 0,
          status: "pending",
          partitionKey: event.partitionKey ?? `${event.organizationId}:${event.entityType}:${event.entityId}`,
          idempotencyKey: event.idempotencyKey ?? event.eventId,
          enqueuedAt: new Date().toISOString(),
        });
        replayed += 1;
      } catch {
        failed += 1;
      }
    }

    return { replayed, skipped, failed };
  }
}

export const replayService = new ReplayService();
