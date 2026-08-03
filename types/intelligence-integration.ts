/**
 * ORION Intelligence Integration Layer — types (Mission P-006).
 */

import type { ServiceContext } from "@/types/services";

/** Standard intelligence event types supported by the IIL. */
export type IntelligenceEventType =
  | "DecisionCreated"
  | "DecisionUpdated"
  | "MemoryCreated"
  | "MemoryUpdated"
  | "UserCreated"
  | "OrganizationUpdated"
  | "ReservationCreated"
  | "CustomerUpdated"
  | "InvoiceIssued"
  | "TaskCompleted"
  | "NotificationSent"
  | "CustomEvent";

export type IntelligenceEventPriority = "low" | "normal" | "high" | "critical";

export type SecurityClassification = "public" | "internal" | "confidential" | "restricted";

/** Canonical intelligence event model — every platform event conforms to this schema. */
export type IntelligenceEvent = {
  readonly eventId: string;
  readonly eventType: IntelligenceEventType;
  readonly sourceService: string;
  readonly sourceWorkspace: string;
  readonly organizationId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly priority: IntelligenceEventPriority;
  readonly correlationId: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly version: string;
  readonly securityClassification: SecurityClassification;
  readonly auditMetadata: Readonly<Record<string, string>>;
  /** ADR-013 — bounded context identifier. */
  readonly sourceDomain?: string;
  /** ADR-013 — consumer dedupe key. */
  readonly idempotencyKey?: string;
  /** ADR-013 — ordering partition. */
  readonly partitionKey?: string;
  /** ADR-013 — parent event when chained. */
  readonly causationId?: string;
  /** ADR-013 — transport delivery metadata. */
  readonly deliveryMetadata?: Readonly<Record<string, string>>;
};

export type PublishIntelligenceEventInput = {
  readonly eventType: IntelligenceEventType;
  readonly sourceService: string;
  readonly sourceWorkspace: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly priority?: IntelligenceEventPriority;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly version?: string;
  readonly securityClassification?: SecurityClassification;
  readonly auditMetadata?: Readonly<Record<string, string>>;
  readonly eventId?: string;
};

export type IntelligenceSubscription = {
  readonly id: string;
  readonly subscriberId: string;
  readonly eventTypes: readonly IntelligenceEventType[];
  readonly priority: number;
  readonly enabled: boolean;
  readonly createdAt: string;
};

export type CreateIntelligenceSubscriptionInput = {
  readonly subscriberId: string;
  readonly eventTypes: readonly IntelligenceEventType[];
  readonly priority?: number;
};

export type IntelligenceEventHandler = (
  event: IntelligenceEvent,
  context: ServiceContext,
) => Promise<void>;

export type DeadLetterRecord = {
  readonly id: string;
  readonly event: IntelligenceEvent;
  readonly failureReason: string;
  readonly attempts: number;
  readonly failedAt: string;
  readonly lastError?: string;
};

export type WebhookSubscription = {
  readonly id: string;
  readonly providerId: string;
  readonly organizationId: string;
  readonly targetUrl: string;
  readonly secret: string;
  readonly eventTypes: readonly IntelligenceEventType[];
  readonly enabled: boolean;
  readonly createdAt: string;
};

export type CreateWebhookSubscriptionInput = {
  readonly providerId: string;
  readonly targetUrl: string;
  readonly secret: string;
  readonly eventTypes: readonly IntelligenceEventType[];
};

export type RegisteredService = {
  readonly serviceId: string;
  readonly label: string;
  readonly workspace: string;
  readonly canPublish: boolean;
  readonly canSubscribe: boolean;
};

export type IntelligenceHealthSnapshot = {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly registeredServices: number;
  readonly activeSubscriptions: number;
  readonly queuedMessages: number;
  readonly publishedTotal: number;
  readonly deliveredTotal: number;
  readonly failedTotal: number;
  readonly deadLetterCount: number;
  readonly lastEventAt?: string;
  readonly summary: string;
};

export type IntelligenceFeedItem = {
  readonly id: string;
  readonly eventType: IntelligenceEventType;
  readonly summary: string;
  readonly sourceService: string;
  readonly sourceWorkspace: string;
  readonly timestamp: string;
  readonly priority: IntelligenceEventPriority;
};

export type ReplayResult = {
  readonly replayed: number;
  readonly skipped: number;
  readonly failed: number;
};
