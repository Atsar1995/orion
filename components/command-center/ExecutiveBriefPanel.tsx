import {
  buildCriticalChanges,
  buildPrioritiesFromTasks,
} from "@/lib/command-center/snapshot-view";
import {
  WORKSPACE_LIST_CLASS,
  WORKSPACE_LIST_ITEM_CLASS,
  WORKSPACE_SUMMARY_CLASS,
} from "@/lib/constants";
import type { DashboardSnapshot } from "@/types/intelligence";
import { Card } from "@/components/ui/Card";

type ExecutiveBriefPanelProps = {
  snapshot: DashboardSnapshot;
};

/** Morning brief, priorities, and critical changes from orchestrator snapshot. */
export function ExecutiveBriefPanel({ snapshot }: ExecutiveBriefPanelProps) {
  const priorities = buildPrioritiesFromTasks(snapshot.tasks);
  const criticalChanges = buildCriticalChanges(snapshot);

  return (
    <Card title="Executive Brief" variant="premium">
      <div className="space-y-6">
        <section aria-label="Morning Brief">
          <h4 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
            Morning Brief
          </h4>
          <p className="text-sm font-medium text-orion-text">{snapshot.brief.headline}</p>
          <p className={`mt-2 ${WORKSPACE_SUMMARY_CLASS}`}>{snapshot.brief.body}</p>
        </section>

        <section aria-label="Today's Priorities">
          <h4 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
            Today&apos;s Priorities
          </h4>
          {priorities.length > 0 ? (
            <ul className={WORKSPACE_LIST_CLASS}>
              {priorities.map((priority) => (
                <li key={priority} className={WORKSPACE_LIST_ITEM_CLASS}>
                  <span aria-hidden className="text-orion-gold/70">
                    •
                  </span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-light text-orion-muted">No open priorities in snapshot.</p>
          )}
        </section>

        <section aria-label="Critical Changes">
          <h4 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
            Critical Changes
          </h4>
          {criticalChanges.length > 0 ? (
            <ul className={WORKSPACE_LIST_CLASS}>
              {criticalChanges.map((change) => (
                <li key={change} className={WORKSPACE_LIST_ITEM_CLASS}>
                  <span aria-hidden className="text-red-400/80">
                    !
                  </span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-light text-orion-muted">No critical changes detected.</p>
          )}
        </section>
      </div>
    </Card>
  );
}
