import type {
  NotificationHistoryRecord,
  NotificationRecord,
  NotificationTemplateRecord,
  NotificationTemplateVersionRecord,
  OrganizationNotificationPolicyRecord,
  UserNotificationPreferenceRecord,
} from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import {
  seedOrganizationPolicy,
  seedSystemTemplates,
  seedUserPreference,
} from "@/lib/platform/notification/data/seed-notifications";

/** In-memory notification repository (Mission P-010.3). */
export class InMemoryNotificationRepository implements NotificationRepository {
  readonly domain = "platform" as const;

  private readonly notifications = new Map<string, NotificationRecord>();
  private readonly fingerprints = new Map<string, string>();
  private readonly templates = new Map<string, NotificationTemplateRecord>();
  private readonly templateVersions = new Map<string, NotificationTemplateVersionRecord[]>();
  private readonly preferences = new Map<string, UserNotificationPreferenceRecord>();
  private readonly policies = new Map<string, OrganizationNotificationPolicyRecord>();
  private readonly history = new Map<string, NotificationHistoryRecord[]>();

  constructor(seedOrganizationId = "org-orania", seedUserId = "user-executive") {
    for (const template of seedSystemTemplates()) {
      this.templates.set(template.id, template);
    }
    this.upsertPolicy(seedOrganizationPolicy(seedOrganizationId));
    this.upsertPreference(seedUserPreference(seedOrganizationId, seedUserId));
  }

  createNotification(notification: NotificationRecord): NotificationRecord {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  updateNotification(notification: NotificationRecord): NotificationRecord {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  findNotification(organizationId: string, notificationId: string): NotificationRecord | null {
    const record = this.notifications.get(notificationId);
    if (!record || record.organizationId !== organizationId) return null;
    return record;
  }

  listNotifications(organizationId: string, recipientUserId?: string): readonly NotificationRecord[] {
    let results = [...this.notifications.values()].filter((n) => n.organizationId === organizationId);
    if (recipientUserId) {
      results = results.filter((n) => n.recipientUserId === recipientUserId);
    }
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findDuplicateFingerprint(organizationId: string, fingerprint: string): NotificationRecord | null {
    const notificationId = this.fingerprints.get(`${organizationId}:${fingerprint}`);
    if (!notificationId) return null;
    return this.findNotification(organizationId, notificationId);
  }

  setFingerprint(organizationId: string, fingerprint: string, notificationId: string): void {
    this.fingerprints.set(`${organizationId}:${fingerprint}`, notificationId);
  }

  createTemplate(template: NotificationTemplateRecord): NotificationTemplateRecord {
    this.templates.set(template.id, template);
    return template;
  }

  updateTemplate(template: NotificationTemplateRecord): NotificationTemplateRecord {
    this.templates.set(template.id, template);
    return template;
  }

  findTemplate(organizationId: string | undefined, templateId: string): NotificationTemplateRecord | null {
    const record = this.templates.get(templateId);
    if (!record) return null;
    if (record.scope === "organization" && record.organizationId !== organizationId) return null;
    return record;
  }

  findTemplateByKey(
    organizationId: string | undefined,
    key: string,
    language: string,
  ): NotificationTemplateRecord | null {
    const matches = [...this.templates.values()].filter(
      (template) =>
        template.key === key &&
        template.language === language &&
        template.active &&
        (template.scope === "system" ||
          (template.scope === "organization" && template.organizationId === organizationId)),
    );

    const orgTemplate = matches.find((template) => template.scope === "organization");
    return orgTemplate ?? matches.find((template) => template.scope === "system") ?? null;
  }

  listTemplates(organizationId: string): readonly NotificationTemplateRecord[] {
    return [...this.templates.values()].filter(
      (template) => template.scope === "system" || template.organizationId === organizationId,
    );
  }

  createTemplateVersion(version: NotificationTemplateVersionRecord): NotificationTemplateVersionRecord {
    const bucket = this.templateVersions.get(version.templateId) ?? [];
    bucket.push(version);
    this.templateVersions.set(version.templateId, bucket);
    return version;
  }

  listTemplateVersions(templateId: string): readonly NotificationTemplateVersionRecord[] {
    return this.templateVersions.get(templateId) ?? [];
  }

  upsertPreference(preference: UserNotificationPreferenceRecord): UserNotificationPreferenceRecord {
    this.preferences.set(`${preference.organizationId}:${preference.userId}`, preference);
    return preference;
  }

  findPreference(organizationId: string, userId: string): UserNotificationPreferenceRecord | null {
    return this.preferences.get(`${organizationId}:${userId}`) ?? null;
  }

  upsertPolicy(policy: OrganizationNotificationPolicyRecord): OrganizationNotificationPolicyRecord {
    this.policies.set(policy.organizationId, policy);
    return policy;
  }

  findPolicy(organizationId: string): OrganizationNotificationPolicyRecord | null {
    return this.policies.get(organizationId) ?? null;
  }

  recordHistory(entry: NotificationHistoryRecord): NotificationHistoryRecord {
    const bucket = this.history.get(entry.notificationId) ?? [];
    bucket.push(entry);
    this.history.set(entry.notificationId, bucket);
    return entry;
  }

  listHistory(organizationId: string, notificationId: string): readonly NotificationHistoryRecord[] {
    return (this.history.get(notificationId) ?? []).filter(
      (entry) => entry.organizationId === organizationId,
    );
  }
}

export const defaultNotificationRepository = new InMemoryNotificationRepository();
