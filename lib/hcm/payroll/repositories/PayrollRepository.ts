import type {
  PayrollAdjustmentRecord,
  PayrollCalendarRecord,
  PayrollComponentRecord,
  PayrollEntryRecord,
  PayrollPeriodRecord,
  PayrollResultRecord,
  PayrollRunRecord,
  PayrollSearchQuery,
} from "@/types/hcm-payroll";

/** Payroll repository contract (P-012.7). */
export type PayrollRepository = {
  readonly domain: "hcm";
  listCalendars(organizationId: string): readonly PayrollCalendarRecord[];
  findCalendar(organizationId: string, calendarId: string): PayrollCalendarRecord | null;
  saveCalendar(calendar: PayrollCalendarRecord): PayrollCalendarRecord;
  listPeriods(organizationId: string, query?: PayrollSearchQuery): readonly PayrollPeriodRecord[];
  findPeriod(organizationId: string, periodId: string): PayrollPeriodRecord | null;
  savePeriod(period: PayrollPeriodRecord): PayrollPeriodRecord;
  listAdjustments(organizationId: string, runId?: string): readonly PayrollAdjustmentRecord[];
  saveAdjustment(adjustment: PayrollAdjustmentRecord): PayrollAdjustmentRecord;
  findAdjustment(organizationId: string, adjustmentId: string): PayrollAdjustmentRecord | null;
  saveResult(result: PayrollResultRecord): PayrollResultRecord;
  findResult(organizationId: string, runId: string): PayrollResultRecord | null;
};

/** Payroll run repository contract (P-012.7). */
export type PayrollRunRepository = {
  readonly domain: "hcm";
  create(run: PayrollRunRecord): PayrollRunRecord;
  update(run: PayrollRunRecord): PayrollRunRecord;
  findById(organizationId: string, runId: string): PayrollRunRecord | null;
  list(organizationId: string, query?: PayrollSearchQuery): readonly PayrollRunRecord[];
  nextRunNumber(organizationId: string, periodId: string): number;
  saveEntry(entry: PayrollEntryRecord): PayrollEntryRecord;
  listEntries(organizationId: string, runId: string, query?: PayrollSearchQuery): readonly PayrollEntryRecord[];
  findEntry(organizationId: string, entryId: string): PayrollEntryRecord | null;
};

/** Payroll component repository contract (P-012.7). */
export type PayrollComponentRepository = {
  readonly domain: "hcm";
  create(component: PayrollComponentRecord): PayrollComponentRecord;
  update(component: PayrollComponentRecord): PayrollComponentRecord;
  findById(organizationId: string, componentId: string): PayrollComponentRecord | null;
  findByCode(organizationId: string, code: string): PayrollComponentRecord | null;
  list(organizationId: string, componentType?: string): readonly PayrollComponentRecord[];
};
