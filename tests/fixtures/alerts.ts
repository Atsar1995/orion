import type { Alert } from "@/types/alerts";

export function createTestAlert(overrides: Partial<Alert> = {}): Alert {
  const timestamp = "2026-07-25T10:00:00.000Z";

  return {
    id: "alert-test-1",
    title: "Test alert",
    message: "Test alert message",
    severity: "high",
    category: "finance",
    source: "rule",
    status: "active",
    trigger: {
      id: "trigger-test-1",
      eventType: "payment.failure",
      source: "event",
      payload: { dedupeKey: "test-alert-1" },
      occurredAt: timestamp,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}
