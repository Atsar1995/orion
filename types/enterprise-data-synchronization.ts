/**
 * Enterprise Data Synchronization Engine types (Mission P-011.5).
 * Event-driven, organization-scoped data propagation.
 */

/** Supported synchronization categories. */
export type SynchronizationType =
  | "master_data"
  | "reference_data"
  | "metadata"
  | "configuration"
  | "domain_event"
  | "cross_domain";

/** Canonical change event types consumed by the sync engine. */
export type ChangeEventType =
  | "EntityCreated"
  | "EntityUpdated"
  | "EntityActivated"
  | "EntityDeactivated"
  | "ReferenceUpdated"
  | "MetadataUpdated"
  | "OrganizationUpdated"
  | "ConfigurationUpdated";

export type SyncState =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "retry_pending"
  | "conflict";

export type ConflictResolutionStrategy =
  | "version_comparison"
  | "last_accepted_version"
  | "policy_based"
  | "manual";

/** Registered domain subscriber for sync delivery. */
export type SyncSubscription = {
  readonly id: string;
  readonly organizationId: string;
  readonly subscriberId: string;
  readonly subscriberService: string;
  readonly domainKey: string;
  readonly syncTypes: readonly SynchronizationType[];
  readonly changeEventTypes: readonly ChangeEventType[];
  readonly entityTypes?: readonly string[];
  readonly active: boolean;
  readonly createdAt: string;
};

/** Organization synchronization policy. */
export type SynchronizationPolicy = {
  readonly id: string;
  readonly organizationId?: string;
  readonly name: string;
  readonly description: string;
  readonly syncTypes: readonly SynchronizationType[];
  readonly conflictStrategy: ConflictResolutionStrategy;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly requireValidation: boolean;
  readonly active: boolean;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Synchronization job queue record. */
export type SyncJobRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly syncType: SynchronizationType;
  readonly changeEventType: ChangeEventType;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly sourceVersion?: number;
  readonly targetVersion?: number;
  readonly status: SyncState;
  readonly policyId?: string;
  readonly subscriptionIds: readonly string[];
  readonly correlationId: string;
  readonly retryCount: number;
  readonly lastError?: string;
  readonly conflictDetected: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
};

/** Detected synchronization conflict. */
export type SyncConflictRecord = {
  readonly id: string;
  readonly jobId: string;
  readonly organizationId: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly sourceVersion: number;
  readonly incomingVersion: number;
  readonly resolutionStrategy: ConflictResolutionStrategy;
  readonly resolved: boolean;
  readonly resolution?: string;
  readonly createdAt: string;
  readonly resolvedAt?: string;
};

/** Synchronization audit trail entry. */
export type SyncAuditRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly jobId: string;
  readonly action: string;
  readonly detail: string;
  readonly actorId: string;
  readonly createdAt: string;
};

export type EnqueueSyncInput = {
  readonly syncType: SynchronizationType;
  readonly changeEventType: ChangeEventType;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly sourceVersion?: number;
  readonly incomingVersion?: number;
  readonly payload?: Readonly<Record<string, string>>;
  readonly correlationId?: string;
  readonly policyId?: string;
};

export type RegisterSubscriptionInput = {
  readonly subscriberId: string;
  readonly subscriberService: string;
  readonly domainKey: string;
  readonly syncTypes: readonly SynchronizationType[];
  readonly changeEventTypes: readonly ChangeEventType[];
  readonly entityTypes?: readonly string[];
};

export type RegisterSyncPolicyInput = {
  readonly name: string;
  readonly description: string;
  readonly syncTypes: readonly SynchronizationType[];
  readonly conflictStrategy?: ConflictResolutionStrategy;
  readonly maxRetries?: number;
  readonly retryDelayMs?: number;
  readonly requireValidation?: boolean;
};

export type SyncMonitoringStats = {
  readonly organizationId: string;
  readonly totalJobs: number;
  readonly pendingJobs: number;
  readonly inProgressJobs: number;
  readonly completedJobs: number;
  readonly failedJobs: number;
  readonly conflictJobs: number;
  readonly retryPendingJobs: number;
  readonly activeSubscriptions: number;
};

/** Outbound synchronization events (Mission P-011.5). */
export type SynchronizationEventType =
  | "SynchronizationStarted"
  | "SynchronizationCompleted"
  | "SynchronizationFailed"
  | "SynchronizationConflictDetected"
  | "SynchronizationRetried";

/** Inbound events consumed by the sync engine. */
export type SynchronizationInboundEventType =
  | "MasterEntityUpdated"
  | "ReferenceUpdated"
  | "MetadataUpdated"
  | "ValidationPassed";

export type PublishSynchronizationEventInput = {
  readonly eventType: SynchronizationEventType;
  readonly jobId: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};
