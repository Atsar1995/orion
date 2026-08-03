import type {
  JournalDraftInput,
  JournalEntryRecord,
  JournalLineRecord,
} from "@/types/finance-ledger";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Journal access contract — P-009.7B repository layer (no posting logic). */
export type JournalRepository = FinanceRepository & {
  getById(organizationId: string, journalId: string): JournalEntryRecord | null;
  findById(organizationId: string, journalId: string): JournalEntryRecord | null;
  exists(organizationId: string, journalId: string): boolean;
  listByOrganization(organizationId: string): readonly JournalEntryRecord[];
  findByCorrelationId(organizationId: string, correlationId: string): readonly JournalEntryRecord[];
  listByPeriod(organizationId: string, periodId: string): readonly JournalEntryRecord[];
  listLines(organizationId: string, journalId: string): readonly JournalLineRecord[];
  createDraft(input: JournalDraftInput): JournalEntryRecord;
  save(input: JournalDraftInput): JournalEntryRecord;
  updateStatus(
    organizationId: string,
    journalId: string,
    status: JournalEntryRecord["status"],
  ): JournalEntryRecord | null;
  deleteDraft(organizationId: string, journalId: string): boolean;
};
