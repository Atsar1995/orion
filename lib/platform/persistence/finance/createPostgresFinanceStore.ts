/**
 * Creates PostgreSQL-backed Finance store for journal, lineage, and master data (P-009.6 · P-009.13).
 */

import type { ChartOfAccountRecord } from "@/types/finance-chart-of-accounts";
import type { FiscalCalendarRecord, FiscalPeriodRecord, FiscalYearRecord } from "@/types/finance-period";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { createFinanceStore } from "@/lib/finance/persistence/createFinanceStore";
import type { JournalEntryRecord, JournalLineRecord } from "@/types/finance-ledger";
import type { EventLineageRecord } from "@/types/finance-ledger";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  FINANCE_COLLECTION_ACCOUNT,
  FINANCE_COLLECTION_EVENT_LINEAGE,
  FINANCE_COLLECTION_FISCAL_CALENDAR,
  FINANCE_COLLECTION_FISCAL_PERIOD,
  FINANCE_COLLECTION_FISCAL_YEAR,
  FINANCE_COLLECTION_IDEMPOTENCY_KEY,
  FINANCE_COLLECTION_JOURNAL,
  FINANCE_COLLECTION_JOURNAL_LINE,
  FinanceEntityPersister,
  FinancePersistingFiscalCalendar,
  FinancePersistingIdempotencyMap,
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
    accounts: new FinancePersistingMap<string, ChartOfAccountRecord>(
      FINANCE_COLLECTION_ACCOUNT,
      persister,
    ),
    fiscalCalendar: new FinancePersistingFiscalCalendar(persister),
    fiscalYears: new FinancePersistingMap<string, FiscalYearRecord>(
      FINANCE_COLLECTION_FISCAL_YEAR,
      persister,
    ),
    fiscalPeriods: new FinancePersistingMap<string, FiscalPeriodRecord>(
      FINANCE_COLLECTION_FISCAL_PERIOD,
      persister,
    ),
    idempotencyKeys: new FinancePersistingIdempotencyMap(persister),
    journals: new FinancePersistingMap<string, JournalEntryRecord>(
      FINANCE_COLLECTION_JOURNAL,
      persister,
    ),
    journalLines: new FinancePersistingJournalLinesMap(persister),
    eventLineage: new FinancePersistingLineageMap<string, EventLineageRecord>(persister),
  };
}

function hydrateMap<K, V>(target: Map<K, V>, source: Map<string, V>): void {
  for (const [key, value] of source.entries()) {
    Map.prototype.set.call(target, key as K, value);
  }
}

/** Hydrates and returns a Finance store backed by PostgreSQL entity tables. */
export async function createPostgresFinanceStore(
  connection: DatabaseConnection,
): Promise<{ store: FinanceStoreBacking; persister: FinanceEntityPersister }> {
  const persister = new FinanceEntityPersister(connection);
  const store = createPersistingFinanceStore(persister);

  const accounts = await persister.loadCollection<ChartOfAccountRecord>(FINANCE_COLLECTION_ACCOUNT);
  hydrateMap(store.accounts, accounts);

  const fiscalYears = await persister.loadCollection<FiscalYearRecord>(FINANCE_COLLECTION_FISCAL_YEAR);
  hydrateMap(store.fiscalYears, fiscalYears);

  const fiscalPeriods = await persister.loadCollection<FiscalPeriodRecord>(
    FINANCE_COLLECTION_FISCAL_PERIOD,
  );
  hydrateMap(store.fiscalPeriods, fiscalPeriods);

  const calendars = await persister.loadCollection<FiscalCalendarRecord>(
    FINANCE_COLLECTION_FISCAL_CALENDAR,
  );
  if (calendars.size > 0) {
    const calendar = calendars.values().next().value ?? null;
    if (calendar && store.fiscalCalendar instanceof FinancePersistingFiscalCalendar) {
      store.fiscalCalendar.hydrate(calendar);
    } else {
      store.fiscalCalendar.value = calendar;
    }
  }

  const idempotencyKeys = await persister.loadCollection<Record<string, string>>(
    FINANCE_COLLECTION_IDEMPOTENCY_KEY,
  );
  hydrateMap(store.idempotencyKeys, idempotencyKeys);

  const journals = await persister.loadCollection<JournalEntryRecord>(FINANCE_COLLECTION_JOURNAL);
  hydrateMap(store.journals, journals);

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

  hydrateMap(store.journalLines, groupedLines);

  const lineage = await persister.loadCollection<EventLineageRecord>(FINANCE_COLLECTION_EVENT_LINEAGE);
  hydrateMap(store.eventLineage, lineage);

  return { store, persister };
}

export async function flushPostgresFinanceStore(persister: FinanceEntityPersister): Promise<void> {
  await persister.flushPending();
}
