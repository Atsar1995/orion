import type { ServiceContext } from "@/types/services";
import type {
  AttendanceRecord,
  CorrectAttendanceInput,
  RecordAttendanceInput,
  TimeSearchQuery,
} from "@/types/hcm-time";
import { createAttendanceExceptionId, createAttendanceId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTimeEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { AttendanceRepository } from "@/lib/hcm/time/repositories/TimeRepository";
import { TimeRulesEngine } from "@/lib/hcm/time/TimeRulesEngine";

export class AttendanceService {
  private readonly rules = new TimeRulesEngine();

  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  record(input: RecordAttendanceInput, context: ServiceContext): AttendanceRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");
    this.rules.assertEmployeeActive(employee.status);

    const existing = this.attendanceRepository.findByEmployeeDate(
      organizationId,
      input.employeeId,
      input.attendanceDate,
    );
    this.rules.assertNoDuplicateAttendance(existing);

    const now = nowIso();
    const record: AttendanceRecord = {
      id: createAttendanceId(),
      organizationId,
      employeeId: input.employeeId,
      employmentId: input.employmentId,
      departmentId: input.departmentId ?? employee.departmentId,
      attendanceDate: input.attendanceDate,
      status: input.status,
      source: input.source ?? "manual",
      checkInAt: input.checkInAt,
      checkOutAt: input.checkOutAt,
      workedHours: input.workedHours,
      isHalfDay: input.isHalfDay ?? false,
      shiftId: input.shiftId,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    const saved = this.attendanceRepository.create(record);

    if (!input.checkOutAt && input.checkInAt) {
      this.attendanceRepository.createException({
        id: createAttendanceExceptionId(),
        organizationId,
        attendanceId: saved.id,
        exceptionType: "missing_checkout",
        resolved: false,
        createdAt: now,
      });
    }

    publishHcmTimeEvent(
      {
        eventType: "AttendanceRecorded",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { attendanceDate: saved.attendanceDate, status: saved.status },
      },
      context,
    );

    return saved;
  }

  correct(input: CorrectAttendanceInput, context: ServiceContext): AttendanceRecord {
    const organizationId = context.organizationId;
    const original = this.attendanceRepository.findById(organizationId, input.attendanceId);
    if (!original) throw new Error("ATTENDANCE_NOT_FOUND");

    const now = nowIso();
    const corrected: AttendanceRecord = {
      ...original,
      id: createAttendanceId(),
      status: input.status,
      checkInAt: input.checkInAt ?? original.checkInAt,
      checkOutAt: input.checkOutAt ?? original.checkOutAt,
      workedHours: input.workedHours ?? original.workedHours,
      notes: input.notes ?? original.notes,
      source: "correction",
      correctedFromId: original.id,
      updatedAt: now,
    };

    const saved = this.attendanceRepository.create(corrected);

    publishHcmTimeEvent(
      {
        eventType: "AttendanceCorrected",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: {
          correctedFromId: original.id,
          workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.attendanceCorrection,
        },
      },
      context,
    );

    return saved;
  }

  getById(attendanceId: string, context: ServiceContext): AttendanceRecord | null {
    return this.attendanceRepository.findById(context.organizationId, attendanceId);
  }

  search(query: TimeSearchQuery | undefined, context: ServiceContext): readonly AttendanceRecord[] {
    return this.attendanceRepository.search(context.organizationId, query);
  }

  count(query: TimeSearchQuery | undefined, context: ServiceContext): number {
    return this.attendanceRepository.count(context.organizationId, query);
  }
}
