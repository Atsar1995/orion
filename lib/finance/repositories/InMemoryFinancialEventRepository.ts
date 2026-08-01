import type {
  DeadLetterRecord,
  FinancialEventRecord,
  PipelineAuditRecord,
  PipelineInquiryQuery,
} from "@/types/finance-event-pipeline";
import type {
  BusinessEventIntakeRepository,
  DeadLetterRepository,
  FinancialEventRepository,
  PipelineAuditRepository,
} from "@/lib/finance/repositories/FinancialEventRepository";

type IntakeRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly businessEventType: string;
  readonly sourceService: string;
  readonly sourceEntityType: string;
  readonly sourceEntityId: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly receivedAt: string;
  readonly status: "received" | "processing" | "completed" | "failed";
};

/** In-memory financial event repository (Mission P-009.6). */
export class InMemoryFinancialEventRepository implements FinancialEventRepository {
  readonly domain = "finance" as const;
  private readonly events = new Map<string, FinancialEventRecord>();

  create(event: FinancialEventRecord): FinancialEventRecord {
    this.events.set(event.id, event);
    return event;
  }

  update(event: FinancialEventRecord): FinancialEventRecord {
    this.events.set(event.id, event);
    return event;
  }

  findById(organizationId: string, eventId: string): FinancialEventRecord | null {
    const record = this.events.get(eventId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findByIdempotencyKey(organizationId: string, idempotencyKey: string): FinancialEventRecord | null {
    return (
      [...this.events.values()].find(
        (event) => event.organizationId === organizationId && event.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  findByBusinessEventId(organizationId: string, businessEventId: string): FinancialEventRecord | null {
    return (
      [...this.events.values()].find(
        (event) => event.organizationId === organizationId && event.businessEventId === businessEventId,
      ) ?? null
    );
  }

  list(organizationId: string, query?: PipelineInquiryQuery): readonly FinancialEventRecord[] {
    let results = [...this.events.values()].filter((event) => event.organizationId === organizationId);

    if (query?.status) {
      results = results.filter((event) => event.status === query.status);
    }
    if (query?.classification) {
      results = results.filter((event) => event.classification === query.classification);
    }
    if (query?.businessEventType) {
      results = results.filter((event) => event.businessEventType === query.businessEventType);
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export class InMemoryDeadLetterRepository implements DeadLetterRepository {
  readonly domain = "finance" as const;
  private readonly records = new Map<string, DeadLetterRecord>();

  create(record: DeadLetterRecord): DeadLetterRecord {
    this.records.set(record.id, record);
    return record;
  }

  list(organizationId: string): readonly DeadLetterRecord[] {
    return [...this.records.values()]
      .filter((record) => record.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findByBusinessEventId(organizationId: string, businessEventId: string): DeadLetterRecord | null {
    return (
      [...this.records.values()].find(
        (record) => record.organizationId === organizationId && record.businessEventId === businessEventId,
      ) ?? null
    );
  }
}

export class InMemoryPipelineAuditRepository implements PipelineAuditRepository {
  readonly domain = "finance" as const;
  private readonly entries: PipelineAuditRecord[] = [];

  record(entry: PipelineAuditRecord): PipelineAuditRecord {
    this.entries.push(entry);
    return entry;
  }

  listByEvent(organizationId: string, eventId: string): readonly PipelineAuditRecord[] {
    return this.entries.filter(
      (entry) => entry.organizationId === organizationId && entry.eventId === eventId,
    );
  }

  listByBusinessEvent(organizationId: string, businessEventId: string): readonly PipelineAuditRecord[] {
    return this.entries.filter(
      (entry) => entry.organizationId === organizationId && entry.businessEventId === businessEventId,
    );
  }

  list(organizationId: string): readonly PipelineAuditRecord[] {
    return this.entries.filter((entry) => entry.organizationId === organizationId);
  }
}

export class InMemoryBusinessEventIntakeRepository implements BusinessEventIntakeRepository {
  readonly domain = "finance" as const;
  private readonly intakes = new Map<string, IntakeRecord>();

  create(record: IntakeRecord): { readonly id: string } {
    this.intakes.set(record.id, record);
    return { id: record.id };
  }

  findById(organizationId: string, id: string): { readonly id: string; readonly status: string } | null {
    const record = this.intakes.get(id);
    if (!record || record.organizationId !== organizationId) return null;
    return { id: record.id, status: record.status };
  }

  findByIdempotencyKey(organizationId: string, idempotencyKey: string): { readonly id: string } | null {
    const record = [...this.intakes.values()].find(
      (intake) => intake.organizationId === organizationId && intake.idempotencyKey === idempotencyKey,
    );
    return record ? { id: record.id } : null;
  }
}

export const defaultFinancialEventRepository = new InMemoryFinancialEventRepository();
export const defaultDeadLetterRepository = new InMemoryDeadLetterRepository();
export const defaultPipelineAuditRepository = new InMemoryPipelineAuditRepository();
export const defaultBusinessEventIntakeRepository = new InMemoryBusinessEventIntakeRepository();
