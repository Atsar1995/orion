import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { MockConfidenceData } from "@/lib/dashboard/mock/MockBusinessHealth";

type ConfidenceWidgetProps = {
  data: MockConfidenceData;
};

const BAND_LABEL = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
} as const;

/** EP-002 confidence widget — presentation only, no EC-002B logic. */
export function ConfidenceWidget({ data }: ConfidenceWidgetProps) {
  const percentage = Math.round(data.score * 100);

  return (
    <Widget>
      <WidgetHeader title="Confidence" description="Signal consistency across providers" />
      <WidgetBody className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-semibold text-white">{percentage}%</p>
            <p className="text-xs text-white/45">{BAND_LABEL[data.band]}</p>
          </div>
        </div>
        <p className="text-sm font-light leading-relaxed text-white/70">{data.summary}</p>
        <ul className="space-y-2">
          {data.factors.map((factor) => (
            <li key={factor} className="text-sm font-light text-white/60">
              {factor}
            </li>
          ))}
        </ul>
      </WidgetBody>
      <WidgetFooter>Explainability surface — mock snapshot</WidgetFooter>
    </Widget>
  );
}
