/** Origin of an executive alert signal. */
export type AlertSource = "provider" | "rule" | "event" | "platform" | "escalation";

const SOURCE_LABEL: Record<AlertSource, string> = {
  provider: "Provider",
  rule: "Rule",
  event: "Event",
  platform: "Platform",
  escalation: "Escalation",
};

/** Human-readable alert source label. */
export function formatAlertSource(source: AlertSource): string {
  return SOURCE_LABEL[source];
}
