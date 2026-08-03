import { FinanceChartOfAccountsFacade } from "@/lib/finance/chart-of-accounts";
import { FinanceEventPipelineFacade } from "@/lib/finance/event-pipeline";
import { FinanceExecutiveIntelligenceFacade } from "@/lib/finance/executive-intelligence";
import { FinanceFiscalPeriodFacade } from "@/lib/finance/fiscal-period";
import { FinanceGeneralLedgerFacade } from "@/lib/finance/general-ledger";
import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import {
  createFinanceRepositories,
  type FinanceRepositories,
} from "@/lib/finance/persistence/createFinanceRepositories";
import {
  createFinancePersistenceRepositories,
  type FinancePersistenceRepositories,
} from "@/lib/finance/persistence/createFinancePersistenceRepositories";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { defaultEventService } from "@/lib/finance/services/DefaultEventService";
import { setFinanceEventPipelineService } from "@/lib/finance/services/financeEventPipelineRegistry";
import { defaultValidationService } from "@/lib/finance/services/DefaultValidationService";
import { DefaultTransformationService } from "@/lib/finance/services/TransformationService";
import { DefaultExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";
import { stubBudgetService } from "@/lib/finance/services/BudgetService";
import { stubForecastService } from "@/lib/finance/services/ForecastService";
import { GeneralLedgerPostingService } from "@/lib/finance/services/GeneralLedgerPostingService";
import { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
import { DefaultPostingService } from "@/lib/finance/services/PostingService";
import { PostingValidationPipeline } from "@/lib/finance/services/PostingValidationPipeline";
import { PostingValidationService } from "@/lib/finance/services/PostingValidationService";
import { stubJournalService } from "@/lib/finance/services/JournalService";
import { FinanceEventConsumer } from "@/lib/finance/integration/FinanceEventConsumer";
import {
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration/financeIntegrationRegistry";
import { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
import { stubReconciliationService } from "@/lib/finance/services/ReconciliationService";
import { stubTaxService } from "@/lib/finance/services/TaxService";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Finance composition root — PlatformStore-backed dependency injection (Mission P-009.5 Wave A). */
export type FinanceWiring = FinanceRepositories &
  FinancePersistenceRepositories & {
  readonly platformStore: PlatformStore;
  readonly backing: FinanceStoreBacking;
  readonly chartOfAccountsFacade: FinanceChartOfAccountsFacade;
  readonly generalLedgerFacade: FinanceGeneralLedgerFacade;
  readonly fiscalPeriodFacade: FinanceFiscalPeriodFacade;
  readonly eventPipelineFacade: FinanceEventPipelineFacade;
  readonly executiveIntelligenceFacade: FinanceExecutiveIntelligenceFacade;
  readonly transformation: DefaultTransformationService;
  readonly intelligence: DefaultExecutiveIntelligenceService;
  readonly validation: typeof defaultValidationService;
  readonly events: typeof defaultEventService;
  readonly journal: typeof stubJournalService;
  readonly journalPosting: JournalPostingService;
  readonly generalLedgerPosting: GeneralLedgerPostingService;
  readonly postingValidation: PostingValidationPipeline;
  readonly posting: DefaultPostingService;
  readonly financeInboundProcessor: FinanceInboundProcessor;
  readonly financeEventConsumer: FinanceEventConsumer;
  readonly budget: typeof stubBudgetService;
  readonly forecast: typeof stubForecastService;
  readonly tax: typeof stubTaxService;
  readonly reconciliation: typeof stubReconciliationService;
};

/** Centralized Finance dependency wiring — internal composition root. */
export function createFinanceWiring(platformStore: PlatformStore): FinanceWiring {
  const backing = ensureFinancePlatformBacking(platformStore);
  const connection = platformStore.getDatabaseConnection?.() ?? undefined;
  const repositories = createFinanceRepositories(backing, { platformStore, connection });
  const persistenceRepositories = createFinancePersistenceRepositories({
    platformStore,
    connection,
  });

  const chartOfAccountsFacade = new FinanceChartOfAccountsFacade(repositories.chartOfAccounts);
  const fiscalPeriodFacade = new FinanceFiscalPeriodFacade(repositories.period);
  const generalLedgerFacade = new FinanceGeneralLedgerFacade(
    repositories.generalLedger,
    repositories.period,
    repositories.chartOfAccounts,
  );
  const eventPipelineFacade = new FinanceEventPipelineFacade(
    repositories.financialEvent,
    repositories.businessEventIntake,
    repositories.deadLetter,
    repositories.pipelineAudit,
    repositories.idempotency,
    fiscalPeriodFacade,
  );
  setFinanceEventPipelineService(eventPipelineFacade);
  const executiveIntelligenceFacade = new FinanceExecutiveIntelligenceFacade(
    repositories.financialIntelligence,
    generalLedgerFacade,
    fiscalPeriodFacade,
  );

  const transformation = new DefaultTransformationService(eventPipelineFacade, defaultEventService);
  const intelligence = new DefaultExecutiveIntelligenceService(
    executiveIntelligenceFacade,
    eventPipelineFacade,
  );

  const generalLedgerPostingService = new GeneralLedgerPostingService(
    persistenceRepositories.journalRepository,
    repositories.generalLedger,
  );
  const postingValidationService = new PostingValidationService(
    repositories.chartOfAccounts,
    repositories.idempotency,
    persistenceRepositories.eventLineageRepository,
    repositories.generalLedger,
    repositories.financialIntelligence,
    repositories.period,
  );
  const postingValidationPipeline = new PostingValidationPipeline(postingValidationService);
  const journalPostingService = new JournalPostingService(
    persistenceRepositories.journalRepository,
    persistenceRepositories.eventLineageRepository,
    generalLedgerPostingService,
    postingValidationPipeline,
    platformStore.getTransactionManager(),
  );
  const postingService = new DefaultPostingService(journalPostingService);
  const financeInboundProcessor = new FinanceInboundProcessor(
    persistenceRepositories.journalRepository,
    persistenceRepositories.eventLineageRepository,
    journalPostingService,
  );
  const financeEventConsumer = new FinanceEventConsumer(financeInboundProcessor);
  setFinanceInboundProcessor(financeInboundProcessor);
  setFinanceEventConsumer(financeEventConsumer);

  return {
    platformStore,
    backing,
    ...repositories,
    ...persistenceRepositories,
    chartOfAccountsFacade,
    generalLedgerFacade,
    fiscalPeriodFacade,
    eventPipelineFacade,
    executiveIntelligenceFacade,
    transformation,
    intelligence,
    validation: defaultValidationService,
    events: defaultEventService,
    journal: stubJournalService,
    journalPosting: journalPostingService,
    generalLedgerPosting: generalLedgerPostingService,
    postingValidation: postingValidationPipeline,
    posting: postingService,
    financeInboundProcessor,
    financeEventConsumer,
    budget: stubBudgetService,
    forecast: stubForecastService,
    tax: stubTaxService,
    reconciliation: stubReconciliationService,
  };
}
