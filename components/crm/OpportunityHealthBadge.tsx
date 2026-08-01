import { Badge } from "@/components/common/Badge";
import type { OpportunityHealthLabel } from "@/lib/crm/models/opportunities";

type OpportunityHealthBadgeProps = {
  label: OpportunityHealthLabel;
};

/** Opportunity health status badge using shared Badge component. */
export function OpportunityHealthBadge({ label }: OpportunityHealthBadgeProps) {
  return <Badge className="normal-case tracking-normal">{label}</Badge>;
}
