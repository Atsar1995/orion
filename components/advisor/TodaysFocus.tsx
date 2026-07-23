import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { TODAYS_FOCUS } from "@/lib/advisor-data";

/** Exactly three priorities for today. */
export function TodaysFocus() {
  return (
    <Card title="Today's Focus" variant="premium">
      <ul className={WORKSPACE_LIST_CLASS}>
        {TODAYS_FOCUS.map((item, index) => (
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
