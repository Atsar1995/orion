import { Card } from "@/components/ui/Card";
import { EXECUTIVE_BRIEFING_ITEMS } from "@/lib/command-center-data";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";

/** Concise overnight and morning briefing for the founder. */
export function ExecutiveBriefingSection() {
  return (
    <Card title="Executive Briefing">
      <ul className={WORKSPACE_LIST_CLASS}>
        {EXECUTIVE_BRIEFING_ITEMS.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orion-gold/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
