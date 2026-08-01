import type {
  RegisterValidationRuleInput,
  ValidationRegistryQuery,
  ValidationRuleRecord,
} from "@/types/enterprise-data-validation";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import {
  createValidationRuleId,
} from "@/lib/platform/data/repositories/InMemoryValidationRepository";
import { validationRulesEngine } from "@/lib/platform/data/ValidationRulesEngine";
import type { ServiceContext } from "@/types/services";

/** Validation rule management (Mission P-011.4). */
export class ValidationRuleService {
  constructor(private readonly repository: ValidationRepository) {}

  listRules(query: ValidationRegistryQuery = {}): readonly ValidationRuleRecord[] {
    return this.repository.listRules(query);
  }

  getRule(ruleId: string): ValidationRuleRecord | null {
    return this.repository.findRule(ruleId);
  }

  registerRule(input: RegisterValidationRuleInput, context: ServiceContext): ValidationRuleRecord {
    const errors = validationRulesEngine.validateRuleRegistration(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const group = this.repository.findRuleGroup(input.ruleGroupId);
    if (!group) throw new Error("INVALID_RULE_GROUP_REF");

    if (group.organizationId && group.organizationId !== context.organizationId) {
      throw new Error("ORGANIZATION_ISOLATION");
    }

    const duplicate = validationRulesEngine.validateDuplicateRuleCode(
      input.code,
      this.repository.listRules({ includeInactive: true }),
    );
    if (duplicate) throw new Error(duplicate.code);

    const now = new Date().toISOString();
    const rule: ValidationRuleRecord = {
      id: createValidationRuleId(),
      ruleGroupId: input.ruleGroupId,
      organizationId: group.organizationId ?? context.organizationId,
      ruleType: input.ruleType,
      entityType: input.entityType,
      attributeName: input.attributeName,
      domainKey: input.domainKey,
      stage: input.stage,
      code: input.code,
      message: input.message,
      config: input.config,
      active: true,
      priority: input.priority ?? 100,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.saveRule(rule);
  }

  deactivateRule(ruleId: string, context: ServiceContext): ValidationRuleRecord {
    const existing = this.repository.findRule(ruleId);
    if (!existing) throw new Error("RULE_NOT_FOUND");
    if (existing.organizationId && existing.organizationId !== context.organizationId) {
      throw new Error("ORGANIZATION_ISOLATION");
    }

    return this.repository.saveRule({
      ...existing,
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }
}
