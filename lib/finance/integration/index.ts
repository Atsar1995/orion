export type { FinanceEventResult, FinanceEventProcessingStatus } from "@/lib/finance/integration/FinanceEventResult";
export { FinanceEventConsumer, resetFinanceEventConsumerForTests } from "@/lib/finance/integration/FinanceEventConsumer";
export { FinanceEventDispatcher } from "@/lib/finance/integration/FinanceEventDispatcher";
export {
  CRM_DEFERRED_JOURNAL_ENABLED,
  CRM_FINANCE_EVENT_TYPES,
  HCM_FINANCE_EVENT_TYPES,
  buildCrmFinanceIdempotencyKey,
  buildHcmFinanceIdempotencyKey,
  buildProcurementFinanceIdempotencyKey,
  isSupportedEventVersion,
  mapCrmEventToJournalDraft,
  mapCrmEventToPostingContext,
  mapHcmEventToJournalDraft,
  mapHcmEventToPostingContext,
  mapProcurementEventToJournalDraft,
  mapProcurementEventToPostingContext,
  resolveCanonicalEventType,
  resolveCrmCanonicalEventType,
  resolveFinanceInboundEventType,
  resolveProcurementCanonicalEventType,
  validateCrmContractPayload,
  validateHcmContractPayload,
  validateProcurementContractPayload,
} from "@/lib/finance/integration/FinanceEventMapper";
export type {
  CrmFinanceEventType,
  FinanceInboundEventType,
  HcmFinanceEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
export type { ProcurementFinancePostableEventType } from "@/lib/finance/integration/FinanceEventMapper";
export {
  FINANCE_INBOUND_EVENT_TYPES,
  isSupportedCrmFinanceEventType,
  isSupportedHcmFinanceEventType,
  isUnsupportedCrmCanonicalEventType,
} from "@/lib/finance/integration/FinanceSupportedEvents";
export {
  PROCUREMENT_FINANCE_EVENT_TYPES,
  PROCUREMENT_FINANCE_FUTURE_EVENT_TYPES,
  PROCUREMENT_FINANCE_POSTABLE_EVENT_TYPES,
  isProcurementFutureFinanceEventType,
  isSupportedProcurementFinanceEventType,
  isUnsupportedProcurementCanonicalEventType,
} from "@/lib/finance/integration/FinanceProcurementSupportedEvents";
export type {
  ProcurementFinanceEventType,
  ProcurementFinanceFutureEventType,
  ProcurementFinancePostableEventType,
} from "@/lib/finance/integration/FinanceProcurementSupportedEvents";
export { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
export {
  getFinanceEventConsumer,
  getFinanceInboundProcessor,
  resetFinanceIntegrationForTests,
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration/financeIntegrationRegistry";
