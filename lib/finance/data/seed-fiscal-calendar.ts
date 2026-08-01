import type { FiscalCalendarRecord, FiscalPeriodRecord, FiscalYearRecord } from "@/types/finance-period";

const CALENDAR_ID = "cal-orania-2026";
const YEAR_ID = "fy-orania-2026";

/** Seed fiscal calendar for org-orania (Mission P-009.5). */
export function seedFiscalCalendar(organizationId: string): FiscalCalendarRecord {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: CALENDAR_ID,
    organizationId,
    name: "Orania Standard Calendar",
    fiscalYearStartMonth: 1,
    periodsPerYear: 12,
    createdAt: now,
    updatedAt: now,
  };
}

export function seedFiscalYear(organizationId: string): FiscalYearRecord {
  return {
    id: YEAR_ID,
    organizationId,
    calendarId: CALENDAR_ID,
    fiscalYear: 2026,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    state: "open",
  };
}

function monthPeriod(
  organizationId: string,
  periodNumber: number,
  name: string,
  startDate: string,
  endDate: string,
  state: FiscalPeriodRecord["state"],
): FiscalPeriodRecord {
  return {
    id: `period-2026-${String(periodNumber).padStart(2, "0")}`,
    organizationId,
    calendarId: CALENDAR_ID,
    fiscalYearId: YEAR_ID,
    name,
    fiscalYear: 2026,
    periodNumber,
    startDate,
    endDate,
    state,
  };
}

/** Seed twelve monthly periods for 2026. */
export function seedFiscalPeriods(organizationId: string): FiscalPeriodRecord[] {
  const months = [
    ["January", "2026-01-01", "2026-01-31", "hard_closed"],
    ["February", "2026-02-01", "2026-02-28", "hard_closed"],
    ["March", "2026-03-01", "2026-03-31", "hard_closed"],
    ["April", "2026-04-01", "2026-04-30", "hard_closed"],
    ["May", "2026-05-01", "2026-05-31", "hard_closed"],
    ["June", "2026-06-01", "2026-06-30", "hard_closed"],
    ["July", "2026-07-01", "2026-07-31", "open"],
    ["August", "2026-08-01", "2026-08-31", "open"],
    ["September", "2026-09-01", "2026-09-30", "future"],
    ["October", "2026-10-01", "2026-10-31", "future"],
    ["November", "2026-11-01", "2026-11-30", "future"],
    ["December", "2026-12-01", "2026-12-31", "future"],
  ] as const;

  return months.map(([name, start, end, state], index) =>
    monthPeriod(organizationId, index + 1, `${name} 2026`, start, end, state),
  );
}
