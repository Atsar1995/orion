import type { SubscriptionManager } from "@/lib/platform/intelligence/SubscriptionManager";
import type { IntelligenceHealthSnapshot } from "@/types/intelligence-integration";

type HealthCounters = {
  publishedTotal: number;
  deliveredTotal: number;
  failedTotal: number;
  lastEventAt?: string;
};

/** Monitors intelligence integration layer health (Mission P-006 · ADR-013). */
export class HealthMonitor {
  private counters: HealthCounters = {
    publishedTotal: 0,
    deliveredTotal: 0,
    failedTotal: 0,
  };

  recordPublished(): void {
    this.counters.publishedTotal += 1;
    this.counters.lastEventAt = new Date().toISOString();
  }

  recordDelivered(count: number): void {
    this.counters.deliveredTotal += count;
  }

  recordFailure(count = 1): void {
    this.counters.failedTotal += count;
  }

  snapshot(input: {
    registeredServices: number;
    subscriptionManager: SubscriptionManager;
    queuedMessages: number;
    deadLetterCount: number;
    organizationId?: string;
    transportStatus?: IntelligenceHealthSnapshot["status"];
  }): IntelligenceHealthSnapshot {
    const subscriptions = input.subscriptionManager.list();
    const deadLetterCount = input.deadLetterCount;
    const queuedMessages = input.queuedMessages;

    let status: IntelligenceHealthSnapshot["status"] = input.transportStatus ?? "healthy";

    if (!input.transportStatus) {
      if (deadLetterCount > 0 || queuedMessages > 25) {
        status = "degraded";
      }
      if (deadLetterCount > 10 || this.counters.failedTotal > this.counters.deliveredTotal) {
        status = "unhealthy";
      }
    }

    const summary =
      status === "healthy"
        ? "Intelligence Integration Layer is operational."
        : status === "degraded"
          ? "Some events require attention — review dead-letter queue and queue depth."
          : "Event delivery failures exceed healthy thresholds.";

    return {
      status,
      registeredServices: input.registeredServices,
      activeSubscriptions: subscriptions.filter((entry) => entry.enabled).length,
      queuedMessages,
      publishedTotal: this.counters.publishedTotal,
      deliveredTotal: this.counters.deliveredTotal,
      failedTotal: this.counters.failedTotal,
      deadLetterCount,
      lastEventAt: this.counters.lastEventAt,
      summary,
    };
  }
}

export const defaultHealthMonitor = new HealthMonitor();
