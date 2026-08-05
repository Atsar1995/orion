export type { FinanceEventResult, FinanceEventProcessingStatus } from "@/lib/finance/integration/FinanceEventResult";
export { FinanceEventConsumer, resetFinanceEventConsumerForTests } from "@/lib/finance/integration/FinanceEventConsumer";
export { FinanceEventDispatcher } from "@/lib/finance/integration/FinanceEventDispatcher";
export {
  CRM_DEFERRED_JOURNAL_ENABLED,
  CRM_FINANCE_EVENT_TYPES,
  HCM_FINANCE_EVENT_TYPES,
  buildCrmFinanceIdempotencyKey,
  buildHcmFinanceIdempotencyKey,
  isSupportedEventVersion,
  mapCrmEventToJournalDraft,
  mapCrmEventToPostingContext,
  mapHcmEventToJournalDraft,
  mapHcmEventToPostingContext,
  resolveCanonicalEventType,
  resolveCrmCanonicalEventType,
  resolveFinanceInboundEventType,
  validateCrmContractPayload,
  validateHcmContractPayload,
} from "@/lib/finance/integration/FinanceEventMapper";
export type {
  CrmFinanceEventType,
  FinanceInboundEventType,
  HcmFinanceEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
export {
  FINANCE_INBOUND_EVENT_TYPES,
  isSupportedCrmFinanceEventType,
  isSupportedHcmFinanceEventType,
  isUnsupportedCrmCanonicalEventType,
} from "@/lib/finance/integration/FinanceSupportedEvents";
export { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
export {
  getFinanceEventConsumer,
  getFinanceInboundProcessor,
  resetFinanceIntegrationForTests,
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration/financeIntegrationRegistry";
