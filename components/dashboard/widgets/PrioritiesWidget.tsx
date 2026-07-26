import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { MockPrioritiesData } from "@/lib/dashboard/mock/MockAlerts";

type PrioritiesWidgetProps = {
  data: MockPrioritiesData;
};

/** EP-002 priorities widget — presentation only. */
export function PrioritiesWidget({ data }: PrioritiesWidgetProps) {
  return (
    <Widget>
      <WidgetHeader title="Today's Priorities" description="Ranked executive focus items" />
      <WidgetBody>
        <ol className="space-y-3">
          {data.items.map((priority) => (
            <li
              key={priority.id}
              className="flex items-start gap-3 rounded-orion-md border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orion-gold/30 text-xs font-medium text-orion-gold">
                {priority.rank}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white/85">{priority.title}</p>
                <p className="mt-1 text-xs text-white/45">{priority.workspace}</p>
              </div>
            </li>
          ))}
        </ol>
      </WidgetBody>
      <WidgetFooter>Priorities sourced from mock snapshot</WidgetFooter>
    </Widget>
  );
}
