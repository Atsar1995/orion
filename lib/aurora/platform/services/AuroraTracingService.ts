import type { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";

export type TraceSpan = {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
  readonly startedAt: string;
  readonly endedAt?: string;
};

export class AuroraTracingService {
  private readonly spans: TraceSpan[] = [];

  constructor(private readonly config: AuroraRuntimeConfiguration) {}

  startSpan(name: string, attributes: Readonly<Record<string, string | number | boolean>> = {}): TraceSpan {
    const span: TraceSpan = {
      name,
      attributes,
      startedAt: new Date().toISOString(),
    };
    if (this.config.tracingEnabled) {
      this.spans.push(span);
    }
    return span;
  }

  endSpan(span: TraceSpan): void {
    if (!this.config.tracingEnabled) {
      return;
    }
    const index = this.spans.indexOf(span);
    if (index >= 0) {
      this.spans[index] = { ...span, endedAt: new Date().toISOString() };
    }
  }

  getSpans(): readonly TraceSpan[] {
    return [...this.spans];
  }
}
