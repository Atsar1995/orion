import type { CommercialBriefSignals } from "@/lib/crm/models/commercial";
import type { CrmCommercialFacade } from "@/lib/crm/commercial";
import type { ServiceContext } from "@/types/services";

/** Maps commercial domain signals for Executive Brief (Mission P-008.2). */
export function mapCrmCommercialBriefSignals(
  facade: CrmCommercialFacade,
  context: ServiceContext,
): CommercialBriefSignals {
  return facade.forecast.getBriefSignals(context);
}
