import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { FINANCE_ALERTS } from "@/lib/finance-insights";

/** Financial alerts requiring founder attention. */
export function FinanceAlerts() {
  return (
    <Card title="Financial Alerts">
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Financial alerts">
        {FINANCE_ALERTS.map((alert) => (
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
