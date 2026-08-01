import type { AccountStatus, AccountType, ChartOfAccountRecord } from "@/types/finance-chart-of-accounts";

export type ChartOfAccountListItem = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly accountType: AccountType;
  readonly category: string;
  readonly parentAccountId?: string;
  readonly postingAllowed: boolean;
  readonly isControlAccount: boolean;
  readonly status: AccountStatus;
  readonly depth: number;
  readonly childCount: number;
};

export type ChartOfAccountDetailView = ChartOfAccountRecord & {
  readonly parentCode?: string;
  readonly parentName?: string;
  readonly childAccountIds: readonly string[];
  readonly hierarchyPath: readonly string[];
};

export type ChartOfAccountHierarchyNode = {
  readonly account: ChartOfAccountListItem;
  readonly children: readonly ChartOfAccountHierarchyNode[];
};

export type ChartOfAccountListView = {
  readonly total: number;
  readonly items: readonly ChartOfAccountListItem[];
  readonly byType: Readonly<Record<AccountType, number>>;
};
