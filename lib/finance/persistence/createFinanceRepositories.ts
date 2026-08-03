import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
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

/** Wave A Finance repository bundle wired to a shared store backing. */
export type FinanceRepositories = {
  readonly chartOfAccounts: InMemoryChartOfAccountsRepository;
  readonly generalLedger: InMemoryGeneralLedgerRepository;
  readonly period: InMemoryPeriodRepository;
  readonly idempotency: InMemoryIdempotencyRepository;
  readonly financialEvent: InMemoryFinancialEventRepository;
  readonly deadLetter: InMemoryDeadLetterRepository;
  readonly pipelineAudit: InMemoryPipelineAuditRepository;
  readonly businessEventIntake: InMemoryBusinessEventIntakeRepository;
  readonly financialIntelligence: InMemoryFinancialIntelligenceRepository;
};

/** Creates Wave A Finance repositories against a shared PlatformStore backing. */
export function createFinanceRepositories(store: FinanceStoreBacking): FinanceRepositories {
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
