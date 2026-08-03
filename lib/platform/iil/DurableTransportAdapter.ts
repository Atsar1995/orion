import type {
  DeadLetterRecord,
  IntelligenceEvent,
  ReplayResult,
} from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import type { TransportMetricsSnapshot } from "@/lib/platform/iil/TransportMetrics";

export type PublishReceipt = {
  readonly eventId: string;
  readonly deliveryId: string;
  readonly persistedAt: string;
  readonly partitionKey: string;
  readonly idempotencyKey: string;
};

export type DeliveryRecord = {
  readonly deliveryId: string;
  readonly eventId: string;
  readonly event: IntelligenceEvent;
  readonly context: ServiceContext;
  readonly attempts: number;
  readonly status: "pending" | "in_flight" | "delivered" | "dead_letter";
  readonly partitionKey: string;
  readonly idempotencyKey: string;
  readonly enqueuedAt: string;
  readonly lastError?: string;
};

export type ReplayCriteria = {
  readonly organizationId: string;
  readonly eventId?: string;
  readonly correlationId?: string;
  readonly eventType?: string;
  readonly fromTimestamp?: string;
  readonly toTimestamp?: string;
  readonly limit?: number;
};

export type TransportHealth = {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly connected: boolean;
  readonly queueDepth: number;
  readonly deadLetterCount: number;
  readonly summary: string;
};

export type DeliveryProcessor = (delivery: DeliveryRecord) => Promise<void>;

/** Durable IIL transport abstraction (ADR-013 · P-009.16). */
export interface DurableTransportAdapter {
  readonly mode: "memory" | "postgres";

  /** Synchronous persist-before-ack — in-memory transport only. */
  persistAndEnqueueSync?(event: IntelligenceEvent, context: ServiceContext): PublishReceipt;

  /** Persists the event before returning the publish receipt. */
  persistAndEnqueue(event: IntelligenceEvent, context: ServiceContext): Promise<PublishReceipt>;

  /** Returns true when the eventId was already persisted. */
  hasEvent(eventId: string): Promise<boolean>;

  /** Returns true when the idempotency key is within the dedupe window. */
  hasIdempotencyKey(idempotencyKey: string, organizationId: string): Promise<boolean>;

  acknowledge(deliveryId: string): Promise<void>;

  nack(deliveryId: string, reason: string, retryable: boolean): Promise<void>;

  getDeadLetter(organizationId?: string, limit?: number): Promise<readonly DeadLetterRecord[]>;

  requeueFromDeadLetter(id: string, context: ServiceContext): Promise<IntelligenceEvent | null>;

  replay(criteria: ReplayCriteria, processor: DeliveryProcessor): Promise<ReplayResult>;

  listEvents(organizationId: string, limit?: number): Promise<readonly IntelligenceEvent[]>;

  /** Re-enqueues pending deliveries after process restart. */
  recoverPendingDeliveries(): Promise<number>;

  startDeliveryLoop(processor: DeliveryProcessor): void;

  stopDeliveryLoop(): void;

  getMetrics(): TransportMetricsSnapshot;

  health(): TransportHealth;
}

/** Alias aligned with ADR-013 naming. */
export type IILTransportAdapter = DurableTransportAdapter;
