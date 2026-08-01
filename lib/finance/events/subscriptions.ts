import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import type { FinanceEventSubscriptionDescriptor } from "@/types/finance-events";

/** Business events Finance subscribes to — transformation deferred to P-009.2+ (D-008). */
export const FINANCE_BUSINESS_EVENT_SUBSCRIPTIONS: FinanceEventSubscriptionDescriptor = {
  subscriberId: FINANCE_IIL_SERVICE_ID,
  sourceServices: ["crm-workspace", "hospitality-workspace"],
  businessEventTypes: [
    "ContractSigned",
    "ContractRenewed",
    "FolioSettled",
    "BillingChargePosted",
    "OpportunityWon",
    "CustomEvent",
  ],
};

/** Financial events Finance may publish (contracts established P-009.1). */
export const FINANCE_PUBLISHABLE_EVENT_TYPES = [
  "InvoiceIssued",
  "PaymentReceived",
  "JournalPosted",
  "FinancialKpiUpdated",
  "FinancialBriefSignalPublished",
] as const;
