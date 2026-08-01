import type {
  BenchmarkRecord,
  CommercialAlert,
  ForecastHistoryRecord,
  ForecastRecord,
} from "@/types/crm-commercial-intelligence";
import type { AgreementsRepository } from "@/lib/crm/repositories/AgreementsRepository";

/** Commercial intelligence data access contract (Mission P-008.5). */
export type CommercialIntelligenceRepository = AgreementsRepository & {
  listForecastHistory(organizationId: string): ForecastHistoryRecord[];
  listBenchmarks(organizationId: string): BenchmarkRecord[];
  listCommercialAlerts(organizationId: string): CommercialAlert[];
  listForecastSnapshots(organizationId: string): ForecastRecord[];
  createForecastSnapshot(record: ForecastRecord): ForecastRecord;
};
