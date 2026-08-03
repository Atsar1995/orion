import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { canUsePostgresFinancePersistence } from "@/lib/finance/persistence/financePostgresPersistence";
import { PostgresChartOfAccountsRepository } from "@/lib/finance/persistence/PostgresChartOfAccountsRepository";
import { PostgresIdempotencyRepository } from "@/lib/finance/persistence/PostgresIdempotencyRepository";
import { PostgresPeriodRepository } from "@/lib/finance/persistence/PostgresPeriodRepository";
import { InMemoryChartOfAccountsRepository } from "@/lib/finance/repositories/InMemoryChartOfAccountsRepository";
import {
  InMemoryBusinessEventIntakeRepository,
  InMemoryDeadLetterRepository,
  InMemoryFinancialEventRepository,
  InMemoryPipelineAuditRepository,
} from "@/lib/finance/repositories/InMemoryFinancialEventRepository";
import { InMemoryFinancialIntelligenceRepository } from "@/lib/finance/repositories/InMemoryFinancialIntelligenceRepository";
import { InMemoryGeneralLedgerRepository } from "@/lib/finance/repositories/InMemoryGeneralLedgerRepository";
import { InMemoryIdempotencyRepository } from "@/lib/finance/repositories/InMemoryIdempotencyRepository";
import { InMemoryPeriodRepository } from "@/lib/finance/repositories/InMemoryPeriodRepository";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Wave A Finance repository bundle wired to a shared store backing. */
export type FinanceRepositories = {
  readonly chartOfAccounts: ChartOfAccountsRepository;
  readonly generalLedger: InMemoryGeneralLedgerRepository;
  readonly period: PeriodRepository;
  readonly idempotency: IdempotencyRepository;
  readonly financialEvent: InMemoryFinancialEventRepository;
  readonly deadLetter: InMemoryDeadLetterRepository;
  readonly pipelineAudit: InMemoryPipelineAuditRepository;
  readonly businessEventIntake: InMemoryBusinessEventIntakeRepository;
  readonly financialIntelligence: InMemoryFinancialIntelligenceRepository;
};

export type CreateFinanceRepositoriesOptions = {
  readonly platformStore?: PlatformStore;
  readonly connection?: DatabaseConnection;
};

/** Creates Wave A Finance repositories against a shared PlatformStore backing. */
export function createFinanceRepositories(
  store: FinanceStoreBacking,
  options?: CreateFinanceRepositoriesOptions,
): FinanceRepositories {
  const transactionManager = options?.platformStore?.getTransactionManager();

  if (
    options?.platformStore &&
    options.connection &&
    transactionManager &&
    canUsePostgresFinancePersistence(options.platformStore, options.connection)
  ) {
    return {
      chartOfAccounts: new PostgresChartOfAccountsRepository(
        store,
        options.connection,
        transactionManager,
      ),
      generalLedger: new InMemoryGeneralLedgerRepository(store),
      period: new PostgresPeriodRepository(store, options.connection, transactionManager),
      idempotency: new PostgresIdempotencyRepository(store, options.connection, transactionManager),
      financialEvent: new InMemoryFinancialEventRepository(store),
      deadLetter: new InMemoryDeadLetterRepository(store),
      pipelineAudit: new InMemoryPipelineAuditRepository(store),
      businessEventIntake: new InMemoryBusinessEventIntakeRepository(store),
      financialIntelligence: new InMemoryFinancialIntelligenceRepository(store),
    };
  }

  return {
    chartOfAccounts: new InMemoryChartOfAccountsRepository(store),
    generalLedger: new InMemoryGeneralLedgerRepository(store),
    period: new InMemoryPeriodRepository(store),
    idempotency: new InMemoryIdempotencyRepository(store),
    financialEvent: new InMemoryFinancialEventRepository(store),
    deadLetter: new InMemoryDeadLetterRepository(store),
    pipelineAudit: new InMemoryPipelineAuditRepository(store),
    businessEventIntake: new InMemoryBusinessEventIntakeRepository(store),
    financialIntelligence: new InMemoryFinancialIntelligenceRepository(store),
  };
}
