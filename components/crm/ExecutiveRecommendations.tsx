import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import { getProvider } from "@/lib/intelligence/intelligence-bus";
import type { ExecutiveRecommendation } from "@/lib/intelligence/models";

type ExecutiveRecommendationsProps = {
  recommendations?: ExecutiveRecommendation[];
  title?: string;
};

/** Executive recommendations from the Provider Registry — presentation only (ADR-006). */
export function ExecutiveRecommendations({
  recommendations = getProvider("crm")?.getRecommendations() ?? [],
  title = "Executive Recommendations",
}: ExecutiveRecommendationsProps) {
  return (
    <Card title={title} variant="premium">
      <ul className="space-y-3" aria-label={title}>
        {recommendations.map((item) => (
          <li
            key={item.priority}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
              Priority {item.priority}
            </p>
            <p className="mt-2 text-sm font-medium text-white/90">{item.title}</p>
            <p className={`mt-2 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
