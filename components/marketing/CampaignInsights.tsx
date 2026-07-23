import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { CAMPAIGN_INSIGHTS } from "@/lib/marketing-data";

/** Active campaign performance and insights. */
export function CampaignInsights() {
  return (
    <Card title="Campaign Insights">
      <ul className="space-y-3">
        {CAMPAIGN_INSIGHTS.map((campaign) => (
          <li
            key={campaign.name}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/85">{campaign.name}</p>
                <p className="mt-0.5 text-xs font-light text-white/45">
                  Spend {campaign.spend} · ROI {campaign.roi}
                </p>
              </div>
              <StatusIndicator status={campaign.status} />
            </div>
            <p className="mt-2 text-xs font-light leading-relaxed text-white/55">
              {campaign.insight}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
