/**
 * Creates PostgreSQL-backed Finance store for journal and lineage repositories (P-009.6 · P-009.7B).
 */

import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { createFinanceStore } from "@/lib/finance/persistence/createFinanceStore";
import type { JournalEntryRecord, JournalLineRecord } from "@/types/finance-ledger";
import type { EventLineageRecord } from "@/types/finance-ledger";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  FINANCE_COLLECTION_EVENT_LINEAGE,
  FINANCE_COLLECTION_JOURNAL,
  FINANCE_COLLECTION_JOURNAL_LINE,
  FinanceEntityPersister,
  FinancePersistingJournalLinesMap,
  FinancePersistingLineageMap,
  FinancePersistingMap,
} from "@/lib/platform/persistence/finance/FinanceEntityPersister";

function journalLinesKey(organizationId: string, journalId: string): string {
  return `${organizationId}::${journalId}`;
}

function createPersistingFinanceStore(persister: FinanceEntityPersister): FinanceStoreBacking {
  const base = createFinanceStore();

  return {
    ...base,
    journals: new FinancePersistingMap<string, JournalEntryRecord>(
      FINANCE_COLLECTION_JOURNAL,
      persister,
    ),
    journalLines: new FinancePersistingJournalLinesMap(persister),
    eventLineage: new FinancePersistingLineageMap<string, EventLineageRecord>(persister),
  };
}

/** Hydrates and returns a Finance store backed by PostgreSQL entity tables. */
export async function createPostgresFinanceStore(
  connection: DatabaseConnection,
): Promise<{ store: FinanceStoreBacking; persister: FinanceEntityPersister }> {
  const persister = new FinanceEntityPersister(connection);
  const store = createPersistingFinanceStore(persister);

  const journals = await persister.loadCollection<JournalEntryRecord>(FINANCE_COLLECTION_JOURNAL);
  for (const [journalId, journal] of journals.entries()) {
    Map.prototype.set.call(store.journals, journalId, journal);
  }

  const lines = await persister.loadCollection<JournalLineRecord>(FINANCE_COLLECTION_JOURNAL_LINE);
  const journalOrgById = new Map<string, string>();
  for (const journal of journals.values()) {
    journalOrgById.set(journal.id, journal.organizationId);
  }

  const groupedLines = new Map<string, JournalLineRecord[]>();
  for (const line of lines.values()) {
    const organizationId = journalOrgById.get(line.journalId);
    if (!organizationId) {
      continue;
    }

    const key = journalLinesKey(organizationId, line.journalId);
    const bucket = groupedLines.get(key) ?? [];
    bucket.push(line);
    groupedLines.set(key, bucket);
  }

  for (const [key, journalLines] of groupedLines.entries()) {
    Map.prototype.set.call(store.journalLines, key, journalLines);
  }

  const lineage = await persister.loadCollection<EventLineageRecord>(FINANCE_COLLECTION_EVENT_LINEAGE);
  for (const [lineageId, record] of lineage.entries()) {
    Map.prototype.set.call(store.eventLineage, lineageId, record);
  }

  return { store, persister };
}

export async function flushPostgresFinanceStore(persister: FinanceEntityPersister): Promise<void> {
  await persister.flushPending();
}
