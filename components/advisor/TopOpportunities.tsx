import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import { TOP_OPPORTUNITIES } from "@/lib/advisor-data";

/** Highest-value business opportunities across all workspaces. */
export function TopOpportunities() {
  return (
    <Card title="Top Opportunities">
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {TOP_OPPORTUNITIES.map((item) => (
          <li
            key={item.title}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <p className="text-sm font-medium text-white/90">{item.title}</p>
            <p className="mt-2 text-xs font-medium tracking-wide text-white/40 uppercase">
              Why it matters
            </p>
            <p className={`mt-1 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.why}</p>
            <p className="mt-3 text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
              Expected Impact
            </p>
            <p className={`mt-1 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.expectedImpact}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
