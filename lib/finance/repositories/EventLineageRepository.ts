import type {
  EventLineageProcessingStatus,
  EventLineageRecord,
} from "@/types/finance-ledger";

/** Event lineage tracking contract — P-009.7B metadata persistence only. */
export type EventLineageRepository = {
  record(lineage: EventLineageRecord): EventLineageRecord;
  getByEventId(organizationId: string, eventId: string): EventLineageRecord | null;
  getByCorrelationId(organizationId: string, correlationId: string): readonly EventLineageRecord[];
  findByCorrelationId(organizationId: string, correlationId: string): readonly EventLineageRecord[];
  exists(organizationId: string, lineageId: string): boolean;
  listByOrganization(organizationId: string): readonly EventLineageRecord[];
  incrementReplayCount(organizationId: string, lineageId: string): EventLineageRecord | null;
  updateProcessingStatus(
    organizationId: string,
    lineageId: string,
    status: EventLineageProcessingStatus,
  ): EventLineageRecord | null;
};
