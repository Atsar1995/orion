/**
 * Finance workspace public API (Mission P-009.1).
 * Import from `@/lib/finance` only — not from internal modules.
 */

export {
  FINANCE_BASE_PATH,
  FINANCE_AUTHORIZED_EVENT_SOURCES,
  FINANCE_IIL_SERVICE_ID,
  FINANCE_MISSION_FOUNDATION,
  FINANCE_MISSION_CHART_OF_ACCOUNTS,
  FINANCE_MISSION_GENERAL_LEDGER,
  FINANCE_MISSION_FISCAL_PERIOD,
  FINANCE_MISSION_EVENT_PIPELINE,
  FINANCE_MISSION_EXECUTIVE_INTELLIGENCE,
  FINANCE_MODULE_KEY,
  FINANCE_PROVIDER_ID,
  FINANCE_ROUTE_PERMISSIONS,
  FINANCE_WORKSPACE_ID,
  FINANCE_WORKSPACE_LABEL,
} from "@/lib/finance/constants";

export { FINANCE_NAV, type FinanceNavItem } from "@/lib/finance/nav";

export {
  FinanceFacade,
  financeService,
  financeChartOfAccountsService,
  financeGeneralLedgerService,
  financeFiscalPeriodService,
  financeEventPipelineService,
  financeExecutiveIntelligenceService,
  getFinanceWorkspaceBootstrap,
} from "@/lib/finance/FinanceFacade";

export {
  FinanceChartOfAccountsFacade,
  ChartOfAccountsService,
} from "@/lib/finance/chart-of-accounts";

export {
  FinanceGeneralLedgerFacade,
  GeneralLedgerService,
} from "@/lib/finance/general-ledger";

export { LedgerRulesEngine } from "@/lib/finance/general-ledger/LedgerRulesEngine";

export {
  FinanceFiscalPeriodFacade,
  FiscalPeriodService,
} from "@/lib/finance/fiscal-period";

export { PeriodRulesEngine } from "@/lib/finance/fiscal-period/PeriodRulesEngine";

export {
  FinanceEventPipelineFacade,
  FinancialEventPipelineService,
} from "@/lib/finance/event-pipeline";

export { TransformationRegistry, defaultTransformationRegistry } from "@/lib/finance/event-pipeline/TransformationRegistry";
export { PolicyEvaluator } from "@/lib/finance/event-pipeline/PolicyEvaluator";
export { PipelineRulesEngine } from "@/lib/finance/event-pipeline/PipelineRulesEngine";

export {
  FinanceExecutiveIntelligenceFacade,
  ExecutiveFinancialIntelligenceService,
} from "@/lib/finance/executive-intelligence";

export { KpiCalculator } from "@/lib/finance/executive-intelligence/KpiCalculator";
export { AlertEngine } from "@/lib/finance/executive-intelligence/AlertEngine";
export { RecommendationEngine } from "@/lib/finance/executive-intelligence/RecommendationEngine";

export { publishFinanceEvent } from "@/lib/finance/finance-events";

export {
  registerFinanceEventSubscriptions,
  FINANCE_BUSINESS_EVENT_SUBSCRIPTIONS,
  FINANCE_PUBLISHABLE_EVENT_TYPES,
} from "@/lib/finance/events";

export { FinanceValidationEngine, financeValidationEngine } from "@/lib/finance/validation";

export type { FinanceWorkspaceView, FinanceModuleDescriptor } from "@/lib/finance/models/domain";
export { FINANCE_FOUNDATION_CAPABILITIES } from "@/lib/finance/models/workspace";

export type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";
export type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
export type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
export type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
export type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
export type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
export type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
export type { ReceivableRepository } from "@/lib/finance/repositories/ReceivableRepository";
export type { PayableRepository } from "@/lib/finance/repositories/PayableRepository";
export type { CashRepository } from "@/lib/finance/repositories/CashRepository";
export type { BankRepository } from "@/lib/finance/repositories/BankRepository";
export type { BudgetRepository } from "@/lib/finance/repositories/BudgetRepository";
export type { ForecastRepository } from "@/lib/finance/repositories/ForecastRepository";
export type { TaxRepository } from "@/lib/finance/repositories/TaxRepository";
export {
  InMemoryIdempotencyRepository,
  defaultIdempotencyRepository,
} from "@/lib/finance/repositories/InMemoryIdempotencyRepository";

