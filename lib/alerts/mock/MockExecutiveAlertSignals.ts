import type { ExecutiveAlertSignal } from "@/lib/alerts/models/Alert";

/** Duplicate hospitality signal used to validate deduplication behavior. */
export const MOCK_DUPLICATE_GUEST_SIGNAL: ExecutiveAlertSignal = {
  id: "signal-guest-duplicate",
  title: "Guest complaint duplicate signal",
  message: "Duplicate Room 305 complaint signal from secondary channel.",
  severity: "critical",
  category: "hospitality",
  source: "event",
  status: "active",
  workspace: "Hospitality",
  dedupeKey: "guest-complaint-room-305",
  createdAt: "2026-07-26T05:30:00.000Z",
};

/** Resolved alert signal for filter and status coverage. */
export const MOCK_RESOLVED_SYNC_SIGNAL: ExecutiveAlertSignal = {
  id: "signal-sync-resolved",
  title: "Integration sync resolved",
  message: "Shopify sync delay was resolved overnight.",
  severity: "medium",
  category: "commerce",
  source: "provider",
  status: "resolved",
  workspace: "Commerce",
  dedupeKey: "commerce-sync-delay-resolved",
  createdAt: "2026-07-26T04:15:00.000Z",
};

/** Escalated security signal for status coverage. */
export const MOCK_ESCALATED_SECURITY_SIGNAL: ExecutiveAlertSignal = {
  id: "signal-security-escalated",
  title: "Repeated failed login attempts",
  message: "Security monitor escalated repeated failed admin login attempts.",
  severity: "high",
  category: "security",
  source: "escalation",
  status: "escalated",
  workspace: "Platform",
  dedupeKey: "security-admin-login-escalation",
  createdAt: "2026-07-26T03:45:00.000Z",
};

/** Deterministic incoming alert signals for EP-003 development and tests. */
export const MOCK_EXECUTIVE_ALERT_SIGNALS: readonly ExecutiveAlertSignal[] = [
  MOCK_DUPLICATE_GUEST_SIGNAL,
  MOCK_RESOLVED_SYNC_SIGNAL,
  MOCK_ESCALATED_SECURITY_SIGNAL,
] as const;
