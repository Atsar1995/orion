import { randomUUID } from "crypto";
import type { CreateExpenseInput, ExpenseRecord } from "@/types/hcm-expense";
import type { ExpenseRepository } from "@/lib/hcm/expense/repositories/ExpenseRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { nowIso } from "@/lib/hcm/common/time";

export class InMemoryExpenseRepository implements ExpenseRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(input: CreateExpenseInput, organizationId: string, createdBy: string): ExpenseRecord {
    const now = nowIso();
    const expense: ExpenseRecord = {
      id: `expense-${randomUUID()}`,
      organizationId,
      employeeId: input.employeeId,
      amount: input.amount,
      costCentreId: input.costCentreId,
      costPeriodId: input.costPeriodId,
      description: input.description,
      status: "submitted",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy,
    };

    this.store.expenses.set(expense.id, expense);
    return expense;
  }

  findById(organizationId: string, expenseId: string): ExpenseRecord | null {
    const record = this.store.expenses.get(expenseId);
    return record?.organizationId === organizationId ? record : null;
  }

  save(expense: ExpenseRecord): ExpenseRecord {
    this.store.expenses.set(expense.id, expense);
    return expense;
  }
}
