import { randomUUID } from "crypto";
import type {
  CreateIntelligenceSubscriptionInput,
  IntelligenceEvent,
  IntelligenceEventHandler,
  IntelligenceEventType,
  IntelligenceSubscription,
} from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

type RegisteredHandler = {
  readonly subscription: IntelligenceSubscription;
  readonly handler: IntelligenceEventHandler;
};

/** Manages intelligence event subscriptions (Mission P-006). */
export class SubscriptionManager {
  private readonly handlers = new Map<string, RegisteredHandler>();

  subscribe(input: CreateIntelligenceSubscriptionInput, handler: IntelligenceEventHandler): IntelligenceSubscription {
    const subscription: IntelligenceSubscription = {
      id: randomUUID(),
      subscriberId: input.subscriberId.trim(),
      eventTypes: [...input.eventTypes],
      priority: input.priority ?? 100,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    this.handlers.set(subscription.id, { subscription, handler });
    return subscription;
  }

  unsubscribe(subscriptionId: string): boolean {
    return this.handlers.delete(subscriptionId);
  }

  list(): readonly IntelligenceSubscription[] {
    return [...this.handlers.values()].map((entry) => entry.subscription);
  }

  getMatching(eventType: IntelligenceEventType): RegisteredHandler[] {
    return [...this.handlers.values()]
      .filter(
        (entry) =>
          entry.subscription.enabled &&
          entry.subscription.eventTypes.includes(eventType),
      )
      .sort((left, right) => left.subscription.priority - right.subscription.priority);
  }

  async dispatch(
    event: IntelligenceEvent,
    context: ServiceContext,
    timeoutMs = 5000,
  ): Promise<{ delivered: number; failures: string[] }> {
    const matches = this.getMatching(event.eventType);
    const failures: string[] = [];
    let delivered = 0;

    for (const match of matches) {
      try {
        await withTimeout(match.handler(event, context), timeoutMs);
        delivered += 1;
      } catch (error) {
        failures.push(
          `${match.subscription.subscriberId}: ${
            error instanceof Error ? error.message : "Subscriber timeout"
          }`,
        );
      }
    }

    return { delivered, failures };
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Subscriber timeout")), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
