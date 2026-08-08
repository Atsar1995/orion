export type MetricType = "gauge" | "counter" | "histogram";

export type MetricSample = {
  readonly name: string;
  readonly type: MetricType;
  readonly value: number;
  readonly labels?: Readonly<Record<string, string>>;
  readonly recordedAt: string;
};

export class AuroraMetricsCollector {
  private readonly samples: MetricSample[] = [];

  recordGauge(name: string, value: number, labels?: Readonly<Record<string, string>>): void {
    this.samples.push({
      name,
      type: "gauge",
      value,
      labels,
      recordedAt: new Date().toISOString(),
    });
  }

  incrementCounter(name: string, labels?: Readonly<Record<string, string>>): void {
    const existing = this.samples.find(
      (sample) =>
        sample.type === "counter" &&
        sample.name === name &&
        JSON.stringify(sample.labels) === JSON.stringify(labels),
    );
    if (existing) {
      (existing as { value: number }).value += 1;
      return;
    }
    this.samples.push({
      name,
      type: "counter",
      value: 1,
      labels,
      recordedAt: new Date().toISOString(),
    });
  }

  recordHistogram(name: string, value: number, labels?: Readonly<Record<string, string>>): void {
    this.samples.push({
      name,
      type: "histogram",
      value,
      labels,
      recordedAt: new Date().toISOString(),
    });
  }

  getSamples(): readonly MetricSample[] {
    return [...this.samples];
  }

  clear(): void {
    this.samples.length = 0;
  }
}
