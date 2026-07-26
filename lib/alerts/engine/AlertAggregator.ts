import type { ExecutiveAlertSignal } from "@/lib/alerts/models/Alert";
import { DEFAULT_EXECUTIVE_ALERT_RULES } from "@/lib/alerts/engine/AlertRules";

/** Aggregates configured rules and incoming signals into normalized alert signals. */
export function aggregateAlertSignals(
  signals: readonly ExecutiveAlertSignal[],
): ExecutiveAlertSignal[] {
  const ruleSignals = DEFAULT_EXECUTIVE_ALERT_RULES.map((rule, index) =>
    createSignalFromRule(rule, index),
  );

  return [...ruleSignals, ...signals];
}

function createSignalFromRule(
  rule: (typeof DEFAULT_EXECUTIVE_ALERT_RULES)[number],
  index: number,
): ExecutiveAlertSignal {
  return {
    id: `rule-signal-${rule.id}`,
    title: rule.title,
    message: rule.messageTemplate,
    severity: rule.severity,
    category: rule.category,
    source: rule.source,
    status: "active",
    workspace: rule.workspace,
    dedupeKey: rule.dedupeKey,
    createdAt: `2026-07-26T0${index + 5}:00:00.000Z`,
  };
}
