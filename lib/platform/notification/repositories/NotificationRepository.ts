import type {
  NotificationHistoryRecord,
  NotificationRecord,
  NotificationTemplateRecord,
  NotificationTemplateVersionRecord,
  OrganizationNotificationPolicyRecord,
  UserNotificationPreferenceRecord,
} from "@/types/notification";

/** Notification repository contract (Mission P-010.3). */
export type NotificationRepository = {
  readonly domain: string;

  createNotification(notification: NotificationRecord): NotificationRecord;
  updateNotification(notification: NotificationRecord): NotificationRecord;
  findNotification(organizationId: string, notificationId: string): NotificationRecord | null;
  listNotifications(organizationId: string, recipientUserId?: string): readonly NotificationRecord[];
  findDuplicateFingerprint(organizationId: string, fingerprint: string): NotificationRecord | null;

  createTemplate(template: NotificationTemplateRecord): NotificationTemplateRecord;
  updateTemplate(template: NotificationTemplateRecord): NotificationTemplateRecord;
  findTemplate(organizationId: string | undefined, templateId: string): NotificationTemplateRecord | null;
  findTemplateByKey(organizationId: string | undefined, key: string, language: string): NotificationTemplateRecord | null;
  listTemplates(organizationId: string): readonly NotificationTemplateRecord[];

  createTemplateVersion(version: NotificationTemplateVersionRecord): NotificationTemplateVersionRecord;
  listTemplateVersions(templateId: string): readonly NotificationTemplateVersionRecord[];

  upsertPreference(preference: UserNotificationPreferenceRecord): UserNotificationPreferenceRecord;
  findPreference(organizationId: string, userId: string): UserNotificationPreferenceRecord | null;

  upsertPolicy(policy: OrganizationNotificationPolicyRecord): OrganizationNotificationPolicyRecord;
  findPolicy(organizationId: string): OrganizationNotificationPolicyRecord | null;

  recordHistory(entry: NotificationHistoryRecord): NotificationHistoryRecord;
  listHistory(organizationId: string, notificationId: string): readonly NotificationHistoryRecord[];
};
