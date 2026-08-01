import type { IntelligenceEvent } from "@/types/intelligence-integration";

/** Retains intelligence events for deduplication and replay (Mission P-006). */
export class EventReplayStore {
  private readonly events: IntelligenceEvent[] = [];
  private readonly eventIds = new Set<string>();
  private readonly maxEvents: number;

  constructor(maxEvents = 2000) {
    this.maxEvents = maxEvents;
  }

  append(event: IntelligenceEvent): boolean {
    if (this.eventIds.has(event.eventId)) {
      return false;
    }

    this.eventIds.add(event.eventId);
    this.events.unshift(event);

    if (this.events.length > this.maxEvents) {
      const removed = this.events.pop();
      if (removed) {
        this.eventIds.delete(removed.eventId);
      }
    }

    return true;
  }

  has(eventId: string): boolean {
    return this.eventIds.has(eventId);
  }

  list(organizationId?: string, limit = 100): readonly IntelligenceEvent[] {
    const filtered = organizationId
      ? this.events.filter((event) => event.organizationId === organizationId)
      : this.events;

    return filtered.slice(0, limit);
  }

  getFrom(eventId: string, organizationId?: string): readonly IntelligenceEvent[] {
    const filtered = organizationId
      ? this.events.filter((event) => event.organizationId === organizationId)
      : this.events;

    const index = filtered.findIndex((event) => event.eventId === eventId);

    if (index < 0) {
      return filtered;
    }

    return filtered.slice(index);
  }

  clear(): void {
    this.events.length = 0;
    this.eventIds.clear();
  }
}
