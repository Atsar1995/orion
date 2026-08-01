/**
 * Shared platform entity models (Mission S1C).
 * Future workspace integrations consume these canonical shapes.
 */

export type PlatformEntity = {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type UserEntity = PlatformEntity & {
  readonly email: string;
  readonly displayName: string;
  readonly role: string;
  readonly organizationId: string;
  readonly workspaceId: string;
  readonly avatarInitials?: string;
};

export type OrganizationEntity = PlatformEntity & {
  readonly name: string;
  readonly slug: string;
  readonly timeZone: string;
  readonly locale: string;
};

export type WorkspaceEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly modules: readonly string[];
};

export type CustomerEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly name: string;
  readonly segment?: string;
  readonly healthScore?: number;
  readonly lifetimeValue?: string;
};

export type OpportunityEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly customerId: string;
  readonly title: string;
  readonly stage: string;
  readonly value: string;
  readonly probability?: number;
};

export type TaskEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly title: string;
  readonly status: "open" | "in_progress" | "completed" | "cancelled";
  readonly assigneeId?: string;
  readonly dueAt?: string;
};

export type DecisionEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly title: string;
  readonly status: string;
  readonly responsibleUserId?: string;
  readonly workspace?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly note?: string;
};

export type NotificationEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly title: string;
  readonly message: string;
  readonly severity: "critical" | "high" | "medium" | "low" | "info";
  readonly read: boolean;
  readonly workspace?: string;
};

export type ActivityEntity = PlatformEntity & {
  readonly organizationId: string;
  readonly type: string;
  readonly summary: string;
  readonly actorId?: string;
  readonly workspace?: string;
  readonly entityType?: string;
  readonly entityId?: string;
};
