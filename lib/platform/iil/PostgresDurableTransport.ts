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
import {
  IIL_COLLECTION_DEAD_LETTER,
  IIL_COLLECTION_DELIVERY,
  IIL_COLLECTION_EVENT,
  IIL_COLLECTION_IDEMPOTENCY,
  IILEntityPersister,
} from "@/lib/platform/iil/persistence/IILEntityPersister";
import { ReplayService } from "@/lib/platform/iil/ReplayService";
import { RetryPolicy, defaultRetryPolicy } from "@/lib/platform/iil/RetryPolicy";
import { InMemoryDurableTransportBacking } from "@/lib/platform/iil/InMemoryDurableTransport";
import { TransportMetrics, type TransportMetricsSnapshot } from "@/lib/platform/iil/TransportMetrics";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

type IdempotencyEntry = {
  readonly eventId: string;
  readonly expiresAt: string;
};

/** PostgreSQL-backed durable IIL transport (ADR-013 · P-009.16). */
export class PostgresDurableTransport implements DurableTransportAdapter {
  readonly mode = "postgres" as const;

  private readonly persister: IILEntityPersister;
  private readonly retryPolicy: RetryPolicy;
  private readonly metrics = new TransportMetrics();
  private readonly replayService = new ReplayService();
  private readonly memoryIndex = new InMemoryDurableTransportBacking();
  private processor: DeliveryProcessor | null = null;
  private loopActive = false;
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private hydrated = false;

  constructor(
    connection: DatabaseConnection,
    options?: { retryPolicy?: RetryPolicy },
  ) {
    this.persister = new IILEntityPersister(connection);
    this.retryPolicy = options?.retryPolicy ?? defaultRetryPolicy;
  }

  async persistAndEnqueue(event: IntelligenceEvent, context: ServiceContext): Promise<PublishReceipt> {
    await this.ensureHydrated();

    if (await this.hasEvent(event.eventId)) {
      throw new Error("DUPLICATE_EVENT");
    }

    const idempotencyKey = buildIdempotencyKey(event);
    if (await this.hasIdempotencyKey(idempotencyKey, event.organizationId)) {
      throw new Error("DUPLICATE_EVENT");
    }

    const persistedAt = new Date().toISOString();
    const deliveryId = randomUUID();
    const partitionKey = event.partitionKey ?? `${event.organizationId}:${event.entityType}:${event.entityId}`;

    await this.persister.upsertImmediate(IIL_COLLECTION_EVENT, event.eventId, event, event.organizationId);
    await this.persister.upsertImmediate(
      IIL_COLLECTION_IDEMPOTENCY,
      `${event.organizationId}:${idempotencyKey}`,
      { eventId: event.eventId, expiresAt: createIdempotencyExpiry() },
      event.organizationId,
    );

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

    await this.persister.upsertImmediate(IIL_COLLECTION_DELIVERY, deliveryId, delivery, event.organizationId);

    this.memoryIndex.events.set(event.eventId, event);
    this.memoryIndex.deliveries.set(deliveryId, delivery);
    this.memoryIndex.idempotencyKeys.set(`${event.organizationId}:${idempotencyKey}`, {
      eventId: event.eventId,
      expiresAt: createIdempotencyExpiry(),
    });
    this.memoryIndex.pendingQueue.push(deliveryId);
    this.metrics.recordPublished();

    return { eventId: event.eventId, deliveryId, persistedAt, partitionKey, idempotencyKey };
  }

  async hasEvent(eventId: string): Promise<boolean> {
    await this.ensureHydrated();
    return this.memoryIndex.events.has(eventId);
  }

  async hasIdempotencyKey(idempotencyKey: string, organizationId: string): Promise<boolean> {
    await this.ensureHydrated();
    const entry = this.memoryIndex.idempotencyKeys.get(`${organizationId}:${idempotencyKey}`);
    if (!entry) return false;
    if (isIdempotencyKeyExpired(entry.expiresAt)) {
      this.memoryIndex.idempotencyKeys.delete(`${organizationId}:${idempotencyKey}`);
      await this.persister.deleteImmediate(IIL_COLLECTION_IDEMPOTENCY, `${organizationId}:${idempotencyKey}`);
      return false;
    }
    return true;
  }

  async acknowledge(deliveryId: string): Promise<void> {
    const delivery = this.memoryIndex.deliveries.get(deliveryId);
    if (!delivery) return;
    const updated = { ...delivery, status: "delivered" as const };
    this.memoryIndex.deliveries.set(deliveryId, updated);
    await this.persister.upsertImmediate(IIL_COLLECTION_DELIVERY, deliveryId, updated, delivery.event.organizationId);
    this.metrics.recordDelivered();
  }

  async nack(deliveryId: string, reason: string, retryable: boolean): Promise<void> {
    const delivery = this.memoryIndex.deliveries.get(deliveryId);
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
      this.memoryIndex.deliveries.set(deliveryId, updated);
      await this.persister.upsertImmediate(
        IIL_COLLECTION_DELIVERY,
        deliveryId,
        updated,
        delivery.event.organizationId,
      );
      setTimeout(() => {
        this.memoryIndex.pendingQueue.push(deliveryId);
      }, delay);
      return;
    }

    this.metrics.recordFailure();
    const dlqRecord = this.memoryIndex.deadLetterQueue.enqueue(delivery.event, reason, nextAttempts, reason);
    await this.persister.upsertImmediate(
      IIL_COLLECTION_DEAD_LETTER,
      dlqRecord.id,
      dlqRecord,
      delivery.event.organizationId,
    );

