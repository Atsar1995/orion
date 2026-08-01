import { Badge } from "@/components/common/Badge";
import type { CrmActivityStatus } from "@/lib/crm/models/activities";

type ActivityStatusBadgeProps = {
  status: CrmActivityStatus;
};

/** Activity status badge using shared Badge component. */
export function ActivityStatusBadge({ status }: ActivityStatusBadgeProps) {
  return <Badge className="normal-case tracking-normal">{status}</Badge>;
}
