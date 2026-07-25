import { getEnabledAlertRules } from "@/lib/intelligence/alerts/AlertRules";
import type { AlertRule } from "@/types/alerts";

const EVENT_TYPES = new Set<string>();
const RULES = new Map<string, AlertRule>();

for (const rule of getEnabledAlertRules()) {
  EVENT_TYPES.add(rule.eventType);
  RULES.set(rule.id, rule);
}

/** Registry for alert rules and supported event types. */
export class AlertRegistry {
  registerRule(rule: AlertRule): void {
    RULES.set(rule.id, rule);
    EVENT_TYPES.add(rule.eventType);
  }

  getRule(ruleId: string): AlertRule | undefined {
    return RULES.get(ruleId);
  }

  getRulesForEvent(eventType: string): AlertRule[] {
    return Array.from(RULES.values()).filter(
      (rule) => rule.enabled && rule.eventType === eventType,
    );
  }

  listRules(): AlertRule[] {
    return Array.from(RULES.values()).filter((rule) => rule.enabled);
  }

  listEventTypes(): string[] {
    return Array.from(EVENT_TYPES.values());
  }

  supportsEventType(eventType: string): boolean {
    return EVENT_TYPES.has(eventType);
  }
}

export const alertRegistry = new AlertRegistry();
