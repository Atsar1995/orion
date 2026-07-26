import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { MockRecommendationPreviewData } from "@/lib/dashboard/mock/MockKPIs";

type RecommendationPreviewWidgetProps = {
  data: MockRecommendationPreviewData;
};

/** EP-002 recommendation preview widget — presentation only. */
export function RecommendationPreviewWidget({ data }: RecommendationPreviewWidgetProps) {
  return (
    <Widget>
      <WidgetHeader title="Recommendations" description="Top actions for executive review" />
      <WidgetBody>
        <ul className="space-y-3">
          {data.items.map((recommendation) => (
            <li
              key={recommendation.id}
              className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/85">{recommendation.title}</p>
                <span className="text-xs text-orion-gold">P{recommendation.priority}</span>
              </div>
              <p className="mt-2 text-sm font-light text-white/60">{recommendation.description}</p>
              <p className="mt-2 text-xs text-white/45">{recommendation.workspace}</p>
            </li>
          ))}
        </ul>
      </WidgetBody>
      <WidgetFooter>Recommendation engine not connected in EP-002</WidgetFooter>
    </Widget>
  );
}
