import type {
  ChartOfAccountListQuery,
  ChartOfAccountRecord,
} from "@/types/finance-chart-of-accounts";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

function matchesQuery(record: ChartOfAccountRecord, query: ChartOfAccountListQuery): boolean {
  if (query.accountType && record.accountType !== query.accountType) return false;
  if (query.category && record.category !== query.category) return false;
  if (query.status && record.status !== query.status) return false;
  if (query.postingAllowed !== undefined && record.postingAllowed !== query.postingAllowed) return false;

  if (query.parentAccountId === null && record.parentAccountId) return false;
  if (query.parentAccountId && query.parentAccountId !== record.parentAccountId) return false;

  if (query.search) {
    const term = query.search.toLowerCase();
    const haystack = `${record.code} ${record.name} ${record.description ?? ""}`.toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  return true;
}

/** In-memory Chart of Accounts repository (Mission P-009.2). */
export class InMemoryChartOfAccountsRepository implements ChartOfAccountsRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  findById(organizationId: string, accountId: string): ChartOfAccountRecord | null {
    const record = this.backing.accounts.get(accountId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findByCode(organizationId: string, code: string): ChartOfAccountRecord | null {
    for (const record of this.backing.accounts.values()) {
      if (record.organizationId === organizationId && record.code === code.trim()) {
        return record;
      }
    }
    return null;
  }

  list(organizationId: string, query: ChartOfAccountListQuery = {}): readonly ChartOfAccountRecord[] {
    return [...this.backing.accounts.values()]
      .filter((record) => record.organizationId === organizationId)
      .filter((record) => matchesQuery(record, query))
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  create(record: ChartOfAccountRecord): ChartOfAccountRecord {
    this.backing.accounts.set(record.id, record);
    return record;
  }

  update(record: ChartOfAccountRecord): ChartOfAccountRecord {
    this.backing.accounts.set(record.id, record);
    return record;
  }

  listChildren(organizationId: string, parentAccountId: string): readonly ChartOfAccountRecord[] {
    return this.list(organizationId, { parentAccountId });
  }

  /** @deprecated Use findById — retained for P-009.1 interface compatibility. */
  findAccount(organizationId: string, accountId: string): ChartOfAccountRecord | null {
    return this.findById(organizationId, accountId);
  }

  /** @deprecated Use list — retained for P-009.1 interface compatibility. */
  listAccounts(organizationId: string): readonly ChartOfAccountRecord[] {
    return this.list(organizationId);
  }
}

export const defaultChartOfAccountsRepository = new InMemoryChartOfAccountsRepository(
  getDefaultFinanceBacking(),
);
