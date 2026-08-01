import { randomUUID } from "crypto";
import type { DecisionEvent, DecisionEventType } from "@/types/decisions";

/** In-memory decision event log for platform integrations (Mission S1B+). */
class DecisionEventStore {
  private readonly events: DecisionEvent[] = [];
  private readonly maxEvents = 500;

  emit(input: Omit<DecisionEvent, "id" | "timestamp">): DecisionEvent {
    const event: DecisionEvent = {
      ...input,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(event);

    if (this.events.length > this.maxEvents) {
      this.events.length = this.maxEvents;
    }

    return event;
  }

  getRecent(limit = 50): readonly DecisionEvent[] {
    return this.events.slice(0, limit);
  }

  getByDecisionId(decisionId: string): readonly DecisionEvent[] {
    return this.events.filter((event) => event.decisionId === decisionId);
  }

  clear(): void {
    this.events.length = 0;
  }
}

export const decisionEventStore = new DecisionEventStore();

export function emitDecisionEvent(
  type: DecisionEventType,
  decisionId: string,
  organizationId: string,
  payload: Record<string, string>,
): DecisionEvent {
  return decisionEventStore.emit({
    type,
    decisionId,
    organizationId,
    payload,
  });
}
