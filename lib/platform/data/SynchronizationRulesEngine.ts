import type {
  EnqueueSyncInput,
  RegisterSubscriptionInput,
  RegisterSyncPolicyInput,
  SyncSubscription,
  SynchronizationPolicy,
} from "@/types/enterprise-data-synchronization";

export type SyncValidationError = {
  readonly code: string;
  readonly message: string;
};

/** Synchronization validation rules (Mission P-011.5). */
export class SynchronizationRulesEngine {
  validateEnqueue(input: EnqueueSyncInput): SyncValidationError[] {
    const errors: SyncValidationError[] = [];
    if (!input.syncType) errors.push({ code: "INVALID_SYNC_TYPE", message: "Sync type is required." });
    if (!input.changeEventType) {
      errors.push({ code: "INVALID_CHANGE_EVENT", message: "Change event type is required." });
    }
    if (
      ["EntityCreated", "EntityUpdated", "EntityActivated", "EntityDeactivated"].includes(
        input.changeEventType,
      ) &&
      !input.entityId
    ) {
      errors.push({ code: "INVALID_ENTITY_ID", message: "Entity id is required for entity change events." });
    }
    return errors;
  }

  validateSubscription(input: RegisterSubscriptionInput): SyncValidationError[] {
    const errors: SyncValidationError[] = [];
    if (!input.subscriberId.trim()) {
      errors.push({ code: "INVALID_SUBSCRIBER", message: "Subscriber id is required." });
    }
    if (!input.domainKey.trim()) {
      errors.push({ code: "INVALID_DOMAIN", message: "Domain key is required." });
    }
    if (input.syncTypes.length === 0) {
      errors.push({ code: "INVALID_SYNC_TYPES", message: "At least one sync type is required." });
    }
    if (input.changeEventTypes.length === 0) {
      errors.push({ code: "INVALID_CHANGE_EVENTS", message: "At least one change event type is required." });
    }
    return errors;
  }

  validatePolicy(input: RegisterSyncPolicyInput): SyncValidationError[] {
    const errors: SyncValidationError[] = [];
    if (!input.name.trim()) errors.push({ code: "INVALID_POLICY_NAME", message: "Policy name is required." });
    if (input.syncTypes.length === 0) {
      errors.push({ code: "INVALID_SYNC_TYPES", message: "At least one sync type is required." });
    }
    return errors;
  }

  validateOrganizationAccess(
    recordOrgId: string,
    contextOrgId: string,
    role?: string,
  ): SyncValidationError | null {
    if (recordOrgId !== contextOrgId && role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  resolveMatchingSubscriptions(
    subscriptions: readonly SyncSubscription[],
    input: EnqueueSyncInput,
  ): SyncSubscription[] {
    return subscriptions.filter(
      (sub) =>
        sub.active &&
        sub.syncTypes.includes(input.syncType) &&
        sub.changeEventTypes.includes(input.changeEventType) &&
        (!sub.entityTypes ||
          !input.entityType ||
          sub.entityTypes.includes(input.entityType)),
    );
  }

  detectVersionConflict(
    lastAccepted: number | null,
    incomingVersion: number | undefined,
  ): boolean {
    if (lastAccepted === null || incomingVersion === undefined) return false;
    return incomingVersion <= lastAccepted;
  }

  resolveConflict(
    strategy: SynchronizationPolicy["conflictStrategy"],
    lastAccepted: number | null,
    incomingVersion: number | undefined,
  ): { resolved: boolean; acceptIncoming: boolean; requiresManual: boolean } {
    switch (strategy) {
      case "version_comparison":
        if (lastAccepted !== null && incomingVersion !== undefined && incomingVersion > lastAccepted) {
          return { resolved: true, acceptIncoming: true, requiresManual: false };
        }
        return { resolved: false, acceptIncoming: false, requiresManual: true };
      case "last_accepted_version":
        return { resolved: true, acceptIncoming: false, requiresManual: false };
      case "policy_based":
        if (incomingVersion !== undefined && (lastAccepted === null || incomingVersion >= lastAccepted)) {
          return { resolved: true, acceptIncoming: true, requiresManual: false };
        }
        return { resolved: false, acceptIncoming: false, requiresManual: true };
      case "manual":
        return { resolved: false, acceptIncoming: false, requiresManual: true };
      default:
        return { resolved: false, acceptIncoming: false, requiresManual: true };
    }
  }
}

export const synchronizationRulesEngine = new SynchronizationRulesEngine();
