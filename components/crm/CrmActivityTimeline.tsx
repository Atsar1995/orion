import { ActivityStatusBadge } from "@/components/crm/ActivityStatusBadge";
import { ActivityTypeBadge } from "@/components/crm/ActivityTypeBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { CrmActivityTimelineItem } from "@/lib/crm/models/activities";

type CrmActivityTimelineProps = {
  activities: CrmActivityTimelineItem[];
  title?: string;
};

/** Chronological CRM activity timeline — follows RelationshipTimeline layout pattern. */
export function CrmActivityTimeline({
  activities,
  title = "Activity Timeline",
}: CrmActivityTimelineProps) {
  return (
    <Card title={title}>
      {activities.length === 0 ? (
        <EmptyState description="No activities match the current search or filters." />
      ) : (
        <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label={title}>
          {activities.map((activity) => (
            <li key={activity.id} className={WORKSPACE_FIELD_ROW_CLASS}>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ActivityTypeBadge type={activity.type} />
                  <ActivityStatusBadge status={activity.status} />
                  <p className="text-sm font-medium text-white/80">{activity.customer}</p>
                </div>
                <p className="text-sm font-light text-white/55">{activity.description}</p>
                <p className="text-xs font-light text-white/40">Owner: {activity.owner}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-white/50">{activity.date}</p>
                <p className="text-xs font-light text-white/35">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
