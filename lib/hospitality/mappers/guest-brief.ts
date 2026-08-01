import type { GuestRepository } from "@/lib/hospitality/repositories/GuestRepository";
import { HospitalityGuestFacade } from "@/lib/hospitality/guests";
import type { GuestBriefContribution } from "@/lib/hospitality/models/guests";

export function mapGuestBriefContribution(
  repository: GuestRepository,
  organizationId: string,
): GuestBriefContribution {
  const signals = new HospitalityGuestFacade(repository).guests.getBriefSignals({
    organizationId,
    workspaceId: "workspace-orania",
    userId: "user-executive",
    role: "executive",
  });

  return {
    vipArrivals: signals.vipArrivals,
    repeatGuests: signals.repeatGuests,
    highValueGuests: signals.highValueGuests,
    serviceRecoveryAlerts: signals.serviceRecoveryAlerts,
    satisfactionTrend: signals.satisfactionTrend,
    guestRetentionOpportunity: signals.guestRetentionOpportunity,
  };
}
