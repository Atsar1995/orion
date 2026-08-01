import {
  Widget,
  WidgetBody,
  WidgetFooter,
  WidgetHeader,
} from "@/components/dashboard";
import type { DashboardBusinessHealthData } from "@/lib/dashboard/types";

type BusinessHealthWidgetProps = {
  data: DashboardBusinessHealthData;
};

const STATUS_LABEL = {
  healthy: "Healthy",
  attention: "Attention",
  critical: "Critical",
} as const;

/** EP-002 business health widget — presentation only. */
export function BusinessHealthWidget({ data }: BusinessHealthWidgetProps) {
  return (
    <Widget>
      <WidgetHeader title="Business Health" description="Overall platform condition" />
      <WidgetBody className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold text-white">{data.score}</p>
            <p className="text-xs text-white/45">of {data.maxScore}</p>
          </div>
          <p className="text-sm font-medium text-orion-gold">{data.trend}</p>
        </div>
        <p className="text-sm font-light leading-relaxed text-white/70">{data.summary}</p>
        <ul className="space-y-2">
          {data.drivers.map((driver) => (
            <li
              key={driver.label}
              className="flex items-center justify-between gap-3 text-sm text-white/65"
            >
              <span>{driver.label}</span>
              <span className="text-xs uppercase tracking-wide text-white/45">
                {STATUS_LABEL[driver.status]}
              </span>
            </li>
          ))}
        </ul>
      </WidgetBody>
      <WidgetFooter>Status: {STATUS_LABEL[data.status]}</WidgetFooter>
    </Widget>
  );
}
