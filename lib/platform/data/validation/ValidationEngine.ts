import { randomUUID } from "crypto";
import type {
  ValidateEntityInput,
  ValidationIssue,
  ValidationOutcome,
  ValidationPolicyRecord,
  ValidationReport,
  ValidationRuleRecord,
  ValidationTraceEntry,
} from "@/types/enterprise-data-validation";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import { createValidationReportId } from "@/lib/platform/data/repositories/InMemoryValidationRepository";
import {
  CanonicalModelValidationStage,
  CrossEntityValidationStage,
  GovernanceValidationStage,
  InputValidationStage,
  MetadataValidationStage,
  OrganizationValidationStage,
  PublicationValidationStage,
  ReferenceValidationStage,
  type StageValidationContext,
  type ValidationStageHandler,
} from "@/lib/platform/data/validation/ValidationPipeline";
import { validationRulesEngine } from "@/lib/platform/data/ValidationRulesEngine";
import type { ServiceContext } from "@/types/services";

export type PipelineRunResult = {
  readonly report: ValidationReport;
  readonly eventType: "ValidationPassed" | "ValidationFailed" | "ValidationWarning";
};

/** Chain-of-responsibility validation engine (Mission P-011.4). */
export class ValidationEngine {
  private readonly stages: readonly ValidationStageHandler[];

  constructor(
    private readonly validationRepository: ValidationRepository,
    masterRepository: MasterEntityRepository,
  ) {
    this.stages = [
      new InputValidationStage(),
      new MetadataValidationStage(),
      new CanonicalModelValidationStage(masterRepository),
      new ReferenceValidationStage(),
      new OrganizationValidationStage(),
      new CrossEntityValidationStage(masterRepository),
      new GovernanceValidationStage(),
      new PublicationValidationStage(),
    ];
  }

  run(input: ValidateEntityInput, context: ServiceContext): PipelineRunResult {
    const policy = this.resolvePolicy(input, context);
    const rules = this.resolveRules(policy);
    const continueOnWarning = input.continueOnWarning ?? policy?.continueOnWarning ?? false;

    const stageContext: StageValidationContext = {
      input,
      context,
      rules,
      continueOnWarning,
    };

    const allIssues: ValidationIssue[] = [];
    const trace: ValidationTraceEntry[] = [];

    for (const stage of this.stages) {
      const started = Date.now();
      const result = stage.validate(stageContext);
      const errors = result.issues.filter((i) => i.severity === "error");
      const warnings = result.issues.filter((i) => i.severity === "warning");

      let outcome: ValidationOutcome = "passed";
      if (result.skipped && result.issues.length === 0) outcome = "skipped";
      else if (errors.length > 0) outcome = "failed";
      else if (warnings.length > 0) outcome = "warning";
      else if (result.issues.some((i) => i.severity === "info")) outcome = "informational";

      trace.push({
        stage: result.stage,
        outcome,
        durationMs: Date.now() - started,
        issueCount: result.issues.length,
      });

      allIssues.push(...result.issues);

      if (errors.length > 0) break;
      if (warnings.length > 0 && !continueOnWarning) break;
    }

    const hasErrors = allIssues.some((i) => i.severity === "error");
    const hasWarnings = allIssues.some((i) => i.severity === "warning");
    const passed = !hasErrors && (!hasWarnings || continueOnWarning);

    let overallOutcome: ValidationOutcome = "passed";
    if (hasErrors) overallOutcome = "failed";
    else if (hasWarnings) overallOutcome = "warning";

    const correlationId = input.correlationId ?? `corr-${randomUUID()}`;

    const report: ValidationReport = {
      id: createValidationReportId(),
      organizationId: context.organizationId,
      entityType: input.entityType,
      entityId: input.entityId,
      domainKey: input.domainKey,
      operation: input.operation,
      passed,
      overallOutcome,
      issues: allIssues,
      trace,
      policyId: policy?.id,
      correlationId,
      createdAt: new Date().toISOString(),
    };

    this.validationRepository.saveReport(report);

    let eventType: PipelineRunResult["eventType"] = "ValidationPassed";
    if (hasErrors) eventType = "ValidationFailed";
    else if (hasWarnings) eventType = "ValidationWarning";

    return { report, eventType };
  }

  private resolvePolicy(input: ValidateEntityInput, context: ServiceContext): ValidationPolicyRecord | null {
    if (input.policyId) {
      const policy = this.validationRepository.findPolicy(input.policyId);
      if (policy?.active) return policy;
    }

    const policies = this.validationRepository.listPolicies(context.organizationId);
    const orgPolicy = policies.find(
      (p) => p.scope === "organization" && p.organizationId === context.organizationId,
    );
    if (orgPolicy) return orgPolicy;

    return policies.find((p) => p.scope === "global") ?? null;
  }

  private resolveRules(policy: ValidationPolicyRecord | null): ValidationRuleRecord[] {
    if (!policy) {
      return [...this.validationRepository.listRules()];
    }

    const allRules = this.validationRepository.listRules({ includeInactive: false });
    return validationRulesEngine.resolvePolicyRules(policy, allRules, policy.ruleGroupIds);
  }
}
