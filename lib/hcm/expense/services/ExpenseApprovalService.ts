import type { ApproveExpenseInput, ExpenseRecord } from "@/types/hcm-expense";
import type { ServiceContext } from "@/types/services";
import { nowIso } from "@/lib/hcm/common/time";
import { publishExpenseApproved } from "@/lib/hcm/events/HcmCanonicalFinancePublisher";
import type { ExpenseRepository } from "@/lib/hcm/expense/repositories/ExpenseRepository";

/** Approves employee expenses and publishes canonical Finance integration events. */
export class ExpenseApprovalService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  approve(input: ApproveExpenseInput, context: ServiceContext): ExpenseRecord {
    const expense = this.expenseRepository.findById(context.organizationId, input.expenseId);
    if (!expense) throw new Error("EXPENSE_NOT_FOUND");
    if (expense.status !== "submitted") throw new Error("INVALID_EXPENSE_STATUS");

    const now = nowIso();
    const approvalReference = input.approvalReference ?? `appr-${expense.id}`;
    const approved: ExpenseRecord = {
      ...expense,
      status: "approved",
      approvalReference,
      approvedAt: now,
      updatedAt: now,
    };
    const saved = this.expenseRepository.save(approved);

    publishExpenseApproved(
      {
        expenseId: saved.id,
        employeeId: saved.employeeId,
        amount: saved.amount,
        costPeriodId: saved.costPeriodId,
        costCentreId: saved.costCentreId,
        approvalReference,
        correlationId: saved.id,
        includeLegacyShim: true,
      },
      context,
    );

    return saved;
  }
}
