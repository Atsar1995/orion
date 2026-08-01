import { randomUUID } from "crypto";
import type {
  NotificationDeliveryState,
  NotificationHistoryRecord,
} from "@/types/notification";
import type { NotificationRepository } from "@/lib/platform/notification/repositories/NotificationRepository";
import type { ServiceContext } from "@/types/services";

function nowIso(): string {
  return new Date().toISOString();
}

/** Records immutable notification history entries (Mission P-010.3). */
export class NotificationHistoryService {
  constructor(private readonly repository: NotificationRepository) {}

  record(
    context: ServiceContext,
    notificationId: string,
    action: string,
    fromState?: NotificationDeliveryState,
    toState?: NotificationDeliveryState,
    detail?: string,
  ): NotificationHistoryRecord {
    return this.repository.recordHistory({
      id: `nh-${randomUUID()}`,
      organizationId: context.organizationId,
      notificationId,
      action,
      fromState,
      toState,
      actorId: context.userId ?? "system",
      timestamp: nowIso(),
      detail,
    });
  }

  list(context: ServiceContext, notificationId: string): readonly NotificationHistoryRecord[] {
    return this.repository.listHistory(context.organizationId, notificationId);
  }
}
