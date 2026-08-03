import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
import type {
  EventLineageProcessingStatus,
  EventLineageRecord,
} from "@/types/finance-ledger";

/**
 * In-memory Event Lineage repository (Mission P-009.7B).
 * Metadata persistence only — no IIL processing or business rules.
 */
export class InMemoryEventLineageRepository implements EventLineageRepository {
  constructor(private readonly backing: FinanceStoreBacking) {}

  record(lineage: EventLineageRecord): EventLineageRecord {
    const stored: EventLineageRecord = {
      ...lineage,
      replayCount: lineage.replayCount ?? 0,
      processingStatus: lineage.processingStatus ?? "pending",
    };
    this.backing.eventLineage.set(stored.id, stored);
    return stored;
  }

  getByEventId(organizationId: string, eventId: string): EventLineageRecord | null {
    for (const record of this.backing.eventLineage.values()) {
      if (record.organizationId !== organizationId) {
        continue;
      }

      if (
        record.id === eventId ||
        record.businessEventId === eventId ||
        record.financialEventId === eventId
      ) {
        return record;
      }
    }

    return null;
  }

  getByCorrelationId(
    organizationId: string,
    correlationId: string,
  ): readonly EventLineageRecord[] {
    return [...this.backing.eventLineage.values()].filter(
      (record) =>
        record.organizationId === organizationId && record.correlationId === correlationId,
    );
  }

  findByCorrelationId(
    organizationId: string,
    correlationId: string,
  ): readonly EventLineageRecord[] {
    return this.getByCorrelationId(organizationId, correlationId);
  }

  exists(organizationId: string, lineageId: string): boolean {
    const record = this.backing.eventLineage.get(lineageId);
    return record?.organizationId === organizationId;
  }

  listByOrganization(organizationId: string): readonly EventLineageRecord[] {
    return [...this.backing.eventLineage.values()].filter(
      (record) => record.organizationId === organizationId,
    );
  }

  incrementReplayCount(organizationId: string, lineageId: string): EventLineageRecord | null {
    const existing = this.backing.eventLineage.get(lineageId);
    if (!existing || existing.organizationId !== organizationId) {
      return null;
    }

    const updated: EventLineageRecord = {
      ...existing,
      replayCount: (existing.replayCount ?? 0) + 1,
    };
    this.backing.eventLineage.set(lineageId, updated);
    return updated;
  }

  updateProcessingStatus(
    organizationId: string,
    lineageId: string,
    status: EventLineageProcessingStatus,
  ): EventLineageRecord | null {
    const existing = this.backing.eventLineage.get(lineageId);
    if (!existing || existing.organizationId !== organizationId) {
      return null;
    }

    const updated: EventLineageRecord = {
      ...existing,
      processingStatus: status,
    };
    this.backing.eventLineage.set(lineageId, updated);
    return updated;
  }
}
