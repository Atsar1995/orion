import type { BenchmarkRecord, TrendRecord } from "@/types/hospitality-analytics";

/** Historical trend seed for analytics (Mission P-007.7). */
export function buildAnalyticsSeed(): {
  trends: TrendRecord[];
  benchmarks: BenchmarkRecord[];
} {
  const trends: TrendRecord[] = [
    {
      id: "trend-occ",
      label: "Occupancy",
      direction: "up",
      changePercent: 4.2,
      narrative: "Weekend occupancy up 4.2% vs prior week — group bookings driving lift.",
      period: "7d",
    },
    {
      id: "trend-rev",
      label: "RevPAR",
      direction: "up",
      changePercent: 6.1,
      narrative: "RevPAR improving on higher ADR from suite upgrades and reduced OTA discounting.",
      period: "7d",
    },
    {
      id: "trend-cancel",
      label: "Cancellation Rate",
      direction: "down",
      changePercent: -1.8,
      narrative: "Cancellation rate declined 1.8pp — corporate segment showing stronger commitment.",
      period: "30d",
    },
    {
      id: "trend-sat",
      label: "Guest Satisfaction",
      direction: "stable",
      changePercent: 0.3,
      narrative: "Satisfaction stable at 4.6/5 — service recovery success rate at 92%.",
      period: "30d",
    },
    {
      id: "trend-lead",
      label: "Booking Lead Time",
      direction: "up",
      changePercent: 12,
      narrative: "Average lead time increased 12% — early booking behaviour ahead of peak season.",
      period: "90d",
    },
  ];

  const benchmarks: BenchmarkRecord[] = [
    { id: "bm-occ", metric: "Occupancy", actual: 84, benchmark: 78, unit: "%", status: "above" },
    { id: "bm-adr", metric: "ADR", actual: 5200, benchmark: 4800, unit: "INR", status: "above" },
    { id: "bm-revpar", metric: "RevPAR", actual: 4368, benchmark: 4100, unit: "INR", status: "above" },
    { id: "bm-cancel", metric: "Cancellation Rate", actual: 3.2, benchmark: 4.0, unit: "%", status: "below" },
    { id: "bm-noshow", metric: "No-show Rate", actual: 1.4, benchmark: 2.0, unit: "%", status: "below" },
    { id: "bm-gop", metric: "GOP Margin", actual: 38, benchmark: 35, unit: "%", status: "above" },
  ];

  return { trends, benchmarks };
}
