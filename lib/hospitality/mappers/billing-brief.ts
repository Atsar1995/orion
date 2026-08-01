import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import { HospitalityBillingFacade } from "@/lib/hospitality/billing";
import type { BillingBriefContribution } from "@/lib/hospitality/models/billing";

export function mapBillingBriefContribution(
  repository: BillingRepository,
  organizationId: string,
  propertyId: string,
): BillingBriefContribution {
  const signals = new HospitalityBillingFacade(repository).getBriefSignals(
    {
      organizationId,
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: "executive",
    },
    propertyId,
  );

  return {
    todaysRevenue: signals.todaysRevenue,
    outstandingBalances: signals.outstandingBalances,
    pendingPayments: signals.pendingPayments,
    averageDailyRate: signals.averageDailyRate,
    revpar: signals.revpar,
    highValueGuestCount: signals.highValueGuestCount,
    openFolioCount: signals.openFolioCount,
  };
}
