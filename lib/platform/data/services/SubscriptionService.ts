import type {
  RegisterSubscriptionInput,
  SyncSubscription,
} from "@/types/enterprise-data-synchronization";
import type { SynchronizationRepository } from "@/lib/platform/data/repositories/SynchronizationRepository";
import { createSyncSubscriptionId } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { synchronizationRulesEngine } from "@/lib/platform/data/SynchronizationRulesEngine";
import type { ServiceContext } from "@/types/services";

/** Subscription registry management (Mission P-011.5). */
export class SubscriptionService {
  constructor(private readonly repository: SynchronizationRepository) {}

  listSubscriptions(context: ServiceContext): readonly SyncSubscription[] {
    return this.repository.listSubscriptions(context.organizationId);
  }

  getSubscription(subscriptionId: string, context: ServiceContext): SyncSubscription | null {
    const sub = this.repository.findSubscription(subscriptionId);
    if (!sub) return null;
    const accessError = synchronizationRulesEngine.validateOrganizationAccess(
      sub.organizationId,
      context.organizationId,
      context.role,
    );
    if (accessError) throw new Error(accessError.code);
    return sub;
  }

  registerSubscription(input: RegisterSubscriptionInput, context: ServiceContext): SyncSubscription {
    const errors = synchronizationRulesEngine.validateSubscription(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const subscription: SyncSubscription = {
      id: createSyncSubscriptionId(),
      organizationId: context.organizationId,
      subscriberId: input.subscriberId,
      subscriberService: input.subscriberService,
      domainKey: input.domainKey,
      syncTypes: input.syncTypes,
      changeEventTypes: input.changeEventTypes,
      entityTypes: input.entityTypes,
      active: true,
      createdAt: new Date().toISOString(),
    };

    return this.repository.saveSubscription(subscription);
  }

  deactivateSubscription(subscriptionId: string, context: ServiceContext): SyncSubscription {
    const existing = this.getSubscription(subscriptionId, context);
    if (!existing) throw new Error("SUBSCRIPTION_NOT_FOUND");

    return this.repository.saveSubscription({ ...existing, active: false });
  }
}
