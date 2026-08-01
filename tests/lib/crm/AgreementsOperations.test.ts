import { describe, expect, it } from "vitest";
import {
  crmAgreementsService,
  crmService,
  mapCrmAgreementsBriefSignals,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const SAMPLE_PRICING = {
  currency: "INR",
  lineItems: [{ id: "line-1", description: "Test Item", quantity: 1, unitPrice: 100000, taxPercent: 18 }],
  subtotal: 100000,
  discountTotal: 0,
  taxTotal: 18000,
  total: 118000,
};

describe("Proposal, Contract & Commercial Agreements Platform (Mission P-008.3)", () => {
  it("lists proposals with lifecycle statuses and version control", () => {
    const proposals = crmAgreementsService.proposals.list(CONTEXT);
    expect(proposals.length).toBeGreaterThanOrEqual(3);
    expect(proposals.some((item) => item.status === "draft")).toBe(true);
    expect(proposals.some((item) => item.status === "review")).toBe(true);
    expect(proposals.some((item) => item.version >= 2)).toBe(true);
  });

  it("creates proposals and transitions lifecycle", () => {
    const created = crmAgreementsService.proposals.create(
      {
        partyId: "org-party-global-suppliers-co",
        title: "Test Proposal",
        owner: "Sales Director",
        pricing: SAMPLE_PRICING,
      },
      CONTEXT,
      "Executive",
    );
    expect(created.status).toBe("draft");
    expect(created.version).toBe(1);

    const approved = crmAgreementsService.proposals.transition(created.id, "approved", CONTEXT);
    expect(approved.status).toBe("approved");
  });

  it("manages quotations with pricing and validity", () => {
    const quotations = crmAgreementsService.quotations.list(CONTEXT);
    expect(quotations.length).toBeGreaterThanOrEqual(2);
    expect(quotations.some((item) => item.status === "issued")).toBe(true);

    const created = crmAgreementsService.quotations.create(
      {
        partyId: "org-party-global-suppliers-co",
        owner: "Sales Director",
        pricing: SAMPLE_PRICING,
        validFrom: "2026-08-01",
        validTo: "2026-09-01",
      },
      CONTEXT,
    );
    expect(created.reference).toMatch(/^QT-/);
  });

  it("manages contract lifecycle with immutable execution", () => {
    const contracts = crmAgreementsService.contracts.list(CONTEXT);
    expect(contracts.some((item) => item.status === "active")).toBe(true);

    const draft = crmAgreementsService.contracts.create(
      {
        partyId: "org-party-global-suppliers-co",
        title: "Test Contract",
        contractType: "corporate",
        owner: "Founder",
        pricing: SAMPLE_PRICING,
        effectiveFrom: "2026-08-01",
        effectiveTo: "2027-07-31",
      },
      CONTEXT,
    );

    const signed = crmAgreementsService.contracts.sign(draft.id, CONTEXT, "Executive");
    expect(signed.status).toBe("active");
    expect(signed.signedAt).toBeTruthy();
    expect(signed.versions.length).toBeGreaterThan(1);

    expect(() => crmAgreementsService.contracts.sign(draft.id, CONTEXT)).toThrow("CONTRACT_ALREADY_EXECUTED");
  });

  it("creates contract amendments as new versions", () => {
    const draft = crmAgreementsService.contracts.create(
      {
        partyId: "org-party-global-suppliers-co",
        title: "Amendment Test Contract",
        contractType: "service",
        owner: "Founder",
        pricing: SAMPLE_PRICING,
        effectiveFrom: "2026-08-01",
        effectiveTo: "2027-07-31",
      },
      CONTEXT,
    );
    crmAgreementsService.contracts.sign(draft.id, CONTEXT, "Executive");

    const amended = crmAgreementsService.contracts.createAmendment(
      draft.id,
      "Pricing adjustment",
      CONTEXT,
      "Executive",
    );
    expect(amended.status).toBe("review");
    expect(amended.version).toBe(3);
  });

  it("manages rate agreements across types", () => {
    const rates = crmAgreementsService.rates.list(CONTEXT);
    expect(rates.length).toBeGreaterThanOrEqual(3);
    expect(rates.some((item) => item.agreementType === "corporate")).toBe(true);
    expect(rates.some((item) => item.agreementType === "seasonal")).toBe(true);
    expect(rates.some((item) => item.agreementType === "promotional")).toBe(true);
  });

  it("runs approval workflow for proposals and contracts", () => {
    const pending = crmAgreementsService.approvals.listPending(CONTEXT);
    expect(pending.length).toBeGreaterThan(0);

    const proposal = crmAgreementsService.proposals.create(
      {
        partyId: "org-party-global-suppliers-co",
        title: "Approval Test Proposal",
        owner: "Sales Director",
        pricing: SAMPLE_PRICING,
      },
      CONTEXT,
    );

    const approval = crmAgreementsService.approvals.request(
      { entityType: "proposal", entityId: proposal.id, requestedBy: "Sales Director" },
      CONTEXT,
    );
    expect(approval.status).toBe("pending");

    const decided = crmAgreementsService.approvals.decide(
      { approvalId: approval.id, approved: true, decidedBy: "Founder" },
      CONTEXT,
      "Executive",
    );
    expect(decided.status).toBe("approved");
    expect(crmAgreementsService.proposals.get(proposal.id, CONTEXT)?.status).toBe("approved");
  });

  it("processes renewals and exposes renewal dashboard", () => {
    const dashboard = crmAgreementsService.renewals.getDashboard(CONTEXT);
    expect(dashboard.upcoming.length).toBeGreaterThan(0);
    expect(dashboard.expiring.length).toBeGreaterThan(0);

    const renewed = crmAgreementsService.renewals.renew(
      { contractId: "contract-expiring-retail", newEffectiveTo: "2027-08-01", notes: "Test renewal" },
      CONTEXT,
      "Executive",
    );
    expect(renewed.status).toBe("active");
    expect(renewed.effectiveTo).toBe("2027-08-01");
  });

  it("exposes agreements brief signals for Executive Brief", () => {
    const signals = mapCrmAgreementsBriefSignals(crmAgreementsService, CONTEXT);
    expect(signals.pendingApprovals).toBeGreaterThan(0);
    expect(signals.activeContracts).toBeGreaterThan(0);
    expect(signals.briefingLine).toContain("awaiting approval");
    expect(crmService.getAgreementsBriefSignals(CONTEXT).pipelineUnderContract).toBeTruthy();
  });

  it("provides agreement registry view", () => {
    const registry = crmAgreementsService.analytics.getRegistry(CONTEXT);
    expect(registry.proposals.length).toBeGreaterThan(0);
    expect(registry.contracts.length).toBeGreaterThan(0);
    expect(registry.rateAgreements.length).toBeGreaterThan(0);
  });
});
