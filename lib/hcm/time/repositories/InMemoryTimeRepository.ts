import type {
  AttendanceExceptionRecord,
  AttendanceRecord,
  HolidayCalendarRecord,
  LeaveBalanceRecord,
  LeavePolicyRecord,
  LeaveRequestRecord,
  OvertimeRecord,
  RosterRecord,
  TimeSearchQuery,
  WorkCalendarRecord,
  WorkShiftRecord,
} from "@/types/hcm-time";
import type {
  AttendanceRepository,
  CalendarRepository,
  LeaveRepository,
  RosterRepository,
  ShiftRepository,
} from "@/lib/hcm/time/repositories/TimeRepository";
import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";

function balanceKey(organizationId: string, employeeId: string, leaveType: string): string {
  return `${organizationId}:${employeeId}:${leaveType}`;
}

function inDateRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function matchesTimeQuery(
  record: { employeeId?: string; departmentId?: string; attendanceDate?: string; shiftId?: string; status?: string },
  query?: TimeSearchQuery,
): boolean {
  if (!query) return true;
  if (query.employeeId && record.employeeId !== query.employeeId) return false;
  if (query.departmentId && record.departmentId !== query.departmentId) return false;
  if (query.shiftId && record.shiftId !== query.shiftId) return false;
  if (query.attendanceStatus && record.status !== query.attendanceStatus) return false;
  if (record.attendanceDate && !inDateRange(record.attendanceDate, query.dateFrom, query.dateTo)) return false;
  return true;
}

export class InMemoryAttendanceRepository implements AttendanceRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(record: AttendanceRecord): AttendanceRecord {
    this.store.attendance.set(record.id, record);
    return record;
  }

  update(record: AttendanceRecord): AttendanceRecord {
    this.store.attendance.set(record.id, record);
    return record;
  }

  findById(organizationId: string, attendanceId: string): AttendanceRecord | null {
    const record = this.store.attendance.get(attendanceId);
    return record?.organizationId === organizationId ? record : null;
  }

  findByEmployeeDate(organizationId: string, employeeId: string, date: string): AttendanceRecord | null {
    for (const record of this.store.attendance.values()) {
      if (
        record.organizationId === organizationId &&
        record.employeeId === employeeId &&
        record.attendanceDate === date
      ) {
        return record;
      }
    }
    return null;
  }

  search(organizationId: string, query?: TimeSearchQuery): readonly AttendanceRecord[] {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 50;
    const filtered = [...this.store.attendance.values()]
      .filter((record) => record.organizationId === organizationId && matchesTimeQuery(record, query))
      .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  count(organizationId: string, query?: TimeSearchQuery): number {
    return [...this.store.attendance.values()].filter(
      (record) => record.organizationId === organizationId && matchesTimeQuery(record, query),
    ).length;
  }

  createException(exception: AttendanceExceptionRecord): AttendanceExceptionRecord {
    this.store.attendanceExceptions.set(exception.id, exception);
    return exception;
  }

  listExceptions(organizationId: string, attendanceId: string): readonly AttendanceExceptionRecord[] {
    return [...this.store.attendanceExceptions.values()].filter(
      (record) => record.organizationId === organizationId && record.attendanceId === attendanceId,
    );
  }
}

