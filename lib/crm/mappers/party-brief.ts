import type { PartyBriefSignals } from "@/lib/crm/models/parties";
import type { CrmPartyFacade } from "@/lib/crm/parties";
import type { ServiceContext } from "@/types/services";

/** Maps party domain signals for Executive Brief integration (Mission P-008.1). */
export function mapCrmPartyBriefSignals(
  facade: CrmPartyFacade,
  context: ServiceContext,
): PartyBriefSignals {
  return facade.analytics.getBriefSignals(context);
}
