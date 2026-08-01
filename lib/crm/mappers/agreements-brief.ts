import type { CrmAgreementsFacade } from "@/lib/crm/agreements";
import type { AgreementsBriefSignals } from "@/lib/crm/models/agreements";
import type { ServiceContext } from "@/types/services";

/** Maps commercial agreements signals for Executive Brief (Mission P-008.3). */
export function mapCrmAgreementsBriefSignals(
  facade: CrmAgreementsFacade,
  context: ServiceContext,
): AgreementsBriefSignals {
  return facade.analytics.getBriefSignals(context);
}
