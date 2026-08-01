import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

const NOT_IMPLEMENTED = "Not implemented until P-009.2+";

/** Ledger service contract — implementation P-009.2+. */
export type LedgerService = {
  getTrialBalance(
    context: ServiceContext,
    periodId: string,
  ): ServiceResult<{ debitTotal: number; creditTotal: number }>;
};

export class StubLedgerService implements LedgerService {
  getTrialBalance(
    _context: ServiceContext,
    _periodId: string,
  ): ServiceResult<{ debitTotal: number; creditTotal: number }> {
    return {
      success: false,
      error: { code: ServiceErrorCode.NotImplemented, message: NOT_IMPLEMENTED },
    };
  }
}

export const stubLedgerService = new StubLedgerService();