export class InMemoryLeaveRepository implements LeaveRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  createRequest(request: LeaveRequestRecord): LeaveRequestRecord {
    this.store.leaveRequests.set(request.id, request);
    return request;
  }

  updateRequest(request: LeaveRequestRecord): LeaveRequestRecord {
    this.store.leaveRequests.set(request.id, request);
    return request;
  }

  findRequest(organizationId: string, requestId: string): LeaveRequestRecord | null {
    const record = this.store.leaveRequests.get(requestId);
    return record?.organizationId === organizationId ? record : null;
  }

  searchRequests(organizationId: string, query?: TimeSearchQuery): readonly LeaveRequestRecord[] {
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 50;
    const filtered = [...this.store.leaveRequests.values()]
      .filter((record) => {
        if (record.organizationId !== organizationId) return false;
        if (query?.employeeId && record.employeeId !== query.employeeId) return false;
        if (query?.leaveStatus && record.status !== query.leaveStatus) return false;
        if (query?.dateFrom && record.endDate < query.dateFrom) return false;
        if (query?.dateTo && record.startDate > query.dateTo) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  getBalance(organizationId: string, employeeId: string, leaveType: string): LeaveBalanceRecord | null {
    for (const balance of this.store.leaveBalances.values()) {
      if (
        balance.organizationId === organizationId &&
        balance.employeeId === employeeId &&
        balance.leaveType === leaveType
      ) {
        return balance;
      }
    }
    return null;
  }

  saveBalance(balance: LeaveBalanceRecord): LeaveBalanceRecord {
    const key = balanceKey(balance.organizationId, balance.employeeId, balance.leaveType);
    this.store.leaveBalances.set(key, balance);
    if (!balance.id) {
      return balance;
    }
    this.store.leaveBalances.set(balance.id, balance);
    return balance;
  }

  listPolicies(organizationId: string): readonly LeavePolicyRecord[] {
    return [...this.store.leavePolicies.values()].filter(
      (policy) => policy.organizationId === organizationId && policy.active,
    );
  }

  findPolicy(organizationId: string, leaveType: string): LeavePolicyRecord | null {
    for (const policy of this.store.leavePolicies.values()) {
      if (policy.organizationId === organizationId && policy.leaveType === leaveType && policy.active) {
        return policy;
      }
    }
    return null;
  }
}

export class InMemoryRosterRepository implements RosterRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(roster: RosterRecord): RosterRecord {
    this.store.rosters.set(roster.id, roster);
    return roster;
  }

  update(roster: RosterRecord): RosterRecord {
    this.store.rosters.set(roster.id, roster);
    return roster;
  }

  findById(organizationId: string, rosterId: string): RosterRecord | null {
    const record = this.store.rosters.get(rosterId);
    return record?.organizationId === organizationId ? record : null;
  }

  list(organizationId: string, query?: TimeSearchQuery): readonly RosterRecord[] {
    return [...this.store.rosters.values()]
      .filter((record) => {
        if (record.organizationId !== organizationId) return false;
        if (query?.departmentId && record.departmentId !== query.departmentId) return false;
        if (query?.dateFrom && record.periodEnd < query.dateFrom) return false;
        if (query?.dateTo && record.periodStart > query.dateTo) return false;
        return true;
      })
      .sort((a, b) => b.periodStart.localeCompare(a.periodStart));
  }
}

export class InMemoryShiftRepository implements ShiftRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  create(shift: WorkShiftRecord): WorkShiftRecord {
    this.store.shifts.set(shift.id, shift);
    return shift;
  }

  update(shift: WorkShiftRecord): WorkShiftRecord {
    this.store.shifts.set(shift.id, shift);
    return shift;
  }

  findById(organizationId: string, shiftId: string): WorkShiftRecord | null {
    const record = this.store.shifts.get(shiftId);
    return record?.organizationId === organizationId ? record : null;
  }

  findByCode(organizationId: string, code: string): WorkShiftRecord | null {
    for (const record of this.store.shifts.values()) {
      if (record.organizationId === organizationId && record.code === code) {
        return record;
      }
    }
    return null;
  }

  list(organizationId: string, departmentId?: string): readonly WorkShiftRecord[] {
    return [...this.store.shifts.values()].filter(
      (record) =>
        record.organizationId === organizationId &&
        record.active &&
        (!departmentId || record.departmentId === departmentId),
    );
  }
}

export class InMemoryCalendarRepository implements CalendarRepository {
  readonly domain = "hcm" as const;

  constructor(private readonly store: InMemoryHcmStore) {}

  listHolidayCalendars(organizationId: string): readonly HolidayCalendarRecord[] {
    return [...this.store.holidayCalendars.values()].filter(
      (calendar) => calendar.organizationId === organizationId && calendar.active,
    );
  }

  findHolidayCalendar(organizationId: string, calendarId: string): HolidayCalendarRecord | null {
    const record = this.store.holidayCalendars.get(calendarId);
    return record?.organizationId === organizationId ? record : null;
  }

  saveHolidayCalendar(calendar: HolidayCalendarRecord): HolidayCalendarRecord {
    this.store.holidayCalendars.set(calendar.id, calendar);
    return calendar;
  }

  listWorkCalendars(organizationId: string): readonly WorkCalendarRecord[] {
    return [...this.store.workCalendars.values()].filter(
      (calendar) => calendar.organizationId === organizationId && calendar.active,
    );
  }

  findWorkCalendar(organizationId: string, calendarId: string): WorkCalendarRecord | null {
    const record = this.store.workCalendars.get(calendarId);
    return record?.organizationId === organizationId ? record : null;
  }

  saveWorkCalendar(calendar: WorkCalendarRecord): WorkCalendarRecord {
    this.store.workCalendars.set(calendar.id, calendar);
    return calendar;
  }

  listOvertime(organizationId: string, employeeId?: string): readonly OvertimeRecord[] {
    return [...this.store.overtime.values()].filter(
      (record) =>
        record.organizationId === organizationId && (!employeeId || record.employeeId === employeeId),
    );
  }

  saveOvertime(record: OvertimeRecord): OvertimeRecord {
    this.store.overtime.set(record.id, record);
    return record;
  }

  findOvertime(organizationId: string, overtimeId: string): OvertimeRecord | null {
    const record = this.store.overtime.get(overtimeId);
    return record?.organizationId === organizationId ? record : null;
  }
}
