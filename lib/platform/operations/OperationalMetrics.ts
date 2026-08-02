/**
 * Platform and service metrics collection (Mission P-015.8 · ADR-011).
 */

import type { OperationalStatus } from "@/lib/platform/operations/OperationalTypes";

export type ServiceMetricName =
  | "platform.health.checks"
  | "platform.health.latency_ms"
  | "platform.backup.count"
  | "platform.backup.last_age_hours"
  | "platform.deployment.readiness"
  | "platform.diagnostics.requests"
  | "platform.store.initialized"
  | "platform.security.fail_closed";

export type ServiceMetric = {
  readonly name: ServiceMetricName;
  readonly value: number;
  readonly unit: "count" | "ms" | "score" | "hours" | "boolean";
  readonly timestamp: string;
  readonly labels?: Record<string, string>;
};

export type PlatformMetricsSnapshot = {
  readonly collectedAt: string;
  readonly metrics: readonly ServiceMetric[];
  readonly status: OperationalStatus;
};

/** In-memory platform metrics collector for operational dashboards. */
export class OperationalMetrics {
  private readonly metrics: ServiceMetric[] = [];
  private readonly maxMetrics = 500;

  record(input: Omit<ServiceMetric, "timestamp"> & { timestamp?: string }): ServiceMetric {
    const metric: ServiceMetric = {
      ...input,
      timestamp: input.timestamp ?? new Date().toISOString(),
    };

    this.metrics.unshift(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.length = this.maxMetrics;
    }

    return metric;
  }

  recordHealthCheckLatency(latencyMs: number): void {
    this.record({
      name: "platform.health.checks",
      value: 1,
      unit: "count",
    });
    this.record({
      name: "platform.health.latency_ms",
      value: latencyMs,
      unit: "ms",
    });
  }

  getSnapshot(limit = 50): PlatformMetricsSnapshot {
    const recent = this.metrics.slice(0, limit);
    const hasUnhealthy = recent.some(
      (metric) => metric.name === "platform.deployment.readiness" && metric.value < 50,
    );

    return {
      collectedAt: new Date().toISOString(),
      metrics: recent,
      status: hasUnhealthy ? "degraded" : "healthy",
    };
  }

  clear(): void {
    this.metrics.length = 0;
  }
}

export const operationalMetrics = new OperationalMetrics();
