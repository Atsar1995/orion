import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Reconciliation service contract — implementation P-009.4+. */
export type ReconciliationService = {
  getReconciliationStatus(
    context: ServiceContext,
    bankAccountId: string,
  ): ServiceResult<{ reconciled: boolean }>;
};

export class StubReconciliationService implements ReconciliationService {
  getReconciliationStatus(
    _context: ServiceContext,
    _bankAccountId: string,
  ): ServiceResult<{ reconciled: boolean }> {
    return {
      success: false,
      error: {
        code: ServiceErrorCode.NotImplemented,
        message: "Reconciliation not implemented until P-009.4",
      },
    };
  }
}

export const stubReconciliationService = new StubReconciliationService();
