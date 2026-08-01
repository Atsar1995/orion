import type { ServiceContext } from "@/types/services";
import type {
  CreateLeaveRequestInput,
  LeaveBalanceRecord,
  LeavePolicyRecord,
  LeaveRequestRecord,
  TimeSearchQuery,
} from "@/types/hcm-time";
import { createLeaveBalanceId, createLeaveRequestId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { HCM_WORKFLOW_TEMPLATES } from "@/lib/hcm/constants";
import { publishHcmTimeEvent } from "@/lib/hcm/hcm-events";
import type { EmployeeRepository } from "@/lib/hcm/employees/repositories/EmployeeRepository";
import type { LeaveRepository } from "@/lib/hcm/time/repositories/TimeRepository";
import { TimeRulesEngine } from "@/lib/hcm/time/TimeRulesEngine";

export class LeaveService {
  private readonly rules = new TimeRulesEngine();

  constructor(
    private readonly leaveRepository: LeaveRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  createRequest(input: CreateLeaveRequestInput, context: ServiceContext): LeaveRequestRecord {
    const organizationId = context.organizationId;
    const employee = this.employeeRepository.findById(organizationId, input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");
    this.rules.assertEmployeeActive(employee.status);
    this.rules.assertValidLeaveDates(input.startDate, input.endDate);

    const policy = this.leaveRepository.findPolicy(organizationId, input.leaveType);
    this.rules.assertPartialDayAllowed(policy, input.partialDay ?? false);

    const balance = this.leaveRepository.getBalance(organizationId, input.employeeId, input.leaveType);
    if (balance) {
      this.rules.assertSufficientBalance(balance, input.duration);
    }

    const now = nowIso();
    const status = policy?.requiresApproval === false ? "approved" : "pending";
    const request: LeaveRequestRecord = {
      id: createLeaveRequestId(),
      organizationId,
      employeeId: input.employeeId,
      employmentId: input.employmentId,
      leaveType: input.leaveType,
      status,
      startDate: input.startDate,
      endDate: input.endDate,
      duration: input.duration,
      partialDay: input.partialDay ?? false,
      halfDayPeriod: input.halfDayPeriod,
      reason: input.reason,
      workflowInstanceId: status === "pending" ? `wf-${createLeaveRequestId()}` : undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId ?? "system",
    };

    const saved = this.leaveRepository.createRequest(request);

    if (status === "pending") {
      publishHcmTimeEvent(
        {
          eventType: "LeaveRequested",
          entityId: saved.id,
          employeeId: saved.employeeId,
          payload: {
            leaveType: saved.leaveType,
            workflowTemplateKey: HCM_WORKFLOW_TEMPLATES.leaveApproval,
            workflowInstanceId: saved.workflowInstanceId ?? saved.id,
          },
        },
        context,
      );
    } else {
      this.deductBalance(saved, context);
      publishHcmTimeEvent(
        {
          eventType: "LeaveApproved",
          entityId: saved.id,
          employeeId: saved.employeeId,
          payload: { leaveType: saved.leaveType, autoApproved: "true" },
        },
        context,
      );
    }

    return saved;
  }

  approve(requestId: string, context: ServiceContext, approverId?: string): LeaveRequestRecord {
    const organizationId = context.organizationId;
    const request = this.leaveRepository.findRequest(organizationId, requestId);
    if (!request) throw new Error("LEAVE_REQUEST_NOT_FOUND");
    if (request.status !== "pending") throw new Error("INVALID_LEAVE_STATUS");

    const updated: LeaveRequestRecord = {
      ...request,
      status: "approved",
      approverId: approverId ?? context.userId ?? "system",
      updatedAt: nowIso(),
    };
    const saved = this.leaveRepository.updateRequest(updated);
    this.deductBalance(saved, context);

    publishHcmTimeEvent(
      {
        eventType: "LeaveApproved",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { leaveType: saved.leaveType, approverId: saved.approverId ?? "" },
      },
      context,
    );

    return saved;
  }

  reject(requestId: string, context: ServiceContext, approverId?: string): LeaveRequestRecord {
    const organizationId = context.organizationId;
    const request = this.leaveRepository.findRequest(organizationId, requestId);
    if (!request) throw new Error("LEAVE_REQUEST_NOT_FOUND");
    if (request.status !== "pending") throw new Error("INVALID_LEAVE_STATUS");

    const updated: LeaveRequestRecord = {
      ...request,
      status: "rejected",
      approverId: approverId ?? context.userId ?? "system",
      updatedAt: nowIso(),
    };
    const saved = this.leaveRepository.updateRequest(updated);

    publishHcmTimeEvent(
      {
        eventType: "LeaveRejected",
        entityId: saved.id,
        employeeId: saved.employeeId,
        payload: { leaveType: saved.leaveType },
      },
      context,
    );

    return saved;
  }

  cancel(requestId: string, context: ServiceContext): LeaveRequestRecord {
    const organizationId = context.organizationId;
    const request = this.leaveRepository.findRequest(organizationId, requestId);
    if (!request) throw new Error("LEAVE_REQUEST_NOT_FOUND");
    if (request.status === "cancelled") throw new Error("INVALID_LEAVE_STATUS");

    const updated: LeaveRequestRecord = {
      ...request,
      status: "cancelled",
      updatedAt: nowIso(),
    };
    const saved = this.leaveRepository.updateRequest(updated);

    publishHcmTimeEvent(
      {
        eventType: "LeaveCancelled",
        entityId: saved.id,
        employeeId: saved.employeeId,
      },
      context,
    );

    return saved;
  }

  getBalance(employeeId: string, leaveType: string, context: ServiceContext): LeaveBalanceRecord | null {
    return this.leaveRepository.getBalance(context.organizationId, employeeId, leaveType);
  }

  listPolicies(context: ServiceContext): readonly LeavePolicyRecord[] {
    return this.leaveRepository.listPolicies(context.organizationId);
  }

  accrueBalance(
    employeeId: string,
    leaveType: string,
    months: number,
    context: ServiceContext,
  ): LeaveBalanceRecord {
    const organizationId = context.organizationId;
    const policy = this.leaveRepository.findPolicy(organizationId, leaveType);
    if (!policy) throw new Error("LEAVE_POLICY_NOT_FOUND");

    const accrual = this.rules.computeAccrual(policy, months);
    const existing =
      this.leaveRepository.getBalance(organizationId, employeeId, leaveType) ??
      ({
        id: createLeaveBalanceId(),
        organizationId,
        employeeId,
        leaveType: leaveType as LeaveBalanceRecord["leaveType"],
        accrued: 0,
        used: 0,
        carriedForward: 0,
        unit: "days",
        asOfDate: new Date().toISOString().slice(0, 10),
        updatedAt: nowIso(),
      } satisfies LeaveBalanceRecord);

    const updated: LeaveBalanceRecord = {
      ...existing,
      accrued: existing.accrued + accrual,
      asOfDate: new Date().toISOString().slice(0, 10),
      updatedAt: nowIso(),
    };

    return this.leaveRepository.saveBalance(updated);
  }

  carryForward(
    employeeId: string,
    leaveType: string,
    context: ServiceContext,
  ): LeaveBalanceRecord {
    const organizationId = context.organizationId;
    const policy = this.leaveRepository.findPolicy(organizationId, leaveType);
    if (!policy) throw new Error("LEAVE_POLICY_NOT_FOUND");

    const balance = this.leaveRepository.getBalance(organizationId, employeeId, leaveType);
    if (!balance) throw new Error("LEAVE_BALANCE_NOT_FOUND");

    const available = this.rules.computeAvailableBalance(balance);
    const carried = this.rules.applyCarryForward(available, policy.maxCarryForward);

    const updated: LeaveBalanceRecord = {
      ...balance,
      carriedForward: carried,
      used: 0,
      accrued: 0,
      asOfDate: new Date().toISOString().slice(0, 10),
      updatedAt: nowIso(),
    };

    return this.leaveRepository.saveBalance(updated);
  }

  searchRequests(query: TimeSearchQuery | undefined, context: ServiceContext): readonly LeaveRequestRecord[] {
    return this.leaveRepository.searchRequests(context.organizationId, query);
  }

  private deductBalance(request: LeaveRequestRecord, context: ServiceContext): void {
    const balance = this.leaveRepository.getBalance(
      context.organizationId,
      request.employeeId,
      request.leaveType,
    );
    if (!balance) return;

    const updated: LeaveBalanceRecord = {
      ...balance,
      used: balance.used + request.duration.value,
      updatedAt: nowIso(),
    };
    this.leaveRepository.saveBalance(updated);
  }
}
