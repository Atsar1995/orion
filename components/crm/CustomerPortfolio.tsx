import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_ROW_CLASS, WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import type { PortfolioCategory } from "@/lib/crm-relationships-opportunities";
import {
  CUSTOMER_PORTFOLIO,
  PORTFOLIO_EXECUTIVE_SUMMARY,
} from "@/lib/crm-relationships-opportunities";

type CustomerPortfolioProps = {
  categories?: PortfolioCategory[];
  executiveSummary?: string;
  title?: string;
};

/** Customer portfolio by strategic category — presentation only. */
export function CustomerPortfolio({
  categories = CUSTOMER_PORTFOLIO,
  executiveSummary = PORTFOLIO_EXECUTIVE_SUMMARY,
  title = "Customer Portfolio",
}: CustomerPortfolioProps) {
  return (
    <Card title={title} variant="premium">
      <div className="space-y-5">
        <p className={WORKSPACE_SUMMARY_CLASS}>{executiveSummary}</p>
        <ul className="space-y-3" aria-label={title}>
          {categories.map((category) => (
            <li
              key={category.label}
              className={`${WORKSPACE_FIELD_ROW_CLASS} rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3`}
            >
              <div className="flex items-center gap-3">
                <StatusIndicator status={category.status} />
                <div>
                  <p className="text-sm font-medium text-white/80">{category.label}</p>
                  <p className="text-xs font-light text-white/40">
                    {category.healthDistribution}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium tabular-nums text-white/85">
                  {category.customerCount}
                </p>
                <p className="text-xs font-light text-white/40">
                  {category.revenueContribution} revenue
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
