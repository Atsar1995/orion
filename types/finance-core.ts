/**
 * Finance Domain — core types (Mission P-009.1).
 * @see docs/Finance/Blueprints/D-007_Finance_Domain_Blueprint.md
 */

/** Lifecycle state of Finance domain capability modules. */
export type FinanceCapabilityStatus = "foundation" | "planned" | "active" | "deprecated";

/** Organization-scoped finance entity base. */
export type FinanceScopedRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Finance workspace bootstrap metadata. */
export type FinanceWorkspaceBootstrap = {
  readonly workspaceId: string;
  readonly moduleKey: string;
  readonly label: string;
  readonly basePath: string;
  readonly iilServiceId: string;
  readonly mission: string;
  readonly capabilities: readonly FinanceCapabilityDescriptor[];
};

export type FinanceCapabilityDescriptor = {
  readonly key: string;
  readonly label: string;
  readonly status: FinanceCapabilityStatus;
  readonly mission?: string;
};

/** Domain readiness snapshot for certification. */
export type FinanceDomainStatus = {
  readonly foundationComplete: boolean;
  readonly chartOfAccountsImplemented: boolean;
  readonly ledgerImplemented: boolean;
  readonly fiscalPeriodImplemented: boolean;
  readonly eventPipelineImplemented: boolean;
  readonly executiveIntelligenceImplemented: boolean;
  readonly eventPipelineReady: boolean;
  readonly validationFrameworkReady: boolean;
  readonly readyForChartOfAccounts: boolean;
  readonly readyForGeneralLedger: boolean;
  readonly readyForJournalEngine: boolean;
  readonly readyForEventPipeline: boolean;
  readonly readyForExecutiveIntelligence: boolean;
  readonly readyForCertification: boolean;
};
