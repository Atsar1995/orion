import { describe, expect, it } from "vitest";
import { DEFAULT_PROPERTY_ID, hospitalityBillingService } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Billing, Folio & Revenue Operations Platform (Mission P-007.6)", () => {
  it("returns billing dashboard with revenue and folio summary", () => {
    const dashboard = hospitalityBillingService.dashboard.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(dashboard.summary.todaysRevenue).toBeGreaterThan(0);
    expect(dashboard.summary.averageDailyRate).toBeGreaterThan(0);
    expect(dashboard.summary.revpar).toBeGreaterThan(0);
    expect(dashboard.folios.length).toBeGreaterThan(0);
  });

  it("returns folio detail with charges, payments, and balance", () => {
    const detail = hospitalityBillingService.folios.getDetail("folio-001", CONTEXT);

    expect(detail).toBeTruthy();
    expect(detail!.charges.length).toBeGreaterThan(0);
    expect(detail!.payments.length).toBeGreaterThan(0);
    expect(detail!.summary.balance).toBeGreaterThan(0);
  });

  it("posts charge with tax and publishes revenue event", () => {
    const before = hospitalityBillingService.repository.listRevenueEvents(CONTEXT.organizationId).length;

    const charge = hospitalityBillingService.charges.post(
      {
        folioId: "folio-003",
        description: "Spa treatment",
        category: "spa",
        amount: 3200,
      },
      CONTEXT,
      "Executive",
    );

    expect(charge.taxAmount).toBeGreaterThan(0);
    expect(hospitalityBillingService.repository.listRevenueEvents(CONTEXT.organizationId).length).toBeGreaterThan(before);
  });

  it("processes payment and auto-settles folio when balance cleared", () => {
    const folio = hospitalityBillingService.repository.getFolioRecord("folio-003");
    expect(folio?.status).toBe("open");

    const balance = hospitalityBillingService.folios.getBalance("folio-003", CONTEXT);
    hospitalityBillingService.payments.process(
      { folioId: "folio-003", amount: balance, method: "card", reference: "TXN-TEST" },
      CONTEXT,
      "Executive",
    );

    const updated = hospitalityBillingService.repository.getFolioRecord("folio-003");
    expect(updated?.status).toBe("settled");
  });

  it("generates tax invoice for folio", () => {
    const invoice = hospitalityBillingService.invoices.generate(
      { folioId: "folio-001", type: "tax_invoice" },
      CONTEXT,
      "Executive",
    );

    expect(invoice.invoiceNumber).toContain("INV");
    expect(invoice.total).toBeGreaterThan(0);
  });

  it("returns revenue dashboard by property, source, and segment", () => {
    const revenue = hospitalityBillingService.revenue.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(revenue.dailyRevenue).toBeGreaterThan(0);
    expect(revenue.byProperty.length).toBeGreaterThan(0);
    expect(revenue.bySource.length).toBeGreaterThan(0);
  });

  it("creates folio for reservation if none exists", () => {
    const created = hospitalityBillingService.folios.create(
      {
        propertyId: DEFAULT_PROPERTY_ID,
        reservationId: "res-001",
        stayId: "stay-res-001",
        guestId: "guest-mehta",
        folioType: "individual",
      },
      CONTEXT,
    );

    expect(created.reservationId).toBe("res-001");
    expect(created.status).toBe("open");
  });

  it("exposes brief signals for executive integration", () => {
    const signals = hospitalityBillingService.getBriefSignals(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(signals.todaysRevenue).toBeGreaterThan(0);
    expect(signals.openFolioCount).toBeGreaterThan(0);
    expect(signals.averageDailyRate).toBeGreaterThan(0);
    expect(signals.revpar).toBeGreaterThan(0);
  });

  it("calculates tax via tax engine", () => {
    const result = hospitalityBillingService.tax.calculate(10000, "accommodation");
    expect(result.taxAmount).toBe(1200);
    expect(result.total).toBe(11200);
  });
});
