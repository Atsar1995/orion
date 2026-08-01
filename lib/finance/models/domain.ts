import type { FinanceDomainStatus, FinanceWorkspaceBootstrap } from "@/types/finance-core";

/** View model for workspace bootstrap status. */
export type FinanceWorkspaceView = FinanceWorkspaceBootstrap & {
  readonly domainStatus: FinanceDomainStatus;
};

/** Finance domain module descriptor for executive surfaces. */
export type FinanceModuleDescriptor = {
  readonly key: string;
  readonly label: string;
  readonly implemented: boolean;
};
