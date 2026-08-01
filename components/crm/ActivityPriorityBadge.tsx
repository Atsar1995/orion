import { Badge } from "@/components/common/Badge";
import type { CrmActivityPriority } from "@/lib/crm/models/activities";

type ActivityPriorityBadgeProps = {
  priority: CrmActivityPriority;
};

/** Activity priority badge using shared Badge component. */
export function ActivityPriorityBadge({ priority }: ActivityPriorityBadgeProps) {
  return <Badge className="normal-case tracking-normal">{priority}</Badge>;
}
