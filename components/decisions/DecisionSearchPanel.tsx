import { Card } from "@/components/ui/Card";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import type { DecisionSearchResult } from "@/types/decisions";

/** Executive decision search with intelligence scores (Mission P-003). */
export async function DecisionSearchPanel() {
  const { context } = await getDecisionServiceContext();
  const results = decisionService.searchDecisionsWithIntelligence(
    { escalationStatus: "attention" },
    context,
  );

  return (
    <Card title="Decision Search — Attention Required">
      {results.length === 0 ? (
        <p className="text-sm text-orion-muted">No decisions require attention right now.</p>
      ) : (
        <ul className="space-y-3">
          {results.slice(0, 5).map((entry: DecisionSearchResult) => (
            <li
              key={entry.decision.id}
              className="rounded-orion-md border border-orion-border/60 p-3"
            >
              <p className="text-sm font-medium text-orion-text">
                {entry.decision.title || entry.decision.recommendation.title}
              </p>
              <p className="mt-1 text-xs text-orion-muted">
                Priority {entry.intelligence.priorityScore} · Risk {entry.intelligence.riskScore} ·{" "}
                {entry.decision.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
