import {
  buildAlertBundle,
  buildAlertPanelSnapshot,
  buildDashboardAlerts,
} from "@/lib/intelligence/alerts/AlertEngine";
import type { AlertBundle, AlertPanelSnapshot } from "@/types/alerts";
import type { Alert } from "@/types/intelligence";

/** Alert service — Alert & Event Engine (ES-030) via Provider Framework. */
export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    return buildDashboardAlerts();
  },

  async getAlertBundle(): Promise<AlertBundle> {
    return buildAlertBundle();
  },

  async getAlertPanel(): Promise<AlertPanelSnapshot> {
    return buildAlertPanelSnapshot();
  },
};
