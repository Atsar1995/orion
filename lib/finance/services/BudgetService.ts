import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Budget service contract — implementation P-009.5+. */
export type BudgetService = {
  listBudgetVersions(context: ServiceContext): ServiceResult<readonly { id: string; name: string }[]>;
};

export class StubBudgetService implements BudgetService {
  listBudgetVersions(_context: ServiceContext): ServiceResult<readonly { id: string; name: string }[]> {
    return {
      success: false,
      error: { code: ServiceErrorCode.NotImplemented, message: "Budget not implemented until P-009.5" },
    };
  }
}

export const stubBudgetService = new StubBudgetService();
