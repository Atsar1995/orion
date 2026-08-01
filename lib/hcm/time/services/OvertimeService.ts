import type { ServiceContext } from "@/types/services";
import type { OvertimeRecord, SubmitOvertimeInput } from "@/types/hcm-time";
import { createOvertimeId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTimeEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { CalendarRepository } from "@/lib/hcm/time/repositories/TimeRepository";
import { TimeRulesEngine } from "@/lib/hcm/time/TimeRulesEngine";

export class OvertimeService {
  private readonly rules = new TimeRulesEngine();

  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  submit(input: SubmitOvertimeInput, context: ServiceContext): OvertimeRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");
    this.rules.assertEmployeeActive(employee.status);
    if (input.hours <= 0) throw new Error("INVALID_OVERTIME_HOURS");

    const now = nowIso();
    const record: OvertimeRecord = {
      id: createOvertimeId(),
      organizationId,
      employeeId: input.employeeId,
      attendanceDate: input.attendanceDate,
      category: input.category,
      hours: input.hours,
      status: "pending",
      workflowInstanceId: `wf-${createOvertimeId()}`,
      reason: input.reason,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    const saved = this.calendarRepository.saveOvertime(record);

    publishHcmTimeEvent(
      {
        eventType: "OvertimeSubmitted",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: {
          hours: String(saved.hours),
          category: saved.category,
          workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.overtimeApproval,
          workflowInstanceId: saved.workflowInstanceId ?? saved.id,
        },
      },
      context,
    );

    return saved;
  }

  approve(overtimeId: string, context: ServiceContext): OvertimeRecord {
    const organizationId = context.organizationId;
    const record = this.calendarRepository.findOvertime(organizationId, overtimeId);
    if (!record) throw new Error("OVERTIME_NOT_FOUND");
    if (record.status !== "pending") throw new Error("INVALID_OVERTIME_STATUS");

    const updated: OvertimeRecord = {
      ...record,
      status: "approved",
      updatedAt: nowIso(),
    };
    const saved = this.calendarRepository.saveOvertime(updated);

    publishHcmTimeEvent(
      {
        eventType: "OvertimeApproved",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { hours: String(saved.hours) },
      },
      context,
    );

    return saved;
  }

  reject(overtimeId: string, context: ServiceContext): OvertimeRecord {
    const organizationId = context.organizationId;
    const record = this.calendarRepository.findOvertime(organizationId, overtimeId);
    if (!record) throw new Error("OVERTIME_NOT_FOUND");
    if (record.status !== "pending") throw new Error("INVALID_OVERTIME_STATUS");

    const updated: OvertimeRecord = {
      ...record,
      status: "rejected",
      updatedAt: nowIso(),
    };

    return this.calendarRepository.saveOvertime(updated);
  }

  list(employeeId: string | undefined, context: ServiceContext): readonly OvertimeRecord[] {
    return this.calendarRepository.listOvertime(context.organizationId, employeeId);
  }
}
