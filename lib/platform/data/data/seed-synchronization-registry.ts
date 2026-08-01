import type {
  SyncSubscription,
  SynchronizationPolicy,
} from "@/types/enterprise-data-synchronization";

const NOW = "2026-07-23T00:00:00.000Z";

/** Seed synchronization subscriptions (Mission P-011.5). */
export function seedSyncSubscriptions(): readonly SyncSubscription[] {
  return [
    {
      id: "ssub-finance-master",
      organizationId: "org-orania",
      subscriberId: "finance-workspace",
      subscriberService: "finance-workspace",
      domainKey: "finance",
      syncTypes: ["master_data", "reference_data"],
      changeEventTypes: ["EntityCreated", "EntityUpdated", "EntityActivated", "ReferenceUpdated"],
      entityTypes: ["customer", "vendor", "financial_account", "currency"],
      active: true,
      createdAt: NOW,
    },
    {
      id: "ssub-hospitality-master",
      organizationId: "org-orania",
      subscriberId: "hospitality-workspace",
      subscriberService: "hospitality-workspace",
      domainKey: "hospitality",
      syncTypes: ["master_data", "metadata"],
      changeEventTypes: ["EntityCreated", "EntityUpdated", "MetadataUpdated"],
      entityTypes: ["guest", "customer", "location"],
      active: true,
      createdAt: NOW,
    },
    {
      id: "ssub-search-index",
      organizationId: "org-orania",
      subscriberId: "search-platform",
      subscriberService: "search-platform",
      domainKey: "platform",
      syncTypes: ["master_data", "reference_data", "metadata", "cross_domain"],
      changeEventTypes: [
        "EntityCreated",
        "EntityUpdated",
        "EntityActivated",
        "EntityDeactivated",
        "ReferenceUpdated",
        "MetadataUpdated",
      ],
      active: true,
      createdAt: NOW,
    },
    {
      id: "ssub-compliance-audit",
      organizationId: "org-orania",
      subscriberId: "compliance-platform",
      subscriberService: "compliance-platform",
      domainKey: "platform",
      syncTypes: ["master_data", "domain_event"],
      changeEventTypes: ["EntityCreated", "EntityUpdated", "EntityActivated", "EntityDeactivated"],
      active: true,
      createdAt: NOW,
    },
  ];
}

/** Seed synchronization policies (Mission P-011.5). */
export function seedSyncPolicies(): readonly SynchronizationPolicy[] {
  return [
    {
      id: "spolicy-global-default",
      name: "Global Default Sync Policy",
      description: "Default synchronization policy for all organizations.",
      syncTypes: ["master_data", "reference_data", "metadata", "configuration"],
      conflictStrategy: "last_accepted_version",
      maxRetries: 3,
      retryDelayMs: 1000,
      requireValidation: false,
      active: true,
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "spolicy-org-orania",
      organizationId: "org-orania",
      name: "Orania Organization Sync Policy",
      description: "Organization sync with validation gate and version comparison.",
      syncTypes: ["master_data", "reference_data", "metadata", "cross_domain"],
      conflictStrategy: "version_comparison",
      maxRetries: 5,
      retryDelayMs: 2000,
      requireValidation: true,
      active: true,
      version: 1,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];
}
