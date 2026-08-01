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
import type {
  PayrollComponentRepository,
  PayrollRepository,
  PayrollRunRepository,
} from "@/lib/hcm/payroll/repositories/PayrollRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

function matchesPeriodQuery(period: PayrollPeriodRecord, query?: PayrollSearchQuery): boolean {
  if (!query) return true;
  if (query.periodId && period.id !== query.periodId) return false;
  if (query.status && period.status !== query.status) return false;
  if (query.dateFrom && period.periodEnd < query.dateFrom) return false;
  if (query.dateTo && period.periodStart > query.dateTo) return false;
  return true;
}

export class InMemoryPayrollRepository implements PayrollRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  listCalendars(organizationId: string): readonly PayrollCalendarRecord[] {
    return [...this.store.payrollCalendars.values()].filter(
      (calendar) => calendar.organizationId === organizationId && calendar.active,
    );
  }

  findCalendar(organizationId: string, calendarId: string): PayrollCalendarRecord | null {
    const record = this.store.payrollCalendars.get(calendarId);
    return record?.organizationId === organizationId ? record : null;
  }

  saveCalendar(calendar: PayrollCalendarRecord): PayrollCalendarRecord {
    this.store.payrollCalendars.set(calendar.id, calendar);
    return calendar;
  }

  listPeriods(organizationId: string, query?: PayrollSearchQuery): readonly PayrollPeriodRecord[] {
    return [...this.store.payrollPeriods.values()]
      .filter((period) => period.organizationId === organizationId && matchesPeriodQuery(period, query))
      .sort((a, b) => b.periodStart.localeCompare(a.periodStart));
  }

  findPeriod(organizationId: string, periodId: string): PayrollPeriodRecord | null {
    const record = this.store.payrollPeriods.get(periodId);
    return record?.organizationId === organizationId ? record : null;
  }

  savePeriod(period: PayrollPeriodRecord): PayrollPeriodRecord {
    this.store.payrollPeriods.set(period.id, period);
    return period;
  }

  listAdjustments(organizationId: string, runId?: string): readonly PayrollAdjustmentRecord[] {
    return [...this.store.payrollAdjustments.values()].filter(
      (adjustment) =>
        adjustment.organizationId === organizationId && (!runId || adjustment.runId === runId),
    );
  }

  saveAdjustment(adjustment: PayrollAdjustmentRecord): PayrollAdjustmentRecord {
    this.store.payrollAdjustments.set(adjustment.id, adjustment);
    return adjustment;
  }

  findAdjustment(organizationId: string, adjustmentId: string): PayrollAdjustmentRecord | null {
    const record = this.store.payrollAdjustments.get(adjustmentId);
    return record?.organizationId === organizationId ? record : null;
  }

  saveResult(result: PayrollResultRecord): PayrollResultRecord {
    this.store.payrollResults.set(result.runId, result);
    return result;
  }

  findResult(organizationId: string, runId: string): PayrollResultRecord | null {
    const record = this.store.payrollResults.get(runId);
    return record?.organizationId === organizationId ? record : null;
  }
}

export class InMemoryPayrollRunRepository implements PayrollRunRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(run: PayrollRunRecord): PayrollRunRecord {
    this.store.payrollRuns.set(run.id, run);
    return run;
  }

  update(run: PayrollRunRecord): PayrollRunRecord {
    this.store.payrollRuns.set(run.id, run);
    return run;
  }

  findById(organizationId: string, runId: string): PayrollRunRecord | null {
    const record = this.store.payrollRuns.get(runId);
    return record?.organizationId === organizationId ? record : null;
  }

  list(organizationId: string, query?: PayrollSearchQuery): readonly PayrollRunRecord[] {
    return [...this.store.payrollRuns.values()]
      .filter((run) => {
        if (run.organizationId !== organizationId) return false;
        if (query?.periodId && run.periodId !== query.periodId) return false;
        if (query?.runId && run.id !== query.runId) return false;
        if (query?.status && run.status !== query.status) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  nextRunNumber(organizationId: string, periodId: string): number {
    const runs = this.list(organizationId, { periodId });
    return runs.length + 1;
  }

  saveEntry(entry: PayrollEntryRecord): PayrollEntryRecord {
    this.store.payrollEntries.set(entry.id, entry);
    return entry;
  }

  listEntries(
    organizationId: string,
    runId: string,
    query?: PayrollSearchQuery,
  ): readonly PayrollEntryRecord[] {
    return [...this.store.payrollEntries.values()].filter((entry) => {
      if (entry.organizationId !== organizationId || entry.runId !== runId) return false;
      if (query?.employeeId && entry.employeeId !== query.employeeId) return false;
      if (query?.departmentId && entry.departmentId !== query.departmentId) return false;
      return true;
    });
  }

  findEntry(organizationId: string, entryId: string): PayrollEntryRecord | null {
    const record = this.store.payrollEntries.get(entryId);
    return record?.organizationId === organizationId ? record : null;
  }
}

export class InMemoryPayrollComponentRepository implements PayrollComponentRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(component: PayrollComponentRecord): PayrollComponentRecord {
    this.store.payrollComponents.set(component.id, component);
    return component;
  }

  update(component: PayrollComponentRecord): PayrollComponentRecord {
    this.store.payrollComponents.set(component.id, component);
    return component;
  }

  findById(organizationId: string, componentId: string): PayrollComponentRecord | null {
    const record = this.store.payrollComponents.get(componentId);
    return record?.organizationId === organizationId ? record : null;
  }

  findByCode(organizationId: string, code: string): PayrollComponentRecord | null {
    for (const record of this.store.payrollComponents.values()) {
      if (record.organizationId === organizationId && record.code === code && record.active) {
        return record;
      }
    }
    return null;
  }

  list(organizationId: string, componentType?: string): readonly PayrollComponentRecord[] {
    return [...this.store.payrollComponents.values()].filter(
      (component) =>
        component.organizationId === organizationId &&
        component.active &&
        (!componentType || component.componentType === componentType),
    );
  }
}
