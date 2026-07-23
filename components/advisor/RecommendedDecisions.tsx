import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import { RECOMMENDED_DECISIONS } from "@/lib/advisor-data";

/** Prioritized executive decisions with rationale and impact. */
export function RecommendedDecisions() {
  return (
    <Card title="Recommended Decisions">
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {RECOMMENDED_DECISIONS.map((item) => (
          <li
            key={item.priority}
            className="rounded-orion-md border border-orion-gold/10 bg-orion-gold/[0.04] p-4"
          >
            <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
              Priority {item.priority}
            </p>
            <p className="mt-2 text-sm font-medium text-white/90">{item.decision}</p>
            <p className="mt-3 text-xs font-medium tracking-wide text-white/40 uppercase">
              Why
            </p>
            <p className={`mt-1 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.why}</p>
            <p className="mt-3 text-xs font-medium tracking-wide text-white/40 uppercase">
              Expected Business Impact
            </p>
            <p className={`mt-1 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.expectedImpact}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
