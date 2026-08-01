import type {
  DeadLetterRecord,
  FinancialEventRecord,
  PipelineAuditRecord,
  PipelineBusinessEventType,
  PipelineInquiryQuery,
} from "@/types/finance-event-pipeline";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Financial event repository contract (Mission P-009.6). */
export type FinancialEventRepository = FinanceRepository & {
  create(event: FinancialEventRecord): FinancialEventRecord;
  update(event: FinancialEventRecord): FinancialEventRecord;
  findById(organizationId: string, eventId: string): FinancialEventRecord | null;
  findByIdempotencyKey(organizationId: string, idempotencyKey: string): FinancialEventRecord | null;
  findByBusinessEventId(organizationId: string, businessEventId: string): FinancialEventRecord | null;
  list(organizationId: string, query?: PipelineInquiryQuery): readonly FinancialEventRecord[];
};

/** Dead letter queue repository contract (Mission P-009.6). */
export type DeadLetterRepository = FinanceRepository & {
  create(record: DeadLetterRecord): DeadLetterRecord;
  list(organizationId: string): readonly DeadLetterRecord[];
  findByBusinessEventId(organizationId: string, businessEventId: string): DeadLetterRecord | null;
};

/** Pipeline audit trail repository contract (Mission P-009.6). */
export type PipelineAuditRepository = FinanceRepository & {
  record(entry: PipelineAuditRecord): PipelineAuditRecord;
  listByEvent(organizationId: string, eventId: string): readonly PipelineAuditRecord[];
  listByBusinessEvent(organizationId: string, businessEventId: string): readonly PipelineAuditRecord[];
  list(organizationId: string): readonly PipelineAuditRecord[];
};

/** Business event intake store — links inbound events to pipeline. */
export type BusinessEventIntakeRepository = FinanceRepository & {
  create(record: {
    readonly id: string;
    readonly organizationId: string;
    readonly businessEventType: PipelineBusinessEventType;
    readonly sourceService: string;
    readonly sourceEntityType: string;
    readonly sourceEntityId: string;
    readonly correlationId: string;
    readonly idempotencyKey: string;
    readonly receivedAt: string;
    readonly status: "received" | "processing" | "completed" | "failed";
  }): { readonly id: string };
  findById(organizationId: string, id: string): { readonly id: string; readonly status: string } | null;
  findByIdempotencyKey(organizationId: string, idempotencyKey: string): { readonly id: string } | null;
};
