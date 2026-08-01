import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Tax service contract — implementation P-009.6+. */
export type TaxService = {
  getTaxSummary(context: ServiceContext): ServiceResult<{ liabilityTotal: number }>;
};

export class StubTaxService implements TaxService {
  getTaxSummary(_context: ServiceContext): ServiceResult<{ liabilityTotal: number }> {
    return {
      success: false,
      error: { code: ServiceErrorCode.NotImplemented, message: "Tax not implemented until P-009.6" },
    };
  }
}

export const stubTaxService = new StubTaxService();
