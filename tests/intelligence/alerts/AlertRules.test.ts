import { describe, expect, it } from "vitest";
import {
  ALERT_RULES,
  getAlertRule,
  getEnabledAlertRules,
  interpolateTemplate,
} from "@/lib/intelligence/alerts/AlertRules";
import { evaluateAlertContext } from "@/lib/intelligence/alerts/AlertEvaluator";
import type { AlertEvaluationContext } from "@/types/alerts";

function buildContext(overrides: Partial<AlertEvaluationContext> = {}): AlertEvaluationContext {
  return {
    contributions: [],
    trends: [],
    metrics: {
      revenue: {
        id: "metric-revenue",
        label: "Revenue",
        value: "₹42.8L",
        workspace: "Finance",
      },
      occupancy: {
        id: "metric-occupancy",
        label: "Occupancy",
        value: "84%",
        workspace: "Hospitality",
      },
      customer: {
        id: "metric-customer",
        label: "Customer Metrics",
        value: "312 active",
        workspace: "CRM",
      },
      marketing: {
        id: "metric-marketing",
        label: "Marketing Metrics",
        value: "4.2× ROAS",
        trend: "down",
        workspace: "Marketing",
      },
    },
    businessHealth: {
      score: 80,
      maxScore: 100,
      trend: "+3",
      status: "attention",
      summary: "Attention",
      drivers: [],
    },
    ...overrides,
  };
}

describe("AlertRules", () => {
  it("loads enabled configuration-driven rules", () => {
    const rules = getEnabledAlertRules();

    expect(rules.length).toBeGreaterThan(5);
    expect(rules.every((rule) => rule.enabled)).toBe(true);
    expect(rules).toEqual(ALERT_RULES.filter((rule) => rule.enabled));
  });

  it("looks up rules by id", () => {
    expect(getAlertRule("rule-guest-complaint")?.name).toBe("Guest Complaint");
    expect(getAlertRule("missing-rule")).toBeUndefined();
  });

  it("interpolates message templates with payload values", () => {
    const message = interpolateTemplate(
      "Revenue dropped to {currentValue} from {previousValue} over {period}.",
      {
        currentValue: "₹39.6L",
        previousValue: "₹42.8L",
        period: "7d",
      },
    );

    expect(message).toBe("Revenue dropped to ₹39.6L from ₹42.8L over 7d.");
  });

  it("matches guest complaint rule against critical hospitality alert", () => {
    const alerts = evaluateAlertContext(
      buildContext({
        contributions: [
          {
            providerId: "hospitality",
            workspace: "Hospitality",
            alerts: [
              {
                id: "alert-hosp-1",
                severity: "critical",
                message: "Guest complaint awaiting response — Room 305",
              },
            ],
          },
        ],
      }),
    );

    expect(alerts.some((alert) => alert.title === "Critical guest complaint")).toBe(true);
  });

  it("matches marketing campaign failure when trend is down", () => {
    const alerts = evaluateAlertContext(
      buildContext({
        trends: [
          {
            id: "trend-roas",
            label: "Marketing ROAS",
            currentValue: "4.2×",
            previousValue: "4.5×",
            direction: "down",
            period: "7d",
            workspace: "Marketing",
          },
        ],
      }),
    );

    expect(alerts.some((alert) => alert.title === "Marketing campaign underperforming")).toBe(
      true,
    );
  });
});
