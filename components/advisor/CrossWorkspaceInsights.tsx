import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { CROSS_WORKSPACE_INSIGHTS } from "@/lib/advisor-data";

/** Insights connecting multiple business domains. */
export function CrossWorkspaceInsights() {
  return (
    <Card title="Cross-Workspace Insights">
      <ul className={WORKSPACE_LIST_CLASS}>
        {CROSS_WORKSPACE_INSIGHTS.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="text-orion-gold/70">
              →
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
