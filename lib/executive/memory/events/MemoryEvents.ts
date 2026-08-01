import { randomUUID } from "crypto";
import type { MemoryEvent, MemoryEventType } from "@/types/executive/memory";

/** In-memory memory event log for platform integrations (Mission P-004). */
class MemoryEventStore {
  private readonly events: MemoryEvent[] = [];
  private readonly maxEvents = 500;

  emit(input: Omit<MemoryEvent, "id" | "timestamp">): MemoryEvent {
    const event: MemoryEvent = {
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

  getRecent(limit = 50): readonly MemoryEvent[] {
    return this.events.slice(0, limit);
  }

  getByMemoryId(memoryId: string): readonly MemoryEvent[] {
    return this.events.filter((event) => event.memoryId === memoryId);
  }

  clear(): void {
    this.events.length = 0;
  }
}

export const memoryEventStore = new MemoryEventStore();

export function emitMemoryEvent(
  type: MemoryEventType,
  memoryId: string,
  organizationId: string,
  payload: Record<string, string>,
): MemoryEvent {
  return memoryEventStore.emit({
    type,
    memoryId,
    organizationId,
    payload,
  });
}
