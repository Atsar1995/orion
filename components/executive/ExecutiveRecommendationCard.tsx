import { ConfidenceIndicator } from "@/components/executive/ConfidenceIndicator";
import { EvidenceList } from "@/components/executive/EvidenceList";
import { ExecutiveActionBar } from "@/components/executive/ExecutiveActionBar";
import { Badge } from "@/components/common/Badge";
import type { ExecutiveRecommendation } from "@/types/executive";
import { cn } from "@/lib/utils";

type ExecutiveRecommendationCardProps = {
  recommendation: ExecutiveRecommendation;
  featured?: boolean;
  className?: string;
};

/** EC-003 recommendation card with evidence, impact, and quick actions. */
export function ExecutiveRecommendationCard({
  recommendation,
  featured = false,
  className,
}: ExecutiveRecommendationCardProps) {
  return (
    <article
      aria-label={`Recommendation: ${recommendation.title}`}
      className={cn(
        "flex h-full flex-col rounded-orion-lg border p-[var(--orion-space-4)] shadow-[var(--orion-shadow-md)]",
        featured
          ? "border-orion-gold/20 bg-gradient-to-br from-orion-gold/[0.08] via-orion-surface to-transparent"
          : "border-orion-border bg-orion-surface",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge className="normal-case tracking-normal">{recommendation.priorityLabel}</Badge>
        <ConfidenceIndicator confidence={recommendation.confidence} showLabel={false} />
      </div>

      <h3 className="text-base font-medium tracking-tight text-orion-text">
        {recommendation.title}
      </h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-orion-muted">
        {recommendation.description}
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">Impact</p>
          <p className="mt-1 text-sm font-light text-orion-text/85">{recommendation.impact}</p>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-medium tracking-wide text-orion-muted uppercase">
            Evidence
          </p>
          <EvidenceList evidence={recommendation.evidence} />
        </div>
      </div>

      <div className="mt-5 border-t border-orion-border pt-4">
        <ExecutiveActionBar actions={recommendation.actions} />
      </div>
    </article>
  );
}
