import { Badge } from "@/components/common/Badge";
import type { OpportunityPriorityLabel } from "@/lib/crm/models/opportunities";

type OpportunityPriorityBadgeProps = {
  label: OpportunityPriorityLabel;
};

/** Opportunity priority badge using shared Badge component. */
export function OpportunityPriorityBadge({ label }: OpportunityPriorityBadgeProps) {
  return <Badge className="normal-case tracking-normal">{label} Priority</Badge>;
}
