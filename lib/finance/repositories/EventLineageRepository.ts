import type { EventLineageRecord } from "@/types/finance-ledger";

/** Event lineage tracking contract — implementation P-009.2+. */
export type EventLineageRepository = {
  record(lineage: EventLineageRecord): EventLineageRecord;
  findByCorrelationId(organizationId: string, correlationId: string): readonly EventLineageRecord[];
};
