import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { TODAYS_PRIORITIES } from "@/lib/advisor-data";

/** Up to five founder priorities for today. */
export function PrioritiesCard() {
  return (
    <Card title="Today's Priorities">
      <ul className={WORKSPACE_LIST_CLASS} aria-label="Today's priorities">
        {TODAYS_PRIORITIES.map((item, index) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="font-medium text-orion-gold">
              {index + 1}.
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
