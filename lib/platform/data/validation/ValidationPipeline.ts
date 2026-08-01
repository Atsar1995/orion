import type {
  ValidateEntityInput,
  ValidationIssue,
  ValidationRuleRecord,
  ValidationStage,
} from "@/types/enterprise-data-validation";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import { dataRulesEngine } from "@/lib/platform/data/DataRulesEngine";
import type { ServiceContext } from "@/types/services";

export type StageValidationContext = {
  readonly input: ValidateEntityInput;
  readonly context: ServiceContext;
  readonly rules: readonly ValidationRuleRecord[];
  readonly continueOnWarning: boolean;
};

export type StageValidationResult = {
  readonly stage: ValidationStage;
  readonly issues: readonly ValidationIssue[];
  readonly skipped: boolean;
};

/** Chain-of-responsibility validation stage. */
export type ValidationStageHandler = {
  readonly stage: ValidationStage;
  validate(ctx: StageValidationContext): StageValidationResult;
};

function rulesForStage(
  rules: readonly ValidationRuleRecord[],
  stage: ValidationStage,
  input: ValidateEntityInput,
  organizationId: string,
): ValidationRuleRecord[] {
  return rules.filter(
    (rule) =>
      rule.stage === stage &&
      rule.active &&
      (!rule.organizationId || rule.organizationId === organizationId) &&
      (!rule.entityType || rule.entityType === input.entityType) &&
      (!rule.domainKey || rule.domainKey === input.domainKey),
  );
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Input validation stage. */
export class InputValidationStage implements ValidationStageHandler {
  readonly stage = "input" as const;

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);

    for (const rule of stageRules) {
      if (rule.ruleType === "required_field" && rule.attributeName) {
        const value = asString(ctx.input.payload[rule.attributeName]).trim();
        if (!value) {
          issues.push({
            code: rule.code,
            message: rule.message,
            field: rule.attributeName,
            severity: "error",
            stage: this.stage,
            ruleId: rule.id,
          });
        }
      }

      if (rule.ruleType === "length_constraint" && rule.attributeName) {
        const value = asString(ctx.input.payload[rule.attributeName]);
        const maxLength = Number(rule.config?.maxLength ?? 0);
        if (maxLength > 0 && value.length > maxLength) {
          issues.push({
            code: rule.code,
            message: rule.message,
            field: rule.attributeName,
            severity: "error",
            stage: this.stage,
            ruleId: rule.id,
          });
        }
      }
    }

    if (!ctx.input.domainKey.trim()) {
      issues.push({
        code: "INP_REQUIRED_DOMAIN",
        message: "Domain key is required.",
        field: "domainKey",
        severity: "error",
        stage: this.stage,
      });
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 && issues.length === 0 };
  }
}

/** Metadata validation stage (metadata-first checks). */
export class MetadataValidationStage implements ValidationStageHandler {
  readonly stage = "metadata" as const;

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);

    for (const rule of stageRules) {
      if (rule.ruleType === "metadata_compliance") {
        issues.push({
          code: rule.code,
          message: rule.message,
          severity: "warning",
          stage: this.stage,
          ruleId: rule.id,
        });
      }
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 };
  }
}

/** Canonical model validation stage. */
export class CanonicalModelValidationStage implements ValidationStageHandler {
  readonly stage = "canonical_model" as const;

  constructor(private readonly masterRepository: MasterEntityRepository) {}

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);
    const registered = this.masterRepository.findEntityType(ctx.input.entityType) !== null;

    for (const rule of stageRules) {
      if (rule.ruleType === "canonical_model_compliance" && !registered) {
        issues.push({
          code: rule.code,
          message: rule.message,
          field: "entityType",
          severity: "error",
          stage: this.stage,
          ruleId: rule.id,
        });
      }
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 && issues.length === 0 };
  }
}

