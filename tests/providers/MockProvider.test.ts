import { describe, expect, it } from "vitest";
import {
  CalendarProvider,
  CRMProvider,
  CommerceProvider,
  EmailProvider,
  FinanceProvider,
  HospitalityProvider,
  MarketingProvider,
} from "@/lib/providers/MockProvider";
import { createDefaultProviders } from "@/lib/providers/ProviderFactory";

describe("Mock Providers", () => {
  it("creates all default mock providers via factory", () => {
    const providers = createDefaultProviders();
    const ids = providers.map((provider) => provider.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "crm",
        "finance",
        "marketing",
        "hospitality",
        "commerce",
        "calendar",
        "email",
      ]),
    );
  });

  it.each([
    [CRMProvider, "crm", "CRM"],
    [FinanceProvider, "finance", "Finance"],
    [MarketingProvider, "marketing", "Marketing"],
    [HospitalityProvider, "hospitality", "Hospitality"],
    [CommerceProvider, "commerce", undefined],
    [CalendarProvider, "calendar", undefined],
    [EmailProvider, "email", undefined],
  ])("connects and returns dashboard contribution", async (ProviderClass, id, workspace) => {
    const provider = new ProviderClass();
    await provider.connect();

    const result = await provider.fetchDashboardContribution();

    expect(result.success).toBe(true);
    expect(result.data?.providerId).toBe(id);
    if (workspace) {
      expect(result.data?.workspace).toBe(workspace);
    }
    expect(result.data?.metric ?? result.data?.tasks ?? result.data?.briefSegments).toBeTruthy();
  });

  it("throws when fetching contribution without connection", async () => {
    const provider = new CRMProvider();

    await expect(provider.fetchDashboardContribution()).rejects.toThrow(/not connected/);
  });

  it("exposes capability lists per provider domain", () => {
    const crm = new CRMProvider();
    const calendar = new CalendarProvider();

    expect(crm.getCapabilities()).toContain("metrics");
    expect(calendar.getCapabilities()).toContain("tasks");
  });
});
