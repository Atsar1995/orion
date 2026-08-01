import type {
  EnterpriseNotificationChannel,
  NotificationRecord,
  NotificationType,
  UserNotificationPreferenceRecord,
} from "@/types/notification";
import type { OrganizationNotificationPolicyRecord } from "@/types/notification";
import { notificationRulesEngine } from "@/lib/platform/notification/NotificationRulesEngine";

/** Channel selection strategy (Strategy pattern — Mission P-010.3). */
export class ChannelSelector {
  select(
    notificationType: NotificationType,
    requestedChannel: EnterpriseNotificationChannel | undefined,
    preference: UserNotificationPreferenceRecord | null,
    policy: OrganizationNotificationPolicyRecord | null,
    templateDefault?: EnterpriseNotificationChannel,
  ): EnterpriseNotificationChannel {
    if (requestedChannel) return requestedChannel;

    const override = preference?.priorityOverrides[notificationType];
    if (override && policy?.allowedChannels.includes(override)) {
      return override;
    }

    if (templateDefault && policy?.allowedChannels.includes(templateDefault)) {
      return templateDefault;
    }

    const preferred = preference?.enabledChannels.find((channel) =>
      policy?.allowedChannels.includes(channel),
    );
    if (preferred) return preferred;

    return policy?.allowedChannels[0] ?? "in_app";
  }

  shouldDeferForQuietHours(
    notificationType: NotificationType,
    preference: UserNotificationPreferenceRecord | null,
    policy: OrganizationNotificationPolicyRecord | null,
  ): boolean {
    if (policy?.mandatoryTypes.includes(notificationType)) return false;
    return notificationRulesEngine.isQuietHours(preference);
  }
}

export const channelSelector = new ChannelSelector();
