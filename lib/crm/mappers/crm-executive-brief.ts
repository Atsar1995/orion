import type { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
import type { CrmExecutiveBriefSignals } from "@/lib/crm/models/crm-executive-dashboard";
import type { ServiceContext } from "@/types/services";

/** Maps executive dashboard signals for Executive Brief (Mission P-008.7). */
export function mapCrmExecutiveBriefSignals(
  facade: CrmExecutiveDashboardFacade,
  context: ServiceContext,
): CrmExecutiveBriefSignals {
  return facade.executive.getBriefSignals(context);
}
