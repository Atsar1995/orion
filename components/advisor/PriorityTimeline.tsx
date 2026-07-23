import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { PRIORITY_TIMELINE } from "@/lib/advisor-data";

/** Daily priority timeline for executive scheduling. */
export function PriorityTimeline() {
  return (
    <Card title="Priority Timeline">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PRIORITY_TIMELINE.map((block) => (
          <li
            key={block.period}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
              {block.period}
            </p>
            <ul className={`mt-3 ${WORKSPACE_LIST_CLASS}`}>
              {block.items.map((item) => (
                <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
                  <span aria-hidden className="text-orion-gold/70">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}
