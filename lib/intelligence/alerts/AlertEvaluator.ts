import { alertRegistry } from "@/lib/intelligence/alerts/AlertRegistry";
import { interpolateTemplate } from "@/lib/intelligence/alerts/AlertRules";
import type {
  Alert,
  AlertAction,
  AlertCondition,
  AlertEvaluationContext,
  AlertRule,
  AlertTrigger,
} from "@/types/alerts";

function matchesCondition(payload: Record<string, string>, condition: AlertCondition): boolean {
  const value = payload[condition.field];

  switch (condition.operator) {
    case "exists":
      return value !== undefined && value.length > 0;
    case "equals":
      return value === String(condition.value);
    case "contains":
      return value?.toLowerCase().includes(String(condition.value).toLowerCase()) ?? false;
    case "lt":
      return Number(value) < Number(condition.value);
    case "gt":
      return Number(value) > Number(condition.value);
    default:
      return false;
  }
}

function evaluateRule(rule: AlertRule, trigger: AlertTrigger): boolean {
  if (rule.eventType !== trigger.eventType) {
    return false;
  }

  return rule.conditions.every((condition) => matchesCondition(trigger.payload, condition));
}

function defaultActions(rule: AlertRule, alertId: string): AlertAction[] {
  return [
    {
      id: `${alertId}-action-review`,
      label: "Review signal",
      description: `Review ${rule.name} and assign an owner.`,
    },
    {
      id: `${alertId}-action-ack`,
      label: "Acknowledge alert",
      description: "Mark alert as acknowledged in the operations queue.",
    },
  ];
}

function buildAlertFromRule(rule: AlertRule, trigger: AlertTrigger, timestamp: string): Alert {
  const alertId = `alert-${rule.id}-${trigger.id}`;

  return {
    id: alertId,
    title: rule.title,
    message: interpolateTemplate(rule.messageTemplate, trigger.payload),
    severity: rule.severity,
    category: rule.category,
    source: "rule",
    status: "active",
    trigger,
    groupId: rule.groupKey,
    actions: defaultActions(rule, alertId),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Evaluates alert rules against incoming event triggers. */
export function evaluateTriggers(triggers: AlertTrigger[], timestamp: string): Alert[] {
  const alerts: Alert[] = [];

  for (const trigger of triggers) {
    const rules = alertRegistry.getRulesForEvent(trigger.eventType);

    for (const rule of rules) {
      if (!evaluateRule(rule, trigger)) {
        continue;
      }

      alerts.push(buildAlertFromRule(rule, trigger, timestamp));
    }
  }

  return alerts;
}

function createTrigger(
  eventType: string,
  source: AlertTrigger["source"],
  payload: Record<string, string>,
  options?: { providerId?: string; workspace?: string },
): AlertTrigger {
  return {
    id: `trigger-${eventType}-${payload.dedupeKey ?? Date.now()}`,
    eventType,
    source,
    providerId: options?.providerId,
    workspace: options?.workspace,
    payload,
    occurredAt: new Date().toISOString(),
  };
}

/** Builds event triggers from provider framework and mock platform events. */
export function buildEventTriggers(context: AlertEvaluationContext): AlertTrigger[] {
  const triggers: AlertTrigger[] = [];
  const { contributions, trends, metrics } = context;

  for (const trend of trends) {
    if (trend.workspace === "Finance" && trend.direction === "down") {
      triggers.push(
        createTrigger(
          "revenue.drop",
          "provider",
          {
            dedupeKey: `revenue-drop-${trend.id}`,
            direction: trend.direction,
            currentValue: trend.currentValue,
            previousValue: trend.previousValue,
            period: trend.period,
          },
          { workspace: trend.workspace, providerId: "finance" },
        ),
      );
    }

    if (trend.workspace === "Marketing" && trend.direction === "down") {
      triggers.push(
        createTrigger(
          "marketing.campaign.failure",
          "provider",
          {
            dedupeKey: `marketing-failure-${trend.id}`,
            direction: trend.direction,
            currentValue: trend.currentValue,
            previousValue: trend.previousValue,
            period: trend.period,
          },
          { workspace: trend.workspace, providerId: "marketing" },
        ),
      );
    }

    if (trend.workspace === "CRM") {
      triggers.push(
        createTrigger(
          "customer.trend.negative",
          "provider",
          {
            dedupeKey: `crm-trend-${trend.id}`,
            workspace: trend.workspace,
            currentValue: trend.currentValue,
            previousValue: trend.previousValue,
            period: trend.period,
          },
          { workspace: trend.workspace, providerId: "crm" },
        ),
      );
    }
  }

  for (const contribution of contributions) {
    for (const alert of contribution.alerts ?? []) {
      const payload = {
        dedupeKey: alert.id,
        message: alert.message,
        severity: alert.severity,
        status: alert.message.toLowerCase().includes("overdue") ? "overdue" : alert.severity,
        signal: alert.message.toLowerCase(),
      };

      if (alert.severity === "critical" && alert.message.toLowerCase().includes("guest")) {
        triggers.push(
          createTrigger("guest.complaint", "provider", payload, {
            providerId: contribution.providerId,
            workspace: contribution.workspace,
          }),
        );
      }

      if (alert.message.toLowerCase().includes("occupancy")) {
        triggers.push(
          createTrigger("occupancy.decline", "provider", payload, {
            providerId: contribution.providerId,
            workspace: contribution.workspace,
          }),
        );
      }

      if (alert.message.toLowerCase().includes("payment")) {
        triggers.push(
          createTrigger("payment.failure", "provider", payload, {
            providerId: contribution.providerId,
            workspace: contribution.workspace,
          }),
        );
      }

      if (alert.message.toLowerCase().includes("contract")) {
        triggers.push(
          createTrigger("contract.pending", "provider", payload, {
            providerId: contribution.providerId,
            workspace: contribution.workspace,
          }),
        );
      }
    }
  }

  if (metrics.marketing.trend === "down") {
    triggers.push(
      createTrigger(
        "marketing.campaign.failure",
        "event",
        {
          dedupeKey: "marketing-metric-down",
          direction: "down",
          currentValue: metrics.marketing.value,
          previousValue: metrics.marketing.change ?? "baseline",
          period: "7d",
        },
        { workspace: "Marketing", providerId: "marketing" },
      ),
    );
  }

  triggers.push(
    createTrigger(
      "inventory.warning",
      "event",
      {
        dedupeKey: "inventory-warning-commerce",
        level: "low",
        workspace: "Commerce",
      },
      { workspace: "Commerce", providerId: "commerce" },
    ),
    createTrigger(
      "booking.cancellation.spike",
      "event",
      {
        dedupeKey: "booking-cancellation-spike",
        change: "+18%",
        workspace: "Hospitality",
      },
      { workspace: "Hospitality", providerId: "hospitality" },
    ),
    createTrigger(
      "website.outage",
      "event",
      {
        dedupeKey: "website-outage-booking-engine",
        status: "down",
        workspace: "Infrastructure",
      },
      { providerId: "platform" },
    ),
  );

  return triggers;
}

export function evaluateAlertContext(context: AlertEvaluationContext): Alert[] {
  const timestamp = new Date().toISOString();
  const triggers = buildEventTriggers(context);
  return evaluateTriggers(triggers, timestamp);
}
