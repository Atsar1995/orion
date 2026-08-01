import type { HousekeepingRepository } from "@/lib/hospitality/repositories/HousekeepingRepository";
import { HospitalityHousekeepingFacade } from "@/lib/hospitality/housekeeping";
import type { HousekeepingBriefContribution } from "@/lib/hospitality/models/housekeeping";

export function mapHousekeepingBriefContribution(
  repository: HousekeepingRepository,
  organizationId: string,
  propertyId: string,
): HousekeepingBriefContribution {
  const signals = new HospitalityHousekeepingFacade(repository).getBriefSignals(
    {
      organizationId,
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: "executive",
    },
    propertyId,
  );

  return {
    readyRooms: signals.readyRooms,
    awaitingCleaning: signals.awaitingCleaning,
    criticalMaintenance: signals.criticalMaintenance,
    inspectionFailures: signals.inspectionFailures,
    assetHealthScore: signals.assetHealthScore,
    cleaningProgressPercent: signals.cleaningProgressPercent,
  };
}
