import type {
  NotificationRecord,
  ScheduleNotificationInput,
  SendNotificationInput,
} from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import type { InMemoryNotificationRepository } from "@/lib/platform/notification/repositories/InMemoryNotificationRepository";
import type { ServiceContext } from "@/types/services";
import { channelSelector } from "@/lib/platform/notification/ChannelSelector";
import { createNotificationId, MessageDispatcher } from "@/lib/platform/notification/MessageDispatcher";
import { NotificationHistoryService } from "@/lib/platform/notification/NotificationHistoryService";
import { notificationRulesEngine } from "@/lib/platform/notification/NotificationRulesEngine";
import { PreferenceService } from "@/lib/platform/notification/PreferenceService";
import { TemplateService } from "@/lib/platform/notification/TemplateService";

function nowIso(): string {
  return new Date().toISOString();
}

/** Primary notification orchestration service (Mission P-010.3). */
export class EnterpriseNotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly templateService: TemplateService,
    private readonly preferenceService: PreferenceService,
    private readonly historyService: NotificationHistoryService,
    private readonly dispatcher: MessageDispatcher,
  ) {}

  list(context: ServiceContext, recipientUserId?: string): readonly NotificationRecord[] {
    return this.repository.listNotifications(context.organizationId, recipientUserId);
  }

  get(notificationId: string, context: ServiceContext): NotificationRecord | null {
    return this.repository.findNotification(context.organizationId, notificationId);
  }

  async send(input: SendNotificationInput, context: ServiceContext): Promise<NotificationRecord> {
    const errors = notificationRulesEngine.validateSendInput(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const policy = this.preferenceService.getOrganizationPolicy(context);
    const preference = this.preferenceService.getUserPreference(context, input.recipientUserId);

    if (notificationRulesEngine.isTypeDisabled(input.notificationType, preference, policy.mandatoryTypes)) {
      throw new Error("NOTIFICATION_OPT_OUT");
    }

    const template = input.templateKey
      ? this.templateService.getByKey(input.templateKey, context, preference.language)
      : null;

    const channel = channelSelector.select(
      input.notificationType,
      input.channel,
      preference,
      policy,
      template?.defaultChannel,
    );

    const channelError = notificationRulesEngine.validateChannel(channel, policy.allowedChannels);
    if (channelError) throw new Error(channelError.code);

    const fingerprint = notificationRulesEngine.buildFingerprint(context.organizationId, input, channel);
    const duplicate = this.repository.findDuplicateFingerprint(context.organizationId, fingerprint);
    if (duplicate) throw new Error("DUPLICATE_NOTIFICATION");

    let subject = input.subject ?? "";
    let body = input.body ?? "";

    if (template) {
      const rendered = this.templateService.render(template, input.variables ?? {});
      subject = rendered.subject;
      body = rendered.body;
    }

    const notification: NotificationRecord = {
      id: createNotificationId(),
      organizationId: context.organizationId,
      recipientUserId: input.recipientUserId,
      notificationType: input.notificationType,
      channel,
      subject,
      body,
      templateId: template?.id,
      templateVersion: template?.version,
      correlationId: input.correlationId,
      deliveryState: "queued",
      attempts: 0,
      maxAttempts: policy.maxRetries,
      metadata: input.metadata,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.repository.createNotification(notification);
    (this.repository as InMemoryNotificationRepository).setFingerprint?.(
      context.organizationId,
      fingerprint,
      notification.id,
    );

    this.historyService.record(context, notification.id, "notification_created", undefined, "queued");

    if (channelSelector.shouldDeferForQuietHours(input.notificationType, preference, policy)) {
      return this.repository.updateNotification({
        ...notification,
        deliveryState: "queued",
        scheduledAt: nowIso(),
        metadata: { ...notification.metadata, deferredQuietHours: "true" },
      });
    }

    return this.dispatcher.dispatch(notification, context);
  }

  async schedule(input: ScheduleNotificationInput, context: ServiceContext): Promise<NotificationRecord> {
    const scheduled = await this.send({ ...input, channel: input.channel ?? "in_app" }, context);
    return this.repository.updateNotification({
      ...scheduled,
      deliveryState: "queued",
      scheduledAt: input.scheduledAt,
      updatedAt: nowIso(),
    });
  }
}
