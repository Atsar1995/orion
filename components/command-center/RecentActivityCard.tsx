import { Card } from "@/components/ui/Card";
import { RECENT_ACTIVITY } from "@/lib/command-center-data";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";

/** Recent platform activity timeline. */
export function RecentActivityCard() {
  return (
    <Card title="Recent Activity">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {RECENT_ACTIVITY.map((item) => (
          <li
            key={`${item.time}-${item.description}`}
            className="flex gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <span className="w-12 shrink-0 text-xs font-medium tabular-nums text-white/40">
              {item.time}
            </span>
            <span className="text-sm font-light text-white/60">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
