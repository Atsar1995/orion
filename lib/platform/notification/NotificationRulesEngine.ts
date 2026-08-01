import type {
  CreateTemplateInput,
  EnterpriseNotificationChannel,
  NotificationDeliveryState,
  NotificationRecord,
  NotificationTemplateRecord,
  NotificationType,
  SendNotificationInput,
  UpdatePreferenceInput,
  UserNotificationPreferenceRecord,
} from "@/types/notification";
import type { ServiceContext } from "@/types/services";
import { getChannelAdapter } from "@/lib/platform/notification/channels/ChannelAdapters";

export type NotificationValidationError = {
  readonly code: string;
  readonly message: string;
};

const ALL_CHANNELS: readonly EnterpriseNotificationChannel[] = [
  "email",
  "sms",
  "whatsapp",
  "push",
  "in_app",
  "web",
  "custom",
] as const;

/** Domain-agnostic notification validation (Mission P-010.3). */
export class NotificationRulesEngine {
  validateOrganizationAccess(
    record: { readonly organizationId: string },
    context: ServiceContext,
  ): NotificationValidationError | null {
    if (record.organizationId !== context.organizationId && context.role !== "super_admin") {
      return { code: "ORGANIZATION_ISOLATION", message: "Organization access denied." };
    }
    return null;
  }

  validateRecipient(recipientUserId: string): NotificationValidationError | null {
    if (!recipientUserId.trim()) {
      return { code: "INVALID_RECIPIENT", message: "Recipient user id is required." };
    }
    return null;
  }

  validateChannel(
    channel: EnterpriseNotificationChannel,
    allowedChannels: readonly EnterpriseNotificationChannel[],
  ): NotificationValidationError | null {
    if (!ALL_CHANNELS.includes(channel)) {
      return { code: "UNKNOWN_CHANNEL", message: `Unknown channel: ${channel}` };
    }
    if (!allowedChannels.includes(channel)) {
      return { code: "CHANNEL_NOT_ALLOWED", message: `Channel ${channel} is not allowed by organization policy.` };
    }
    if (!getChannelAdapter(channel)) {
      return { code: "CHANNEL_UNAVAILABLE", message: `No adapter registered for channel ${channel}.` };
    }
    return null;
  }

  validateTemplate(input: CreateTemplateInput): NotificationValidationError[] {
    const errors: NotificationValidationError[] = [];

    if (!input.key.trim()) errors.push({ code: "INVALID_KEY", message: "Template key is required." });
    if (!input.name.trim()) errors.push({ code: "INVALID_NAME", message: "Template name is required." });
    if (!input.subjectTemplate.trim()) {
      errors.push({ code: "INVALID_SUBJECT", message: "Subject template is required." });
    }
    if (!input.bodyTemplate.trim()) {
      errors.push({ code: "INVALID_BODY", message: "Body template is required." });
    }

    const declared = new Set(input.variables ?? []);
    const used = this.extractVariables(`${input.subjectTemplate} ${input.bodyTemplate}`);
    for (const variable of used) {
      if (!declared.has(variable)) {
        errors.push({
          code: "UNDECLARED_VARIABLE",
          message: `Variable {{${variable}}} used but not declared.`,
        });
      }
    }

    return errors;
  }

  validatePreferences(input: UpdatePreferenceInput): NotificationValidationError[] {
    const errors: NotificationValidationError[] = [];

    if (input.enabledChannels) {
      for (const channel of input.enabledChannels) {
        if (!ALL_CHANNELS.includes(channel)) {
          errors.push({ code: "INVALID_CHANNEL", message: `Invalid channel: ${channel}` });
        }
      }
    }

    if (input.quietHoursStart && input.quietHoursEnd) {
      if (!/^\d{2}:\d{2}$/.test(input.quietHoursStart) || !/^\d{2}:\d{2}$/.test(input.quietHoursEnd)) {
        errors.push({ code: "INVALID_QUIET_HOURS", message: "Quiet hours must use HH:MM format." });
      }
    }

    return errors;
  }

  validateSendInput(input: SendNotificationInput): NotificationValidationError[] {
    const errors: NotificationValidationError[] = [];
    const recipientError = this.validateRecipient(input.recipientUserId);
    if (recipientError) errors.push(recipientError);

    if (!input.templateKey && !input.subject?.trim() && !input.body?.trim()) {
      errors.push({
        code: "MISSING_CONTENT",
        message: "Either templateKey or subject/body is required.",
      });
    }

    return errors;
  }

  validateTransition(
    from: NotificationDeliveryState,
    to: NotificationDeliveryState,
  ): NotificationValidationError | null {
    const allowed: Partial<Record<NotificationDeliveryState, readonly NotificationDeliveryState[]>> = {
      queued: ["processing", "cancelled", "expired"],
      processing: ["sent", "failed", "cancelled"],
      sent: ["delivered", "failed", "read"],
      delivered: ["read"],
      failed: ["retry_pending", "cancelled"],
      retry_pending: ["processing", "cancelled", "expired"],
    };

    const transitions = allowed[from];
    if (!transitions || !transitions.includes(to)) {
      return { code: "INVALID_TRANSITION", message: `Cannot transition from ${from} to ${to}.` };
    }
    return null;
  }

  buildFingerprint(
    organizationId: string,
    input: SendNotificationInput,
    channel: EnterpriseNotificationChannel,
  ): string {
    return [
      organizationId,
      input.recipientUserId,
      input.templateKey ?? input.subject ?? "",
      input.correlationId ?? "",
      channel,
      input.notificationType,
    ].join("|");
  }

  extractVariables(template: string): string[] {
    const matches = template.matchAll(/\{\{(\w+)\}\}/g);
    return [...new Set([...matches].map((match) => match[1]))];
  }

  renderTemplate(template: string, variables: Readonly<Record<string, string>>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? "");
  }

  resolveChannel(
    input: SendNotificationInput,
    preference: UserNotificationPreferenceRecord | null,
    template: NotificationTemplateRecord | null,
    policyDefault?: EnterpriseNotificationChannel,
  ): EnterpriseNotificationChannel {
    if (input.channel) return input.channel;

    const override = preference?.priorityOverrides[input.notificationType];
    if (override) return override;

    if (template) return template.defaultChannel;

    const enabled = preference?.enabledChannels[0];
    if (enabled) return enabled;

    return policyDefault ?? "in_app";
  }

  isQuietHours(preference: UserNotificationPreferenceRecord | null): boolean {
    if (!preference?.quietHoursStart || !preference?.quietHoursEnd) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = preference.quietHoursStart.split(":").map(Number);
    const [endH, endM] = preference.quietHoursEnd.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (start <= end) {
      return currentMinutes >= start && currentMinutes < end;
    }
    return currentMinutes >= start || currentMinutes < end;
  }

  isTypeDisabled(
    notificationType: NotificationType,
    preference: UserNotificationPreferenceRecord | null,
    mandatoryTypes: readonly NotificationType[],
  ): boolean {
    if (mandatoryTypes.includes(notificationType)) return false;
    return preference?.disabledTypes.includes(notificationType) ?? false;
  }
}

export const notificationRulesEngine = new NotificationRulesEngine();
