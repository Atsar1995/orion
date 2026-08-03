import { randomUUID } from "crypto";
import type { DeadLetterRecord, IntelligenceEvent } from "@/types/intelligence-integration";

/** Durable dead-letter queue for failed IIL deliveries (P-009.16). */
export class IILDeadLetterQueue {
  private readonly records = new Map<string, DeadLetterRecord>();

  enqueue(
    event: IntelligenceEvent,
    failureReason: string,
    attempts: number,
    lastError?: string,
  ): DeadLetterRecord {
    const record: DeadLetterRecord = {
      id: randomUUID(),
      event,
      failureReason,
      attempts,
      failedAt: new Date().toISOString(),
      lastError,
    };

    this.records.set(record.id, record);
    return record;
  }

  list(organizationId?: string, limit = 50): readonly DeadLetterRecord[] {
    const filtered = organizationId
      ? [...this.records.values()].filter((record) => record.event.organizationId === organizationId)
      : [...this.records.values()];

    return filtered
      .sort((a, b) => b.failedAt.localeCompare(a.failedAt))
      .slice(0, limit);
  }

  remove(id: string): DeadLetterRecord | null {
    const record = this.records.get(id) ?? null;
    if (record) {
      this.records.delete(id);
    }
    return record;
  }

  count(organizationId?: string): number {
    return this.list(organizationId, Number.MAX_SAFE_INTEGER).length;
  }

  clear(): void {
    this.records.clear();
  }

  hydrate(records: readonly DeadLetterRecord[]): void {
    this.records.clear();
    for (const record of records) {
      this.records.set(record.id, record);
    }
  }

  exportAll(): readonly DeadLetterRecord[] {
    return [...this.records.values()];
  }
}
