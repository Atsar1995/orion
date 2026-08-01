import type { ServiceContext } from "@/types/services";
import type {
  CreatePayrollAdjustmentInput,
  PayrollAdjustmentRecord,
  PayrollCalculationInput,
  PayrollEntryRecord,
  PayrollIntegrationInputs,
  PayrollResultRecord,
  PayrollRunRecord,
} from "@/types/hcm-payroll";
import {
  createPayrollAdjustmentId,
  createPayrollEntryId,
  createPayrollResultId,
} from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { publishHcmPayrollEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { AttendanceRepository } from "@/lib/hcm/time/repositories/TimeRepository";
import type { LeaveRepository } from "@/lib/hcm/time/repositories/TimeRepository";
import type { EmploymentRepository } from "@/lib/hcm/employment/repositories/EmploymentRepository";
import type {
  PayrollComponentRepository,
  PayrollRepository,
  PayrollRunRepository,
} from "@/lib/hcm/payroll/repositories/PayrollRepository";
import { PayrollCalculationEngine } from "@/lib/hcm/payroll/PayrollCalculationEngine";

export class PayrollCalculationService {
  private readonly engine = new PayrollCalculationEngine();

  constructor(
    private readonly payrollRepository: PayrollRepository,
    private readonly runRepository: PayrollRunRepository,
    private readonly componentRepository: PayrollComponentRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly leaveRepository: LeaveRepository,
    private readonly employmentRepository: EmploymentRepository,
  ) {}

  calculate(input: PayrollCalculationInput, context: ServiceContext): PayrollResultRecord {
    const organizationId = context.organizationId;
    const run = this.runRepository.findById(organizationId, input.runId);
    if (!run) throw new Error("PAYROLL_RUN_NOT_FOUND");
    if (run.status !== "started") throw new Error("INVALID_RUN_STATUS");

    const period = this.payrollRepository.findPeriod(organizationId, run.periodId);
    if (!period) throw new Error("PAYROLL_PERIOD_NOT_FOUND");

    const components = this.componentRepository.list(organizationId);
    const employments = this.employmentRepository.search(organizationId, { status: "active" });

    const targetIds = input.employeeIds?.length
      ? new Set(input.employeeIds)
      : null;

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let employeeCount = 0;
    const now = nowIso();

    for (const employment of employments) {
      if (targetIds && !targetIds.has(employment.employeeId)) continue;

      const integrationInputs = this.buildIntegrationInputs(
        employment,
        period.periodStart,
        period.periodEnd,
        run.currency,
        organizationId,
      );

      const { lines, grossPay, totalDeductions: deductions, netPay } = this.engine.calculateEntry(
        components,
        { ...integrationInputs, currency: run.currency },
      );

      const entry: PayrollEntryRecord = {
        id: createPayrollEntryId(),
        organizationId,
        runId: run.id,
        employeeId: employment.employeeId,
        employmentId: employment.id,
        departmentId: employment.departmentId,
        lines,
        grossPay,
        totalDeductions: deductions,
        netPay,
        createdAt: now,
        updatedAt: now,
      };

      this.runRepository.saveEntry(entry);
      totalGross += grossPay.value;
      totalDeductions += deductions.value;
      totalNet += netPay.value;
      employeeCount += 1;
    }

    const updatedRun: PayrollRunRecord = {
      ...run,
      status: "calculated",
      calculatedAt: now,
      updatedAt: now,
    };
    this.runRepository.update(updatedRun);

    this.payrollRepository.savePeriod({
      ...period,
      status: "calculating",
      updatedAt: now,
    });

    const result: PayrollResultRecord = {
      id: createPayrollResultId(),
      organizationId,
      runId: run.id,
      periodId: run.periodId,
      totalGross: { value: Math.round(totalGross * 100) / 100, currency: run.currency },
      totalDeductions: { value: Math.round(totalDeductions * 100) / 100, currency: run.currency },
      totalNet: { value: Math.round(totalNet * 100) / 100, currency: run.currency },
      employeeCount,
      status: "calculated",
      calculatedAt: now,
    };

    const saved = this.payrollRepository.saveResult(result);

    publishHcmPayrollEvent(
      {
        eventType: "PayrollCalculated",
        entityId: run.id,
        payload: {
          periodId: run.periodId,
          employeeCount: String(employeeCount),
          totalNet: String(saved.totalNet.value),
        },
      },
      context,
    );

    return saved;
  }

  private buildIntegrationInputs(
    employment: { employeeId: string; id: string; departmentId?: string; payGradeRef?: string },
    periodStart: string,
    periodEnd: string,
    currency: string,
    organizationId: string,
  ): PayrollIntegrationInputs {
    const attendance = this.attendanceRepository.search(organizationId, {
      employeeId: employment.employeeId,
      dateFrom: periodStart,
      dateTo: periodEnd,
    });
    const attendanceDays = attendance.filter(
      (a) => a.status === "present" || a.status === "remote" || a.status === "half_day",
    ).length;

    const leaveRequests = this.leaveRepository.searchRequests(organizationId, {
      employeeId: employment.employeeId,
      leaveStatus: "approved",
      dateFrom: periodStart,
      dateTo: periodEnd,
    });
    const leaveDays = leaveRequests.reduce((sum, r) => sum + r.duration.value, 0);

    const baseSalaryValue = this.resolveBaseSalary(employment.payGradeRef);

    return {
      employeeId: employment.employeeId,
      employmentId: employment.id,
      departmentId: employment.departmentId,
      baseSalary: { value: baseSalaryValue, currency },
      attendanceDays,
      leaveDays,
      overtimeHours: 0,
      payGradeRef: employment.payGradeRef,
    };
  }

  private resolveBaseSalary(payGradeRef?: string): number {
    const grades: Record<string, number> = {
      "PG-1": 25000,
      "PG-2": 35000,
      "PG-3": 50000,
      "PG-4": 75000,
    };
    return payGradeRef ? (grades[payGradeRef] ?? 30000) : 30000;
  }
}
