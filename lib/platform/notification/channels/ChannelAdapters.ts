import type { EnterpriseNotificationChannel } from "@/types/notification";

export type ChannelDeliveryResult = {
  readonly success: boolean;
  readonly delivered: boolean;
  readonly error?: string;
};

/** Channel adapter contract — future provider integrations plug in here (Adapter pattern). */
export type NotificationChannelAdapter = {
  readonly channel: EnterpriseNotificationChannel;
  deliver(input: {
    readonly recipientUserId: string;
    readonly subject: string;
    readonly body: string;
    readonly metadata?: Readonly<Record<string, string>>;
  }): Promise<ChannelDeliveryResult>;
};

function stubDeliver(channel: EnterpriseNotificationChannel): NotificationChannelAdapter {
  return {
    channel,
    async deliver() {
      return { success: true, delivered: true };
    },
  };
}

/** In-memory channel adapters — no third-party provider SDKs (Mission P-010.3). */
export const channelAdapters: ReadonlyMap<EnterpriseNotificationChannel, NotificationChannelAdapter> =
  new Map([
    ["email", stubDeliver("email")],
    ["sms", stubDeliver("sms")],
    ["whatsapp", stubDeliver("whatsapp")],
    ["push", stubDeliver("push")],
    ["in_app", stubDeliver("in_app")],
    ["web", stubDeliver("web")],
    ["custom", stubDeliver("custom")],
  ]);

export function getChannelAdapter(channel: EnterpriseNotificationChannel): NotificationChannelAdapter | null {
  return channelAdapters.get(channel) ?? null;
}
