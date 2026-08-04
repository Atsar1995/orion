import {
  CrmCanonicalEventPublisher,
  defaultCrmCanonicalEventPublisher,
} from "@/lib/crm/events";
import type { CrmAggregateRecord, CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import type { ServiceContext } from "@/types/services";

type CaseRecord = CrmAggregateRecord & {
  readonly status?: string;
  readonly resolution?: string;
};

/** Service case lifecycle — canonical case closure events (Mission P-008.15). */
export class CaseService {
  constructor(
    private readonly backing: CrmStoreBacking,
    private readonly canonicalPublisher: CrmCanonicalEventPublisher = defaultCrmCanonicalEventPublisher,
  ) {}

  /** Registers a case record — test and integration bootstrap only. */
  register(record: CaseRecord): CaseRecord {
    this.backing.cases.set(record.id, record);
    return record;
  }

  close(caseId: string, context: ServiceContext, resolution?: string): CaseRecord {
    const existing = this.backing.cases.get(caseId) as CaseRecord | undefined;
    if (!existing || existing.organizationId !== context.organizationId) {
      throw new Error("CASE_NOT_FOUND");
    }
    if (existing.status === "closed") {
      throw new Error("CASE_ALREADY_CLOSED");
    }

    const updated: CaseRecord = {
      ...existing,
      status: "closed",
      resolution,
      updatedAt: new Date().toISOString(),
    };
    this.backing.cases.set(caseId, updated);

    this.canonicalPublisher.publishCaseClosed(
      {
        caseId,
        correlationId: caseId,
        resolution,
      },
      context,
    );

    return updated;
  }
}
