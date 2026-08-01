import type { NotificationRecord } from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import type { ServiceContext } from "@/types/services";
import { MessageDispatcher } from "@/lib/platform/notification/MessageDispatcher";
import { NotificationHistoryService } from "@/lib/platform/notification/NotificationHistoryService";

/** Delivery tracking and retry operations (Mission P-010.3). */
export class DeliveryService {
  private readonly dispatcher: MessageDispatcher;

  constructor(
    repository: NotificationRepository,
    historyService: NotificationHistoryService,
  ) {
    this.dispatcher = new MessageDispatcher(repository, historyService);
  }

  getStatus(notificationId: string, context: ServiceContext): NotificationRecord | null {
    return this.dispatcher.getDeliveryStatus(notificationId, context);
  }

  retry(notificationId: string, context: ServiceContext): Promise<NotificationRecord> {
    return this.dispatcher.retry(notificationId, context);
  }

  cancel(notificationId: string, context: ServiceContext): NotificationRecord {
    return this.dispatcher.cancel(notificationId, context);
  }

  markRead(notificationId: string, context: ServiceContext): NotificationRecord {
    return this.dispatcher.markRead(notificationId, context);
  }

  dispatch(notification: NotificationRecord, context: ServiceContext): Promise<NotificationRecord> {
    return this.dispatcher.dispatch(notification, context);
  }
}
