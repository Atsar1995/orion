import type { FiscalPeriodRecord, FiscalPeriodState, FiscalYearRecord } from "@/types/finance-period";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

/** In-memory fiscal period repository (Mission P-009.5). */
export class InMemoryPeriodRepository implements PeriodRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  getCalendar(organizationId: string) {
    const calendar = this.backing.fiscalCalendar.value;
    if (!calendar || calendar.organizationId !== organizationId) return null;
    return calendar;
  }

  getFiscalYear(organizationId: string, fiscalYear: number): FiscalYearRecord | null {
    return (
      [...this.backing.fiscalYears.values()].find(
        (year) => year.organizationId === organizationId && year.fiscalYear === fiscalYear,
      ) ?? null
    );
  }

  listFiscalYears(organizationId: string): readonly FiscalYearRecord[] {
    return [...this.backing.fiscalYears.values()]
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
    this.backing.fiscalYears.set(existing.id, updated);
    return updated;
  }

  findById(organizationId: string, periodId: string): FiscalPeriodRecord | null {
    const record = this.backing.fiscalPeriods.get(periodId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  findByDate(organizationId: string, date: string): FiscalPeriodRecord | null {
    return (
      [...this.backing.fiscalPeriods.values()].find(
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
      [...this.backing.fiscalPeriods.values()].find(
        (period) =>
          period.organizationId === organizationId &&
          period.fiscalYear === fiscalYear &&
          period.periodNumber === periodNumber,
      ) ?? null
    );
  }

  getCurrentPeriod(organizationId: string): FiscalPeriodRecord | null {
    const open = [...this.backing.fiscalPeriods.values()]
      .filter((period) => period.organizationId === organizationId && period.state === "open")
      .sort((a, b) => b.periodNumber - a.periodNumber);
    return open[0] ?? null;
  }

  listByYear(organizationId: string, fiscalYear: number): readonly FiscalPeriodRecord[] {
    return [...this.backing.fiscalPeriods.values()]
      .filter((period) => period.organizationId === organizationId && period.fiscalYear === fiscalYear)
      .sort((a, b) => a.periodNumber - b.periodNumber);
  }

  list(organizationId: string): readonly FiscalPeriodRecord[] {
    return [...this.backing.fiscalPeriods.values()]
      .filter((period) => period.organizationId === organizationId)
      .sort((a, b) => a.fiscalYear - b.fiscalYear || a.periodNumber - b.periodNumber);
  }

  create(period: FiscalPeriodRecord): FiscalPeriodRecord {
    this.backing.fiscalPeriods.set(period.id, period);
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
    this.backing.fiscalPeriods.set(periodId, updated);
    return updated;
  }

  updatePeriod(organizationId: string, period: FiscalPeriodRecord): FiscalPeriodRecord {
    if (period.organizationId !== organizationId) throw new Error("ORGANIZATION_MISMATCH");
    this.backing.fiscalPeriods.set(period.id, period);
    return period;
  }
}

export const defaultPeriodRepository = new InMemoryPeriodRepository(getDefaultFinanceBacking());