/** Reference validation stage. */
export class ReferenceValidationStage implements ValidationStageHandler {
  readonly stage = "reference" as const;

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);

    for (const rule of stageRules) {
      if (rule.ruleType === "reference_integrity" && rule.attributeName) {
        const refValue = asString(ctx.input.payload[rule.attributeName]).trim();
        if (refValue && rule.config?.required === "true" && !refValue) {
          issues.push({
            code: rule.code,
            message: rule.message,
            field: rule.attributeName,
            severity: "error",
            stage: this.stage,
            ruleId: rule.id,
          });
        }
      }
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 };
  }
}

/** Organization validation stage. */
export class OrganizationValidationStage implements ValidationStageHandler {
  readonly stage = "organization" as const;

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);

    for (const rule of stageRules) {
      if (rule.ruleType === "organization_scope") {
        const payloadOrg = asString(ctx.input.payload.organizationId);
        if (payloadOrg && payloadOrg !== ctx.context.organizationId && ctx.context.role !== "super_admin") {
          issues.push({
            code: "ORG_SCOPE_MISMATCH",
            message: "Payload organization does not match request context.",
            field: "organizationId",
            severity: "error",
            stage: this.stage,
            ruleId: rule.id,
          });
        }
      }
    }

    if (!ctx.context.organizationId.trim()) {
      issues.push({
        code: "ORG_CONTEXT_REQUIRED",
        message: "Organization context is required.",
        severity: "error",
        stage: this.stage,
      });
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 && issues.length === 0 };
  }
}

/** Cross-entity validation including duplicate detection. */
export class CrossEntityValidationStage implements ValidationStageHandler {
  readonly stage = "cross_entity" as const;

  constructor(private readonly masterRepository: MasterEntityRepository) {}

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);
    const businessKey = asString(ctx.input.payload.businessKey).trim();

    if (ctx.input.operation === "create" && businessKey) {
      const existing = this.masterRepository.findByBusinessKey(
        ctx.context.organizationId,
        ctx.input.entityType,
        businessKey,
      );
      if (existing) {
        const dupRule = stageRules.find((r) => r.ruleType === "duplicate_detection");
        issues.push({
          code: dupRule?.code ?? "DUP_BUSINESS_KEY",
          message: dupRule?.message ?? "Duplicate business key detected.",
          field: "businessKey",
          severity: "error",
          stage: this.stage,
          ruleId: dupRule?.id,
        });
      }

      const fingerprint = dataRulesEngine.buildFingerprint(
        ctx.context.organizationId,
        ctx.input.entityType,
        businessKey,
      );
      const duplicate = this.masterRepository.findDuplicateFingerprint(
        ctx.context.organizationId,
        fingerprint,
      );
      if (duplicate && duplicate.id !== ctx.input.entityId) {
        issues.push({
          code: "DUP_FINGERPRINT",
          message: "Duplicate entity fingerprint detected.",
          field: "businessKey",
          severity: "error",
          stage: this.stage,
        });
      }
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 && issues.length === 0 };
  }
}

/** Governance validation stage. */
export class GovernanceValidationStage implements ValidationStageHandler {
  readonly stage = "governance" as const;

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];
    const stageRules = rulesForStage(ctx.rules, this.stage, ctx.input, ctx.context.organizationId);

    for (const rule of stageRules) {
      if (rule.ruleType === "custom" && rule.config?.requiredDomainKey) {
        if (ctx.input.domainKey !== rule.config.requiredDomainKey) {
          issues.push({
            code: rule.code,
            message: rule.message,
            field: "domainKey",
            severity: "error",
            stage: this.stage,
            ruleId: rule.id,
          });
        }
      }
    }

    return { stage: this.stage, issues, skipped: stageRules.length === 0 };
  }
}

/** Publication decision stage. */
export class PublicationValidationStage implements ValidationStageHandler {
  readonly stage = "publication" as const;

  validate(ctx: StageValidationContext): StageValidationResult {
    const issues: ValidationIssue[] = [];

    if (ctx.input.operation === "merge" && !ctx.input.entityId) {
      issues.push({
        code: "PUB_MERGE_REQUIRES_ID",
        message: "Merge operations require an entity identifier.",
        field: "entityId",
        severity: "error",
        stage: this.stage,
      });
    }

    return { stage: this.stage, issues, skipped: false };
  }
}
