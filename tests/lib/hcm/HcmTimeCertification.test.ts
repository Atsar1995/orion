import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  HCM_ALL_MISSIONS,
  HCM_BASE_PATH,
  HCM_IIL_SERVICE_ID,
  HCM_MISSION_TIME,
  HCM_TIME_CAPABILITIES,
  HCM_TIME_OUTBOUND_EVENTS,
  hcmFacade,
} from "@/lib/hcm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const DOCS_ROOT = join(process.cwd(), "docs", "HCM", "Engineering");

describe("P-012.6 Attendance, Leave & Rostering Certification", () => {
  it("exposes public HCM facade with time domain status", () => {
    const status = hcmFacade.getDomainStatus();
    const bootstrap = hcmFacade.getWorkspaceBootstrap(CONTEXT);

    expect(status.attendanceImplemented).toBe(true);
    expect(status.leaveManagementImplemented).toBe(true);
    expect(status.rosteringImplemented).toBe(true);
    expect(status.organizationImplemented).toBe(true);
    expect(status.payrollFoundationImplemented).toBe(true);
    expect(status.timeApiRoutesImplemented).toBe(true);
    expect(bootstrap.missions).toEqual(HCM_ALL_MISSIONS);
    expect(bootstrap.missions).toContain(HCM_MISSION_TIME);
    expect(bootstrap.iilServiceId).toBe(HCM_IIL_SERVICE_ID);
    expect(bootstrap.basePath).toBe(HCM_BASE_PATH);
  });

  it("includes time capabilities for attendance, leave, and roster", () => {
    expect(HCM_TIME_CAPABILITIES.some((cap) => cap.key === "attendance_recording")).toBe(true);
    expect(HCM_TIME_CAPABILITIES.some((cap) => cap.key === "leave_management")).toBe(true);
    expect(HCM_TIME_CAPABILITIES.some((cap) => cap.key === "roster_planning")).toBe(true);
  });

  it("defines outbound time domain events", () => {
    expect(HCM_TIME_OUTBOUND_EVENTS).toContain("AttendanceRecorded");
    expect(HCM_TIME_OUTBOUND_EVENTS).toContain("LeaveRequested");
    expect(HCM_TIME_OUTBOUND_EVENTS).toContain("LeaveApproved");
    expect(HCM_TIME_OUTBOUND_EVENTS).toContain("OvertimeSubmitted");
    expect(HCM_TIME_OUTBOUND_EVENTS).toContain("ShiftAssigned");
  });

  it("ships HCM time engineering documentation", () => {
    const docs = [
      "P-012.6-Attendance-Guide.md",
      "P-012.6-Leave-Management-Guide.md",
      "P-012.6-Roster-Guide.md",
      "P-012.6-Policy-Configuration-Guide.md",
      "P-012.6-API-Catalogue.md",
      "P-012.6-Event-Catalogue.md",
    ];

    for (const doc of docs) {
      expect(existsSync(join(DOCS_ROOT, doc))).toBe(true);
    }
  });

  it("ships HCM time API routes", () => {
    const routes = [
      "attendance/route.ts",
      "attendance/correct/route.ts",
      "leave/route.ts",
      "leave/actions/route.ts",
      "leave/balance/route.ts",
      "roster/route.ts",
      "roster/publish/route.ts",
      "calendars/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(process.cwd(), "app", "api", "hcm", route))).toBe(true);
    }
  });
});
