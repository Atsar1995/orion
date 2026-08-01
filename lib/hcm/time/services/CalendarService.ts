import type { ServiceContext } from "@/types/services";
import type {
  CalendarDate,
  HolidayCalendarRecord,
  WorkCalendarRecord,
} from "@/types/hcm-time";
import { createHolidayCalendarId, createWorkCalendarId } from "@/lib/hcm/common/ids";
import type { CalendarRepository } from "@/lib/hcm/time/repositories/TimeRepository";

export class CalendarService {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  listHolidayCalendars(context: ServiceContext): readonly HolidayCalendarRecord[] {
    return this.calendarRepository.listHolidayCalendars(context.organizationId);
  }

  listWorkCalendars(context: ServiceContext): readonly WorkCalendarRecord[] {
    return this.calendarRepository.listWorkCalendars(context.organizationId);
  }

  saveHolidayCalendar(
    input: Omit<HolidayCalendarRecord, "id"> & { id?: string },
    context: ServiceContext,
  ): HolidayCalendarRecord {
    const calendar: HolidayCalendarRecord = {
      id: input.id ?? createHolidayCalendarId(),
      organizationId: context.organizationId,
      code: input.code,
      name: input.name,
      year: input.year,
      holidays: input.holidays,
      active: input.active,
    };
    return this.calendarRepository.saveHolidayCalendar(calendar);
  }

  saveWorkCalendar(
    input: Omit<WorkCalendarRecord, "id"> & { id?: string },
    context: ServiceContext,
  ): WorkCalendarRecord {
    const calendar: WorkCalendarRecord = {
      id: input.id ?? createWorkCalendarId(),
      organizationId: context.organizationId,
      code: input.code,
      name: input.name,
      workingHours: input.workingHours,
      weekStartsOn: input.weekStartsOn,
      active: input.active,
    };
    return this.calendarRepository.saveWorkCalendar(calendar);
  }

  isHoliday(date: CalendarDate, context: ServiceContext, calendarId?: string): boolean {
    const calendars = calendarId
      ? [this.calendarRepository.findHolidayCalendar(context.organizationId, calendarId)].filter(Boolean)
      : this.calendarRepository.listHolidayCalendars(context.organizationId);

    return calendars.some((calendar) =>
      calendar!.holidays.some((holiday) => holiday.date === date),
    );
  }

  getWorkingHoursForDate(date: CalendarDate, context: ServiceContext, calendarId?: string): number {
    const calendars = calendarId
      ? [this.calendarRepository.findWorkCalendar(context.organizationId, calendarId)].filter(Boolean)
      : this.calendarRepository.listWorkCalendars(context.organizationId);

    const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
    const key = dayKeys[day];

    for (const calendar of calendars) {
      const hours = calendar!.workingHours[key];
      if (hours !== undefined) return hours;
    }

    return 0;
  }
}
