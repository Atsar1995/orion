import { ExecutiveFinancialIntelligenceService } from "@/lib/finance/executive-intelligence/ExecutiveFinancialIntelligenceService";
import type { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type { GeneralLedgerService } from "@/lib/finance/general-ledger/GeneralLedgerService";
import type { FinancialIntelligenceRepository } from "@/lib/finance/repositories/FinancialIntelligenceRepository";

/** Public Executive Financial Intelligence facade (Mission P-009.7). */
export class FinanceExecutiveIntelligenceFacade extends ExecutiveFinancialIntelligenceService {
  constructor(
    repository: FinancialIntelligenceRepository,
    generalLedger: GeneralLedgerService,
    fiscalPeriod: FiscalPeriodService,
  ) {
    super(repository, generalLedger, fiscalPeriod);
  }
}

export { ExecutiveFinancialIntelligenceService };