export {
  createFinancePersistenceRepositories,
  InMemoryJournalRepository,
  InMemoryEventLineageRepository,
} from "@/lib/finance/persistence";
export type {
  FinancePersistenceRepositories,
  CreateFinancePersistenceRepositoriesOptions,
} from "@/lib/finance/persistence";

export type { ValidationService } from "@/lib/finance/services/ValidationService";
export type { EventService } from "@/lib/finance/services/EventService";
export type { LedgerService } from "@/lib/finance/services/LedgerService";
export type { JournalService } from "@/lib/finance/services/JournalService";
export type { PostingService, PostingRequestOptions } from "@/lib/finance/services/PostingService";
export { DefaultPostingService, StubPostingService, stubPostingService } from "@/lib/finance/services/PostingService";
export { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
export { GeneralLedgerPostingService } from "@/lib/finance/services/GeneralLedgerPostingService";
export type { GeneralLedgerMutation } from "@/lib/finance/services/GeneralLedgerMutation";
export type { LedgerPostingContext } from "@/lib/finance/services/LedgerPostingContext";
export type { LedgerPostingResult } from "@/lib/finance/services/LedgerPostingResult";
export type { PostingContext } from "@/lib/finance/services/PostingContext";
export { createPostingContext, createPostingCorrelationId, resolvePostingLineageId } from "@/lib/finance/services/PostingContext";
export type { PostingResult } from "@/lib/finance/services/PostingResult";
export type { PostingTransaction } from "@/lib/finance/services/PostingTransaction";
export { PostingValidationPipeline } from "@/lib/finance/services/PostingValidationPipeline";
export { PostingValidationService } from "@/lib/finance/services/PostingValidationService";
export type { PostingValidationInput } from "@/lib/finance/services/PostingValidationService";
export type { PostingValidationResult } from "@/lib/finance/services/PostingValidationResult";
export {
  POSTING_VALIDATION_STAGE_ORDER,
  isPostingValidationBlocking,
} from "@/lib/finance/services/PostingValidationStage";
export type {
  PostingValidationStageName,
  PostingValidationOutcome,
  PostingValidationStageResult,
} from "@/lib/finance/services/PostingValidationStage";

export {
  FinanceEventConsumer,
  FinanceEventDispatcher,
  FinanceInboundProcessor,
  HCM_FINANCE_EVENT_TYPES,
  PROCUREMENT_FINANCE_EVENT_TYPES,
  buildHcmFinanceIdempotencyKey,
  buildProcurementFinanceIdempotencyKey,
  resolveCanonicalEventType,
  resolveProcurementCanonicalEventType,
  resetFinanceEventConsumerForTests,
  resetFinanceIntegrationForTests,
} from "@/lib/finance/integration";
export type {
  FinanceEventResult,
  FinanceEventProcessingStatus,
  HcmFinanceEventType,
  ProcurementFinanceEventType,
} from "@/lib/finance/integration";

export type { BudgetService } from "@/lib/finance/services/BudgetService";
export type { ForecastService } from "@/lib/finance/services/ForecastService";
export type { TaxService } from "@/lib/finance/services/TaxService";
export type { ReconciliationService } from "@/lib/finance/services/ReconciliationService";
export type { TransformationService } from "@/lib/finance/services/TransformationService";
export type { ExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";

export type {
  FinanceCapabilityDescriptor,
  FinanceDomainStatus,
  FinanceScopedRecord,
  FinanceWorkspaceBootstrap,
} from "@/types/finance-core";

export type {
  FinanceFinancialEventType,
  FinanceBusinessEventType,
  EnterpriseEventContract,
  PublishFinanceEventInput,
  FinanceEventSubscriptionDescriptor,
  FinanceInboundBusinessEventRecord,
} from "@/types/finance-events";

export type {
  FinanceValidationInput,
  FinanceValidationIssue,
  FinanceValidationResult,
  FinanceValidationStage,
} from "@/types/finance-validation";

export type {
  FiscalPeriodRecord,
  FiscalPeriodState,
  FiscalYearState,
  FiscalCalendarRecord,
  FiscalYearRecord,
  AccountingPeriodReference,
  PeriodEventType,
  PeriodReopenInput,
  PeriodInquiryQuery,
  PublishPeriodEventInput,
} from "@/types/finance-period";

export {
  isPeriodPostingAllowed,
  isPeriodAdjustmentAllowed,
  isPeriodReversalAllowed,
} from "@/types/finance-period";
export type { FinanceCurrencyContext, CurrencyCode } from "@/types/finance-currency";
export type {
  ChartOfAccountRecord,
  JournalEntryRecord,
  JournalLineRecord,
  EventLineageRecord,
} from "@/types/finance-ledger";

export type {
  AccountType,
  AccountStatus,
  AccountCategory,
  AccountCurrencyRule,
  CreateChartOfAccountInput,
  ModifyChartOfAccountInput,
  ChartOfAccountListQuery,
} from "@/types/finance-chart-of-accounts";

export type {
  ChartOfAccountListItem,
  ChartOfAccountDetailView,
  ChartOfAccountHierarchyNode,
  ChartOfAccountListView,
} from "@/lib/finance/models/chart-of-accounts";

export type {
  LedgerBalanceRecord,
  LedgerPostingInput,
  LedgerPostingRecord,
  LedgerOpeningBalanceInput,
  LedgerInquiryQuery,
  LedgerEventType,
  ConsumedFinancialEventRecord,
  PublishLedgerEventInput,
} from "@/types/finance-general-ledger";

export type {
  TrialBalanceView,
  LedgerInquiryView,
  LedgerAccountBalanceView,
  LedgerConsistencyResult,
} from "@/lib/finance/models/general-ledger";

export type {
  FiscalPeriodListItem,
  FiscalPeriodDetailView,
  FiscalCalendarView,
  PeriodInquiryView,
  PeriodValidationResult,
  PeriodTransitionResult,
} from "@/lib/finance/models/fiscal-period";

export type {
  PipelineBusinessEventType,
  FinancialEventRecord,
  BusinessEventIntakeInput,
  DeadLetterRecord,
  PipelineAuditRecord,
  PipelineEventType,
  PipelineStage,
  PipelineProcessingResult,
  PipelineInquiryQuery,
  PublishPipelineEventInput,
} from "@/types/finance-event-pipeline";

export type {
  FinancialEventListItem,
  PipelineInquiryView,
  PipelineAuditView,
  PipelineRegistrationView,
} from "@/lib/finance/models/event-pipeline";

export type {
  FinancialEventRepository,
  DeadLetterRepository,
  PipelineAuditRepository,
  BusinessEventIntakeRepository,
} from "@/lib/finance/repositories/FinancialEventRepository";

export {
  InMemoryChartOfAccountsRepository,
  defaultChartOfAccountsRepository,
} from "@/lib/finance/repositories/InMemoryChartOfAccountsRepository";

export {
  InMemoryGeneralLedgerRepository,
  defaultGeneralLedgerRepository,
} from "@/lib/finance/repositories/InMemoryGeneralLedgerRepository";

export {
  InMemoryPeriodRepository,
  defaultPeriodRepository,
} from "@/lib/finance/repositories/InMemoryPeriodRepository";

export {
  InMemoryFinancialEventRepository,
  InMemoryDeadLetterRepository,
  InMemoryPipelineAuditRepository,
  InMemoryBusinessEventIntakeRepository,
  defaultFinancialEventRepository,
  defaultDeadLetterRepository,
  defaultPipelineAuditRepository,
  defaultBusinessEventIntakeRepository,
} from "@/lib/finance/repositories/InMemoryFinancialEventRepository";

export { DefaultTransformationService } from "@/lib/finance/services/TransformationService";

export { DefaultExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";

export type {
  FinancialKpiKey,
  FinancialKpiRecord,
  FinancialAlertRecord,
  FinancialAlertSeverity,
  FinancialAlertCategory,
  ExecutiveRecommendationRecord,
  FinancialTrendRecord,
  BudgetActualRecord,
  ForecastInterfaceRecord,
  FinancialInsightRecord,
  FinancialIntelligenceEventType,
} from "@/types/finance-executive-intelligence";

export type {
  FinancialExecutiveDashboardView,
  FinancialExecutiveSummary,
  DailyExecutiveSummaryView,
  VarianceAnalysisView,
  TrendAnalysisView,
} from "@/lib/finance/models/executive-intelligence";

export type { FinancialIntelligenceRepository } from "@/lib/finance/repositories/FinancialIntelligenceRepository";

export {
  InMemoryFinancialIntelligenceRepository,
  defaultFinancialIntelligenceRepository,
} from "@/lib/finance/repositories/InMemoryFinancialIntelligenceRepository";
