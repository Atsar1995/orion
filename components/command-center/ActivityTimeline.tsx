import { buildActivityTimeline } from "@/lib/command-center/snapshot-view";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import type { DashboardSnapshot } from "@/types/intelligence";
import { Card } from "@/components/ui/Card";

type ActivityTimelineProps = {
  snapshot: DashboardSnapshot;
};

const CATEGORY_LABEL: Record<
  ReturnType<typeof buildActivityTimeline>[number]["category"],
  string
> = {
  sync: "Provider Synchronization",
  event: "Recent Events",
  task: "Completed Tasks",
  action: "Executive Actions",
};

/** Activity timeline derived from orchestrator snapshot — no independent data fetch. */
export function ActivityTimeline({ snapshot }: ActivityTimelineProps) {
  const items = buildActivityTimeline(snapshot);
  const grouped = {
    sync: items.filter((item) => item.category === "sync"),
    event: items.filter((item) => item.category === "event"),
    task: items.filter((item) => item.category === "task"),
    action: items.filter((item) => item.category === "action"),
  };

  return (
    <Card title="Activity Timeline">
      <div className="space-y-6">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => (
          <section key={category} aria-label={CATEGORY_LABEL[category]}>
            <h4 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
              {CATEGORY_LABEL[category]}
            </h4>
            {grouped[category].length > 0 ? (
              <ul className={WORKSPACE_LIST_CLASS}>
                {grouped[category].map((item) => (
                  <li key={item.id} className={WORKSPACE_LIST_ITEM_CLASS}>
                    <span className="shrink-0 font-mono text-xs text-orion-gold/70">{item.time}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-light text-orion-muted">No entries.</p>
            )}
          </section>
        ))}
      </div>
    </Card>
  );
}
