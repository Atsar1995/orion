import {
  createPlatformAuditEntry,
  type OrganizationPlatformRepository,
} from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import type { CreateDelegationInput, DelegationGrant } from "@/types/organization";
import type { ServiceContext } from "@/types/services";

/** Delegation management service (Mission P-005). */
export class DelegationService {
  constructor(
    private readonly repository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  list(context: ServiceContext): DelegationGrant[] {
    return this.repository
      .listDelegations(context.organizationId)
      .filter((entry) => entry.active);
  }

  create(
    input: CreateDelegationInput,
    context: ServiceContext,
    actorName: string,
  ): DelegationGrant {
    const delegate = this.repository.findUser(input.delegateId, context.organizationId);

    if (!delegate) {
      throw new Error("DELEGATE_NOT_FOUND");
    }

    const delegation = this.repository.createDelegation(context.organizationId, context.userId, {
      delegateId: input.delegateId,
      scope: input.scope,
      label: input.label,
      startsAt: new Date().toISOString(),
      endsAt: input.endsAt,
      active: true,
    });

    this.repository.addAudit(
      createPlatformAuditEntry(
        context,
        actorName,
        "delegation.created",
        "delegation",
        delegation.id,
        delegation.label,
      ),
    );

    return delegation;
  }

  resolveDelegateForScope(
    userId: string,
    scope: DelegationGrant["scope"],
    context: ServiceContext,
  ): string | null {
    const delegation = this.repository
      .listDelegations(context.organizationId)
      .find(
        (entry) =>
          entry.active &&
          entry.delegatorId === userId &&
          (entry.scope === scope || entry.scope === "all"),
      );

    return delegation?.delegateId ?? null;
  }
}

export const delegationService = new DelegationService();
