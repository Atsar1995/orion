/**
 * HCM Attendance, Leave & Rostering types (Mission P-012.6).
 */

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half_day"
  | "remote"
  | "on_leave"
  | "holiday"
  | "corrected";

export type LeaveType =
  | "annual"
  | "sick"
  | "unpaid"
  | "compensatory"
  | "maternity"
  | "paternity"
  | "study"
  | "other";

export type LeaveDuration = {
  readonly value: number;
  readonly unit: "hours" | "days";
};

export type ShiftPattern = {
  readonly code: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly breakMinutes?: number;
};

export type WorkingHours = {
  readonly monday?: number;
  readonly tuesday?: number;
  readonly wednesday?: number;
  readonly thursday?: number;
  readonly friday?: number;
  readonly saturday?: number;
  readonly sunday?: number;
};

export type CalendarDate = string;

export type OvertimeCategory = "weekday" | "weekend" | "holiday" | "night";

export type AttendanceSource = "manual" | "biometric" | "mobile" | "remote" | "correction";

export type LeaveRequestStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled";

export type OvertimeStatus = "draft" | "pending" | "approved" | "rejected";

export type RosterStatus = "draft" | "published" | "archived";

export type AttendanceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly employmentId?: string;
  readonly departmentId?: string;
  readonly attendanceDate: CalendarDate;
  readonly status: AttendanceStatus;
  readonly source: AttendanceSource;
  readonly checkInAt?: string;
  readonly checkOutAt?: string;
  readonly workedHours?: number;
  readonly isHalfDay: boolean;
  readonly shiftId?: string;
  readonly notes?: string;
  readonly correctedFromId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type WorkShiftRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly pattern: ShiftPattern;
  readonly departmentId?: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RosterAssignment = {
  readonly employeeId: string;
  readonly shiftId: string;
  readonly rosterDate: CalendarDate;
};

export type RosterRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly departmentId?: string;
  readonly periodStart: CalendarDate;
  readonly periodEnd: CalendarDate;
  readonly status: RosterStatus;
  readonly assignments: readonly RosterAssignment[];
  readonly publishedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type LeaveRequestRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly employmentId?: string;
  readonly leaveType: LeaveType;
  readonly status: LeaveRequestStatus;
  readonly startDate: CalendarDate;
  readonly endDate: CalendarDate;
  readonly duration: LeaveDuration;
  readonly partialDay: boolean;
  readonly halfDayPeriod?: "am" | "pm";
  readonly reason?: string;
  readonly workflowInstanceId?: string;
  readonly approverId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type LeaveBalanceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly leaveType: LeaveType;
  readonly accrued: number;
  readonly used: number;
  readonly carriedForward: number;
  readonly unit: "days" | "hours";
  readonly asOfDate: CalendarDate;
  readonly updatedAt: string;
};

export type LeavePolicyRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly leaveType: LeaveType;
  readonly accrualRatePerMonth: number;
  readonly maxCarryForward: number;
  readonly requiresApproval: boolean;
  readonly allowPartialDay: boolean;
  readonly active: boolean;
};

export type HolidayCalendarRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly year: number;
  readonly holidays: readonly { readonly date: CalendarDate; readonly name: string }[];
  readonly active: boolean;
};

export type WorkCalendarRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly workingHours: WorkingHours;
  readonly weekStartsOn: "monday" | "sunday";
  readonly active: boolean;
};

export type OvertimeRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeId: string;
  readonly attendanceDate: CalendarDate;
  readonly category: OvertimeCategory;
  readonly hours: number;
  readonly status: OvertimeStatus;
  readonly workflowInstanceId?: string;
  readonly reason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

export type AttendanceExceptionRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly attendanceId: string;
  readonly exceptionType: "missing_checkout" | "late_arrival" | "early_departure" | "policy_violation";
  readonly resolved: boolean;
  readonly notes?: string;
  readonly createdAt: string;
};

export type RecordAttendanceInput = {
  readonly employeeId: string;
  readonly employmentId?: string;
  readonly departmentId?: string;
  readonly attendanceDate: CalendarDate;
  readonly status: AttendanceStatus;
  readonly source?: AttendanceSource;
  readonly checkInAt?: string;
  readonly checkOutAt?: string;
  readonly workedHours?: number;
  readonly isHalfDay?: boolean;
  readonly shiftId?: string;
  readonly notes?: string;
};

export type CorrectAttendanceInput = {
  readonly attendanceId: string;
  readonly status: AttendanceStatus;
  readonly checkInAt?: string;
  readonly checkOutAt?: string;
  readonly workedHours?: number;
  readonly notes?: string;
};

export type CreateLeaveRequestInput = {
  readonly employeeId: string;
  readonly employmentId?: string;
  readonly leaveType: LeaveType;
  readonly startDate: CalendarDate;
  readonly endDate: CalendarDate;
  readonly duration: LeaveDuration;
  readonly partialDay?: boolean;
  readonly halfDayPeriod?: "am" | "pm";
  readonly reason?: string;
};

export type CreateShiftInput = {
  readonly code: string;
  readonly name: string;
  readonly pattern: ShiftPattern;
  readonly departmentId?: string;
};

export type CreateRosterInput = {
  readonly departmentId?: string;
  readonly periodStart: CalendarDate;
  readonly periodEnd: CalendarDate;
  readonly assignments: readonly RosterAssignment[];
};

export type SubmitOvertimeInput = {
  readonly employeeId: string;
  readonly attendanceDate: CalendarDate;
  readonly category: OvertimeCategory;
  readonly hours: number;
  readonly reason?: string;
};

export type TimeSearchQuery = {
  readonly employeeId?: string;
  readonly departmentId?: string;
  readonly dateFrom?: CalendarDate;
  readonly dateTo?: CalendarDate;
  readonly shiftId?: string;
  readonly attendanceStatus?: AttendanceStatus;
  readonly leaveStatus?: LeaveRequestStatus;
  readonly managerId?: string;
  readonly page?: number;
  readonly pageSize?: number;
};

export type PublishHcmTimeEventInput = {
  readonly eventType:
    | "AttendanceRecorded"
    | "AttendanceCorrected"
    | "ShiftAssigned"
    | "ShiftChanged"
    | "LeaveRequested"
    | "LeaveApproved"
    | "LeaveRejected"
    | "LeaveCancelled"
    | "OvertimeSubmitted"
    | "OvertimeApproved";
  readonly entityId: string;
  readonly employeeId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
