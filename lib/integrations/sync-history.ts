import type { IntegrationLogEntry, IntegrationSyncEvent } from "@/lib/integrations/types";

const MAX_SYNC_EVENTS = 100;
const MAX_LOG_ENTRIES = 100;

/** In-memory sync and log history for the Integration Center admin surface. */
class IntegrationHistoryStore {
  private syncEvents: IntegrationSyncEvent[] = [];
  private logs: IntegrationLogEntry[] = [];

  recordSync(event: Omit<IntegrationSyncEvent, "id" | "timestamp">): IntegrationSyncEvent {
    const entry: IntegrationSyncEvent = {
      ...event,
      id: `${event.providerId}-${Date.now()}-${this.syncEvents.length}`,
      timestamp: new Date().toISOString(),
    };

    this.syncEvents.unshift(entry);
    this.syncEvents = this.syncEvents.slice(0, MAX_SYNC_EVENTS);

    this.recordLog({
      providerId: event.providerId,
      level: event.success ? "info" : "error",
      message: `${event.action}: ${event.message}`,
    });

    return entry;
  }

  recordLog(event: Omit<IntegrationLogEntry, "id" | "timestamp">): IntegrationLogEntry {
    const entry: IntegrationLogEntry = {
      ...event,
      id: `${event.providerId}-log-${Date.now()}-${this.logs.length}`,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(entry);
    this.logs = this.logs.slice(0, MAX_LOG_ENTRIES);
    return entry;
  }

  getSyncHistory(providerId?: string, limit = 20): IntegrationSyncEvent[] {
    const events = providerId
      ? this.syncEvents.filter((event) => event.providerId === providerId)
      : this.syncEvents;

    return events.slice(0, limit);
  }

  getLogs(providerId?: string, limit = 20): IntegrationLogEntry[] {
    const entries = providerId
      ? this.logs.filter((entry) => entry.providerId === providerId)
      : this.logs;

    return entries.slice(0, limit);
  }

  countFailedConnections(): number {
    return this.syncEvents.filter(
      (event) =>
        !event.success && (event.action === "connect" || event.action === "reconnect"),
    ).length;
  }
}

export const integrationHistoryStore = new IntegrationHistoryStore();
