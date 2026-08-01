import { ChartOfAccountsService } from "@/lib/finance/chart-of-accounts/ChartOfAccountsService";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";

/** Public Chart of Accounts facade (Mission P-009.2). */
export class FinanceChartOfAccountsFacade {
  readonly accounts: ChartOfAccountsService;

  constructor(repository: ChartOfAccountsRepository) {
    this.accounts = new ChartOfAccountsService(repository);
  }
}

export { ChartOfAccountsService };
