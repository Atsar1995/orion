import type { CurrencyAmount } from "@/types/hcm-payroll";

export type ExpenseStatus = "submitted" | "approved" | "rejected";

export type ExpenseRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly amount: CurrencyAmount;
  readonly costCentreId?: string;
  readonly costPeriodId?: string;
  readonly description?: string;
  readonly status: ExpenseStatus;
  readonly approvalReference?: string;
  readonly submittedAt: string;
  readonly approvedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type CreateExpenseInput = {
  readonly employeeId: string;
  readonly amount: CurrencyAmount;
  readonly costCentreId?: string;
  readonly costPeriodId?: string;
  readonly description?: string;
};

export type ApproveExpenseInput = {
  readonly expenseId: string;
  readonly approvalReference?: string;
};
