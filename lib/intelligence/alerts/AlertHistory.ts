import type { Alert, AlertHistoryEntry } from "@/types/alerts";

type StoredAlert = Alert & { recordedAt: string };

/** In-memory alert history store for the current runtime session. */
class AlertHistoryStore {
  private readonly alerts = new Map<string, StoredAlert>();
  private readonly resolved = new Map<string, StoredAlert>();

  constructor() {
    this.seedResolvedAlerts();
  }

  record(alert: Alert): void {
    this.alerts.set(alert.id, { ...alert, recordedAt: alert.createdAt });
  }

  resolve(alertId: string, note?: string): Alert | undefined {
    const alert = this.alerts.get(alertId);

    if (!alert) {
      return undefined;
    }

    const resolved: StoredAlert = {
      ...alert,
      status: "resolved",
      updatedAt: new Date().toISOString(),
      resolution: {
        resolvedAt: new Date().toISOString(),
        resolvedBy: "system",
        note: note ?? "Auto-resolved during evaluation cycle.",
      },
    };

    this.alerts.delete(alertId);
    this.resolved.set(alertId, resolved);
    return resolved;
  }

  escalate(alertId: string): Alert | undefined {
    const alert = this.alerts.get(alertId);

    if (!alert) {
      return undefined;
    }

    const escalated: StoredAlert = {
      ...alert,
      status: "escalated",
      severity: "critical",
      updatedAt: new Date().toISOString(),
      escalatedAt: new Date().toISOString(),
    };

    this.alerts.set(alertId, escalated);
    return escalated;
  }

  getActive(): Alert[] {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.status === "active" || alert.status === "escalated",
    );
  }

  getResolved(limit = 5): Alert[] {
    return Array.from(this.resolved.values())
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit);
  }

  getHistory(): AlertHistoryEntry[] {
    return [...this.alerts.values(), ...this.resolved.values()]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((alert) => ({
        alertId: alert.id,
        status: alert.status,
        severity: alert.severity,
        category: alert.category,
        recordedAt: alert.recordedAt,
      }));
  }

  hasDuplicate(dedupeKey: string): boolean {
    return [...this.alerts.values(), ...this.resolved.values()].some(
      (alert) => alert.trigger.payload.dedupeKey === dedupeKey,
    );
  }

  private seedResolvedAlerts(): void {
    const now = Date.now();
    const seeds: Alert[] = [
      {
        id: "alert-resolved-1",
        title: "POS terminal sync delay",
        message: "Finance POS sync recovered after 12-minute delay.",
        severity: "medium",
        category: "finance",
        source: "event",
        status: "resolved",
        trigger: {
          id: "trigger-resolved-1",
          eventType: "payment.failure",
          source: "event",
          payload: { dedupeKey: "resolved-pos-sync" },
          occurredAt: new Date(now - 86400000).toISOString(),
        },
        resolution: {
          resolvedAt: new Date(now - 82800000).toISOString(),
          resolvedBy: "operations",
          note: "Terminal sync restored automatically.",
        },
        createdAt: new Date(now - 86400000).toISOString(),
        updatedAt: new Date(now - 82800000).toISOString(),
      },
      {
        id: "alert-resolved-2",
        title: "Email campaign bounce rate normalized",
        message: "Marketing bounce rate returned to baseline after list hygiene.",
        severity: "low",
        category: "marketing",
        source: "event",
        status: "resolved",
        trigger: {
          id: "trigger-resolved-2",
          eventType: "marketing.campaign.failure",
          source: "event",
          payload: { dedupeKey: "resolved-bounce-rate" },
          occurredAt: new Date(now - 172800000).toISOString(),
        },
        resolution: {
          resolvedAt: new Date(now - 158400000).toISOString(),
          resolvedBy: "marketing",
          note: "List cleaned and campaign resumed.",
        },
        createdAt: new Date(now - 172800000).toISOString(),
        updatedAt: new Date(now - 158400000).toISOString(),
      },
    ];

    for (const alert of seeds) {
      this.resolved.set(alert.id, { ...alert, recordedAt: alert.createdAt });
    }
  }
}

export const alertHistory = new AlertHistoryStore();
