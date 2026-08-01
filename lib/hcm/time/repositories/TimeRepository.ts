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

/** Attendance repository contract (P-012.6). */
export type AttendanceRepository = {
  readonly domain: "hcm";
  create(record: AttendanceRecord): AttendanceRecord;
  update(record: AttendanceRecord): AttendanceRecord;
  findById(organizationId: string, attendanceId: string): AttendanceRecord | null;
  findByEmployeeDate(organizationId: string, employeeId: string, date: string): AttendanceRecord | null;
  search(organizationId: string, query?: TimeSearchQuery): readonly AttendanceRecord[];
  count(organizationId: string, query?: TimeSearchQuery): number;
  createException(exception: AttendanceExceptionRecord): AttendanceExceptionRecord;
  listExceptions(organizationId: string, attendanceId: string): readonly AttendanceExceptionRecord[];
};

/** Leave repository contract (P-012.6). */
export type LeaveRepository = {
  readonly domain: "hcm";
  createRequest(request: LeaveRequestRecord): LeaveRequestRecord;
  updateRequest(request: LeaveRequestRecord): LeaveRequestRecord;
  findRequest(organizationId: string, requestId: string): LeaveRequestRecord | null;
  searchRequests(organizationId: string, query?: TimeSearchQuery): readonly LeaveRequestRecord[];
  getBalance(organizationId: string, employeeId: string, leaveType: string): LeaveBalanceRecord | null;
  saveBalance(balance: LeaveBalanceRecord): LeaveBalanceRecord;
  listPolicies(organizationId: string): readonly LeavePolicyRecord[];
  findPolicy(organizationId: string, leaveType: string): LeavePolicyRecord | null;
};

/** Roster repository contract (P-012.6). */
export type RosterRepository = {
  readonly domain: "hcm";
  create(roster: RosterRecord): RosterRecord;
  update(roster: RosterRecord): RosterRecord;
  findById(organizationId: string, rosterId: string): RosterRecord | null;
  list(organizationId: string, query?: TimeSearchQuery): readonly RosterRecord[];
};

/** Shift repository contract (P-012.6). */
export type ShiftRepository = {
  readonly domain: "hcm";
  create(shift: WorkShiftRecord): WorkShiftRecord;
  update(shift: WorkShiftRecord): WorkShiftRecord;
  findById(organizationId: string, shiftId: string): WorkShiftRecord | null;
  findByCode(organizationId: string, code: string): WorkShiftRecord | null;
  list(organizationId: string, departmentId?: string): readonly WorkShiftRecord[];
};

/** Calendar repository contract (P-012.6). */
export type CalendarRepository = {
  readonly domain: "hcm";
  listHolidayCalendars(organizationId: string): readonly HolidayCalendarRecord[];
  findHolidayCalendar(organizationId: string, calendarId: string): HolidayCalendarRecord | null;
  saveHolidayCalendar(calendar: HolidayCalendarRecord): HolidayCalendarRecord;
  listWorkCalendars(organizationId: string): readonly WorkCalendarRecord[];
  findWorkCalendar(organizationId: string, calendarId: string): WorkCalendarRecord | null;
  saveWorkCalendar(calendar: WorkCalendarRecord): WorkCalendarRecord;
  listOvertime(organizationId: string, employeeId?: string): readonly OvertimeRecord[];
  saveOvertime(record: OvertimeRecord): OvertimeRecord;
  findOvertime(organizationId: string, overtimeId: string): OvertimeRecord | null;
};