    const dead: DeliveryRecord = {
      ...delivery,
      attempts: nextAttempts,
      status: "dead_letter",
      lastError: reason,
    };
    this.memoryIndex.deliveries.set(deliveryId, dead);
    await this.persister.upsertImmediate(IIL_COLLECTION_DELIVERY, deliveryId, dead, delivery.event.organizationId);
  }

  async getDeadLetter(organizationId?: string, limit = 50): Promise<readonly DeadLetterRecord[]> {
    await this.ensureHydrated();
    return this.memoryIndex.deadLetterQueue.list(organizationId, limit);
  }

  async requeueFromDeadLetter(id: string, context: ServiceContext): Promise<IntelligenceEvent | null> {
    await this.ensureHydrated();
    const record = this.memoryIndex.deadLetterQueue.remove(id);
    if (!record || record.event.organizationId !== context.organizationId) {
      return null;
    }

    await this.persister.deleteImmediate(IIL_COLLECTION_DEAD_LETTER, id);

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

    this.memoryIndex.deliveries.set(deliveryId, delivery);
    this.memoryIndex.pendingQueue.push(deliveryId);
    await this.persister.upsertImmediate(
      IIL_COLLECTION_DELIVERY,
      deliveryId,
      delivery,
      record.event.organizationId,
    );

    return record.event;
  }

  async replay(criteria: ReplayCriteria, processor: DeliveryProcessor): Promise<ReplayResult> {
    await this.ensureHydrated();
    const result = await this.replayService.replay(
      criteria,
      {
        findEvents: async (query) => this.findEvents(query),
        createDelivery: async () => undefined,
      },
      processor,
    );
    this.metrics.recordReplayed(result.replayed);
    return result;
  }

  async listEvents(organizationId: string, limit = 50): Promise<readonly IntelligenceEvent[]> {
    await this.ensureHydrated();
    return [...this.memoryIndex.events.values()]
      .filter((event) => event.organizationId === organizationId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  async recoverPendingDeliveries(): Promise<number> {
    await this.ensureHydrated();
    let recovered = 0;
    for (const [deliveryId, delivery] of this.memoryIndex.deliveries.entries()) {
      if (
        (delivery.status === "pending" || delivery.status === "in_flight") &&
        !this.memoryIndex.pendingQueue.includes(deliveryId)
      ) {
        this.memoryIndex.pendingQueue.push(deliveryId);
        recovered += 1;
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
    const pending = [...this.memoryIndex.deliveries.values()].filter(
      (delivery) => delivery.status === "pending" || delivery.status === "in_flight",
    ).length;

    return this.metrics.snapshot({
      mode: "postgres",
      persistedEvents: this.memoryIndex.events.size,
      pendingDeliveries: pending,
      deadLetterCount: this.memoryIndex.deadLetterQueue.count(),
    });
  }

  health(): TransportHealth {
    const metrics = this.getMetrics();
    let status: TransportHealth["status"] = "healthy";
    if (metrics.deadLetterCount > 0 || metrics.pendingDeliveries > 25) status = "degraded";
    if (metrics.deadLetterCount > 10) status = "unhealthy";

    return {
      status,
      connected: true,
      queueDepth: metrics.pendingDeliveries,
      deadLetterCount: metrics.deadLetterCount,
      summary:
        status === "healthy"
          ? "PostgreSQL durable IIL transport operational."
          : "Review IIL queue depth or dead-letter entries.",
    };
  }

  private async ensureHydrated(): Promise<void> {
    if (this.hydrated) return;

    const events = await this.persister.loadCollection<IntelligenceEvent>(IIL_COLLECTION_EVENT);
    const deliveries = await this.persister.loadCollection<DeliveryRecord>(IIL_COLLECTION_DELIVERY);
    const deadLetters = await this.persister.loadCollection<DeadLetterRecord>(IIL_COLLECTION_DEAD_LETTER);
    const idempotency = await this.persister.loadCollection<IdempotencyEntry>(IIL_COLLECTION_IDEMPOTENCY);

    for (const [eventId, event] of events.entries()) {
      this.memoryIndex.events.set(eventId, event);
    }
    for (const [deliveryId, delivery] of deliveries.entries()) {
      this.memoryIndex.deliveries.set(deliveryId, delivery);
    }
    this.memoryIndex.deadLetterQueue.hydrate([...deadLetters.values()]);
    for (const [key, entry] of idempotency.entries()) {
      this.memoryIndex.idempotencyKeys.set(key, entry);
    }

    this.hydrated = true;
  }

  private async processNext(): Promise<void> {
    if (!this.processor || this.memoryIndex.pendingQueue.length === 0) return;

    const deliveryId = this.memoryIndex.pendingQueue.shift();
    if (!deliveryId) return;

    const delivery = this.memoryIndex.deliveries.get(deliveryId);
    if (!delivery || delivery.status !== "pending" || !this.processor) {
      return;
    }

    this.memoryIndex.deliveries.set(deliveryId, { ...delivery, status: "in_flight" });

    try {
      await this.processor(delivery);
      await this.acknowledge(deliveryId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delivery failed";
      await this.nack(deliveryId, message, this.retryPolicy.isRetryableError(message));
    }
  }

  private async findEvents(criteria: ReplayCriteria): Promise<readonly IntelligenceEvent[]> {
    let events = [...this.memoryIndex.events.values()].filter(
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
