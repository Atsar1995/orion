import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { InMemoryEmployeeRepository } from "@/lib/hcm/data/InMemoryEmployeeRepository";
import { seedHcmTimeData } from "@/lib/hcm/data/seed-hcm-time";
import {
  InMemoryAttendanceRepository,
  InMemoryCalendarRepository,
  InMemoryLeaveRepository,
  InMemoryRosterRepository,
  InMemoryShiftRepository,
} from "@/lib/hcm/time/repositories/InMemoryTimeRepository";
import { AttendanceService } from "@/lib/hcm/time/services/AttendanceService";
import { LeaveService } from "@/lib/hcm/time/services/LeaveService";
import { OvertimeService } from "@/lib/hcm/time/services/OvertimeService";
import { RosterService } from "@/lib/hcm/time/services/RosterService";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-hr",
  role: "executive",
};

function createServices(store: InMemoryHcmStore) {
  const employeeRepo = new InMemoryEmployeeRepository(store);
  return {
    attendance: new AttendanceService(new InMemoryAttendanceRepository(store), employeeRepo),
    leave: new LeaveService(new InMemoryLeaveRepository(store), employeeRepo),
    roster: new RosterService(new InMemoryRosterRepository(store), new InMemoryShiftRepository(store)),
    overtime: new OvertimeService(new InMemoryCalendarRepository(store), employeeRepo),
  };
}

describe("HCM Attendance Operations (P-012.6)", () => {
  let store: InMemoryHcmStore;
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    store = new InMemoryHcmStore();
    seedHcmTimeData(store);
    services = createServices(store);
  });

  it("records manual attendance for active employee", () => {
    const record = services.attendance.record(
      {
        employeeId: "emp-hcm-001",
        attendanceDate: "2026-07-31",
        status: "present",
        source: "manual",
        checkInAt: "2026-07-31T09:00:00.000Z",
        checkOutAt: "2026-07-31T18:00:00.000Z",
        workedHours: 8,
      },
      CONTEXT,
    );

    expect(record.status).toBe("present");
    expect(record.employeeId).toBe("emp-hcm-001");
  });

  it("records half-day attendance", () => {
    const record = services.attendance.record(
      {
        employeeId: "emp-hcm-001",
        attendanceDate: "2026-08-01",
        status: "half_day",
        isHalfDay: true,
        workedHours: 4,
      },
      CONTEXT,
    );

    expect(record.isHalfDay).toBe(true);
    expect(record.status).toBe("half_day");
  });

  it("rejects duplicate attendance on same date", () => {
    services.attendance.record(
      { employeeId: "emp-hcm-001", attendanceDate: "2026-08-02", status: "present" },
      CONTEXT,
    );

    expect(() =>
      services.attendance.record(
        { employeeId: "emp-hcm-001", attendanceDate: "2026-08-02", status: "late" },
        CONTEXT,
      ),
    ).toThrow("ATTENDANCE_ALREADY_RECORDED");
  });

  it("creates correction record linked to original", () => {
    const original = services.attendance.record(
      { employeeId: "emp-hcm-001", attendanceDate: "2026-08-03", status: "late" },
      CONTEXT,
    );

    const corrected = services.attendance.correct(
      { attendanceId: original.id, status: "present", workedHours: 8 },
      CONTEXT,
    );

    expect(corrected.correctedFromId).toBe(original.id);
    expect(corrected.source).toBe("correction");
  });
});

describe("HCM Leave Workflow (P-012.6)", () => {
  let store: InMemoryHcmStore;
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    store = new InMemoryHcmStore();
    seedHcmTimeData(store);
    services = createServices(store);
  });

  it("creates pending leave request with workflow instance", () => {
    const request = services.leave.createRequest(
      {
        employeeId: "emp-hcm-001",
        leaveType: "annual",
        startDate: "2026-09-01",
        endDate: "2026-09-03",
        duration: { value: 3, unit: "days" },
      },
      CONTEXT,
    );

    expect(request.status).toBe("pending");
    expect(request.workflowInstanceId).toBeTruthy();
  });

  it("approves leave and deducts balance", () => {
    const before = services.leave.getBalance("emp-hcm-001", "annual", CONTEXT);
    const request = services.leave.createRequest(
      {
        employeeId: "emp-hcm-001",
        leaveType: "annual",
        startDate: "2026-09-10",
        endDate: "2026-09-11",
        duration: { value: 2, unit: "days" },
      },
      CONTEXT,
    );

    services.leave.approve(request.id, CONTEXT, "emp-hcm-mgr");
    const after = services.leave.getBalance("emp-hcm-001", "annual", CONTEXT);

    expect(after!.used).toBe((before?.used ?? 0) + 2);
  });

  it("submits overtime for approval workflow", () => {
    const overtime = services.overtime.submit(
      {
        employeeId: "emp-hcm-001",
        attendanceDate: "2026-07-31",
        category: "weekday",
        hours: 2,
        reason: "Project deadline",
      },
      CONTEXT,
    );

    expect(overtime.status).toBe("pending");
    expect(overtime.workflowInstanceId).toBeTruthy();
  });
});

describe("HCM Roster Operations (P-012.6)", () => {
  let store: InMemoryHcmStore;
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    store = new InMemoryHcmStore();
    seedHcmTimeData(store);
    services = createServices(store);
  });

  it("creates and publishes roster with shift assignments", () => {
    const roster = services.roster.create(
      {
        departmentId: "dept-operations",
        periodStart: "2026-08-01",
        periodEnd: "2026-08-07",
        assignments: [
          { employeeId: "emp-hcm-001", shiftId: "shift-day", rosterDate: "2026-08-01" },
          { employeeId: "emp-hcm-002", shiftId: "shift-evening", rosterDate: "2026-08-01" },
        ],
      },
      CONTEXT,
    );

    const published = services.roster.publish(roster.id, CONTEXT);
    expect(published.status).toBe("published");
    expect(published.assignments).toHaveLength(2);
  });

  it("rejects overlapping shift assignments on same day", () => {
    expect(() =>
      services.roster.create(
        {
          periodStart: "2026-08-01",
          periodEnd: "2026-08-07",
          assignments: [
            { employeeId: "emp-hcm-001", shiftId: "shift-day", rosterDate: "2026-08-02" },
            { employeeId: "emp-hcm-001", shiftId: "shift-evening", rosterDate: "2026-08-02" },
          ],
        },
        CONTEXT,
      ),
    ).toThrow("SHIFT_OVERLAP");
  });
});
