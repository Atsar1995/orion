import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { CRM_CUSTOMER_ALERTS } from "@/lib/crm-insights";

/** Customer alerts requiring founder attention. */
export function CustomerAlerts() {
  return (
    <Card title="Customer Alerts">
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Customer alerts">
        {CRM_CUSTOMER_ALERTS.map((alert) => (
          <li key={alert.message} className={WORKSPACE_FIELD_ROW_CLASS}>
            <p className="text-sm font-light leading-relaxed text-white/60">
              {alert.message}
            </p>
            <StatusIndicator status={alert.severity} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
