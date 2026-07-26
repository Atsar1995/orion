import type { KPIInput } from "@/lib/business-health/models/KPI";

export function createTestKPI(overrides: Partial<KPIInput> & Pick<KPIInput, "id" | "name" | "category">): KPIInput {
  return {
    description: "Test KPI",
    currentValue: 100,
    previousValue: 90,
    targetValue: 100,
    weight: 1,
    source: "manual",
    confidence: 90,
    ...overrides,
  };
}

export const sampleGA4Signals = {
  sessions: 1200,
  users: 900,
  revenue: 50000,
  bounceRate: 0.42,
  timestamp: "2026-07-26T10:00:00.000Z",
};

export const sampleShopifySignals = {
  orders: 120,
  sales: 85000,
  refunds: 1200,
  previousOrders: 100,
  previousSales: 80000,
  previousRefunds: 1500,
  timestamp: "2026-07-26T10:00:00.000Z",
};

export const sampleMetaSignals = {
  spend: 5000,
  impressions: 120000,
  clicks: 3200,
  conversions: 180,
  previousSpend: 5200,
  previousClicks: 3000,
  timestamp: "2026-07-26T10:00:00.000Z",
};
