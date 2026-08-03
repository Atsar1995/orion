import type { ChartOfAccountRecord } from "@/types/finance-chart-of-accounts";
import type {
  EventLineageRecord,
  JournalEntryRecord,
  JournalLineRecord,
} from "@/types/finance-ledger";
import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerEntryRecord,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type {
  BudgetActualRecord,
  FinancialTrendRecord,
} from "@/types/finance-executive-intelligence";
import type {
  DeadLetterRecord,
  FinancialEventRecord,
  PipelineAuditRecord,
} from "@/types/finance-event-pipeline";
import type {
  FiscalCalendarRecord,
  FiscalPeriodRecord,
  FiscalYearRecord,
} from "@/types/finance-period";

/** Business event intake record stored in platform backing (Mission P-009.5 Wave A). */
export type FinanceBusinessEventIntakeRecord = {
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

/**
 * Shared Finance persistence collections — single backing for all Wave A repositories.
 * Mirrors {@link HcmStoreBacking} pattern (Mission P-009.5 · ADR-007).
 */
export type FinanceStoreBacking = {
  readonly accounts: Map<string, ChartOfAccountRecord>;
  readonly ledgerBalances: Map<string, LedgerBalanceRecord>;
  readonly ledgerPostings: Map<string, LedgerPostingRecord[]>;
  readonly ledgerEntries: Map<string, LedgerEntryRecord[]>;
  readonly consumedEvents: Map<string, ConsumedFinancialEventRecord[]>;
  readonly reconciledPeriods: Set<string>;
  readonly fiscalCalendar: { value: FiscalCalendarRecord | null };
  readonly fiscalYears: Map<string, FiscalYearRecord>;
  readonly fiscalPeriods: Map<string, FiscalPeriodRecord>;
  readonly idempotencyKeys: Map<string, Record<string, string>>;
  readonly financialEvents: Map<string, FinancialEventRecord>;
  readonly deadLetters: Map<string, DeadLetterRecord>;
  readonly pipelineAudit: PipelineAuditRecord[];
  readonly businessEventIntakes: Map<string, FinanceBusinessEventIntakeRecord>;
  readonly financialTrends: FinancialTrendRecord[];
  readonly budgetActuals: BudgetActualRecord[];
  readonly journals: Map<string, JournalEntryRecord>;
  readonly journalLines: Map<string, JournalLineRecord[]>;
  readonly eventLineage: Map<string, EventLineageRecord>;
};
