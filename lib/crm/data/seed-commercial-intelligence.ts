import type {
  BenchmarkRecord,
  CommercialAlert,
  ForecastHistoryRecord,
} from "@/types/crm-commercial-intelligence";

const TENANT = "org-orania";

const FORECAST_HISTORY: ForecastHistoryRecord[] = [
  {
    id: "fh-q1-2026",
    organizationId: TENANT,
    period: "Q1 2026",
    projectedValue: 4200000,
    actualValue: 3950000,
    accuracy: 94,
    recordedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "fh-q2-2026",
    organizationId: TENANT,
    period: "Q2 2026",
    projectedValue: 5100000,
    actualValue: 4850000,
    accuracy: 95,
    recordedAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "fh-jul-2026",
    organizationId: TENANT,
    period: "Jul 2026",
    projectedValue: 1800000,
    recordedAt: "2026-07-15T09:00:00.000Z",
  },
];

const BENCHMARKS: BenchmarkRecord[] = [
  {
    id: "bench-win-rate",
    organizationId: TENANT,
    metric: "win_rate",
    label: "Win Rate",
    actual: 62,
    benchmark: 55,
    unit: "%",
    variance: 7,
  },
  {
    id: "bench-deal-size",
    organizationId: TENANT,
    metric: "average_deal_size",
    label: "Average Deal Size",
    actual: 850000,
    benchmark: 720000,
    unit: "INR",
    variance: 18,
  },
  {
    id: "bench-velocity",
    organizationId: TENANT,
    metric: "sales_velocity",
    label: "Sales Velocity",
    actual: 38,
    benchmark: 45,
    unit: "days",
    variance: -16,
  },
];

const ALERTS: CommercialAlert[] = [
  {
    id: "alert-renewal-retail",
    organizationId: TENANT,
    severity: "high",
    title: "Renewal risk — Retail Channel Co",
    message: "Retention agreement expires within 45 days with no signed renewal.",
    entityType: "contract",
    entityId: "contract-expiring-retail",
    createdAt: "2026-07-30T09:00:00.000Z",
  },
  {
    id: "alert-stalled-abc",
    organizationId: TENANT,
    severity: "medium",
    title: "Stalled opportunity — ABC Industries",
    message: "Equipment upgrade deal in proposal stage with no activity in 14 days.",
    entityType: "opportunity",
    entityId: "abc-equipment-upgrade",
    createdAt: "2026-07-28T09:00:00.000Z",
  },
];

export function buildCommercialIntelligenceSeed(): {
  forecastHistory: ForecastHistoryRecord[];
  benchmarks: BenchmarkRecord[];
  alerts: CommercialAlert[];
} {
  return {
    forecastHistory: [...FORECAST_HISTORY],
    benchmarks: [...BENCHMARKS],
    alerts: [...ALERTS],
  };
}

export { TENANT as COMMERCIAL_INTELLIGENCE_SEED_TENANT };
