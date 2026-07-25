import { describe, expect, it } from "vitest";
import { alertRegistry } from "@/lib/intelligence/alerts/AlertRegistry";
import type { AlertRule } from "@/types/alerts";

describe("AlertRegistry", () => {
  it("lists enabled rules and supported event types", () => {
    const rules = alertRegistry.listRules();
    const eventTypes = alertRegistry.listEventTypes();

    expect(rules.length).toBeGreaterThan(5);
    expect(eventTypes).toContain("guest.complaint");
    expect(alertRegistry.supportsEventType("marketing.campaign.failure")).toBe(true);
  });

  it("returns rules for a specific event type", () => {
    const rules = alertRegistry.getRulesForEvent("guest.complaint");

    expect(rules).toHaveLength(1);
    expect(rules[0]?.id).toBe("rule-guest-complaint");
  });

  it("registers custom rules at runtime", () => {
    const customRule: AlertRule = {
      id: "rule-test-custom",
      name: "Custom Test Rule",
      enabled: true,
      category: "operations",
      severity: "medium",
      eventType: "test.custom.event",
      conditions: [{ field: "status", operator: "equals", value: "open" }],
      title: "Custom test alert",
      messageTemplate: "{message}",
    };

    alertRegistry.registerRule(customRule);

    expect(alertRegistry.getRule("rule-test-custom")).toEqual(customRule);
    expect(alertRegistry.getRulesForEvent("test.custom.event")).toContainEqual(customRule);
  });
});
