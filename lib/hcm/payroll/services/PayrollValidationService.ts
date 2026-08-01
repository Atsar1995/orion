import type { ServiceContext } from "@/types/services";
import type { PayrollRunRecord } from "@/types/hcm-payroll";
import type { EmploymentRepository } from "@/lib/hcm/employment/repositories/EmploymentRepository";
import type {
  PayrollRepository,
  PayrollRunRepository,
} from "@/lib/hcm/payroll/repositories/PayrollRepository";

export type PayrollValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly severity: "error" | "warning";
};

export class PayrollValidationService {
  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly runRepository: PayrollRunRepository,
    private readonly employmentRepository: EmploymentRepository,
  ) {}

  validateRun(runId: string, context: ServiceContext): readonly PayrollValidationIssue[] {
    const organizationId = context.organizationId;
    const run = this.runRepository.findById(organizationId, runId);
    if (!run) throw new Error("PAYROLL_RUN_NOT_FOUND");

    const issues: PayrollValidationIssue[] = [];
    const entries = this.runRepository.listEntries(organizationId, runId);
    const activeEmployments = this.employmentRepository.search(organizationId, { status: "active" });

    if (entries.length === 0 && run.status === "calculated") {
      issues.push({
        code: "NO_PAYROLL_ENTRIES",
        message: "Payroll run has no calculated entries",
        severity: "error",
      });
    }

    const entryEmployeeIds = new Set(entries.map((e) => e.employeeId));
    for (const employment of activeEmployments) {
      if (!entryEmployeeIds.has(employment.employeeId)) {
        issues.push({
          code: "MISSING_EMPLOYEE_ENTRY",
          message: `No payroll entry for employee ${employment.employeeId}`,
          severity: "warning",
        });
      }
    }

    for (const entry of entries) {
      if (entry.netPay.value < 0) {
        issues.push({
          code: "NEGATIVE_NET_PAY",
          message: `Negative net pay for employee ${entry.employeeId}`,
          severity: "error",
        });
      }
    }

    const pendingAdjustments = this.payrollRepository
      .listAdjustments(organizationId, runId)
      .filter((a) => a.status === "pending");
    if (pendingAdjustments.length > 0) {
      issues.push({
        code: "PENDING_ADJUSTMENTS",
        message: `${pendingAdjustments.length} pending adjustment(s) not applied`,
        severity: "warning",
      });
    }

    return issues;
  }

  assertReadyForApproval(run: PayrollRunRecord, context: ServiceContext): void {
    const issues = this.validateRun(run.id, context);
    const errors = issues.filter((i) => i.severity === "error");
    if (errors.length > 0) {
      throw new Error(errors[0]!.code);
    }
  }
}
