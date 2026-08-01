import type { FiscalCalendarRecord, FiscalPeriodRecord, FiscalPeriodState, FiscalYearRecord } from "@/types/finance-period";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
import {
  seedFiscalCalendar,
  seedFiscalPeriods,
  seedFiscalYear,
} from "@/lib/finance/data/seed-fiscal-calendar";

/** In-memory fiscal period repository (Mission P-009.5). */
export class InMemoryPeriodRepository implements PeriodRepository {
  readonly domain = "finance" as const;

  private readonly calendar: FiscalCalendarRecord;
  private readonly fiscalYears = new Map<string, FiscalYearRecord>();
  private readonly periods = new Map<string, FiscalPeriodRecord>();

  constructor(seedOrganizationId = "org-orania") {
    this.calendar = seedFiscalCalendar(seedOrganizationId);
    const year = seedFiscalYear(seedOrganizationId);
    this.fiscalYears.set(year.id, year);

    for (const period of seedFiscalPeriods(seedOrganizationId)) {
      this.periods.set(period.id, period);
    }
  }

  getCalendar(organizationId: string): FiscalCalendarRecord | null {
    if (this.calendar.organizationId !== organizationId) return null;
    return this.calendar;
  }

  getFiscalYear(organizationId: string, fiscalYear: number): FiscalYearRecord | null {
    return (
      [...this.fiscalYears.values()].find(
        (year) => year.organizationId === organizationId && year.fiscalYear === fiscalYear,
      ) ?? null
    );
  }

  listFiscalYears(organizationId: string): readonly FiscalYearRecord[] {
    return [...this.fiscalYears.values()]
      .filter((year) => year.organizationId === organizationId)
      .sort((a, b) => a.fiscalYear - b.fiscalYear);
  }

  updateFiscalYearState(
    organizationId: string,
    fiscalYear: number,
    state: FiscalYearRecord["state"],
  ): FiscalYearRecord {
    const existing = this.getFiscalYear(organizationId, fiscalYear);
    if (!existing) throw new Error("FISCAL_YEAR_NOT_FOUND");

    const updated: FiscalYearRecord = { ...existing, state };
    this.fiscalYears.set(existing.id, updated);
    return updated;
  }

  findById(organizationId: string, periodId: string): FiscalPeriodRecord | null {
    const record = this.periods.get(periodId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findByDate(organizationId: string, date: string): FiscalPeriodRecord | null {
    return (
      [...this.periods.values()].find(
        (period) =>
          period.organizationId === organizationId &&
          date >= period.startDate &&
          date <= period.endDate,
      ) ?? null
    );
  }

  findByNumber(
    organizationId: string,
    fiscalYear: number,
    periodNumber: number,
  ): FiscalPeriodRecord | null {
    return (
      [...this.periods.values()].find(
        (period) =>
          period.organizationId === organizationId &&
          period.fiscalYear === fiscalYear &&
          period.periodNumber === periodNumber,
      ) ?? null
    );
  }

  getCurrentPeriod(organizationId: string): FiscalPeriodRecord | null {
    const open = [...this.periods.values()]
      .filter((period) => period.organizationId === organizationId && period.state === "open")
      .sort((a, b) => b.periodNumber - a.periodNumber);
    return open[0] ?? null;
  }

  listByYear(organizationId: string, fiscalYear: number): readonly FiscalPeriodRecord[] {
    return [...this.periods.values()]
      .filter((period) => period.organizationId === organizationId && period.fiscalYear === fiscalYear)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }

  list(organizationId: string): readonly FiscalPeriodRecord[] {
    return [...this.periods.values()]
      .filter((period) => period.organizationId === organizationId)
      .sort((a, b) => a.fiscalYear - b.fiscalYear || a.periodNumber - b.periodNumber);
  }

  create(period: FiscalPeriodRecord): FiscalPeriodRecord {
    this.periods.set(period.id, period);
    return period;
  }

  updateState(
    organizationId: string,
    periodId: string,
    state: FiscalPeriodState,
  ): FiscalPeriodRecord {
    const existing = this.findById(organizationId, periodId);
    if (!existing) throw new Error("PERIOD_NOT_FOUND");

    const updated: FiscalPeriodRecord = { ...existing, state };
    this.periods.set(periodId, updated);
    return updated;
  }

  updatePeriod(organizationId: string, period: FiscalPeriodRecord): FiscalPeriodRecord {
    if (period.organizationId !== organizationId) throw new Error("ORGANIZATION_MISMATCH");
    this.periods.set(period.id, period);
    return period;
  }
}

export const defaultPeriodRepository = new InMemoryPeriodRepository();
