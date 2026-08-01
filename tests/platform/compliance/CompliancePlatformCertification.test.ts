import { describe, expect, it } from "vitest";
import { complianceFacade, PLATFORM_MISSION_COMPLIANCE } from "@/lib/platform/compliance";
import { COMPLIANCE_INBOUND_EVENTS, COMPLIANCE_OUTBOUND_EVENTS } from "@/lib/platform/compliance/compliance-events";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-010.6 Enterprise Audit & Compliance Platform — Certification", () => {
  it("declares mission identifier P-010.6", () => {
    expect(PLATFORM_MISSION_COMPLIANCE).toBe("P-010.6");
  });

  it("exposes only approved public services via facade", () => {
    expect(complianceFacade.audit).toBeDefined();
    expect(complianceFacade.compliance).toBeDefined();
    expect(complianceFacade.history).toBeDefined();
    expect(complianceFacade.retention).toBeDefined();
    expect(complianceFacade.reporting).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(complianceFacade, "repository")).toBe(false);
  });

  it("supports required inbound and outbound events", () => {
    expect(COMPLIANCE_INBOUND_EVENTS).toContain("WorkflowCompleted");
    expect(COMPLIANCE_INBOUND_EVENTS).toContain("JournalPosted");
    expect(COMPLIANCE_OUTBOUND_EVENTS).toContain("AuditRecorded");
    expect(COMPLIANCE_OUTBOUND_EVENTS).toContain("AuditExportGenerated");
  });

  it("enforces organization isolation", () => {
    const otherOrg: ServiceContext = { ...CONTEXT, organizationId: "org-other" };
    const result = complianceFacade.audit.search(otherOrg);
    expect(result.total).toBe(0);
  });

  it("provides compliance and reporting dashboards", () => {
    const complianceDashboard = complianceFacade.compliance.getDashboard(CONTEXT);
    expect(complianceDashboard.totalAuditRecords).toBeGreaterThan(0);
    expect(complianceDashboard.retentionPolicies).toBeGreaterThan(0);

    const reportingDashboard = complianceFacade.reporting.getDashboard(CONTEXT);
    expect(reportingDashboard.totalEvents).toBeGreaterThan(0);
    expect(Object.keys(reportingDashboard.byDomain).length).toBeGreaterThan(0);
  });

  it("validates audit integrity for seeded records", () => {
    const search = complianceFacade.audit.search(CONTEXT, { pageSize: 1 });
    const auditId = search.records[0]?.id;
    expect(auditId).toBeTruthy();
    if (auditId) {
      expect(complianceFacade.audit.validateIntegrity(auditId, CONTEXT)).toBe(true);
    }
  });
});
