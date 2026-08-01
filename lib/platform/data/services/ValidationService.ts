import { randomUUID } from "crypto";
import type { ValidateEntityInput, ValidationReport } from "@/types/enterprise-data-validation";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import { ValidationEngine } from "@/lib/platform/data/validation/ValidationEngine";
import { publishValidationEvent } from "@/lib/platform/data/validation-events";
import type { ServiceContext } from "@/types/services";

/** Primary validation entry point (Mission P-011.4). */
export class ValidationService {
  private readonly engine: ValidationEngine;

  constructor(
    validationRepository: ValidationRepository,
    masterRepository: MasterEntityRepository,
  ) {
    this.engine = new ValidationEngine(validationRepository, masterRepository);
  }

  validate(input: ValidateEntityInput, context: ServiceContext): ValidationReport {
    const { report, eventType } = this.engine.run(input, context);

    publishValidationEvent(
      {
        eventType,
        reportId: report.id,
        entityType: report.entityType,
        entityId: report.entityId,
        correlationId: report.correlationId,
        payload: {
          passed: String(report.passed),
          outcome: report.overallOutcome,
          issueCount: String(report.issues.length),
        },
      },
      context,
    );

    publishValidationEvent(
      {
        eventType: "ValidationReportGenerated",
        reportId: report.id,
        entityType: report.entityType,
        entityId: report.entityId,
        correlationId: report.correlationId,
      },
      context,
    );

    return report;
  }

  validateBatch(
    inputs: readonly ValidateEntityInput[],
    context: ServiceContext,
  ): readonly ValidationReport[] {
    return inputs.map((input) =>
      this.validate({ ...input, correlationId: input.correlationId ?? `corr-${randomUUID()}` }, context),
    );
  }
}
