import { beforeEach, describe, expect, it } from "vitest";
import { createCrmWiring } from "@/lib/crm/createCrmWiring";
import {
  crmAgreementsService,
  crmCommercialService,
  crmPartyService,
} from "@/lib/crm";
import { CRM_CANONICAL_EVENT_VERSION } from "@/lib/crm/events";
import { CRM_SEED_ORG_ID } from "@/lib/crm/persistence/createCrmStore";
import {
  getIntelligenceIntegrationService,
  resetIntelligenceIntegrationForTests,
} from "@/lib/platform/intelligence";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: CRM_SEED_ORG_ID,
  workspaceId: "workspace-orania",
  userId: "user-crm-workflow",
  role: "organization_admin",
};

const OTHER_CONTEXT: ServiceContext = {
  ...CONTEXT,
  organizationId: "org-other",
};

const SAMPLE_PRICING = {
  currency: "INR",
  lineItems: [{ id: "line-1", description: "Platform Subscription", quantity: 1, unitPrice: 250000, taxPercent: 18 }],
  subtotal: 250000,
  discountTotal: 0,
  taxTotal: 45000,
  total: 295000,
};

function canonicalEvents(context: ServiceContext = CONTEXT) {
  return getIntelligenceIntegrationService()
    .listEvents(context, 100)
    .filter((entry) => entry.payload.canonicalEventType);
}

function countCanonical(type: string, context: ServiceContext = CONTEXT): number {
  return canonicalEvents(context).filter((entry) => entry.payload.canonicalEventType === type).length;
}

