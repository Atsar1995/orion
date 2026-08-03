import { randomUUID } from "crypto";
import type { DeadLetterRecord, IntelligenceEvent, ReplayResult } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import type {
  DeliveryProcessor,
  DeliveryRecord,
  DurableTransportAdapter,
  PublishReceipt,
  ReplayCriteria,
  TransportHealth,
} from "@/lib/platform/iil/DurableTransportAdapter";
import { IILDeadLetterQueue } from "@/lib/platform/iil/DeadLetterQueue";
import { buildIdempotencyKey, createIdempotencyExpiry, isIdempotencyKeyExpired } from "@/lib/platform/iil/envelope";
import { ReplayService } from "@/lib/platform/iil/ReplayService";
import { RetryPolicy, defaultRetryPolicy } from "@/lib/platform/iil/RetryPolicy";
import { TransportMetrics, type TransportMetricsSnapshot } from "@/lib/platform/iil/TransportMetrics";

type IdempotencyEntry = {
  readonly eventId: string;
  readonly expiresAt: string;
};

/** Shared backing store — survives transport instance recreation (restart tests). */
export class InMemoryDurableTransportBacking {
  readonly events = new Map<string, IntelligenceEvent>();
  readonly deliveries = new Map<string, DeliveryRecord>();
  readonly idempotencyKeys = new Map<string, IdempotencyEntry>();
  readonly deadLetterQueue = new IILDeadLetterQueue();
  readonly pendingQueue: string[] = [];
}

/** In-memory durable transport — dev/unit tests (ADR-013). */
export class InMemoryDurableTransport implements DurableTransportAdapter {
  readonly mode = "memory" as const;

