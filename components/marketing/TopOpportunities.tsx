import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { TOP_OPPORTUNITIES } from "@/lib/marketing-data";

/** Highest-value marketing opportunities for founders. */
export function TopOpportunities() {
  return (
    <Card title="Top Opportunities">
      <ul className={WORKSPACE_LIST_CLASS}>
        {TOP_OPPORTUNITIES.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="text-orion-gold">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
