import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { DashboardExecutiveNarrativeData } from "@/lib/dashboard/types";

type ExecutiveNarrativeWidgetProps = {
  data: DashboardExecutiveNarrativeData;
};

/** EP-002 executive narrative widget — presentation only. */
export function ExecutiveNarrativeWidget({ data }: ExecutiveNarrativeWidgetProps) {
  return (
    <Widget>
      <WidgetHeader title={data.title} description={`Focus: ${data.focusArea}`} />
      <WidgetBody className="space-y-3">
        {data.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-sm font-light leading-relaxed text-white/70">
            {paragraph}
          </p>
        ))}
      </WidgetBody>
      <WidgetFooter>Narrative engine not connected in EP-002</WidgetFooter>
    </Widget>
  );
}
