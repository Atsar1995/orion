import type { CreateExpenseInput, ExpenseRecord } from "@/types/hcm-expense";

export interface ExpenseRepository {
  readonly domain: "hcm";

  create(input: CreateExpenseInput, organizationId: string, createdBy: string): ExpenseRecord;
  findById(organizationId: string, expenseId: string): ExpenseRecord | null;
  save(expense: ExpenseRecord): ExpenseRecord;
}
