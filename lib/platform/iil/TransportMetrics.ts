/** Transport-level metrics for durable IIL health reporting (P-009.16). */
export type TransportMetricsSnapshot = {
  readonly mode: "memory" | "postgres";
  readonly persistedEvents: number;
  readonly pendingDeliveries: number;
  readonly deadLetterCount: number;
  readonly publishedTotal: number;
  readonly deliveredTotal: number;
  readonly failedTotal: number;
  readonly replayedTotal: number;
  readonly lastPersistedAt?: string;
  readonly lagMs: number;
};

export class TransportMetrics {
  private publishedTotal = 0;
  private deliveredTotal = 0;
  private failedTotal = 0;
  private replayedTotal = 0;
  private lastPersistedAt?: string;

  recordPublished(): void {
    this.publishedTotal += 1;
    this.lastPersistedAt = new Date().toISOString();
  }

  recordDelivered(count = 1): void {
    this.deliveredTotal += count;
  }

  recordFailure(count = 1): void {
    this.failedTotal += count;
  }

  recordReplayed(count = 1): void {
    this.replayedTotal += count;
  }

  snapshot(input: {
    mode: "memory" | "postgres";
    persistedEvents: number;
    pendingDeliveries: number;
    deadLetterCount: number;
  }): TransportMetricsSnapshot {
    const lagMs = this.lastPersistedAt
      ? Math.max(0, Date.now() - new Date(this.lastPersistedAt).getTime())
      : 0;

    return {
      mode: input.mode,
      persistedEvents: input.persistedEvents,
      pendingDeliveries: input.pendingDeliveries,
      deadLetterCount: input.deadLetterCount,
      publishedTotal: this.publishedTotal,
      deliveredTotal: this.deliveredTotal,
      failedTotal: this.failedTotal,
      replayedTotal: this.replayedTotal,
      lastPersistedAt: this.lastPersistedAt,
      lagMs,
    };
  }

  resetForTests(): void {
    this.publishedTotal = 0;
    this.deliveredTotal = 0;
    this.failedTotal = 0;
    this.replayedTotal = 0;
    this.lastPersistedAt = undefined;
  }
}
