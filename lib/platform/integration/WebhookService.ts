import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type { WebhookSubscriptionRecord } from "@/types/integration";
import type { IntegrationRepository } from "@/lib/platform/integration/repositories/IntegrationRepository";
import { createJobId } from "@/lib/platform/integration/repositories/InMemoryIntegrationRepository";
import type { ServiceContext } from "@/types/services";
import { integrationRulesEngine } from "@/lib/platform/integration/IntegrationRulesEngine";

function nowIso(): string {
  return new Date().toISOString();
}

/** Webhook subscription framework (Mission P-010.7). */
export class WebhookService {
  constructor(private readonly repository: IntegrationRepository) {}

  list(context: ServiceContext, connectorId?: string): readonly WebhookSubscriptionRecord[] {
    return this.repository.listWebhooks(context.organizationId, connectorId);
  }

  register(
    input: {
      readonly connectorId: string;
      readonly targetUrl: string;
      readonly eventTypes: readonly string[];
      readonly secretRef: string;
    },
    context: ServiceContext,
  ): WebhookSubscriptionRecord {
    const connector = this.repository.findConnector(context.organizationId, input.connectorId);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");
    if (connector.integrationType !== "webhook") throw new Error("INVALID_CONNECTOR_TYPE");

    const urlError = integrationRulesEngine.validateWebhookUrl(input.targetUrl);
    if (urlError) throw new Error(urlError.code);
    if (input.eventTypes.length === 0) throw new Error("NO_EVENT_TYPES");

    const subscription: WebhookSubscriptionRecord = {
      id: createJobId("wh"),
      organizationId: context.organizationId,
      connectorId: input.connectorId,
      targetUrl: input.targetUrl,
      eventTypes: [...input.eventTypes],
      secretRef: input.secretRef,
      enabled: true,
      createdAt: nowIso(),
    };

    this.repository.createWebhook(subscription);
    return subscription;
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature.trim() || !secret.trim()) return false;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const provided = signature.replace(/^sha256=/, "");
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
      return false;
    }
  }

  subscribeToEvents(
    connectorId: string,
    eventTypes: readonly string[],
    context: ServiceContext,
  ) {
    const connector = this.repository.findConnector(context.organizationId, connectorId);
    if (!connector) throw new Error("CONNECTOR_NOT_FOUND");

    return this.repository.createSubscription({
      id: createJobId("sub"),
      organizationId: context.organizationId,
      connectorId,
      eventTypes: [...eventTypes],
      active: true,
      createdAt: nowIso(),
    });
  }

  listSubscriptions(context: ServiceContext, connectorId?: string) {
    return this.repository.listSubscriptions(context.organizationId, connectorId);
  }
}
