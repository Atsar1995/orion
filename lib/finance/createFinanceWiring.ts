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
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { defaultEventService } from "@/lib/finance/services/DefaultEventService";
import { setFinanceEventPipelineService } from "@/lib/finance/services/financeEventPipelineRegistry";
import { defaultValidationService } from "@/lib/finance/services/DefaultValidationService";
import { DefaultTransformationService } from "@/lib/finance/services/TransformationService";
import { DefaultExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";
import { stubBudgetService } from "@/lib/finance/services/BudgetService";
import { stubForecastService } from "@/lib/finance/services/ForecastService";
import { stubJournalService } from "@/lib/finance/services/JournalService";
import { stubPostingService } from "@/lib/finance/services/PostingService";
import { stubReconciliationService } from "@/lib/finance/services/ReconciliationService";
import { stubTaxService } from "@/lib/finance/services/TaxService";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Finance composition root — PlatformStore-backed dependency injection (Mission P-009.5 Wave A). */
export type FinanceWiring = FinanceRepositories & {
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
  readonly posting: typeof stubPostingService;
  readonly budget: typeof stubBudgetService;
  readonly forecast: typeof stubForecastService;
  readonly tax: typeof stubTaxService;
  readonly reconciliation: typeof stubReconciliationService;
};

/** Centralized Finance dependency wiring — internal composition root. */
export function createFinanceWiring(platformStore: PlatformStore): FinanceWiring {
  const backing = ensureFinancePlatformBacking(platformStore);
  const repositories = createFinanceRepositories(backing);

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

  return {
    platformStore,
    backing,
    ...repositories,
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
    posting: stubPostingService,
    budget: stubBudgetService,
    forecast: stubForecastService,
    tax: stubTaxService,
    reconciliation: stubReconciliationService,
  };
}
