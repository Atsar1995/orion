import { Badge } from "@/components/common/Badge";
import type { CrmActivityType } from "@/lib/crm/models/activities";

type ActivityTypeBadgeProps = {
  type: CrmActivityType;
};

/** Activity type badge using shared Badge component. */
export function ActivityTypeBadge({ type }: ActivityTypeBadgeProps) {
  return <Badge className="normal-case tracking-normal">{type}</Badge>;
}
