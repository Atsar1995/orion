import type { ServiceContext } from "@/types/services";
import type {
  CreatePayrollCalendarInput,
  OpenPayrollPeriodInput,
  PayrollCalendarRecord,
  PayrollPeriodRecord,
  PayrollSearchQuery,
} from "@/types/hcm-payroll";
import { createPayrollCalendarId, createPayrollPeriodId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { publishHcmPayrollEvent } from "@/lib/hcm/hcm-events";
import type { PayrollRepository } from "@/lib/hcm/payroll/repositories/PayrollRepository";

export class PayrollPeriodService {
  constructor(private readonly payrollRepository: PayrollRepository) {}

  createCalendar(input: CreatePayrollCalendarInput, context: ServiceContext): PayrollCalendarRecord {
    const calendar: PayrollCalendarRecord = {
      id: createPayrollCalendarId(),
      organizationId: context.organizationId,
      code: input.code,
      name: input.name,
      frequency: input.frequency,
      currency: input.currency,
      weekStartsOn: input.weekStartsOn,
      active: true,
    };
    return this.payrollRepository.saveCalendar(calendar);
  }

  openPeriod(input: OpenPayrollPeriodInput, context: ServiceContext): PayrollPeriodRecord {
    const organizationId = context.organizationId;
    const calendar = this.payrollRepository.findCalendar(organizationId, input.calendarId);
    if (!calendar) throw new Error("PAYROLL_CALENDAR_NOT_FOUND");
    if (input.periodEnd < input.periodStart) throw new Error("INVALID_PERIOD_RANGE");

    const now = nowIso();
    const period: PayrollPeriodRecord = {
      id: createPayrollPeriodId(),
      organizationId,
      calendarId: input.calendarId,
      periodCode: input.periodCode,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      payDate: input.payDate,
      status: "open",
      openedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = this.payrollRepository.savePeriod(period);

    publishHcmPayrollEvent(
      {
        eventType: "PayrollPeriodOpened",
        entityId: saved.id,
        payload: { periodCode: saved.periodCode, calendarId: saved.calendarId },
      },
      context,
    );

    return saved;
  }

  getPeriod(periodId: string, context: ServiceContext): PayrollPeriodRecord | null {
    return this.payrollRepository.findPeriod(context.organizationId, periodId);
  }

  listPeriods(query: PayrollSearchQuery | undefined, context: ServiceContext): readonly PayrollPeriodRecord[] {
    return this.payrollRepository.listPeriods(context.organizationId, query);
  }

  listCalendars(context: ServiceContext): readonly PayrollCalendarRecord[] {
    return this.payrollRepository.listCalendars(context.organizationId);
  }
}
