import type { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import type { CustomerIntelligenceBriefSignals } from "@/lib/crm/models/customer-intelligence";
import type { ServiceContext } from "@/types/services";

/** Maps customer intelligence signals for Executive Brief (Mission P-008.6). */
export function mapCrmCustomerIntelligenceBriefSignals(
  facade: CrmCustomerIntelligenceFacade,
  context: ServiceContext,
): CustomerIntelligenceBriefSignals {
  return facade.executive.getBriefSignals(context);
}
