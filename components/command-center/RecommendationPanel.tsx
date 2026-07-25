import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import type { DashboardSnapshot } from "@/types/intelligence";

type RecommendationPanelProps = {
  snapshot: DashboardSnapshot;
};

/** Top recommendations from the Recommendation Engine via orchestrator snapshot. */
export function RecommendationPanel({ snapshot }: RecommendationPanelProps) {
  return (
    <ul className="grid grid-cols-1 gap-[var(--orion-space-3)] lg:grid-cols-2">
      {snapshot.recommendations.map((recommendation) => (
        <li key={recommendation.id}>
          <RecommendationCard recommendation={recommendation} />
        </li>
      ))}
    </ul>
  );
}
