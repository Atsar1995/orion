import { Card } from "@/components/ui/Card";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { BUSINESS_OPPORTUNITIES } from "@/lib/advisor-data";

/** Business opportunities with total revenue potential. */
export function OpportunitiesCard() {
  return (
    <Card title="Business Opportunities">
      <div className="space-y-4">
        <div className="rounded-orion-md border border-orion-gold/15 bg-orion-gold/[0.06] px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Expected Revenue Opportunity
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-orion-gold">
            {BUSINESS_OPPORTUNITIES.totalRevenueOpportunity}
          </p>
        </div>
        <ul className={WORKSPACE_LIST_CLASS}>
          {BUSINESS_OPPORTUNITIES.items.map((item) => (
            <li key={item.title} className={WORKSPACE_LIST_ITEM_CLASS}>
              <span aria-hidden className="text-orion-gold">
                ✓
              </span>
              <span>
                <span className="font-medium text-white/80">{item.title}</span>
                {" — "}
                {item.description}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
