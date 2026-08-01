import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryComplianceRepository } from "@/lib/platform/compliance/repositories/InMemoryComplianceRepository";
import { ComplianceFacade } from "@/lib/platform/compliance";
import { handleComplianceInboundEvent } from "@/lib/platform/compliance/register-compliance-subscribers";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const ADMIN_CONTEXT: ServiceContext = {
  ...CONTEXT,
  userId: "user-org-admin",
  role: "organization_admin",
};

describe("Mission P-010.6 Enterprise Audit & Compliance Platform — Operations", () => {
  let facade: ComplianceFacade;

  beforeEach(() => {
    facade = new ComplianceFacade(new InMemoryComplianceRepository());
  });

  it("lists seeded audit records", () => {
    const result = facade.audit.search(CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(5);
    expect(result.records.length).toBeGreaterThan(0);
  });

  it("records a new immutable audit event", () => {
    const record = facade.audit.record(
      {
        domainKey: "platform",
        entityType: "configuration",
        entityId: "cfg-001",
        action: "configuration_changed",
        sourceService: "platform-config",
        correlationId: "corr-test-001",
      },
      CONTEXT,
    );

    expect(record.id).toMatch(/^aud-/);
    expect(record.integrityHash).toBeTruthy();
    expect(facade.audit.validateIntegrity(record.id, CONTEXT)).toBe(true);
  });

  it("rejects duplicate audit records", () => {
    const input = {
      domainKey: "platform",
      entityType: "configuration",
      entityId: "cfg-dup",
      action: "configuration_changed" as const,
      sourceService: "platform-config",
      correlationId: "corr-dup-001",
    };

    facade.audit.record(input, CONTEXT);
    expect(() => facade.audit.record(input, CONTEXT)).toThrow("DUPLICATE_AUDIT");
  });

  it("searches audits by domain and risk", () => {
    const finance = facade.audit.search(CONTEXT, { domainKey: "finance" });
    expect(finance.records.every((record) => record.domainKey === "finance")).toBe(true);

    const highRisk = facade.audit.search(CONTEXT, { riskClassification: "high" });
    expect(highRisk.records.every((record) => record.riskClassification === "high")).toBe(true);
  });

  it("records entity change history", () => {
    const change = facade.history.recordChange(
      {
        domainKey: "finance",
        entityType: "account",
        entityId: "acct-1000",
        field: "name",
        previousValue: "Cash",
        currentValue: "Cash on Hand",
        correlationId: "corr-chg-001",
      },
      CONTEXT,
    );

    const history = facade.history.getEntityHistory("account", "acct-1000", CONTEXT);
    expect(history.some((entry) => entry.id === change.id)).toBe(true);
  });

  it("records compliance violations", () => {
    const event = facade.compliance.recordEvent(
      {
        category: "security",
        policyReference: "SEC-001",
        description: "Unauthorized access attempt",
        violation: true,
      },
      CONTEXT,
    );

    const dashboard = facade.compliance.getDashboard(CONTEXT);
    expect(dashboard.violationsDetected).toBeGreaterThan(0);
    expect(event.violation).toBe(true);
  });

  it("manages retention policies", () => {
    const policy = facade.retention.upsertPolicy(
      {
        domainKey: "crm",
        entityType: "customer",
        retentionDays: 1095,
        archiveAfterDays: 365,
      },
      ADMIN_CONTEXT,
    );

    expect(policy.retentionDays).toBe(1095);
    expect(facade.retention.listPolicies(CONTEXT).some((entry) => entry.id === policy.id)).toBe(true);
  });

  it("generates audit export records", () => {
    const exportRecord = facade.reporting.exportAudits(CONTEXT, { domainKey: "platform" }, "json");
    expect(exportRecord.recordCount).toBeGreaterThan(0);
    expect(exportRecord.format).toBe("json");
  });

  it("handles inbound compliance events", async () => {
    await handleComplianceInboundEvent(
      "EntityCreated",
      {
        domainKey: "finance",
        entityType: "invoice",
        entityId: "inv-new-001",
        sourceService: "finance-workspace",
        correlationId: "corr-inbound-001",
      },
      CONTEXT,
      facade,
    );

    const result = facade.audit.search(CONTEXT, { entityId: "inv-new-001" });
    expect(result.total).toBe(1);
    expect(result.records[0]?.action).toBe("entity_created");
  });
});
