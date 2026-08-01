import type { FiscalCalendarRecord, FiscalPeriodRecord, FiscalPeriodState, FiscalYearRecord } from "@/types/finance-period";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Fiscal period and calendar access contract (Mission P-009.5). */
export type PeriodRepository = FinanceRepository & {
  getCalendar(organizationId: string): FiscalCalendarRecord | null;
  getFiscalYear(organizationId: string, fiscalYear: number): FiscalYearRecord | null;
  listFiscalYears(organizationId: string): readonly FiscalYearRecord[];
  updateFiscalYearState(organizationId: string, fiscalYear: number, state: FiscalYearRecord["state"]): FiscalYearRecord;

  findById(organizationId: string, periodId: string): FiscalPeriodRecord | null;
  findByDate(organizationId: string, date: string): FiscalPeriodRecord | null;
  findByNumber(organizationId: string, fiscalYear: number, periodNumber: number): FiscalPeriodRecord | null;
  getCurrentPeriod(organizationId: string): FiscalPeriodRecord | null;
  listByYear(organizationId: string, fiscalYear: number): readonly FiscalPeriodRecord[];
  list(organizationId: string): readonly FiscalPeriodRecord[];
  create(period: FiscalPeriodRecord): FiscalPeriodRecord;
  updateState(organizationId: string, periodId: string, state: FiscalPeriodState): FiscalPeriodRecord;
  updatePeriod(organizationId: string, period: FiscalPeriodRecord): FiscalPeriodRecord;
};
