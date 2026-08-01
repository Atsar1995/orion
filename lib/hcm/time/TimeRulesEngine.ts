import type { LeaveDuration, LeavePolicyRecord, RosterAssignment, ShiftPattern } from "@/types/hcm-time";
import { isValidDateRange } from "@/lib/hcm/common/time";

export type LeaveBalanceSnapshot = {
  readonly accrued: number;
  readonly used: number;
  readonly carriedForward: number;
};

export class TimeRulesEngine {
  assertEmployeeActive(status: string): void {
    if (status !== "active") {
      throw new Error("EMPLOYEE_NOT_ACTIVE");
    }
  }

  assertValidLeaveDates(startDate: string, endDate: string): void {
    if (!isValidDateRange(startDate, endDate)) {
      throw new Error("INVALID_LEAVE_DATE_RANGE");
    }
  }

  assertPartialDayAllowed(policy: LeavePolicyRecord | null, partialDay: boolean): void {
    if (partialDay && policy && !policy.allowPartialDay) {
      throw new Error("PARTIAL_DAY_NOT_ALLOWED");
    }
  }

  assertSufficientBalance(balance: LeaveBalanceSnapshot, duration: LeaveDuration): void {
    const available = balance.accrued + balance.carriedForward - balance.used;
    if (duration.value > available) {
      throw new Error("INSUFFICIENT_LEAVE_BALANCE");
    }
  }

  computeAvailableBalance(balance: LeaveBalanceSnapshot): number {
    return balance.accrued + balance.carriedForward - balance.used;
  }

  computeAccrual(policy: LeavePolicyRecord, months: number): number {
    return Math.round(policy.accrualRatePerMonth * months * 100) / 100;
  }

  applyCarryForward(currentBalance: number, maxCarryForward: number): number {
    return Math.min(currentBalance, maxCarryForward);
  }

  assertNoDuplicateAttendance(existing: unknown): void {
    if (existing) {
      throw new Error("ATTENDANCE_ALREADY_RECORDED");
    }
  }

  assertShiftOverlap(
    assignments: readonly RosterAssignment[],
    candidate: RosterAssignment,
    shiftPatterns: ReadonlyMap<string, ShiftPattern>,
  ): void {
    const candidatePattern = shiftPatterns.get(candidate.shiftId);
    if (!candidatePattern) {
      throw new Error("SHIFT_NOT_FOUND");
    }

    for (const assignment of assignments) {
      if (assignment.employeeId !== candidate.employeeId) continue;
      if (assignment.rosterDate !== candidate.rosterDate) continue;
      if (assignment.shiftId === candidate.shiftId) {
        throw new Error("DUPLICATE_SHIFT_ASSIGNMENT");
      }

      const existingPattern = shiftPatterns.get(assignment.shiftId);
      if (!existingPattern) continue;
      if (this.shiftsOverlap(candidatePattern, existingPattern)) {
        throw new Error("SHIFT_OVERLAP");
      }
    }
  }

  private shiftsOverlap(a: ShiftPattern, b: ShiftPattern): boolean {
    const aStart = this.toMinutes(a.startTime);
    const aEnd = this.toMinutes(a.endTime);
    const bStart = this.toMinutes(b.startTime);
    const bEnd = this.toMinutes(b.endTime);
    return aStart < bEnd && bStart < aEnd;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
