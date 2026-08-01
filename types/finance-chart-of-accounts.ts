/**
 * Finance Domain — Chart of Accounts types (Mission P-009.2).
 * @see docs/Finance/Blueprints/D-009_Enterprise_Ledger_Principles.md
 */

/** Conceptual account classes (D-009 · industry-independent). */
export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense"
  | "statistical";

export type AccountStatus = "active" | "inactive" | "archived";

/** Sub-classification within an account type (e.g. current_asset, operating_expense). */
export type AccountCategory = string;

/** Currency posting rule for an account. */
export type AccountCurrencyRule = "functional_only" | "any" | "transaction_match";

/** Enterprise Chart of Accounts record. */
export type ChartOfAccountRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly accountType: AccountType;
  readonly category: AccountCategory;
  readonly parentAccountId?: string;
  readonly postingAllowed: boolean;
  readonly isControlAccount: boolean;
  readonly currencyRule: AccountCurrencyRule;
  readonly taxApplicable: boolean;
  readonly costCentreRequired: boolean;
  readonly profitCentreRequired: boolean;
  readonly status: AccountStatus;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateChartOfAccountInput = {
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly accountType: AccountType;
  readonly category: AccountCategory;
  readonly parentAccountId?: string;
  readonly postingAllowed?: boolean;
  readonly isControlAccount?: boolean;
  readonly currencyRule?: AccountCurrencyRule;
  readonly taxApplicable?: boolean;
  readonly costCentreRequired?: boolean;
  readonly profitCentreRequired?: boolean;
  readonly status?: AccountStatus;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
};

export type ModifyChartOfAccountInput = {
  readonly name?: string;
  readonly description?: string;
  readonly category?: AccountCategory;
  readonly parentAccountId?: string | null;
  readonly postingAllowed?: boolean;
  readonly isControlAccount?: boolean;
  readonly currencyRule?: AccountCurrencyRule;
  readonly taxApplicable?: boolean;
  readonly costCentreRequired?: boolean;
  readonly profitCentreRequired?: boolean;
  readonly status?: AccountStatus;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string | null;
};

export type ChartOfAccountListQuery = {
  readonly accountType?: AccountType;
  readonly category?: AccountCategory;
  readonly status?: AccountStatus;
  readonly parentAccountId?: string | null;
  readonly postingAllowed?: boolean;
  readonly search?: string;
};

/** Standard account numbering class prefix (first digit). */
export const ACCOUNT_NUMBERING_CLASS: Readonly<Record<AccountType, string>> = {
  asset: "1",
  liability: "2",
  equity: "3",
  revenue: "4",
  expense: "5",
  statistical: "9",
};
