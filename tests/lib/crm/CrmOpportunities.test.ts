import { describe, expect, it } from "vitest";
import {
  CRM_OPPORTUNITY_RECORDS,
  resolveOpportunityHealthLabel,
  resolveOpportunityPriorityLabel,
} from "@/lib/crm/data/opportunity-records";
import { InMemoryCrmRepository, CrmService } from "@/lib/crm";
import {
  findOpportunityRecordById,
  getOpenOpportunityRecords,
  groupOpportunitiesByStage,
  queryOpportunityRecords,
} from "@/lib/crm/services/opportunities/opportunity-query";

describe("resolveOpportunityHealthLabel", () => {
  it("maps stage and signals to executive health labels", () => {
    expect(
      resolveOpportunityHealthLabel({ stage: "Won", probability: 100, customerHealthScore: 90 }),
    ).toBe("Closed Won");
    expect(
      resolveOpportunityHealthLabel({ stage: "Lost", probability: 0, customerHealthScore: 50 }),
    ).toBe("Closed Lost");
    expect(
      resolveOpportunityHealthLabel({ stage: "Negotiation", probability: 85, customerHealthScore: 91 }),
    ).toBe("Healthy");
    expect(
      resolveOpportunityHealthLabel({ stage: "Qualified", probability: 40, customerHealthScore: 52 }),
    ).toBe("High Risk");
    expect(
      resolveOpportunityHealthLabel({ stage: "Proposal", probability: 55, customerHealthScore: 68 }),
    ).toBe("Needs Attention");
  });
});

describe("resolveOpportunityPriorityLabel", () => {
  it("maps priority score to executive tiers", () => {
    expect(resolveOpportunityPriorityLabel(88)).toBe("High");
    expect(resolveOpportunityPriorityLabel(55)).toBe("Medium");
    expect(resolveOpportunityPriorityLabel(35)).toBe("Low");
  });
});

describe("queryOpportunityRecords", () => {
  it("filters, sorts, and paginates opportunity records", () => {
    const pageOne = queryOpportunityRecords(CRM_OPPORTUNITY_RECORDS, {
      page: 1,
      pageSize: 5,
      sortField: "name",
      sortDirection: "asc",
    });

    expect(pageOne.items).toHaveLength(5);
    expect(pageOne.total).toBe(12);
    expect(pageOne.totalPages).toBe(3);

    const filtered = queryOpportunityRecords(CRM_OPPORTUNITY_RECORDS, {
      search: "OranIA",
      filters: { stage: "Negotiation" },
    });

    expect(filtered.items).toHaveLength(1);
    expect(filtered.items[0]?.name).toBe("OranIA Group — Enterprise Renewal");
  });

  it("finds opportunity by id", () => {
    const opportunity = findOpportunityRecordById(
      CRM_OPPORTUNITY_RECORDS,
      "commerce-platform-expansion",
    );
    expect(opportunity?.customer).toBe("Commerce Partner Ltd");
  });

  it("groups opportunities by pipeline stage", () => {
    const columns = groupOpportunitiesByStage(CRM_OPPORTUNITY_RECORDS, {
      filters: { stage: "all" },
    });

    expect(columns.Lead.length).toBeGreaterThan(0);
    expect(columns.Negotiation.some((item) => item.id === "orania-enterprise-renewal")).toBe(true);
  });

  it("returns only open opportunities", () => {
    const openRecords = getOpenOpportunityRecords(CRM_OPPORTUNITY_RECORDS);
    expect(openRecords.every((record) => record.stage !== "Won" && record.stage !== "Lost")).toBe(
      true,
    );
  });
});

describe("CrmService opportunities", () => {
  it("returns opportunity workspace metrics and recommendations", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const workspace = service.getOpportunityWorkspace();

    expect(workspace.metrics.openOpportunities).toBeGreaterThan(0);
    expect(workspace.recommendations.length).toBe(4);
    expect(workspace.records.length).toBe(12);
  });

  it("returns opportunity detail with activity", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const detail = service.getOpportunityDetail("orania-enterprise-renewal");

    expect(detail?.opportunity.stage).toBe("Negotiation");
    expect(detail?.recentActivity.length).toBeGreaterThan(0);
  });
});
