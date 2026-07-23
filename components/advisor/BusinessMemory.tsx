import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { BUSINESS_MEMORY } from "@/lib/advisor-data";

/** Learned historical patterns across the business. */
export function BusinessMemory() {
  return (
    <Card title="Business Memory">
      <ul className={WORKSPACE_LIST_CLASS}>
        {BUSINESS_MEMORY.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="text-white/35">
              ◆
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
