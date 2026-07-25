import { Badge } from "@/components/common/Badge";
import type { Recommendation } from "@/types/intelligence";
import { cn } from "@/lib/utils";

type RecommendationCardProps = {
  recommendation: Recommendation;
  className?: string;
};

/** Single executive recommendation — maps to Recommendation Engine output (ES-029). */
export function RecommendationCard({ recommendation, className }: RecommendationCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-orion-md border border-orion-border bg-orion-surface p-[var(--orion-space-3)] transition-colors duration-[var(--orion-duration-normal)] hover:border-orion-gold/20 hover:bg-white/[0.04]",
        className,
      )}
    >
      <div className="mb-[var(--orion-space-2)] flex items-center justify-between gap-2">
        <Badge className="normal-case tracking-normal">Priority {recommendation.priority}</Badge>
        {recommendation.category ? (
          <span className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
            {recommendation.category}
          </span>
        ) : null}
      </div>
      <h4 className="text-sm font-medium tracking-tight text-orion-text">
        {recommendation.title}
      </h4>
      <p className="mt-[var(--orion-space-2)] flex-1 text-sm font-light leading-[var(--orion-leading-relaxed)] text-orion-muted">
        {recommendation.description}
      </p>
    </article>
  );
}
