import type { FiscalPeriodState, PeriodReopenInput } from "@/types/finance-period";
import { isPeriodAdjustmentAllowed, isPeriodPostingAllowed, isPeriodReversalAllowed } from "@/types/finance-period";
import { defaultFinanceAuthorizationService } from "@/lib/finance/security/FinanceAuthorizationService";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
import type { ServiceContext } from "@/types/services";

export type PeriodValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Fiscal period validation rules (Mission P-009.5). */
export class PeriodRulesEngine {
  constructor(private readonly periodRepository: PeriodRepository) {}

  validateOpenPeriod(organizationId: string, periodId: string): PeriodValidationIssue[] {
    const period = this.periodRepository.findById(organizationId, periodId);
    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }
    if (period.state !== "future") {
      return [{ code: "INVALID_TRANSITION", message: "Only future periods may be opened", field: "state" }];
    }
    return [];
  }

  validateSoftClose(organizationId: string, periodId: string): PeriodValidationIssue[] {
    const period = this.periodRepository.findById(organizationId, periodId);
    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }
    if (period.state !== "open") {
      return [{ code: "INVALID_TRANSITION", message: "Only open periods may be soft closed", field: "state" }];
    }
    return [];
  }

  validateHardClose(organizationId: string, periodId: string): PeriodValidationIssue[] {
    const period = this.periodRepository.findById(organizationId, periodId);
    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }
    if (period.state !== "open" && period.state !== "soft_closed") {
      return [
        {
          code: "INVALID_TRANSITION",
          message: "Only open or soft-closed periods may be hard closed",
          field: "state",
        },
      ];
    }
    return [];
  }

  validateYearClose(organizationId: string, fiscalYear: number): PeriodValidationIssue[] {
    const year = this.periodRepository.getFiscalYear(organizationId, fiscalYear);
    if (!year) {
      return [{ code: "FISCAL_YEAR_NOT_FOUND", message: "Fiscal year not found", field: "fiscalYear" }];
    }
    if (year.state === "year_closed" || year.state === "archived") {
      return [{ code: "YEAR_ALREADY_CLOSED", message: "Fiscal year is already closed", field: "fiscalYear" }];
    }

    const periods = this.periodRepository.listByYear(organizationId, fiscalYear);
    const unclosed = periods.filter((period) => period.state !== "hard_closed" && period.state !== "year_closed");

    if (unclosed.length > 0) {
      return [
        {
          code: "PERIODS_NOT_CLOSED",
          message: `${unclosed.length} period(s) must be hard closed before year close`,
          field: "fiscalYear",
        },
      ];
    }

    return [];
  }

  validateReopen(input: PeriodReopenInput, context: ServiceContext): PeriodValidationIssue[] {
    const issues: PeriodValidationIssue[] = [];
    const period = this.periodRepository.findById(context.organizationId, input.periodId);

    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }

    if (period.state !== "soft_closed" && period.state !== "hard_closed") {
      issues.push({
        code: "INVALID_TRANSITION",
        message: "Only soft-closed or hard-closed periods may be reopened",
        field: "state",
      });
    }

    if (!defaultFinanceAuthorizationService.canReopenPeriod(context)) {
      issues.push({
        code: "UNAUTHORIZED_REOPEN",
        message: "Period reopen requires finance:period:reopen permission",
        field: "role",
      });
    }

    if (!input.reason.trim()) {
      issues.push({ code: "REASON_REQUIRED", message: "Reopen reason is required", field: "reason" });
    }

    if (!input.authorizationReference.trim()) {
      issues.push({
        code: "AUTHORIZATION_REQUIRED",
        message: "Authorization reference is required",
        field: "authorizationReference",
      });
    }

    return issues;
  }

  validatePosting(organizationId: string, periodId: string): PeriodValidationIssue[] {
    const period = this.periodRepository.findById(organizationId, periodId);
    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }
    if (!isPeriodPostingAllowed(period.state)) {
      return [
        {
          code: "PERIOD_NOT_OPEN",
          message: `Posting not permitted in ${period.state} period`,
          field: "periodId",
        },
      ];
    }
    return [];
  }

  validateDateInPeriod(organizationId: string, date: string, periodId: string): PeriodValidationIssue[] {
    const issues: PeriodValidationIssue[] = [];

    if (!DATE_PATTERN.test(date)) {
      issues.push({ code: "INVALID_DATE", message: "Date must be YYYY-MM-DD", field: "date" });
      return issues;
    }

    const period = this.periodRepository.findById(organizationId, periodId);
    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }

    if (date < period.startDate || date > period.endDate) {
      issues.push({
        code: "DATE_OUT_OF_RANGE",
        message: "Transaction date falls outside period range",
        field: "date",
      });
    }

    return issues;
  }

  validateCalendarIntegrity(organizationId: string, fiscalYear: number): PeriodValidationIssue[] {
    const periods = this.periodRepository.listByYear(organizationId, fiscalYear);
    const issues: PeriodValidationIssue[] = [];

    const numbers = new Set<number>();
    for (const period of periods) {
      if (numbers.has(period.periodNumber)) {
        issues.push({
          code: "DUPLICATE_PERIOD",
          message: `Duplicate period number ${period.periodNumber}`,
          field: "periodNumber",
        });
      }
      numbers.add(period.periodNumber);

      if (!DATE_PATTERN.test(period.startDate) || !DATE_PATTERN.test(period.endDate)) {
        issues.push({
          code: "INVALID_DATE_RANGE",
          message: `Invalid date range for period ${period.name}`,
          field: "dateRange",
        });
      }

      if (period.startDate > period.endDate) {
        issues.push({
          code: "INVERTED_DATE_RANGE",
          message: `Start date after end date for period ${period.name}`,
          field: "dateRange",
        });
      }
    }

    for (let i = 1; i < periods.length; i += 1) {
      const prev = periods[i - 1];
      const current = periods[i];
      if (prev && current && current.startDate <= prev.endDate) {
        issues.push({
          code: "OVERLAPPING_PERIODS",
          message: `Period ${current.name} overlaps ${prev.name}`,
          field: "dateRange",
        });
      }
    }

    return issues;
  }

  mapPeriodFlags(state: FiscalPeriodState): {
    postingAllowed: boolean;
    adjustmentAllowed: boolean;
    reversalAllowed: boolean;
  } {
    return {
      postingAllowed: isPeriodPostingAllowed(state),
      adjustmentAllowed: isPeriodAdjustmentAllowed(state),
      reversalAllowed: isPeriodReversalAllowed(state),
    };
  }

  assertTransitionAllowed(
    current: FiscalPeriodState,
    target: FiscalPeriodState,
  ): PeriodValidationIssue[] {
    const allowed: Record<FiscalPeriodState, readonly FiscalPeriodState[]> = {
      future: ["open"],
      open: ["soft_closed", "hard_closed"],
      soft_closed: ["hard_closed", "open"],
      hard_closed: ["year_closed", "open"],
      year_closed: ["archived"],
      archived: [],
    };

    if (!allowed[current].includes(target)) {
      return [
        {
          code: "INVALID_TRANSITION",
          message: `Cannot transition from ${current} to ${target}`,
          field: "state",
        },
      ];
    }

    return [];
  }
}
