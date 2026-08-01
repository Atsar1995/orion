import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import { InMemoryEmployeeRepository } from "@/lib/hcm/data/InMemoryEmployeeRepository";
import { seedHcmTimeData } from "@/lib/hcm/data/seed-hcm-time";
import {
  InMemoryAttendanceRepository,
  InMemoryLeaveRepository,
} from "@/lib/hcm/time/repositories/InMemoryTimeRepository";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-hr",
  role: "executive",
};

describe("HCM Time Repository (P-012.6)", () => {
  let store: InMemoryHcmStore;
  let attendanceRepo: InMemoryAttendanceRepository;
  let leaveRepo: InMemoryLeaveRepository;

  beforeEach(() => {
    store = new InMemoryHcmStore();
    seedHcmTimeData(store);
    attendanceRepo = new InMemoryAttendanceRepository(store);
    leaveRepo = new InMemoryLeaveRepository(store);
  });

  it("stores and retrieves attendance by employee date", () => {
    const record = attendanceRepo.create({
      id: "att-test-1",
      organizationId: CONTEXT.organizationId,
      employeeId: "emp-hcm-001",
      attendanceDate: "2026-07-31",
      status: "present",
      source: "manual",
      isHalfDay: false,
      createdAt: "2026-07-31T09:00:00.000Z",
      updatedAt: "2026-07-31T09:00:00.000Z",
      createdBy: "user-hr",
    });

    expect(attendanceRepo.findByEmployeeDate(CONTEXT.organizationId, "emp-hcm-001", "2026-07-31")).toEqual(record);
  });

  it("searches leave requests by employee and status", () => {
    leaveRepo.createRequest({
      id: "leave-test-1",
      organizationId: CONTEXT.organizationId,
      employeeId: "emp-hcm-001",
      leaveType: "annual",
      status: "pending",
      startDate: "2026-08-01",
      endDate: "2026-08-03",
      duration: { value: 3, unit: "days" },
      partialDay: false,
      createdAt: "2026-07-31T09:00:00.000Z",
      updatedAt: "2026-07-31T09:00:00.000Z",
      createdBy: "user-hr",
    });

    const results = leaveRepo.searchRequests(CONTEXT.organizationId, {
      employeeId: "emp-hcm-001",
      leaveStatus: "pending",
    });
    expect(results).toHaveLength(1);
  });

  it("resolves leave balance by employee and type", () => {
    const balance = leaveRepo.getBalance(CONTEXT.organizationId, "emp-hcm-001", "annual");
    expect(balance?.accrued).toBe(21);
    expect(balance?.used).toBe(3);
  });

  it("finds employees in seeded store", () => {
    const employeeRepo = new InMemoryEmployeeRepository(store);
    const employee = employeeRepo.findById(CONTEXT.organizationId, "emp-hcm-001");
    expect(employee?.employeeNumber).toBe("E-1001");
  });
});
