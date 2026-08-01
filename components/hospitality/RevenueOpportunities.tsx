import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { REVENUE_OPPORTUNITIES } from "@/lib/hospitality-data";

type RevenueOpportunitiesProps = {
  opportunities?: readonly string[];
};

/** Revenue growth and pricing opportunities for hotel owners. */
export function RevenueOpportunities({ opportunities = REVENUE_OPPORTUNITIES }: RevenueOpportunitiesProps) {
  return (
    <Card title="Revenue Opportunities">
      <ul className={WORKSPACE_LIST_CLASS}>
        {opportunities.map((item) => (
          <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
            <span aria-hidden className="text-orion-gold">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
