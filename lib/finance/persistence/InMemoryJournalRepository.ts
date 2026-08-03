import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
import type {
  JournalDraftInput,
  JournalEntryRecord,
  JournalLineRecord,
} from "@/types/finance-ledger";

function journalLinesKey(organizationId: string, journalId: string): string {
  return `${organizationId}::${journalId}`;
}

/**
 * In-memory Journal repository (Mission P-009.7B).
 * Organization-scoped persistence — no posting, balancing, or validation.
 */
export class InMemoryJournalRepository implements JournalRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  getById(organizationId: string, journalId: string): JournalEntryRecord | null {
    return this.findById(organizationId, journalId);
  }

  findById(organizationId: string, journalId: string): JournalEntryRecord | null {
    const record = this.backing.journals.get(journalId);
    if (!record || record.organizationId !== organizationId) {
      return null;
    }

    return record;
  }

  exists(organizationId: string, journalId: string): boolean {
    return this.getById(organizationId, journalId) !== null;
  }

  listByOrganization(organizationId: string): readonly JournalEntryRecord[] {
    return [...this.backing.journals.values()].filter(
      (record) => record.organizationId === organizationId,
    );
  }

  findByCorrelationId(
    organizationId: string,
    correlationId: string,
  ): readonly JournalEntryRecord[] {
    return this.listByOrganization(organizationId).filter(
      (record) => record.correlationId === correlationId,
    );
  }

  listByPeriod(organizationId: string, periodId: string): readonly JournalEntryRecord[] {
    return this.listByOrganization(organizationId).filter((record) => record.periodId === periodId);
  }

  listLines(organizationId: string, journalId: string): readonly JournalLineRecord[] {
    const journal = this.getById(organizationId, journalId);
    if (!journal) {
      return [];
    }

    return this.backing.journalLines.get(journalLinesKey(organizationId, journalId)) ?? [];
  }

  createDraft(input: JournalDraftInput): JournalEntryRecord {
    const entry: JournalEntryRecord = {
      ...input.entry,
      status: "draft",
    };

    this.persistDraft(entry, input.lines);
    return entry;
  }

  save(input: JournalDraftInput): JournalEntryRecord {
    const existing = this.getById(input.entry.organizationId, input.entry.id);
    const entry: JournalEntryRecord = {
      ...input.entry,
      status: existing?.status ?? input.entry.status ?? "draft",
    };

    this.persistDraft(entry, input.lines);
    return entry;
  }

  updateStatus(
    organizationId: string,
    journalId: string,
    status: JournalEntryRecord["status"],
  ): JournalEntryRecord | null {
    const existing = this.getById(organizationId, journalId);
    if (!existing) {
      return null;
    }

    const updated: JournalEntryRecord = {
      ...existing,
      status,
    };
    this.backing.journals.set(journalId, updated);
    return updated;
  }

  deleteDraft(organizationId: string, journalId: string): boolean {
    const existing = this.getById(organizationId, journalId);
    if (!existing || existing.status !== "draft") {
      return false;
    }

    this.backing.journals.delete(journalId);
    this.backing.journalLines.delete(journalLinesKey(organizationId, journalId));
    return true;
  }

  private persistDraft(entry: JournalEntryRecord, lines: readonly JournalLineRecord[]): void {
    this.backing.journals.set(entry.id, entry);
    this.backing.journalLines.set(journalLinesKey(entry.organizationId, entry.id), [...lines]);
  }
}
