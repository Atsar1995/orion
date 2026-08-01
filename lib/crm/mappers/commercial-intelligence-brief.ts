import type { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import type { CommercialIntelligenceBriefSignals } from "@/lib/crm/models/commercial-intelligence";
import type { ServiceContext } from "@/types/services";

/** Maps commercial intelligence signals for Executive Brief (Mission P-008.5). */
export function mapCrmCommercialIntelligenceBriefSignals(
  facade: CrmCommercialIntelligenceFacade,
  context: ServiceContext,
): CommercialIntelligenceBriefSignals {
  return facade.executive.getBriefSignals(context);
}