  private readonly backing: InMemoryDurableTransportBacking;
  private readonly retryPolicy: RetryPolicy;
  private readonly metrics = new TransportMetrics();
  private readonly replayService = new ReplayService();
  private processor: DeliveryProcessor | null = null;
  private loopActive = false;
  private loopTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options?: {
    backing?: InMemoryDurableTransportBacking;
    retryPolicy?: RetryPolicy;
  }) {
    this.backing = options?.backing ?? new InMemoryDurableTransportBacking();
    this.retryPolicy = options?.retryPolicy ?? new RetryPolicy(3, 250, 5000);
  }

  async persistAndEnqueue(event: IntelligenceEvent, context: ServiceContext): Promise<PublishReceipt> {
    return this.persistAndEnqueueSync(event, context);
  }

  persistAndEnqueueSync(event: IntelligenceEvent, context: ServiceContext): PublishReceipt {
    if (this.backing.events.has(event.eventId)) {
      throw new Error("DUPLICATE_EVENT");
    }

    const idempotencyKey = buildIdempotencyKey(event);
    const idempotencyLookup = `${event.organizationId}:${idempotencyKey}`;
    const existingKey = this.backing.idempotencyKeys.get(idempotencyLookup);
    if (existingKey && !isIdempotencyKeyExpired(existingKey.expiresAt)) {
      throw new Error("DUPLICATE_EVENT");
    }

    const persistedAt = new Date().toISOString();
    const deliveryId = randomUUID();
    const partitionKey = event.partitionKey ?? `${event.organizationId}:${event.entityType}:${event.entityId}`;

    this.backing.events.set(event.eventId, event);
    this.backing.idempotencyKeys.set(idempotencyLookup, {
      eventId: event.eventId,
      expiresAt: createIdempotencyExpiry(),
    });

    const delivery: DeliveryRecord = {
      deliveryId,
      eventId: event.eventId,
      event,
      context,
      attempts: 0,
      status: "pending",
      partitionKey,
      idempotencyKey,
      enqueuedAt: persistedAt,
    };

    this.backing.deliveries.set(deliveryId, delivery);
    this.backing.pendingQueue.push(deliveryId);
    this.metrics.recordPublished();

    return { eventId: event.eventId, deliveryId, persistedAt, partitionKey, idempotencyKey };
  }

  async hasEvent(eventId: string): Promise<boolean> {
    return this.backing.events.has(eventId);
  }

  async hasIdempotencyKey(idempotencyKey: string, organizationId: string): Promise<boolean> {
    const entry = this.backing.idempotencyKeys.get(`${organizationId}:${idempotencyKey}`);
    if (!entry) return false;
    if (isIdempotencyKeyExpired(entry.expiresAt)) {
      this.backing.idempotencyKeys.delete(`${organizationId}:${idempotencyKey}`);
      return false;
    }
    return true;
  }

  async acknowledge(deliveryId: string): Promise<void> {
    const delivery = this.backing.deliveries.get(deliveryId);
    if (!delivery) return;
    this.backing.deliveries.set(deliveryId, { ...delivery, status: "delivered" });
    this.metrics.recordDelivered();
  }

  async nack(deliveryId: string, reason: string, retryable: boolean): Promise<void> {
    const delivery = this.backing.deliveries.get(deliveryId);
    if (!delivery) return;

    const nextAttempts = delivery.attempts + 1;

    if (retryable && this.retryPolicy.shouldRetry(delivery.attempts)) {
      const delay = this.retryPolicy.getDelayMs(delivery.attempts);
      const updated: DeliveryRecord = {
        ...delivery,
        attempts: nextAttempts,
        status: "pending",
        lastError: reason,
      };
      this.backing.deliveries.set(deliveryId, updated);
      setTimeout(() => {
        this.backing.pendingQueue.push(deliveryId);
      }, delay);
      return;
    }

    this.metrics.recordFailure();
    this.backing.deadLetterQueue.enqueue(delivery.event, reason, nextAttempts, reason);
    this.backing.deliveries.set(deliveryId, {
      ...delivery,
      attempts: nextAttempts,
      status: "dead_letter",
      lastError: reason,
    });
  }

  async getDeadLetter(organizationId?: string, limit = 50): Promise<readonly DeadLetterRecord[]> {
    return this.backing.deadLetterQueue.list(organizationId, limit);
  }

  async requeueFromDeadLetter(id: string, context: ServiceContext): Promise<IntelligenceEvent | null> {
    const record = this.backing.deadLetterQueue.remove(id);
    if (!record || record.event.organizationId !== context.organizationId) {
      return null;
    }

    const deliveryId = randomUUID();
    const delivery: DeliveryRecord = {
      deliveryId,
      eventId: record.event.eventId,
      event: record.event,
      context,
      attempts: 0,
      status: "pending",
      partitionKey: record.event.partitionKey ?? `${record.event.organizationId}:${record.event.entityType}:${record.event.entityId}`,
      idempotencyKey: buildIdempotencyKey(record.event),
      enqueuedAt: new Date().toISOString(),
    };

    this.backing.deliveries.set(deliveryId, delivery);
    this.backing.pendingQueue.push(deliveryId);
    return record.event;
  }

  async replay(criteria: ReplayCriteria, processor: DeliveryProcessor): Promise<ReplayResult> {
    const result = await this.replayService.replay(criteria, {
      findEvents: async (query) => this.findEvents(query),
      createDelivery: async () => {
        /* delivery created inline by replay service processor */
      },
    }, processor);
    this.metrics.recordReplayed(result.replayed);
    return result;
  }

  async listEvents(organizationId: string, limit = 50): Promise<readonly IntelligenceEvent[]> {
    return [...this.backing.events.values()]
      .filter((event) => event.organizationId === organizationId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  async recoverPendingDeliveries(): Promise<number> {
    let recovered = 0;
    for (const [deliveryId, delivery] of this.backing.deliveries.entries()) {
      if (delivery.status === "pending" || delivery.status === "in_flight") {
        if (!this.backing.pendingQueue.includes(deliveryId)) {
          this.backing.pendingQueue.push(deliveryId);
          recovered += 1;
        }
      }
    }
    return recovered;
  }

  startDeliveryLoop(processor: DeliveryProcessor): void {
    this.processor = processor;
    if (this.loopActive) return;
    this.loopActive = true;
    this.loopTimer = setInterval(() => {
      void this.processNext();
    }, 10);
  }

  stopDeliveryLoop(): void {
    this.loopActive = false;
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  getMetrics(): TransportMetricsSnapshot {
    const pending = [...this.backing.deliveries.values()].filter(
      (delivery) => delivery.status === "pending" || delivery.status === "in_flight",
    ).length;

    return this.metrics.snapshot({
      mode: "memory",
      persistedEvents: this.backing.events.size,
      pendingDeliveries: pending,
      deadLetterCount: this.backing.deadLetterQueue.count(),
    });
  }

  health(): TransportHealth {
    const metrics = this.getMetrics();
    let status: TransportHealth["status"] = "healthy";

    if (metrics.deadLetterCount > 0 || metrics.pendingDeliveries > 25) {
      status = "degraded";
    }
    if (metrics.deadLetterCount > 10) {
      status = "unhealthy";
    }

    return {
      status,
      connected: true,
      queueDepth: metrics.pendingDeliveries,
      deadLetterCount: metrics.deadLetterCount,
      summary:
        status === "healthy"
          ? "In-memory durable IIL transport operational."
          : "Review IIL queue depth or dead-letter entries.",
    };
  }

  getBacking(): InMemoryDurableTransportBacking {
    return this.backing;
  }

  private async processNext(): Promise<void> {
    if (!this.processor || this.backing.pendingQueue.length === 0) {
      return;
    }

    const partitionGroups = new Map<string, string[]>();
    for (const deliveryId of this.backing.pendingQueue) {
      const delivery = this.backing.deliveries.get(deliveryId);
      if (!delivery || delivery.status !== "pending") continue;
      const group = partitionGroups.get(delivery.partitionKey) ?? [];
      group.push(deliveryId);
      partitionGroups.set(delivery.partitionKey, group);
    }

    this.backing.pendingQueue.length = 0;

    for (const deliveryIds of partitionGroups.values()) {
      const deliveryId = deliveryIds[0];
      const delivery = this.backing.deliveries.get(deliveryId);
      if (!delivery || !this.processor) continue;

      this.backing.deliveries.set(deliveryId, { ...delivery, status: "in_flight" });

      try {
        await this.processor(delivery);
        await this.acknowledge(deliveryId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Delivery failed";
        await this.nack(deliveryId, message, this.retryPolicy.isRetryableError(message));
      }

      for (const remainingId of deliveryIds.slice(1)) {
        if (!this.backing.pendingQueue.includes(remainingId)) {
          this.backing.pendingQueue.push(remainingId);
        }
      }
    }
  }

  private async findEvents(criteria: ReplayCriteria): Promise<readonly IntelligenceEvent[]> {
    let events = [...this.backing.events.values()].filter(
      (event) => event.organizationId === criteria.organizationId,
    );

    if (criteria.fromTimestamp) {
      events = events.filter((event) => event.timestamp >= criteria.fromTimestamp!);
    }
    if (criteria.toTimestamp) {
      events = events.filter((event) => event.timestamp <= criteria.toTimestamp!);
    }
    if (criteria.correlationId) {
      events = events.filter((event) => event.correlationId === criteria.correlationId);
    }
    if (criteria.eventId) {
      events = events.filter((event) => event.eventId === criteria.eventId);
    }

    events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return events.slice(0, criteria.limit ?? 100);
  }
}
