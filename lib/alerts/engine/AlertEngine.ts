import { aggregateAlertSignals } from "@/lib/alerts/engine/AlertAggregator";
import { deduplicateAlertSignals } from "@/lib/alerts/engine/AlertDeduplicator";
import { prioritizeAlertSignals } from "@/lib/alerts/engine/AlertPrioritizer";
import type {
  AlertCenterSnapshot,
  ExecutiveAlert,
  ExecutiveAlertSignal,
} from "@/lib/alerts/models/Alert";
import { buildAlertCenterCounts } from "@/lib/alerts/models/Alert";

export type AlertEngineInput = {
  readonly signals?: readonly ExecutiveAlertSignal[];
  readonly generatedAt?: string;
};

const DEFAULT_GENERATED_AT = "2026-07-26T06:00:00.000Z";

/** EP-003 executive alert engine — deterministic mock processing only. */
export class AlertEngine {
  process(input: AlertEngineInput = {}): AlertCenterSnapshot {
    const generatedAt = input.generatedAt ?? DEFAULT_GENERATED_AT;
    const aggregated = aggregateAlertSignals(input.signals ?? []);
    const deduplicated = deduplicateAlertSignals(aggregated);
    const prioritized = prioritizeAlertSignals(deduplicated);
    const alerts = prioritized.map((signal) => toExecutiveAlert(signal, generatedAt));

    return {
      generatedAt,
      alerts,
      counts: buildAlertCenterCounts(alerts),
    };
  }
}

function toExecutiveAlert(signal: ExecutiveAlertSignal, generatedAt: string): ExecutiveAlert {
  return {
    id: signal.id,
    title: signal.title,
    message: signal.message,
    severity: signal.severity,
    category: signal.category,
    source: signal.source,
    status: signal.status,
    workspace: signal.workspace,
    dedupeKey: signal.dedupeKey,
    createdAt: signal.createdAt,
    updatedAt: generatedAt,
  };
}

export const defaultAlertEngine = new AlertEngine();

/** Builds a deterministic alert center snapshot from mock signals. */
export function createAlertCenterSnapshot(
  input: AlertEngineInput = {},
  engine: AlertEngine = defaultAlertEngine,
): AlertCenterSnapshot {
  return engine.process(input);
}
