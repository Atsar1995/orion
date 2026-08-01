import type { JournalEntryRecord, JournalLineRecord } from "@/types/finance-ledger";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Journal access contract — implementation P-009.2+. */
export type JournalRepository = FinanceRepository & {
  findById(organizationId: string, journalId: string): JournalEntryRecord | null;
  findByCorrelationId(organizationId: string, correlationId: string): readonly JournalEntryRecord[];
  listByPeriod(organizationId: string, periodId: string): readonly JournalEntryRecord[];
  listLines(organizationId: string, journalId: string): readonly JournalLineRecord[];
};
