import { describe, expect, it } from "vitest";
import { TimeRulesEngine } from "@/lib/hcm/time/TimeRulesEngine";
import type { LeavePolicyRecord, RosterAssignment, ShiftPattern } from "@/types/hcm-time";

describe("HCM Leave Policy Rules (P-012.6)", () => {
  const rules = new TimeRulesEngine();

  const annualPolicy: LeavePolicyRecord = {
    id: "lpol-test",
    organizationId: "org-orania",
    leaveType: "annual",
    accrualRatePerMonth: 1.75,
    maxCarryForward: 10,
    requiresApproval: true,
    allowPartialDay: true,
    active: true,
  };

  it("computes monthly accrual from policy rate", () => {
    expect(rules.computeAccrual(annualPolicy, 12)).toBe(21);
  });

  it("caps carry-forward at policy maximum", () => {
    expect(rules.applyCarryForward(15, annualPolicy.maxCarryForward)).toBe(10);
  });

  it("validates sufficient leave balance", () => {
    expect(() =>
      rules.assertSufficientBalance({ accrued: 10, used: 8, carriedForward: 0 }, { value: 5, unit: "days" }),
    ).toThrow("INSUFFICIENT_LEAVE_BALANCE");
  });

  it("rejects partial day when policy disallows", () => {
    const strictPolicy = { ...annualPolicy, allowPartialDay: false };
    expect(() => rules.assertPartialDayAllowed(strictPolicy, true)).toThrow("PARTIAL_DAY_NOT_ALLOWED");
  });
});

describe("HCM Shift Overlap Validation (P-012.6)", () => {
  const rules = new TimeRulesEngine();

  const dayShift: ShiftPattern = { code: "DAY", startTime: "09:00", endTime: "18:00" };
  const eveningShift: ShiftPattern = { code: "EVE", startTime: "14:00", endTime: "22:00" };
  const nightShift: ShiftPattern = { code: "NIGHT", startTime: "22:00", endTime: "06:00" };

  it("detects overlapping shifts on same day", () => {
    const existing: RosterAssignment[] = [
      { employeeId: "emp-1", shiftId: "shift-day", rosterDate: "2026-08-01" },
    ];
    const candidate: RosterAssignment = {
      employeeId: "emp-1",
      shiftId: "shift-eve",
      rosterDate: "2026-08-01",
    };
    const patterns = new Map([
      ["shift-day", dayShift],
      ["shift-eve", eveningShift],
    ]);

    expect(() => rules.assertShiftOverlap(existing, candidate, patterns)).toThrow("SHIFT_OVERLAP");
  });

  it("allows non-overlapping shifts on same day", () => {
    const existing: RosterAssignment[] = [
      { employeeId: "emp-1", shiftId: "shift-day", rosterDate: "2026-08-01" },
    ];
    const candidate: RosterAssignment = {
      employeeId: "emp-1",
      shiftId: "shift-night",
      rosterDate: "2026-08-02",
    };
    const patterns = new Map([
      ["shift-day", dayShift],
      ["shift-night", nightShift],
    ]);

    expect(() => rules.assertShiftOverlap(existing, candidate, patterns)).not.toThrow();
  });
});
