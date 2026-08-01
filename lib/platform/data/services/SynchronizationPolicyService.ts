import type {
  RegisterSyncPolicyInput,
  SynchronizationPolicy,
} from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import { createSyncPolicyId } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { synchronizationRulesEngine } from "@/lib/platform/data/SynchronizationRulesEngine";
import type { ServiceContext } from "@/types/services";

/** Synchronization policy management (Mission P-011.5). */
export class SynchronizationPolicyService {
  constructor(private readonly repository: SynchronizationRepository) {}

  listPolicies(context: ServiceContext): readonly SynchronizationPolicy[] {
    return this.repository.listPolicies(context.organizationId);
  }

  getPolicy(policyId: string, context: ServiceContext): SynchronizationPolicy | null {
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

  registerPolicy(input: RegisterSyncPolicyInput, context: ServiceContext): SynchronizationPolicy {
    const errors = synchronizationRulesEngine.validatePolicy(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const now = new Date().toISOString();
    const policy: SynchronizationPolicy = {
      id: createSyncPolicyId(),
      organizationId: context.organizationId,
      name: input.name,
      description: input.description,
      syncTypes: input.syncTypes,
      conflictStrategy: input.conflictStrategy ?? "last_accepted_version",
      maxRetries: input.maxRetries ?? 3,
      retryDelayMs: input.retryDelayMs ?? 1000,
      requireValidation: input.requireValidation ?? false,
      active: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.savePolicy(policy);
  }
}
