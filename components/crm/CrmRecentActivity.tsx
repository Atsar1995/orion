import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";
import type { CrmActivity } from "@/lib/crm/models/domain";

type CrmRecentActivityProps = {
  activities: CrmActivity[];
};

/** Recent customer intelligence activity timeline. */
export function CrmRecentActivity({ activities }: CrmRecentActivityProps) {
  return (
    <Card title="Recent Activity">
      <ul className={WORKSPACE_FIELD_LIST_CLASS}>
        {activities.map((item) => (
          <li
            key={`${item.time}-${item.description}`}
            className="flex gap-4 border-b border-white/[0.04] pb-3 last:border-b-0 last:pb-0"
          >
            <span className="w-20 shrink-0 text-xs font-medium tabular-nums text-white/40">
              {item.time}
            </span>
            <div className="min-w-0 flex-1">
              {item.type ? (
                <p className="text-[10px] font-medium tracking-wide text-white/35 uppercase">
                  {item.type}
                </p>
              ) : null}
              <span className="text-sm font-light text-white/60">{item.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
