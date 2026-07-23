import type { RecommendedDecision } from "@/lib/advisor-data";
import { CONFIDENCE_LABELS } from "@/lib/advisor-data";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DecisionCardProps = {
  decision: RecommendedDecision;
};

const CONFIDENCE_CLASS: Record<RecommendedDecision["confidence"], string> = {
  high: "text-orion-gold/90",
  medium: "text-white/55",
  low: "text-white/40",
};

/** Reusable executive decision card with rationale and impact. */
export function DecisionCard({ decision }: DecisionCardProps) {
  return (
    <article className="rounded-orion-md border border-orion-gold/10 bg-orion-gold/[0.04] p-4">
      <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
        Priority {decision.priority}
      </p>
      <h3 className="mt-2 text-base font-medium text-white/90">{decision.decision}</h3>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-medium tracking-wide text-white/40 uppercase">Why</dt>
          <dd className={`mt-1 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{decision.why}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Expected Impact
          </dt>
          <dd className={`mt-1 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>
            {decision.expectedImpact}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Confidence
          </dt>
          <dd
            className={cn(
              "mt-1 text-sm font-medium",
              CONFIDENCE_CLASS[decision.confidence],
            )}
          >
            {CONFIDENCE_LABELS[decision.confidence]}
          </dd>
        </div>
      </dl>
    </article>
  );
}
