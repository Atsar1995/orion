import { GeneralLedgerService } from "@/lib/finance/general-ledger/GeneralLedgerService";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";

/** Public General Ledger facade (Mission P-009.3). */
export class FinanceGeneralLedgerFacade extends GeneralLedgerService {
  constructor(
    ledgerRepository: GeneralLedgerRepository,
    periodRepository: PeriodRepository,
    chartOfAccountsRepository: ChartOfAccountsRepository,
  ) {
    super(ledgerRepository, periodRepository, chartOfAccountsRepository);
  }
}

export { GeneralLedgerService };
