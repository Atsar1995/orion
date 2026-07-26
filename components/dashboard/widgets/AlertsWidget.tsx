import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { MockAlertsData } from "@/lib/dashboard/mock/MockAlerts";

type AlertsWidgetProps = {
  data: MockAlertsData;
};

const SEVERITY_CLASS = {
  critical: "text-red-300",
  high: "text-amber-300",
  medium: "text-yellow-200",
  low: "text-white/55",
} as const;

/** EP-002 alerts widget — presentation only. */
export function AlertsWidget({ data }: AlertsWidgetProps) {
  return (
    <Widget>
      <WidgetHeader
        title="Critical Alerts"
        description={`${data.activeCount} active alert${data.activeCount === 1 ? "" : "s"}`}
      />
      <WidgetBody>
        <ul className="space-y-3">
          {data.items.map((alert) => (
            <li
              key={alert.id}
              className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <p className={`text-xs font-medium uppercase tracking-wide ${SEVERITY_CLASS[alert.severity]}`}>
                {alert.severity}
              </p>
              <p className="mt-1 text-sm text-white/80">{alert.message}</p>
              <p className="mt-1 text-xs text-white/45">{alert.category}</p>
            </li>
          ))}
        </ul>
      </WidgetBody>
      <WidgetFooter>Alert engine not connected in EP-002</WidgetFooter>
    </Widget>
  );
}
