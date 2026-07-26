export {
  MOCK_DUPLICATE_GUEST_SIGNAL,
  MOCK_ESCALATED_SECURITY_SIGNAL,
  MOCK_EXECUTIVE_ALERT_SIGNALS,
  MOCK_RESOLVED_SYNC_SIGNAL,
} from "@/lib/alerts/mock/MockExecutiveAlertSignals";

import { createAlertCenterSnapshot } from "@/lib/alerts/engine/AlertEngine";
import { MOCK_EXECUTIVE_ALERT_SIGNALS } from "@/lib/alerts/mock/MockExecutiveAlertSignals";

/** Fixed timestamp for deterministic EP-003 alert center snapshots. */
export const MOCK_ALERT_CENTER_GENERATED_AT = "2026-07-26T06:00:00.000Z";

/** Builds the default deterministic alert center snapshot for dashboard integration. */
export function createMockAlertCenterSnapshot() {
  return createAlertCenterSnapshot({
    signals: MOCK_EXECUTIVE_ALERT_SIGNALS,
    generatedAt: MOCK_ALERT_CENTER_GENERATED_AT,
  });
}