describe("CRM Workflow Canonical Event Emission (P-008.15)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("publishes crm.lead.created after successful lead creation", () => {
    const before = countCanonical("crm.lead.created");

    const lead = crmCommercialService.leads.create(
      {
        displayName: "Workflow Lead",
        source: "website",
        owner: "Sales Director",
      },
      CONTEXT,
    );

    const events = canonicalEvents().filter((entry) => entry.payload.leadId === lead.id);
    expect(countCanonical("crm.lead.created")).toBe(before + 1);
    expect(events[0]?.payload.eventVersion).toBe(CRM_CANONICAL_EVENT_VERSION);
    expect(events[0]?.payload.sourceDomain).toBe("crm");
    expect(events[0]?.correlationId).toBe(lead.id);
  });

  it("does not publish when lead creation rolls back on validation failure", () => {
    const before = countCanonical("crm.lead.created");

    expect(() =>
      crmCommercialService.leads.create(
        {
          displayName: "   ",
          source: "website",
          owner: "Sales Director",
        },
        CONTEXT,
      ),
    ).toThrow("INVALID_LEAD_NAME");

    expect(countCanonical("crm.lead.created")).toBe(before);
  });

  it("publishes crm.lead.qualified after lead qualification", () => {
    const lead = crmCommercialService.leads.create(
      {
        displayName: "Qualify Workflow Lead",
        source: "referral",
        owner: "Sales Director",
      },
      CONTEXT,
    );

    crmCommercialService.leads.qualify(lead.id, CONTEXT);

    const qualified = canonicalEvents().find(
      (entry) =>
        entry.payload.canonicalEventType === "crm.lead.qualified" &&
        entry.payload.leadId === lead.id,
    );
    expect(qualified).toBeTruthy();
  });

  it("publishes crm.opportunity.created and crm.opportunity.closed", () => {
    const opportunity = crmCommercialService.opportunities.create(
      {
        name: "Workflow Opportunity",
        partyId: "org-party-global-suppliers-co",
        owner: "Sales Director",
        valueAmount: 500000,
        probability: 40,
        expectedClose: "2026-09-30",
      },
      CONTEXT,
    );

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "crm.opportunity.created" &&
          entry.payload.opportunityId === opportunity.id,
      ),
    ).toBe(true);

    crmCommercialService.opportunities.modify(opportunity.id, { stage: "won" }, CONTEXT);

    const closed = canonicalEvents().find(
      (entry) =>
        entry.payload.canonicalEventType === "crm.opportunity.closed" &&
        entry.payload.opportunityId === opportunity.id,
    );
    expect(closed?.payload.outcome).toBe("won");
    expect(closed?.payload.amount).toBe("500000");
  });

  it("publishes crm.quote.created after quotation creation", () => {
    const quote = crmAgreementsService.quotations.create(
      {
        partyId: "org-party-global-suppliers-co",
        owner: "Sales Director",
        pricing: SAMPLE_PRICING,
        validFrom: "2026-08-01",
        validTo: "2026-09-30",
      },
      CONTEXT,
    );

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "crm.quote.created" &&
          entry.payload.quoteId === quote.id,
      ),
    ).toBe(true);
  });

  it("publishes customer created and updated events for customer parties", () => {
    const created = crmPartyService.organisations.create(
      {
        displayName: "Workflow Customer Org",
        organisationType: "corporate_account",
        roles: ["customer"],
      },
      CONTEXT,
    );

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "crm.customer.created" &&
          entry.payload.customerId === created.id,
      ),
    ).toBe(true);

    crmPartyService.organisations.modify(created.id, { industry: "Technology" }, CONTEXT);

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "crm.customer.updated" &&
          entry.payload.customerId === created.id,
      ),
    ).toBe(true);
  });

  it("publishes sales order and revenue events when a contract is signed", () => {
    const contract = crmAgreementsService.contracts.create(
      {
        partyId: "org-party-global-suppliers-co",
        title: "Workflow Contract",
        contractType: "corporate",
        owner: "Sales Director",
        pricing: SAMPLE_PRICING,
        effectiveFrom: "2026-08-01",
        effectiveTo: "2027-07-31",
      },
      CONTEXT,
    );

    crmAgreementsService.contracts.sign(contract.id, CONTEXT, "Executive");

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "crm.salesorder.confirmed" &&
          entry.payload.salesOrderId === contract.id,
      ),
    ).toBe(true);

    expect(
      canonicalEvents().some(
        (entry) =>
          entry.payload.canonicalEventType === "crm.revenue.recognized" &&
          entry.payload.salesOrderId === contract.id &&
          entry.payload.amount === "295000",
      ),
    ).toBe(true);
  });

  it("publishes crm.case.closed after successful case closure via wiring", () => {
    const wiring = createCrmWiring(new InMemoryPlatformStore());
    const caseId = "case-workflow-001";

    wiring.caseService.register({
      id: caseId,
      organizationId: CRM_SEED_ORG_ID,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    wiring.caseService.close(caseId, CONTEXT, "resolved");

    expect(
      getIntelligenceIntegrationService()
        .listEvents(CONTEXT, 20)
        .some(
          (entry) =>
            entry.payload.canonicalEventType === "crm.case.closed" &&
            entry.payload.caseId === caseId,
        ),
    ).toBe(true);
  });

  it("isolates canonical events by organization", () => {
    crmCommercialService.leads.create(
      {
        displayName: "Org A Lead",
        source: "website",
        owner: "Sales Director",
      },
      CONTEXT,
    );

    crmCommercialService.leads.create(
      {
        displayName: "Org B Lead",
        source: "website",
        owner: "Sales Director",
      },
      OTHER_CONTEXT,
    );

    expect(countCanonical("crm.lead.created", CONTEXT)).toBe(1);
    expect(countCanonical("crm.lead.created", OTHER_CONTEXT)).toBe(1);
  });

  it("suppresses duplicate canonical publication for the same business action", () => {
    const lead = crmCommercialService.leads.create(
      {
        displayName: "Duplicate Guard Lead",
        source: "website",
        owner: "Sales Director",
      },
      CONTEXT,
    );

    expect(() => crmCommercialService.leads.qualify(lead.id, CONTEXT)).not.toThrow();
    expect(() => crmCommercialService.leads.qualify(lead.id, CONTEXT)).not.toThrow();

    const qualified = canonicalEvents().filter(
      (entry) =>
        entry.payload.canonicalEventType === "crm.lead.qualified" &&
        entry.payload.leadId === lead.id,
    );
    expect(qualified).toHaveLength(1);
  });

  it("wires canonical publisher through createCrmWiring services", () => {
    const wiring = createCrmWiring(new InMemoryPlatformStore());

    expect(wiring.canonicalEventPublisher).toBeDefined();
    expect(wiring.salesOrderService).toBeDefined();
    expect(wiring.caseService).toBeDefined();

    const lead = wiring.commercialFacade.leads.create(
      {
        displayName: "Wiring Lead",
        source: "campaign",
        owner: "Sales Director",
      },
      CONTEXT,
    );

    expect(
      getIntelligenceIntegrationService()
        .listEvents(CONTEXT, 20)
        .some(
          (entry) =>
            entry.payload.canonicalEventType === "crm.lead.created" &&
            entry.payload.leadId === lead.id,
        ),
    ).toBe(true);
  });
});
