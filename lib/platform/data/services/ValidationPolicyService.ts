import type {
  RegisterValidationPolicyInput,
  ValidationPolicyRecord,
} from "@/types/enterprise-data-validation";
import type { ValidationRepository } from "@/lib/platform/data/repositories/ValidationRepository";
import { createValidationPolicyId } from "@/lib/platform/data/repositories/InMemoryValidationRepository";
import { validationRulesEngine } from "@/lib/platform/data/ValidationRulesEngine";
import type { ServiceContext } from "@/types/services";

/** Validation policy management (Mission P-011.4). */
export class ValidationPolicyService {
  constructor(private readonly repository: ValidationRepository) {}

  listPolicies(context: ServiceContext): readonly ValidationPolicyRecord[] {
    return this.repository.listPolicies(context.organizationId);
  }

  getPolicy(policyId: string, context: ServiceContext): ValidationPolicyRecord | null {
    const policy = this.repository.findPolicy(policyId);
    if (!policy) return null;
    if (
      policy.organizationId &&
      policy.organizationId !== context.organizationId &&
      context.role !== "super_admin"
    ) {
      throw new Error("ORGANIZATION_ISOLATION");
    }
    return policy;
  }

  registerPolicy(input: RegisterValidationPolicyInput, context: ServiceContext): ValidationPolicyRecord {
    const errors = validationRulesEngine.validatePolicyRegistration(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const refError = validationRulesEngine.validateRuleGroupReferences(
      input.ruleGroupIds,
      (id) => this.repository.findRuleGroup(id) !== null,
    );
    if (refError) throw new Error(refError.code);

    const now = new Date().toISOString();
    const policy: ValidationPolicyRecord = {
      id: createValidationPolicyId(),
      scope: input.scope,
      organizationId:
        input.scope === "organization" || input.scope === "domain" || input.scope === "entity"
          ? context.organizationId
          : undefined,
      domainKey: input.domainKey,
      entityType: input.entityType,
      attributeName: input.attributeName,
      name: input.name,
      description: input.description,
      ruleGroupIds: input.ruleGroupIds,
      continueOnWarning: input.continueOnWarning ?? false,
      active: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.savePolicy(policy);
  }
}
