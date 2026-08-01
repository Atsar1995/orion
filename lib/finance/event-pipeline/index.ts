import { FinancialEventPipelineService } from "@/lib/finance/event-pipeline/FinancialEventPipelineService";
import { defaultTransformationRegistry } from "@/lib/finance/event-pipeline/TransformationRegistry";
import type { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import type {
  BusinessEventIntakeRepository,
  DeadLetterRepository,
  FinancialEventRepository,
  PipelineAuditRepository,
} from "@/lib/finance/repositories/FinancialEventRepository";

/** Public Financial Event Pipeline facade (Mission P-009.6). */
export class FinanceEventPipelineFacade extends FinancialEventPipelineService {
  constructor(
    financialEventRepository: FinancialEventRepository,
    intakeRepository: BusinessEventIntakeRepository,
    deadLetterRepository: DeadLetterRepository,
    auditRepository: PipelineAuditRepository,
    idempotencyRepository: IdempotencyRepository,
    fiscalPeriodService: FiscalPeriodService,
  ) {
    super(
      financialEventRepository,
      intakeRepository,
      deadLetterRepository,
      auditRepository,
      idempotencyRepository,
      fiscalPeriodService,
      defaultTransformationRegistry,
    );
  }
}

export { FinancialEventPipelineService };
