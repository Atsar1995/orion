import { ActivityPriorityBadge } from "@/components/crm/ActivityPriorityBadge";
import { ActivityStatusBadge } from "@/components/crm/ActivityStatusBadge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { CrmActivityTaskItem } from "@/lib/crm/models/activities";

type CrmActivityTasksProps = {
  tasks: CrmActivityTaskItem[];
};

/** CRM placeholder tasks section. */
export function CrmActivityTasks({ tasks }: CrmActivityTasksProps) {
  return (
    <Card title="Tasks">
      {tasks.length === 0 ? (
        <EmptyState description="No tasks match the current filters." />
      ) : (
        <ul className={WORKSPACE_FIELD_LIST_CLASS}>
          {tasks.map((task) => (
            <li key={task.id} className={WORKSPACE_FIELD_ROW_CLASS}>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-white/85">{task.description}</p>
                <p className="text-xs font-light text-white/45">
                  {task.customer} · {task.owner} · {task.date}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ActivityStatusBadge status={task.status} />
                  <ActivityPriorityBadge priority={task.priority} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
