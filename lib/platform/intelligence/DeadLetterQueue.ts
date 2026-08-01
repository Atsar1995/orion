import { randomUUID } from "crypto";
import type { DeadLetterRecord, IntelligenceEvent } from "@/types/intelligence-integration";

/** Dead-letter queue for failed intelligence event delivery (Mission P-006). */
export class DeadLetterQueue {
  private readonly records: DeadLetterRecord[] = [];
  private readonly maxRecords: number;

  constructor(maxRecords = 500) {
    this.maxRecords = maxRecords;
  }

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

    this.records.unshift(record);

    if (this.records.length > this.maxRecords) {
      this.records.length = this.maxRecords;
    }

    return record;
  }

  list(organizationId?: string, limit = 50): readonly DeadLetterRecord[] {
    const filtered = organizationId
      ? this.records.filter((record) => record.event.organizationId === organizationId)
      : this.records;

    return filtered.slice(0, limit);
  }

  remove(id: string): DeadLetterRecord | null {
    const index = this.records.findIndex((record) => record.id === id);

    if (index < 0) {
      return null;
    }

    const [removed] = this.records.splice(index, 1);
    return removed ?? null;
  }

  clear(): void {
    this.records.length = 0;
  }
}
