export type { FinanceEventResult, FinanceEventProcessingStatus } from "@/lib/finance/integration/FinanceEventResult";
export { FinanceEventConsumer, resetFinanceEventConsumerForTests } from "@/lib/finance/integration/FinanceEventConsumer";
export { FinanceEventDispatcher } from "@/lib/finance/integration/FinanceEventDispatcher";
export {
  HCM_FINANCE_EVENT_TYPES,
  buildHcmFinanceIdempotencyKey,
  isSupportedEventVersion,
  mapHcmEventToJournalDraft,
  mapHcmEventToPostingContext,
  resolveCanonicalEventType,
  validateHcmContractPayload,
} from "@/lib/finance/integration/FinanceEventMapper";
export type { HcmFinanceEventType } from "@/lib/finance/integration/FinanceEventMapper";
export { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
export {
  getFinanceEventConsumer,
  getFinanceInboundProcessor,
  resetFinanceIntegrationForTests,
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration/financeIntegrationRegistry";
