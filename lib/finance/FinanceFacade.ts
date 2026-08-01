import {
  FINANCE_BASE_PATH,
  FINANCE_IIL_SERVICE_ID,
  FINANCE_MISSION_EXECUTIVE_INTELLIGENCE,
  FINANCE_MODULE_KEY,
  FINANCE_WORKSPACE_ID,
  FINANCE_WORKSPACE_LABEL,
} from "@/lib/finance/constants";
import { FinanceChartOfAccountsFacade } from "@/lib/finance/chart-of-accounts";
import { FinanceEventPipelineFacade } from "@/lib/finance/event-pipeline";
import { FinanceExecutiveIntelligenceFacade } from "@/lib/finance/executive-intelligence";
import { FinanceFiscalPeriodFacade } from "@/lib/finance/fiscal-period";
import { FinanceGeneralLedgerFacade } from "@/lib/finance/general-ledger";
import { defaultEventService } from "@/lib/finance/services/DefaultEventService";
import { defaultValidationService } from "@/lib/finance/services/DefaultValidationService";
import { DefaultTransformationService } from "@/lib/finance/services/TransformationService";
import { DefaultExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";
import { stubBudgetService } from "@/lib/finance/services/BudgetService";
import { stubForecastService } from "@/lib/finance/services/ForecastService";
import { stubJournalService } from "@/lib/finance/services/JournalService";
import { stubPostingService } from "@/lib/finance/services/PostingService";
import { stubReconciliationService } from "@/lib/finance/services/ReconciliationService";
import { stubTaxService } from "@/lib/finance/services/TaxService";
import { FINANCE_FOUNDATION_CAPABILITIES } from "@/lib/finance/models/workspace";
import { defaultChartOfAccountsRepository } from "@/lib/finance/repositories/InMemoryChartOfAccountsRepository";
import { defaultGeneralLedgerRepository } from "@/lib/finance/repositories/InMemoryGeneralLedgerRepository";
import {
  defaultBusinessEventIntakeRepository,
  defaultDeadLetterRepository,
  defaultFinancialEventRepository,
  defaultPipelineAuditRepository,
} from "@/lib/finance/repositories/InMemoryFinancialEventRepository";
import { defaultFinancialIntelligenceRepository } from "@/lib/finance/repositories/InMemoryFinancialIntelligenceRepository";
import { defaultIdempotencyRepository } from "@/lib/finance/repositories/InMemoryIdempotencyRepository";
import { defaultPeriodRepository } from "@/lib/finance/repositories/InMemoryPeriodRepository";
import type { FinanceWorkspaceView } from "@/lib/finance/models/domain";
import type { TransformationService } from "@/lib/finance/services/TransformationService";
import type { ExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";
import type { FinanceDomainStatus, FinanceWorkspaceBootstrap } from "@/types/finance-core";
import type { ServiceContext } from "@/types/services";

/** Public Finance Domain facade (Mission P-009.1 · P-009.7). */
export class FinanceFacade {
  readonly validation = defaultValidationService;
  readonly events = defaultEventService;
  readonly chartOfAccounts: FinanceChartOfAccountsFacade;
  readonly generalLedger: FinanceGeneralLedgerFacade;
  readonly fiscalPeriod: FinanceFiscalPeriodFacade;
  readonly eventPipeline: FinanceEventPipelineFacade;
  readonly executiveIntelligence: FinanceExecutiveIntelligenceFacade;
  readonly transformation: TransformationService;
  readonly intelligence: ExecutiveIntelligenceService;
  readonly journal = stubJournalService;
  readonly posting = stubPostingService;
  readonly budget = stubBudgetService;
  readonly forecast = stubForecastService;
  readonly tax = stubTaxService;
  readonly reconciliation = stubReconciliationService;

  constructor() {
    this.chartOfAccounts = new FinanceChartOfAccountsFacade(defaultChartOfAccountsRepository);
    this.generalLedger = new FinanceGeneralLedgerFacade(
      defaultGeneralLedgerRepository,
      defaultPeriodRepository,
      defaultChartOfAccountsRepository,
    );
    this.fiscalPeriod = new FinanceFiscalPeriodFacade(defaultPeriodRepository);
    this.eventPipeline = new FinanceEventPipelineFacade(
      defaultFinancialEventRepository,
      defaultBusinessEventIntakeRepository,
      defaultDeadLetterRepository,
      defaultPipelineAuditRepository,
      defaultIdempotencyRepository,
      this.fiscalPeriod,
    );
    this.executiveIntelligence = new FinanceExecutiveIntelligenceFacade(
      defaultFinancialIntelligenceRepository,
      this.generalLedger,
      this.fiscalPeriod,
    );
    this.transformation = new DefaultTransformationService(this.eventPipeline, defaultEventService);
    this.intelligence = new DefaultExecutiveIntelligenceService(this.executiveIntelligence, this.eventPipeline);
  }

  getDomainStatus(): FinanceDomainStatus {
    return {
      foundationComplete: true,
      chartOfAccountsImplemented: true,
      ledgerImplemented: true,
      fiscalPeriodImplemented: true,
      eventPipelineImplemented: true,
      executiveIntelligenceImplemented: true,
      eventPipelineReady: true,
      validationFrameworkReady: true,
      readyForChartOfAccounts: true,
      readyForGeneralLedger: true,
      readyForJournalEngine: true,
      readyForEventPipeline: true,
      readyForExecutiveIntelligence: true,
      readyForCertification: true,
    };
  }

  getWorkspaceBootstrap(_context: ServiceContext): FinanceWorkspaceBootstrap {
    return {
      workspaceId: FINANCE_WORKSPACE_ID,
      moduleKey: FINANCE_MODULE_KEY,
      label: FINANCE_WORKSPACE_LABEL,
      basePath: FINANCE_BASE_PATH,
      iilServiceId: FINANCE_IIL_SERVICE_ID,
      mission: FINANCE_MISSION_EXECUTIVE_INTELLIGENCE,
      capabilities: FINANCE_FOUNDATION_CAPABILITIES,
    };
  }

  getWorkspaceView(context: ServiceContext): FinanceWorkspaceView {
    return {
      ...this.getWorkspaceBootstrap(context),
      domainStatus: this.getDomainStatus(),
    };
  }
}

export const financeService = new FinanceFacade();

export const financeChartOfAccountsService = financeService.chartOfAccounts;

export const financeGeneralLedgerService = financeService.generalLedger;

export const financeFiscalPeriodService = financeService.fiscalPeriod;

export const financeEventPipelineService = financeService.eventPipeline;

export const financeExecutiveIntelligenceService = financeService.executiveIntelligence;

export function getFinanceWorkspaceBootstrap(context: ServiceContext): FinanceWorkspaceBootstrap {
  return financeService.getWorkspaceBootstrap(context);
}
