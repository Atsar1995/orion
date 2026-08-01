import { defaultNotificationRepository } from "@/lib/platform/notification/repositories/InMemoryNotificationRepository";
import { DeliveryService } from "@/lib/platform/notification/DeliveryService";
import { EnterpriseNotificationService } from "@/lib/platform/notification/EnterpriseNotificationService";
import { MessageDispatcher } from "@/lib/platform/notification/MessageDispatcher";
import { NotificationHistoryService } from "@/lib/platform/notification/NotificationHistoryService";
import { PreferenceService } from "@/lib/platform/notification/PreferenceService";
import { TemplateService } from "@/lib/platform/notification/TemplateService";

/** Public notification facade — exposes only approved services (Mission P-010.3). */
export class NotificationFacade {
  readonly notification: EnterpriseNotificationService;
  readonly template: TemplateService;
  readonly preference: PreferenceService;
  readonly delivery: DeliveryService;
  readonly history: NotificationHistoryService;

  constructor(repository = defaultNotificationRepository) {
    const history = new NotificationHistoryService(repository);
    const template = new TemplateService(repository);
    const preference = new PreferenceService(repository);
    const dispatcher = new MessageDispatcher(repository, history);

    this.history = history;
    this.template = template;
    this.preference = preference;
    this.delivery = new DeliveryService(repository, history);
    this.notification = new EnterpriseNotificationService(
      repository,
      template,
      preference,
      history,
      dispatcher,
    );
  }
}

export const PLATFORM_MISSION_NOTIFICATION = "P-010.3";
export const notificationFacade = new NotificationFacade();

/** Public API exports — no provider-specific APIs. */
export const notificationService = notificationFacade.notification;
export const templateService = notificationFacade.template;
export const preferenceService = notificationFacade.preference;
export const deliveryService = notificationFacade.delivery;
export const historyService = notificationFacade.history;

export { registerNotificationSubscribers } from "@/lib/platform/notification/register-notification-subscribers";
