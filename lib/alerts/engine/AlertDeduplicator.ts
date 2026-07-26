import type { ExecutiveAlert, ExecutiveAlertSignal } from "@/lib/alerts/models/Alert";

function normalizeDedupeKey(signal: ExecutiveAlertSignal): string {
  return signal.dedupeKey.trim().toLowerCase();
}

/** Removes duplicate executive alerts by normalized dedupe key. */
export function deduplicateAlertSignals(signals: readonly ExecutiveAlertSignal[]): ExecutiveAlertSignal[] {
  const seen = new Set<string>();
  const unique: ExecutiveAlertSignal[] = [];

  for (const signal of signals) {
    const key = normalizeDedupeKey(signal);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(signal);
  }

  return unique;
}

/** Removes duplicate executive alerts by normalized dedupe key. */
export function deduplicateExecutiveAlerts(alerts: readonly ExecutiveAlert[]): ExecutiveAlert[] {
  const seen = new Set<string>();
  const unique: ExecutiveAlert[] = [];

  for (const alert of alerts) {
    const key = alert.dedupeKey.trim().toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(alert);
  }

  return unique;
}
