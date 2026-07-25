import type { Alert, AlertNotification } from "@/types/alerts";

/** Dispatches alert notifications to configured channels (mock — dashboard only). */
export function dispatchAlertNotifications(alert: Alert): AlertNotification[] {
  const timestamp = new Date().toISOString();

  const dashboardNotification: AlertNotification = {
    id: `${alert.id}-dashboard`,
    channel: "dashboard",
    dispatchedAt: timestamp,
    status: "sent",
  };

  const notifications: AlertNotification[] = [dashboardNotification];

  if (alert.severity === "critical" || alert.status === "escalated") {
    notifications.push({
      id: `${alert.id}-email`,
      channel: "email",
      dispatchedAt: timestamp,
      status: "pending",
    });
  }

  return notifications;
}

export function attachNotifications(alerts: Alert[]): Alert[] {
  return alerts.map((alert) => ({
    ...alert,
    notifications: dispatchAlertNotifications(alert),
  }));
}

export const alertDispatcher = {
  dispatchAlertNotifications,
  attachNotifications,
};
