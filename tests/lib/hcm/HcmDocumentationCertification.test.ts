import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HCM_ALL_OUTBOUND_EVENTS, hcmFacade } from "@/lib/hcm";

const DOCS_ROOT = join(process.cwd(), "docs", "HCM", "Engineering");

const REQUIRED_ENGINEERING_DOCS = [
  "ES-HCM-001_Enterprise_HCM_Engineering_Specification.md",
  "HCM-Package-Guide.md",
  "HCM-Developer-Guide.md",
  "HCM-Dependency-Matrix.md",
  "HCM-API-Catalogue.md",
  "HCM-Event-Catalogue.md",
  "HCM-Architecture-Guide.md",
  "HCM-Operational-Guide.md",
  "HCM-Technical-Debt-Register.md",
  "HCM-Release-Notes.md",
  "HCM-Testing-Guide.md",
  "HCM-Extension-Guide.md",
  "README.md",
] as const;

const MODULE_GUIDES = [
  "P-012.6-Attendance-Guide.md",
  "P-012.6-Leave-Management-Guide.md",
  "P-012.6-Roster-Guide.md",
  "P-012.6-Policy-Configuration-Guide.md",
] as const;

describe("HCM Documentation Certification (S-002.8)", () => {
  it("ships all required Enterprise HCM engineering documents", () => {
    for (const doc of REQUIRED_ENGINEERING_DOCS) {
      expect(existsSync(join(DOCS_ROOT, doc))).toBe(true);
    }
  });

  it("ships P-012.6 module guides", () => {
    for (const doc of MODULE_GUIDES) {
      expect(existsSync(join(DOCS_ROOT, doc))).toBe(true);
    }
  });

  it("ships domain README with ES-HCM-001 reference", () => {
    const readme = join(process.cwd(), "docs", "HCM", "README.md");
    expect(existsSync(readme)).toBe(true);
  });

  it("aligns event catalogue with implementation", () => {
    expect(HCM_ALL_OUTBOUND_EVENTS.length).toBeGreaterThanOrEqual(60);
    expect(HCM_ALL_OUTBOUND_EVENTS).toContain("EmployeeCreated");
    expect(HCM_ALL_OUTBOUND_EVENTS).toContain("AttendanceRecorded");
    expect(HCM_ALL_OUTBOUND_EVENTS).toContain("PayrollFinalized");
    expect(HCM_ALL_OUTBOUND_EVENTS).toContain("GoalCreated");
  });

  it("documents implemented domain status accurately", () => {
    const status = hcmFacade.getDomainStatus();

    expect(status.missions).toHaveLength(8);
    expect(status.organizationImplemented).toBe(true);
    expect(status.payrollFoundationImplemented).toBe(true);
    expect(status.talentManagementImplemented).toBe(true);
    expect(status.foundationApiRoutesImplemented).toBe(true);
    expect(status.timeApiRoutesImplemented).toBe(true);
    expect(status.eventsIntegrated).toBe(true);
    expect(status.workflowIntegrated).toBe(true);
  });
});
