import { Card } from "@/components/ui/Card";
import { RECOMMENDED_ACTIONS } from "@/lib/command-center-data";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";

/** Executive recommended actions for today. */
export function RecommendedActionsCard() {
  return (
    <Card title="Recommended Actions">
      <ul className={WORKSPACE_LIST_CLASS}>
        {RECOMMENDED_ACTIONS.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="text-orion-gold">
              →
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
