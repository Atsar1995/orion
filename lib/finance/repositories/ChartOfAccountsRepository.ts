import type {
  ChartOfAccountRecord,
  CreateChartOfAccountInput,
  ChartOfAccountListQuery,
  ModifyChartOfAccountInput,
} from "@/types/finance-chart-of-accounts";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Chart of Accounts access contract (Mission P-009.2). */
export type ChartOfAccountsRepository = FinanceRepository & {
  findById(organizationId: string, accountId: string): ChartOfAccountRecord | null;
  findByCode(organizationId: string, code: string): ChartOfAccountRecord | null;
  list(organizationId: string, query?: ChartOfAccountListQuery): readonly ChartOfAccountRecord[];
  create(record: ChartOfAccountRecord): ChartOfAccountRecord;
  update(record: ChartOfAccountRecord): ChartOfAccountRecord;
  listChildren(organizationId: string, parentAccountId: string): readonly ChartOfAccountRecord[];
};
