import { platformLogger } from "@/lib/data/logging/PlatformLogger";

export type MetricName =
  | "web_vitals.fcp"
  | "web_vitals.lcp"
  | "web_vitals.cls"
  | "web_vitals.ttfb"
  | "web_vitals.inp"
  | "api.latency"
  | "page.load";

export type PerformanceMetric = {
  readonly name: MetricName | string;
  readonly value: number;
  readonly unit: "ms" | "score" | "count";
  readonly timestamp: string;
  readonly route?: string;
};

export type ReportedError = {
  readonly id: string;
  readonly message: string;
  readonly digest?: string;
  readonly route?: string;
  readonly timestamp: string;
  readonly stack?: string;
};

/** Shared performance and error observability (Mission S1D). */
class ObservabilityStore {
  private readonly metrics: PerformanceMetric[] = [];
  private readonly errors: ReportedError[] = [];
  private readonly maxEntries = 200;
  private errorSequence = 0;

  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): PerformanceMetric {
    const entry: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString(),
    };

    this.metrics.unshift(entry);

    if (this.metrics.length > this.maxEntries) {
      this.metrics.length = this.maxEntries;
    }

    platformLogger.log({
      level: "info",
      category: "service",
      message: `${entry.name}=${entry.value}${entry.unit}`,
      source: "PerformanceMonitor",
      metadata: entry.route ? { route: entry.route } : undefined,
    });

    return entry;
  }

  reportError(input: Omit<ReportedError, "id" | "timestamp">): ReportedError {
    const entry: ReportedError = {
      ...input,
      id: `err-${++this.errorSequence}`,
      timestamp: new Date().toISOString(),
    };

    this.errors.unshift(entry);

    if (this.errors.length > this.maxEntries) {
      this.errors.length = this.maxEntries;
    }

    platformLogger.unexpectedException(entry.message, "ErrorReporter", {
      route: entry.route ?? "unknown",
      digest: entry.digest ?? "",
    });

    return entry;
  }

  getMetrics(limit = 50): readonly PerformanceMetric[] {
    return this.metrics.slice(0, limit);
  }

  getErrors(limit = 50): readonly ReportedError[] {
    return this.errors.slice(0, limit);
  }

  getWebVitalsSummary(): Record<string, number | null> {
    const latest = new Map<string, number>();

    for (const metric of this.metrics) {
      if (!latest.has(metric.name)) {
        latest.set(metric.name, metric.value);
      }
    }

    return {
      fcp: latest.get("web_vitals.fcp") ?? null,
      lcp: latest.get("web_vitals.lcp") ?? null,
      cls: latest.get("web_vitals.cls") ?? null,
      ttfb: latest.get("web_vitals.ttfb") ?? null,
      inp: latest.get("web_vitals.inp") ?? null,
    };
  }

  clear(): void {
    this.metrics.length = 0;
    this.errors.length = 0;
  }
}

export const observabilityStore = new ObservabilityStore();

export function scoreWebVitals(metrics: ReturnType<ObservabilityStore["getWebVitalsSummary"]>): number {
  let score = 100;

  if (metrics.lcp !== null && metrics.lcp > 2500) {
    score -= 15;
  }

  if (metrics.fcp !== null && metrics.fcp > 1800) {
    score -= 10;
  }

  if (metrics.cls !== null && metrics.cls > 0.1) {
    score -= 15;
  }

  if (metrics.inp !== null && metrics.inp > 200) {
    score -= 10;
  }

  return Math.max(0, score);
}
