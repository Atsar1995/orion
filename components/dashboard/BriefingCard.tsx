import { Badge } from "@/components/common/Badge";
import { SparkIcon } from "@/components/common/icons";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

export function BriefingCard() {
  return (
    <DashboardCard
      title="Today's Briefing"
      action={
        <Badge>
          <SparkIcon className="h-3 w-3" />
          AI
        </Badge>
      }
    >
      <p className="text-sm leading-relaxed font-light text-white/50">
        AI summary coming soon.
      </p>
    </DashboardCard>
  );
}
