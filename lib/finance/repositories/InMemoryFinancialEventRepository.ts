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
import type { FinanceBusinessEventIntakeRecord } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

/** In-memory financial event repository (Mission P-009.6). */
export class InMemoryFinancialEventRepository implements FinancialEventRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  create(event: FinancialEventRecord): FinancialEventRecord {
    this.backing.financialEvents.set(event.id, event);
    return event;
  }

  update(event: FinancialEventRecord): FinancialEventRecord {
    this.backing.financialEvents.set(event.id, event);
    return event;
  }

  findById(organizationId: string, eventId: string): FinancialEventRecord | null {
    const record = this.backing.financialEvents.get(eventId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findByIdempotencyKey(organizationId: string, idempotencyKey: string): FinancialEventRecord | null {
    return (
      [...this.backing.financialEvents.values()].find(
        (event) => event.organizationId === organizationId && event.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  findByBusinessEventId(organizationId: string, businessEventId: string): FinancialEventRecord | null {
    return (
      [...this.backing.financialEvents.values()].find(
        (event) => event.organizationId === organizationId && event.businessEventId === businessEventId,
      ) ?? null
    );
  }

  list(organizationId: string, query?: PipelineInquiryQuery): readonly FinancialEventRecord[] {
    let results = [...this.backing.financialEvents.values()].filter(
      (event) => event.organizationId === organizationId,
    );

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

  constructor(private readonly backing: FinanceStoreBacking) {}

  create(record: DeadLetterRecord): DeadLetterRecord {
    this.backing.deadLetters.set(record.id, record);
    return record;
  }

  list(organizationId: string): readonly DeadLetterRecord[] {
    return [...this.backing.deadLetters.values()]
      .filter((record) => record.organizationId === organizationId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findByBusinessEventId(organizationId: string, businessEventId: string): DeadLetterRecord | null {
    return (
      [...this.backing.deadLetters.values()].find(
        (record) => record.organizationId === organizationId && record.businessEventId === businessEventId,
      ) ?? null
    );
  }
}

export class InMemoryPipelineAuditRepository implements PipelineAuditRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  record(entry: PipelineAuditRecord): PipelineAuditRecord {
    this.backing.pipelineAudit.push(entry);
    return entry;
  }

  listByEvent(organizationId: string, eventId: string): readonly PipelineAuditRecord[] {
    return this.backing.pipelineAudit.filter(
      (entry) => entry.organizationId === organizationId && entry.eventId === eventId,
    );
  }

  listByBusinessEvent(organizationId: string, businessEventId: string): readonly PipelineAuditRecord[] {
    return this.backing.pipelineAudit.filter(
      (entry) => entry.organizationId === organizationId && entry.businessEventId === businessEventId,
    );
  }

  list(organizationId: string): readonly PipelineAuditRecord[] {
    return this.backing.pipelineAudit.filter((entry) => entry.organizationId === organizationId);
  }
}

export class InMemoryBusinessEventIntakeRepository implements BusinessEventIntakeRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  create(record: FinanceBusinessEventIntakeRecord): { readonly id: string } {
    this.backing.businessEventIntakes.set(record.id, record);
    return { id: record.id };
  }

  findById(organizationId: string, id: string): { readonly id: string; readonly status: string } | null {
    const record = this.backing.businessEventIntakes.get(id);
    if (!record || record.organizationId !== organizationId) return null;
    return { id: record.id, status: record.status };
  }

  findByIdempotencyKey(organizationId: string, idempotencyKey: string): { readonly id: string } | null {
    const record = [...this.backing.businessEventIntakes.values()].find(
      (intake) => intake.organizationId === organizationId && intake.idempotencyKey === idempotencyKey,
    );
    return record ? { id: record.id } : null;
  }
}

const defaultFinanceBacking = getDefaultFinanceBacking();

export const defaultFinancialEventRepository = new InMemoryFinancialEventRepository(defaultFinanceBacking);
export const defaultDeadLetterRepository = new InMemoryDeadLetterRepository(defaultFinanceBacking);
export const defaultPipelineAuditRepository = new InMemoryPipelineAuditRepository(defaultFinanceBacking);
export const defaultBusinessEventIntakeRepository = new InMemoryBusinessEventIntakeRepository(
  defaultFinanceBacking,
);
