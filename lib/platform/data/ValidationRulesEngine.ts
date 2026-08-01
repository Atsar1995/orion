import type {
  RegisterValidationPolicyInput,
  RegisterValidationRuleInput,
  ValidationPolicyRecord,
  ValidationRuleRecord,
} from "@/types/enterprise-data-validation";

export type ValidationRuleError = {
  readonly code: string;
  readonly message: string;
};

/** Validation rule and policy registration checks (Mission P-011.4). */
export class ValidationRulesEngine {
  validateRuleRegistration(input: RegisterValidationRuleInput): ValidationRuleError[] {
    const errors: ValidationRuleError[] = [];
    if (!input.ruleGroupId.trim()) errors.push({ code: "INVALID_RULE_GROUP", message: "Rule group is required." });
    if (!input.code.trim()) errors.push({ code: "INVALID_RULE_CODE", message: "Rule code is required." });
    if (!input.message.trim()) errors.push({ code: "INVALID_RULE_MESSAGE", message: "Rule message is required." });
    return errors;
  }

  validatePolicyRegistration(input: RegisterValidationPolicyInput): ValidationRuleError[] {
    const errors: ValidationRuleError[] = [];
    if (!input.name.trim()) errors.push({ code: "INVALID_POLICY_NAME", message: "Policy name is required." });
    if (input.ruleGroupIds.length === 0) {
      errors.push({ code: "INVALID_POLICY_RULES", message: "At least one rule group is required." });
    }
    return errors;
  }

  validateRuleGroupReferences(
    ruleGroupIds: readonly string[],
    resolveGroup: (id: string) => boolean,
  ): ValidationRuleError | null {
    for (const groupId of ruleGroupIds) {
      if (!resolveGroup(groupId)) {
        return { code: "INVALID_RULE_GROUP_REF", message: `Rule group not found: ${groupId}` };
      }
    }
    return null;
  }

  validateDuplicateRuleCode(
    code: string,
    existingRules: readonly ValidationRuleRecord[],
    excludeRuleId?: string,
  ): ValidationRuleError | null {
    const duplicate = existingRules.find((r) => r.code === code && r.id !== excludeRuleId);
    if (duplicate) {
      return { code: "DUPLICATE_RULE_CODE", message: `Validation rule code already exists: ${code}` };
    }
    return null;
  }

  resolvePolicyRules(
    policy: ValidationPolicyRecord,
    allRules: readonly ValidationRuleRecord[],
    ruleGroupIds: readonly string[],
  ): ValidationRuleRecord[] {
    const groupSet = new Set(ruleGroupIds);
    return allRules.filter((rule) => groupSet.has(rule.ruleGroupId) && rule.active);
  }
}

export const validationRulesEngine = new ValidationRulesEngine();
