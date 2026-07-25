import type { Alert, AlertBundle, AlertCounts, AlertGroup, AlertSeverity } from "@/types/alerts";

const SEVERITY_WEIGHT: Record<AlertSeverity, number> = {
  critical: 500,
  high: 400,
  medium: 300,
  low: 200,
  information: 100,
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

/** Removes duplicate alerts by dedupe key or normalized title. */
export function deduplicateAlerts(alerts: Alert[]): Alert[] {
  const seen = new Set<string>();
  const unique: Alert[] = [];

  for (const alert of alerts) {
    const key =
      alert.trigger.payload.dedupeKey ??
      `${alert.category}:${normalizeKey(alert.title)}:${normalizeKey(alert.message)}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push({
      ...alert,
      trigger: {
        ...alert.trigger,
        payload: { ...alert.trigger.payload, dedupeKey: key },
      },
    });
  }

  return unique;
}

/** Ranks alerts by severity and recency. */
export function rankAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort((left, right) => {
    const severityDelta = SEVERITY_WEIGHT[right.severity] - SEVERITY_WEIGHT[left.severity];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

/** Groups related alerts by groupId or category. */
export function groupRelatedAlerts(alerts: Alert[]): AlertGroup[] {
  const groups = new Map<string, AlertGroup>();

  for (const alert of alerts) {
    const key = alert.groupId ?? alert.category;
    const existing = groups.get(key);

    if (existing) {
      existing.alerts.push(alert);
      continue;
    }

    groups.set(key, {
      id: key,
      label: alert.groupId ?? alert.category,
      category: alert.category,
      alerts: [alert],
    });
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    alerts: rankAlerts(group.alerts),
  }));
}

/** Escalates unresolved alerts past their configured escalation window. */
export function escalateUnresolvedAlerts(alerts: Alert[]): Alert[] {
  const now = Date.now();

  return alerts.map((alert) => {
    if (alert.status !== "active") {
      return alert;
    }

    const ageHours = (now - new Date(alert.createdAt).getTime()) / 3600000;

    if (ageHours >= 12 && alert.severity !== "information") {
      return {
        ...alert,
        status: "escalated" as const,
        severity: alert.severity === "critical" ? "critical" : "high",
        escalatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return alert;
  });
}

export function buildAlertCounts(active: Alert[], resolved: Alert[]): AlertCounts {
  const all = [...active, ...resolved];

  return {
    total: all.length,
    critical: all.filter((alert) => alert.severity === "critical").length,
    high: all.filter((alert) => alert.severity === "high").length,
    medium: all.filter((alert) => alert.severity === "medium").length,
    low: all.filter((alert) => alert.severity === "low").length,
    information: all.filter((alert) => alert.severity === "information").length,
    active: active.length,
    resolved: resolved.length,
    escalated: active.filter((alert) => alert.status === "escalated").length,
  };
}

export function buildAlertBundle(
  active: Alert[],
  resolved: Alert[],
  generatedAt: string,
): AlertBundle {
  const rankedActive = rankAlerts(active);
  const critical = rankedActive.filter(
    (alert) => alert.severity === "critical" || alert.status === "escalated",
  );
  const recent = rankedActive.slice(0, 8);

  return {
    generatedAt,
    active: rankedActive,
    critical,
    recent,
    resolved: rankAlerts(resolved),
    groups: groupRelatedAlerts(rankedActive),
    counts: buildAlertCounts(rankedActive, resolved),
  };
}
