import type {
  CommercialSnapshotRecord,
  PerformanceTrendRecord,
} from "@/types/crm-executive-dashboard";

const TENANT = "org-orania";

const SNAPSHOTS: CommercialSnapshotRecord[] = [
  {
    id: "snap-jun-2026",
    organizationId: TENANT,
    capturedAt: "2026-06-30T18:00:00.000Z",
    pipelineValue: 8200000,
    forecastRevenue: 4100000,
    revenueWon: 3950000,
    activeContracts: 6,
    relationshipHealthIndex: 76,
  },
  {
    id: "snap-jul-2026",
    organizationId: TENANT,
    capturedAt: "2026-07-30T18:00:00.000Z",
    pipelineValue: 9100000,
    forecastRevenue: 4550000,
    revenueWon: 4850000,
    activeContracts: 7,
    relationshipHealthIndex: 78,
  },
];

const TRENDS: PerformanceTrendRecord[] = [
  {
    id: "trend-apr-2026",
    organizationId: TENANT,
    period: "Apr 2026",
    pipelineValue: 7200000,
    revenueWon: 1200000,
    winRate: 58,
    relationshipHealthIndex: 74,
  },
  {
    id: "trend-may-2026",
    organizationId: TENANT,
    period: "May 2026",
    pipelineValue: 7800000,
    revenueWon: 1350000,
    winRate: 60,
    relationshipHealthIndex: 75,
  },
  {
    id: "trend-jun-2026",
    organizationId: TENANT,
    period: "Jun 2026",
    pipelineValue: 8200000,
    revenueWon: 1400000,
    winRate: 61,
    relationshipHealthIndex: 76,
  },
  {
    id: "trend-jul-2026",
    organizationId: TENANT,
    period: "Jul 2026",
    pipelineValue: 9100000,
    revenueWon: 1500000,
    winRate: 62,
    relationshipHealthIndex: 78,
  },
];

/** Builds executive dashboard historical seed (Mission P-008.7). */
export function buildExecutiveDashboardSeed(): {
  snapshots: CommercialSnapshotRecord[];
  trends: PerformanceTrendRecord[];
} {
  return { snapshots: SNAPSHOTS, trends: TRENDS };
}
