import type {
  CommercialSnapshotRecord,
  PerformanceTrendRecord,
} from "@/types/crm-executive-dashboard";
import type { CustomerIntelligenceRepository } from "@/lib/crm/repositories/CustomerIntelligenceRepository";

/** Commercial executive dashboard data access contract (Mission P-008.7). */
export type ExecutiveDashboardRepository = CustomerIntelligenceRepository & {
  listDashboardSnapshots(organizationId: string): CommercialSnapshotRecord[];
  listPerformanceTrends(organizationId: string): PerformanceTrendRecord[];
};
