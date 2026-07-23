import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { ORION_INTELLIGENCE } from "@/lib/advisor-data";

/** AI-style observations synthesized across the business. */
export function OrionIntelligence() {
  return (
    <Card title="ORION Intelligence" variant="premium">
      <ul className={WORKSPACE_LIST_CLASS}>
        {ORION_INTELLIGENCE.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="text-orion-gold">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
