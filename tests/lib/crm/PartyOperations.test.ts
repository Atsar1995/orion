import { describe, expect, it } from "vitest";
import {
  CRM_IIL_SERVICE_ID,
  CRM_NAV,
  crmPartyService,
  crmService,
  mapCrmPartyBriefSignals,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Universal Party & Organization Model (Mission P-008.1)", () => {
  it("lists organisations with diverse organisation types", () => {
    const result = crmPartyService.organisations.list(CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(8);
    expect(result.items.some((item) => item.organisationType === "travel_agency")).toBe(true);
    expect(result.items.some((item) => item.organisationType === "government")).toBe(true);
    expect(result.items.some((item) => item.organisationType === "supplier")).toBe(true);
  });

  it("returns organisation detail with linked contacts and relationships", () => {
    const org = crmPartyService.organisations.list(CONTEXT).items.find((item) =>
      item.displayName.includes("ABC"),
    );
    expect(org).toBeTruthy();

    const detail = crmPartyService.organisations.getDetail(org!.id, CONTEXT);
    expect(detail?.displayName).toContain("ABC");
    expect(detail?.contacts.length).toBeGreaterThan(0);
  });

  it("searches parties by query across persons and organisations", () => {
    const byOrg = crmPartyService.search.search({ query: "Hospitality", kind: "organisation" }, CONTEXT);
    expect(byOrg.total).toBeGreaterThan(0);

    const byPerson = crmPartyService.search.search({ query: "Industries", kind: "person" }, CONTEXT);
    expect(byPerson.total).toBeGreaterThan(0);
  });

  it("supports multi-role assignment", () => {
    const org = crmPartyService.organisations.list(CONTEXT).items[0]!;
    const roles = crmPartyService.roles.assign(
      { partyId: org.id, role: "investor", notes: "Strategic stake" },
      CONTEXT,
      "Executive",
    );
    expect(roles).toContain("investor");
    expect(crmPartyService.roles.list(org.id, CONTEXT).length).toBeGreaterThan(0);
  });

  it("detects duplicate person identities", () => {
    const duplicates = crmPartyService.duplicates.findDuplicates(CONTEXT);
    expect(duplicates.some((entry) => entry.reasons.includes("Matching email"))).toBe(true);
    expect(duplicates[0]?.score).toBeGreaterThanOrEqual(35);
  });

  it("merges duplicate party records", () => {
    const primary = crmPartyService.persons.create(
      { firstName: "Merge", lastName: "Primary", email: "merge.test@example.com", phone: "+91 90000 11111" },
      CONTEXT,
      "Executive",
    );
    const duplicate = crmPartyService.persons.create(
      { firstName: "Merge", lastName: "Duplicate", email: "merge.test@example.com", phone: "+91 90000 11111" },
      CONTEXT,
      "Executive",
    );

    const merged = crmPartyService.merge.merge(
      { primaryPartyId: primary.id, duplicatePartyId: duplicate.id },
      CONTEXT,
      "Executive",
    );
    expect(merged.roles.length).toBeGreaterThanOrEqual(1);
    expect(crmPartyService.persons.getDetail(duplicate.id, CONTEXT)).toBeNull();
  });

  it("links external identifiers for workspace integration", () => {
    const org = crmPartyService.organisations.list(CONTEXT).items[0]!;
    const identifier = crmPartyService.identity.link(
      { partyId: org.id, system: "hospitality", externalId: "guest-test-001" },
      CONTEXT,
      "Executive",
    );
    expect(identifier.system).toBe("hospitality");
    expect(crmPartyService.identity.list(org.id, CONTEXT).some((entry) => entry.externalId === "guest-test-001")).toBe(true);
  });

  it("explores relationship graph for organisational learning", () => {
    const graph = crmPartyService.explorer.getGraph(CONTEXT);
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.highValueOrganisations).toBeGreaterThan(0);
  });

  it("provides executive memory timeline", () => {
    const org = crmPartyService.organisations.list(CONTEXT).items.find((item) =>
      item.displayName.includes("Hospitality"),
    );
    expect(org).toBeTruthy();
    const timeline = crmPartyService.timeline.list(org!.id, CONTEXT);
    expect(timeline.length).toBeGreaterThan(0);
  });

  it("links customer records to organisation party ids", () => {
    const catalog = crmService.customers.getCustomerCatalog();
    expect(catalog.every((entry) => entry.organisationId?.startsWith("org-party-"))).toBe(true);
  });

  it("provides party brief signals for Executive Brief integration", () => {
    const signals = mapCrmPartyBriefSignals(crmPartyService, CONTEXT);
    expect(signals.totalOrganisations).toBeGreaterThan(0);
    expect(signals.vipCount).toBeGreaterThan(0);
    expect(signals.relationshipHealthScore).toBeGreaterThan(0);
    expect(signals.briefingLine).toContain("VIP parties");
    expect(crmService.getPartyBriefSignals(CONTEXT).activeCustomers).toBeGreaterThan(0);
  });

  it("exposes CRM IIL service id and party nav routes", () => {
    expect(CRM_IIL_SERVICE_ID).toBe("crm-workspace");
    expect(CRM_NAV.some((item) => item.href === "/crm/companies")).toBe(true);
    expect(CRM_NAV.some((item) => item.href === "/crm/parties")).toBe(true);
  });
});
