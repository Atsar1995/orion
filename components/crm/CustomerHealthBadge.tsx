import { Badge } from "@/components/common/Badge";
import type { CustomerHealthLabel } from "@/lib/crm/models/customers";

type CustomerHealthBadgeProps = {
  label: CustomerHealthLabel;
};

/** Customer health status badge using shared Badge component. */
export function CustomerHealthBadge({ label }: CustomerHealthBadgeProps) {
  return <Badge className="normal-case tracking-normal">{label}</Badge>;
}
