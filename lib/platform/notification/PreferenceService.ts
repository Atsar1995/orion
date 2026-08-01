import { randomUUID } from "crypto";
import type {
  OrganizationNotificationPolicyRecord,
  UpdatePreferenceInput,
  UserNotificationPreferenceRecord,
} from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import type { ServiceContext } from "@/types/services";
import { notificationRulesEngine } from "@/lib/platform/notification/NotificationRulesEngine";
import { seedOrganizationPolicy, seedUserPreference } from "@/lib/platform/notification/data/seed-notifications";

function nowIso(): string {
  return new Date().toISOString();
}

/** User preferences and organization notification policies (Mission P-010.3). */
export class PreferenceService {
  constructor(private readonly repository: NotificationRepository) {}

  getUserPreference(context: ServiceContext, userId?: string): UserNotificationPreferenceRecord {
    const targetUserId = userId ?? context.userId ?? "";
    const existing = this.repository.findPreference(context.organizationId, targetUserId);
    if (existing) return existing;

    return this.repository.upsertPreference(seedUserPreference(context.organizationId, targetUserId));
  }

  updateUserPreference(
    input: UpdatePreferenceInput,
    context: ServiceContext,
    userId?: string,
  ): UserNotificationPreferenceRecord {
    const errors = notificationRulesEngine.validatePreferences(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const targetUserId = userId ?? context.userId ?? "";
    const current = this.getUserPreference(context, targetUserId);

    return this.repository.upsertPreference({
      ...current,
      enabledChannels: input.enabledChannels ?? current.enabledChannels,
      disabledTypes: input.disabledTypes ?? current.disabledTypes,
      language: input.language ?? current.language,
      quietHoursStart: input.quietHoursStart ?? current.quietHoursStart,
      quietHoursEnd: input.quietHoursEnd ?? current.quietHoursEnd,
      digestEnabled: input.digestEnabled ?? current.digestEnabled,
      digestFrequency: input.digestFrequency ?? current.digestFrequency,
      priorityOverrides: input.priorityOverrides ?? current.priorityOverrides,
      updatedAt: nowIso(),
    });
  }

  getOrganizationPolicy(context: ServiceContext): OrganizationNotificationPolicyRecord {
    const existing = this.repository.findPolicy(context.organizationId);
    if (existing) return existing;
    return this.repository.upsertPolicy(seedOrganizationPolicy(context.organizationId));
  }

  updateOrganizationPolicy(
    input: Partial<Omit<OrganizationNotificationPolicyRecord, "id" | "organizationId">>,
    context: ServiceContext,
  ): OrganizationNotificationPolicyRecord {
    if (context.role !== "super_admin" && context.role !== "organization_admin" && context.role !== "administrator") {
      throw new Error("PERMISSION_DENIED");
    }

    const current = this.getOrganizationPolicy(context);
    return this.repository.upsertPolicy({
      ...current,
      allowedChannels: input.allowedChannels ?? current.allowedChannels,
      mandatoryTypes: input.mandatoryTypes ?? current.mandatoryTypes,
      defaultLanguage: input.defaultLanguage ?? current.defaultLanguage,
      maxRetries: input.maxRetries ?? current.maxRetries,
      retryDelayMinutes: input.retryDelayMinutes ?? current.retryDelayMinutes,
      updatedAt: nowIso(),
    });
  }
}
