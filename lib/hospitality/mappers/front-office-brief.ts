import type { FrontOfficeRepository } from "@/lib/hospitality/repositories/FrontOfficeRepository";
import { HospitalityFrontOfficeFacade } from "@/lib/hospitality/front-office";
import type { FrontOfficeBriefContribution } from "@/lib/hospitality/models/front-office";

export function mapFrontOfficeBriefContribution(
  repository: FrontOfficeRepository,
  organizationId: string,
  propertyId?: string,
): FrontOfficeBriefContribution {
  const signals = new HospitalityFrontOfficeFacade(repository).getBriefSignals(
    {
      organizationId,
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: "executive",
    },
    propertyId,
  );

  return {
    currentOccupancy: signals.currentOccupancy,
    vipInHouse: signals.vipInHouse,
    operationalDelays: signals.operationalDelays,
    earlyArrivals: signals.earlyArrivals,
    lateDepartures: signals.lateDepartures,
    unassignedArrivals: signals.unassignedArrivals,
    roomsNotReady: signals.roomsNotReady,
  };
}
