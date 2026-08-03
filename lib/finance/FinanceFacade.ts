import {
  FINANCE_BASE_PATH,
  FINANCE_IIL_SERVICE_ID,
  FINANCE_MISSION_EXECUTIVE_INTELLIGENCE,
  FINANCE_MODULE_KEY,
  FINANCE_WORKSPACE_ID,
  FINANCE_WORKSPACE_LABEL,
} from "@/lib/finance/constants";
import { createFinanceWiring, type FinanceWiring } from "@/lib/finance/createFinanceWiring";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";
import { FINANCE_FOUNDATION_CAPABILITIES } from "@/lib/finance/models/workspace";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import type { FinanceWorkspaceView } from "@/lib/finance/models/domain";
import type { TransformationService } from "@/lib/finance/services/TransformationService";
import type { ExecutiveIntelligenceService } from "@/lib/finance/services/ExecutiveIntelligenceService";
import type { FinanceDomainStatus, FinanceWorkspaceBootstrap } from "@/types/finance-core";
import type { ServiceContext } from "@/types/services";
import type { FinanceChartOfAccountsFacade } from "@/lib/finance/chart-of-accounts";
import type { FinanceEventPipelineFacade } from "@/lib/finance/event-pipeline";
import type { FinanceExecutiveIntelligenceFacade } from "@/lib/finance/executive-intelligence";
import type { FinanceFiscalPeriodFacade } from "@/lib/finance/fiscal-period";
import type { FinanceGeneralLedgerFacade } from "@/lib/finance/general-ledger";

function createDefaultFinanceWiring(): FinanceWiring {
  return createFinanceWiring(
    new InMemoryPlatformStore({ financeStore: getDefaultFinanceBacking() }),
  );
}

/** Public Finance Domain facade (Mission P-009.1 · P-009.7 · P-009.5 Wave A). */
export class FinanceFacade {
  readonly validation;
  readonly events;
  readonly chartOfAccounts: FinanceChartOfAccountsFacade;
  readonly generalLedger: FinanceGeneralLedgerFacade;
  readonly fiscalPeriod: FinanceFiscalPeriodFacade;
  readonly eventPipeline: FinanceEventPipelineFacade;
  readonly executiveIntelligence: FinanceExecutiveIntelligenceFacade;
  readonly transformation: TransformationService;
  readonly intelligence: ExecutiveIntelligenceService;
  readonly journal;
  readonly posting;
  readonly budget;
  readonly forecast;
  readonly tax;
  readonly reconciliation;

  constructor(wiring: FinanceWiring = createDefaultFinanceWiring()) {
    this.validation = wiring.validation;
    this.events = wiring.events;
    this.chartOfAccounts = wiring.chartOfAccountsFacade;
    this.generalLedger = wiring.generalLedgerFacade;
    this.fiscalPeriod = wiring.fiscalPeriodFacade;
    this.eventPipeline = wiring.eventPipelineFacade;
    this.executiveIntelligence = wiring.executiveIntelligenceFacade;
    this.transformation = wiring.transformation;
    this.intelligence = wiring.intelligence;
    this.journal = wiring.journal;
    this.posting = wiring.posting;
    this.budget = wiring.budget;
    this.forecast = wiring.forecast;
    this.tax = wiring.tax;
    this.reconciliation = wiring.reconciliation;
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

export { createFinanceWiring, type FinanceWiring } from "@/lib/finance/createFinanceWiring";
