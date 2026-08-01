import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type {
  CreateWebhookSubscriptionInput,
  IntelligenceEvent,
  WebhookSubscription,
} from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

type WebhookDeliveryLog = {
  readonly id: string;
  readonly subscriptionId: string;
  readonly eventId: string;
  readonly status: "delivered" | "failed";
  readonly timestamp: string;
  readonly detail: string;
};

/** Inbound/outbound webhook gateway for intelligence events (Mission P-006). */
export class WebhookGateway {
  private readonly subscriptions = new Map<string, WebhookSubscription>();
  private readonly deliveryLog: WebhookDeliveryLog[] = [];

  register(input: CreateWebhookSubscriptionInput, context: ServiceContext): WebhookSubscription {
    const subscription: WebhookSubscription = {
      id: randomUUID(),
      providerId: input.providerId.trim(),
      organizationId: context.organizationId,
      targetUrl: input.targetUrl.trim(),
      secret: input.secret.trim(),
      eventTypes: [...input.eventTypes],
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  list(organizationId?: string): readonly WebhookSubscription[] {
    const all = [...this.subscriptions.values()];
    return organizationId ? all.filter((entry) => entry.organizationId === organizationId) : all;
  }

  verifyInboundSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature.trim() || !secret.trim()) {
      return false;
    }

    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const provided = signature.replace(/^sha256=/, "");

    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
      return false;
    }
  }

  async deliver(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<{ delivered: number; failures: string[]; success: boolean }> {
    const matches = this.list(context.organizationId).filter(
      (entry) => entry.enabled && entry.eventTypes.includes(event.eventType),
    );

    const failures: string[] = [];
    let delivered = 0;

    for (const subscription of matches) {
      try {
        this.recordDelivery(subscription.id, event.eventId, "delivered", `Queued to ${subscription.targetUrl}`);
        delivered += 1;
      } catch (error) {
        failures.push(
          `${subscription.providerId}: ${error instanceof Error ? error.message : "Delivery failed"}`,
        );
        this.recordDelivery(
          subscription.id,
          event.eventId,
          "failed",
          error instanceof Error ? error.message : "Delivery failed",
        );
      }
    }

    return { delivered, failures, success: failures.length === 0 };
  }

  getRecentDeliveries(limit = 20): readonly WebhookDeliveryLog[] {
    return this.deliveryLog.slice(0, limit);
  }

  private recordDelivery(
    subscriptionId: string,
    eventId: string,
    status: WebhookDeliveryLog["status"],
    detail: string,
  ): void {
    this.deliveryLog.unshift({
      id: randomUUID(),
      subscriptionId,
      eventId,
      status,
      timestamp: new Date().toISOString(),
      detail,
    });

    if (this.deliveryLog.length > 200) {
      this.deliveryLog.length = 200;
    }
  }
}

export const defaultWebhookGateway = new WebhookGateway();
