import { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";

/** Public Fiscal Period Management facade (Mission P-009.5). */
export class FinanceFiscalPeriodFacade extends FiscalPeriodService {
  constructor(periodRepository: PeriodRepository) {
    super(periodRepository);
  }
}

export { FiscalPeriodService };
